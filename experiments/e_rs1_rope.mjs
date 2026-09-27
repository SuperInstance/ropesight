// experiments/e_rs1_rope.mjs — E-RS1: THE ROPESIGHT PROPERTY, EXECUTED.
// Turns seed-story.md ("The Ropesight" + "# The Tunnel") into a real
// coordination module: permutation-algebra methods as fleet-rota schedules,
// ropesight as the local-knowledge property that makes the rota correct
// without global view.
//
// HOUSE RULES EXECUTED:
//   - receipts sealed BEFORE the runs they govern (charter, decision rules,
//     probe and derivations are booked and hashed before any R* number exists);
//   - honest negatives receipted as findings, never fabricated;
//   - verifyChain passes in memory AND from the re-read file;
//   - NO network. Node 24, ESM. Deterministic (R5 runs the core twice).
//
// Receipts:
//   R1 method correctness — periods to rounds (receipted numbers), true courses,
//       the L49 one-place rule, algebra laws, and local-rule execution ==
//       global permutation application (bit-equal traces over full periods).
//   R2 conservation      — seed L5 "The height is the only thing that has not
//       changed in four hundred years": over a full course every bell occupies
//       every position exactly period/n times — the exact conserved cover.
//   R3 THE ROPESIGHT     — (a) blinded band == global sight, byte-identical;
//       (b) honest-band false-alarm rate; (c) DEVIATOR: unilateral wrong
//       transposition — can any lane notice LOCALLY? at what latency? with
//       what false-alarm rate?; (d) CONSPIRACY (The Tunnel): the coordinated
//       pair-trade — the honest blind spot.
//   R4 mapping receipt   — lanes->murmur voices, method->fixed-share trust
//       schedule, deviator->E24 toxic, as a table quoting the seed's lines.
//   R5 determinism       — same seed -> byte-identical traces, twice.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import {
  identity, rounds, compose, applyChange, inverse, order, makeChange,
  applyTokenToPos, METHODS, plainCourseTokens, courseTokens, courseFacts,
  lineOverRows, walkCourse, traceDigest, rowString,
} from '../bells/methods.mjs';
import { runRota } from '../bells/rota.mjs';
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
    'conserved cover (every bell rings every position the same count). L49: "no bell may ' +
    'move more than one place at a time" = every change is a product of disjoint adjacent ' +
    'transpositions. L57: conductor\'s calls = public broadcast, still local per lane. ' +
    'L21: "If the angle shifts by a degree, the stay cracks" = own-rope anomaly channel. ' +
    'The Tunnel (L123-137) = coordinated deviation: locally invisible.',
  machine: 'bells/methods.mjs (permutation composition algebra over N bells: identity, ' +
    'compose, applyChange, applyTokenToPos, inverse, order, place-notation changes, ' +
    'Extent on Three + Plain Bob Doubles/Minor/Triples/Major, course facts, personal ' +
    'lines) + bells/rota.mjs (Lane = blinded local rule over own token copy + own ' +
    'position + own counter, two rule variants; Tower = physical claim-resolution ' +
    'layer with the 1-bit clash channel; deviations = near/stay/far/lost-hunt/' +
    'conspiracy). Chain: experiments/receipts.mjs (fleet fnv1a64 idiom).',
  scope_note: 'Seed L53 names "Plain Bob. Grandsire. Stedman. Cambridge." This lane ships ' +
    'the Plain Bob family (Doubles/Minor/Triples/Major) derived from first principles and ' +
    'verified against the documented plain-course lengths 2n(n-1), plus the seed\'s own ' +
    'L45 method, the extent on three (period 6 = 3!). Grandsire/Stedman/Cambridge are NOT ' +
    'derived here — deriving a second family from memory would risk fabrication; honest scope.',
});

book('audit_dead_draft', {
  what: 'Task 26-c is a retry. The first attempt died after chartering and left untracked ' +
    'partial drafts (bells/, experiments/). Audited line by line before any run.',
  kept: [
    'bells/methods.mjs construction VERIFIED CORRECT and kept (with additions): periods, ' +
    'backrounds half-leads, cover uniformity, one-place rule all confirmed; Plain Bob Minor ' +
    'first lead end 135264 and half-lead 654321 hand-traced independently BEFORE the runs.',
    'experiments/receipts.mjs chain core kept (fnv1a64 over [prev, rest], genesis GENESIS — ' +
    'diffed verbatim against quilt-silicon\'s, the fleet idiom).',
    'rota.mjs CONCEPTS kept: deviation kinds, 1-bit clash channel, own-rope anomaly, ' +
    'conspiracy pair-trade, the local/global partition idea.',
    'e_rs1 skeleton kept: R1-R5 shape, decision-rules-first ordering, allegory map ' +
    '(seed L-numbers re-checked against the seed file).',
  ],
  replaced: [
    'ROTA ROW-CONVENTION BUG (fatal): the draft\'s Tower recorded claims (bell->position) ' +
    'as the "row" and compared them to position->bell method rows. Only 14/60 Plain Bob ' +
    'Minor rows are involutions, so the honest blinded run could never have been ' +
    'byte-identical; the draft\'s own probe assertion (throw on divergence) proves the ' +
    'draft never completed a run. Tower now builds the rung row position->bell.',
    'e_rs1 STARTUP CRASH: Object.fromEntries over non-pair objects (lines cruft) threw at ' +
    'load; console.logs referenced undefined dMinStat/cMinStat/cDblStat. Rewritten.',
    'UNVERIFIED SEALED NUMBERS NOT CARRIED: the draft sealed touch periods 180/120/36/120 ' +
    'and "Doubles first lead end 13425" with no derivation. The lead-end claim is FALSE ' +
    '(actual: 13524, hand re-traced). Touch periods are now DERIVED and booked before the ' +
    'blinded runs; unverifiable magic numbers are not sealed.',
    'SEALED PREDICTION CORRECTED: "near deviations are rope-silent" is false in general — ' +
    'a near deviation on a bell already moving compounds to a 2-place move (the stay ' +
    'cracks, L21). Replaced by the measured partition: own-rope fires iff |claim - own ' +
    'position| > 1, independent of kind label.',
    'LANE MODEL REFINED: primary local rule is now method-pos (own token copy + own ' +
    'position + own counter — the brief\'s "own next transposition"); the draft\'s ' +
    'memorised personal line kept as the \'line\' variant. Tower no longer writes global ' +
    'observations into lane objects.',
  ],
});

