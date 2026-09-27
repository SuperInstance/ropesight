// bells/rota.mjs — the rota runner: lanes execute a method by LOCAL rule only.
//
// THE ALLEGORY AS SPEC (seed-story.md, "The Ropesight"):
//   L45: "you have rung the extent" / L69: "We ring the method. The method
//         guarantees the changes. We trust the rule."
//         -> every lane holds its OWN frozen copy of the public method (the
//            token list) — static knowledge, not state — plus its own position
//            and its own stroke counter. It never reads the row (the global
//            array of who-is-where) or any other lane.
//   L29: "The rope is not the bell. The rope is where the bell agrees to be
//         touched."  -> a lane's world-line is its own rope: position now,
//            position next. Nothing else exists in its scope.
//   L37: "You did not make it ring. You were there when it rang."
//         -> the tower records ARRIVALS (claims). It does not instruct.
//   L61: "The band is eight people in a small room, holding ropes, listening.
//         The band is one thing with eight hands. If one hand is late, the
//         thing is late." -> one shared pulse: every lane's counter advances
//            once per stroke (synchrony is the one physical channel they share,
//            like the sound of the bells themselves).
//   L21: "If the angle shifts by a degree, the stay cracks."
//         -> own-rope anomaly: the ONLY own-position check a lane can make is
//            legality (|move| <= 1, the L49 rule). It fires on far moves only;
//            a near deviation is rope-silent to its owner. Receipted in e_rs1.
//   L57: "The conductor calls a bob. A bob is a small change in the rule."
//         -> calls are baked into the lane's PUBLIC token copy before ringing
//            (the band agrees the touch in advance); during ringing the
//            conductor injects nothing per-stroke.
//
// WHAT IS GENUINELY LOCAL vs GLOBAL (receipted in e_rs1 R3a):
//   LOCAL  (each lane): bell id; own token copy (public method + public calls);
//          own position; own stroke counter; hunt direction flag (lost mode);
//          own clash-bit history (1 bit/stroke: "my claimed slot was contested").
//   GLOBAL (tower / conductor only): claim collision resolution (physics);
//          the rung row; the method-row audit (conductor's sheet); the
//          rounds/period check at course end.
//
// NO NETWORK. NO FLOATS. Node 24, ESM.

import { applyTokenToPos, rowString, traceDigest } from './methods.mjs';

// ── the lane (a fleet worker / a ringer) ─────────────────────────────────────

/** Deviation specs (the E24-toxic analogs). One lane, chosen stroke:
 *   { bell, atStroke, kind: 'near-up'|'near-down'|'stay'|'far-up'|'far-down' }
 *        — at that ONE stroke the lane applies a wrong transposition to ITSELF.
 *          rule 'method-pos': it then keeps ringing the method FROM WHERE IT
 *            ACTUALLY IS (it cannot know its true place was lost) — the stumble
 *          persists unless luck re-seats it.
 *          rule 'line': it snaps back to its own blue line next stroke (a
 *          ringer re-finding their place by their own count).
 *   { bell, atStroke, kind: 'lost-hunt', dir?: +1|-1 }
 *        — hunts ±1 legally from wherever it actually is, forever. The rope
 *          feels fine, the place is wrong ("a moving weight with an
 *          opinion", L21).
 *   { bells: [a, b], atStroke, kind: 'conspiracy' }
 *        — two lanes silently trade their planned claims for one stroke
 *          (The Tunnel: seed L123 "Neither end knew about the other."). */
