export type DashboardLuniPoseAction = 'idle' | 'wave';

export const DASHBOARD_LUNI_IDLE_SHEET_URL =
  '/assets/aistudio/Gemini_Generated_Image_dss2yodss2yodss2_139493d3.jpg';
export const DASHBOARD_LUNI_WAVE_SHEET_URL =
  '/assets/aistudio/Gemini_Generated_Image_51sy7i51sy7i51sy_70f4a085.jpg';

export const DASHBOARD_LUNI_IDLE_GRID = {
  cols: 3,
  rows: 2,
  totalFrames: 6,
} as const;

export const DASHBOARD_LUNI_WAVE_GRID = {
  cols: 5,
  rows: 1,
  totalFrames: 5,
} as const;

export interface DashboardLuniSheetSpec {
  action: DashboardLuniPoseAction;
  url: string;
  cols: number;
  rows: number;
  totalFrames: number;
  cleanWhiteBg: boolean;
  cleanAura?: boolean;
}

export const DASHBOARD_LUNI_POSE_SHEETS: Record<DashboardLuniPoseAction, DashboardLuniSheetSpec> = {
  idle: {
    action: 'idle',
    url: DASHBOARD_LUNI_IDLE_SHEET_URL,
    cols: DASHBOARD_LUNI_IDLE_GRID.cols,
    rows: DASHBOARD_LUNI_IDLE_GRID.rows,
    totalFrames: DASHBOARD_LUNI_IDLE_GRID.totalFrames,
    cleanWhiteBg: true,
    cleanAura: false,
  },
  wave: {
    action: 'wave',
    url: DASHBOARD_LUNI_WAVE_SHEET_URL,
    cols: DASHBOARD_LUNI_WAVE_GRID.cols,
    rows: DASHBOARD_LUNI_WAVE_GRID.rows,
    totalFrames: DASHBOARD_LUNI_WAVE_GRID.totalFrames,
    cleanWhiteBg: true,
    cleanAura: false,
  },
};

export interface IdleKeyFrame {
  frameIndex: number;
  durationMs: number;
}

export const DASHBOARD_LUNI_IDLE_SEQUENCE: readonly IdleKeyFrame[] = [
  { frameIndex: 0, durationMs: 1600 },
  { frameIndex: 1, durationMs: 750 },
  { frameIndex: 2, durationMs: 280 }, // happy ^ ^ blink
  { frameIndex: 1, durationMs: 480 },
  { frameIndex: 3, durationMs: 1150 },
  { frameIndex: 4, durationMs: 950 },
  { frameIndex: 5, durationMs: 1150 },
];

export const DASHBOARD_LUNI_WAVE_SEQUENCE: readonly IdleKeyFrame[] = [
  { frameIndex: 0, durationMs: 140 },
  { frameIndex: 1, durationMs: 210 },
  { frameIndex: 2, durationMs: 380 }, // cheerful ^ ^ wave
  { frameIndex: 1, durationMs: 220 },
  { frameIndex: 2, durationMs: 400 }, // second wave beat
  { frameIndex: 3, durationMs: 280 },
  { frameIndex: 4, durationMs: 440 }, // gentle sparkle finish
];

export interface SpriteCellRect {
  index: number;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  anchorX: number;
  bottomY: number;
}

export interface SpriteDrawPlacement {
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

export function getIdleCellRects(
  sheetWidth: number,
  sheetHeight: number,
  cols: number = DASHBOARD_LUNI_IDLE_GRID.cols,
  rows: number = DASHBOARD_LUNI_IDLE_GRID.rows
): SpriteCellRect[] {
  const rects: SpriteCellRect[] = [];

  for (let row = 0; row < rows; row++) {
    const y0 = Math.round((row * sheetHeight) / rows);
    const y1 = Math.round(((row + 1) * sheetHeight) / rows);
    for (let col = 0; col < cols; col++) {
      const x0 = Math.round((col * sheetWidth) / cols);
      const x1 = Math.round(((col + 1) * sheetWidth) / cols);
      rects.push({
        index: row * cols + col,
        col,
        row,
        x: x0,
        y: y0,
        width: x1 - x0,
        height: y1 - y0,
      });
    }
  }

  return rects;
}

export function isNearWhiteBackground(r: number, g: number, b: number): boolean {
  const minChannel = Math.min(r, g, b);
  const maxChannel = Math.max(r, g, b);
  return minChannel >= 228 && maxChannel - minChannel <= 22;
}

export function removeExteriorWhiteBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number
): void {
  const total = width * height;
  if (total === 0) return;

  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const tryEnqueue = (x: number, y: number) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (data[p + 3] <= 24 || isNearWhiteBackground(data[p], data[p + 1], data[p + 2])) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0);
    if (height > 1) tryEnqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    tryEnqueue(0, y);
    if (width > 1) tryEnqueue(width - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx - x) / width;

    if (x > 0) tryEnqueue(x - 1, y);
    if (x + 1 < width) tryEnqueue(x + 1, y);
    if (y > 0) tryEnqueue(x, y - 1);
    if (y + 1 < height) tryEnqueue(x, y + 1);
  }

  for (let i = 0; i < total; i++) {
    if (visited[i]) {
      data[i * 4 + 3] = 0;
    }
  }

  // Softly clean 1px JPEG/PNG anti-aliasing white fringe touching cleared exterior pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;

      const touchesBg =
        (x > 0 && visited[idx - 1] === 1) ||
        (x + 1 < width && visited[idx + 1] === 1) ||
        (y > 0 && visited[idx - width] === 1) ||
        (y + 1 < height && visited[idx + width] === 1);

      if (!touchesBg) continue;

      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const minChannel = Math.min(r, g, b);
      const maxChannel = Math.max(r, g, b);

      if (minChannel >= 185 && maxChannel - minChannel <= 32) {
        data[p + 3] = 0;
      } else if (minChannel >= 145 && maxChannel - minChannel <= 36) {
        const whiteness = (minChannel - 145) / 40;
        data[p + 3] = Math.max(0, Math.round(data[p + 3] * (1 - whiteness * 0.8)));
      }
    }
  }
}

