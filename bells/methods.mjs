// bells/methods.mjs — permutation composition algebra over N bells.
//
// THE ALLEGORY AS SPEC (fleet-seeds/seeds/seed-story.md, "The Ropesight"):
//   L45: "Three bells. You ring 1-2-3. ... You have rung every order. ...
//         you have rung the extent."            -> the permutation group on N bells
//   L49: "no bell may move more than one place at a time. The rule was not
//         designed."                            -> every change is a product of
//                                                  disjoint ADJACENT transpositions
//   L53: "The method has a name. Plain Bob. Grandsire. Stedman. Cambridge.
//         The name is not the method."          -> a method = a FIXED LIST of
//                                                  stage-permutations (we implement
//                                                  the Plain Bob family; Grandsire /
//                                                  Stedman / Cambridge are named by
//                                                  the seed but not derived here —
//                                                  honest scope, see README)
//   L5:  "The height is the only thing that has not changed in four hundred
//         years."                               -> the conserved cover: over a
//                                                  course every bell occupies every
//                                                  position exactly 2(n-1) times
//
// CONVENTIONS (fixed for the whole repo):
//   - positions and bells are 0-based internally; rows render 1-based as strings.
//   - a ROW r is an array where r[i] = bell occupying position i.
//   - a CHANGE c is an array where c[i] = the source position feeding position i:
//     next[i] = row[c[i]]  (so c is a permutation of 0..n-1, applied as a lookup).
//   - composition: apply(c1) then apply(c2) equals apply(compose(c2, c1)) where
//     compose(c2, c1)[i] = c1[c2[i]].
//
// NO NETWORK. NO FLOATS in the algebra (all integers). Node 24, ESM.

// ── algebra core ─────────────────────────────────────────────────────────────

/** identity permutation on n positions: every bell stays. */
export const identity = (n) => Array.from({ length: n }, (_, i) => i);

/** rounds row: bell i in position i. The row the band always returns to. */
export const rounds = (n) => identity(n);

/** compose(c2, c1): the single change equivalent of "apply c1, then apply c2". */
export const compose = (c2, c1) => c2.map((i) => c1[i]);

/** applyChange: global application of change c to row r. The GLOBAL-sight path. */
export const applyChange = (r, c) => r.map((_, i) => r[c[i]]);

/** apply a change n times (iteration is composition — associativity in use). */
export const applyRepeated = (r, c, k) => {
  let row = r;
  for (let i = 0; i < k; i++) row = applyChange(row, c);
  return row;
};

/** inverse of a change: the change that undoes it (c after inv(c) == identity). */
export const inverse = (c) => {
  const inv = Array.from({ length: c.length }, () => 0);
  for (let i = 0; i < c.length; i++) inv[c[i]] = i;
  return inv;
};

/** apply a change to a SINGLE bell's position: the bell at pos moves to c[pos].
 *  Valid because every makeChange product is a product of DISJOINT adjacent
 *  transpositions (seed L49) — hence an involution, c^{-1} == c, so the row rule
 *  next[pos] = row[c[pos]] makes the bell's new position exactly c[old pos].
 *  This is the LOCAL rule's whole arithmetic: a ringer who knows the public
 *  change and their own position needs nothing else (seed L45: ropesight =
 *  knowing your place). */
export const applyTokenToPos = (c, pos) => c[pos];

/** order of a change: smallest k >= 1 with c^k == identity.
 *  (Every change this module builds is a product of disjoint transpositions,
 *  so its order is 1 or 2; the cap is generous for hand-made permutations.) */
export const order = (c) => {
  let row = identity(c.length);
  for (let k = 1; k <= c.length * c.length; k++) {
    row = applyChange(row, c);
    if (row.every((b, i) => b === i)) return k;
  }
  return -1;
};

// ── changes from ringing notation ────────────────────────────────────────────

/** parse a place-notation token into the set of 0-based fixed places.
 *  'x'  = cross (no fixed places on even stages; on odd stages the last bell
 *         cannot pair, so 'x' is not a legal odd-stage token and we throw —
 *         odd stages name their cross explicitly, e.g. '5' on Doubles).
 *  '16' = places 1 and 6 fixed. '125' = places 1,2,5 fixed. */
