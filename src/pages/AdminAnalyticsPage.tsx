import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  Download,
  Lock,
  MessageSquare,
  Moon,
  PieChart,
  RefreshCw,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  verifyAdminAndFetchAnalytics,
  type AdminAnalyticsPayload,
} from '../lib/supabase';
import { NtTrackBadge, BaTrackBadge, SmTrackBadge } from '../components/shared/PixelArt';
import { LuniCharacter } from '../components/luni/LuniCharacter';
import { useStudent } from '../context/StudentContext';

export const ADMIN_PASS_SESSION_KEY = 'ctrl_admin_passcode_v1';

const TRACK_META: Record<
  'NT' | 'BA' | 'SM',
  { name: string; short: string; color: string; hex: string; bg: string; ring: string }
> = {
  NT: {
    name: 'Networking Technology',
    short: 'NT',
    color: 'text-blue-700 dark:text-blue-400',
    hex: '#3b82f6',
    bg: 'bg-blue-600 dark:bg-blue-500',
    ring: 'border-blue-500/40 bg-blue-500/10',
  },
  BA: {
    name: 'Business Analytics',
    short: 'BA',
    color: 'text-violet-700 dark:text-violet-400',
    hex: '#10b981',
    bg: 'bg-violet-600 dark:bg-violet-500',
    ring: 'border-emerald-500/40 bg-emerald-500/10',
  },
  SM: {
    name: 'Service Management',
    short: 'SM',
    color: 'text-green-700 dark:text-green-400',
    hex: '#f59e0b',
    bg: 'bg-green-600 dark:bg-green-500',
    ring: 'border-amber-500/40 bg-amber-500/10',
  },
};

function TrackLogo({ code, size = 34 }: { code: 'NT' | 'BA' | 'SM'; size?: number }) {
  if (code === 'NT') return <NtTrackBadge size={size} className="rounded-xl shrink-0" />;
  if (code === 'BA') return <BaTrackBadge size={size} className="rounded-xl shrink-0" />;
  return <SmTrackBadge size={size} className="rounded-xl shrink-0" />;
}

