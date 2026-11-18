import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MatchingQuestion } from '../../../types/quiz';
import { RotateCcw } from 'lucide-react';

export interface MatchingRendererProps {
  question: MatchingQuestion;
  value: Record<string, string> | undefined;
  onChange: (val: Record<string, string>) => void;
  disabled?: boolean;
}

interface PairTheme {
  stroke: string;
  dot: string;
  ring: string;
  cardLight: string;
  cardDark: string;
  badge: string;
}

const PAIR_THEMES: PairTheme[] = [
  {
    stroke: '#3b82f6',
    dot: 'bg-blue-500 border-blue-200 dark:border-blue-300',
    ring: 'ring-2 ring-blue-400/70',
    cardLight: 'border-blue-500 bg-[#eff6ff] text-slate-900',
    cardDark: 'dark:border-blue-400 dark:bg-[#112247] dark:text-slate-100',
    badge: 'bg-blue-600 text-white',
  },
];

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getShuffledDefinitions(question: MatchingQuestion): string[] {
  const defs = question.pairs.map((p) => p.definition);
  if (defs.length <= 1) return defs;

  const arr = [...defs];
  let seed = hashSeed(question.id || defs.join('|'));
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Ensure a clean visual derangement when possible so pairs do not line up straight across
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === defs[i]) {
      const swapIdx = (i + 1) % arr.length;
      [arr[i], arr[swapIdx]] = [arr[swapIdx], arr[i]];
    }
  }
  return arr;
}

interface LineCoord {
  term: string;
  def: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

interface ActiveDragState {
  side: 'term' | 'def';
  value: string;
  startX: number;
  startY: number;
  dotX: number;
  dotY: number;
  color: string;
}

const EMPTY_MATCHES: Record<string, string> = {};

export const MatchingRenderer: React.FC<MatchingRendererProps> = ({
  question,
  value = EMPTY_MATCHES,
  onChange,
  disabled = false,
}) => {
  const safeValue = value ?? EMPTY_MATCHES;
  const shuffledDefinitions = useMemo(
    () => getShuffledDefinitions(question),
    [question]
  );

  const boardRef = useRef<HTMLDivElement | null>(null);
  const termDotRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const defDotRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const [selectedSource, setSelectedSource] = useState<{
    side: 'term' | 'def';
    value: string;
  } | null>(null);

  const [previewLine, setPreviewLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
  } | null>(null);

  const [lines, setLines] = useState<LineCoord[]>([]);

  const dragRef = useRef<ActiveDragState | null>(null);
  const didDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);

  // Reset transient selection when changing question
  useEffect(() => {
    setSelectedSource(null);
    setPreviewLine(null);
    dragRef.current = null;
    didDragRef.current = false;
  }, [question.id]);

  // Reverse lookup: definition -> matched term index & term
  const matchByDef = useMemo(() => {
    const map: Record<string, { term: string; termIdx: number }> = {};
    question.pairs.forEach((pair, idx) => {
      const matchedDef = safeValue[pair.term];
      if (matchedDef) {
        map[matchedDef] = { term: pair.term, termIdx: idx };
      }
    });
    return map;
  }, [question.pairs, safeValue]);

  const matchedCount = useMemo(
    () => question.pairs.filter((p) => Boolean(safeValue[p.term])).length,
    [question.pairs, safeValue]
  );

  const assignPair = (term: string, definition: string) => {
    if (disabled) return;
    const updated: Record<string, string> = {};
    for (const [k, v] of Object.entries(safeValue)) {
      if (v && v !== definition && k !== term) {
        updated[k] = v;
      }
    }
    updated[term] = definition;
    onChange(updated);
  };

  const removePair = (term: string) => {
    if (disabled) return;
    const updated = { ...safeValue };
    delete updated[term];
    onChange(updated);
  };

  const handleReset = () => {
    if (disabled) return;
    setSelectedSource(null);
    setPreviewLine(null);
    onChange({});
  };

  const getDotCenter = (el: HTMLElement | null): { x: number; y: number } | null => {
    const board = boardRef.current;
    if (!board || !el) return null;
    const br = board.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return {
      x: er.left - br.left + er.width / 2,
      y: er.top - br.top + er.height / 2,
    };
  };