export function fixedPlaces(token, n) {
  if (token === 'x') {
    if (n % 2 === 1) throw new Error(`'x' is not a legal change on stage ${n} (odd stage leaves a bell unpaired)`);
    return new Set();
  }
  const fixed = new Set();
  for (const ch of token) {
    const p = Number(ch);
    if (!(p >= 1 && p <= n)) throw new Error(`place ${ch} out of range for stage ${n}`);
    fixed.add(p - 1);
  }
  return fixed;
}

/** makeChange(n, token): build the change as a product of disjoint ADJACENT
 *  transpositions (seed L49). Positions NOT named by the token pair up
 *  consecutively (1-2, 3-4, ...); if any position cannot pair, the token does
 *  not denote a legal change and we throw. */
export function makeChange(n, token) {
  const fixed = fixedPlaces(token, n);
  const c = identity(n);
  for (let i = 0; i < n; i++) {
    if (fixed.has(i) || c[i] !== i) continue;
    if (i + 1 < n && !fixed.has(i + 1) && c[i + 1] === i + 1) {
      c[i] = i + 1; c[i + 1] = i; i++;
    } else {
      throw new Error(`token '${token}' leaves position ${i + 1} unpaired on stage ${n} — not a legal change`);
    }
  }
  return c;
}

// ── the Plain Bob family (derived, then verified — never assumed) ────────────

/** One lead of Plain Bob on n bells, as notation tokens.
 *  Plain Bob = plain hunt (the treble hunts out and back, L49's rule) with
 *  2nds made at the lead end. Hunt alternates:
 *    even n: 'x' (swap all adjacent pairs) / '1n' (fix first and last),
 *    odd  n: 'n' (fix last, swap the rest) / '1' (fix first).
 *  Lead-end change: fix 1,2 (2nds made; the treble lies at lead) — on odd
 *  stages >= 5 the last bell is additionally fixed (it has no partner), giving
 *  '125' on Doubles / '127' on Triples.
 *  Lead length = 2n changes; plain course = (n-1) leads = 2n(n-1) changes.
 *  n = 3 is the seed's own case (L45: "Three bells. You ring 1-2-3. ... you
 *  have rung the extent."): the plain hunt cycle IS the extent — 2n = 6
 *  alternating changes, no separate lead end (fixing 1,2 on three bells would
 *  leave the 3rd unpaired; the extent closes with the hunt's own '1'). */
export function plainBobLeadTokens(n) {
  if (n === 3) return Array.from({ length: 2 * n }, (_, i) => (i % 2 === 0 ? '3' : '1'));
  const up = n % 2 === 0 ? 'x' : String(n);
  const down = n % 2 === 0 ? '1' + String(n) : '1';
  const hunt = [];
  for (let i = 0; i < 2 * n - 1; i++) hunt.push(i % 2 === 0 ? up : down);
  const le = n % 2 === 1 ? [1, 2, n] : [1, 2];
  return [...hunt, le.join('')];
}

/** bob token: 4ths made at a called bob (fix 1 and 4; odd tail fixed at end). */
export function bobToken(n) {
  const fixed = n % 2 === 1 ? [1, 4, n] : [1, 4];
  return fixed.join('');
}

/** The named methods this repo implements (seed L53 names Plain Bob first;
 *  seed L45 supplies the original method of all: the extent on three). */
export const METHODS = {
  'Extent on Three': { stage: 3 },
  'Plain Bob Doubles': { stage: 5 },
  'Plain Bob Minor': { stage: 6 },
  'Plain Bob Triples': { stage: 7 },
  'Plain Bob Major': { stage: 8 },
};

/** token list for a plain course (no calls) of a named method.
 *  Plain Bob: (n-1) leads — one per working bell. The Extent on Three is its
 *  own plain course in one lead (the hunt cycle IS the extent, seed L45). */
export function plainCourseTokens(name) {
  const { stage } = METHODS[name];
  const lead = plainBobLeadTokens(stage).map((t) => makeChange(stage, t));
  const leads = stage === 3 ? 1 : stage - 1;
  const tokens = [];
  for (let L = 0; L < leads; L++) tokens.push(...lead);
  return tokens;
}

/** token list for a course with a conductor's call stream.
 *  calls: array of { atLead (0-based lead index), kind: 'bob' }.
 *  The call replaces the lead-end change of that lead (L57: "A bob is a small
 *  change in the rule. The rule is still the rule."). */
