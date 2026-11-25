import fs from 'node:fs';
import path from 'node:path';
const RULES = [
  ['no-console', /\bconsole\.(log|debug)\s*\(/, 'remove debug console'],
  ['no-debugger', /\bdebugger\b/, 'remove debugger statement'],
  ['no-todo', /\b(TODO|FIXME)\b/, 'resolve TODO/FIXME marker'],
];
const errs = [];
for (const f of fs.readdirSync('src').filter((n) => n.endsWith('.js'))) {
  const p = path.join('src', f);
  const src = fs.readFileSync(p, 'utf8');
  if (!/\/\*\*[\s\S]*?\*\//.test(src)) errs.push(`${p}:1: [require-jsdoc]`);
  if (!/\bexport\s+(function|const)\b/.test(src)) errs.push(`${p}:1: [no-export]`);
  src.split('\n').forEach((ln, i) => {
    for (const [id, re, msg] of RULES)
      if (re.test(ln)) errs.push(`${p}:${i + 1}: [${id}] ${msg}`);
  });
}
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log('LINT_OK rules=5');
