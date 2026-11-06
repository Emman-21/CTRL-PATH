export interface LevelMeta {
  level: number;
  name: string;
  typeTitle: string;
  questionCount: number;
  ntCount: number;
  baCount: number;
  smCount: number;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging' | 'Advanced';
  description: string;
  instructions: string;
  luniTip: string;
  keyTopics: string[];
}

export const QUIZ_LEVELS: LevelMeta[] = [
  {
    level: 1,
    name: 'Chapter I: Foundations of Knowledge',
    typeTitle: 'True or False',
    questionCount: 9,
    ntCount: 3,
    baCount: 3,
    smCount: 3,
    estimatedTime: '4–6 mins',
    difficulty: 'Easy',
    description:
      'Evaluate foundational statements across networking concepts, data fundamentals, and IT service workflows.',
    instructions:
      'Read each statement carefully and determine whether it is Factually Accurate (True) or False. You can revise your choice at any point before submitting the level.',
    luniTip:
      'Trust your instincts! Remember that questions are evenly drawn across all three tracks to give you an objective reflection of your natural baseline.',
    keyTopics: [
      'Layer 2 Switches vs Layer 3 Routers (NT)',
      'Descriptive vs Predictive Data Models (BA)',
      'Service Level Agreements (SLA) & ITIL Core (SM)',
    ],
  },
  {
    level: 2,
    name: 'Chapter II: Applied Concepts',
    typeTitle: 'Multiple Choice',
    questionCount: 18,
    ntCount: 6,
    baCount: 6,
    smCount: 6,
    estimatedTime: '8–12 mins',
    difficulty: 'Medium',
    description:
      'Analyze four distinct options to identify the correct protocol, diagnostic approach, analytics metric, or service policy.',
    instructions:
      'Select the single best answer for each scenario. Choice positions are randomized to encourage critical thinking over pattern guessing.',
    luniTip:
      'Eliminate options you know are incorrect first. Take a deep breath if you encounter an unfamiliar term!',
    keyTopics: [
      'OSI and TCP/IP Packet Encapsulation (NT)',
      'Data Warehousing & SQL Query Aggregation (BA)',
      'Incident Management vs Problem Management (SM)',
    ],
  },
  {
    level: 3,
    name: 'Chapter III: Relational Connections',
    typeTitle: 'Matching Type',
    questionCount: 21,
    ntCount: 7,
    baCount: 7,
    smCount: 7,
    estimatedTime: '12–16 mins',
    difficulty: 'Medium',
    description:
      'Connect specialized IT acronyms, protocols, formulas, and frameworks to their exact industry definitions.',
    instructions:
      'Select the matching definition for each term. The system will prevent duplicate assignments when a 1:1 match is required.',
    luniTip:
      'Matching tests how concepts interlock! Look for key vocabulary words in each definition.',
    keyTopics: [
      'DNS, DHCP, ARP, NAT & Subnet Masks (NT)',
      'KPIs, Dashboards, Outliers, Correlation & ETL (BA)',
      'SLA, OLA, Change Enablement, Service Catalog & CX (SM)',
    ],
  },
  {
    level: 4,
    name: 'Chapter IV: Processes & Procedures',
    typeTitle: 'Sequencing / Ordering',
    questionCount: 24,
    ntCount: 8,
    baCount: 8,
    smCount: 8,
    estimatedTime: '14–18 mins',
    difficulty: 'Challenging',
    description:
      'Arrange the chronological order of networking packet journeys, data analytics pipelines, and service ticket resolution workflows.',
    instructions:
      'Use the Move Up (▲) and Move Down (▼) controls to organize the steps from first to last. You can reset the sequence at any time.',
    luniTip:
      'Think about what must happen first before the next step can begin. Step by step, the picture becomes clear!',
    keyTopics: [
      'DNS Resolution & HTTP 3-Way Handshake (NT)',
      'Data Cleaning, Transformation & Model Deployment (BA)',
      'Incident Logging, Triage, Resolution & Post-Mortem (SM)',
    ],
  },
  {
    level: 5,
    name: 'Chapter V: Mastery & Identification',
    typeTitle: 'Identification & Enumeration',
    questionCount: 27,
    ntCount: 9,
    baCount: 9,
    smCount: 9,
    estimatedTime: '15–20 mins',
    difficulty: 'Advanced',
    description:
      'Demonstrate deep comprehension by typing key terms, protocols, metrics, and enumerating critical IT principles.',
    instructions:
      'Type your response into the input field. Grading is case-insensitive with whitespace normalization. Accepted standard acronyms are recognized.',
    luniTip:
      'This is the final chapter of your assessment adventure! Double-check your spelling before continuing to the final submission review.',
    keyTopics: [
      'CIA Triad, IPv6 Bit Length, Default Gateways (NT)',
      'Structured vs Unstructured Data, Business Intelligence, Regression (BA)',
      'ITIL Guiding Principles, Service Desk, Customer Journey Mapping (SM)',
    ],
  },
];