export class Lane {
  constructor({ bell, tokens, rule = 'method-pos', line = null, n }) {
    this.bell = bell;         // identity (which rope is mine)
    this.tokens = tokens;     // MY OWN frozen copy of the public token stream
    this.rule = rule;         // 'method-pos' (primary) | 'line' (variant)
    this.line = line;         // Int8Array of MY positions per row (rule 'line')
    this.n = n;               // stage (my own boundaries)
    this.t = 0;               // my stroke counter (my own clock)
    this.pos = rule === 'line' ? line[0] : bell; // rounds: bell i at position i
    this.dir = 1;             // hunt direction flag (lost-hunt mode)
    this.clashStrokes = [];   // LOCAL channel: strokes where my slot was contested
    this.ownRopeAnomalies = []; // LOCAL channel: strokes where MY move was illegal
    this.deviation = null;    // set by runRota if this lane deviates
    this.deviatedAt = [];     // strokes where MY claim left my own rule's answer
    // STRUCTURAL BLINDING: a Lane holds no reference to the row, the tower, or
    // any other lane. (e_rs1 asserts this over own-property keys.)
  }

  /** pure local rule: where do I pull next?
   *  Scope contains ONLY: my counter, my token copy, my position, my line
   *  slice (rule 'line'), my deviation. No other inputs exist. */
  planStroke() {
    const t = this.t;
    let own; // what MY rule says is my next position
    if (this.rule === 'line') own = this.line[t + 1];
    else own = applyTokenToPos(this.tokens[t], this.pos); // the public change, applied to ME
    let intended = own;
    const dv = this.deviation;
    const deviating = dv && dv.kind !== 'conspiracy' &&
      (dv.kind === 'lost-hunt' ? t >= dv.atStroke : t === dv.atStroke);
    if (deviating) {
      if (dv.kind === 'lost-hunt') {
        if (this.pos + this.dir > this.n - 1 || this.pos + this.dir < 0) this.dir = -this.dir;
        intended = this.pos + this.dir; // keep hunting, legally, from where I am
      } else if (dv.kind === 'stay') {
        intended = this.pos;            // don't move at all
      } else {
        const d = dv.kind.endsWith('up') ? 1 : -1;
        const mag = dv.kind.startsWith('far') ? 2 : 1;
        intended = own + d * mag;
      }
      if (intended === own || intended < 0 || intended > this.n - 1) {
        // the wrong transposition is vacuous (it IS my right one, or it falls
        // off the tower): count honestly and ring my rule's answer.
        dv.vacuous = (dv.vacuous || 0) + 1;
        intended = own;
      }
    }
    if (intended !== own) this.deviatedAt.push(t);
    return intended;
  }

  /** the bell physically swings to p (my claim, or an overridden claim).
   *  This is where own-rope lives: I feel the DISTANCE of my own move — the
   *  only check my own position can make (L49: |move| <= 1). */
  acceptClaim(p) {
    if (p < 0 || p > this.n - 1) throw new Error(`claim ${p} out of range for stage ${this.n}`);
    if (Math.abs(p - this.pos) > 1) this.ownRopeAnomalies.push(this.t); // L21: the stay cracks
    if (p !== this.pos) this.dir = p > this.pos ? 1 : -1;
    this.pos = p;
    this.t++;
  }

  // (the 1-bit acoustic channel is written by the tower into clashStrokes:
  //  the lane learns ONLY "my slot was contested", never who or where.)
}

// ── the tower (the physical layer / the world) ───────────────────────────────

export class Tower {
  constructor({ n, methodRows }) {
    this.n = n;
    this.methodRows = methodRows; // conductor's sheet (global sight reference)
    this.strokes = [];            // per-stroke record
  }

