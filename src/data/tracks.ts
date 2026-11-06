import { TrackInfo } from '../types';

export const TRACKS_DATA: Record<'NT' | 'BA' | 'SM', TrackInfo> = {
  NT: {
    code: 'NT',
    slug: 'networking-technology',
    name: 'Networking Technology',
    tagline: 'Build, connect, and secure the digital world.',
    shortDescription:
      'Explore the technology that connects devices, systems, and people through networks.',
    colorHex: '#2563EB',
    bgHex: '#EFF6FF',
    borderHex: '#BFDBFE',
    badgeClass: 'bg-blue-600 text-white',
    description:
      'Networking Technology explores computer network architectures, transmission media, routing protocols, server infrastructure, and network defense. Students learn how packets travel globally and how to maintain mission-critical connectivity.',
    focus:
      'Networks, connectivity, infrastructure, network administration, routing, switching, and cybersecurity-related learning.',
    luniQuote:
      "Ever wondered how devices communicate across continents in milliseconds? Let's discover the world of networking! 🌐✨",
    introAchievement: {
      id: 1,
      name: "Peridot's Protocol",
      gemstoneUrl: '/assets/aistudio/01_peridots_protocol_f55976cf.png',
    },
    keySubjects: [
      'Network Fundamentals & Architecture',
      'Routing & Switching Essentials',
      'Enterprise Network Security & Firewalls',
      'Cloud Computing & Virtualization',
      'Linux & Windows Systems Administration',
      'Wireless & Mobile Communications',
    ],
    coreSkills: [
      {
        category: 'Network Fundamentals',
        skills: ['OSI & TCP/IP 7-Layer Models', 'IPv4 & IPv6 Subnetting Math', 'Cabling & Topology Design'],
      },
      {
        category: 'Technical Troubleshooting',
        skills: ['Packet Sniffing (Wireshark)', 'Ping & Traceroute Diagnostics', 'Port Forwarding & NAT Analysis'],
      },
      {
        category: 'Network Administration',
        skills: ['Cisco CLI Device Configuration', 'VLAN & Trunking Implementation', 'DHCP & DNS Server Management'],
      },
      {
        category: 'Security Awareness',
        skills: ['Access Control Lists (ACLs)', 'Firewall Configuration', 'Intrusion Detection Basics'],
      },
    ],
    modules: [
      {
        id: 'nt-mod-1',
        title: 'Module 1: The Pathways of Connection',
        description: 'Understand how computers send, receive, and decode signals across local and wide-area networks.',
        subject: 'Network Fundamentals',
        topicTags: ['OSI Model', 'LAN/WAN', 'Packet Switching'],
        status: 'available',
        durationMinutes: 15,
        overviewSummary:
          'Explores the fundamental components of a network: end devices, intermediate devices (switches, routers), and transmission media (fiber optics, twisted pair copper, and wireless signals).',
      },
      {
        id: 'nt-mod-2',
        title: 'Module 2: Routing, Switching & Subnetting',
        description: 'Learn how switches direct local traffic and how routers move packets between distinct networks.',
        subject: 'Routing & Switching',
        topicTags: ['IPv4 Addressing', 'Subnet Masks', 'Default Gateway'],
        status: 'available',
        durationMinutes: 20,
        overviewSummary:
          'Teaches IP address structure, subnetting calculations, and why routers are needed to communicate outside a local subnet.',
      },
      {
        id: 'nt-mod-3',
        title: 'Module 3: Defending the Network Perimeter',
        description: 'An introduction to cybersecurity defenses, firewalls, and cryptographic protocols.',
        subject: 'Cybersecurity',
        topicTags: ['Firewalls', 'VPNs', 'CIA Triad'],
        status: 'available',
        durationMinutes: 18,
        overviewSummary:
          'Examines the CIA triad (Confidentiality, Integrity, Availability), perimeter defenses, SSL/TLS handshakes, and how security engineers prevent unauthorized network breaches.',
      },
      {
        id: 'nt-mod-4',
        title: 'Module 4: Enterprise Cloud Infrastructure & SD-WAN',
        description: 'Advanced networking concepts in multi-cloud environments and software-defined architectures.',
        subject: 'Cloud & Infrastructure',
        topicTags: ['Cloud VPC', 'Virtualization', 'SD-WAN'],
        status: 'in_preparation',
        durationMinutes: 25,
        overviewSummary:
          'Curriculum materials currently in development by the BatStateU Alangilan BSIT Networking faculty. Will cover hybrid cloud networks and infrastructure-as-code.',
      },
    ],
    realWorldApplications: [
      {
        title: 'Hospital Critical Care Network Uptime',
        scenario: 'A regional medical center needs patient monitoring devices connected 24/7 with zero packet loss.',
        solution: 'Network engineers deploy redundant core switches and automated failover routing protocols (OSPF).',
        impact: 'Life-saving telemetry data streams continuously without interruptions during network maintenance.',
      },
      {
        title: 'University Campus Wi-Fi 6 Density Planning',
        scenario: 'Thousands of students on BatStateU Alangilan campus connect smartphones and laptops simultaneously.',
        solution: 'Engineers segment traffic using VLANs, implement 802.11ax access points, and optimize channel frequencies.',
        impact: 'High-speed wireless connectivity remains stable across lecture halls and outdoor study grounds.',
      },
      {
        title: 'Banking Data Center Ransomware Defense',
        scenario: 'Financial transactions must be safeguarded from sophisticated malware and unauthorized intrusions.',
        solution: 'Deploy next-generation stateful firewalls, strict role-based ACLs, and real-time SIEM packet monitors.',
        impact: 'Prevents lateral movement of malware and guarantees privacy for customer accounts.',
      },
    ],
    possibleCareers: [
      {
        title: 'Network Engineer',
        description: 'Designs, implements, and maintains complex local and wide area network infrastructure.',
        sampleRoles: ['Associate Network Engineer', 'Cisco Infrastructure Specialist', 'Campus Network Administrator'],
      },
      {
        title: 'Cybersecurity Analyst',
        description: 'Monitors enterprise traffic, configures defenses, and responds to network security incidents.',
        sampleRoles: ['SOC Tier 1 Analyst', 'Information Security Associate', 'Firewall Administrator'],
      },
      {
        title: 'Systems & Infrastructure Administrator',
        description: 'Manages physical and virtualized server environments, storage clusters, and directory services.',
        sampleRoles: ['Windows/Linux SysAdmin', 'Cloud Operations Technician', 'IT Infrastructure Specialist'],
      },
    ],
    workStyle: [
      'Hands-on technical implementation with physical & virtual gear',
      'Structured logical diagnostic thinking and root-cause analysis',
      'High-reliability mindset for 24/7 critical infrastructure',
      'Continuous learning in cloud protocols and cybersecurity benchmarks',
    ],
    interests: [
      'Understanding how the internet and data packets work',
      'Configuring routers, switches, and server operating systems',
      'Protecting confidential systems from vulnerabilities and hackers',
      'Building fast, fault-tolerant communication pipelines',
    ],
    bestFitTraits: [
      'Enjoys hands-on work with technology, servers, and networks',
      'Curious about how data travels globally in milliseconds',
      'Thrives on systematic troubleshooting and root-cause analysis',
      'Passionate about defense, resilience, and secure operations',
    ],
  },
  BA: {
    code: 'BA',
    slug: 'business-analytics',
    name: 'Business Analytics',
    tagline: 'Turn data into insights for real-world impact.',
    shortDescription:
      'Discover how information and data can support better business decisions.',
    colorHex: '#8B5CF6',
    bgHex: '#F5F3FF',
    borderHex: '#DDD6FE',
    badgeClass: 'bg-violet-600 text-white',
    description:
      'Business Analytics bridges the gap between raw data and managerial strategy. Students learn exploratory data analysis, business intelligence (BI) dashboard design, statistical modeling, and data-driven storytelling.',
    focus:
      'Data analysis, statistics, visual storytelling, business interpretation, and strategic decision-making.',
    luniQuote:
      "Data is like a constellation of stars—connect the dots and it tells an incredible story! Let's explore Business Analytics! 📊✨",
    introAchievement: {
      id: 6,
      name: "Garnet's Foresight",
      gemstoneUrl: '/assets/aistudio/06_garnets_foresight_de542d8b.png',
    },
    keySubjects: [
      'Data Analytics & Exploration',
      'Applied Business Statistics',
      'Business Intelligence (BI) Tools & Dashboards',
      'Data Warehousing & SQL Querying',
      'Predictive Modeling & Forecasting',
      'Data Storytelling & Executive Presentation',
    ],
    coreSkills: [
      {
        category: 'Data Interpretation',
        skills: ['Descriptive Statistics (Mean, Median, Standard Deviation)', 'Hypothesis Testing', 'Correlation vs Causation'],
      },
      {
        category: 'Analytical Thinking',
        skills: ['SQL Joins & Aggregations', 'Data Cleaning & Normalization', 'Root-Cause Variance Analysis'],
      },
      {
        category: 'Data Visualization',
        skills: ['Power BI / Tableau Dashboard Design', 'Chart Selection Math', 'Executive KPI Dashboards'],
      },
      {
        category: 'Business Problem-Solving',
        skills: ['ROI & Cost-Benefit Modeling', 'Customer Cohort Analysis', 'Translating Numbers to Decisions'],
      },
    ],
    modules: [
      {
        id: 'ba-mod-1',
        title: 'Module 1: The Language of Business Data',
        description: 'Understand how organizations collect, clean, and structure raw data to extract initial value.',
        subject: 'Data Analytics Basics',
        topicTags: ['Data Types', 'Data Hygiene', 'Metrics vs KPIs'],
        status: 'available',
        durationMinutes: 15,
        overviewSummary:
          'Introduces structured vs unstructured data, quantitative vs qualitative variables, and the importance of trustworthy data preparation.',
      },
      {
        id: 'ba-mod-2',
        title: 'Module 2: Visual Storytelling & Dashboards',
        description: 'Transform complex multi-table datasets into intuitive visual reports for stakeholders.',
        subject: 'Business Intelligence',
        topicTags: ['Power BI', 'Visual Hierarchy', 'Interactive Filters'],
        status: 'available',
        durationMinutes: 18,
        overviewSummary:
          'Covers dashboard usability principles: why pie charts can be misleading, how to choose between bar, line, and heatmaps, and building actionable executive summaries.',
      },
      {
        id: 'ba-mod-3',
        title: 'Module 3: Predictive Modeling & Forecasting',
        description: 'Explore linear regressions and time-series forecasting to anticipate future business trends.',
        subject: 'Statistical Modeling',
        topicTags: ['Linear Regression', 'Trend Analysis', 'Seasonality'],
        status: 'available',
        durationMinutes: 20,
        overviewSummary:
          'Learn how historical performance data is used to project future quarterly demand and spot emerging trends before competitors.',
      },
      {
        id: 'ba-mod-4',
        title: 'Module 4: Machine Learning in Big Data Analytics',
        description: 'Introduction to classification models and clustering algorithms for consumer segmentation.',
        subject: 'Advanced Analytics',
        topicTags: ['Clustering', 'Classification', 'Data Mining'],
        status: 'in_preparation',
        durationMinutes: 25,
        overviewSummary:
          'Curriculum material in preparation by the BatStateU Alangilan BSIT Analytics faculty. Will cover unsupervised clustering and real-world churn modeling.',
      },
    ],
    realWorldApplications: [
      {
        title: 'Retail Store Inventory Optimization',
        scenario: 'A major supermarket chain faces food wastage due to overstocking perishable items.',
        solution: 'Analysts build time-series demand models factoring in weather, holidays, and past sales velocity.',
        impact: 'Waste drops by 32% while popular items remain consistently in stock on supermarket shelves.',
      },
      {
        title: 'E-Commerce Cart Abandonment Reduction',
        scenario: 'An online shopping app notices 65% of shoppers drop off at the final checkout screen.',
        solution: 'Analysts segment customer funnel telemetry to pinpoint shipping fee surprises as the culprit.',
        impact: 'The company introduces upfront transparent pricing, boosting completed checkout conversions by 18%.',
      },
      {
        title: 'University Student Retention Early-Warning',
        scenario: 'Academic advisers want to identify students struggling before midterm grades are finalized.',
        solution: 'Create an early-warning dashboard monitoring attendance patterns and LMS assignment submissions.',
        impact: 'Advisers provide timely tutoring and counseling, improving 1st-year retention rates.',
      },
    ],
    possibleCareers: [
      {
        title: 'Data Analyst',
        description: 'Inspects, cleans, and models datasets to uncover trends and actionable business recommendations.',
        sampleRoles: ['Junior Data Analyst', 'Operations Data Specialist', 'Marketing Analytics Associate'],
      },
      {
        title: 'Business Intelligence (BI) Developer',
        description: 'Designs enterprise data warehouses and interactive real-time reporting dashboards.',
        sampleRoles: ['BI Report Developer', 'Tableau/Power BI Specialist', 'Data Visualization Engineer'],
      },
      {
        title: 'Quantitative Consultant',
        description: 'Helps executives evaluate mergers, pricing strategies, and process efficiency through statistical modeling.',
        sampleRoles: ['Management Analytics Consultant', 'Financial Data Analyst', 'Risk & Market Analyst'],
      },
    ],
    workStyle: [
      'Analytical, inquisitive, and detail-oriented',
      'Iterative data exploration and hypothesis testing',
      'Cross-functional communication between engineering and business management',
      'Visual storytelling for non-technical stakeholders',
    ],
    interests: [
      'Finding hidden patterns and anomalies in numerical records',
      'Designing clean, beautiful charts and interactive dashboards',
      'Using metrics to evaluate business strategy and consumer behavior',
      'Helping leadership make evidence-based decisions rather than guesses',
    ],
    bestFitTraits: [
      'Enjoys working with quantitative metrics, spreadsheets, and databases',
      'Curious about how consumer behavior maps to data points',
      'Likes synthesizing complex information into simple charts',
      'Wants to directly influence strategic organizational growth',
    ],
  },
  SM: {
    code: 'SM',
    slug: 'service-management',
    name: 'Service Management',
    tagline: 'Create better experiences through people, process and tech.',
    shortDescription:
      'Learn how technology services and processes are managed to support people and organizations.',
    colorHex: '#10B981',
    bgHex: '#ECFDF5',
    borderHex: '#A7F3D0',
    badgeClass: 'bg-emerald-600 text-white',
    description:
      'Service Management focuses on IT Service Management (ITSM/ITIL frameworks), customer experience (CX) engineering, workflow optimization, and service desk leadership. Students master how technology delivers seamless value to users.',
    focus:
      'IT services, operations, workflow management, process improvement, and enterprise service delivery.',
    luniQuote:
      'Great technology is only truly powerful when people can use it seamlessly! Ready to explore Service Management? 🤝✨',
    introAchievement: {
      id: 11,
      name: "Pearl's Precision",
      gemstoneUrl: '/assets/aistudio/11_pearls_precision_8d450275.png',
    },
    keySubjects: [
      'IT Service Management Fundamentals (ITIL)',
      'Service Operations & Incident Lifecycle',
      'Customer Experience (CX) in Digital Services',
      'Business Process Re-engineering & Optimization',
      'IT Project & Quality Assurance Management',
      'Service Level Agreements (SLA) & Governance',
    ],
    coreSkills: [
      {
        category: 'Service Operations',
        skills: ['ITIL 4 Service Value Chain', 'Incident & Problem Management', 'Change Enablement & Release Risk'],
      },
      {
        category: 'Workflow Planning',
        skills: ['BPMN Process Mapping', 'Bottleneck Identification', 'Standard Operating Procedures (SOP)'],
      },
      {
        category: 'Process Improvement',
        skills: ['Lean & Six Sigma Basics', 'Root-Cause Escalation Protocols', 'Service Level Agreement (SLA) Tracking'],
      },
      {
        category: 'Customer Support & CX',
        skills: ['Empathetic Stakeholder Communication', 'User Feedback Loops (CSAT/NPS)', 'Omnichannel Support Coordination'],
      },
    ],
    modules: [
      {
        id: 'sm-mod-1',
        title: 'Module 1: The ITIL Service Value System',
        description: 'Discover how IT teams create co-value with customers through standardized service models.',
        subject: 'ITSM Fundamentals',
        topicTags: ['ITIL 4', 'Value Co-creation', 'Service Catalog'],
        status: 'available',
        durationMinutes: 15,
        overviewSummary:
          'Explains why software alone does not guarantee business success: services require clear catalogs, trained personnel, and defined service levels to satisfy users.',
      },
      {
        id: 'sm-mod-2',
        title: 'Module 2: Incident Management & Service Level Agreements',
        description: 'Learn how IT support desks categorize, prioritize, and resolve enterprise outages swiftly.',
        subject: 'Service Operations',
        topicTags: ['SLA Benchmarks', 'Severity Tiers', 'Escalation Paths'],
        status: 'available',
        durationMinutes: 18,
        overviewSummary:
          'Teaches the difference between an incident (service interruption) and a problem (underlying root cause), and how SLAs govern contractual response times.',
      },
      {
        id: 'sm-mod-3',
        title: 'Module 3: Process Optimization & Journey Mapping',
        description: 'Map out existing business workflows and eliminate friction points using customer journey maps.',
        subject: 'Process Improvement',
        topicTags: ['Workflow Mapping', 'Customer Journey', 'Bottlenecks'],
        status: 'available',
        durationMinutes: 20,
        overviewSummary:
          'Walks through a step-by-step case study in converting a slow, paper-based approval workflow into an automated digital service queue.',
      },
      {
        id: 'sm-mod-4',
        title: 'Module 4: Enterprise Agile Service Delivery & DevOps Integration',
        description: 'How modern service managers integrate continuous deployment with robust ITIL governance.',
        subject: 'Service Delivery',
        topicTags: ['DevOps & ITIL', 'Agile Operations', 'Continuous Value'],
        status: 'in_preparation',
        durationMinutes: 25,
        overviewSummary:
          'Curriculum material in preparation by the BatStateU Alangilan BSIT Service Management faculty. Will explore integrating agile sprints with ITIL change authorization.',
      },
    ],
    realWorldApplications: [
      {
        title: 'Fintech Mobile Banking App Outage Recovery',
        scenario: 'A payment gateway fails on payday, causing thousands of users to experience transaction errors.',
        solution: 'Service managers invoke Severity-1 incident protocols, coordinate technical teams, and issue transparent user updates.',
        impact: 'Service is restored within the contractual 15-minute SLA limit, preserving customer trust and preventing regulatory fines.',
      },
      {
        title: 'Hospital Telehealth Service Desk Streamlining',
        scenario: 'Patients and elderly doctors struggle with complex video conference onboarding for remote appointments.',
        solution: 'CX specialists map the friction points and deploy a 1-click SMS check-in workflow with live audio support.',
        impact: 'Appointment no-show rate plummets from 28% to 4%, making healthcare access accessible for all.',
      },
      {
        title: 'Multinational Tech Onboarding Automation',
        scenario: 'New employee equipment provisioning takes 14 business days across scattered HR, IT, and security silos.',
        solution: 'Service architects redesign the workflow into a single self-service portal with automated credential generation.',
        impact: 'New hires receive laptops and security access on Day 1, saving 40 hours of manual coordination per employee.',
      },
    ],
    possibleCareers: [
      {
        title: 'IT Service Manager',
        description: 'Oversees end-to-end delivery of enterprise IT services, ensuring high reliability and user satisfaction.',
        sampleRoles: ['Assistant Service Manager', 'Incident Management Coordinator', 'Service Desk Team Lead'],
      },
      {
        title: 'Service Delivery Coordinator',
        description: 'Acts as the bridge between technical engineering teams and enterprise corporate clients.',
        sampleRoles: ['Client Service Delivery Specialist', 'SLA Performance Analyst', 'Change Enablement Associate'],
      },
      {
        title: 'Customer Experience (CX) Specialist',
        description: 'Analyzes digital user interactions to eliminate friction and elevate customer satisfaction scores.',
        sampleRoles: ['Digital Experience Analyst', 'User Journey Coordinator', 'Support Operations Specialist'],
      },
    ],
    workStyle: [
      'Empathetic and customer-centric problem solving',
      'Process-driven, organized, and procedure-conscious',
      'High-collaboration across cross-functional engineering and client teams',
      'Calm and communicative during high-stress operational escalations',
    ],
    interests: [
      'Making software, apps, and technology intuitive and delightful to use',
      'Connecting clients and tech specialists without confusing jargon',
      'Standardizing messy procedures into smooth, automated workflows',
      'Improving customer satisfaction ratings and service excellence',
    ],
    bestFitTraits: [
      'Enjoys helping people and smoothing out complex friction points',
      'Organized and attentive to procedures, timelines, and quality benchmarks',
      'Excited by leadership, service delivery, and team collaboration',
      'Desires to make technology work smoothly and reliably for everyday users',
    ],
  },
};