book('decision_rules', {
  R1_period: 'VERDICT PASS iff for each method the computed period (smallest k>=1 with ' +
    'row_k == rounds) equals the sealed expectation — Extent on Three: 6 (= 3!, seed L45 ' +
    '"you have rung the extent"); Plain Bob Doubles/Minor/Triples/Major: 40/60/84/112 ' +
    '(= 2n(n-1), the documented plain-course lengths); ALL course rows distinct; |bell ' +
    'move| <= 1 at EVERY change of EVERY stage both in the global walk and in the LOCAL ' +
    'rule applyTokenToPos (seed L49); half-lead row == backrounds (n..1); first lead end ' +
    '== {123, 13524, 135264, 1352746, 13527486} (Minor 135264 documented + hand-verified; ' +
    'others derived from the construction whose period/backround/treble/cover structure ' +
    'is independently attested); treble path over the first lead is the plain hunt ' +
    '1..n,n..1. Algebra laws: compose identity/associativity/inverse hold on 2000 random ' +
    'legal changes per trial set; cross order = 2.',
  R1_local_global: 'VERDICT PASS iff the rota run with blinded lanes — each lane holds ONLY ' +
    'bell id, its own frozen copy of the public token stream, own position, own stroke ' +
    'counter (rule method-pos), plus optionally its own memorised line (rule line) — is ' +
    'BYTE-IDENTICAL stroke by stroke to the global permutation application of the same ' +
    'token list, for all 5 plain courses AND all admitted touches, under BOTH rules; no ' +
    'Lane owns any row/tower/other-lane reference (structural blinding over own keys); ' +
    'and an AUDIT-BLIND run (tower sheet replaced by zeros, invisible to lanes) produces ' +
    'the SAME trace hash — the global audit is not load-bearing.',
  R2_cover: 'VERDICT PASS iff over each full course (rows r_0..r_{period-1}) every bell ' +
    'occupies every position EXACTLY period/n times (2/8/10/12/14) — the uniform conserved ' +
    'cover, seed L5 "the height"; and every rung row is a permutation (each position ' +
    'exactly one bell). The blinded Minor run\'s own rows must reproduce the same cover.',
  R3a: 'THE ROPESIGHT PROPERTY. VERDICT PASS iff every honest blinded run (5 plain courses ' +
    'x 2 rules + admitted touches x 2 rules) is byte-identical to global sight and closes ' +
    'to rounds.',
  R3b: 'False alarms. VERDICT PASS iff over ALL strokes of ALL honest runs the total ' +
    'clash-bits across all lanes == 0 AND own-rope anomalies == 0 — an honest band never ' +
    'feels a rope go wrong. Receipt the rate as exactly 0.',
  R3c: 'DEVIATOR (unilateral wrong transposition at a chosen stroke; sealed before the ' +
    'sweep, tested exhaustively over ALL (stroke, bell, kind) samples on Minor and Doubles, ' +
    'kinds near-up/near-down/stay/far-up/far-down, both rules; vacuous samples — wrong ' +
    'transposition equals the right one or falls off the tower — skipped and counted): ' +
    '(i) P(clash at the deviation stroke) = 1 with an honest partner notified at the SAME ' +
    'stroke (detection latency 0): at the deviation stroke the honest bells claim exactly ' +
    'the positions that are NOT the deviator\'s method position, so ANY non-vacuous wrong ' +
    'claim lands in an occupied slot — the partition argument; (ii) OWN-ROPE (the lane\'s ' +
    'own expected-next-position check, L21) fires IFF |claim - own position| > 1 MEASURED — ' +
    'far kinds always (unless vacuous); stay kinds never (move 0); near kinds exactly when ' +
    'they compound a move into >= 2 places (count receipted — the corrected taxonomy); ' +
    '(iii) rule line: the stumble self-heals — every row after the deviation stroke is ' +
    'byte-equal to the method and the (doubled) course closes to rounds — full recovery ' +
    'from the lane\'s own count; (iv) rule method-pos: the lane cannot know its true place ' +
    'was lost and keeps ringing the method from where it IS — persistence, clash density ' +
    'and closure over a doubled course are BOOKED AS FINDINGS (no pass/fail); (v) ' +
    'lost-hunt (persists, hunts +-1 legally): own-rope NEVER fires after the start stroke ' +
    '(legal moves, wrong places), the course never returns to rounds, clash density ' +
    'receipted — detection is statistical (recurring clashes), not self-knowledge.',
  R3d: 'CONSPIRACY (The Tunnel, seed L123 "Neither end knew about the other."). Two lanes ' +
    'silently trade their planned claims for one stroke: the claim SET is unchanged. ' +
    'VERDICT PASS iff at the trade stroke, for EVERY sample (both methods, all pairs, both ' +
    'rules): zero clash, zero uninvolved-lane signal (no clash bit, no own-rope anomaly), ' +
    'and the rung row is a valid permutation but != the method row; AND rule line: the ' +
    'course heals byte-identically and closes (a one-stroke conspiracy is UNDETECTABLE by ' +
    'any local channel and by the rounds check — only the conductor\'s global audit or a ' +
    'chain replay sees it); rule method-pos: the pair cannot re-find its place, so ' +
    'post-trade disruption (clash density, closure over a doubled course) is BOOKED AS ' +
    'FINDINGS. Conspirator self-knowledge (own-rope inside the pair) is receipted, never ' +
    'counted as band detection.',
  R4: 'Mapping receipt: the allegory->module table is booked to the chain and rendered in ' +
    'the README verbatim, each row quoting the seed line it implements.',
  R5: 'VERDICT PASS iff the full honest-core trace-hash list computed twice is identical ' +
    '(determinism: same seed -> byte-identical trace) and different mulberry32 seeds ' +
    'produce different meta-level order streams (sampling order is the only seed use).',
  probe: 'Before any sweep: time one blinded Minor course; sweeps sized so the full suite ' +
    'stays < 60s wall. Record the choice.',
});

