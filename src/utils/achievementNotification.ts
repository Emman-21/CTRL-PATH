import type { GemstoneAsset } from '../assets/manifest';
import type { AchievementRecord } from '../types/achievements';
import { CATEGORY_NAMES } from './achievementRules';

export const ACHIEVEMENT_TOAST_DURATION_MS = 7000;
export const ACHIEVEMENT_TOAST_RESUME_MIN_MS = 1800;

export function getNextPendingAchievementId(records: AchievementRecord[]): string | undefined {
  return records.find((record) => !record.celebrationAcknowledged)?.id;
}

export interface AchievementNotificationContent {
  eyebrow: string;
  title: string;
  rarity: GemstoneAsset['rarity'];
  categoryLabel: string;
  message: string;
  ctaLabel: string;
}

export function getAchievementNotificationContent(
  gem: GemstoneAsset,
): AchievementNotificationContent {
  return {
    eyebrow: 'Achievement unlocked',
    title: gem.name,
    rarity: gem.rarity,
    categoryLabel: CATEGORY_NAMES[gem.category],
    message:
      gem.achievementId === 'special-your-own-universe'
        ? "Incredible! You've unlocked every pathway gemstone."
        : 'Added to your Gemstone Vault.',
    ctaLabel: 'View in Vault',
  };
}

export function shouldOffsetForFloatingLuni(params: {
  pathname: string;
  luniEnabled?: boolean;
  isQuizFocusMode?: boolean;
  isQuizAnswering?: boolean;
}): boolean {
  const { pathname, luniEnabled = true, isQuizFocusMode = false, isQuizAnswering = false } = params;
  if (pathname === '/results') return false;
  if (!luniEnabled || isQuizFocusMode) return false;
  if (pathname === '/quiz' && isQuizAnswering) return false;
  return true;
}