export function courseTokens(name, calls = []) {
  const { stage } = METHODS[name];
  const lead = plainBobLeadTokens(stage);
  const bobAt = new Set(calls.filter((c) => c.kind === 'bob').map((c) => c.atLead));
  const tokens = [];
  for (let L = 0; L < stage - 1; L++) {
    for (let i = 0; i < lead.length - 1; i++) tokens.push(makeChange(stage, lead[i]));
    tokens.push(makeChange(stage, bobAt.has(L) ? bobToken(stage) : lead[lead.length - 1]));
  }
  return tokens;
}

// ── course facts (the R1/R2 verifier — computed, never assumed) ──────────────

const rowKey = (r) => r.join(',');

/** Walk a token list from rounds. Returns rows (r_0..r_L incl. the return to
 *  rounds), plus the verified facts: period, truth, legality, closure. */
export function walkCourse(tokens, n) {
  const rows = [rounds(n)];
  let row = rounds(n);
  let maxMove = 0;
  for (let s = 0; s < tokens.length; s++) {
    const next = applyChange(row, tokens[s]);
    for (let b = 0; b < n; b++) {
      const d = Math.abs(next.indexOf(b) - row.indexOf(b));
      if (d > maxMove) maxMove = d; // L49: this must stay <= 1
    }
    row = next;
    rows.push(row);
  }
  return { rows, maxMove };
}

/** Full course facts for a plain course of a named method. */
export function courseFacts(name) {
  const { stage: n } = METHODS[name];
  const tokens = plainCourseTokens(name);
  const { rows, maxMove } = walkCourse(tokens, n);
  // period: smallest k >= 1 with r_k == rounds
  let period = -1;
  for (let k = 1; k < rows.length; k++) {
    if (rows[k].every((b, i) => b === i)) { period = k; break; }
  }
  // truth: the course rows r_0..r_{period-1} are all distinct
  const seen = new Set(rows.slice(0, period).map(rowKey));
  // conserved cover over course rows r_0..r_{period-1} (rounds counted once):
  const cover = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let k = 0; k < period; k++) rows[k].forEach((b, i) => cover[b][i]++);
  const coverVal = period / n;
  const coverUniform = cover.every((r) => r.every((v) => v === coverVal));
  // treble path over the first lead (must be the plain hunt: out, lie, back, lie)
  const treble = [];
  for (let k = 0; k < Math.min(2 * n, period); k++) treble.push(rows[k].indexOf(0));
  return {
    name, stage: n, period, distinct: seen.size === period, maxMove,
    closed: period === tokens.length,
    cover, coverVal, coverUniform, treble,
    rows: rows.slice(0, period),
    halfLead: rows[n],            // after n changes (backrounds on the first lead)
    leadEnd1: rows[2 * n],        // after 2n changes
  };
}

/** personal line: bell's own position at every row of the course.
 *  This is the ringer's memorised blue line (L53: "The method is what you do
 *  when you have forgotten the name") — OFFLINE knowledge, learned before the
 *  band ever assembles. Used by the 'line' local-rule variant (and to build
 *  methodRow references); the primary 'method-pos' rule never consults it. */
export function personalLine(name, bell) {
  const { stage: n } = METHODS[name];
  const tokens = plainCourseTokens(name);
  const { rows } = walkCourse(tokens, n);
  return lineOverRows(rows, bell);
}

/** personal line over an explicit row sequence (any token list, any length). */
export function lineOverRows(rows, bell) {
  const line = new Int8Array(rows.length);
  for (let k = 0; k < rows.length; k++) line[k] = rows[k].indexOf(bell);
  return line;
}

/** deterministic trace digest for a row sequence (fleet fnv1a64 idiom). */
export function traceDigest(rowStrings) {
  // local copy of the fleet-standard fnv1a64 (same chain as quilt-arch /
  // quilt-silicon receipts) — keeps this module dependency-free.
  let h = 0xcbf29ce484222325n, p = 0x100000001b3n, mask = 0xffffffffffffffffn;
  const s = rowStrings.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= BigInt(s.charCodeAt(i));
    h = (h * p) & mask;
  }
  return '0x' + h.toString(16).padStart(16, '0');
}

export const rowString = (r) => r.map((b) => b + 1).join('');
