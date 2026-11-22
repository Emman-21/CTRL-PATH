import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompareToolbar } from '../src/components/compare/CompareToolbar';

test('CompareToolbar renders track SVG logos inside each of the three track buttons', () => {
  const html = renderToStaticMarkup(
    <CompareToolbar
      selectedTracks={['NT', 'BA']}
      onToggleTrack={() => {}}
    />,
  );

  const svgMatches = html.match(/<svg /g) || [];
  assert.equal(svgMatches.length, 3);
  assert.ok(html.includes('Networking Technology'));
  assert.ok(html.includes('Business Analytics'));
  assert.ok(html.includes('Service Management'));
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('aria-pressed="false"'));
});
