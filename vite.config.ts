import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

const LUNI_SYSTEM_PROMPT = `You are Luni, the Moonstone AI Companion and academic mentor for first-year BSIT students at Batangas State University – Alangilan Campus (The National Engineering University).

CORE RULES:
1. Answer EVERY question directly, helpfully, and naturally—whether it is a greeting, a follow-up, a specific BSIT track question (NT, BA, SM), a study tip, or general student life advice.
2. Keep replies concise (2 to 3 short paragraphs or 3 bullet points max, under 140 words) unless the user asks for a detailed breakdown.
3. Match the student's language naturally (English if they write in English; warm, natural Taglish if they write in Filipino or Taglish).
4. Plain text ONLY: Never use Markdown symbols (**bold**, *italics*, # headers, or backticks). Use line breaks, bullet dashes (-), or CAPITALIZATION for emphasis. Use 1–2 celestial emojis (✨, 🌙, ✦) sparingly.
5. Reference Student Context (name, quiz match, track progress) naturally when relevant.

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
      // Prioritize larger/newer Llama, Qwen, or GPT-OSS chat models
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
    // Fall back to default candidates below
  }
  return ['llama-3.3-70b-versatile', 'openai/gpt-oss-20b', 'qwen/qwen3-32b'];
}

function luniDevApiPlugin(geminiKey: string, groqKey: string): Plugin {
  return {
    name: 'luni-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/luni-chat', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        if (!geminiKey && !groqKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing GEMINI_API_KEY and GROQ_API_KEY in .env' }));
          return;
        }

        let rawBody = '';
        req.on('data', (chunk: Buffer | string) => {
          rawBody += String(chunk);
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(rawBody || '{}');
            const userMessage = String(body.message || '').trim();
            if (!userMessage) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Message is required.' }));
              return;
            }

            const ctx = body.studentContext;
            const contextSummary = ctx
              ? `\n\nStudent Context: Name=${ctx.name || 'Luminary'}, Focus=${ctx.trackFocus || 'General'}, TopQuizMatch=${ctx.recommendedTrack || 'Not taken yet'}, Progress(NT=${ctx.ntProgress ?? 0}%, BA=${ctx.baProgress ?? 0}%, SM=${ctx.smProgress ?? 0}%)`
              : '';

            const fullSystemPrompt = LUNI_SYSTEM_PROMPT + contextSummary;
            const cleanHistory: ChatHistoryEntry[] = Array.isArray(body.history)
              ? body.history.slice(-8).map((m: { role?: string; content?: string }): ChatHistoryEntry => ({
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
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ reply, provider: 'groq', model: groqModel }));
                      return;
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

            // 2. Failover: Google Gemini (15s timeout so slow responses don't abort prematurely)
            if (geminiKey) {
              const geminiContents = [
                ...cleanHistory.map((m: ChatHistoryEntry) => ({
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
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ reply, provider: 'gemini', model }));
                      return;
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

            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: errors.join(' || ') }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Unexpected dev server error',
              }),
            );
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
  const groqKey = env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || '';
  return {
    plugins: [react(), tailwindcss(), luniDevApiPlugin(geminiKey, groqKey)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});