  /** one stroke: every lane plans by its own local rule; optional silent pair
   *  trade (conspiracy); claims are resolved by PHYSICS (two claims on one slot
   *  = a clash, an unclaimed slot = a gap); the rung row is what happened; each
   *  lane is told back exactly one bit: whether its slot was contested. */
  stroke(lanes, tradePair = null) {
    const s = lanes[0].t;
    const plans = lanes.map((l) => l.planStroke()); // LOCAL, simultaneous
    const claims = plans.slice();
    if (tradePair) {
      const [a, b] = tradePair;
      claims[a] = plans[b]; claims[b] = plans[a]; // the silent trade
    }
    // physics: group claimants by slot
    const at = Array.from({ length: this.n }, () => []);
    claims.forEach((p, bell) => at[p].push(bell));
    const clashed = [];
    const gaps = [];
    for (let p = 0; p < this.n; p++) {
      if (at[p].length >= 2) clashed.push(...at[p]); // two ropes in one slot
      if (at[p].length === 0) gaps.push(p);          // a slot nobody claimed
    }
    // the row "as rung": position -> bell (what physically sounded)
    const row = Array(this.n).fill(-1);
    claims.forEach((bell2, bell) => { row[claims[bell]] = bell; });
    const methodRow = this.methodRows[s + 1];
    // conductor's GLOBAL audit: which bells are not where the method puts them
    let wrongBells = 0;
    claims.forEach((p, bell) => { if (p !== methodRow.indexOf(bell)) wrongBells++; });
    const broken = clashed.length > 0 || gaps.length > 0;
    for (const l of lanes) {
      l.acceptClaim(claims[l.bell]);
      if (clashed.includes(l.bell)) l.clashStrokes.push(s); // the 1-bit channel
    }
    this.strokes.push({
      s, claims, row, methodRow, clashed, gaps, broken, wrongBells,
      offMethod: !broken && !row.every((b, i) => b === methodRow[i]),
    });
  }
}

// ── the run ──────────────────────────────────────────────────────────────────

/** Run a full course with blinded lanes.
 *  tokens: the EFFECTIVE token stream (public method + baked conductor calls);
 *  methodRows: the global-sight reference rows (conductor's sheet), length
 *  tokens.length + 1; rule: 'method-pos' (primary) or 'line' (needs `lines`:
 *  one Int8Array per bell over the same rows); deviations: see Lane.
 *  Returns aggregate verdict fields + the full per-stroke record. */
export function runRota({ n, tokens, methodRows, lines = null, rule = 'method-pos', deviations = [] }) {
  const lanes = tokens && rule === 'line'
    ? lines.map((line, bell) => new Lane({ bell, tokens, rule, line, n }))
    : Array.from({ length: n }, (_, bell) => new Lane({ bell, tokens, rule, n }));
  for (const d of deviations) {
    if (d.kind === 'conspiracy') {
      for (const b of d.bells) lanes[b].deviation = { ...d, bell: b };
    } else {
      lanes[d.bell].deviation = { ...d };
    }
  }
  const tower = new Tower({ n, methodRows });
  for (let s = 0; s < tokens.length; s++) {
    const consp = deviations.find((d) => d.kind === 'conspiracy' && d.atStroke === s);
    tower.stroke(lanes, consp ? consp.bells : null);
  }
  const finalRow = lanes.map((l) => l.pos); // bell -> position
  const closed = finalRow.every((b, i) => b === i); // rounds (L45: the extent ends where it began)
  const traceRows = tower.strokes.map((st) => rowString(st.row));
  const methodTrace = tower.strokes.map((st) => rowString(st.methodRow));
  const locals = Object.fromEntries(lanes.map((l) => [l.bell, {
    clashStrokes: l.clashStrokes, ownRopeAnomalies: l.ownRopeAnomalies,
    deviatedAt: l.deviatedAt,
  }]));
  return {
    strokes: tower.strokes,
    finalRow, closed,
    traceHash: traceDigest(traceRows),
    methodTraceHash: traceDigest(methodTrace),
    byteIdentical: traceRows.every((r, i) => r === methodTrace[i]),
    firstDivergence: tower.strokes.findIndex((st) => st.broken || st.offMethod),
    brokenStrokes: tower.strokes.filter((st) => st.broken).map((st) => st.s),
    offMethodStrokes: tower.strokes.filter((st) => st.offMethod).map((st) => st.s),
    wrongBellTotal: tower.strokes.reduce((a, st) => a + st.wrongBells, 0),
    locals,
    lanes, // structural-blinding assertion target (no row/tower refs on lanes)
  };
}
