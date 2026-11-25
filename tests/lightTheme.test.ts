import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [sr, sg, sb] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
}

function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminance(hexToRgb(fgHex));
  const l2 = relativeLuminance(hexToRgb(bgHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const cssPath = path.resolve(process.cwd(), 'src/index.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

test('src/index.css defines centralized light mode CSS custom properties matching specification', () => {
  const lightSectionStart = cssContent.indexOf('html[data-theme="light"] {');
  const darkSectionStart = cssContent.indexOf('html.dark,\nhtml[data-theme="dark"] {');
  assert.ok(lightSectionStart !== -1, 'Light theme token block should exist');
  assert.ok(darkSectionStart > lightSectionStart, 'Dark theme block should follow light theme block');

  const lightBlock = cssContent.slice(lightSectionStart, darkSectionStart);
  const expectedTokens = [
    '--bg: #F3F4FA;',
    '--surface: #FAFAFE;',
    '--surface-raised: #ECEEF8;',
    '--border: #DDE0EE;',
    '--text: #1F2340;',
    '--text-muted: #5A5F80;',
    '--accent: #6C63D9;',
  ];

  for (const token of expectedTokens) {
    assert.ok(lightBlock.includes(token), `Light mode block must define ${token}`);
  }

  assert.ok(
    lightBlock.includes('rgba(60, 60, 120, 0.08)'),
    'Light mode must use soft indigo-tinted shadows',
  );
  assert.ok(
    cssContent.includes('transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;'),
    'Smooth ~0.25s theme transition should be defined',
  );
  assert.ok(
    cssContent.includes('@media (prefers-reduced-motion: reduce)'),
    'prefers-reduced-motion should disable theme transitions',
  );
});

test('Light mode palette achieves WCAG AA (>= 4.5:1) and AAA body (>= 7:1) contrast', () => {
  const bg = '#F3F4FA';
  const surface = '#FAFAFE';
  const surfaceRaised = '#ECEEF8';
  const text = '#1F2340';
  const textMuted = '#5A5F80';
  const accent = '#6C63D9';
  const accentInk = '#564DC4';

  // Primary body/heading text >= 7:1 across all light surfaces
  for (const s of [bg, surface, surfaceRaised]) {
    const ratio = contrastRatio(text, s);
    assert.ok(ratio >= 7.0, `--text on ${s} contrast ${ratio.toFixed(2)} should be >= 7.0`);
  }

  // Muted text >= 4.5:1 across all light surfaces
  for (const s of [bg, surface, surfaceRaised]) {
    const ratio = contrastRatio(textMuted, s);
    assert.ok(ratio >= 4.5, `--text-muted on ${s} contrast ${ratio.toFixed(2)} should be >= 4.5`);
  }

  // Accent foreground & button contrast >= 4.5:1
  assert.ok(contrastRatio(surface, accent) >= 4.5, 'White/surface text on --accent must be >= 4.5:1');
  assert.ok(contrastRatio(accent, surface) >= 4.5, '--accent on --surface must be >= 4.5:1');
  for (const s of [bg, surface, surfaceRaised]) {
    const ratio = contrastRatio(accentInk, s);
    assert.ok(ratio >= 4.5, `--accent-ink on ${s} contrast ${ratio.toFixed(2)} should be >= 4.5`);
  }

  // Track accent text tokens >= 4.5:1 across light surfaces
  for (const trackAccent of ['#2B44B8', '#6025C0', '#047857']) {
    for (const s of [bg, surface, surfaceRaised]) {
      const ratio = contrastRatio(trackAccent, s);
      assert.ok(ratio >= 4.5, `Track accent ${trackAccent} on ${s} (${ratio.toFixed(2)}) must be >= 4.5`);
    }
  }
});

test('Dark mode tokens and overrides remain intact and unaltered', () => {
  const darkStart = cssContent.indexOf('html.dark,\nhtml[data-theme="dark"] {');
  assert.ok(darkStart !== -1);
  const darkBlock = cssContent.slice(darkStart, darkStart + 2500);
  for (const token of ['--bg: #070c18;', '--surface: #0f172a;', '--text: #f8fafc;', '--accent: #38bdf8;']) {
    assert.ok(darkBlock.includes(token), `Dark mode must preserve ${token}`);
  }
});

test('Core UI components use --surface tokens instead of hardcoded pure white backgrounds', () => {
  const filesToCheck = [
    'src/components/shared/Card.tsx',
    'src/components/layout/Sidebar.tsx',
    'src/components/layout/Topbar.tsx',
    'src/components/luni/LuniAssistantPanel.tsx',
    'src/components/compare/CompareMatrixBox.tsx',
    'src/components/quiz/types/TrueFalseRenderer.tsx',
    'src/components/quiz/types/MultipleChoiceRenderer.tsx',
    'src/components/shared/UniversityCrests.tsx',
  ];

  for (const relPath of filesToCheck) {
    const content = fs.readFileSync(path.resolve(process.cwd(), relPath), 'utf-8');
    assert.ok(
      !/\bbg-white(?![-/])/.test(content),
      `${relPath} should not contain bare bg-white in light mode`,
    );
  }

  const crests = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/shared/UniversityCrests.tsx'),
    'utf-8',
  );
  assert.ok(
    crests.includes('mix-blend-multiply'),
    'University crests should blend out white backgrounds in light mode',
  );
});
