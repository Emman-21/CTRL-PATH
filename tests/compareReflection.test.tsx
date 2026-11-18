import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompareReflectionCard } from '../src/components/compare/CompareReflectionCard';

test('CompareReflectionCard includes dark mode gradient, border, textarea, and button classes while preserving light mode', () => {
  const html = renderToStaticMarkup(
    <CompareReflectionCard
      code="NT"
      values={{ interests: 'Routing', topicsToLearn: 'VLANs', questions: 'Labs?' }}
      saved={true}
      onChange={() => {}}
      onSave={() => {}}
    />,
  );

  assert.ok(html.includes('My Reflection: NT'));
  assert.ok(html.includes('from-white to-slate-50/60'));
  assert.ok(html.includes('dark:from-[#0f172a] dark:to-[#0d1526]'));
  assert.ok(html.includes('dark:border-slate-800!'));
  assert.ok(html.includes('dark:bg-[#0a0f1d]'));
  assert.ok(html.includes('dark:bg-[#131d33]!'));
  assert.ok(html.includes('dark:text-emerald-400'));
});
