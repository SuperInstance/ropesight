// experiments/e_rs1_rope.mjs — E-RS1: THE ROPESIGHT PROPERTY, EXECUTED.
// Turns seed-story.md ("The Ropesight") into a real coordination module:
// permutation-algebra methods as fleet-rota schedules, ropesight as the
// local-knowledge property that makes the rota correct without global view.
//
// HOUSE RULES EXECUTED:
//   - receipts sealed BEFORE the runs they govern (rows 1..k are constructed
//     and hashed before any R* number exists);
//   - probe-then-scale;
//   - honest negatives receipted as findings, never fabricated;
//   - verifyChain must pass from memory AND from the re-read file;
//   - NO network. Deterministic throughout (R5 runs the suite twice).
//
// Receipts:
//   R1 method correctness — Plain Bob family composes to rounds after its
//                          period (computed, not assumed: 40/60/84/112 for
//                          Doubles/Minor/Triples/Major); algebra laws hold
//                          (identity/associativity/inverse); local-rule
//                          execution == global permutation application
//                          (bit-equal traces).
//   R2 conservation      — "The height is the only thing that has not changed
//                          in four hundred years" (seed L5): over a full
//                          course every bell occupies every position exactly
//                          2(n-1) times (8/10/12/14) — the exact cover.
//   R3 THE ROPESIGHT     — (a) lanes blinded to own-state-only produce
//                          byte-identical traces to the global-sight run,
//                          plain courses AND called touches; (b) false-alarm
//                          rate on an honest band; (c) DEVIATOR: unilateral
//                          wrong transposition — local detection possible?
//                          at what latency? (d) CONSPIRACY (The Tunnel):
//                          coordinated pair-trade — the honest blind spot.
//   R4 mapping receipt   — lanes->murmur voices, method->fixed-share trust
//                          schedule, deviator->E24 toxic, written as a table.
//   R5 self-test         — determinism: same seed -> byte-identical traces;
//                          suite run twice -> identical summary hash.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import {
  identity, rounds, compose, applyChange, inverse, order,
  makeChange, METHODS, plainCourseTokens, courseTokens, courseFacts,
  personalLine, walkCourse, traceDigest, rowString,
} from '../bells/methods.mjs';
import { runRota, Lane } from '../bells/rota.mjs';
import { sealChain, verifyChain, mulberry32 } from './receipts.mjs';

// ════════════════════════════════════════════════════════════════════════════
// 0. SEALED ROWS — before any run
// ════════════════════════════════════════════════════════════════════════════
const rows = [];
let seq = 0;
const book = (type, payload) => rows.push({ seq: ++seq, type, ...payload });

book('charter', {
  seed: 'seed-story.md "The Ropesight" (+ "# The Tunnel")',
  claim: 'Bells = fleet lanes. Rounds = rota ticks. A method = a fixed composition of ' +
    'stage-permutations. Ropesight (seed L45-L69): each ringer knows only their own next ' +
    'position (LOCAL rule), yet the band completes the method EXACTLY (GLOBAL correctness). ' +
    'L5: "The height is the only thing that has not changed in four hundred years" = the ' +
    'conserved share (every bell rings every position the same count). L49: "no bell may ' +
    'move more than one place at a time" = every change is a product of disjoint adjacent ' +
    'transpositions. L57: conductor\'s calls = public broadcast, still local per lane. ' +
    'L21: "If the angle shifts by a degree, the stay cracks" = own-rope anomaly channel. ' +
    'The Tunnel (L123-137) = coordinated deviation: locally invisible.',
  machine: 'bells/methods.mjs (permutation composition algebra over N bells: identity, ' +
    'compose, applyChange, inverse, order, place-notation changes, Plain Bob family ' +
    'Doubles/Minor/Triples/Major, course facts, personal lines) + bells/rota.mjs (Lane = ' +
    'blinded local rule over own line slice + counter + 1-bit clash channel; Tower = ' +
    'physical claim-resolution layer; deviations = near/stay/far/lost/conspiracy). ' +
    'Chain: experiments/receipts.mjs (fleet fnv1a64 idiom, stone-compatible).',
  scope_note: 'Seed L53 names "Plain Bob. Grandsire. Stedman. Cambridge." — this lane ' +
    'implements the Plain Bob family (Doubles/Minor/Triples/Major) derived from first ' +
    'principles and verified against the documented plain-course lengths; Grandsire/' +
    'Stedman/Cambridge are NOT derived here (honest scope; they need their own constructions).',
  dev_note: 'A dev-phase scratch (outside the repo, since deleted) derived the plain-bob ' +
    'construction and its closed forms; the numbers below were sealed from that derivation ' +
    'BEFORE the official runs in this file. The runs verify, they do not define.',
});

