import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import { CommunityProvider } from './context/CommunityContext';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { TrackExplorerPage } from './pages/TrackExplorerPage';
import { CtrlQuizPage } from './pages/CtrlQuizPage';
import { SmartResultsPage } from './pages/SmartResultsPage';
import { PathComparePage } from './pages/PathComparePage';
import { AchievementsPage } from './pages/AchievementsPage';
const AlumniStoriesPage=lazy(()=>import('./pages/AlumniStoriesPage').then(m=>({default:m.AlumniStoriesPage})));
const AnnouncementsPage=lazy(()=>import('./pages/AnnouncementsPage').then(m=>({default:m.AnnouncementsPage})));
const CommunityDetailPage=lazy(()=>import('./pages/CommunityDetailPage').then(m=>({default:m.CommunityDetailPage})));
const ControlCenterPage=lazy(()=>import('./pages/ControlCenterPage').then(m=>({default:m.ControlCenterPage})));
const router=createBrowserRouter([{element:<AppShell><Suspense fallback={<p role="status" className="p-6">Opening your learning space…</p>}><Outlet/></Suspense></AppShell>,children:[
  {path:'/',element:<DashboardPage/>},{path:'/dashboard',element:<Navigate to="/" replace/>},
  {path:'/tracks',element:<TrackExplorerPage/>},{path:'/quiz',element:<CtrlQuizPage/>},
  {path:'/results',element:<SmartResultsPage/>},{path:'/compare',element:<PathComparePage/>},
  {path:'/alumni',element:<AlumniStoriesPage/>},{path:'/alumni/:id',element:<CommunityDetailPage kind="alumni"/>},
  {path:'/announcements',element:<AnnouncementsPage/>},{path:'/announcements/:id',element:<CommunityDetailPage kind="announcements"/>},
  {path:'/achievements',element:<AchievementsPage/>},{path:'/control-center',element:<ControlCenterPage/>},
  {path:'*',element:<Navigate to="/" replace/>},
]}]);
export default function App() {return <ErrorBoundary><StudentProvider><CommunityProvider><RouterProvider router={router}/></CommunityProvider></StudentProvider></ErrorBoundary>;}
