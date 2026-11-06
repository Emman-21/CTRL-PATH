/**
 * CTRL+PATH Phase 1 & 2 Asset Manifest
 * Maps all official backgrounds, Luni poses, gemstones, and UI screenshots
 */

export const BACKGROUNDS = {
  dashboardSkyKingdom: '/assets/aistudio/01_dashboard_moonlit_sky_kingdom_718c0f20.png',
  trackExplorerAcademy: '/assets/aistudio/02_track_explorer_floating_academy_ab75bacc.png',
  achievementsCrystalGarden: '/assets/aistudio/03_achievements_crystal_garden_48a2e3d4.png',
  quizMinimalClouds: '/assets/aistudio/04_quiz_minimal_clouds_872b3764.png',
} as const;

export type LuniPoseKey =
  | 'idle'
  | 'wave'
  | 'point'
  | 'sleep'
  | 'surprised'
  | 'love'
  | 'sad'
  | 'angry'
  | 'cast'
  | 'celebrate'
  | 'walk'
  | 'back'
  | 'curious'
  | 'star_eyes'
  | 'sit'
  | 'float';

export const LUNI_POSES: Record<LuniPoseKey, { name: string; url: string; description: string }> = {
  idle: {
    name: 'Idle',
    url: '/assets/aistudio/01_idle_4dd55407.png',
    description: 'Calm and steady moonstone presence',
  },
  wave: {
    name: 'Wave',
    url: '/assets/aistudio/02_wave_732e3934.png',
    description: 'Friendly greeting to students',
  },
  point: {
    name: 'Point',
    url: '/assets/aistudio/03_point_b53febe8.png',
    description: 'Guiding toward next steps',
  },
  sleep: {
    name: 'Sleep',
    url: '/assets/aistudio/04_sleep_a3c735d1.png',
    description: 'Peaceful resting state',
  },
  surprised: {
    name: 'Surprised',
    url: '/assets/aistudio/05_surprised_c26ec6dd.png',
    description: 'Expressive amazement',
  },
  love: {
    name: 'Love',
    url: '/assets/aistudio/06_love_0942c750.png',
    description: 'Warm encouragement and care',
  },
  sad: {
    name: 'Sad',
    url: '/assets/aistudio/07_sad_9434ee93.png',
    description: 'Empathy during tough moments',
  },
  angry: {
    name: 'Determined',
    url: '/assets/aistudio/08_angry_8678b10a.png',
    description: 'Fiery determination to overcome challenges',
  },
  cast: {
    name: 'Cast',
    url: '/assets/aistudio/09_cast_575421e8.png',
    description: 'Casting magical insight',
  },
  celebrate: {
    name: 'Celebrate',
    url: '/assets/aistudio/10_celebrate_1f5d619f.png',
    description: 'Joyful achievement celebration',
  },
  walk: {
    name: 'Walk',
    url: '/assets/aistudio/11_walk_fd3f3094.png',
    description: 'Walking beside the student',
  },
  back: {
    name: 'Back',
    url: '/assets/aistudio/12_back_6f929363.png',
    description: 'Gazing forward into the path ahead',
  },
  curious: {
    name: 'Curious',
    url: '/assets/aistudio/13_curious_8bfef2de.png',
    description: 'Inquisitive and exploratory',
  },
  star_eyes: {
    name: 'Star Eyes',
    url: '/assets/aistudio/14_star-eyes_739eb9c7.png',
    description: 'Inspired and mesmerized',
  },
  sit: {
    name: 'Sit',
    url: '/assets/aistudio/15_sit_5f895b43.png',
    description: 'Comfortably studying together',
  },
  float: {
    name: 'Float',
    url: '/assets/aistudio/16_float_3c9f307b.png',
    description: 'Effortlessly floating in the sky kingdom',
  },
};

export const LUNI_SPRITESHEET = '/assets/aistudio/luni_spritesheet_4x4_0b3ff038.png';
export const ACHIEVEMENTS_SPRITESHEET = '/assets/aistudio/achievements_spritesheet_5x4_5ce7c5bc.png';

export interface GemstoneAsset {
  id: number;
  slug: string;
  achievementId: string;
  name: string;
  category: 'NT' | 'BA' | 'SM' | 'Special';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  url: string;
  description: string;
  requirement: string;
}

