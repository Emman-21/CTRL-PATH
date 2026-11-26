import { useEffect, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { StudentProvider, useStudent } from './context/StudentContext';
import { CommunityProvider } from './context/CommunityContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary, RouteErrorFallback } from './components/shared/ErrorBoundary';
import { hasPortalAccess } from './utils/authSession';
import { playUiSound, type UiSoundType } from './utils/soundEffects';
import { DashboardPage } from './pages/DashboardPage';
import { TrackExplorerPage } from './pages/TrackExplorerPage';
import { CtrlQuizPage } from './pages/CtrlQuizPage';
import { SmartResultsPage } from './pages/SmartResultsPage';
import { PathComparePage } from './pages/PathComparePage';
import { AchievementsPage } from './pages/AchievementsPage';
import { AlumniStoriesPage } from './pages/AlumniStoriesPage';
import { CommunityDetailPage } from './pages/CommunityDetailPage';
import { ControlCenterPage } from './pages/ControlCenterPage';
import { LoginPage } from './pages/LoginPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';

function PortalAuthGate({ children }: { children: ReactNode }) {
  const { authSession, isGuest } = useStudent();
  const location = useLocation();
  if (!hasPortalAccess(authSession, isGuest, location.search)) {
    const target =
      location.pathname !== '/' && location.pathname !== '/dashboard'
        ? `${location.pathname}${location.search}${location.hash}`
        : undefined;
    return <Navigate to="/login" replace state={target ? { from: target } : undefined} />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorFallback />,
  },
  {
    path: '/admin/analytics',
    element: <AdminAnalyticsPage />,
    errorElement: <RouteErrorFallback />,
  },
  {
    element: (
      <PortalAuthGate>
        <AppShell>
          <Outlet />
        </AppShell>
      </PortalAuthGate>
    ),
    errorElement: <RouteErrorFallback />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/dashboard', element: <Navigate to="/" replace /> },
      { path: '/tracks', element: <TrackExplorerPage /> },
      { path: '/quiz', element: <CtrlQuizPage /> },
      { path: '/results', element: <SmartResultsPage /> },
      { path: '/compare', element: <PathComparePage /> },
      { path: '/alumni', element: <AlumniStoriesPage /> },
      { path: '/alumni/:id', element: <CommunityDetailPage kind="alumni" /> },
      { path: '/achievements', element: <AchievementsPage /> },
      { path: '/control-center', element: <ControlCenterPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

const VALID_CUSTOM_SOUNDS: ReadonlySet<string> = new Set([
  'tap',
  'nav',
  'success',
  'chime',
  'pop',
  'wand',
  'gem',
  'quiz-next',
  'quiz-complete',
  'send',
  'receive',
  'wake',
  'theme-light',
  'theme-dark',
]);

export default function App() {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="tab"], [data-sound]');
      if (!interactive) return;
      if ((interactive as HTMLButtonElement).disabled) return;

      const customSound = interactive.getAttribute('data-sound');
      if (customSound === 'none') return;
      if (customSound && VALID_CUSTOM_SOUNDS.has(customSound)) {
        playUiSound(customSound as UiSoundType);
        return;
      }

      const label = (
        interactive.getAttribute('aria-label') ||
        interactive.textContent ||
        ''
      ).toLowerCase();

      // Theme toggle detection
      if (label.includes('dark mode') || label.includes('light mode') || label.includes('theme')) {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        playUiSound(isCurrentlyDark ? 'theme-light' : 'theme-dark');
        return;
      }

      // CTRL Quiz progression / completion detection
      if (window.location.pathname === '/quiz') {
        if (
          label.includes('submit') ||
          label.includes('finish') ||
          label.includes('view results') ||
          label.includes('see results')
        ) {
          playUiSound('quiz-complete');
          return;
        }
        if (label.includes('next') || label.includes('continue') || label.includes('start quiz')) {
          playUiSound('quiz-next');
          return;
        }
      }

      // Gemstone Vault / Achievement interaction detection
      if (window.location.pathname === '/achievements' && interactive.tagName === 'BUTTON') {
        playUiSound('gem');
        return;
      }

      // Section navigation & tabs
      if (interactive.tagName === 'A' || interactive.getAttribute('role') === 'tab') {
        playUiSound('nav');
        return;
      }

      playUiSound('tap');
    };

    document.addEventListener('click', handleGlobalClick, { passive: true });
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <ErrorBoundary>
      <StudentProvider>
        <CommunityProvider>
          <RouterProvider router={router} />
        </CommunityProvider>
      </StudentProvider>
    </ErrorBoundary>
  );
}