import type { AlumniStory } from '../types/community';

// Verified student-submitted alumni/senior stories approved for publication.
export const ALUMNI_STORIES: readonly AlumniStory[] = [
  {
    id: 'lance-edward-dela-rosa',
    track: 'NT',
    title: 'Beyond Cables and Commands: Trust the Process',
    excerpt:
      "When I first chose Network Technology, I honestly didn't know what I was getting into. It turned out to be much more than cables, routers, and memorizing commands—NT taught me how to think one layer at a time.",
    quote:
      "Don't give up when the ping fails. Every 'Request timed out' is just a problem waiting to be traced, and every problem you solve makes you stronger than the one before.",
    experience:
      "When I first chose Network Technology, I honestly didn't know what I was getting into. I thought it was just cables, routers, and memorizing commands. It turned out to be much more than that. NT taught me how to think. It taught me to stay patient when nothing works and to look at a problem one layer at a time, from the physical connection up, until I find what's wrong.",
    challenges:
      "Not every day was easy. There were lab activities where my configuration wouldn't work no matter how many times I checked it. There were nights spent troubleshooting, reviewing subnetting, and redoing setups from scratch. There were moments I doubted whether I was good enough for this field. But every error I fixed taught me something no lecture could. Slowly I realized that the struggle was the actual lesson.",
    advice:
      "To every NT student reading this: be curious. Break things in the lab, ask questions, and don't be afraid to fail, because that's how you learn. Help your classmates, because in this field you'll never work alone. Networks are built on connections, and so are careers. The skills you're building now, like troubleshooting, securing systems, and keeping things running, are what the world depends on, even if most people never see them.\n\nTrust the process, even when nothing is connecting yet. Eventually it will, and when it does, you'll know you earned it.",
    displayName: 'Mr. Lance Edward V. Dela Rosa',
    currentRole: 'IINTESS 4th Year Representative',
    organization: 'AY: 2026-2027',
    positions: ['4th Year Representative, IINTESS 2026-2027'],
    profileImage: '/assets/aistudio/33b5e2c2-4b7a-46fe-abac-5b05af7fcf62_a05ea5b8.jpg',
    approvedFields: ['displayName', 'currentRole', 'organization', 'positions', 'profileImage'],
    publicationConsent: true,
    publicationStatus: 'published',
    verificationStatus: 'verified',
    source: 'IINTESS Contributor Submission',
    keywords: [
      'Network Technology',
      'Networking Technology',
      'NT',
      'IINTESS',
      '4th Year Representative',
      'Troubleshooting',
      'Subnetting',
      'Mr. Lance Edward V. Dela Rosa',
      'Lance Edward Dela Rosa',
    ],
    featured: true,
  },
  {
    id: 'joeren-aguila',
    track: 'BA',
    title: 'Never Stop Learning: Turning Data into Meaningful Insights',
    excerpt:
      'Being in the Business Analytics track allowed me to see how technology, data, and business decisions work together—translating datasets into meaningful insights and practical solutions with Power BI and SAP Analytics Cloud.',
    quote:
      'Technology will never stop evolving, so never stop learning. Your greatest advantage is not what you already know, but how willing you are to learn, adapt, and grow.',
    experience:
      "Being in the Business Analytics track allowed me to see how technology, data, and business decisions work together. I learned that it's not enough to simply understand programming or analyze datasets; we must also know how to translate data into meaningful insights and practical solutions using tools such as Business Intelligence (BI) tools, data visualization platforms, and analytics software. Exploring tools like Power BI and SAP Analytics Cloud helped me appreciate how data can be transformed into interactive dashboards and reports that support informed decision-making. Through our academic projects, particularly our capstone, I experienced how technical knowledge can address actual business problems. It also taught me to continuously explore tools and technologies beyond what is discussed inside the classroom.",
    challenges:
      'One of my biggest challenges was keeping up with the continuous learning curve of Information Technology. There were unfamiliar concepts, difficult subjects, failed assessments, and technologies that required me to step outside my comfort zone. However, these experiences taught me to become more adaptable, resourceful, and resilient. I realized that being an IT student means accepting that you will not always know the answers, but you must be willing to find them, learn from mistakes, and keep improving.',
    advice:
      "My advice is to never limit your learning to what is taught inside the classroom. Be curious, explore emerging technologies, experiment with different tools, and attend various trainings, webinars, workshops, and certification programs that can help hone your technical and professional skills. Whether it's programming, cybersecurity, data analytics, cloud computing, or artificial intelligence, expose yourself to different areas of IT.\n\nMost importantly, learn to adapt because the technologies and skills relevant today may not be the same tomorrow. Don't just aim to graduate with a degree; aim to graduate with knowledge, practical experience, and skills that you can actually apply in the industry.",
    displayName: 'Mr. Joeren G. Aguila',
    currentRole: 'IINTESS Internal Vice President',
    organization: 'AY: 2026-2027',
    positions: [
      'Internal Vice President, IINTESS 2026-2027',
      'Committee Head on Environmental Protection Health and Sanitation, CICS-SC 2025-2027',
      'OIC Secretary, IINTESS - 2026',
      'Assistant Secretary, IINTESS - 2025-2026',
    ],
    profileImage: '/assets/aistudio/26b9e082-f0ac-44ae-9e84-c041d76463c5_fb12221a.jpg',
    approvedFields: ['displayName', 'currentRole', 'organization', 'positions', 'profileImage'],
    publicationConsent: true,
    publicationStatus: 'published',
    verificationStatus: 'verified',
    source: 'BSIT Business Analytics Alumni Submission',
    keywords: [
      'Business Analytics',
      'BA',
      'Business Intelligence',
      'BI',
      'Power BI',
      'SAP Analytics Cloud',
      'Data Visualization',
      'Capstone',
      'IINTESS',
      'IINTESS Internal Vice President',
      'OIC Secretary',
      'Assistant Secretary',
      'CICS-SC',
      'Mr. Joeren G. Aguila',
      'Joeren Aguila',
    ],
    featured: true,
  },
];

// Read-only asynchronous boundary for a future approved publishing service.
export const communityRepository = {
  stories: async (): Promise<readonly AlumniStory[]> => ALUMNI_STORIES,
};
