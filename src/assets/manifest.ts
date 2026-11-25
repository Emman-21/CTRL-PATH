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
  | 'track_files'
  | 'quiz_cheer'
  | 'quiz_celebration'
  | 'quiz_reminder'
  | 'quiz_prep'
  | 'path_compare'
  | 'shock';

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
    url: '/assets/pictures/luni_track_read_v2.png',
    description: 'Reading a guide book while exploring BSIT pathways',
  },
  track_wifi: {
    name: 'Networking WiFi',
    url: '/assets/pictures/luni_track_nt_wifi_v2.png',
    description: 'Holding a glowing WiFi signal orb for Networking Technology',
  },
  track_charts: {
    name: 'Business Analytics Charts',
    url: '/assets/pictures/luni_track_ba_charts_v2.png',
    description: 'Analyzing charts and dashboards for Business Analytics',
  },
  track_files: {
    name: 'Service Management Files',
    url: '/assets/pictures/luni_track_sm_files_v2.png',
    description: 'Organizing service files and documents for Service Management',
  },
  quiz_cheer: {
    name: 'Quiz Cheer',
    url: '/assets/aistudio/luni_cheer_413e2f61.png',
    description: 'Cheering on students while answering quiz questions',
  },
  quiz_celebration: {
    name: 'Quiz Celebration',
    url: '/assets/aistudio/luni_celebration_45aeaff1.png',
    description: 'Celebrating completed chapters and finishing the CTRL Quiz',
  },
  quiz_reminder: {
    name: 'Reminder',
    url: '/assets/aistudio/luni_reminder_0428ece3.png',
    description: 'Sharing a helpful reminder with students',
  },
  quiz_prep: {
    name: 'Quiz Preparation',
    url: '/assets/aistudio/luni_quiz_prep.png',
    description: 'Pointing at a chalkboard to guide students before a quiz chapter',
  },
  path_compare: {
    name: 'Path Compare',
    url: '/assets/aistudio/luni_path_compare.png',
    description: 'Holding the Networking Technology, Business Analytics, and Service Management gemstones',
  },
  shock: {
    name: 'Shocked',
    url: '/assets/aistudio/luni_shock_1f8c7ebc.png',
    description: 'Wide-eyed amazement at Smart Results insights',
  },
};

export const LUNI_SPRITESHEET = '/assets/pictures/luni_spritesheet_4x4_0b3ff038.png';
export const LUNI_WAVE_V2_SHEET = '/assets/pictures/luni_wave_v2.png';
export const LUNI_WINK_V2_SHEET = '/assets/pictures/luni_wink_v2.png';
export const LUNI_WAND_V2_SHEET = '/assets/pictures/luni_wand_v2.png';
export const LUNI_HAPPY_V2_SHEET = '/assets/pictures/luni_happy_v2.png';
export const LUNI_LISTENING_V2_SHEET = '/assets/pictures/luni_listening_v2.png';
export const LUNI_THINKING_V2_SHEET = '/assets/pictures/luni_thinking_v2.png';
export const LUNI_SPEAKING_V2_SHEET = '/assets/pictures/luni_speaking_v2.png';
export const LUNI_SLEEPING_V2_SHEET = '/assets/pictures/luni_sleeping_v2.png';
export const LUNI_WAKING_V2_SHEET = '/assets/pictures/luni_waking_v2.png';
export const ACHIEVEMENTS_SPRITESHEET = '/assets/aistudio/Gemini_Generated_Image_u5979bu5979bu597_54f4ca20.jpg';

export interface GemstoneAsset {
  id: number;
  sortOrder?: number;
  slug: string;
  achievementId: string;
  name: string;
  category: 'NT' | 'BA' | 'SM' | 'Special';
  rarity: 'Common' | 'Rare' | 'Special' | 'Epic' | 'Legendary';
  url: string;
  description: string;
  requirement: string;
}

