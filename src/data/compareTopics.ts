export type CompareTopicId =
  | 'subjects'
  | 'skills'
  | 'project'
  | 'careers'
  | 'workStyle'
  | 'bestFit'
  | 'reflection';

export interface CompareTopicOption {
  id: CompareTopicId;
  label: string;
}

export const COMPARE_TOPICS: readonly CompareTopicOption[] = [
  { id: 'subjects', label: 'Key Curriculum Subjects' },
  { id: 'skills', label: 'Technical Skills & Tools' },
  { id: 'project', label: 'Real-World Hands-on Project' },
  { id: 'careers', label: 'Sample Career Pathways' },
  { id: 'workStyle', label: 'Work Environment & Dynamics' },
  { id: 'bestFit', label: 'Best Fit For Students Who...' },
  { id: 'reflection', label: 'My Reflection' },
] as const;

export const DEFAULT_COMPARE_TOPIC: CompareTopicId = 'subjects';

export function isCompareTopicId(value: unknown): value is CompareTopicId {
  return (
    typeof value === 'string' &&
    COMPARE_TOPICS.some((topic) => topic.id === value)
  );
}

export function getNextCompareTopicIndex(
  currentIndex: number,
  key: string,
  total: number,
): number | null {
  if (total <= 0) return null;
  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return (currentIndex + 1) % total;
  }
  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    return (currentIndex - 1 + total) % total;
  }
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return total - 1;
  }
  return null;
}
