// smoke_rs.mjs — ropesight's own checks (separate from the generated smoke.mjs,
// which is the seedbox's charter receipt and is never edited here).
// Run: node smoke_rs.mjs
import { existsSync, readFileSync } from 'node:fs';
import {
  identity, rounds, compose, applyChange, inverse, order, makeChange,
  applyTokenToPos, METHODS, plainCourseTokens, courseFacts, courseTokens,
  personalLine, lineOverRows, walkCourse, traceDigest, rowString,
} from './bells/methods.mjs';
import { runRota } from './bells/rota.mjs';
import { fnv1a64, rowHash, sealChain, verifyChain } from './experiments/receipts.mjs';

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; console.log('  \u2713 ' + name); } else { fail++; console.log('  \u2717 ' + name); } };

// ── algebra ──────────────────────────────────────────────────────────────────
ok(fnv1a64('') === '0xcbf29ce484222325', 'fnv1a64 of empty string is the FNV basis');
ok(rowHash({}, 'G') === fnv1a64(['G', {}]), 'rowHash = fnv1a64([prev, rest]) fleet idiom');
ok(rounds(6).every((b, i) => b === i) && identity(6).every((b, i) => b === i), 'rounds == identity row');
{
  const a = makeChange(6, 'x'), b = makeChange(6, '16'), c = makeChange(6, '12');
  const l = compose(compose(a, b), c), r = compose(a, compose(b, c));
  ok(l.every((v, i) => v === r[i]), 'composition is associative (6 bells sample)');
  const row = rounds(6);
  const back = applyChange(applyChange(row, a), inverse(a));
  ok(back.every((v, i) => v === row[i]), 'inverse round-trips to the same row');
  ok(order(a) === 2 && order(b) === 2, 'cross and place changes are involutions');
}
ok((() => { try { makeChange(5, 'x'); return false; } catch { return true; } })(), "'x' rejected on odd stages");
ok((() => { try { makeChange(3, '12'); return false; } catch { return true; } })(), "'12' rejected on 3 bells (leaves 3rd unpaired)");
ok((() => { try { makeChange(6, '9'); return false; } catch { return true; } })(), "out-of-range place rejected");

// ── methods (seed L45/L53) ───────────────────────────────────────────────────
const EXPECT = { 'Extent on Three': 6, 'Plain Bob Doubles': 40, 'Plain Bob Minor': 60, 'Plain Bob Triples': 84, 'Plain Bob Major': 112 };
const LE1 = { 'Extent on Three': '123', 'Plain Bob Doubles': '13524', 'Plain Bob Minor': '135264', 'Plain Bob Triples': '1352746', 'Plain Bob Major': '13527486' };
for (const nm of Object.keys(METHODS)) {
  const f = courseFacts(nm);
  ok(f.period === EXPECT[nm] && f.distinct && f.closed, `${nm}: period ${f.period} to rounds, true course, closes`);
  ok(f.maxMove === 1, `${nm}: no bell moves more than one place (seed L49)`);
  ok(f.coverUniform && f.coverVal === f.period / f.stage, `${nm}: conserved cover ${f.coverVal} = period/n (seed L5 height)`);
  ok(rowString(f.halfLead) === rowString(Array.from({ length: f.stage }, (_, i) => f.stage - 1 - i)), `${nm}: half-lead is backrounds`);
  ok(rowString(f.leadEnd1) === LE1[nm], `${nm}: first lead end ${LE1[nm]}`);
}
{
  const toks = plainCourseTokens('Plain Bob Minor');
  let maxLocal = 0;
  for (const c of toks) for (let p = 0; p < 6; p++) maxLocal = Math.max(maxLocal, Math.abs(applyTokenToPos(c, p) - p));
  ok(maxLocal === 1, 'local rule applyTokenToPos: every per-bell move <= 1 place');
}

