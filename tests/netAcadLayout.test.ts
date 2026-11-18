import test from 'node:test';
import assert from 'node:assert/strict';
import { getModuleNavSummary, shouldDefaultCollapseSidebar } from '../src/utils/netAcadLayout';

test('getModuleNavSummary formats module label and prev/next flags', () => {
  const modules = [
    { moduleNumber: 1, title: 'Module 1: Single-Area OSPFv2 Concepts' },
    { moduleNumber: 2, title: 'Module 2: Single-Area OSPFv2 Configuration' },
    { moduleNumber: 3, title: 'Module 3: Network Security Concepts' },
  ];

  const first = getModuleNavSummary(modules, 0);
  assert.equal(first.currentNumber, 1);
  assert.equal(first.totalCount, 3);
  assert.equal(first.canGoPrev, false);
  assert.equal(first.canGoNext, true);
  assert.equal(first.shortLabel, 'Mod 1: Single-Area OSPFv2 Concepts');

  const last = getModuleNavSummary(modules, 2);
  assert.equal(last.currentNumber, 3);
  assert.equal(last.canGoPrev, true);
  assert.equal(last.canGoNext, false);
});

test('getModuleNavSummary handles empty module list safely', () => {
  const empty = getModuleNavSummary([], 0);
  assert.equal(empty.totalCount, 0);
  assert.equal(empty.canGoPrev, false);
  assert.equal(empty.canGoNext, false);
});

test('shouldDefaultCollapseSidebar collapses on phone/tablet and keeps open on desktop', () => {
  assert.equal(shouldDefaultCollapseSidebar(390), true);
  assert.equal(shouldDefaultCollapseSidebar(768), true);
  assert.equal(shouldDefaultCollapseSidebar(1024), false);
  assert.equal(shouldDefaultCollapseSidebar(1440), false);
});
