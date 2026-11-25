import type { AvatarStyle } from '../types';

export interface AvatarOption {
  id: AvatarStyle;
  label: string;
  src: string;
  isSprite?: boolean;
}

export const DEFAULT_AVATAR_STYLE: AvatarStyle = 'wizard-cat';

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  {
    id: 'wizard-cat',
    label: 'Wizard Cat',
    src: '/assets/aistudio/Gemini_Generated_Image_nrhilnrhilnrhiln_4fe4b06b.jpg',
  },
  {
    id: 'sleepy-luni',
    label: 'Sleepy Luni',
    src: '/assets/aistudio/Gemini_Generated_Image_h6kqvvh6kqvvh6kq_fca44b72.jpg',
  },
  {
    id: 'cool-luni',
    label: 'Cool Luni',
    src: '/assets/aistudio/Gemini_Generated_Image_innb50innb50innb_d75e00ad.jpg',
    isSprite: true,
  },
  {
    id: 'guardian-luni',
    label: 'Guardian Luni',
    src: '/assets/aistudio/Gemini_Generated_Image_innb50innb50innb_d75e00ad.jpg',
    isSprite: true,
  },
  {
    id: 'fierce-luni',
    label: 'Fierce Luni',
    src: '/assets/aistudio/Gemini_Generated_Image_innb50innb50innb_d75e00ad.jpg',
    isSprite: true,
  },
  {
    id: 'cheerful-luni',
    label: 'Cheerful Luni',
    src: '/assets/aistudio/Gemini_Generated_Image_innb50innb50innb_d75e00ad.jpg',
    isSprite: true,
  },
  {
    id: 'playful-luni',
    label: 'Playful Luni',
    src: '/assets/aistudio/Gemini_Generated_Image_innb50innb50innb_d75e00ad.jpg',
    isSprite: true,
  },
  {
    id: 'peace-luni',
    label: 'Starlight Peace',
    src: '/assets/aistudio/Gemini_Generated_Image_innb50innb50innb_d75e00ad.jpg',
    isSprite: true,
  },
];

const AVATAR_ID_SET = new Set<string>(AVATAR_OPTIONS.map((option) => option.id));

export function isAvatarStyle(value: unknown): value is AvatarStyle {
  return typeof value === 'string' && AVATAR_ID_SET.has(value);
}

export function normalizeAvatarStyle(value: unknown): AvatarStyle {
  return isAvatarStyle(value) ? value : DEFAULT_AVATAR_STYLE;
}

export function getAvatarOption(style: unknown): AvatarOption {
  const id = normalizeAvatarStyle(style);
  return AVATAR_OPTIONS.find((option) => option.id === id) || AVATAR_OPTIONS[0];
}
