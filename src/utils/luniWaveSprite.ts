import { LUNI_WAVE_V2_SHEET } from '../assets/manifest';
import {
  LUNI_POSES,
  type LuniSpritePoseConfig,
  getPoseDurationMs,
} from '../data/luniSpritePoses';
import {
  getIdleCellRects,
  removeExteriorWhiteBackground,
} from './dashboardLuniIdle';

export const LUNI_WAVE_FRAME_COUNT = 6;
export const LUNI_WAVE_FPS = 10;
export const LUNI_WAVE_DURATION_MS = Math.round((LUNI_WAVE_FRAME_COUNT / LUNI_WAVE_FPS) * 1000); // 600ms
export const LUNI_WINK_MILESTONE_EVENT = 'ctrl_luni_wink_milestone';

export { LUNI_POSES };

export function dispatchLuniWinkMilestone(): void {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(LUNI_WINK_MILESTONE_EVENT));
}

export interface FrameTightBounds {
  frameIndex: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  empty: boolean;
}

export interface FrameCropPlacement {
  frameIndex: number;
  srcX: number;
  srcY: number;
  srcWidth: number;
  srcHeight: number;
  destX: number;
  destY: number;
}

export interface SharedSheetCropPlan {
  rawFrameWidth: number;
  rawFrameHeight: number;
  unionMinX: number;
  unionMinY: number;
  unionMaxX: number;
  unionMaxY: number;
  cropWidth: number;
  cropHeight: number;
  baselineY: number;
  placements: FrameCropPlacement[];
}

export interface UnifiedCropSheetInput {
  id: string;
  rawFrameWidth: number;
  rawFrameHeight: number;
  frameBuffers: readonly Uint8ClampedArray[];
}

export interface UnifiedSheetPlacementPlan {
  id: string;
  rawFrameWidth: number;
  rawFrameHeight: number;
  cropWidth: number;
  cropHeight: number;
  globalAnchorX: number;
  baselineY: number;
  placements: FrameCropPlacement[];
}

export interface UnifiedPoseCropResult {
  cropWidth: number;
  cropHeight: number;
  globalAnchorX: number;
  baselineY: number;
  sheets: Record<string, UnifiedSheetPlacementPlan>;
}

export interface LoadedLuniWaveSheet {
  id?: string;
  sourceUrl: string;
  sheetUrl: string;
  frameCount: number;
  fps?: number;
  mode?: 'loop' | 'once';
  durationMs?: number;
  rawFrameWidth: number;
  rawFrameHeight: number;
  cropWidth: number;
  cropHeight: number;
}

/**
 * Splits a horizontal N-frame sheet cleanly using actual measured width/height,
 * finds ONE shared bounding box (union of non-transparent pixels across all frames),
 * and keeps every frame's bottom (feet) locked to the exact same baseline.
 */
