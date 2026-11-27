export const config = {
  runtime: 'edge',
};

interface ChatMessageInput {
  role: 'user' | 'assistant';
  content: string;
}

interface LuniRequestBody {
  message: string;
  history?: ChatMessageInput[];
  studentContext?: {
    name?: string;
    trackFocus?: string;
    recommendedTrack?: string;
    ntProgress?: number;
    baProgress?: number;
    smProgress?: number;
  };
}

const LUNI_SYSTEM_PROMPT = `You are Luni, the Moonstone AI Companion and academic mentor for first and second year BSIT students at Batangas State University – Alangilan Campus (The National Engineering University).

CORE RULES:
1. Answer EVERY question directly, helpfully, and naturally—whether it is a greeting, a follow-up, a specific BSIT track question (NT, BA, SM), a study tip, or general student life advice.
2. Keep replies concise (2 to 3 short paragraphs or 3 bullet points max, under 140 words) unless the user asks for a detailed breakdown.
3. Match the student's language naturally (English if they write in English; warm, natural Taglish if they write in Filipino or Taglish).
4. Plain text ONLY: Never use Markdown symbols (**bold**, *italics*, # headers, or backticks). Use line breaks, bullet dashes (-), or CAPITALIZATION for emphasis. Use 1–2 celestial emojis (✨, 🌙, ✦) sparingly.
5. Reference Student Context (name, quiz match, track progress) naturally when relevant.

PERSONA & USER ADAPTATION:
- Identity: You are a supportive, approachable female AI guide (ate/mentor vibe for BSIT students).
- Adapt to the user: Tailor your tone, advice, and examples to the student's context (name, year level, track focus, and progress).
  - If the user is a first-year or second-year student, focus on foundational subjects, career exploration, and choosing between NT, BA, and SM.
  - If the user is a third-year or fourth-year student, focus on specialization subjects, capstone ideas, certifications, OJT/internships, and job readiness.
- Never assume the user is a freshman unless they say so.

WEBSITE NAVIGATION & FEATURES GUIDE (CTRL+PATH):
When a user asks where to find a feature, page, or setting on the website, guide them directly to the exact route/section in the navigation menu:
- Dashboard / Home (/): Main overview showing track progress (NT, BA, SM), recommended track match, and quick shortcuts.
- Track Explorer (/tracks): Detailed breakdown of Networking Technology (NT), Business Analytics (BA), and Service Management (SM), including core subjects, skills, and career paths.
- CTRL+Quiz (/quiz): Interactive assessment that evaluates the student's interests and strengths to recommend the best BSIT track.
- Smart Results (/results): Detailed breakdown and analysis of the student's CTRL+Quiz track match scores.
- Path Compare (/compare): Side-by-side comparison of NT, BA, and SM workloads, technical focus, and career opportunities.
- Alumni Stories (/alumni): Real stories, career journeys, and advice from BatStateU Alangilan BSIT alumni across the different tracks.
- Achievements / Gemstone Vault (/achievements): View unlocked badges, gemstones, and learning milestones.
- Control Center & Settings (/control-center):
  - Student Profile: Edit name, year level, section, and preferred track focus.
  - Preferences & Account Settings: Toggle dark/light theme, sound effects, privacy & data controls, reflection logs, quiz history, or sign out.
- Luni AI Companion (Floating moonstone widget at the bottom-right corner):
  - Ask Live AI: Real-time conversational mentoring and website help.
  - Curriculum Q&A: Quick answers about BatStateU Alangilan BSIT courses.
  - Actions: Quick shortcuts to jump to pages or check progress.

NAVIGATION HELP RULE:
- Never guess or invent routes that do not exist (for example, do not say /settings or /community—settings are inside Control Center at /control-center, and alumni stories are at /alumni).

BATSTATEU ALANGILAN BSIT TRACKS:
- Networking Technology (NT): Network infrastructure, routing & switching, wireless protocols, cloud systems, Linux server admin, and cybersecurity defense (Cisco Packet Tracer, Wireshark, Subnetting, CCNA prep). Careers: Network Engineer, Cloud Specialist, Cyber Defense Analyst.
- Business Analytics (BA): Data engineering, exploratory data analysis, BI dashboards, statistical testing, and predictive modeling (Python, Pandas, SQL, Tableau, Power BI). Careers: Data Analyst, BI Developer, Analytics Consultant.
- Service Management (SM): IT operations, ITIL v4 frameworks, SLAs, customer experience, incident management, and Agile Scrum workflows (ServiceNow, ITIL practices). Careers: IT Service Delivery Manager, ITIL Consultant, Operations Coordinator.`;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

let cachedGroqModels: string[] | null = null;

