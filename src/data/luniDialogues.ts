import { LuniState, LuniStateConfig, LuniDialogueItem, LuniTopicQA } from '../types/luni';
import { TrackCode } from '../types';

/**
 * Centralized mapping of 11 Luni character animation states to sprite assets & effects.
 */
export const LUNI_STATE_CONFIGS: Record<LuniState, LuniStateConfig> = {
  idle: {
    pose: 'idle',
    particle: 'glow',
    motion: 'float',
    label: 'Peaceful & ready',
  },
  waving: {
    pose: 'wave',
    particle: 'sparkles',
    motion: 'tilt',
    label: 'Greeting Luminary',
  },
  pointing: {
    pose: 'point',
    particle: 'sparkles',
    motion: 'tilt',
    label: 'Guiding direction',
  },
  thinking: {
    pose: 'curious',
    particle: 'stars',
    motion: 'float',
    label: 'Contemplating data',
  },
  curious: {
    pose: 'curious',
    particle: 'question',
    motion: 'tilt',
    label: 'Inquiring explorer',
  },
  happy: {
    pose: 'love',
    particle: 'hearts',
    motion: 'bounce',
    label: 'Joyful & warm',
  },
  excited: {
    pose: 'star_eyes',
    particle: 'sparkles',
    motion: 'bounce',
    label: 'Thrilled to learn',
  },
  celebrating: {
    pose: 'celebrate',
    particle: 'sparkles',
    motion: 'bounce',
    label: 'Celebrating milestone!',
  },
  encouraging: {
    pose: 'cast',
    particle: 'stars',
    motion: 'float',
    label: 'Casting encouragement',
  },
  sad: {
    pose: 'sad',
    particle: 'none',
    motion: 'rest',
    label: 'Empathetic presence',
  },
  sleeping: {
    pose: 'sleep',
    particle: 'sleepy_zs',
    motion: 'rest',
    label: 'Peaceful slumber',
  },
};

/**
 * Route-specific contextual dialogues
 */
export const ROUTE_DIALOGUES: Record<string, LuniDialogueItem> = {
  '/': {
    id: 'dashboard-welcome',
    title: 'Luminary Hub',
    message: 'Welcome back, Luminary! Ready to continue your journey?',
    state: 'waving',
    particle: 'sparkles',
    quickActions: [
      { label: 'Continue Journey', route: '/tracks', iconName: 'compass', variant: 'primary' },
      { label: 'Explore Tracks', route: '/tracks', iconName: 'book', variant: 'secondary' },
      { label: 'Open CTRL Quiz', route: '/quiz', iconName: 'quiz', variant: 'secondary' },
    ],
  },
  '/tracks': {
    id: 'tracks-main',
    title: 'Three Pathways',
    message: 'Three pathways are waiting for you! Which one would you like to explore first?',
    state: 'curious',
    particle: 'question',
    quickActions: [
      { label: 'Explore NT', route: '/tracks?track=NT', iconName: 'compass', variant: 'nt' },
      { label: 'Explore BA', route: '/tracks?track=BA', iconName: 'compass', variant: 'ba' },
      { label: 'Explore SM', route: '/tracks?track=SM', iconName: 'compass', variant: 'sm' },
      { label: 'Compare Tracks', route: '/compare', iconName: 'compare', variant: 'secondary' },
    ],
  },
  '/quiz': {
    id: 'quiz-guidance',
    title: 'Assessment Mode',
    message: "Take your time, Luminary! Read each question carefully and trust what you've learned.",
    state: 'encouraging',
    particle: 'stars',
    quickActions: [
      { label: 'Start Level 1', route: '/quiz', iconName: 'quiz', variant: 'primary' },
      { label: 'Review Tracks First', route: '/tracks', iconName: 'book', variant: 'secondary' },
    ],
  },
  '/results': {
    id: 'results-insights',
    title: 'Path Insights',
    message: 'Your results can help you understand your strengths and what you might want to explore next!',
    state: 'encouraging',
    particle: 'stars',
    quickActions: [
      { label: 'Compare Tracks', route: '/compare', iconName: 'compare', variant: 'primary' },
      { label: 'View Gemstones', route: '/achievements', iconName: 'gem', variant: 'secondary' },
    ],
  },
  '/compare': {
    id: 'compare-matrix',
    title: 'Path Comparison',
    message: 'Every pathway has something special. Let us look at their differences together!',
    state: 'thinking',
    particle: 'stars',
    quickActions: [
      { label: 'Explore Details', route: '/tracks', iconName: 'book', variant: 'secondary' },
      { label: 'Take Quiz', route: '/quiz', iconName: 'quiz', variant: 'primary' },
    ],
  },
  '/achievements': {
    id: 'achievements-vault',
    title: 'Gemstone Vault',
    message: 'Welcome to your Achievement Vault, Luminary! Every gemstone represents a step forward in your journey!',
    state: 'celebrating',
    particle: 'sparkles',
    quickActions: [
      { label: 'Return to Hub', route: '/', iconName: 'arrow', variant: 'secondary' },
      { label: 'Unlock More Gems', route: '/tracks', iconName: 'compass', variant: 'primary' },
    ],
  },
  '/alumni': {
    id: 'alumni-stories',
    title: 'Alumni Experiences',
    message: 'Real alumni stories will appear here once they are available. You can keep exploring the three tracks in the meantime!',
    state: 'curious',
    particle: 'sparkles',
    quickActions: [
      { label: 'Explore Tracks', route: '/tracks', iconName: 'compass', variant: 'primary' },
    ],
  },
  '/announcements': {
    id: 'luminary-bulletin', title: 'The Luminary Bulletin',
    message: 'Published updates will appear here when available. Check each source and date as you explore.',
    state: 'pointing', particle: 'none', quickActions: [{label:'Open Bulletin',route:'/announcements',iconName:'arrow',variant:'primary'}],
  },
  '/control-center': {
    id: 'control-center',
    title: 'Control Center',
    message: 'Welcome to your Control Center, Luminary! This is where you can manage your journey and make CTRL+PATH your own.',
    state: 'idle',
    particle: 'glow',
    quickActions: [
      { label: 'Back to Hub', route: '/', iconName: 'arrow', variant: 'primary' },
    ],
  },
};