export const GEMSTONE_ASSETS: GemstoneAsset[] = [
  // Networking Technology (Blue)
  {
    id: 1,
    sortOrder: 1,
    slug: 'peridots-protocol',
    achievementId: 'nt-peridots-protocol',
    name: "Sapphire's Protocol",
    category: 'NT',
    rarity: 'Rare',
    url: '/assets/pictures/01_sapphires_protocol_v2.png',
    description: 'Master connected systems and embedded automation across the Internet of Things subject.',
    requirement: 'Complete all modules in NTT 402 - Internet of Things.',
  },
  {
    id: 2,
    sortOrder: 2,
    slug: 'packet-pathfinder',
    achievementId: 'nt-packet-pathfinder',
    name: 'Packet Pathfinder',
    category: 'NT',
    rarity: 'Rare',
    url: '/assets/pictures/02_packet_pathfinder_v2.png',
    description: 'Trace enterprise routing, switching, and security across Computer Networking 3.',
    requirement: 'Complete all available modules in NTT 401 - Computer Networking 3.',
  },
  {
    id: 3,
    sortOrder: 3,
    slug: 'signal-keeper',
    achievementId: 'nt-signal-keeper',
    name: 'Signal Keeper',
    category: 'NT',
    rarity: 'Special',
    url: '/assets/pictures/03_signal_keeper_v2.png',
    description: 'Build complete fluency across both foundational Networking Technology subjects.',
    requirement: 'Complete all available modules in both Networking Technology subjects (NTT 401 & NTT 402).',
  },
  {
    id: 4,
    sortOrder: 4,
    slug: 'guardian-of-the-grid',
    achievementId: 'nt-guardian-of-the-grid',
    name: 'Guardian of the Grid',
    category: 'NT',
    rarity: 'Special',
    url: '/assets/pictures/04_guardian_of_the_grid_v2.png',
    description: 'Demonstrate strong networking and infrastructure reasoning on the CTRL Quiz.',
    requirement: 'Score 70% or higher in Networking Technology (NT) on a completed CTRL Quiz attempt.',
  },
  {
    id: 5,
    sortOrder: 5,
    slug: 'techno-gem',
    achievementId: 'nt-techno-gem',
    name: 'Techno-Gem',
    category: 'NT',
    rarity: 'Epic',
    url: '/assets/pictures/05_techno_gem_v3.png',
    description: 'Master all foundational Networking Technology knowledge milestones.',
    requirement: 'Achieve all four preceding Networking Technology achievements.',
  },

  // Business Analytics (Violet)
  {
    id: 6,
    sortOrder: 6,
    slug: 'garnets-foresight',
    achievementId: 'ba-garnets-foresight',
    name: "Amethyst's Foresight",
    category: 'BA',
    rarity: 'Rare',
    url: '/assets/pictures/06_amethysts_foresight_v2.png',
    description: 'Build strong foundations in BI tools, data visualization, and data storytelling.',
    requirement: 'Complete all available modules in BAT 401 - Fundamentals of Business Analytics.',
  },
  {
    id: 7,
    sortOrder: 7,
    slug: 'pattern-seeker',
    achievementId: 'ba-pattern-seeker',
    name: 'Pattern Seeker',
    category: 'BA',
    rarity: 'Rare',
    url: '/assets/pictures/07_pattern_seeker_v2.png',
    description: 'Identify predictive correlations and optimization models across analytical workflows.',
    requirement: 'Complete all available modules in BAT 402 - Fundamentals of Analytics Modeling.',
  },
  {
    id: 8,
    sortOrder: 8,
    slug: 'data-detective',
    achievementId: 'ba-data-detective',
    name: 'Data Detective',
    category: 'BA',
    rarity: 'Special',
    url: '/assets/pictures/08_data_detective_v2.png',
    description: 'Unite business intelligence and modeling across the full Business Analytics track.',
    requirement: 'Complete all available modules in both Business Analytics subjects (BAT 401 & BAT 402).',
  },
  {
    id: 9,
    sortOrder: 9,
    slug: 'oracle-of-numbers',
    achievementId: 'ba-oracle-of-numbers',
    name: 'Oracle of Numbers',
    category: 'BA',
    rarity: 'Special',
    url: '/assets/pictures/09_oracle_of_numbers_v2.png',
    description: 'Show high quantitative aptitude and analytical insight in your CTRL Quiz results.',
    requirement: 'Score 70% or higher in Business Analytics (BA) on a completed CTRL Quiz attempt.',
  },
  {
    id: 10,
    sortOrder: 10,
    slug: 'crystal-vision',
    achievementId: 'ba-crystal-vision',
    name: 'Crystal Vision',
    category: 'BA',
    rarity: 'Epic',
    url: '/assets/pictures/10_crystal_vision_v2.png',
    description: 'Master all foundational Business Analytics knowledge milestones.',
    requirement: 'Unlock all four preceding Business Analytics achievements.',
  },

  // Service Management (Aquamarine / Teal)
  {
    id: 11,
    sortOrder: 11,
    slug: 'pearls-precision',
    achievementId: 'sm-pearls-precision',
    name: "Emerald's Precision",
    category: 'SM',
    rarity: 'Rare',
    url: '/assets/pictures/11_aquamarines_precision_v2.png',
    description: 'Understand outsourcing models, IT-BPM governance, and structured service operations.',
    requirement: 'Complete all available modules in SMT 401 - Fundamentals of BPO 101.',
  },
  {
    id: 12,
    sortOrder: 12,
    slug: 'customer-champion',
    achievementId: 'sm-customer-champion',
    name: 'Customer Champion',
    category: 'SM',
    rarity: 'Rare',
    url: '/assets/pictures/12_customer_champion_v2.png',
    description: 'Champion clear client communication, professional writing, and empathetic support.',
    requirement: 'Complete all available modules in SMT 402 - Business Communication.',
  },
  {
    id: 13,
    sortOrder: 13,
    slug: 'workflow-weaver',
    achievementId: 'sm-workflow-weaver',
    name: 'Workflow Weaver',
    category: 'SM',
    rarity: 'Special',
    url: '/assets/pictures/13_workflow_weaver_v2.png',
    description: 'Connect operational rigor with polished communication across both SM subjects.',
    requirement: 'Complete all available modules in both Service Management subjects (SMT 401 & SMT 402).',
  },
  {
    id: 14,
    sortOrder: 14,
    slug: 'keeper-of-standards',
    achievementId: 'sm-keeper-of-standards',
    name: 'Keeper of Standards',
    category: 'SM',
    rarity: 'Special',
    url: '/assets/pictures/14_keeper_of_standards_v2.png',
    description: 'Demonstrate strong service excellence and workflow judgment in your CTRL Quiz results.',
    requirement: 'Score 70% or higher in Service Management (SM) on a completed CTRL Quiz attempt.',
  },
  {
    id: 15,
    sortOrder: 15,
    slug: 'perfect-coordination',
    achievementId: 'sm-perfect-coordination',
    name: 'Perfect Coordination',
    category: 'SM',
    rarity: 'Epic',
    url: '/assets/pictures/15_perfect_coordination_v2.png',
    description: 'Master all foundational Service Management knowledge milestones.',
    requirement: 'Unlock all four preceding Service Management achievements.',
  },

  // Special Achievements (Gold / Prism) — IDs 16..20 retain canonical order, sortOrder 16..25 defines Vault display order
  {
    id: 16,
    sortOrder: 20,
    slug: 'first-spark',
    achievementId: 'special-first-spark',
    name: 'First Spark',
    category: 'Special',
    rarity: 'Rare',
    url: '/assets/pictures/16_first_spark_v2.png',
    description: 'Celebrate completing your first CTRL Quiz assessment.',
    requirement: 'Complete your first CTRL Quiz attempt.',
  },
  {
    id: 17,
    sortOrder: 23,
    slug: 'crystal-collector',
    achievementId: 'special-crystal-collector',
    name: 'Crystal Collector',
    category: 'Special',
    rarity: 'Epic',
    url: '/assets/pictures/17_crystal_collector_v2.png',
    description: 'Collect 10 distinct gemstones across your academic exploration journey.',
    requirement: 'Unlock 10 distinct gemstones.',
  },
  {
    id: 18,
    sortOrder: 22,
    slug: 'fusion-theory',
    achievementId: 'special-fusion-theory',
    name: 'Fusion Theory',
    category: 'Special',
    rarity: 'Special',
    url: '/assets/pictures/18_fusion_theory_v2.png',
    description: 'Discover balanced aptitude where two or all three BSIT tracks tie at the top of your quiz results.',
    requirement: 'Earn a balanced CTRL Quiz result where 2 or 3 tracks are equal at the top.',
  },
  {
    id: 19,
    sortOrder: 18,
    slug: 'beyond-the-surface',
    achievementId: 'special-beyond-the-surface',
    name: 'Beyond the Surface',
    category: 'Special',
    rarity: 'Rare',
    url: '/assets/pictures/19_beyond_the_surface_v2.png',
    description: 'Revisit the CTRL Quiz to test your growth and deepen your self-discovery.',
    requirement: 'Retake the CTRL Quiz at least once.',
  },
  {
    id: 20,
    sortOrder: 25,
    slug: 'your-own-universe',
    achievementId: 'special-your-own-universe',
    name: 'Your Own Universe',
    category: 'Special',
    rarity: 'Legendary',
    url: '/assets/pictures/20_your_own_universe_v2.png',
    description: 'The supreme crown milestone: unlock all 15 track-specific achievements.',
    requirement: 'Unlock all 15 NT, BA, and SM track-specific achievements.',
  },
  {
    id: 21,
    sortOrder: 16,
    slug: 'command-ready',
    achievementId: 'special-command-ready',
    name: 'Command Ready',
    category: 'Special',
    rarity: 'Common',
    url: '/assets/pictures/21_command_ready_v2.png',
    description: 'Set up your full student identity so your workspace feels uniquely yours.',
    requirement: 'Complete your display name, program, year level, section, and biography in the Control Center.',
  },
  {
    id: 22,
    sortOrder: 17,
    slug: 'story-seeker',
    achievementId: 'special-story-seeker',
    name: 'Story Seeker',
    category: 'Special',
    rarity: 'Common',
    url: '/assets/pictures/22_story_seeker_v2.png',
    description: 'Gain real perspective from upperclassmen and graduates who walked these pathways.',
    requirement: 'Read the full story view of one alumni in Alumni Stories.',
  },
  {
    id: 23,
    sortOrder: 19,
    slug: 'steady-flame',
    achievementId: 'special-steady-flame',
    name: 'Steady Flame',
    category: 'Special',
    rarity: 'Rare',
    url: '/assets/pictures/23_steady_flame_v2.png',
    description: 'Build steady momentum by returning across three consecutive learning days.',
    requirement: 'Light up your learning streak for 3 consecutive days.',
  },
  {
    id: 24,
    sortOrder: 21,
    slug: 'inner-glow',
    achievementId: 'special-inner-glow',
    name: 'Inner Glow',
    category: 'Special',
    rarity: 'Rare',
    url: '/assets/pictures/24_inner_glow_v2.png',
    description: 'Pause to reflect on what excites you and what questions matter most to your path.',
    requirement: 'Add and save your thoughts in the Reflection feature.',
  },
  {
    id: 25,
    sortOrder: 24,
    slug: 'learning-genius',
    achievementId: 'special-learning-genius',
    name: 'Learning Genius',
    category: 'Special',
    rarity: 'Legendary',
    url: '/assets/pictures/25_learning_genius_v2.png',
    description: 'Explore every curriculum subject across Networking Technology, Business Analytics, and Service Management.',
    requirement: 'Complete all three Track Explorer modules across NT, BA, and SM.',
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

