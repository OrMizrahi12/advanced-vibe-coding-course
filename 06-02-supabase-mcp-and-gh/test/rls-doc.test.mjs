import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('docs/rls-remediation.sql enables RLS and defines a policy', () => {
  const sql = readFileSync(resolve('docs/rls-remediation.sql'), 'utf8');
  assert.match(sql, /ENABLE ROW LEVEL SECURITY/i);
  assert.match(sql, /CREATE POLICY/i);
});
