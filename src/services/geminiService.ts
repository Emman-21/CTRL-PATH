import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client safely (uses process.env.GEMINI_API_KEY or import.meta.env.VITE_GEMINI_API_KEY)
const apiKey =
  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
  (import.meta as any).env?.VITE_GEMINI_API_KEY ||
  '';

let aiInstance: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiInstance = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Gemini AI initialization skipped:', err);
  }
}

export const LUNI_SYSTEM_PROMPT = `You are Luni, the magical, celestial Moonstone Companion and academic mentor for first-year Bachelor of Science in Information Technology (BSIT) students at Batangas State University – Alangilan Campus (The National Engineering University).

Your personality:
- Warm, cheerful, encouraging, starry, and academically knowledgeable.
- Use celestial touches like ✨, 🌙, ✦ sparingly and naturally.
- Speak in clear, supportive English (with occasional friendly Filipino warmth like "Kumusta, Luminary!", "Kaya mo 'yan!").
- Keep responses concise (2-4 paragraphs max), practical, and actionable.

The 3 Specialization Tracks at BatStateU Alangilan:
1. Networking Technology (NT):
   - Focus: Infrastructure, routing & switching, network defense, wireless protocols, cloud systems, and cybersecurity.
   - Core tools/topics: Cisco Packet Tracer, Wireshark, OSI Model, Subnetting, OSPF/BGP, Linux Server Administration, CCNA alignment.
   - Career paths: Network Engineer, Cloud Infrastructure Specialist, Cyber Defense Analyst, Systems Administrator.

2. Business Analytics (BA):
   - Focus: Data engineering, exploratory data analysis, business intelligence dashboards, predictive modeling, and strategic decision making.
   - Core tools/topics: Python (Pandas, NumPy), SQL queries, Tableau, Microsoft Power BI, Statistical testing, ETL pipelines.
   - Career paths: Data Analyst, BI Developer, Analytics Consultant, Market Intelligence Specialist.

3. Service Management (SM):
   - Focus: IT Operations, ITIL v4 frameworks, customer experience (CX), service level agreements (SLAs), enterprise incident management, and digital workflow orchestration.
   - Core tools/topics: ITIL practices, ServiceNow, Agile Scrum, Service Desk operations, Quality management.
   - Career paths: IT Service Delivery Manager, Incident Response Coordinator, ITIL Consultant, Customer Experience Director.

Provide supportive guidance, study tips for the CTRL Quiz, comparisons between tracks, and advice on balancing academics with college life.`;

export async function askLuniAi(userQuestion: string): Promise<string> {
  if (!apiKey || !aiInstance) {
    // Provide a smart local fallback if API key is not configured in environment
    return getLocalLuniAnswer(userQuestion);
  }

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuestion,
      config: {
        systemInstruction: LUNI_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    return response.text || 'The stars are shining bright! What else would you like to explore together? 🌙✨';
  } catch (error) {
    console.warn('Gemini live call error, using local knowledge base:', error);
    return getLocalLuniAnswer(userQuestion);
  }
}

/**
 * Intelligent local fallback answering engine matching key curriculum queries.
 */
function getLocalLuniAnswer(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('difference') || q.includes('compare') || q.includes('which track') || q.includes('better')) {
    return `Every track at BatStateU Alangilan leads to a rewarding future, Luminary! 🌙✨
• Networking Technology (NT) is for creators who love building hardware connections, cybersecurity defense, and enterprise cloud networks.
• Business Analytics (BA) is for curious thinkers who love discovering stories in data, calculating trends, and crafting decision dashboards with Python & SQL.
• Service Management (SM) is for natural leaders who love optimizing workflows, managing ITIL service desks, and bridging tech teams with client satisfaction.
Try checking out the **Path Compare** page to view them side-by-side!`;
  }

  if (q.includes('networking') || q.includes('nt') || q.includes('cisco') || q.includes('ccna')) {
    return `Networking Technology (NT) is all about keeping the digital world connected and safe! 🌐✨
At BatStateU Alangilan, you will master TCP/IP, subnetting, router configurations, and cybersecurity in our dedicated computer laboratories. Graduates frequently land roles as Network Engineers, Cloud Administrators, and Cyber Defense Specialists.`;
  }

  if (q.includes('analytics') || q.includes('ba') || q.includes('data') || q.includes('python')) {
    return `Business Analytics (BA) turns raw numbers into powerful strategies! 📊✨
You'll work with SQL databases, Python analytics libraries, and Power BI dashboards to forecast market behavior and business performance. It's one of the fastest growing fields globally with high industry demand in fintech, healthcare, and enterprise commerce.`;
  }

  if (q.includes('service') || q.includes('sm') || q.includes('itil') || q.includes('management')) {
    return `Service Management (SM) is the strategic engine of modern IT! 🚀✨
Rather than just coding or cabling, you orchestrate how teams deliver value. You will learn the globally recognized ITIL v4 framework, SLA governance, and human-centric tech solutions. It's fantastic for students aiming for managerial and operations leadership roles.`;
  }

  if (q.includes('quiz') || q.includes('ctrl quiz') || q.includes('test')) {
    return `The CTRL Quiz is designed especially for you! 🌟
It consists of 5 engaging levels covering interest, scenario problem solving, technical affinity, and personal goals. Take your time, trust your intuition, and your answers will reveal your natural track affinity and award you milestone gemstones!`;
  }

  return `That's a wonderful question, Luminary! 🌙✨
As a first-year BSIT student at BatStateU Alangilan, remember that every small discovery builds toward your future. Dive into our **Track Explorer** to inspect specific course modules, take the **CTRL Quiz** to assess your strengths, or visit the **Gemstone Vault** to track your achievements!`;
}