export function computeSharedHorizontalSheetCrop(
  frameBuffers: readonly Uint8ClampedArray[],
  rawFrameWidth: number,
  rawFrameHeight: number,
  alphaThreshold = 24,
): SharedSheetCropPlan {
  const frameBounds: FrameTightBounds[] = frameBuffers.map((data, frameIndex) => {
    let minX = rawFrameWidth;
    let minY = rawFrameHeight;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < rawFrameHeight; y++) {
      for (let x = 0; x < rawFrameWidth; x++) {
        if (data[(y * rawFrameWidth + x) * 4 + 3] > alphaThreshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const empty = maxX < minX || maxY < minY;
    return {
      frameIndex,
      minX: empty ? 0 : minX,
      minY: empty ? 0 : minY,
      maxX: empty ? rawFrameWidth - 1 : maxX,
      maxY: empty ? rawFrameHeight - 1 : maxY,
      empty,
    };
  });

  const nonEmpty = frameBounds.filter((f) => !f.empty);
  const activeBounds = nonEmpty.length > 0 ? nonEmpty : frameBounds;

  const unionMinX = Math.min(...activeBounds.map((f) => f.minX));
  const unionMinY = Math.min(...activeBounds.map((f) => f.minY));
  const unionMaxX = Math.max(...activeBounds.map((f) => f.maxX));
  const unionMaxY = Math.max(...activeBounds.map((f) => f.maxY));

  const cropWidth = Math.max(1, unionMaxX - unionMinX + 1);
  const cropHeight = Math.max(1, unionMaxY - unionMinY + 1);
  const baselineY = cropHeight - 1;

  const placements: FrameCropPlacement[] = frameBounds.map((fb) => {
    const srcX = unionMinX;
    const srcY = unionMinY;
    const srcWidth = cropWidth;
    const srcHeight = cropHeight;
    const baselineShiftY = fb.empty ? 0 : unionMaxY - fb.maxY;

    return {
      frameIndex: fb.frameIndex,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      destX: 0,
      destY: baselineShiftY,
    };
  });

  return {
    rawFrameWidth,
    rawFrameHeight,
    unionMinX,
    unionMinY,
    unionMaxX,
    unionMaxY,
    cropWidth,
    cropHeight,
    baselineY,
    placements,
  };
}

interface MeasuredFrameGeometry extends FrameTightBounds {
  anchorX: number;
  leftExtent: number;
  rightExtent: number;
  width: number;
  height: number;
}

/**
 * Computes ONE shared union bounding box across ALL frames of ALL pose sheets
 * (keeping Luni's hood horizontally anchored and feet locked on the exact same
 * baseline across every frame of every pose so switching poses never jumps).
 */
export function computeUnifiedPoseCropPlans(
  inputs: readonly UnifiedCropSheetInput[],
  alphaThreshold = 24,
): UnifiedPoseCropResult {
  const measuredSheets = inputs.map((sheet) => {
    const frames: MeasuredFrameGeometry[] = sheet.frameBuffers.map((data, frameIndex) => {
      let minX = sheet.rawFrameWidth;
      let minY = sheet.rawFrameHeight;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < sheet.rawFrameHeight; y++) {
        for (let x = 0; x < sheet.rawFrameWidth; x++) {
          if (data[(y * sheet.rawFrameWidth + x) * 4 + 3] > alphaThreshold) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const empty = maxX < minX || maxY < minY;
      if (empty) {
        const midX = Math.floor(sheet.rawFrameWidth / 2);
        return {
          frameIndex,
          minX: 0,
          minY: 0,
          maxX: sheet.rawFrameWidth - 1,
          maxY: sheet.rawFrameHeight - 1,
          empty: true,
          anchorX: midX,
          leftExtent: midX,
          rightExtent: Math.max(0, sheet.rawFrameWidth - 1 - midX),
          width: sheet.rawFrameWidth,
          height: sheet.rawFrameHeight,
        };
      }

      const height = maxY - minY + 1;
      const hoodEndY = Math.min(maxY, minY + Math.floor(height * 0.25));
      let hoodMinX = sheet.rawFrameWidth;
      let hoodMaxX = -1;
      for (let y = minY; y <= hoodEndY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (data[(y * sheet.rawFrameWidth + x) * 4 + 3] > alphaThreshold) {
            if (x < hoodMinX) hoodMinX = x;
            if (x > hoodMaxX) hoodMaxX = x;
          }
        }
      }
      const anchorX =
        hoodMaxX >= hoodMinX
          ? Math.round((hoodMinX + hoodMaxX) / 2)
          : Math.round((minX + maxX) / 2);

      return {
        frameIndex,
        minX,
        minY,
        maxX,
        maxY,
        empty: false,
        anchorX,
        leftExtent: anchorX - minX,
        rightExtent: maxX - anchorX,
        width: maxX - minX + 1,
        height,
      };
    });

    return { sheet, frames };
  });

  const allNonEmpty = measuredSheets.flatMap((s) => s.frames.filter((f) => !f.empty));
  const pool =
    allNonEmpty.length > 0 ? allNonEmpty : measuredSheets.flatMap((s) => s.frames);

  const maxLeft = pool.length > 0 ? Math.max(...pool.map((f) => f.leftExtent)) : 0;
  const maxRight = pool.length > 0 ? Math.max(...pool.map((f) => f.rightExtent)) : 0;
  const cropWidth = Math.max(1, maxLeft + maxRight + 1);
  const cropHeight = pool.length > 0 ? Math.max(1, Math.max(...pool.map((f) => f.height))) : 1;
  const globalAnchorX = maxLeft;
  const baselineY = cropHeight - 1;

  const sheets: Record<string, UnifiedSheetPlacementPlan> = {};
  for (const { sheet, frames } of measuredSheets) {
    const placements: FrameCropPlacement[] = frames.map((fb) => {
      if (fb.empty) {
        return {
          frameIndex: fb.frameIndex,
          srcX: 0,
          srcY: 0,
          srcWidth: Math.min(sheet.rawFrameWidth, cropWidth),
          srcHeight: Math.min(sheet.rawFrameHeight, cropHeight),
          destX: 0,
          destY: 0,
        };
      }
      return {
        frameIndex: fb.frameIndex,
        srcX: fb.minX,
        srcY: fb.minY,
        srcWidth: fb.width,
        srcHeight: fb.height,
        destX: globalAnchorX - fb.leftExtent,
        destY: baselineY - (fb.height - 1),
      };
    });

    sheets[sheet.id] = {
      id: sheet.id,
      rawFrameWidth: sheet.rawFrameWidth,
      rawFrameHeight: sheet.rawFrameHeight,
      cropWidth,
      cropHeight,
      globalAnchorX,
      baselineY,
      placements,
    };
  }

  return {
    cropWidth,
    cropHeight,
    globalAnchorX,
    baselineY,
    sheets,
  };
}

/**
 * Computes crisp CSS display dimensions for a cropped frame.
 * Whole-number multiples (1x, 2x, 3x...) are used when an explicit scale is provided
 * or when upscaling from a smaller native frame size; otherwise fits cleanly inside `size`.
 */
export function computeLuniDisplayDimensions(
  cropWidth: number,
  cropHeight: number,
  options?: { size?: number; scale?: number },
): { width: number; height: number } {
  const safeW = Math.max(1, cropWidth);
  const safeH = Math.max(1, cropHeight);

  if (options?.scale && options.scale > 0) {
    const intScale = Math.max(1, Math.round(options.scale));
    return {
      width: Math.round(safeW * intScale),
      height: Math.round(safeH * intScale),
    };
  }

  const targetSize = Math.max(16, Math.round(options?.size ?? safeH));
  if (safeH < targetSize && safeW < targetSize) {
    const intMultiple = Math.max(1, Math.floor(targetSize / Math.max(safeW, safeH)));
    return {
      width: Math.round(safeW * intMultiple),
      height: Math.round(safeH * intMultiple),
    };
  }

  const ratio = Math.min(targetSize / safeW, targetSize / safeH);
  return {
    width: Math.max(1, Math.round(safeW * ratio)),
    height: Math.max(1, Math.round(safeH * ratio)),
  };
}

const sheetCache = new Map<string, Promise<LoadedLuniWaveSheet>>();
const unifiedBundleCache = new Map<string, Promise<Record<string, LoadedLuniWaveSheet>>>();

function preloadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to preload Luni sprite sheet: ${src}`));
    img.src = src;
  });
}

function sliceSheetBuffers(
  img: HTMLImageElement,
  frameCount: number,
  options?: { cols?: number; rows?: number; cleanWhiteBg?: boolean },
): {
  frameCanvases: HTMLCanvasElement[];
  rawFrameWidth: number;
  rawFrameHeight: number;
  frameBuffers: Uint8ClampedArray[];
} | null {
  const measuredW = img.naturalWidth;
  const measuredH = img.naturalHeight;
  const cols = Math.max(1, options?.cols ?? frameCount);
  const rows = Math.max(1, options?.rows ?? 1);
  const cellRects = getIdleCellRects(measuredW, measuredH, cols, rows).slice(0, frameCount);
  if (cellRects.length === 0) return null;

  const rawFrameWidth = Math.max(1, ...cellRects.map((r) => r.width));
  const rawFrameHeight = Math.max(1, ...cellRects.map((r) => r.height));

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = measuredW;
  srcCanvas.height = measuredH;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) return null;

  srcCtx.drawImage(img, 0, 0);

  const frameCanvases: HTMLCanvasElement[] = [];
  const frameBuffers: Uint8ClampedArray[] = [];

  for (const rect of cellRects) {
    const cellData = srcCtx.getImageData(rect.x, rect.y, rect.width, rect.height);
    if (options?.cleanWhiteBg) {
      removeExteriorWhiteBackground(cellData.data, rect.width, rect.height);
    }

    const cellCanvas = document.createElement('canvas');
    cellCanvas.width = rawFrameWidth;
    cellCanvas.height = rawFrameHeight;
    const cellCtx = cellCanvas.getContext('2d', { willReadFrequently: true });
    if (!cellCtx) return null;

    cellCtx.putImageData(cellData, 0, 0);
    frameCanvases.push(cellCanvas);
    frameBuffers.push(cellCtx.getImageData(0, 0, rawFrameWidth, rawFrameHeight).data);
  }

  return { frameCanvases, rawFrameWidth, rawFrameHeight, frameBuffers };
}

export function measureSheetMedianBodyHeight(
  frameBuffers: readonly Uint8ClampedArray[],
  rawFrameWidth: number,
  rawFrameHeight: number,
  alphaThreshold = 24,
): number {
  const heights: number[] = [];
  for (const data of frameBuffers) {
    let minY = rawFrameHeight;
    let maxY = -1;
    for (let y = 0; y < rawFrameHeight; y++) {
      for (let x = 0; x < rawFrameWidth; x++) {
        if (data[(y * rawFrameWidth + x) * 4 + 3] > alphaThreshold) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxY >= minY) {
      heights.push(maxY - minY + 1);
    }
  }
  if (heights.length === 0) return 0;
  const sorted = [...heights].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function computeReferenceBodyHeight(heights: readonly number[]): number {
  const positive = heights.filter((h) => h > 0).sort((a, b) => a - b);
  if (positive.length === 0) return 0;
  return positive[Math.floor(positive.length / 2)];
}

export function computeNormalizedSheetScale(
  sheetBodyHeight: number,
  referenceBodyHeight: number,
): number {
  if (sheetBodyHeight <= 0 || referenceBodyHeight <= 0) return 1;
  const relativeDiff = Math.abs(sheetBodyHeight - referenceBodyHeight) / referenceBodyHeight;
  if (relativeDiff <= 0.12) return 1;
  return referenceBodyHeight / sheetBodyHeight;
}

/**
 * Preloads ALL pose sheets in LUNI_POSES, measures each sheet's actual width/height,
 * normalizes differing sheet body heights (e.g. 3x2 grid idle vs 6x1 horizontal sheets),
 * computes ONE shared bounding box across all frames of all poses with a locked foot
 * baseline, and returns ready-to-render horizontal sprite data URLs with zero runtime
 * background stripping or flicker.
 */
export function preloadAllLuniPoseSheets(
  poses: readonly LuniSpritePoseConfig[] = LUNI_POSES,
): Promise<Record<string, LoadedLuniWaveSheet>> {
  const cacheKey = poses
    .map(
      (p) =>
        `${p.id}:${p.src}:${p.frames}:${p.cols ?? p.frames}:${p.rows ?? 1}:${p.cleanWhiteBg ? 1 : 0}:${p.fps}`,
    )
    .join('|');
  const cached = unifiedBundleCache.get(cacheKey);
  if (cached) return cached;

  const promise = (async (): Promise<Record<string, LoadedLuniWaveSheet>> => {
    const loadedRaw = await Promise.all(
      poses.map(async (pose) => {
        try {
          const img = await preloadImageElement(pose.src);
          const sliced = sliceSheetBuffers(img, pose.frames, {
            cols: pose.cols,
            rows: pose.rows,
            cleanWhiteBg: pose.cleanWhiteBg,
          });
          const bodyHeight = sliced
            ? measureSheetMedianBodyHeight(
                sliced.frameBuffers,
                sliced.rawFrameWidth,
                sliced.rawFrameHeight,
              )
            : 0;
          return { pose, img, sliced, bodyHeight };
        } catch (err) {
          if (pose.optional) {
            return { pose, img: null, sliced: null, bodyHeight: 0 };
          }
          throw err;
        }
      }),
    );

    const referenceBodyHeight = computeReferenceBodyHeight(
      loadedRaw.map((item) => item.bodyHeight),
    );

    const normalizedItems = loadedRaw.map((item) => {
      if (!item.sliced) return item;
      const scale = computeNormalizedSheetScale(item.bodyHeight, referenceBodyHeight);
      if (scale === 1) return item;

      const scaledW = Math.max(1, Math.round(item.sliced.rawFrameWidth * scale));
      const scaledH = Math.max(1, Math.round(item.sliced.rawFrameHeight * scale));
      const scaledCanvases: HTMLCanvasElement[] = [];
      const scaledBuffers: Uint8ClampedArray[] = [];

      for (const srcCell of item.sliced.frameCanvases) {
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = scaledW;
        scaledCanvas.height = scaledH;
        const scaledCtx = scaledCanvas.getContext('2d', { willReadFrequently: true });
        if (!scaledCtx) {
          return item;
        }
        scaledCtx.imageSmoothingEnabled = false;
        scaledCtx.drawImage(
          srcCell,
          0,
          0,
          item.sliced.rawFrameWidth,
          item.sliced.rawFrameHeight,
          0,
          0,
          scaledW,
          scaledH,
        );
        scaledCanvases.push(scaledCanvas);
        scaledBuffers.push(scaledCtx.getImageData(0, 0, scaledW, scaledH).data);
      }

      return {
        ...item,
        sliced: {
          frameCanvases: scaledCanvases,
          rawFrameWidth: scaledW,
          rawFrameHeight: scaledH,
          frameBuffers: scaledBuffers,
        },
      };
    });

    const cropInputs: UnifiedCropSheetInput[] = [];
    for (const item of normalizedItems) {
      if (item.sliced) {
        cropInputs.push({
          id: item.pose.id,
          rawFrameWidth: item.sliced.rawFrameWidth,
          rawFrameHeight: item.sliced.rawFrameHeight,
          frameBuffers: item.sliced.frameBuffers,
        });
      }
    }

    const unified = computeUnifiedPoseCropPlans(cropInputs);
    const outMap: Record<string, LoadedLuniWaveSheet> = {};

    await Promise.all(
      normalizedItems.map(async ({ pose, img, sliced }) => {
        if (!img) {
          return;
        }
        const plan = unified.sheets[pose.id];
        if (!sliced || !plan) {
          const cols = Math.max(1, pose.cols ?? pose.frames);
          const rows = Math.max(1, pose.rows ?? 1);
          const fallbackW = Math.max(1, Math.floor(img.naturalWidth / cols));
          const fallbackH = Math.max(1, Math.floor(img.naturalHeight / rows));
          outMap[pose.id] = {
            id: pose.id,
            sourceUrl: pose.src,
            sheetUrl: pose.src,
            frameCount: pose.frames,
            fps: pose.fps,
            mode: pose.mode,
            durationMs: getPoseDurationMs(pose),
            rawFrameWidth: fallbackW,
            rawFrameHeight: fallbackH,
            cropWidth: fallbackW,
            cropHeight: fallbackH,
          };
          return;
        }

        const outCanvas = document.createElement('canvas');
        outCanvas.width = unified.cropWidth * pose.frames;
        outCanvas.height = unified.cropHeight;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) {
          outMap[pose.id] = {
            id: pose.id,
            sourceUrl: pose.src,
            sheetUrl: pose.src,
            frameCount: pose.frames,
            fps: pose.fps,
            mode: pose.mode,
            durationMs: getPoseDurationMs(pose),
            rawFrameWidth: sliced.rawFrameWidth,
            rawFrameHeight: sliced.rawFrameHeight,
            cropWidth: unified.cropWidth,
            cropHeight: unified.cropHeight,
          };
          return;
        }

        for (let i = 0; i < pose.frames; i++) {
          const p = plan.placements[i];
          const frameCanvas = sliced.frameCanvases[i];
          if (!p || !frameCanvas) continue;
          outCtx.drawImage(
            frameCanvas,
            p.srcX,
            p.srcY,
            p.srcWidth,
            p.srcHeight,
            i * unified.cropWidth + p.destX,
            p.destY,
            p.srcWidth,
            p.srcHeight,
          );
        }

        const croppedDataUrl = outCanvas.toDataURL('image/png');
        await preloadImageElement(croppedDataUrl).catch(() => undefined);

        outMap[pose.id] = {
          id: pose.id,
          sourceUrl: pose.src,
          sheetUrl: croppedDataUrl,
          frameCount: pose.frames,
          fps: pose.fps,
          mode: pose.mode,
          durationMs: getPoseDurationMs(pose),
          rawFrameWidth: sliced.rawFrameWidth,
          rawFrameHeight: sliced.rawFrameHeight,
          cropWidth: unified.cropWidth,
          cropHeight: unified.cropHeight,
        };
      }),
    );

    return outMap;
  })().catch((err) => {
    unifiedBundleCache.delete(cacheKey);
    throw err;
  });

  unifiedBundleCache.set(cacheKey, promise);
  return promise;
}

export function preloadLuniWaveSheet(
  sourceUrl: string = LUNI_WAVE_V2_SHEET,
  frameCount: number = LUNI_WAVE_FRAME_COUNT,
): Promise<LoadedLuniWaveSheet> {
  const cacheKey = `${sourceUrl}::${frameCount}`;
  const cached = sheetCache.get(cacheKey);
  if (cached) return cached;

  const promise = (async (): Promise<LoadedLuniWaveSheet> => {
    const img = await preloadImageElement(sourceUrl);
    const sliced = sliceSheetBuffers(img, frameCount);
    if (!sliced) {
      const rawFrameWidth = Math.max(1, Math.floor(img.naturalWidth / frameCount));
      const rawFrameHeight = Math.max(1, img.naturalHeight);
      return {
        sourceUrl,
        sheetUrl: sourceUrl,
        frameCount,
        rawFrameWidth,
        rawFrameHeight,
        cropWidth: rawFrameWidth,
        cropHeight: rawFrameHeight,
      };
    }

    const plan = computeSharedHorizontalSheetCrop(
      sliced.frameBuffers,
      sliced.rawFrameWidth,
      sliced.rawFrameHeight,
    );

    const outCanvas = document.createElement('canvas');
    outCanvas.width = plan.cropWidth * frameCount;
    outCanvas.height = plan.cropHeight;
    const outCtx = outCanvas.getContext('2d');

    if (!outCtx) {
      return {
        sourceUrl,
        sheetUrl: sourceUrl,
        frameCount,
        rawFrameWidth: sliced.rawFrameWidth,
        rawFrameHeight: sliced.rawFrameHeight,
        cropWidth: plan.cropWidth,
        cropHeight: plan.cropHeight,
      };
    }

    for (let i = 0; i < frameCount; i++) {
      const p = plan.placements[i];
      const frameCanvas = sliced.frameCanvases[i];
      if (!p || !frameCanvas) continue;
      outCtx.drawImage(
        frameCanvas,
        p.srcX,
        p.srcY,
        p.srcWidth,
        p.srcHeight,
        i * plan.cropWidth + p.destX,
        p.destY,
        p.srcWidth,
        p.srcHeight,
      );
    }

    const croppedDataUrl = outCanvas.toDataURL('image/png');
    await preloadImageElement(croppedDataUrl).catch(() => undefined);

    return {
      sourceUrl,
      sheetUrl: croppedDataUrl,
      frameCount,
      rawFrameWidth: sliced.rawFrameWidth,
      rawFrameHeight: sliced.rawFrameHeight,
      cropWidth: plan.cropWidth,
      cropHeight: plan.cropHeight,
    };
  })().catch((err) => {
    sheetCache.delete(cacheKey);
    throw err;
  });

  sheetCache.set(cacheKey, promise);
  return promise;
}

if (typeof window !== 'undefined' && typeof Image !== 'undefined' && typeof document !== 'undefined') {
  void preloadAllLuniPoseSheets(LUNI_POSES).catch(() => undefined);
}