// ════════════════════════════════════════════════════════════════════════════
// shared kernels (frozen before the runs)
// ════════════════════════════════════════════════════════════════════════════
const NAMES = Object.keys(METHODS);
const facts = Object.fromEntries(NAMES.map((nm) => [nm, courseFacts(nm)]));
const TOKENS = Object.fromEntries(NAMES.map((nm) => [nm, plainCourseTokens(nm)]));
const MROWS = Object.fromEntries(NAMES.map((nm) => [nm, walkCourse(TOKENS[nm], METHODS[nm].stage).rows]));
const EXPECT_PERIOD = { 'Extent on Three': 6, 'Plain Bob Doubles': 40, 'Plain Bob Minor': 60, 'Plain Bob Triples': 84, 'Plain Bob Major': 112 };
const EXPECT_LE1 = { 'Extent on Three': '123', 'Plain Bob Doubles': '13524', 'Plain Bob Minor': '135264', 'Plain Bob Triples': '1352746', 'Plain Bob Major': '13527486' };
const KINDS = ['near-up', 'near-down', 'stay', 'far-up', 'far-down'];

/** tile a token list so the cyclic stream reaches exactly P strokes */
const tile = (toks, P) => Array.from({ length: P }, (_, k) => toks[k % toks.length]);

// candidate touches: derivation (global algebra) BEFORE any blinded touch run
const TOUCH_CANDIDATES = [
  { name: 'Plain Bob Minor', calls: [{ atLead: 0, kind: 'bob' }] },
  { name: 'Plain Bob Minor', calls: [{ atLead: 0, kind: 'bob' }, { atLead: 1, kind: 'bob' }] },
  { name: 'Plain Bob Minor', calls: [0, 1, 2, 3, 4].map((atLead) => ({ atLead, kind: 'bob' })) },
  { name: 'Plain Bob Doubles', calls: [{ atLead: 0, kind: 'bob' }] },
];
function deriveTouch(t) {
  const n = METHODS[t.name].stage;
  const toks = courseTokens(t.name, t.calls);
  const len = toks.length;
  let row = rounds(n);
  for (let k = 1; k <= 5000; k++) {
    row = applyChange(row, toks[(k - 1) % len]);
    if (row.every((b, i) => b === i)) return { ...t, len, period: k, tokens: tile(toks, k), admitted: true };
  }
  return { ...t, len, period: -1, admitted: false };
}
const probeT0 = process.hrtime.bigint();
{
  const r = runRota({ n: 6, tokens: TOKENS['Plain Bob Minor'], methodRows: MROWS['Plain Bob Minor'] });
  if (!r.byteIdentical) throw new Error('probe failed: blinded Minor course diverged from global sight');
}
const probeMs = Number(process.hrtime.bigint() - probeT0) / 1e6;
const TOUCHES = TOUCH_CANDIDATES.map(deriveTouch);
book('probe_and_derivation', {
  probe: {
    what: 'one blinded Plain Bob Minor course (60 strokes, 6 lanes, method-pos rule) vs global walk',
    probeMs: +probeMs.toFixed(3),
    choice: 'sweeps = exhaustive enumeration over strokes x bells x kinds on Minor and ' +
      'Doubles under BOTH rules, on DOUBLED courses (recovery room); full suite expected ' +
      'well under 60s at ' + probeMs.toFixed(3) + 'ms/course. Sealed before the sweeps.',
  },
  touch_derivation: 'each candidate touch\'s closure period was computed from the GLOBAL ' +
    'algebra (cyclic walk, cap 5000) BEFORE any blinded touch run; admitted touches and ' +
    'their periods are booked here; the blinded band must close at exactly these periods.',
  touches: TOUCHES.map((t) => ({ name: t.name, leads: t.calls.map((c) => c.atLead), tokenLen: t.len, period: t.period, admitted: t.admitted })),
});

// honest run set (plain courses + admitted touches), both rules
function honestRuns(rule) {
  const out = [];
  for (const nm of NAMES) {
    out.push({ label: `${nm} plain`, nm, n: METHODS[nm].stage, tokens: TOKENS[nm], mrows: MROWS[nm], rule });
  }
  for (const t of TOUCHES) {
    if (!t.admitted) continue;
    const n = METHODS[t.name].stage;
    const mrows = walkCourse(t.tokens, n).rows;
    out.push({ label: `${t.name} touch(le=${t.calls.map((c) => c.atLead).join('+')})`, nm: t.name, n, tokens: t.tokens, mrows, rule, touchPeriod: t.period });
  }
  return out;
}
function blindRun(run) {
  const opts = { n: run.n, tokens: run.tokens, methodRows: run.mrows, rule: run.rule };
  if (run.rule === 'line') opts.lines = Array.from({ length: run.n }, (_, b) => lineOverRows(run.mrows, b));
  return runRota(opts);
}

// ════════════════════════════════════════════════════════════════════════════
// R1 — method correctness + algebra laws + local == global
// ════════════════════════════════════════════════════════════════════════════
const R1 = { methods: [], algebra: {}, localGlobal: [] };