export function isTrueDarkOutline(r: number, g: number, b: number, a: number): boolean {
  return a > 90 && r < 90 && g < 90 && b < 160;
}

/**
 * Strips the un-outlined pastel crescent moon aura on the left side and small
 * detached floating sparkles so reaction sheets match Luni's clean no-aura silhouette.
 */
export function removeCrescentAndSparkleAura(
  data: Uint8ClampedArray,
  width: number,
  height: number
): void {
  const total = width * height;
  if (total === 0) return;

  // Pass 1: Row scan from left edge up to Luni's true dark pixel-art outline
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const a = data[p + 3];
      if (isTrueDarkOutline(r, g, b, a)) break;
      if (a > 0) data[p + 3] = 0;
    }
  }

  // Pass 2: Remove small disconnected non-character components (sparkles/crescent tips)
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = y * width + x;
      if (visited[start] || data[start * 4 + 3] <= 24) continue;

      let head = 0;
      let tail = 0;
      let darkCount = 0;
      visited[start] = 1;
      queue[tail++] = start;

      while (head < tail) {
        const cur = queue[head++];
        const cx = cur % width;
        const cy = (cur - cx) / width;
        const p = cur * 4;
        if (isTrueDarkOutline(data[p], data[p + 1], data[p + 2], data[p + 3])) {
          darkCount++;
        }

        if (cx > 0) {
          const n = cur - 1;
          if (!visited[n] && data[n * 4 + 3] > 24) {
            visited[n] = 1;
            queue[tail++] = n;
          }
        }
        if (cx + 1 < width) {
          const n = cur + 1;
          if (!visited[n] && data[n * 4 + 3] > 24) {
            visited[n] = 1;
            queue[tail++] = n;
          }
        }
        if (cy > 0) {
          const n = cur - width;
          if (!visited[n] && data[n * 4 + 3] > 24) {
            visited[n] = 1;
            queue[tail++] = n;
          }
        }
        if (cy + 1 < height) {
          const n = cur + width;
          if (!visited[n] && data[n * 4 + 3] > 24) {
            visited[n] = 1;
            queue[tail++] = n;
          }
        }
      }

      if (darkCount < 40 && tail < 3000) {
        for (let i = 0; i < tail; i++) {
          data[queue[i] * 4 + 3] = 0;
        }
      }
    }
  }
}

export function computeSpriteBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number
): SpriteBounds {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return {
      minX: 0,
      minY: 0,
      maxX: width - 1,
      maxY: height - 1,
      width,
      height,
      anchorX: width / 2,
      bottomY: height - 1,
    };
  }

  const spriteHeight = maxY - minY + 1;
  const lowerStartY = minY + Math.floor(spriteHeight * 0.55);
  let sumX = 0;
  let count = 0;

  for (let y = lowerStartY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (data[(y * width + x) * 4 + 3] > 64) {
        sumX += x;
        count++;
      }
    }
  }

  const anchorX = count > 0 ? sumX / count : (minX + maxX) / 2;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: spriteHeight,
    anchorX,
    bottomY: maxY,
  };
}

export function computeAlignedPlacement(
  bounds: SpriteBounds,
  maxBodySpan: number,
  targetSize: number,
  paddingRatio = 0.04
): SpriteDrawPlacement {
  const usableSize = targetSize * (1 - paddingRatio * 2);
  const scale = usableSize / Math.max(1, maxBodySpan);
  const dw = bounds.width * scale;
  const dh = bounds.height * scale;

  const anchorOffsetInTrimmed = bounds.anchorX - bounds.minX;
  const dx = targetSize / 2 - anchorOffsetInTrimmed * scale;
  const baselineY = targetSize * (1 - paddingRatio);
  const dy = baselineY - dh;

  return { dx, dy, dw, dh };
}