  const recomputeLines = () => {
    const board = boardRef.current;
    if (!board) return;
    const nextLines: LineCoord[] = [];
    question.pairs.forEach((pair, idx) => {
      const def = safeValue[pair.term];
      if (!def) return;
      const p1 = getDotCenter(termDotRefs.current[pair.term] || null);
      const p2 = getDotCenter(defDotRefs.current[def] || null);
      if (p1 && p2) {
        const theme = PAIR_THEMES[idx % PAIR_THEMES.length];
        nextLines.push({
          term: pair.term,
          def,
          x1: p1.x,
          y1: p1.y,
          x2: p2.x,
          y2: p2.y,
          color: theme.stroke,
        });
      }
    });
    setLines((prev) => {
      if (
        prev.length === nextLines.length &&
        prev.every(
          (l, i) =>
            l.term === nextLines[i].term &&
            l.def === nextLines[i].def &&
            Math.abs(l.x1 - nextLines[i].x1) < 0.5 &&
            Math.abs(l.y1 - nextLines[i].y1) < 0.5 &&
            Math.abs(l.x2 - nextLines[i].x2) < 0.5 &&
            Math.abs(l.y2 - nextLines[i].y2) < 0.5
        )
      ) {
        return prev;
      }
      return nextLines;
    });
  };