for (const nm of NAMES) {
  const f = facts[nm];
  R1.methods.push({
    name: nm, stage: f.stage, period: f.period, expectPeriod: EXPECT_PERIOD[nm],
    distinctRows: f.distinct, maxMove: f.maxMove, closed: f.closed,
    halfLead: rowString(f.halfLead), leadEnd1: rowString(f.leadEnd1), expectLeadEnd1: EXPECT_LE1[nm],
    trebleFirstLead: f.treble.map((p) => p + 1).join(''),
    coverVal: f.coverVal, expectCover: f.period / f.stage, coverUniform: f.coverUniform,
  });
}
// local-rule legality: every per-bell move under every change of every method
{
  let maxLocal = 0;
  for (const nm of NAMES) for (const c of TOKENS[nm]) for (let p = 0; p < c.length; p++) {
    maxLocal = Math.max(maxLocal, Math.abs(applyTokenToPos(c, p) - p));
  }
  R1.maxLocalMove = maxLocal;
}

// algebra laws on random legal changes (meta-level PRNG picks WHICH changes only)
{
  const rng = mulberry32(0x2e26c);
  const pick = (n) => {
    for (;;) {
      const fixed = new Set();
      for (let p = 0; p < n; p++) if (rng() % 2n === 0n) fixed.add(p);
      const toks = [];
      for (let p = 0; p < n; p++) if (fixed.has(p)) toks.push(String(p + 1));
      try { return makeChange(6, toks.length ? toks.join('') : 'x'); } catch { /* unpaired: resample */ }
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
  R1.algebra = { trials, assoc, inverseRoundTrip: inv, identityNeut: ident, orderCross6: order(makeChange(6, 'x')) };
}

// local == global, honest band, both rules
for (const rule of ['method-pos', 'line']) {
  for (const run of honestRuns(rule)) {
    const r = blindRun(run);
    const laneKeys = new Set(r.lanes.flatMap((l) => Object.keys(l)));
    const blind = ![...laneKeys].some((k) => ['row', 'tower', 'strokes', 'lanes', 'methodRows', 'sheet'].includes(k));
    R1.localGlobal.push({
      label: run.label, rule, strokes: run.tokens.length,
      traceHash: r.traceHash, methodTraceHash: r.methodTraceHash,
      byteIdentical: r.byteIdentical, blindByConstruction: blind,
      closedToRounds: r.closed,
      touchDerivedPeriod: run.touchPeriod ?? null,
      touchBlindedPeriod: run.touchPeriod ? run.tokens.length : null,
    });
  }
}
// audit-blind run: the conductor's sheet replaced by zeros — the band cannot see it
{
  const n = 6, toks = TOKENS['Plain Bob Minor'];
  const zeroSheet = Array.from({ length: toks.length + 1 }, () => Array(n).fill(-1));
  const rZero = runRota({ n, tokens: toks, methodRows: zeroSheet });
  const rReal = runRota({ n, tokens: toks, methodRows: MROWS['Plain Bob Minor'] });
  R1.auditBlind = { sameTraceHash: rZero.traceHash === rReal.traceHash, note: 'global audit data does not affect the ringing' };
}

const R1pass =
  R1.methods.every((m) => m.period === m.expectPeriod && m.distinctRows && m.maxMove === 1 && m.closed)
  && R1.maxLocalMove === 1
  && R1.methods.every((m) => rowString(facts[m.name].halfLead) === rowString(Array.from({ length: m.stage }, (_, i) => m.stage - 1 - i)))
  && R1.methods.every((m) => m.leadEnd1 === m.expectLeadEnd1)
  && R1.algebra.assoc === 2000 && R1.algebra.inverseRoundTrip === 2000 && R1.algebra.identityNeut === 2000
  && R1.algebra.orderCross6 === 2
  && R1.localGlobal.every((g) => g.byteIdentical && g.blindByConstruction && g.closedToRounds)
  && R1.localGlobal.filter((g) => g.touchDerivedPeriod !== null).every((g) => g.touchBlindedPeriod === g.touchDerivedPeriod)
  && R1.auditBlind.sameTraceHash;
book('R1_finding', {
  verdict: R1pass ? 'PASS' : 'FAIL',
  periods: R1.methods.map((m) => `${m.name}:${m.period} (expect ${m.expectPeriod})`).join(', '),
  leadEnds: R1.methods.map((m) => `${m.name}:${m.leadEnd1}`).join(', '),
  algebra: R1.algebra, maxLocalMove: R1.maxLocalMove, auditBlind: R1.auditBlind,
  localGlobal: R1.localGlobal,
});

// ════════════════════════════════════════════════════════════════════════════
// R2 — the conservation of ringing (exact conserved cover)
// ════════════════════════════════════════════════════════════════════════════
const R2 = { courses: [], strokesAllPermutations: true, blindedMinorCover: null };
for (const nm of NAMES) {
  const f = facts[nm];
  for (const r of f.rows) if (new Set(r).size !== f.stage) R2.strokesAllPermutations = false;
  R2.courses.push({
    name: nm, stage: f.stage, period: f.period,
    promisedPerBell: f.period / f.stage, coverVal: f.coverVal,
    coverUniform: f.coverUniform, coverMatrix: f.cover.map((r) => r.join(',')),
  });
}
{
  const r = runRota({ n: 6, tokens: TOKENS['Plain Bob Minor'], methodRows: MROWS['Plain Bob Minor'] });
  const cover = Array.from({ length: 6 }, () => new Array(6).fill(0));
  let allPerm = true;
  for (const st of r.strokes) {
    if (new Set(st.row).size !== 6) allPerm = false;
    st.row.forEach((b, i) => cover[b][i]++);
  }
  R2.blindedMinorCover = { uniform: cover.every((rw) => rw.every((v) => v === 10)), allPermutations: allPerm, coverVal: 10 };
}
const R2pass = R2.courses.every((c) => c.coverUniform && c.coverVal === c.promisedPerBell)
  && R2.strokesAllPermutations && R2.blindedMinorCover.uniform && R2.blindedMinorCover.allPermutations;
book('R2_finding', {
  verdict: R2pass ? 'PASS' : 'FAIL',
  reading: 'seed L5 "The height is the only thing that has not changed in four hundred ' +
    'years": every bell rings every position exactly period/n times per course (2/8/10/12/14) ' +
    '— the fixed-share property of the rota: no lane over- or under-serves, ever.',
  courses: R2.courses, strokesAllPermutations: R2.strokesAllPermutations, blindedMinorCover: R2.blindedMinorCover,
});

// ════════════════════════════════════════════════════════════════════════════
// R3 — THE ROPESIGHT PROPERTY
// ════════════════════════════════════════════════════════════════════════════
const R3 = {};

// ---- R3b: false alarms on the honest band (measured over the same honest runs)
{
  let clashBits = 0, ownRope = 0, strokes = 0;
  for (const rule of ['method-pos', 'line']) {
    for (const run of honestRuns(rule)) {
      const r = blindRun(run);
      strokes += run.tokens.length;
      for (const b of Object.keys(r.locals)) {
        clashBits += r.locals[b].clashStrokes.length;
        ownRope += r.locals[b].ownRopeAnomalies.length;
      }
    }
  }
  R3.honest = { strokes, clashBits, ownRope, falseAlarmRate: clashBits + ownRope === 0 ? 0 : (clashBits + ownRope) / strokes };
}

// ---- R3c: the deviator (unilateral wrong transposition) — doubled-course harness
function sweepDeviations(nm, rule) {
  const n = METHODS[nm].stage;
  const toks1 = TOKENS[nm];
  const tokens = [...toks1, ...toks1]; // doubled course: recovery room
  const mrows = walkCourse(tokens, n).rows;
  const lines = rule === 'line' ? Array.from({ length: n }, (_, b) => lineOverRows(mrows, b)) : null;
  const out = { samples: 0, vacuous: 0, clashAtStroke: 0, partnerNotified: 0, latency0: 0,
    ownRopeFires: 0, ownRopeSilent: 0, moveHistogram: { 0: 0, 1: 0, 2: 0 },
    healed: 0, postStumbleByteEqual: 0, persistFraction: 0, clashDensityAfter: 0, closedToRounds: 0,
    healStrokeAnomalies: 0 };
  let densitySum = 0, persisted = 0;
  for (let s = 0; s < toks1.length; s++) {
    for (let bell = 0; bell < n; bell++) {
      for (const kind of KINDS) {
        const dev = [{ bell, atStroke: s, kind }];
        const r = runRota({ n, tokens, methodRows: mrows, lines, rule, deviations: dev });
        if (r.lanes[bell].deviation.vacuous) { out.vacuous++; continue; }
        out.samples++;
        const st = r.strokes[s];
        const claimed = st.claims[bell];
        const deviationMove = Math.abs(claimed - mrows[s].indexOf(bell)); // physical move of the deviator
        const hkey = String(Math.min(2, deviationMove));
        out.moveHistogram[hkey] = (out.moveHistogram[hkey] || 0) + 1;
        const hit = st.clashed.length > 0;
        if (hit) { out.clashAtStroke++; out.latency0++; }
        const partner = st.clashed.find((b) => b !== bell);
        if (hit && partner !== undefined && r.locals[partner].clashStrokes.includes(s)) out.partnerNotified++;
        const crack = r.locals[bell].ownRopeAnomalies.includes(s);
        if (crack) out.ownRopeFires++; else out.ownRopeSilent++;
        if (crack !== (deviationMove > 1)) out.ownRopePredicateMismatch = (out.ownRopePredicateMismatch || 0) + 1;
        // healing / persistence over the doubled course
        const postEqual = r.strokes.slice(s + 1).every((t) => rowString(t.row) === rowString(t.methodRow));
        if (postEqual) out.postStumbleByteEqual++;
        if (postEqual && r.closed) out.healed++;
        if (!postEqual) persisted++;
        const brokenAfter = r.strokes.slice(s + 1).filter((t) => t.broken).length;
        densitySum += brokenAfter / (r.strokes.length - s - 1);
        if (r.closed) out.closedToRounds++;
        if (r.locals[bell].ownRopeAnomalies.some((t) => t > s)) out.healStrokeAnomalies++;
      }
    }
  }
  out.persistFraction = out.samples ? +(persisted / out.samples).toFixed(4) : 0;
  out.clashDensityAfter = out.samples ? +(densitySum / out.samples).toFixed(4) : 0;
  return out;
}
R3.deviator = {};
for (const nm of ['Plain Bob Minor', 'Plain Bob Doubles']) {
  R3.deviator[nm] = { 'method-pos': sweepDeviations(nm, 'method-pos'), 'line': sweepDeviations(nm, 'line') };
}

// lost-hunt: persists, hunts legally from wherever it is (doubled course)
function sweepLost(nm, dir) {
  const n = METHODS[nm].stage;
  const toks1 = TOKENS[nm];
  const tokens = [...toks1, ...toks1];
  const mrows = walkCourse(tokens, n).rows;
  const out = { samples: 0, clashStrokes: 0, ownRopeEver: 0, closedToRounds: 0, densitySum: 0, minDensity: 1, maxDensity: 0 };
  for (let s = 0; s < toks1.length; s++) {
    for (let bell = 1; bell < n; bell++) { // the treble stays honest in lost sweeps (it is the band's clock)
      const r = runRota({ n, tokens, methodRows: mrows, deviations: [{ bell, atStroke: s, kind: 'lost-hunt', dir }] });
      out.samples++;
      const remaining = tokens.length - s - 1;
      const brk = r.brokenStrokes.filter((t) => t > s).length;
      out.clashStrokes += brk;
      const density = brk / remaining;
      out.densitySum += density;
      if (density < out.minDensity) out.minDensity = density;
      if (density > out.maxDensity) out.maxDensity = density;
      if (r.locals[bell].ownRopeAnomalies.some((t) => t > s)) out.ownRopeEver++;
      if (r.closed) out.closedToRounds++;
    }
  }
  out.meanDensity = +(out.densitySum / out.samples).toFixed(4);
  out.minDensity = +out.minDensity.toFixed(4);
  out.maxDensity = +out.maxDensity.toFixed(4);
  return out;
}
R3.lost = {};
for (const nm of ['Plain Bob Minor', 'Plain Bob Doubles']) {
  R3.lost[nm] = { up: sweepLost(nm, 1), down: sweepLost(nm, -1) };
}

// ---- R3d: the conspiracy (The Tunnel) — both rules, doubled course
function sweepConspiracy(nm, rule) {
  const n = METHODS[nm].stage;
  const toks1 = TOKENS[nm];
  const tokens = [...toks1, ...toks1];
  const mrows = walkCourse(tokens, n).rows;
  const lines = rule === 'line' ? Array.from({ length: n }, (_, b) => lineOverRows(mrows, b)) : null;
  const out = { samples: 0, clash: 0, uninvolvedSignal: 0, conspiratorOwnRope: 0, fullySilent: 0,
    validRowButWrong: 0, healedByteEqual: 0, stillClosed: 0, postTradeClashDensity: 0 };
  let densitySum = 0;
  for (let s = 0; s < toks1.length; s++) {
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const r = runRota({ n, tokens, methodRows: mrows, lines, rule, deviations: [{ bells: [a, b], atStroke: s, kind: 'conspiracy' }] });
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
      const brokenAfter = r.strokes.slice(s + 1).filter((t) => t.broken).length;
      densitySum += brokenAfter / (r.strokes.length - s - 1);
    }
  }
  out.postTradeClashDensity = +(densitySum / out.samples).toFixed(4);
  return out;
}
R3.conspiracy = {};
for (const nm of ['Plain Bob Minor', 'Plain Bob Doubles']) {
  R3.conspiracy[nm] = { 'method-pos': sweepConspiracy(nm, 'method-pos'), 'line': sweepConspiracy(nm, 'line') };
}

{
  const dMin = R3.deviator['Plain Bob Minor'], dDbl = R3.deviator['Plain Bob Doubles'];
  const lMin = R3.lost['Plain Bob Minor'], lDbl = R3.lost['Plain Bob Doubles'];
  const cMin = R3.conspiracy['Plain Bob Minor'], cDbl = R3.conspiracy['Plain Bob Doubles'];
  const all = (o, f) => Object.values(o).every(f);
  const devPass =
    all(dMin, (d) => d.samples > 0) && all(dDbl, (d) => d.samples > 0)
    && all(dMin, (d) => d.clashAtStroke === d.samples && d.partnerNotified === d.samples && d.latency0 === d.samples)
    && all(dDbl, (d) => d.clashAtStroke === d.samples && d.partnerNotified === d.samples && d.latency0 === d.samples)
    && !['method-pos', 'line'].some((rl) => (dMin[rl].ownRopePredicateMismatch || 0) + (dDbl[rl].ownRopePredicateMismatch || 0))
    && all(dMin, (d) => d.postStumbleByteEqual === d.samples && d.healed === d.samples)
    && all(dDbl, (d) => d.postStumbleByteEqual === d.samples && d.healed === d.samples)
    && lMin.up.closedToRounds === 0 && lMin.down.closedToRounds === 0
    && lDbl.up.closedToRounds === 0 && lDbl.down.closedToRounds === 0
    && lMin.up.ownRopeEver === 0 && lMin.down.ownRopeEver === 0
    && lDbl.up.ownRopeEver === 0 && lDbl.down.ownRopeEver === 0;
  const conspPass =
    cMin['method-pos'].clash === 0 && cMin['line'].clash === 0 && cDbl['method-pos'].clash === 0 && cDbl['line'].clash === 0
    && cMin['method-pos'].uninvolvedSignal === 0 && cMin['line'].uninvolvedSignal === 0
    && cDbl['method-pos'].uninvolvedSignal === 0 && cDbl['line'].uninvolvedSignal === 0
    && cMin['method-pos'].validRowButWrong === cMin['method-pos'].samples
    && cMin['line'].validRowButWrong === cMin['line'].samples
    && cDbl['method-pos'].validRowButWrong === cDbl['method-pos'].samples
    && cDbl['line'].validRowButWrong === cDbl['line'].samples
    && cMin['line'].healedByteEqual === cMin['line'].samples && cMin['line'].stillClosed === cMin['line'].samples
    && cDbl['line'].healedByteEqual === cDbl['line'].samples && cDbl['line'].stillClosed === cDbl['line'].samples;
  book('R3_finding', {
    verdict: (R3.honest.clashBits === 0 && R3.honest.ownRope === 0 && devPass && conspPass) ? 'PASS' : 'MIXED (see payload — honest negatives are findings)',
    honest: R3.honest,
    deviator: R3.deviator,
    lost: R3.lost,
    conspiracy: R3.conspiracy,
    reading_one: 'ROPESIGHT HOLDS: blinded lanes (own token copy + own position + own counter ' +
      '[+ own memorised line in the line rule]) complete every method and every called touch ' +
      'byte-identically to the global-sight run — and the conductor\'s audit sheet is not ' +
      'load-bearing (zero-sheet run, same hash).',
    reading_two: 'UNILATERAL DEVIATION IS LOCALLY DETECTABLE AT LATENCY 0, FALSE ALARMS 0: ' +
      'the slot partition makes any lone wrong transposition land in someone else\'s slot in ' +
      'the SAME stroke, and the displaced honest lane receives its clash bit then. But the ' +
      'deviator\'s OWN expected-next-position check fires only when its physical move exceeds ' +
      'one place (measured partition, not the kind label) — a near deviation that cancels or ' +
      'shortens its move is rope-silent to its owner and visible ONLY through the partner\'s ' +
      'clash bit. Local detection is channel-based (slot contention), not position-based.',
    reading_three: 'RECOVERY NEEDS THE PRACTICED LINE: under the line rule (ringer re-finds ' +
      'their place by their own count) every stumble heals byte-identically; under method-pos ' +
      '(no personal schedule) the deviator keeps ringing the method from the wrong place and ' +
      'the wrongness persists (persistFraction + clash density receipted). The blue line is ' +
      'what makes recovery possible — "the practice is what keeps it from happening" (L81).',
    reading_four: 'A lost lane hunting legally never trips its own rope (legal moves, wrong ' +
      'places — "a moving weight with an opinion", L21); it is caught only by recurring clash ' +
      'density and by the course never returning to rounds (0/' + (lMin.up.samples + lMin.down.samples + lDbl.up.samples + lDbl.down.samples) + ' closed).',
    reading_five: 'THE TUNNEL IS REAL: at the trade stroke a coordinated pair-trade is ' +
      'invisible on EVERY sample — no clash (the claim set is unchanged), no signal in ' +
      'uninvolved lanes, the row is valid but wrong. Under the line rule the pair rejoins its ' +
      'lines and the course heals byte-identically — undetectable by ANY local channel and by ' +
      'the rounds check; only the conductor\'s global audit (or a chain replay) sees it. ' +
      'Under method-pos the tunnel collapses behind them (post-trade clash density receipted) ' +
      '— but each honest lane still sees only its own bits.',
  });
}

// ════════════════════════════════════════════════════════════════════════════
// R4 — the allegory->module map (booked to the chain; README renders the table)
// ════════════════════════════════════════════════════════════════════════════
const MAP = [
  { allegory: 'bells / ringers', seed: 'L5 "the ropes still hang where the first ringer hung them"', module: 'lanes (workers/agents) with fixed identity slots', receipt: 'R1' },
  { allegory: 'rounds', seed: 'L45 "You have rung every order... you have rung the extent."', module: 'rota tick alignment: the identity row every course returns to', receipt: 'R1 periods 6/40/60/84/112' },
  { allegory: 'a method (Plain Bob...)', seed: 'L53 "The name is not the method. The method is what you do when you have forgotten the name."', module: 'fixed permutation composition (public token stream); each lane holds its OWN copy + own position + own counter', receipt: 'R1 local==global' },
  { allegory: 'the one-place rule', seed: 'L49 "no bell may move more than one place at a time. The rule was not designed."', module: 'every change = product of disjoint adjacent transpositions; maxMove==1 verified globally AND per-lane', receipt: 'R1' },
  { allegory: 'the height', seed: 'L5 "The height is the only thing that has not changed in four hundred years."', module: 'CONSERVED COVER: every lane serves every position exactly period/n times per course (2/8/10/12/14) — the fixed-share trust schedule: trust mass is uniform and conserved, no lane accumulates position-privilege', receipt: 'R2' },
  { allegory: 'ropesight', seed: 'L61 "The band is one thing with eight hands."', module: 'blinded lanes (own state + 1-bit channel only) produce byte-identical traces to global sight; the global audit sheet is not load-bearing', receipt: 'R3a' },
  { allegory: "the conductor's calls", seed: 'L57 "A bob is a small change in the rule. The rule is still the rule."', module: 'public call stream baked into every lane\'s own token copy before ringing; zero per-stroke instruction during ringing', receipt: 'R3a touches' },
  { allegory: 'a ringer feels the rope go wrong', seed: 'L21 "If the angle shifts by a degree, the stay cracks."', module: 'own-rope anomaly: fires iff the lane\'s physical move exceeds one place (measured partition) — far moves crack; move-cancelling near moves are rope-silent', receipt: 'R3c' },
  { allegory: 'the deviator', seed: 'L21 "A falling bell is not a bell. It is a moving weight with an opinion."', module: 'E24-toxic analog: the near deviation (plausible, small, wrong slot) is the voice to fear — and the slot partition still catches it through the displaced partner at latency 0', receipt: 'R3c' },
  { allegory: 'lost, not toxic', seed: 'L81 "every bell is a broken stay that has not happened yet. The practice is what keeps it from happening."', module: 'a lane that loses its place needs its own practiced line to re-seat; without it the wrongness persists — recovery is personal practice, not global rescue', receipt: 'R3c persistFraction' },
  { allegory: 'provenance without identity', seed: 'L5 "Nobody remembers the first ringer\'s name."', module: 'the receipt chain hashes strokes and rows; lanes are interchangeable positions, the record is not', receipt: 'R4/chain' },
  { allegory: 'The Tunnel', seed: 'L123-125 "The tunnel was being dug from both ends. Neither end knew about the other."', module: 'coordinated pair-trade: locally invisible at the trade stroke on EVERY sample; under the line rule it heals and is undetectable forever — only a global audit sees it', receipt: 'R3d' },
  { allegory: 'trust the rule, not the members', seed: 'L69 "We do not know. We ring the method. The method guarantees the changes. We trust the rule."', module: 'correctness from composed schedule structure, not member auditing — but the audit channel that DOES exist (slot clash) is exact at latency 0 with zero false alarms', receipt: 'R3' },
];
book('R4_mapping', { map: MAP });

// ════════════════════════════════════════════════════════════════════════════
// R5 — determinism / self-test
// ════════════════════════════════════════════════════════════════════════════
function coreTraceHashes() {
  const out = [];
  for (const rule of ['method-pos', 'line']) {
    for (const run of honestRuns(rule)) out.push(blindRun(run).traceHash);
  }
  const n = 6, toks = TOKENS['Plain Bob Minor'], mrows = MROWS['Plain Bob Minor'];
  out.push(runRota({ n, tokens: toks, methodRows: mrows, deviations: [{ bell: 2, atStroke: 17, kind: 'near-up' }] }).traceHash);
  out.push(runRota({ n, tokens: toks, methodRows: mrows, deviations: [{ bells: [1, 4], atStroke: 23, kind: 'conspiracy' }] }).traceHash);
  return out;
}
const hashRun1 = coreTraceHashes();
const hashRun2 = coreTraceHashes();
const prngA = mulberry32(1); const prngB = mulberry32(2);
const orderA = [prngA(), prngA(), prngA()].join(',');
const orderB = [prngB(), prngB(), prngB()].join(',');
const R5 = {
  sameSeedByteIdentical: hashRun1.join(',') === hashRun2.join(','),
  traceHashCount: hashRun1.length,
  digest: traceDigest(hashRun1),
  prngSeedsDiffer: orderA !== orderB,
};
book('R5_finding', { verdict: R5.sameSeedByteIdentical && R5.prngSeedsDiffer ? 'PASS' : 'FAIL', ...R5 });

// ════════════════════════════════════════════════════════════════════════════
// verdict + chain + outputs
// ════════════════════════════════════════════════════════════════════════════
const verdicts = Object.fromEntries(rows.filter((r) => r.type.endsWith('_finding')).map((r) => [r.type, r.verdict]));
const allPass = Object.values(verdicts).every((v) => v === 'PASS');
book('verdict', { final: allPass ? 'PASS' : 'MIXED/FAIL', verdicts });
rows[rows.length - 1].wallMs = +(Number(process.hrtime.bigint() - probeT0) / 1e6).toFixed(1);

// cross-verify the sealed chain with quilt-stone (the fleet's canonical verifier),
// guarded: a missing sibling skips the check instead of failing the lane.
let stone = null;
{
  const stoneUrl = new URL('../../quilt-stone/stone.mjs', import.meta.url);
  if (existsSync(stoneUrl)) {
    try {
      const S = await import(stoneUrl.href);
      stone = S.verifyChain(rows, 'GENESIS');
    } catch (e) { stone = { ok: false, why: 'import failed: ' + e.message }; }
  } else {
    stone = { ok: null, why: 'quilt-stone sibling not present — skipped' };
  }
}

const summary = {
  experiment: 'e_rs1_rope',
  task: '26-c ropesight: permutation rota lane (retry)',
  verdicts, R1, R2, R3, R4: MAP, R5,
  sealedRows: rows.filter((r) => ['charter', 'audit_dead_draft', 'decision_rules', 'probe_and_derivation'].includes(r.type)),
};

mkdirSync(new URL('./outputs/', import.meta.url), { recursive: true });
const outPath = new URL('./outputs/receipts_e_rs1.jsonl', import.meta.url);
const sealed = sealChain(structuredClone(rows));
writeFileSync(outPath, sealed.map((r) => JSON.stringify(r)).join('\n') + '\n');
const vMem = verifyChain(sealed);
const reread = readFileSync(outPath, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const vFile = verifyChain(reread);
const summaryPath = new URL('./outputs/e_rs1_summary.json', import.meta.url);
writeFileSync(summaryPath, JSON.stringify({ ...summary, chain: { verifyInMemory: vMem, verifyReread: vFile, stoneCrossCheck: stone, tip: sealed[sealed.length - 1].row_hash, links: sealed.length } }, null, 2) + '\n');

// ════════════════════════════════════════════════════════════════════════════
console.log('E-RS1 verdicts:', JSON.stringify(verdicts));
console.log('R1 periods:', R1.methods.map((m) => `${m.name}:${m.period}(exp ${m.expectPeriod})`).join(' '));
console.log('R1 lead ends:', R1.methods.map((m) => `${m.name}:${m.leadEnd1}`).join(' '));
console.log('R1 local==global runs:', R1.localGlobal.length, 'all byte-identical:', R1.localGlobal.every((g) => g.byteIdentical), '| audit-blind same hash:', R1.auditBlind.sameTraceHash);
console.log('R2 cover:', R2.courses.map((c) => `${c.stage}bells=${c.coverVal}x${c.coverUniform ? 'uniform' : 'NOT-UNIFORM'}`).join(' '), '| blinded Minor cover uniform:', R2.blindedMinorCover.uniform);
console.log(`R3 honest false alarms: ${R3.honest.clashBits + R3.honest.ownRope}/${R3.honest.strokes} strokes`);
for (const nm of Object.keys(R3.deviator)) for (const rl of Object.keys(R3.deviator[nm])) {
  const d = R3.deviator[nm][rl];
  console.log(`R3c deviator ${nm} [${rl}]: samples=${d.samples} vacuous=${d.vacuous} clash@stroke=${d.clashAtStroke} partner=${d.partnerNotified} ownRopeFires=${d.ownRopeFires} healed=${d.healed} persist=${d.persistFraction} densityAfter=${d.clashDensityAfter}`);
}
for (const nm of Object.keys(R3.lost)) for (const k of Object.keys(R3.lost[nm])) {
  const l = R3.lost[nm][k];
  console.log(`R3c lost ${nm} ${k}: samples=${l.samples} meanDensity=${l.meanDensity} ownRopeEver=${l.ownRopeEver} closed=${l.closedToRounds}`);
}
for (const nm of Object.keys(R3.conspiracy)) for (const rl of Object.keys(R3.conspiracy[nm])) {
  const c = R3.conspiracy[nm][rl];
  console.log(`R3d conspiracy ${nm} [${rl}]: samples=${c.samples} clash=${c.clash} uninvolvedSignal=${c.uninvolvedSignal} fullySilent=${c.fullySilent} healed=${c.healedByteEqual} closed=${c.stillClosed} densityAfter=${c.postTradeClashDensity}`);
}
console.log(`R5 determinism: ${R5.sameSeedByteIdentical ? 'byte-identical' : 'DIVERGED'} over ${R5.traceHashCount} hashes; prngSeedsDiffer=${R5.prngSeedsDiffer}`);
console.log(`chain: ${vMem.ok ? 'ok' : 'BROKEN'} in-memory, ${vFile.ok ? 'ok' : 'BROKEN'} from re-read file; ${sealed.length} links; tip ${sealed[sealed.length - 1].row_hash}`);
console.log(`stone cross-check: ${stone && stone.ok ? 'ok' : JSON.stringify(stone)}`);
console.log(allPass ? 'E-RS1 FINAL: PASS' : 'E-RS1 FINAL: ' + JSON.stringify(verdicts));