export function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const { state, updatePreferences } = useStudent();
  const theme = state.preferences.theme || 'dark';
  const isLight = theme === 'light';
  const [data, setData] = useState<AdminAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'feedback'>('analytics');

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return () => {
      delete root.dataset.theme;
      root.classList.remove('dark');
    };
  }, [theme]);

  const loadAnalytics = async () => {
    const passcode = sessionStorage.getItem(ADMIN_PASS_SESSION_KEY);
    if (!passcode) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await verifyAdminAndFetchAnalytics(passcode);
      setData(res);
    } catch (err) {
      sessionStorage.removeItem(ADMIN_PASS_SESSION_KEY);
      setError(err instanceof Error ? err.message : 'Admin session expired.');
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const handleLockAndExit = () => {
    sessionStorage.removeItem(ADMIN_PASS_SESSION_KEY);
    navigate('/login', { replace: true });
  };

  const handleExportCsv = () => {
    if (!data) return;
    const { summary, daily_activity } = data;
    const rows = [
      ['Metric', 'Networking Technology (NT)', 'Business Analytics (BA)', 'Service Management (SM)'],
      [
        'Quiz Recommended Count',
        summary.recommended_counts.NT,
        summary.recommended_counts.BA,
        summary.recommended_counts.SM,
      ],
      [
        'Most Explored / Chosen Count',
        summary.chosen_counts.NT,
        summary.chosen_counts.BA,
        summary.chosen_counts.SM,
      ],
      [
        'Average Module Progress (%)',
        summary.avg_progress.NT,
        summary.avg_progress.BA,
        summary.avg_progress.SM,
      ],
      [],
      ['Total Active Students', summary.total_students],
      ['Total Quiz Attempts', summary.total_quiz_attempts],
      [],
      ['7-Day Activity Date', 'Active Students'],
      ...(daily_activity || []).map((d) => [d.iso_date, d.active_count]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ctrl-path-track-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const summary = data?.summary;
  const dailyActivity = data?.daily_activity ?? [];
  const tracks: Array<'NT' | 'BA' | 'SM'> = ['NT', 'BA', 'SM'];

  const topRecommended = summary
    ? tracks.reduce((best, cur) =>
        summary.recommended_counts[cur] > summary.recommended_counts[best] ? cur : best,
      )
    : 'NT';

  const topExplored = summary
    ? tracks.reduce((best, cur) =>
        summary.avg_progress[cur] > summary.avg_progress[best] ? cur : best,
      )
    : 'NT';

  const totalRecommended = summary
    ? summary.recommended_counts.NT + summary.recommended_counts.BA + summary.recommended_counts.SM
    : 0;

  // Para sa Grouped Bar Chart scaling
  const maxBarCount = summary
    ? Math.max(
        1,
        ...tracks.flatMap((t) => [summary.recommended_counts[t], summary.chosen_counts[t]]),
      )
    : 1;

  // Para sa 7-Day Activity Line Graph
  const maxDailyCount = Math.max(1, ...dailyActivity.map((d) => d.active_count));
  const peakDay = dailyActivity.reduce(
    (best, cur) => (cur.active_count > best.active_count ? cur : best),
    dailyActivity[0] ?? { day: '—', iso_date: '', active_count: 0 },
  );

  const lineChartW = 360;
  const lineChartH = 145;
  const padLeft = 24;
  const padRight = 24;
  const padTop = 26;
  const padBottom = 16;
  const plotW = lineChartW - padLeft - padRight;
  const plotH = lineChartH - padTop - padBottom;

  const linePoints = dailyActivity.map((pt, idx) => {
    const x =
      dailyActivity.length > 1
        ? padLeft + (idx / (dailyActivity.length - 1)) * plotW
        : padLeft + plotW / 2;
    const y = padTop + plotH - (pt.active_count / maxDailyCount) * plotH;
    return { ...pt, x, y };
  });

  const polylineCoords = linePoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaCoords =
    linePoints.length > 0
      ? `${linePoints[0].x},${padTop + plotH} ${polylineCoords} ${
          linePoints[linePoints.length - 1].x
        },${padTop + plotH}`
      : '';

  // Para sa SVG Donut Chart calculations
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  const donutSegments = tracks.map((code) => {
    const count = summary?.recommended_counts[code] ?? 0;
    const pct = totalRecommended > 0 ? count / totalRecommended : 0;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    cumulativePercent += pct;
    return {
      code,
      count,
      pctRounded: Math.round(pct * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060a14] dark:text-slate-100 px-3 py-5 sm:px-8 sm:py-8 overflow-x-hidden">
      {/* Background Picture + Celestial Gradient Overlay */}
      <div
        aria-hidden="true"
        className="login-bgimg fixed inset-0 bg-cover bg-center opacity-10 dark:opacity-30 pointer-events-none"
        style={{ backgroundImage: "url('/assets/login/bg-celestial.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-gradient-to-b from-slate-50/80 via-white/90 to-slate-100/95 dark:from-[#060a14]/80 dark:via-[#080d1a]/88 dark:to-[#060a14]/95 pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Top Header with Luni Pose */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-indigo-200 dark:border-indigo-500/25 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-600/30 dark:to-purple-600/30 border border-indigo-300 dark:border-indigo-400/40 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              <LuniCharacter
                state="idle"
                size={56}
                animate={true}
                showParticles={false}
                particleOverride="none"
                hoverGlow={false}
                interactive={false}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <Sparkles size={13} />
                <span className="sm:hidden">CICS Admin Portal</span>
                <span className="hidden sm:inline">CICS Faculty & Administrator Portal</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                CTRL+PATH Track Analytics
              </h1>
              <p className="text-xs text-slate-600/90 dark:text-slate-300/80">
                BatStateU Alangilan · BSIT Specialization Insights (NT · BA · SM)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => updatePreferences({ theme: isLight ? 'dark' : 'light' })}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={() => void loadAnalytics()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!summary}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-blue-950/50"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleLockAndExit}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-rose-200 dark:border-rose-500/35 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Lock size={14} />
              <span>Lock & Exit</span>
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 backdrop-blur-md border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm"
          >
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/60'
                : 'bg-blue-50 backdrop-blur-md text-blue-800 hover:text-blue-950 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:text-white dark:border-blue-800/60'
            }`}
          >
            <BarChart3 size={15} />
            <span className="sm:hidden">Analytics</span>
            <span className="hidden sm:inline">Track Distribution & Charts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-2.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeTab === 'feedback'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/60'
                : 'bg-blue-50 backdrop-blur-md text-blue-800 hover:text-blue-950 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:text-white dark:border-blue-800/60'
            }`}
          >
            <MessageSquare size={15} />
            <span className="sm:hidden">Feedback ({data?.feedback.length ?? 0})</span>
            <span className="hidden sm:inline">Student Feedback ({data?.feedback.length ?? 0})</span>
          </button>
        </div>

        {loading && !summary ? (
          <div className="bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-sm text-slate-600 dark:text-slate-300">
            Loading aggregated CICS student analytics…
          </div>
        ) : summary && activeTab === 'analytics' ? (
          <>
            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
                  <span>ACTIVE BSIT STUDENTS</span>
                  <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{summary.total_students}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">Synced GSuite student accounts</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
                  <span>TOTAL QUIZ ATTEMPTS</span>
                  <BookOpen size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{summary.total_quiz_attempts}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">Completed CTRL assessments</p>
              </div>

              {/* Card 3: Top Quiz Recommendation (With Track Logo) */}
              <div className="bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2.5">
                  <span>TOP QUIZ RECOMMENDATION</span>
                  <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex items-center gap-3">
                  <TrackLogo code={topRecommended} size={42} />
                  <div>
                    <div className={`text-sm font-black leading-tight ${TRACK_META[topRecommended].color}`}>
                      {TRACK_META[topRecommended].name}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {summary.recommended_counts[topRecommended]} quiz match
                      {summary.recommended_counts[topRecommended] === 1 ? '' : 'es'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Highest Exploration (With Track Logo) */}
              <div className="bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold mb-2.5">
                  <span>HIGHEST EXPLORATION</span>
                  <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex items-center gap-3">
                  <TrackLogo code={topExplored} size={42} />
                  <div>
                    <div className={`text-sm font-black leading-tight ${TRACK_META[topExplored].color}`}>
                      {TRACK_META[topExplored].name} ({summary.avg_progress[topExplored]}%)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Highest average module completion
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Donut Chart + Grouped Column Comparison Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart A: SVG Donut Chart (Quiz Recommended Share) */}
              <section className="bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between space-y-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Quiz Recommendation Share
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Proportional breakdown of BSIT track results from CTRL Quiz.
                    </p>
                  </div>
                  <PieChart size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  {/* Donut SVG */}
                  <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                      <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        className="stroke-slate-200 dark:stroke-slate-800"
                        strokeWidth="16"
                      />
                      {totalRecommended > 0 &&
                        donutSegments.map((seg) =>
                          seg.count > 0 ? (
                            <circle
                              key={seg.code}
                              cx="70"
                              cy="70"
                              r={radius}
                              fill="transparent"
                              stroke={TRACK_META[seg.code].hex}
                              strokeWidth="16"
                              strokeDasharray={seg.strokeDasharray}
                              strokeDashoffset={seg.strokeDashoffset}
                              strokeLinecap="butt"
                            />
                          ) : null,
                        )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{totalRecommended}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Matched
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="w-full space-y-3">
                    {donutSegments.map((seg) => (
                      <div
                        key={seg.code}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/75 dark:border-slate-800/80"
                      >
                        <div className="flex items-center gap-2.5">
                          <TrackLogo code={seg.code} size={28} />
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {TRACK_META[seg.code].name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {seg.count} student{seg.count === 1 ? '' : 's'}
                            </div>
                          </div>
                        </div>
                        <span className={`text-sm font-black ${TRACK_META[seg.code].color}`}>
                          {seg.pctRounded}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Chart B: Grouped Vertical Bar Chart (Recommended vs. Leading/Explored) */}
              <section className="bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between space-y-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Quiz Match vs. Active Exploration
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Compares quiz-recommended track vs. students actively leading in each track.
                    </p>
                  </div>
                  <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                </div>

                {/* Legend Pills */}
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 dark:bg-blue-500" />
                    Quiz Recommended
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-400" />
                    Leading / Explored
                  </span>
                </div>

                {/* Vertical Columns */}
                <div className="grid grid-cols-3 gap-4 pt-2 items-end h-44 px-2 border-b border-slate-200 dark:border-slate-800">
                  {tracks.map((code) => {
                    const rec = summary.recommended_counts[code];
                    const cho = summary.chosen_counts[code];
                    const recHeight = Math.max(8, Math.round((rec / maxBarCount) * 120));
                    const choHeight = Math.max(8, Math.round((cho / maxBarCount) * 120));

                    return (
                      <div key={code} className="flex flex-col items-center gap-2">
                        <div className="flex items-end gap-2 h-32">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-300">{rec}</span>
                            <div
                              className="w-6 sm:w-8 rounded-t-lg bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                              style={{ height: `${rec === 0 ? 6 : recHeight}px` }}
                              title={`Quiz Recommended: ${rec}`}
                            />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">{cho}</span>
                            <div
                              className="w-6 sm:w-8 rounded-t-lg bg-emerald-600 dark:bg-emerald-400 transition-all duration-500"
                              style={{ height: `${cho === 0 ? 6 : choHeight}px` }}
                              title={`Leading / Explored: ${cho}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels */}
                <div className="grid grid-cols-3 gap-4 px-2">
                  {tracks.map((code) => (
                    <div key={code} className="flex flex-col items-center text-center gap-1">
                      <TrackLogo code={code} size={26} />
                      <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">{code}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Row 3: 7-Day Student Activity Line Graph + Curriculum Module Completion */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 7-Day Activity Line Graph (5 cols) */}
              <section className="lg:col-span-5 bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      7-Day Student Activity Trend
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Daily active GSuite students syncing progress or quiz results.
                    </p>
                  </div>
                  <CalendarDays size={18} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                </div>

                {dailyActivity.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">
                    No activity recorded in the last 7 days.
                  </p>
                ) : (
                  <>
                    <div className="w-full pt-1">
                      <svg
                        viewBox={`0 0 ${lineChartW} ${lineChartH}`}
                        className="w-full h-32 sm:h-40 overflow-visible"
                        role="img"
                        aria-label="7-Day Student Activity Line Graph"
                      >
                        <defs>
                          <linearGradient id="activityAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Gridlines */}
                        {[0, 0.5, 1].map((ratio, idx) => {
                          const gridY = padTop + plotH - ratio * plotH;
                          return (
                            <line
                              key={idx}
                              x1={padLeft}
                              y1={gridY}
                              x2={lineChartW - padRight}
                              y2={gridY}
                              className="stroke-slate-200 dark:stroke-slate-800"
                              strokeWidth="1"
                              strokeDasharray={ratio === 0 ? undefined : '4 4'}
                            />
                          );
                        })}

                        {/* Gradient Area Fill */}
                        {linePoints.length > 1 && (
                          <polygon points={areaCoords} fill="url(#activityAreaGrad)" />
                        )}

                        {/* Trend Line */}
                        {linePoints.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={polylineCoords}
                          />
                        )}

                        {/* Nodes + Value Labels */}
                        {linePoints.map((pt) => (
                          <g key={pt.iso_date}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4.5"
                              className="fill-white dark:fill-[#0f172a]"
                              stroke="#38bdf8"
                              strokeWidth="2.5"
                            >
                              <title>
                                {pt.day}: {pt.active_count} active student(s)
                              </title>
                            </circle>
                            <text
                              x={pt.x}
                              y={pt.y - 10}
                              textAnchor="middle"
                              className="fill-sky-700 dark:fill-sky-200 text-[12px] sm:text-[10px]"
                              fontWeight="800"
                            >
                              {pt.active_count}
                            </text>
                          </g>
                        ))}
                      </svg>

                      {/* X-Axis Day Labels */}
                      <div className="grid grid-cols-7 gap-1 text-center mt-1">
                        {dailyActivity.map((pt) => (
                          <span
                            key={pt.iso_date}
                            className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate"
                          >
                            {pt.day}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900/75 dark:border-slate-800 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Peak Activity Day:</span>
                      <span className="font-extrabold text-sky-700 dark:text-sky-300">
                        {peakDay.day} ({peakDay.active_count} student
                        {peakDay.active_count === 1 ? '' : 's'})
                      </span>
                    </div>
                  </>
                )}
              </section>

              {/* Curriculum Module Completion Breakdown (7 cols) */}
              <section className="lg:col-span-7 bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Curriculum Module Completion Breakdown
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Average module completion rate across all synced CICS students per BSIT track.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {tracks.map((code) => {
                    const avg = summary.avg_progress[code];
                    const chosenCount = summary.chosen_counts[code];
                    const recCount = summary.recommended_counts[code];

                    return (
                      <div
                        key={code}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <TrackLogo code={code} size={32} />
                            <div>
                              <div className="text-xs font-black text-slate-900 dark:text-white">
                                {TRACK_META[code].name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {recCount} quiz match · {chosenCount} leading
                              </div>
                            </div>
                          </div>
                          <span className={`text-sm font-black ${TRACK_META[code].color}`}>
                            {avg}%
                          </span>
                        </div>

                        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${TRACK_META[code].bg}`}
                            style={{ width: `${avg}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        ) : (
          /* Feedback Inbox Tab */
          <section className="bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Submitted Student Feedback & Bug Reports
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest 50 submissions from CTRL+PATH Settings.
              </p>
            </div>

            {!data?.feedback.length ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">
                No student feedback submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data.feedback.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900/85 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.student_email || 'Guest'} ·{' '}
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleLockAndExit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Student Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}