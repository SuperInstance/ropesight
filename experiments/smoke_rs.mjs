// smoke_rs — audit smoke for the E-RS1 ropesight run (written by main after the 26-c lane died
// post-run: chain + outputs complete; this file was the missing piece).
import { readFileSync } from 'fs';

let ok = 0, total = 0;
const check = (name, cond) => { total++; cond ? (ok++, console.log(`  ✓ ${name}`)) : console.log(`  ✗ ${name}`); };

// (1) chain verifies under the repo's own fleet semantics (experiments/receipts.mjs)
const { verifyChain } = await import(new URL('./receipts.mjs', import.meta.url));
const rows = readFileSync(new URL('./outputs/receipts_e_rs1.jsonl', import.meta.url), 'utf8').trim().split('\n').map(JSON.parse);
const v = verifyChain(rows);
check(`receipt chain seals + verifies (${rows.length} rows, repo verifier)`, v && v.ok === true && rows.length === 10);

// (2) R2 the "height" conservation — uniform cover on every method, re-checked from the summary
const sum = JSON.parse(readFileSync(new URL('./outputs/e_rs1_summary.json', import.meta.url), 'utf8'));
const courses = sum.R2?.courses ?? [];
check(`R2 cover uniform on all ${courses.length} methods`, courses.length >= 3 && courses.every(c => c.coverUniform === true && c.coverVal === c.promisedPerBell));

// (3) R3 the ropesight numbers
const r3 = sum.R3 ?? {};
check('R3 honest band: zero false alarms', r3.honest?.falseAlarmRate === 0 && r3.honest?.clashBits === 0);
const dev = r3.deviator?.['Plain Bob Minor']?.['method-pos'];
check('R3 deviator: partner-clash detection at latency 0 (all samples)', dev && dev.clashAtStroke === dev.samples && dev.latency0 === dev.samples);
check('R3 deviator: deviation does NOT self-heal (persistFraction 1, closedToRounds 0)', dev && dev.persistFraction === 1 && dev.closedToRounds === 0);

// (4) R5 determinism
check('R5 same-seed byte-identical', sum.R5?.sameSeedByteIdentical === true);

console.log(total && ok === total ? `SMOKE RS OK (${ok}/${total} checks)` : `SMOKE RS FAILED (${ok}/${total} checks)`);
process.exit(ok === total ? 0 : 1);
