import type { ReactNode } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { StudentProvider, useStudent } from './context/StudentContext';
import { CommunityProvider } from './context/CommunityContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary, RouteErrorFallback } from './components/shared/ErrorBoundary';
import { hasPortalAccess } from './utils/authSession';
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

export default function App() {
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