  useLayoutEffect(() => {
    recomputeLines();
    const board = boardRef.current;
    if (!board) return;

    const ro = new ResizeObserver(() => {
      recomputeLines();
    });
    ro.observe(board);
    const raf = requestAnimationFrame(recomputeLines);
    window.addEventListener('resize', recomputeLines);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', recomputeLines);
    };
  }, [safeValue, question.id, shuffledDefinitions]);

  // Global pointer listeners for drag-to-connect & live click-preview line
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const board = boardRef.current;
      if (!board) return;
      const br = board.getBoundingClientRect();

      if (dragRef.current) {
        const dist = Math.hypot(
          e.clientX - dragRef.current.startX,
          e.clientY - dragRef.current.startY
        );
        if (dist > 6) {
          didDragRef.current = true;
          setPreviewLine({
            x1: dragRef.current.dotX,
            y1: dragRef.current.dotY,
            x2: e.clientX - br.left,
            y2: e.clientY - br.top,
            color: dragRef.current.color,
          });
        }
        return;
      }

      if (selectedSource) {
        const dotEl =
          selectedSource.side === 'term'
            ? termDotRefs.current[selectedSource.value]
            : defDotRefs.current[selectedSource.value];
        const p = getDotCenter(dotEl || null);
        if (
          p &&
          e.clientX >= br.left &&
          e.clientX <= br.right &&
          e.clientY >= br.top &&
          e.clientY <= br.bottom
        ) {
          const termIdx =
            selectedSource.side === 'term'
              ? question.pairs.findIndex((item) => item.term === selectedSource.value)
              : matchByDef[selectedSource.value]?.termIdx ?? 0;
          const color = PAIR_THEMES[Math.max(0, termIdx) % PAIR_THEMES.length].stroke;
          setPreviewLine({
            x1: p.x,
            y1: p.y,
            x2: e.clientX - br.left,
            y2: e.clientY - br.top,
            color,
          });
        } else {
          setPreviewLine(null);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const wasDragged = didDragRef.current;
      dragRef.current = null;
      didDragRef.current = false;

      if (wasDragged) {
        suppressNextClickRef.current = true;
        setPreviewLine(null);
        const target = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest('[data-match-side]') as HTMLElement | null;

        if (target) {
          const targetSide = target.dataset.matchSide as 'term' | 'def' | undefined;
          const targetVal = target.dataset.matchValue;
          if (targetSide && targetVal && targetSide !== drag.side) {
            if (drag.side === 'term') {
              assignPair(drag.value, targetVal);
            } else {
              assignPair(targetVal, drag.value);
            }
            setSelectedSource(null);
          }
        }
        setTimeout(() => {
          suppressNextClickRef.current = false;
        }, 50);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [selectedSource, safeValue, question.pairs, matchByDef, disabled]);

  const startDrag = (
    e: React.PointerEvent,
    side: 'term' | 'def',
    itemValue: string,
    color: string
  ) => {
    if (disabled || e.button !== 0) return;
    const dotEl =
      side === 'term'
        ? termDotRefs.current[itemValue]
        : defDotRefs.current[itemValue];
    const center = getDotCenter(dotEl || null);
    if (!center) return;
    didDragRef.current = false;
    dragRef.current = {
      side,
      value: itemValue,
      startX: e.clientX,
      startY: e.clientY,
      dotX: center.x,
      dotY: center.y,
      color,
    };
  };

  const handleTermClick = (term: string) => {
    if (disabled || suppressNextClickRef.current) return;
    if (selectedSource?.side === 'def') {
      if (safeValue[term] === selectedSource.value) {
        removePair(term);
      } else {
        assignPair(term, selectedSource.value);
      }
      setSelectedSource(null);
      setPreviewLine(null);
      return;
    }

    if (selectedSource?.side === 'term' && selectedSource.value === term) {
      if (safeValue[term]) {
        removePair(term);
      }
      setSelectedSource(null);
      setPreviewLine(null);
      return;
    }

    setSelectedSource({ side: 'term', value: term });
  };

  const handleDefClick = (def: string) => {
    if (disabled || suppressNextClickRef.current) return;
    if (selectedSource?.side === 'term') {
      if (safeValue[selectedSource.value] === def) {
        removePair(selectedSource.value);
      } else {
        assignPair(selectedSource.value, def);
      }
      setSelectedSource(null);
      setPreviewLine(null);
      return;
    }

    if (selectedSource?.side === 'def' && selectedSource.value === def) {
      const existing = matchByDef[def];
      if (existing) {
        removePair(existing.term);
      }
      setSelectedSource(null);
      setPreviewLine(null);
      return;
    }

    setSelectedSource({ side: 'def', value: def });
  };

  const buildBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1);
    const offset = Math.max(36, dx * 0.45);
    const dir = x2 >= x1 ? 1 : -1;
    return `M ${x1} ${y1} C ${x1 + offset * dir} ${y1}, ${x2 - offset * dir} ${y2}, ${x2} ${y2}`;
  };

  const assignedDefinitions = useMemo(
    () => Object.values(safeValue).filter(Boolean),
    [safeValue]
  );

  const handleMobileSelect = (term: string, definition: string) => {
    if (disabled) return;
    if (!definition) {
      removePair(term);
      return;
    }
    assignPair(term, definition);
  };

  return (
    <div className="space-y-2.5 select-none">
      {/* Header Instructions & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="md:hidden">
          Select the exact matching definition for each IT term:
        </span>
        <span className="hidden md:inline">
          Click or drag a line from each term on the left to its matching definition on the right:
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {matchedCount} / {question.pairs.length} Matched
          </span>
          {matchedCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              disabled={disabled}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="md:hidden">Reset Matches</span>
              <span className="hidden md:inline">Reset Lines</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Matching Layout (< md) */}
      <div data-testid="matching-mobile-dropdowns" className="md:hidden space-y-2">
        {question.pairs.map((pair, idx) => {
          const currentMatch = safeValue[pair.term] || '';
          const isMatched = Boolean(currentMatch);

          return (
            <div
              key={pair.term}
              className={`p-2.5 rounded-xl border-2 transition-all flex flex-col gap-2 ${
                isMatched
                  ? 'border-blue-500 bg-[#eff6ff] dark:border-blue-400 dark:bg-[#112247]'
                  : 'border-slate-200 bg-[#ffffff] dark:border-slate-700/90 dark:bg-slate-900/90'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                    isMatched
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                  {pair.term}
                </span>
              </div>

              <select
                disabled={disabled}
                value={currentMatch}
                onChange={(e) => handleMobileSelect(pair.term, e.target.value)}
                className="w-full p-2.5 bg-[#ffffff] dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                aria-label={`Match definition for ${pair.term}`}
              >
                <option value="">-- Choose matching definition --</option>
                {shuffledDefinitions.map((def, dIdx) => {
                  const isAlreadyChosen =
                    assignedDefinitions.includes(def) && currentMatch !== def;

                  return (
                    <option key={dIdx} value={def} disabled={isAlreadyChosen}>
                      {def} {isAlreadyChosen ? '(Assigned)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>

      {/* Laptop / Desktop Matching Board with SVG Lines (md+) */}
      <div
        ref={boardRef}
        data-testid="matching-board"
        data-match-line-count={lines.length}
        onMouseLeave={() => {
          if (!dragRef.current) setPreviewLine(null);
        }}
        className="relative hidden md:block"
      >
        {/* SVG Overlay for Connecting Lines */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        >
          {lines.map((line) => {
            const d = buildBezierPath(line.x1, line.y1, line.x2, line.y2);
            return (
              <g key={line.term}>
                <path
                  d={d}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={7}
                  strokeOpacity={0.18}
                  strokeLinecap="round"
                />
                <path
                  d={d}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <circle cx={line.x1} cy={line.y1} r={4.5} fill={line.color} />
                <circle cx={line.x2} cy={line.y2} r={4.5} fill={line.color} />
              </g>
            );
          })}

          {previewLine && (
            <g>
              <path
                d={buildBezierPath(
                  previewLine.x1,
                  previewLine.y1,
                  previewLine.x2,
                  previewLine.y2
                )}
                fill="none"
                stroke={previewLine.color}
                strokeWidth={2.5}
                strokeDasharray="6 5"
                strokeLinecap="round"
                strokeOpacity={0.85}
              />
              <circle
                cx={previewLine.x1}
                cy={previewLine.y1}
                r={4.5}
                fill={previewLine.color}
              />
              <circle
                cx={previewLine.x2}
                cy={previewLine.y2}
                r={4}
                fill={previewLine.color}
                fillOpacity={0.75}
              />
            </g>
          )}
        </svg>

        {/* Two Columns: Terms (Left) & Definitions (Right) */}
        <div className="grid grid-cols-2 gap-x-8 sm:gap-x-16 md:gap-x-24 items-stretch">
          {/* Left Column: Terms */}
          <div className="flex flex-col justify-between gap-2">
            {question.pairs.map((pair, idx) => {
              const theme = PAIR_THEMES[idx % PAIR_THEMES.length];
              const isMatched = Boolean(safeValue[pair.term]);
              const isSelected =
                selectedSource?.side === 'term' && selectedSource.value === pair.term;

              const matchedDefIdx = isMatched
                ? shuffledDefinitions.indexOf(safeValue[pair.term])
                : -1;
              const matchedLetter =
                matchedDefIdx >= 0 ? String.fromCharCode(65 + matchedDefIdx) : null;

              return (
                <button
                  key={pair.term}
                  type="button"
                  disabled={disabled}
                  data-match-side="term"
                  data-match-value={pair.term}
                  onPointerDown={(e) => startDrag(e, 'term', pair.term, theme.stroke)}
                  onClick={() => handleTermClick(pair.term)}
                  aria-label={`Term ${idx + 1}: ${pair.term}`}
                  aria-pressed={isSelected}
                  className={`relative z-20 w-full flex-1 px-3 py-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-2 cursor-pointer touch-none ${
                    isSelected
                      ? `${theme.cardLight} ${theme.cardDark} ${theme.ring}`
                      : isMatched
                      ? `${theme.cardLight} ${theme.cardDark}`
                      : 'border-slate-200 bg-[#ffffff] hover:border-blue-300 text-slate-900 dark:border-slate-700/90 dark:bg-slate-900/90 dark:hover:border-sky-400/70 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isMatched || isSelected
                          ? theme.badge
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm leading-snug">
                      {pair.term}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {matchedLetter && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-900/10 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                        {matchedLetter}
                      </span>
                    )}
                    <span
                      ref={(el) => {
                        termDotRefs.current[pair.term] = el;
                      }}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-transform ${
                        isMatched || isSelected
                          ? `${theme.dot} scale-110`
                          : 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-500'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Shuffled Definitions */}
          <div className="flex flex-col justify-between gap-2">
            {shuffledDefinitions.map((def, dIdx) => {
              const letter = String.fromCharCode(65 + dIdx);
              const matchedInfo = matchByDef[def];
              const isMatched = Boolean(matchedInfo);
              const isSelected =
                selectedSource?.side === 'def' && selectedSource.value === def;
              const activeTheme = matchedInfo
                ? PAIR_THEMES[matchedInfo.termIdx % PAIR_THEMES.length]
                : selectedSource?.side === 'term'
                ? PAIR_THEMES[
                    Math.max(
                      0,
                      question.pairs.findIndex((p) => p.term === selectedSource.value)
                    ) % PAIR_THEMES.length
                  ]
                : PAIR_THEMES[0];

              return (
                <button
                  key={def}
                  type="button"
                  disabled={disabled}
                  data-match-side="def"
                  data-match-value={def}
                  onPointerDown={(e) => startDrag(e, 'def', def, activeTheme.stroke)}
                  onClick={() => handleDefClick(def)}
                  aria-label={`Definition ${letter}: ${def}`}
                  aria-pressed={isSelected}
                  className={`relative z-20 w-full flex-1 px-3 py-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer touch-none ${
                    isSelected
                      ? `${activeTheme.cardLight} ${activeTheme.cardDark} ${activeTheme.ring}`
                      : isMatched
                      ? `${activeTheme.cardLight} ${activeTheme.cardDark}`
                      : 'border-slate-200 bg-[#ffffff] hover:border-blue-300 text-slate-700 dark:border-slate-700/90 dark:bg-slate-900/90 dark:hover:border-sky-400/70 dark:text-slate-200'
                  }`}
                >
                  <span
                    ref={(el) => {
                      defDotRefs.current[def] = el;
                    }}
                    className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-transform ${
                      isMatched || isSelected
                        ? `${activeTheme.dot} scale-110`
                        : 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-500'
                    }`}
                  />
                  <span
                    className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isMatched || isSelected
                        ? activeTheme.badge
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-xs sm:text-[13px] font-medium leading-snug">
                    {def}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