export const GEMSTONE_ASSETS: GemstoneAsset[] = [
  // Networking Technology (Blue)
  {
    id: 1,
    slug: 'peridots-protocol',
    achievementId: 'nt-peridots-protocol',
    name: "Peridot's Protocol",
    category: 'NT',
    rarity: 'Common',
    url: '/assets/aistudio/01_peridots_protocol_f55976cf.png',
    description: 'Mark Networking Technology track as explored and review network basics.',
    requirement: "Mark Networking Technology as explored.",
  },
  {
    id: 2,
    slug: 'packet-pathfinder',
    achievementId: 'nt-packet-pathfinder',
    name: 'Packet Pathfinder',
    category: 'NT',
    rarity: 'Common',
    url: '/assets/aistudio/02_packet_pathfinder_01c5c33b.png',
    description: 'Trace the routing of packets across local and wide-area networks.',
    requirement: "Complete the designated NT networking-fundamentals learning activity or approved activity challenge.",
  },
  {
    id: 3,
    slug: 'signal-keeper',
    achievementId: 'nt-signal-keeper',
    name: 'Signal Keeper',
    category: 'NT',
    rarity: 'Uncommon',
    url: '/assets/aistudio/03_signal_keeper_30d58945.png',
    description: 'Maintain uninterrupted transmission and master signal frequencies.',
    requirement: "Complete the designated NT troubleshooting challenge.",
  },
  {
    id: 4,
    slug: 'guardian-of-the-grid',
    achievementId: 'nt-guardian-of-the-grid',
    name: 'Guardian of the Grid',
    category: 'NT',
    rarity: 'Rare',
    url: '/assets/aistudio/04_guardian_of_the_grid_d23f2dd5.png',
    description: 'Defend network topologies with robust firewall and access configurations.',
    requirement: "Complete the designated NT security challenge.",
  },
  {
    id: 5,
    slug: 'techno-gem',
    achievementId: 'nt-techno-gem',
    name: 'Techno-Gem',
    category: 'NT',
    rarity: 'Epic',
    url: '/assets/aistudio/05_techno_gem_6f2d6183.png',
    description: 'Master all foundational Networking Technology knowledge milestones.',
    requirement: "Unlock the four preceding NT achievements.",
  },

  // Business Analytics (Violet)
  {
    id: 6,
    slug: 'garnets-foresight',
    achievementId: 'ba-garnets-foresight',
    name: "Garnet's Foresight",
    category: 'BA',
    rarity: 'Common',
    url: '/assets/aistudio/06_garnets_foresight_de542d8b.png',
    description: 'Mark Business Analytics track as explored and inspect data storytelling.',
    requirement: "Mark Business Analytics as explored.",
  },
  {
    id: 7,
    slug: 'pattern-seeker',
    achievementId: 'ba-pattern-seeker',
    name: 'Pattern Seeker',
    category: 'BA',
    rarity: 'Common',
    url: '/assets/aistudio/07_pattern_seeker_d68a7bbb.png',
    description: 'Identify correlations and trends in real-world business datasets.',
    requirement: "Complete the designated BA pattern-recognition activity.",
  },
  {
    id: 8,
    slug: 'data-detective',
    achievementId: 'ba-data-detective',
    name: 'Data Detective',
    category: 'BA',
    rarity: 'Uncommon',
    url: '/assets/aistudio/08_data_detective_a158b94f.png',
    description: 'Investigate business metrics to uncover root causes of performance shifts.',
    requirement: "Complete the designated BA data-interpretation challenge.",
  },
  {
    id: 9,
    slug: 'oracle-of-numbers',
    achievementId: 'ba-oracle-of-numbers',
    name: 'Oracle of Numbers',
    category: 'BA',
    rarity: 'Rare',
    url: '/assets/aistudio/09_oracle_of_numbers_0648650f.png',
    description: 'Transform raw numerical values into strategic predictive roadmaps.',
    requirement: "Complete the designated BA business-problem-solving challenge.",
  },
  {
    id: 10,
    slug: 'crystal-vision',
    achievementId: 'ba-crystal-vision',
    name: 'Crystal Vision',
    category: 'BA',
    rarity: 'Epic',
    url: '/assets/aistudio/10_crystal_vision_a4213e39.png',
    description: 'Master all foundational Business Analytics knowledge milestones.',
    requirement: "Unlock the four preceding BA achievements.",
  },

  // Service Management (Green)
  {
    id: 11,
    slug: 'pearls-precision',
    achievementId: 'sm-pearls-precision',
    name: "Pearl's Precision",
    category: 'SM',
    rarity: 'Common',
    url: '/assets/aistudio/11_pearls_precision_8d450275.png',
    description: 'Mark Service Management track as explored and understand ITIL principles.',
    requirement: "Mark Service Management as explored.",
  },
  {
    id: 12,
    slug: 'customer-champion',
    achievementId: 'sm-customer-champion',
    name: 'Customer Champion',
    category: 'SM',
    rarity: 'Common',
    url: '/assets/aistudio/12_customer_champion_85e15dc6.png',
    description: 'Champion stakeholder empathy and user-centric IT service design.',
    requirement: "Complete the designated SM customer-support scenario.",
  },
  {
    id: 13,
    slug: 'workflow-weaver',
    achievementId: 'sm-workflow-weaver',
    name: 'Workflow Weaver',
    category: 'SM',
    rarity: 'Uncommon',
    url: '/assets/aistudio/13_workflow_weaver_1b55f146.png',
    description: 'Streamline operational workflows to eliminate bottlenecks and silos.',
    requirement: "Complete the designated SM workflow-optimization activity.",
  },
  {
    id: 14,
    slug: 'keeper-of-standards',
    achievementId: 'sm-keeper-of-standards',
    name: 'Keeper of Standards',
    category: 'SM',
    rarity: 'Rare',
    url: '/assets/aistudio/14_keeper_of_standards_3e9fd767.png',
    description: 'Uphold SLA quality benchmarks and continuous service excellence.',
    requirement: "Complete the designated SM IT service management challenge.",
  },
  {
    id: 15,
    slug: 'perfect-coordination',
    achievementId: 'sm-perfect-coordination',
    name: 'Perfect Coordination',
    category: 'SM',
    rarity: 'Epic',
    url: '/assets/aistudio/15_perfect_coordination_3632e49f.png',
    description: 'Master all foundational Service Management knowledge milestones.',
    requirement: "Unlock the four preceding SM achievements.",
  },

  // Special Achievements (Gold / Prism)
  {
    id: 16,
    slug: 'first-spark',
    achievementId: 'special-first-spark',
    name: 'First Spark',
    category: 'Special',
    rarity: 'Common',
    url: '/assets/aistudio/16_first_spark_2f17682e.png',
    description: 'Celebrate completing your first CTRL Quiz assessment.',
    requirement: "Successfully submit your first completed CTRL Quiz attempt.",
  },
  {
    id: 17,
    slug: 'crystal-collector',
    achievementId: 'special-crystal-collector',
    name: 'Crystal Collector',
    category: 'Special',
    rarity: 'Rare',
    url: '/assets/aistudio/17_crystal_collector_d35904e3.png',
    description: 'Collect 10 distinct gemstones across your academic exploration journey.',
    requirement: "Unlock 10 distinct achievements.",
  },
  {
    id: 18,
    slug: 'fusion-theory',
    achievementId: 'special-fusion-theory',
    name: 'Fusion Theory',
    category: 'Special',
    rarity: 'Uncommon',
    url: '/assets/aistudio/18_fusion_theory_b3ac2ea4.png',
    description: 'Compare two or three academic tracks side-by-side in Path Compare.',
    requirement: "Complete a meaningful comparison involving at least two academic tracks.",
  },
  {
    id: 19,
    slug: 'beyond-the-surface',
    achievementId: 'special-beyond-the-surface',
    name: 'Beyond the Surface',
    category: 'Special',
    rarity: 'Epic',
    url: '/assets/aistudio/19_beyond_the_surface_3b4446dd.png',
    description: 'Retake the assessment to deepen your understanding and compare results.',
    requirement: "Complete an eligible quiz retake and compare results with a previous completed attempt.",
  },
  {
    id: 20,
    slug: 'your-own-universe',
    achievementId: 'special-your-own-universe',
    name: 'Your Own Universe',
    category: 'Special',
    rarity: 'Legendary',
    url: '/assets/aistudio/20_your_own_universe_bf6e0e20.png',
    description: 'The supreme crown milestone: unlock all 15 track-specific achievements.',
    requirement: "Unlock all 15 NT, BA, and SM track-specific achievements.",
  },
];
