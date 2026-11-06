import { LuniPoseKey } from '../assets/manifest';

export type LuniState =
  | 'idle'
  | 'waving'
  | 'pointing'
  | 'thinking'
  | 'curious'
  | 'happy'
  | 'excited'
  | 'celebrating'
  | 'encouraging'
  | 'sad'
  | 'sleeping';

export type LuniParticleType =
  | 'sparkles'
  | 'stars'
  | 'glow'
  | 'hearts'
  | 'question'
  | 'sleepy_zs'
  | 'none';

export interface LuniQuickAction {
  label: string;
  route: string;
  iconName?: 'compass' | 'quiz' | 'compare' | 'gem' | 'sparkles' | 'arrow' | 'book';
  variant?: 'primary' | 'secondary' | 'nt' | 'ba' | 'sm';
}

export interface LuniDialogueItem {
  id: string;
  title: string;
  message: string;
  state: LuniState;
  particle?: LuniParticleType;
  quickActions?: LuniQuickAction[];
  priority?: 'normal' | 'high';
}

export interface LuniTopicQA {
  id: string;
  question: string;
  answer: string;
  category: 'tracks' | 'quiz' | 'general' | 'advice';
  relatedRoute?: string;
  relatedActionLabel?: string;
}

export interface LuniStateConfig {
  pose: LuniPoseKey;
  particle: LuniParticleType;
  motion: 'float' | 'bounce' | 'tilt' | 'rest';
  label: string;
}