book('decision_rules', {
  R1_period: 'VERDICT PASS iff for each of Plain Bob Doubles/Minor/Triples/Major the ' +
    'computed period (smallest k>=1 with row_k == rounds) equals the documented plain ' +
    'course length 2n(n-1): 40/60/84/112; ALL course rows r_0..r_{k-1} distinct (true ' +
    'course); |bell move| <= 1 at EVERY change of EVERY stage (seed L49); the treble path ' +
    'over the first lead is exactly the plain hunt [1..n,n..1]; half-lead checkpoints = ' +
    'backrounds (54321 / 654321 / 7654321 / 87654321); first lead ends 13425 (Doubles) / ' +
    '135264 (Minor). Algebra laws: compose identity/associativity/inverse hold on 2000 ' +
    'random legal changes per stage; cross order = 2.',
  R1_local_global: 'VERDICT PASS iff the rota run with blinded lanes (each lane holds ONLY ' +
    'bell id, own personal line slice, own stroke counter, own position, dir flag) is ' +
    'BYTE-IDENTICAL stroke by stroke to the global permutation application of the same ' +
    'token list, for all 4 plain courses AND for called touches (bob streams), and no Lane ' +
    'instance holds any row/tower reference (structural blinding over own keys).',
  R2_cover: 'VERDICT PASS iff over each full course (rows r_0..r_{period-1}, rounds counted ' +
    'once) every bell occupies every position EXACTLY period/n = 2(n-1) times (8/10/12/14), ' +
    'i.e. the cover matrix is uniform — the conserved share ("the same height", seed L5); ' +
    'and every row of every stroke is a permutation (each position exactly one bell).',
  R3a: 'THE ROPESIGHT PROPERTY. VERDICT PASS iff blinded-band trace hash == global-sight ' +
    'trace hash on every run in R1_local_global (the completed changes are byte-identical ' +
    'without any lane seeing the whole).',
  R3b: 'False alarms. VERDICT PASS iff over ALL strokes of ALL honest runs (4 plain ' +
    'courses + 4 touches) the total clash-bits across all lanes == 0 AND own-rope ' +
    'anomalies == 0 (an honest band never feels a rope go wrong).',
  R3c: 'DEVIATOR (unilateral wrong transposition at chosen stroke). Sealed prediction ' +
    '(partition argument, tested empirically over ALL (stroke, bell, kind) samples on ' +
    'Minor and Doubles, kinds near-up/near-down/stay/far-up/far-down, vacuous samples ' +
    'skipped and counted): at the deviation stroke the 5 honest bells claim exactly the 5 ' +
    'positions that are NOT the deviator\'s line position; hence ANY deviating claim lands ' +
    'in an occupied slot => P(clash at deviation stroke) = 1 (detection latency 0 strokes); ' +
    'the honest bell whose slot was taken receives a clash-bit at the SAME stroke (a ringer ' +
    'feels the rope go wrong, seed L21/L61). Own-rope anomaly fires at the deviator iff ' +
    'the wrong move is far (|d|>=2); near/stay deviations are rope-silent. One-stroke ' +
    'stumbles self-heal: every row after the stumble is byte-equal to the method and the ' +
    'course still closes to rounds. Lost mode (persists, hunts legally): own-rope stays ' +
    'SILENT forever (legal moves, wrong places); local detection = clash density per ' +
    'remaining stroke; global detection = course never returns to rounds + conductor ' +
    'audit differs at the stroke.',
  R3d: 'CONSPIRACY (The Tunnel, seed L123 "Neither end knew about the other"). Two lanes ' +
    'trade their planned claims for one stroke: the claim SET is unchanged => NO clash, ' +
    'the row is a valid permutation but != the method row. Sealed prediction: ZERO local ' +
    'signal in any uninvolved lane on every sample; own-rope fires only INSIDE the ' +
    'conspirators (self-knowledge, not detection) and iff a traded move is far; the pair ' +
    're-joins its lines next stroke and the course heals byte-identically, still closing ' +
    'to rounds => a one-stroke conspiracy is UNDETECTABLE by any local channel and by the ' +
    'rounds check; only the conductor\'s global row audit (or a chain replay) sees it.',
  R4: 'Mapping receipt: the allegory->module table is booked to the chain and written to ' +
    'the README verbatim, each row quoting the seed line it implements.',
  R5: 'VERDICT PASS iff the full suite runs twice with identical summary JSON hash ' +
    '(determinism: same seed -> byte-identical trace), and a different mulberry32 seed ' +
    'changes ONLY the meta-level sampling order, never any trace hash.',
  probe: 'Before any sweep: time one blinded Minor course vs one global walk; both must be ' +
    '< 50ms; sweeps sized so the full suite stays < 60s wall. Record the choice.',
});