// ── ropesight: blinded local rules == global permutation application ─────────
for (const rule of ['method-pos', 'line']) {
  for (const nm of Object.keys(METHODS)) {
    const n = METHODS[nm].stage;
    const toks = plainCourseTokens(nm);
    const mrows = walkCourse(toks, n).rows;
    const opts = { n, tokens: toks, methodRows: mrows, rule };
    if (rule === 'line') opts.lines = Array.from({ length: n }, (_, b) => lineOverRows(mrows, b));
    const r = runRota(opts);
    ok(r.byteIdentical && r.closed && r.wrongBellTotal === 0, `blinded band (${rule}) completes ${nm} byte-identically`);
    if (nm === 'Plain Bob Minor' && rule === 'method-pos') {
      const blind = r.lanes.every((l) => !Object.keys(l).some((k) => ['row', 'tower', 'strokes', 'lanes', 'methodRows'].includes(k)));
      ok(blind, 'structural blinding: lanes hold no row/tower reference');
    }
  }
}

// ── deviator + conspiracy (seed L21, The Tunnel L123) ────────────────────────
{
  const n = 6, nm = 'Plain Bob Minor';
  const toks = plainCourseTokens(nm);
  const mrows = walkCourse(toks, n).rows;
  const r = runRota({ n, tokens: toks, methodRows: mrows, deviations: [{ bell: 2, atStroke: 17, kind: 'near-up' }] });
  ok(r.strokes[17].clashed.length >= 2 && r.locals[2].clashStrokes.includes(17), 'deviator: clash at the deviation stroke (latency 0)');
  const partner = r.strokes[17].clashed.find((b) => b !== 2);
  ok(partner !== undefined && r.locals[partner].clashStrokes.includes(17), 'the displaced honest partner is notified at the same stroke');
  const rs = runRota({ n, tokens: toks, methodRows: mrows, deviations: [{ bell: 2, atStroke: 17, kind: 'stay' }] });
  ok(rs.locals[2].ownRopeAnomalies.filter((t) => t >= 17).length === 0, 'stay deviation is rope-silent to its owner (move = 0 is legal)');
  let farDone = false;
  for (let s = 0; s < toks.length && !farDone; s++) {
    const rf = runRota({ n, tokens: toks, methodRows: mrows, deviations: [{ bell: 2, atStroke: s, kind: 'far-up' }] });
    if (rf.lanes[2].deviation.vacuous) continue; // wrong transposition falls off the tower: no sample
    ok(rf.locals[2].ownRopeAnomalies.includes(s), `far deviation cracks: own-rope fires at the deviation stroke (s=${s})`);
    farDone = true;
  }
  if (!farDone) ok(false, 'far deviation cracks: no non-vacuous far-up sample found');
  const honest = runRota({ n, tokens: toks, methodRows: mrows });
  const alarms = Object.values(honest.locals).reduce((a, l) => a + l.clashStrokes.length + l.ownRopeAnomalies.length, 0);
  ok(alarms === 0, 'honest band: zero false alarms over a full course');
  const consp = runRota({ n, tokens: toks, methodRows: mrows, deviations: [{ bells: [1, 4], atStroke: 23, kind: 'conspiracy' }] });
  ok(consp.strokes[23].clashed.length === 0 && consp.strokes[23].gaps.length === 0 && consp.strokes[23].offMethod,
    'conspiracy (The Tunnel): valid row but wrong, no clash, no gap at the trade stroke');
}

// ── receipt chain ────────────────────────────────────────────────────────────
{
  const rows = [{ seq: 1, check: 'a' }, { seq: 2, check: 'b' }];
  sealChain(rows);
  ok(verifyChain(rows).ok, 'seal then verify passes');
  const tampered = JSON.parse(JSON.stringify(rows)); tampered[1].check = 'X';
  ok(!verifyChain(tampered).ok, 'tampering is caught');
  const p = new URL('./experiments/outputs/receipts_e_rs1.jsonl', import.meta.url);
  if (existsSync(p)) {
    const disk = readFileSync(p, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    ok(verifyChain(disk).ok, 'sealed receipts file on disk verifies');
  } else {
    ok(true, 'sealed receipts file on disk verifies (not yet generated — run e_rs1)');
  }
}

console.log(fail === 0 ? `SMOKE_RS OK (${pass}/${pass + fail} checks)` : `SMOKE_RS FAILED (${fail} of ${pass + fail} checks)`);
process.exit(fail === 0 ? 0 : 1);