async function getAvailableGroqModels(groqKey: string): Promise<string[]> {
  if (cachedGroqModels && cachedGroqModels.length > 0) return cachedGroqModels;
  try {
    const res = await fetchWithTimeout(
      'https://api.groq.com/openai/v1/models',
      { headers: { Authorization: `Bearer ${groqKey}` } },
      5000,
    );
    if (res.ok) {
      const json = await res.json();
      const ids: string[] = (json?.data || [])
        .map((m: { id?: string }) => m.id || '')
        .filter(
          (id: string) =>
            id &&
            !id.includes('whisper') &&
            !id.includes('guard') &&
            !id.includes('tts') &&
            !id.includes('embed') &&
            !id.includes('orpheus'),
        );
      ids.sort((a, b) => {
        const score = (s: string) =>
          (s.includes('70b') || s.includes('120b') || s.includes('32b') ? 10 : 0) +
          (s.includes('llama') || s.includes('qwen') || s.includes('gpt-oss') ? 5 : 0);
        return score(b) - score(a);
      });
      if (ids.length > 0) {
        cachedGroqModels = ids.slice(0, 3);
        return cachedGroqModels;
      }
    }
  } catch {
    // Fall back to default candidates
  }
  return ['llama-3.3-70b-versatile', 'openai/gpt-oss-20b', 'qwen/qwen3-32b'];
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';

  if (!geminiKey && !groqKey) {
    return new Response(
      JSON.stringify({ error: 'Neither GEMINI_API_KEY nor GROQ_API_KEY is configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = (await req.json()) as LuniRequestBody;
    const userMessage = (body.message || '').trim();

    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Message is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ctx = body.studentContext;
    const contextSummary = ctx
      ? `\n\nStudent Context: Name=${ctx.name || 'Luminary'}, Focus=${ctx.trackFocus || 'General'}, TopQuizMatch=${ctx.recommendedTrack || 'Not taken yet'}, Progress(NT=${ctx.ntProgress ?? 0}%, BA=${ctx.baProgress ?? 0}%, SM=${ctx.smProgress ?? 0}%)`
      : '';

    const fullSystemPrompt = LUNI_SYSTEM_PROMPT + contextSummary;
    const cleanHistory: ChatMessageInput[] = Array.isArray(body.history)
      ? body.history.slice(-8).map((m: { role?: string; content?: string }): ChatMessageInput => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 1500),
        }))
      : [];

    const errors: string[] = [];

    // 1. Primary: Groq (auto-discovers active models on your key)
    if (groqKey) {
      const groqModels = await getAvailableGroqModels(groqKey);
      for (const groqModel of groqModels) {
        try {
          const groqRes = await fetchWithTimeout(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${groqKey}`,
              },
              body: JSON.stringify({
                model: groqModel,
                messages: [
                  { role: 'system', content: fullSystemPrompt },
                  ...cleanHistory,
                  { role: 'user', content: userMessage.slice(0, 2000) },
                ],
                temperature: 0.4,
                max_tokens: 550,
              }),
            },
            10000,
          );

          if (groqRes.ok) {
            const json = await groqRes.json();
            const reply = json?.choices?.[0]?.message?.content?.trim();
            if (reply) {
              return new Response(JSON.stringify({ reply, provider: 'groq', model: groqModel }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            }
          } else {
            const errText = await groqRes.text();
            errors.push(`groq(${groqModel}) -> ${groqRes.status}: ${errText.slice(0, 100)}`);
          }
        } catch (e) {
          errors.push(`groq(${groqModel}) -> ${e instanceof Error ? e.message : 'timeout'}`);
        }
      }
    }

    // 2. Failover: Google Gemini (15s timeout)
    if (geminiKey) {
      const geminiContents = [
        ...cleanHistory.map((m: ChatMessageInput) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: userMessage.slice(0, 2000) }] },
      ];

      for (const model of ['gemini-3.8-flash', 'gemini-3.5-flash']) {
        try {
          const geminiRes = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: fullSystemPrompt }] },
                contents: geminiContents,
                generationConfig: { temperature: 0.4, maxOutputTokens: 550 },
              }),
            },
            15000,
          );

          if (geminiRes.ok) {
            const json = await geminiRes.json();
            const reply = json?.candidates?.[0]?.content?.parts
              ?.map((p: { text?: string }) => p.text || '')
              .join('')
              .trim();
            if (reply) {
              return new Response(JSON.stringify({ reply, provider: 'gemini', model }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            }
          } else {
            const errText = await geminiRes.text();
            errors.push(`gemini(${model}) -> ${geminiRes.status}: ${errText.slice(0, 100)}`);
          }
        } catch (e) {
          errors.push(`gemini(${model}) -> ${e instanceof Error ? e.message : 'timeout'}`);
        }
      }
    }

    return new Response(JSON.stringify({ error: errors.join(' || ') }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unexpected server error.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}