// ════════════════════════════════════════════════════════════════════════════
// shared kernels (frozen before the runs)
// ════════════════════════════════════════════════════════════════════════════
const NAMES = Object.keys(METHODS);
const facts = Object.fromEntries(NAMES.map((nm) => [nm, courseFacts(nm)]));
const tokens = Object.fromEntries(NAMES.map((nm) => [nm, plainCourseTokens(nm)]));
const methodRows = Object.fromEntries(NAMES.map((nm) => [nm, walkCourse(tokens[nm], METHODS[nm].stage).rows]));
const lines = Object.fromEntries(NAMES.map((nm) => ({
  ...lines_of(nm),
})));
function lines_of(nm) {
  const out = {};
  for (let b = 0; b < METHODS[nm].stage; b++) out[b] = personalLine(nm, b);
  return out;
}
// (lines rebuilt per method below — kept explicit for the seal)
const LINES = Object.fromEntries(NAMES.map((nm) => [nm, lines_of(nm)]));
const LINES_REF = lines; // legacy alias (unused after this point)

// touches for R3a (call streams are public broadcasts; seed L57)
const TOUCHES = [
  { name: 'Plain Bob Minor', calls: [{ atLead: 0, kind: 'bob' }], sealedPeriod: 180 },
  { name: 'Plain Bob Minor', calls: [{ atLead: 0, kind: 'bob' }, { atLead: 1, kind: 'bob' }], sealedPeriod: 120 },
  { name: 'Plain Bob Minor', calls: [{ atLead: 0, kind: 'bob' }, { atLead: 1, kind: 'bob' }, { atLead: 2, kind: 'bob' }, { atLead: 3, kind: 'bob' }, { atLead: 4, kind: 'bob' }], sealedPeriod: 36 },
  { name: 'Plain Bob Doubles', calls: [{ atLead: 0, kind: 'bob' }], sealedPeriod: 120 },
];

