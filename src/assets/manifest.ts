/**
 * CTRL+PATH Phase 1 & 2 Asset Manifest
 * Maps all official backgrounds, Luni poses, gemstones, and UI screenshots
 */

export const BACKGROUNDS = {
  dashboardSkyKingdom: '/assets/pictures/01_dashboard_moonlit_sky_kingdom_718c0f20.png',
  trackExplorerAcademy: '/assets/pictures/02_track_explorer_floating_academy_ab75bacc.png',
  achievementsCrystalGarden: '/assets/pictures/03_achievements_crystal_garden_48a2e3d4.png',
  quizMinimalClouds: '/assets/pictures/04_quiz_minimal_clouds_872b3764.png',
} as const;

export const UNIVERSITY_LOGOS = {
  bsuAlangilan: {
    url: '/assets/aistudio/image_42b32454.png',
    alt: 'Batangas State University Alangilan Official Seal',
    label: 'Batangas State University',
  },
  cicsAlangilan: {
    url: '/assets/aistudio/423862284_122100317924200684_1941444354870706094_n_4155d14a.jpg',
    alt: 'Integrated Information Technology Student Society (IINTESS) — CICS Alangilan Seal',
    label: 'CICS Alangilan ~ IINTESS',
  },
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
  | 'float'
  | 'track_read'
  | 'track_wifi'
  | 'track_charts'
  | 'track_files';

export const LUNI_POSES: Record<LuniPoseKey, { name: string; url: string; description: string }> = {
  idle: {
    name: 'Idle',
    url: '/assets/pictures/01_idle_4dd55407.png',
    description: 'Calm and steady moonstone presence',
  },
  wave: {
    name: 'Wave',
    url: '/assets/pictures/02_wave_732e3934.png',
    description: 'Friendly greeting to students',
  },
  point: {
    name: 'Point',
    url: '/assets/pictures/03_point_b53febe8.png',
    description: 'Guiding toward next steps',
  },
  sleep: {
    name: 'Sleep',
    url: '/assets/pictures/04_sleep_a3c735d1.png',
    description: 'Peaceful resting state',
  },
  surprised: {
    name: 'Surprised',
    url: '/assets/pictures/05_surprised_c26ec6dd.png',
    description: 'Expressive amazement',
  },
  love: {
    name: 'Love',
    url: '/assets/pictures/06_love_0942c750.png',
    description: 'Warm encouragement and care',
  },
  sad: {
    name: 'Sad',
    url: '/assets/pictures/07_sad_9434ee93.png',
    description: 'Empathy during tough moments',
  },
  angry: {
    name: 'Determined',
    url: '/assets/pictures/08_angry_8678b10a.png',
    description: 'Fiery determination to overcome challenges',
  },
  cast: {
    name: 'Cast',
    url: '/assets/pictures/09_cast_575421e8.png',
    description: 'Casting magical insight',
  },
  celebrate: {
    name: 'Celebrate',
    url: '/assets/pictures/10_celebrate_1f5d619f.png',
    description: 'Joyful achievement celebration',
  },
  walk: {
    name: 'Walk',
    url: '/assets/pictures/11_walk_fd3f3094.png',
    description: 'Walking beside the student',
  },
  back: {
    name: 'Back',
    url: '/assets/pictures/12_back_6f929363.png',
    description: 'Gazing forward into the path ahead',
  },
  curious: {
    name: 'Curious',
    url: '/assets/pictures/13_curious_8bfef2de.png',
    description: 'Inquisitive and exploratory',
  },
  star_eyes: {
    name: 'Star Eyes',
    url: '/assets/pictures/14_star-eyes_739eb9c7.png',
    description: 'Inspired and mesmerized',
  },
  sit: {
    name: 'Sit',
    url: '/assets/pictures/15_sit_5f895b43.png',
    description: 'Comfortably studying together',
  },
  float: {
    name: 'Float',
    url: '/assets/pictures/16_float_3c9f307b.png',
    description: 'Effortlessly floating in the sky kingdom',
  },
  track_read: {
    name: 'Track Explorer Read',
    url: '/assets/pictures/luni_track_read.png',
    description: 'Reading a guide book while exploring BSIT pathways',
  },
  track_wifi: {
    name: 'Networking WiFi',
    url: '/assets/pictures/luni_track_nt_wifi.png',
    description: 'Holding a glowing WiFi signal orb for Networking Technology',
  },
  track_charts: {
    name: 'Business Analytics Charts',
    url: '/assets/pictures/luni_track_ba_charts.png',
    description: 'Analyzing charts and dashboards for Business Analytics',
  },
  track_files: {
    name: 'Service Management Files',
    url: '/assets/pictures/luni_track_sm_files.png',
    description: 'Organizing service folders and documents for Service Management',
  },
};

export const LUNI_SPRITESHEET = '/assets/pictures/luni_spritesheet_4x4_0b3ff038.png';
export const ACHIEVEMENTS_SPRITESHEET = '/assets/aistudio/Gemini_Generated_Image_u5979bu5979bu597_54f4ca20.jpg';

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
    name: "Sapphire's Protocol",
    category: 'NT',
    rarity: 'Common',
    url: '/assets/pictures/01_sapphires_protocol_v2.png',
    description: 'Complete all modules across both Networking Technology subjects to master network and IoT fundamentals.',
    requirement: 'Complete all modules in both Networking Technology subjects (NTT 401 & NTT 402).',
  },
  {
    id: 2,
    slug: 'packet-pathfinder',
    achievementId: 'nt-packet-pathfinder',
    name: 'Packet Pathfinder',
    category: 'NT',
    rarity: 'Common',
    url: '/assets/pictures/02_packet_pathfinder_v2.png',
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
    url: '/assets/pictures/03_signal_keeper_v2.png',
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
    url: '/assets/pictures/04_guardian_of_the_grid_v2.png',
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
    url: '/assets/pictures/05_techno_gem_v2.png',
    description: 'Master all foundational Networking Technology knowledge milestones.',
    requirement: "Unlock the four preceding NT achievements.",
  },

  // Business Analytics (Violet)
  {
    id: 6,
    slug: 'garnets-foresight',
    achievementId: 'ba-garnets-foresight',
    name: "Amethyst's Foresight",
    category: 'BA',
    rarity: 'Common',
    url: '/assets/pictures/06_amethysts_foresight_v2.png',
    description: 'Complete all available modules across both Business Analytics subjects and explore data storytelling.',
    requirement: 'Complete all available modules in both Business Analytics subjects (BAT 401 & BAT 402).',
  },
  {
    id: 7,
    slug: 'pattern-seeker',
    achievementId: 'ba-pattern-seeker',
    name: 'Pattern Seeker',
    category: 'BA',
    rarity: 'Common',
    url: '/assets/pictures/07_pattern_seeker_v2.png',
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
    url: '/assets/pictures/08_data_detective_v2.png',
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
    url: '/assets/pictures/09_oracle_of_numbers_v2.png',
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
    url: '/assets/pictures/10_crystal_vision_v2.png',
    description: 'Master all foundational Business Analytics knowledge milestones.',
    requirement: "Unlock the four preceding BA achievements.",
  },

  // Service Management (Aquamarine / Teal)
  {
    id: 11,
    slug: 'pearls-precision',
    achievementId: 'sm-pearls-precision',
    name: "Emerald's Precision",
    category: 'SM',
    rarity: 'Common',
    url: '/assets/pictures/11_aquamarines_precision_v2.png',
    description: 'Complete all modules across both Service Management subjects and understand ITIL workflows.',
    requirement: 'Complete all modules in both Service Management subjects (SMT 401 & SMT 402).',
  },
  {
    id: 12,
    slug: 'customer-champion',
    achievementId: 'sm-customer-champion',
    name: 'Customer Champion',
    category: 'SM',
    rarity: 'Common',
    url: '/assets/pictures/12_customer_champion_v2.png',
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
    url: '/assets/pictures/13_workflow_weaver_v2.png',
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
    url: '/assets/pictures/14_keeper_of_standards_v2.png',
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
    url: '/assets/pictures/15_perfect_coordination_v2.png',
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
    url: '/assets/pictures/16_first_spark_v2.png',
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
    url: '/assets/pictures/17_crystal_collector_v2.png',
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
    url: '/assets/pictures/18_fusion_theory_v2.png',
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
    url: '/assets/pictures/19_beyond_the_surface_v2.png',
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
    url: '/assets/pictures/20_your_own_universe_v2.png',
    description: 'The supreme crown milestone: unlock all 15 track-specific achievements.',
    requirement: "Unlock all 15 NT, BA, and SM track-specific achievements.",
  },
];

/**
 * High-definition AI-generated assets for Track Explorer & NetAcad Reader
 * Generated via Gemini per user prompts and stored in /public/assets/aistudio/
 */
export const TRACK_GENERATED_IMAGES = {
  /** Modern data center server room with engineer and blue/cyan LED cables (NT / Computer Networking 3) */
  ntDataCenter: '/assets/aistudio/Gemini_Generated_Image_ff5grlff5grlff5g_c3f13806.jpg',
  /** Ultrawide 3-monitor analyst workstation with data flows and architecture (BA / Systems Analysis) */
  baWorkstation: '/assets/aistudio/Gemini_Generated_Image_svdehgsvdehgsvde_cfa1031e.jpg',
  /** 24/7 IT-BPO enterprise operations command center with timezone clocks and multi-screens (SM) */
  smCommandCenter: '/assets/aistudio/Gemini_Generated_Image_saf5susaf5susaf5_1f235ff0.jpg',
  /** Glowing digital neon cybersecurity padlock in cyan matrix (Junior Cybersecurity Analyst / NetAcad) */
  cyberSecurityLock: '/assets/aistudio/Gemini_Generated_Image_lsy053lsy053lsy0_11d55428.jpg',
} as const;