/**
 * Specific dialogues when viewing a specific track detail
 */
export const TRACK_SPECIFIC_DIALOGUES: Record<TrackCode, LuniDialogueItem> = {
  NT: {
    id: 'track-nt',
    title: 'Networking Technology (NT)',
    message: 'Networking is all about connecting devices and helping information travel. Let us discover how it works!',
    state: 'pointing',
    particle: 'sparkles',
    quickActions: [
      { label: 'Compare with BA & SM', route: '/compare', iconName: 'compare', variant: 'secondary' },
      { label: 'Take Quiz', route: '/quiz', iconName: 'quiz', variant: 'nt' },
    ],
  },
  BA: {
    id: 'track-ba',
    title: 'Business Analytics (BA)',
    message: 'Data can reveal interesting patterns! Let us explore what those patterns can tell us.',
    state: 'thinking',
    particle: 'stars',
    quickActions: [
      { label: 'Compare with NT & SM', route: '/compare', iconName: 'compare', variant: 'secondary' },
      { label: 'Take Quiz', route: '/quiz', iconName: 'quiz', variant: 'ba' },
    ],
  },
  SM: {
    id: 'track-sm',
    title: 'Service Management (SM)',
    message: 'Great services depend on teamwork, planning, and thoughtful processes. Ready to learn more?',
    state: 'happy',
    particle: 'hearts',
    quickActions: [
      { label: 'Compare with NT & BA', route: '/compare', iconName: 'compare', variant: 'secondary' },
      { label: 'Take Quiz', route: '/quiz', iconName: 'quiz', variant: 'sm' },
    ],
  },
};

/**
 * Scripted Q&A Knowledge Base (Honest, client-side, verified BSIT curriculum)
 */
export const SCRIPTED_TOPICS: LuniTopicQA[] = [
  {
    id: 'nt-overview',
    question: 'What is Networking Technology (NT)?',
    answer:
      'Networking Technology explores how computers, routers, and switches connect globally. You learn network architectures, TCP/IP & OSI protocols, packet analysis with Wireshark, server infrastructure, and network defense to keep digital systems running reliably.',
    category: 'tracks',
    relatedRoute: '/tracks?track=NT',
    relatedActionLabel: 'View NT Track',
  },
  {
    id: 'ba-overview',
    question: 'What is Business Analytics (BA)?',
    answer:
      'Business Analytics transforms raw numbers into actionable business intelligence. You learn data visualization (like Power BI and Tableau), predictive analytics, statistical pattern detection, and executive reporting to help organizations make data-driven decisions.',
    category: 'tracks',
    relatedRoute: '/tracks?track=BA',
    relatedActionLabel: 'View BA Track',
  },
  {
    id: 'sm-overview',
    question: 'What is Service Management (SM)?',
    answer:
      'Service Management focuses on how people, processes, and technology work harmoniously. You learn ITIL service delivery, SLA metrics, help desk operations, business continuity, and customer experience workflows. Always Service Management, never System Management!',
    category: 'tracks',
    relatedRoute: '/tracks?track=SM',
    relatedActionLabel: 'View SM Track',
  },
  {
    id: 'track-choice',
    question: 'Which track should I choose?',
    answer:
      'I can help you understand the differences between the tracks, but the final choice is always yours! Consider what excites you most: building networks (NT), discovering insights from numbers (BA), or coordinating seamless service workflows (SM). Would you like to compare them side by side?',
    category: 'advice',
    relatedRoute: '/compare',
    relatedActionLabel: 'Compare All Three Tracks',
  },
  {
    id: 'quiz-structure',
    question: 'How does the CTRL Quiz work?',
    answer:
      'The CTRL Quiz features 5 progressive levels totaling 99 questions (33 per track) covering True/False, Multiple Choice, Matching Type, Sequencing, and Identification. It provides an objective assessment of your demonstrated knowledge and aptitude across all 3 tracks.',
    category: 'quiz',
    relatedRoute: '/quiz',
    relatedActionLabel: 'Open CTRL Quiz',
  },
  {
    id: 'focus-mode',
    question: 'What is Focus Mode during quizzes?',
    answer:
      'Focus Mode creates a peaceful, distraction-free environment for taking the CTRL Quiz. It temporarily rests my floating animations, hides decorative particles, and darkens the view so you can focus entirely on reading prompts and answering at your own pace.',
    category: 'quiz',
  },
  {
    id: 'gemstones',
    question: 'How do I unlock Gemstone Achievements?',
    answer:
      'You earn gemstones by exploring track modules, taking quiz attempts, saving side-by-side comparisons, writing reflections, and reaching milestones! There are 20 gemstones in total across NT, BA, SM, and Special categories.',
    category: 'general',
    relatedRoute: '/achievements',
    relatedActionLabel: 'Open Gemstone Vault',
  },
  {
    id: 'decision-responsibility',
    question: 'Will CTRL+PATH choose my major for me?',
    answer:
      'No! CTRL+PATH is designed to guide and illuminate your options, not to dictate your path. First-year BSIT students retain full freedom and responsibility for selecting their official academic track at Batangas State University.',
    category: 'advice',
  },
];