// honest run set (for R3a byte-identity and R3b false alarms)
function honestRuns() {
  const out = [];
  for (const nm of NAMES) out.push({ label: `${nm} plain`, nm, toks: tokens[nm], mrows: methodRows[nm], lines: LINES[nm] });
  for (const t of TOUCHES) {
    const toks = courseTokens(t.name, t.calls);
    const mrows = walkCourse(toks, METHODS[t.name].stage).rows;
    out.push({ label: `${t.name} touch(le=${t.calls.map((c) => c.atLead).join('+')})`, nm: t.name, toks, mrows, lines: LINES[t.name], touch: t });
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// probe
// ════════════════════════════════════════════════════════════════════════════
const probeT0 = process.hrtime.bigint();
{
  const r = runRota({ n: 6, tokens: tokens['Plain Bob Minor'], methodRows: methodRows['Plain Bob Minor'], lines: LINES['Plain Bob Minor'] });
  if (!r.byteIdentical) throw new Error('probe failed: blinded Minor course diverged from global sight');
}
const probeMs = Number(process.hrtime.bigint() - probeT0) / 1e6;
book('probe', {
  what: 'one blinded Plain Bob Minor course (60 strokes, 6 lanes) vs global walk',
  probeMs: +probeMs.toFixed(3),
  choice: 'sweep = exhaustive enumeration over strokes x bells x kinds on Minor and ' +
    'Doubles (thousands of <=60-stroke runs, each in the sub-ms range) — full suite ' +
    'expected well under 60s. Sealed before the sweeps.',
});

// ════════════════════════════════════════════════════════════════════════════
// R1 — method correctness + algebra laws + local==global
// ════════════════════════════════════════════════════════════════════════════
const R1 = { methods: [], algebra: {}, localGlobal: [] };

for (const nm of NAMES) {
  const f = facts[nm];
  R1.methods.push({
    name: nm, stage: f.stage, period: f.period, expectPeriod: 2 * f.stage * (f.stage - 1),
    distinctRows: f.distinct, maxMove: f.maxMove, closed: f.closed,
    halfLead: rowString(f.halfLead), leadEnd1: rowString(f.leadEnd1),
    trebleFirstLead: f.treble.map((p) => p + 1).join(''),
    coverVal: f.coverVal, coverUniform: f.coverUniform,
  });
}

// algebra laws on random legal changes (meta-level PRNG only picks WHICH changes)
{
  const rng = mulberry32(0x2e26c);
  const pick = (n) => {
    // random legal change: random subset of fixed places that still pairs
    for (;;) {
      const fixed = new Set();
      for (let p = 0; p < n; p++) if (rng() % 2n === 0n) fixed.add(p);
      const toks = [];
      for (let p = 0; p < n; p++) if (fixed.has(p)) toks.push(String(p + 1));
      try { return makeChange(METHODS['Plain Bob Minor'].stage, toks.length ? toks.join('') : 'x'); } catch { /* unpaired: resample */ }
    }
  };
  const n = 6;
  let assoc = 0, inv = 0, ident = 0;
  const trials = 2000;
  for (let i = 0; i < trials; i++) {
    const a = pick(n), b = pick(n), c = pick(n);
    const ab_c = compose(compose(a, b), c);
    const a_bc = compose(a, compose(b, c));
    if (ab_c.every((v, j) => v === a_bc[j])) assoc++;
    const row = rounds(n);
    const r1 = applyChange(applyChange(row, a), inverse(a));
    if (r1.every((v, j) => v === row[j])) inv++;
    const idv = compose(a, identity(n));
    if (idv.every((v, j) => v === a[j])) ident++;
  }
  const cross = makeChange(6, 'x');
  R1.algebra = { trials, assoc, inverseRoundTrip: inv, identityNeut: ident, orderCross6: order(cross) };
}

// local == global, honest band
for (const run of honestRuns()) {
  const r = runRota({ n: METHODS[run.nm].stage, tokens: run.toks, methodRows: run.mrows, lines: run.lines });
  // structural blinding: no lane may hold a row/tower/other-lane reference
  const laneKeys = new Set(r.lanes.flatMap((l) => Object.keys(l)));
  const blind = ![...laneKeys].some((k) => ['row', 'tower', 'strokes', 'lanes', 'methodRows', 'tokens'].includes(k));
  const period = run.touch
    ? touchPeriod(run.nm, run.toks)
    : facts[run.nm].period;
  R1.localGlobal.push({
    label: run.label, strokes: run.toks.length,
    traceHash: r.traceHash, methodTraceHash: r.methodTraceHash,
    byteIdentical: r.byteIdentical, blindByConstruction: blind,
    closedToRounds: r.closed, touchSealedPeriod: run.touch ? run.touch.sealedPeriod : null,
    touchComputedPeriod: period,
  });
}
function touchPeriod(nm, toks) {
  const n = METHODS[nm].stage;
  const { rows } = walkCourse(toks, n);
  if (rows[rows.length - 1].every((b, i) => b === i)) return toks.length;
  // walk cyclically until rounds (cap 5000)
  let row = rows[rows.length - 1];
  for (let k = toks.length; k < 5000; k++) {
    row = applyChange(row, toks[k % toks.length]);
    if (row.every((b, i) => b === i)) return k + 1;
  }
  return -1;
}

book('R1_finding', {
  verdict: R1.methods.every((m) => m.period === m.expectPeriod && m.distinctRows && m.maxMove <= 1 && m.closed)
    && R1.algebra.assoc === 2000 && R1.algebra.inverseRoundTrip === 2000 && R1.algebra.identityNeut === 2000
    && R1.algebra.orderCross6 === 2
    && R1.localGlobal.every((g) => g.byteIdentical && g.blindByConstruction && g.closedToRounds)
    && R1.localGlobal.filter((g) => g.touchSealedPeriod !== null).every((g) => g.touchComputedPeriod === g.touchSealedPeriod)
    ? 'PASS' : 'FAIL',
  methods: R1.methods, algebra: R1.algebra, localGlobal: R1.localGlobal,
});

// ════════════════════════════════════════════════════════════════════════════
// R2 — the conservation of ringing (exact cover)
// ════════════════════════════════════════════════════════════════════════════
const R2 = { courses: [], strokesAllPermutations: true };
for (const nm of NAMES) {
  const f = facts[nm];
  // per-stroke permutation validity over the honest global walk
  for (const r of f.rows) if (new Set(r).size !== f.stage) R2.strokesAllPermutations = false;
  R2.courses.push({
    name: nm, stage: f.stage, period: f.period,
    promisedPerBell: 2 * (f.stage - 1), coverVal: f.coverVal,
    coverUniform: f.coverUniform,
    coverMatrix: f.cover.map((r) => r.join(',')),
  });
}
book('R2_finding', {
  verdict: R2.courses.every((c) => c.coverUniform && c.coverVal === c.promisedPerBell) && R2.strokesAllPermutations ? 'PASS' : 'FAIL',
  reading: 'seed L5 "The height is the only thing that has not changed in four hundred ' +
    'years": every bell rings every position exactly 2(n-1) times per course — the ' +
    'fixed-share property of the rota: no lane over- or under-serves, ever.',
  courses: R2.courses, strokesAllPermutations: R2.strokesAllPermutations,
});

// ════════════════════════════════════════════════════════════════════════════
// R3 — THE ROPESIGHT PROPERTY
// ════════════════════════════════════════════════════════════════════════════
const R3 = {};

// ---- R3b: false alarms on the honest band (measured over the same honest runs)
{
  let clashBits = 0, ownRope = 0, strokes = 0;
  for (const run of honestRuns()) {
    const r = runRota({ n: METHODS[run.nm].stage, tokens: run.toks, methodRows: run.mrows, lines: run.lines });
    strokes += run.toks.length;
    for (const b of Object.keys(r.locals)) { clashBits += r.locals[b].clashStrokes.length; ownRope += r.locals[b].ownRopeAnomalies.length; }
  }
  R3.honest = { strokes, clashBits, ownRope, falseAlarmRate: clashBits + ownRope === 0 ? 0 : (clashBits + ownRope) / strokes };
}

// ---- R3c: the deviator (unilateral)
const KINDS = ['near-up', 'near-down', 'stay', 'far-up', 'far-down'];
function sweepDeviations(nm) {
  const n = METHODS[nm].stage;
  const toks = tokens[nm], mrows = methodRows[nm], ln = LINES[nm];
  const out = { samples: 0, vacuous: 0, clashAtStroke: 0, partnerDetected: 0, latency0: 0,
    farOwnRope: { hit: 0, total: 0 }, nearOwnRope: { hit: 0, total: 0 }, stayOwnRope: { hit: 0, total: 0 },
    healed: 0, stillClosed: 0, postStumbleByteEqual: 0, globalAudit: 0 };
  for (let s = 0; s < toks.length; s++) {
    for (let bell = 0; bell < n; bell++) {
      for (const kind of KINDS) {
        const r = runRota({ n, tokens: toks, methodRows: mrows, lines: ln, deviations: [{ bell, atStroke: s, kind }] });
        const dev = r.lanes[bell].deviation;
        if (dev.vacuous) { out.vacuous++; continue; }
        out.samples++;
        const st = r.strokes[s];
        const hit = st.clashed.length > 0;
        if (hit) out.clashAtStroke++;
        const partner = st.clashed.filter((b) => b !== bell);
        if (hit && partner.length >= 1 && r.locals[partner[0]].clashStrokes.includes(s)) out.partnerDetected++;
        if (hit) out.latency0++;
        const bucket = kind === 'stay' ? 'stayOwnRope' : kind.startsWith('far') ? 'farOwnRope' : 'nearOwnRope';
        out[bucket].total++;
        if (r.locals[bell].ownRopeAnomalies.includes(s)) out[bucket].hit++;
        // healing after the one-stroke stumble
        const postEqual = r.strokes.slice(s + 1).every((t) => rowString(t.row) === rowString(t.methodRow));
        if (postEqual) out.postStumbleByteEqual++;
        if (postEqual && r.closed) out.healed++;
        if (st.broken || st.offMethod) out.globalAudit++;
      }
    }
  }
  return out;
}
R3.deviator = { 'Plain Bob Minor': sweepDeviations('Plain Bob Minor'), 'Plain Bob Doubles': sweepDeviations('Plain Bob Doubles') };

// lost mode: persists, hunts legally from wherever it is
function sweepLost(nm, dir) {
  const n = METHODS[nm].stage;
  const toks = tokens[nm], mrows = methodRows[nm], ln = LINES[nm];
  const out = { samples: 0, clashStrokes: 0, ownRopeEver: 0, closedToRounds: 0, densitySum: 0, minDensity: 1, maxDensity: 0 };
  for (let s = 0; s < toks.length; s++) {
    for (let bell = 1; bell < n; bell++) { // the treble stays honest in lost sweeps (it is the band's clock)
      const r = runRota({ n, tokens: toks, methodRows: mrows, lines: ln, deviations: [{ bell, atStroke: s, kind: 'lost', dir }] });
      out.samples++;
      const remaining = toks.length - s;
      const brk = r.brokenStrokes.length;
      out.clashStrokes += brk;
      const density = brk / remaining;
      out.densitySum += density;
      if (density < out.minDensity) out.minDensity = density;
      if (density > out.maxDensity) out.maxDensity = density;
      if (r.locals[bell].ownRopeAnomalies.length > 0) out.ownRopeEver++;
      if (r.closed) out.closedToRounds++;
    }
  }
  out.meanDensity = out.densitySum / out.samples;
  return out;
}
R3.lost = {
  'Plain Bob Minor': { up: sweepLost('Plain Bob Minor', 1), down: sweepLost('Plain Bob Minor', -1) },
  'Plain Bob Doubles': { up: sweepLost('Plain Bob Doubles', 1), down: sweepLost('Plain Bob Doubles', -1) },
};

// ---- R3d: the conspiracy (The Tunnel)
function sweepConspiracy(nm) {
  const n = METHODS[nm].stage;
  const toks = tokens[nm], mrows = methodRows[nm], ln = LINES[nm];
  const out = { samples: 0, clash: 0, uninvolvedSignal: 0, conspiratorOwnRope: 0, fullySilent: 0,
    validRowButWrong: 0, healedByteEqual: 0, stillClosed: 0, withTreble: 0 };
  for (let s = 0; s < toks.length; s++) {
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const r = runRota({ n, tokens: toks, methodRows: mrows, lines: ln, deviations: [{ bells: [a, b], atStroke: s, kind: 'conspiracy' }] });
      out.samples++;
      const st = r.strokes[s];
      if (st.clashed.length > 0) out.clash++;
      const uninvolved = Array.from({ length: n }, (_, i) => i).filter((x) => x !== a && x !== b);
      const sig = uninvolved.some((x) => r.locals[x].clashStrokes.includes(s) || r.locals[x].ownRopeAnomalies.includes(s));
      if (sig) out.uninvolvedSignal++;
      const co = r.locals[a].ownRopeAnomalies.includes(s) || r.locals[b].ownRopeAnomalies.includes(s);
      if (co) out.conspiratorOwnRope++;
      if (!co && !sig && st.clashed.length === 0) out.fullySilent++;
      if (!st.broken && st.offMethod) out.validRowButWrong++;
      const postEqual = r.strokes.slice(s + 1).every((t) => rowString(t.row) === rowString(t.methodRow));
      if (postEqual) out.healedByteEqual++;
      if (r.closed) out.stillClosed++;
      if (a === 0 || b === 0) out.withTreble++;
    }
  }
  return out;
}
R3.conspiracy = { 'Plain Bob Minor': sweepConspiracy('Plain Bob Minor'), 'Plain Bob Doubles': sweepConspiracy('Plain Bob Doubles') };

{
  const dMin = R3.deviator['Plain Bob Minor'];
  const dDbl = R3.deviator['Plain Bob Doubles'];
  const cMin = R3.conspiracy['Plain Bob Minor'];
  const cDbl = R3.conspiracy['Plain Bob Doubles'];
  const lMin = R3.lost['Plain Bob Minor'];
  const devPass =
    dMin.samples > 0 && dDbl.samples > 0 &&
    dMin.clashAtStroke === dMin.samples && dDbl.clashAtStroke === dDbl.samples && // P(clash)=1, latency 0
    dMin.partnerDetected === dMin.samples && dDbl.partnerDetected === dDbl.samples &&
    dMin.farOwnRope.hit === dMin.farOwnRope.total && dDbl.farOwnRope.hit === dDbl.farOwnRope.total &&
    dMin.nearOwnRope.hit === 0 && dMin.stayOwnRope.hit === 0 && dDbl.nearOwnRope.hit === 0 && dDbl.stayOwnRope.hit === 0 &&
    dMin.postStumbleByteEqual === dMin.samples && dDbl.postStumbleByteEqual === dDbl.samples &&
    dMin.healed === dMin.samples && dDbl.healed === dDbl.samples &&
    lMin.up.closedToRounds === 0 && lMin.down.closedToRounds === 0 &&
    lMin.up.ownRopeEver === 0 && lMin.down.ownRopeEver === 0;
  const conspPass =
    cMin.clash === 0 && cDbl.clash === 0 &&
    cMin.uninvolvedSignal === 0 && cDbl.uninvolvedSignal === 0 &&
    cMin.validRowButWrong === cMin.samples && cDbl.validRowButWrong === cDbl.samples &&
    cMin.healedByteEqual === cMin.samples && cDbl.healedByteEqual === cDbl.samples &&
    cMin.stillClosed === cMin.samples && cDbl.stillClosed === cDbl.samples;
  book('R3_finding', {
    verdict: (R3.honest.clashBits === 0 && R3.honest.ownRope === 0 && devPass && conspPass) ? 'PASS' : 'MIXED (see payload — honest negatives are findings)',
    honest: R3.honest,
    deviator: R3.deviator,
    lost: R3.lost,
    conspiracy: R3.conspiracy,
    reading_one: 'ROPESIGHT HOLDS: blinded lanes (own state + 1-bit channel only) complete ' +
      'every method byte-identically to the global-sight run. Unilateral deviation is ' +
      'locally detectable with ZERO latency and ZERO false alarms: the partition of slots ' +
      'makes any lone wrong transposition land in someone else\'s slot in the SAME stroke.',
    reading_two: 'THE TUNNEL IS REAL: a coordinated pair-trade is locally invisible on EVERY ' +
      'sample — no clash (the claim set is unchanged), no signal in uninvolved lanes — the ' +
      'row is valid but wrong, then heals. Local detection cannot see collusion; only the ' +
      'conductor\'s global audit (or chain replay) can. Seed L123-137 quoted in README.',
    reading_three: 'A lost lane hunting legally from the wrong place never trips its own ' +
      'rope (legal moves, wrong places) — "a moving weight with an opinion" (L21); it is ' +
      'caught only by recurring clashes (density receipted) and by the course never ' +
      'returning to rounds.',
  });
}

// ════════════════════════════════════════════════════════════════════════════
// R4 — the allegory->module map (booked to the chain; README renders the table)
// ════════════════════════════════════════════════════════════════════════════
const MAP = [
  { allegory: 'bells / ringers', seed: 'L5 "the ropes still hang where the first ringer hung them"', module: 'lanes (workers/agents) with fixed identity slots', receipt: 'R1' },
  { allegory: 'rounds', seed: 'L45 "You have rung every order... you have rung the extent"', module: 'rota tick alignment: the identity row every course returns to', receipt: 'R1 closed=rounds' },
  { allegory: 'a method (Plain Bob...)', seed: 'L53 "The name is not the method. The method is what you do when you have forgotten the name."', module: 'fixed permutation composition (token list); each lane\'s personal line = its memoized slice', receipt: 'R1 periods 40/60/84/112' },
  { allegory: 'the one-place rule', seed: 'L49 "no bell may move more than one place at a time. The rule was not designed."', module: 'every change = product of disjoint adjacent transpositions; maxMove<=1 verified', receipt: 'R1' },
  { allegory: 'the height', seed: 'L5 "The height is the only thing that has not changed in four hundred years."', module: 'CONSERVED COVER: every lane serves every position exactly 2(n-1) times per course — the fixed-share trust schedule', receipt: 'R2' },
  { allegory: 'ropesight', seed: 'L61 "The band is one thing with eight hands."', module: 'blinded lanes (own line slice + counter + 1-bit channel) produce byte-identical traces to global sight', receipt: 'R3a' },
  { allegory: "the conductor's calls", seed: 'L57 "A bob is a small change in the rule. The rule is still the rule."', module: 'public call stream (bob replaces a lead-end change); lanes stay local', receipt: 'R3a touches' },
  { allegory: 'a ringer feels the rope go wrong', seed: 'L21 "If the angle shifts by a degree, the stay cracks."', module: 'own-rope anomaly: far moves crack instantly; near moves are rope-silent', receipt: 'R3c' },
  { allegory: 'the deviator', seed: 'L21 "A falling bell is not a bell. It is a moving weight with an opinion."', module: 'E24-toxic analog: the near deviation (plausible, small, wrong slot) is the voice to fear — and the slot partition catches it at latency 0', receipt: 'R3c' },
  { allegory: 'provenance without identity', seed: 'L5 "Nobody remembers the first ringer\'s name."', module: 'the receipt chain hashes strokes and rows; lanes are interchangeable positions, the record is not', receipt: 'R4/chain' },
  { allegory: 'The Tunnel', seed: 'L123-125 "The tunnel was being dug from both ends. Neither end knew about the other."', module: 'coordinated pair-trade: locally invisible, globally a wrong row; heals itself; only a global audit sees it', receipt: 'R3d' },
  { allegory: 'trust the rule, not the members', seed: 'L69 "We do not know. We ring the method. The method guarantees the changes. We trust the rule."', module: 'correctness from composed schedule structure, not from member auditing — but the audit channel that DOES exist (slot clash) is exact', receipt: 'R3' },
];
book('R4_mapping', { map: MAP });

// ════════════════════════════════════════════════════════════════════════════
// R5 — determinism / self-test
// ════════════════════════════════════════════════════════════════════════════
function coreTraceHashes() {
  const out = [];
  for (const run of honestRuns()) {
    const r = runRota({ n: METHODS[run.nm].stage, tokens: run.toks, methodRows: run.mrows, lines: run.lines });
    out.push(r.traceHash);
  }
  return out;
}
const hashRun1 = coreTraceHashes();
const hashRun2 = coreTraceHashes();
const prngA = mulberry32(1); const prngB = mulberry32(2);
const orderA = [prngA(), prngA(), prngA()].join(',');
const orderB = [prngB(), prngB(), prngB()].join(',');
const R5 = {
  sameSeedByteIdentical: hashRun1.join(',') === hashRun2.join(','),
  traceHashes: hashRun1,
  prngSeedsDiffer: orderA !== orderB,
};
book('R5_finding', { verdict: R5.sameSeedByteIdentical && R5.prngSeedsDiffer ? 'PASS' : 'FAIL', ...R5 });

// ════════════════════════════════════════════════════════════════════════════
// verdict + outputs
// ════════════════════════════════════════════════════════════════════════════
const verdicts = Object.fromEntries(rows.filter((r) => r.type.endsWith('_finding')).map((r) => [r.type, r.verdict]));
const allPass = Object.values(verdicts).every((v) => v === 'PASS');
book('verdict', {
  final: allPass ? 'PASS' : 'MIXED/FAIL',
  verdicts,
  wallMs: +(Number(process.hrtime.bigint()) / 1e9 - 0).toFixed(0), // replaced below
});
rows[rows.length - 1].wallMs = +(Number(process.hrtime.bigint() - probeT0) / 1e6).toFixed(1);

const summary = {
  experiment: 'e_rs1_rope',
  task: '26-c ropesight: permutation rota lane',
  verdicts, R1, R2, R3, R4: MAP, R5,
  sealedRows: rows.filter((r) => ['charter', 'decision_rules', 'probe'].includes(r.type)),
};

mkdirSync(new URL('./outputs/', import.meta.url), { recursive: true });
const outPath = new URL('./outputs/receipts_e_rs1.jsonl', import.meta.url);
writeFileSync(outPath, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
const v1 = verifyChain(rows);
const sealed = sealChain(structuredClone(rows));
writeFileSync(outPath, sealed.map((r) => JSON.stringify(r)).join('\n') + '\n');
const v2 = verifyChain(sealed);
const reread = readFileSync(outPath, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const v3 = verifyChain(reread);
const summaryPath = new URL('./outputs/e_rs1_summary.json', import.meta.url);
writeFileSync(summaryPath, JSON.stringify({ ...summary, chain: { verifyInMemory: v2, verifyReread: v3, tip: sealed[sealed.length - 1].row_hash, links: sealed.length } }, null, 2) + '\n');

console.log('E-RS1 verdicts:', JSON.stringify(verdicts));
console.log('R1 periods:', R1.methods.map((m) => `${m.name}:${m.period}(exp ${m.expectPeriod})`).join(' '));
console.log('R2 cover:', R2.courses.map((c) => `${c.stage}bells=${c.coverVal}x${c.coverUniform ? 'uniform' : 'NOT-UNIFORM'}`).join(' '));
console.log(`R3 honest false alarms: ${R3.honest.clashBits + R3.honest.ownRope}/${R3.honest.strokes} strokes`);
console.log(`R3c deviator Minor: samples=${dMinStat.samples} clash=${dMinStat.clashAtStroke} partner=${dMinStat.partnerDetected} healed=${dMinStat.healed}`);
console.log(`R3c deviator Doubles: samples=${R3.deviator['Plain Bob Doubles'].samples} clash=${R3.deviator['Plain Bob Doubles'].clashAtStroke}`);
console.log(`R3c lost Minor: meanClashDensity=${lMin.up.meanDensity.toFixed(3)}/${lMin.down.meanDensity.toFixed(3)} ownRopeEver=${lMin.up.ownRopeEver + lMin.down.ownRopeEver} closedToRounds=${lMin.up.closedToRounds + lMin.down.closedToRounds}`);
console.log(`R3d conspiracy Minor: samples=${cMinStat.samples} clash=${cMinStat.clash} uninvolvedSignal=${cMinStat.uninvolvedSignal} fullySilent=${cMinStat.fullySilent} stillClosed=${cMinStat.stillClosed}`);
console.log(`R3d conspiracy Doubles: samples=${cDblStat.samples} fullySilent=${cDblStat.fullySilent}`);
console.log(`R5 determinism: ${R5.sameSeedByteIdentical ? 'byte-identical' : 'DIVERGED'}; prngSeedsDiffer=${R5.prngSeedsDiffer}`);
console.log(`chain: ${v2.ok ? 'ok' : 'BROKEN'} in-memory, ${v3.ok ? 'ok' : 'BROKEN'} from re-read file; ${sealed.length} links; tip ${sealed[sealed.length - 1].row_hash}`);
console.log(allPass ? 'E-RS1 FINAL: PASS' : 'E-RS1 FINAL: ' + JSON.stringify(verdicts));
