import { QuizQuestion } from '../../types/quiz';

/**
 * 99 Calibrated BSIT Assessment Questions
 * Balanced strictly across NT (33), BA (33), and SM (33)
 * Levels: 1 (9), 2 (18), 3 (21), 4 (24), 5 (27)
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  /* ==========================================================================
     LEVEL 1: TRUE OR FALSE (9 Total: 3 NT, 3 BA, 3 SM)
     ========================================================================== */
  // --- NT Level 1 ---
  {
    id: 'l1-nt-1',
    level: 1,
    type: 'true_false',
    track: 'NT',
    prompt:
      'A network switch forwards data frames within a Local Area Network (LAN) primarily by referencing physical MAC addresses.',
    correctAnswer: true,
    explanation: 'Switches operate at Layer 2 (Data Link) and build MAC address tables to direct traffic efficiently to specific ports.',
  },
  {
    id: 'l1-nt-2',
    level: 1,
    type: 'true_false',
    track: 'NT',
    prompt:
      'An IPv4 address consists of 128 binary bits divided into eight 16-bit hexadecimal blocks.',
    correctAnswer: false,
    explanation: 'IPv4 addresses are 32 bits long (four 8-bit octets). IPv6 addresses are 128 bits.',
  },
  {
    id: 'l1-nt-3',
    level: 1,
    type: 'true_false',
    track: 'NT',
    prompt:
      'The Transport Layer of the OSI model uses TCP to provide connection-oriented, guaranteed packet delivery.',
    correctAnswer: true,
    explanation: 'TCP utilizes sequence numbers, acknowledgments, and a three-way handshake to ensure reliable delivery.',
  },

  // --- BA Level 1 ---
  {
    id: 'l1-ba-1',
    level: 1,
    type: 'true_false',
    track: 'BA',
    prompt:
      'Descriptive analytics answers the question "What is likely to happen in the future?" based on historical trend extrapolation.',
    correctAnswer: false,
    explanation: 'Descriptive analytics summarizes "What happened?". Predictive analytics forecasts what is likely to happen.',
  },
  {
    id: 'l1-ba-2',
    level: 1,
    type: 'true_false',
    track: 'BA',
    prompt:
      'In statistics and data analysis, correlation between two variables does not automatically establish that one causes the other.',
    correctAnswer: true,
    explanation: '"Correlation does not imply causation" is a fundamental principle in empirical data analysis.',
  },
  {
    id: 'l1-ba-3',
    level: 1,
    type: 'true_false',
    track: 'BA',
    prompt:
      'Data cleaning (data hygiene) involves handling missing values, standardizing formats, and removing duplicate records before analysis.',
    correctAnswer: true,
    explanation: 'Clean data is essential to avoid "garbage in, garbage out" in business intelligence models.',
  },

  // --- SM Level 1 ---
  {
    id: 'l1-sm-1',
    level: 1,
    type: 'true_false',
    track: 'SM',
    prompt:
      'In IT Service Management, a Service Level Agreement (SLA) is a documented commitment between a service provider and a customer specifying performance targets.',
    correctAnswer: true,
    explanation: 'An SLA formalizes uptime, response times, and quality expectations between the provider and customer.',
  },
  {
    id: 'l1-sm-2',
    level: 1,
    type: 'true_false',
    track: 'SM',
    prompt:
      'In ITIL practices, an Incident is defined as the underlying root cause of one or more recurring system errors.',
    correctAnswer: false,
    explanation: 'An Incident is an unplanned interruption or reduction in quality. The underlying root cause is classified as a Problem.',
  },
  {
    id: 'l1-sm-3',
    level: 1,
    type: 'true_false',
    track: 'SM',
    prompt:
      'Service Management focuses on delivering value to customers by facilitating desired outcomes without requiring customers to manage specific costs and risks.',
    correctAnswer: true,
    explanation: 'This is the core definition of a service in modern ITIL 4 frameworks.',
  },

  /* ==========================================================================
     LEVEL 2: MULTIPLE CHOICE (18 Total: 6 NT, 6 BA, 6 SM)
     ========================================================================== */
  // --- NT Level 2 (6) ---
  {
    id: 'l2-nt-1',
    level: 2,
    type: 'multiple_choice',
    track: 'NT',
    prompt: 'Which network hardware operates at Layer 3 (Network Layer) and connects different logical subnets?',
    options: [
      { key: 'A', text: 'Network Hub' },
      { key: 'B', text: 'IP Router' },
      { key: 'C', text: 'Unmanaged Switch' },
      { key: 'D', text: 'Physical Repeater' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-nt-2',
    level: 2,
    type: 'multiple_choice',
    track: 'NT',
    prompt: 'Which protocol translates human-readable domain names (e.g., batangas.edu.ph) into routable IP addresses?',
    options: [
      { key: 'A', text: 'DHCP (Dynamic Host Configuration Protocol)' },
      { key: 'B', text: 'DNS (Domain Name System)' },
      { key: 'C', text: 'ARP (Address Resolution Protocol)' },
      { key: 'D', text: 'SNMP (Simple Network Management Protocol)' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-nt-3',
    level: 2,
    type: 'multiple_choice',
    track: 'NT',
    prompt: 'What is the default subnet mask for a standard Class C IPv4 network (/24)?',
    options: [
      { key: 'A', text: '255.0.0.0' },
      { key: 'B', text: '255.255.0.0' },
      { key: 'C', text: '255.255.255.0' },
      { key: 'D', text: '255.255.255.255' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 'l2-nt-4',
    level: 2,
    type: 'multiple_choice',
    track: 'NT',
    prompt: 'Which tool or protocol enables multiple devices on a private LAN to share a single public IP address for internet access?',
    options: [
      { key: 'A', text: 'NAT (Network Address Translation)' },
      { key: 'B', text: 'VLAN (Virtual Local Area Network)' },
      { key: 'C', text: 'ICMP (Internet Control Message Protocol)' },
      { key: 'D', text: 'STP (Spanning Tree Protocol)' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 'l2-nt-5',
    level: 2,
    type: 'multiple_choice',
    track: 'NT',
    prompt: 'Which port is universally standardized for secure web traffic encrypted with SSL/TLS (HTTPS)?',
    options: [
      { key: 'A', text: 'Port 21' },
      { key: 'B', text: 'Port 80' },
      { key: 'C', text: 'Port 443' },
      { key: 'D', text: 'Port 8080' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 'l2-nt-6',
    level: 2,
    type: 'multiple_choice',
    track: 'NT',
    prompt: 'What type of network cable connector is standard for connecting UTP/STP Ethernet patch cables to computer network cards?',
    options: [
      { key: 'A', text: 'RJ-11' },
      { key: 'B', text: 'RJ-45' },
      { key: 'C', text: 'BNC' },
      { key: 'D', text: 'SC Fiber' },
    ],
    correctAnswer: 'B',
  },

  // --- BA Level 2 (6) ---
  {
    id: 'l2-ba-1',
    level: 2,
    type: 'multiple_choice',
    track: 'BA',
    prompt: 'In SQL database queries, which clause is used to filter records based on aggregated calculations (e.g., COUNT or AVG)?',
    options: [
      { key: 'A', text: 'WHERE' },
      { key: 'B', text: 'HAVING' },
      { key: 'C', text: 'GROUP BY' },
      { key: 'D', text: 'ORDER BY' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-ba-2',
    level: 2,
    type: 'multiple_choice',
    track: 'BA',
    prompt: 'What does the acronym ETL represent in enterprise data warehousing and reporting pipelines?',
    options: [
      { key: 'A', text: 'Evaluate, Test, Launch' },
      { key: 'B', text: 'Extract, Transform, Load' },
      { key: 'C', text: 'Encode, Transmit, Log' },
      { key: 'D', text: 'Export, Tally, Leverage' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-ba-3',
    level: 2,
    type: 'multiple_choice',
    track: 'BA',
    prompt: 'Which chart type is most appropriate for displaying the distribution and spread of numerical data through quartiles and outliers?',
    options: [
      { key: 'A', text: 'Pie Chart' },
      { key: 'B', text: 'Box Plot (Box-and-Whisker)' },
      { key: 'C', text: 'Radar Chart' },
      { key: 'D', text: 'Gantt Chart' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-ba-4',
    level: 2,
    type: 'multiple_choice',
    track: 'BA',
    prompt: 'What measure of central tendency is least distorted by extreme outliers or heavily skewed distributions?',
    options: [
      { key: 'A', text: 'Arithmetic Mean' },
      { key: 'B', text: 'Median' },
      { key: 'C', text: 'Mode' },
      { key: 'D', text: 'Variance' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-ba-5',
    level: 2,
    type: 'multiple_choice',
    track: 'BA',
    prompt: 'A quantifiable metric used by university administration or business leaders to evaluate operational success over time is called a:',
    options: [
      { key: 'A', text: 'DNS Record' },
      { key: 'B', text: 'KPI (Key Performance Indicator)' },
      { key: 'C', text: 'MAC Address' },
      { key: 'D', text: 'Sprint Backlog' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-ba-6',
    level: 2,
    type: 'multiple_choice',
    track: 'BA',
    prompt: 'Which type of analytics recommends specific actions or optimizations to take advantage of upcoming opportunities?',
    options: [
      { key: 'A', text: 'Descriptive Analytics' },
      { key: 'B', text: 'Diagnostic Analytics' },
      { key: 'C', text: 'Predictive Analytics' },
      { key: 'D', text: 'Prescriptive Analytics' },
    ],
    correctAnswer: 'D',
  },

  // --- SM Level 2 (6) ---
  {
    id: 'l2-sm-1',
    level: 2,
    type: 'multiple_choice',
    track: 'SM',
    prompt: 'What primary globally recognized framework provides best-practice guidance for IT Service Management (ITSM)?',
    options: [
      { key: 'A', text: 'OSI Reference Model' },
      { key: 'B', text: 'ITIL (Information Technology Infrastructure Library)' },
      { key: 'C', text: 'IEEE 802.11 Standard' },
      { key: 'D', text: 'W3C HTML5 Specification' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-sm-2',
    level: 2,
    type: 'multiple_choice',
    track: 'SM',
    prompt: 'What is the primary objective of the Incident Management practice in IT service operations?',
    options: [
      { key: 'A', text: 'Analyze root causes to prevent future occurrences forever' },
      { key: 'B', text: 'Restore normal service operation as quickly as possible with minimal business disruption' },
      { key: 'C', text: 'Negotiate contractual prices with cloud infrastructure vendors' },
      { key: 'D', text: 'Develop automated database migration scripts' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-sm-3',
    level: 2,
    type: 'multiple_choice',
    track: 'SM',
    prompt: 'Which internal agreement defines relationships and commitments between internal departments supporting an overall client SLA?',
    options: [
      { key: 'A', text: 'OLA (Operational Level Agreement)' },
      { key: 'B', text: 'API (Application Programming Interface)' },
      { key: 'C', text: 'ERP (Enterprise Resource Planning)' },
      { key: 'D', text: 'NDA (Non-Disclosure Agreement)' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 'l2-sm-4',
    level: 2,
    type: 'multiple_choice',
    track: 'SM',
    prompt: 'A single point of contact between IT service providers and users for reporting issues and service requests is known as the:',
    options: [
      { key: 'A', text: 'Default Gateway' },
      { key: 'B', text: 'Service Desk' },
      { key: 'C', text: 'Data Warehouse' },
      { key: 'D', text: 'Access Control List' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'l2-sm-5',
    level: 2,
    type: 'multiple_choice',
    track: 'SM',
    prompt: 'Which ITIL practice ensures that risks are properly assessed, authorized, and scheduled before alterations to production systems occur?',
    options: [
      { key: 'A', text: 'Change Enablement (Change Management)' },
      { key: 'B', text: 'Packet Inspection' },
      { key: 'C', text: 'Data Normalization' },
      { key: 'D', text: 'Descriptive Analytics' },
    ],
    correctAnswer: 'A',
  },
  {
    id: 'l2-sm-6',
    level: 2,
    type: 'multiple_choice',
    track: 'SM',
    prompt: 'A documented, published list of all active IT services currently available to university students and staff is called the:',
    options: [
      { key: 'A', text: 'Routing Table' },
      { key: 'B', text: 'Service Catalog' },
      { key: 'C', text: 'ER Diagram' },
      { key: 'D', text: 'Packet Trace' },
    ],
    correctAnswer: 'B',
  },

  /* ==========================================================================
     LEVEL 3: MATCHING TYPE (21 Scored Questions: 7 NT, 7 BA, 7 SM)
     Organized as clean modular matching questions
     ========================================================================== */
  // --- NT Matching (7 Questions) ---
  {
    id: 'l3-nt-1',
    level: 3,
    type: 'matching',
    track: 'NT',
    prompt: 'Match fundamental networking protocols with their functional roles:',
    pairs: [
      { term: 'DHCP', definition: 'Automatically leases IP addresses to client devices' },
      { term: 'ARP', definition: 'Resolves IP addresses into hardware MAC addresses' },
      { term: 'ICMP', definition: 'Sends network diagnostics and echo requests (Ping)' },
    ],
  },
  {
    id: 'l3-nt-2',
    level: 3,
    type: 'matching',
    track: 'NT',
    prompt: 'Match network hardware devices with their layer and function:',
    pairs: [
      { term: 'Firewall', definition: 'Monitors and filters incoming/outgoing network traffic by security rules' },
      { term: 'Access Point', definition: 'Broadcasts wireless Wi-Fi signals to connect mobile clients to LAN' },
      { term: 'Switch', definition: 'Connects devices within a LAN using Layer 2 hardware addresses' },
      { term: 'Router', definition: 'Directs data packets across different logical subnets using Layer 3 IPs' },
    ],
  },

  // --- BA Matching (7 Questions) ---
  {
    id: 'l3-ba-1',
    level: 3,
    type: 'matching',
    track: 'BA',
    prompt: 'Match key data analytics concepts with their proper definitions:',
    pairs: [
      { term: 'Data Warehouse', definition: 'A centralized repository of integrated data from multiple sources' },
      { term: 'Data Visualization', definition: 'Representing numbers and trends visually in charts and dashboards' },
      { term: 'Outlier', definition: 'A data point that differs significantly from remaining observations' },
    ],
  },
  {
    id: 'l3-ba-2',
    level: 3,
    type: 'matching',
    track: 'BA',
    prompt: 'Match data management processes with their operations:',
    pairs: [
      { term: 'Extraction', definition: 'Retrieving raw unstructured data from operational systems' },
      { term: 'Transformation', definition: 'Cleaning, aggregating, and formatting data to standard business rules' },
      { term: 'Aggregation', definition: 'Summarizing individual records into totals, averages, or medians' },
      { term: 'Dashboard', definition: 'A single visual screen presenting critical KPIs at a glance' },
    ],
  },

  // --- SM Matching (7 Questions) ---
  {
    id: 'l3-sm-1',
    level: 3,
    type: 'matching',
    track: 'SM',
    prompt: 'Match service delivery commitments with their target audiences:',
    pairs: [
      { term: 'SLA', definition: 'External commitment between IT service provider and customer' },
      { term: 'OLA', definition: 'Internal agreement between operational departments within IT' },
      { term: 'Underpinning Contract', definition: 'Legal agreement between service provider and third-party vendor' },
    ],
  },
  {
    id: 'l3-sm-2',
    level: 3,
    type: 'matching',
    track: 'SM',
    prompt: 'Match ITIL Service Lifecycle stages with their strategic purposes:',
    pairs: [
      { term: 'Service Strategy', definition: 'Defines how IT aligns with organizational goals and customer needs' },
      { term: 'Service Transition', definition: 'Builds, tests, and deploys new or changed services into production' },
      { term: 'Continual Improvement', definition: 'Identifies incremental enhancements to services and workflows' },
      { term: 'Problem Management', definition: 'Investigates root causes to eliminate recurring incidents' },
    ],
  },

  /* ==========================================================================
     LEVEL 4: SEQUENCING / ORDERING (24 Scored Questions: 8 NT, 8 BA, 8 SM)
     ========================================================================== */
  // --- NT Sequencing (8 steps total across 2 scenarios: 4 + 4) ---
  {
    id: 'l4-nt-1',
    level: 4,
    type: 'sequencing',
    track: 'NT',
    prompt: 'Arrange the sequence of steps when a browser resolves a new domain name to connect to a website:',
    steps: [
      'The client enters a URL and sends a DNS query to the local resolver.',
      'The DNS resolver queries root, TLD, and authoritative name servers.',
      'The authoritative server returns the matching destination IP address.',
      'The client initiates a TCP 3-way handshake to the destination IP.',
    ],
  },
  {
    id: 'l4-nt-2',
    level: 4,
    type: 'sequencing',
    track: 'NT',
    prompt: 'Arrange the sequence of OSI encapsulation as data moves down from the application to physical transmission:',
    steps: [
      'Application data is created by a user program or web browser.',
      'Transport Layer adds TCP/UDP headers with source and destination ports (Segment).',
      'Network Layer adds IP addresses to create an internet-routable Packet.',
      'Data Link Layer adds MAC addresses and Frame Check Sequence (Frame).',
    ],
  },

  // --- BA Sequencing (8 steps total across 2 scenarios: 4 + 4) ---
  {
    id: 'l4-ba-1',
    level: 4,
    type: 'sequencing',
    track: 'BA',
    prompt: 'Arrange the chronological phases of a typical Business Analytics project lifecycle:',
    steps: [
      'Define the business problem, executive questions, and target KPIs.',
      'Extract raw transactional data from production databases and logs.',
      'Perform data hygiene, eliminate null values, and validate formats.',
      'Build visual storytelling dashboards and deliver insights to stakeholders.',
    ],
  },
  {
    id: 'l4-ba-2',
    level: 4,
    type: 'sequencing',
    track: 'BA',
    prompt: 'Arrange the four levels of analytics maturity in increasing order of complexity and business value:',
    steps: [
      'Descriptive Analytics ("What happened historically?")',
      'Diagnostic Analytics ("Why did it happen?")',
      'Predictive Analytics ("What is likely to happen next?")',
      'Prescriptive Analytics ("What specific actions should we take?")',
    ],
  },

  // --- SM Sequencing (8 steps total across 2 scenarios: 4 + 4) ---
  {
    id: 'l4-sm-1',
    level: 4,
    type: 'sequencing',
    track: 'SM',
    prompt: 'Arrange the lifecycle steps of resolving a critical IT Incident ticket from inception to close:',
    steps: [
      'User reports system outage to the Service Desk and a ticket is logged.',
      'Ticket is triaged, categorized, and prioritized according to impact and urgency.',
      'Support specialists apply a workaround or fix to restore operational service.',
      'Service restoration is verified with the user and the ticket is officially closed.',
    ],
  },
  {
    id: 'l4-sm-2',
    level: 4,
    type: 'sequencing',
    track: 'SM',
    prompt: 'Arrange the sequence of executing a standard Change Enablement process for enterprise IT systems:',
    steps: [
      'A Request for Change (RFC) is submitted with technical justification.',
      'Change Advisory Board (CAB) reviews risks, dependencies, and fallback plans.',
      'The change is authorized and scheduled during an approved maintenance window.',
      'Post-implementation review (PIR) assesses whether the change succeeded.',
    ],
  },

  /* ==========================================================================
     LEVEL 5: IDENTIFICATION & ENUMERATION (27 Scored Questions: 9 NT, 9 BA, 9 SM)
     ========================================================================== */
  // --- NT Identification & Enumeration (9) ---
  {
    id: 'l5-nt-1',
    level: 5,
    type: 'identification',
    track: 'NT',
    prompt: 'What is the full name of the 7-layer theoretical networking model developed by the International Organization for Standardization?',
    acceptedAnswers: ['OSI Model', 'Open Systems Interconnection', 'OSI Reference Model', 'OSI'],
    placeholder: 'e.g. Open Systems Interconnection...',
  },
  {
    id: 'l5-nt-2',
    level: 5,
    type: 'identification',
    track: 'NT',
    prompt: 'How many binary bits compose an IPv6 IP address?',
    acceptedAnswers: ['128', '128 bits', '128-bit'],
    placeholder: 'Number of bits...',
  },
  {
    id: 'l5-nt-3',
    level: 5,
    type: 'identification',
    track: 'NT',
    prompt: 'What command-line utility tests network connectivity to a destination host using ICMP echo requests?',
    acceptedAnswers: ['ping', 'ping command', 'ping utility'],
    placeholder: 'Type command name...',
  },
  {
    id: 'l5-nt-4',
    level: 5,
    type: 'identification',
    track: 'NT',
    prompt: 'Enumerate the three foundational security pillars comprising the CIA Triad in network defense:',
    isEnumeration: true,
    acceptedAnswers: ['confidentiality', 'integrity', 'availability'],
    enumerationFields: [
      { label: 'Pillar 1 (Privacy/Secret)', acceptedAnswers: ['confidentiality', 'confidential'] },
      { label: 'Pillar 2 (Data Trust/Accuracy)', acceptedAnswers: ['integrity', 'accurate'] },
      { label: 'Pillar 3 (System Accessibility)', acceptedAnswers: ['availability', 'available'] },
    ],
  },
  {
    id: 'l5-nt-5',
    level: 5,
    type: 'identification',
    track: 'NT',
    prompt: 'List the three steps of the TCP connection establishment handshake in order:',
    isEnumeration: true,
    acceptedAnswers: ['syn', 'syn-ack', 'ack'],
    enumerationFields: [
      { label: 'Step 1', acceptedAnswers: ['syn', 'synchronize'] },
      { label: 'Step 2', acceptedAnswers: ['syn-ack', 'syn ack', 'synchronize acknowledge'] },
      { label: 'Step 3', acceptedAnswers: ['ack', 'acknowledge'] },
    ],
  },

  // --- BA Identification & Enumeration (9) ---
  {
    id: 'l5-ba-1',
    level: 5,
    type: 'identification',
    track: 'BA',
    prompt: 'What standard relational query language is used worldwide to manipulate, join, and extract tabular datasets from databases?',
    acceptedAnswers: ['SQL', 'Structured Query Language'],
    placeholder: 'e.g. SQL...',
  },
  {
    id: 'l5-ba-2',
    level: 5,
    type: 'identification',
    track: 'BA',
    prompt: 'What statistical term describes a data point that lies an abnormal distance from other values in a random sample?',
    acceptedAnswers: ['Outlier', 'Anomaly', 'Outliers'],
    placeholder: 'Type statistical term...',
  },
  {
    id: 'l5-ba-3',
    level: 5,
    type: 'identification',
    track: 'BA',
    prompt: 'What type of business intelligence display aggregates multiple charts and KPI gauges onto a single interactive executive screen?',
    acceptedAnswers: ['Dashboard', 'Dashboards', 'BI Dashboard'],
    placeholder: 'Type display name...',
  },
  {
    id: 'l5-ba-4',
    level: 5,
    type: 'identification',
    track: 'BA',
    prompt: 'Enumerate the three stages of the ETL enterprise data warehousing pipeline:',
    isEnumeration: true,
    acceptedAnswers: ['extract', 'transform', 'load'],
    enumerationFields: [
      { label: 'Phase 1 (Retrieve)', acceptedAnswers: ['extract', 'extraction'] },
      { label: 'Phase 2 (Clean & Shape)', acceptedAnswers: ['transform', 'transformation'] },
      { label: 'Phase 3 (Store in Warehouse)', acceptedAnswers: ['load', 'loading'] },
    ],
  },
  {
    id: 'l5-ba-5',
    level: 5,
    type: 'identification',
    track: 'BA',
    prompt: 'List the three fundamental measures of central tendency in statistical distribution analysis:',
    isEnumeration: true,
    acceptedAnswers: ['mean', 'median', 'mode'],
    enumerationFields: [
      { label: 'Measure 1 (Average)', acceptedAnswers: ['mean', 'arithmetic mean', 'average'] },
      { label: 'Measure 2 (Middle value)', acceptedAnswers: ['median', 'midpoint'] },
      { label: 'Measure 3 (Most frequent)', acceptedAnswers: ['mode'] },
    ],
  },

  // --- SM Identification & Enumeration (9) ---
  {
    id: 'l5-sm-1',
    level: 5,
    type: 'identification',
    track: 'SM',
    prompt: 'What is the full academic title of the green BSIT track at Batangas State University (Always Service Management)?',
    acceptedAnswers: ['Service Management', 'Service Management Track', 'SM'],
    placeholder: 'e.g. Service Management...',
  },
  {
    id: 'l5-sm-2',
    level: 5,
    type: 'identification',
    track: 'SM',
    prompt: 'What formal acronym represents the contract between an IT provider and client specifying guaranteed uptime and response benchmarks?',
    acceptedAnswers: ['SLA', 'Service Level Agreement'],
    placeholder: 'e.g. SLA...',
  },
  {
    id: 'l5-sm-3',
    level: 5,
    type: 'identification',
    track: 'SM',
    prompt: 'What primary ITSM practice focuses on finding and addressing the root cause of recurring system incidents?',
    acceptedAnswers: ['Problem Management', 'Problem Investigation'],
    placeholder: 'Type practice name...',
  },
  {
    id: 'l5-sm-4',
    level: 5,
    type: 'identification',
    track: 'SM',
    prompt: 'Enumerate the three fundamental elements of customer experience (CX) in IT service delivery:',
    isEnumeration: true,
    acceptedAnswers: ['people', 'process', 'technology'],
    enumerationFields: [
      { label: 'Element 1 (Human talent)', acceptedAnswers: ['people', 'staff', 'users', 'humans'] },
      { label: 'Element 2 (Workflows & procedures)', acceptedAnswers: ['process', 'processes', 'workflows'] },
      { label: 'Element 3 (Tools & infrastructure)', acceptedAnswers: ['technology', 'tools', 'tech', 'systems'] },
    ],
  },
  {
    id: 'l5-sm-5',
    level: 5,
    type: 'identification',
    track: 'SM',
    prompt: 'List three core ITIL 4 Guiding Principles for modern digital service management organizations:',
    isEnumeration: true,
    acceptedAnswers: ['focus on value', 'start where you are', 'collaborate and promote visibility'],
    enumerationFields: [
      { label: 'Principle 1', acceptedAnswers: ['focus on value', 'value focus', 'value'] },
      { label: 'Principle 2', acceptedAnswers: ['start where you are', 'baseline assessment'] },
      { label: 'Principle 3', acceptedAnswers: ['keep it simple and practical', 'collaborate and promote visibility', 'think and work holistically', 'progress iteratively with feedback'] },
    ],
  },
];
