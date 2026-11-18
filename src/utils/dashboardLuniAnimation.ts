export const DASHBOARD_LUNI_SPRITESHEET_URL =
  '/assets/aistudio/Gemini_Generated_Image_8vsjxs8vsjxs8vsj_d256e72e.jpg';

export const DASHBOARD_LUNI_GRID = {
  cols: 3,
  rows: 2,
  totalFrames: 6,
} as const;

export interface WaveKeyFrame {
  frameIndex: number;
  durationMs: number;
}

/**
 * Choreographed wave animation using all 6 poses from the 3x2 sprite sheet:
 * 0: calm idle with moon aura
 * 1: raising hand, smiling
 * 2: hand raised high waving
 * 3: happy ^ ^ eyes + raised wave + golden sparkles
 * 4: happy ^ ^ eyes + lowering hand
 * 5: settling idle with moon aura
 */
export const DASHBOARD_LUNI_WAVE_SEQUENCE: readonly WaveKeyFrame[] = [
  { frameIndex: 0, durationMs: 100 },
  { frameIndex: 1, durationMs: 130 },
  { frameIndex: 2, durationMs: 170 },
  { frameIndex: 3, durationMs: 280 },
  { frameIndex: 2, durationMs: 170 },
  { frameIndex: 3, durationMs: 300 },
  { frameIndex: 2, durationMs: 160 },
  { frameIndex: 3, durationMs: 260 },
  { frameIndex: 4, durationMs: 180 },
  { frameIndex: 5, durationMs: 180 },
];

export const DASHBOARD_LUNI_IDLE_FRAME = 0;
export const DASHBOARD_LUNI_REDUCED_MOTION_WAVE_FRAME = 3;

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

/**
 * Returns the 6 cell rectangles for a 3x2 sprite sheet.
 */
export function getSpriteCellRects(sheetWidth: number, sheetHeight: number): SpriteCellRect[] {
  const rects: SpriteCellRect[] = [];
  const { cols, rows } = DASHBOARD_LUNI_GRID;

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

/**
 * Determines whether an RGB pixel is near-white background (including slight JPEG compression artifacts)
 * without matching pastel moon/sparkle colors or Luni's dark outlines.
 */
export function isNearWhiteBackground(r: number, g: number, b: number): boolean {
  const minChannel = Math.min(r, g, b);
  const maxChannel = Math.max(r, g, b);
  return minChannel >= 228 && maxChannel - minChannel <= 22;
}

/**
 * Performs an exterior BFS flood fill from all 4 edges of a cell's RGBA pixel buffer
 * so exterior white becomes transparent while white hair/dress enclosed inside
 * Luni's dark pixel-art outline remains 100% opaque.
 */
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
    if (data[p + 3] === 0 || isNearWhiteBackground(data[p], data[p + 1], data[p + 2])) {
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

  // Clear exterior background pixels
  for (let i = 0; i < total; i++) {
    if (visited[i]) {
      data[i * 4 + 3] = 0;
    }
  }

  // Clean immediate 1px JPEG anti-aliasing white fringe next to cleared exterior pixels
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

/**
 * Computes tight visible bounds AND a stable body anchor `(anchorX, bottomY)`
 * anchored to the lower body core (so floating crescent/sparkles on the sides
 * do not shift Luni horizontally between frames).
 */
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
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 24) {
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

  // Anchor horizontally using the lower 45% of the sprite (dress/boots),
  // which has no side sparkles or crescent moon aura.
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

/**
 * Computes aligned draw placement for a frame inside a square target canvas of `targetSize`,
 * keeping Luni grounded at a consistent foot baseline and horizontally centered on her body anchor.
 */
export function computeAlignedPlacement(
  bounds: SpriteBounds,
  maxBodySpan: number,
  targetSize: number,
  paddingRatio = 0.06
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
