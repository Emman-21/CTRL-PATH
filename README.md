<div align="center">

# 🌙 CTRL+PATH 🧚
### *Choose Your Next Move — Interactive BSIT Specialization Discovery Platform*

[![Live Demo](https://img.shields.io/badge/Live_Demo-ctrl--path.vercel.app-7C3AED?style=for-the-badge&logo=vercel&logoColor=white)](https://ctrl-path.vercel.app)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

An interactive BSIT specialization discovery and academic guidance platform built for **Batangas State University – Alangilan** students. **CTRL+PATH** empowers students across all year levels to explore, compare, and decide between the three BSIT specialization tracks—**Networking Technology (NT)**, **Business Analytics (BA)**, and **Service Management (SM)**—guided by **Luni**, an adaptive Moonstone AI mentor.

</div>

---

## 🎯 BSIT Specialization Tracks

| Track | Code | Focus Areas & Career Pathways |
| :--- | :---: | :--- |
| **Networking Technology** | `NT` | Network infrastructure, routing & switching, wireless protocols, cloud systems, and cybersecurity operations |
| **Business Analytics** | `BA` | Data engineering, exploratory data analysis, BI dashboards, statistical modeling, and data-driven strategy |
| **Service Management** | `SM` | IT operations, ITIL v4 frameworks, SLAs, customer experience, incident management, and enterprise IT governance |

---

## ✨ Platform Features

- **🧭 Track Explorer (`/tracks`):** Deep-dive into `NT`, `BA`, and `SM` curricula, core competencies, technical tools, and career trajectories.
- **🎯 CTRL+Quiz (`/quiz`) & Smart Results (`/results`):** Interactive diagnostic assessment that evaluates student strengths and preferences to generate personalized track-match scores.
- **⚖️ Path Compare (`/compare`):** Side-by-side comparison matrix of technical depth, coursework focus, and career outcomes across all three tracks.
- **🤖 Luni AI Companion:** Floating interactive assistant powered by **Vercel Edge Functions** (`Groq` / `Gemini`) featuring real-time academic mentoring, website navigation guidance, Curriculum Q&A, and a built-in local fallback knowledge base.
- **🎓 Alumni Stories (`/alumni`):** Real career journeys, industry insights, and advice from BatStateU Alangilan BSIT graduates.
- **💎 Achievements & Gemstone Vault (`/achievements`):** Gamified milestone tracking with unlockable badges, gemstones, and tactile UI sound effects.
- **⚙️ Control Center (`/control-center`):** Student profile customization, dark/light theme switcher, UI audio controls, reflection logs, quiz history, and privacy/data settings.
- **🔐 Authentication & Guest Mode (`/login`):** Google OAuth and email sign-in powered by **Supabase**, alongside instant guest exploration access.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, React Router, Tailwind CSS |
| **AI & Edge Runtime** | Vercel Edge Functions (`api/luni-chat.ts`), Groq API / Google Gemini API |
| **Backend & Auth** | Supabase (PostgreSQL, Row-Level Security, Google OAuth) |
| **Deployment** | Vercel (SPA Routing Rewrites + Edge Serverless Functions) |

---

## 📁 Project Structure

    CTRL-PATH/
    ├── api/
    │   └── luni-chat.ts          # Vercel Edge Function for Luni Live AI
    ├── public/
    │   └── assets/               # Custom pixel sprites, icons, and static media
    ├── src/
    │   ├── assets/               # Media & static imports
    │   ├── components/           # Layout shell, Luni modal, shared UI, and feature cards
    │   ├── context/              # StudentContext & CommunityContext state management
    │   ├── data/                 # Track data, curriculum info, and local knowledge base
    │   ├── hooks/                # Custom React hooks
    │   ├── lib/                  # Supabase & external service clients
    │   ├── pages/                # Dashboard, Tracks, Quiz, Results, Compare, Alumni, Achievements, Control Center, Login
    │   ├── services/             # AI & API service handlers
    │   ├── types/                # TypeScript interfaces and type definitions
    │   ├── utils/                # Auth session helpers, achievement rules, and UI sound effects
    │   ├── App.tsx               # Route definitions & auth gate
    │   └── main.tsx              # Application entry point
    ├── supabase/
    │   └── migrations/           # Database migrations & SQL schema setup
    ├── tests/                    # Automated tests
    ├── vercel.json               # SPA & API routing rewrite rules
    └── vite.config.ts            # Vite bundler configuration

---

## 🚀 Getting Started (Local Development)

1. **Clone the Repository:**

       git clone https://github.com/Emman-21/CTRL-PATH.git
       cd CTRL-PATH

2. **Install Dependencies:**

       npm install

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and populate your credentials:

       VITE_SUPABASE_URL=your_supabase_project_url
       VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
       GROQ_API_KEY=your_groq_api_key
       GEMINI_API_KEY=your_gemini_api_key

4. **Start the Development Server:**

       npm run dev

---

## 🌐 Deployment (Vercel)

1. Import the GitHub repository into **Vercel** using the **Vite** framework preset (`npm run build`, output directory: `dist`).
2. Add `GROQ_API_KEY`, `GEMINI_API_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` under **Project Settings → Environment Variables**.
3. Keep `vercel.json` in the project root so SPA client routes and `/api/*` Edge Functions resolve cleanly:

       {
         "rewrites": [
           { "source": "/api/(.*)", "destination": "/api/$1" },
           { "source": "/(.*)", "destination": "/index.html" }
         ]
       }

4. Add `https://ctrl-path.vercel.app` as the **Site URL** and `https://ctrl-path.vercel.app/**` under **Redirect URLs** in **Supabase → Authentication → URL Configuration**.

---

## 👥 Project Team — Group 5 Web Systems and Technologies

| Member | Role |
| :--- | :--- |
| **Emman Borillo** | Full-Stack Development & AI Integration |
| **Rob Gunther Rivera** | UI/UX Design |
| **Ayessa Orcine** | Project Lead & Quality Assurance |

---

<div align="center">
  <sub>Built with 💜 for Batangas State University – Alangilan BSIT Students</sub>
</div>
