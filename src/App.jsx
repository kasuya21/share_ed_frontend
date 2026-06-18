import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import AppLayout from './layouts/AppLayout';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import TrendingPage from './pages/TrendingPage';
import MilestonePage from './pages/MilestonePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';

import BookmarkPage from './pages/BookmarkPage';
import NotificationPage from './pages/NotificationPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import MorePage from './pages/MorePage';
import EditProfilePage from './pages/EditProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import ModeratorPage from './pages/admin/ModeratorPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

import useAuthStore from './store/useAuthStore';
import useMilestoneStore from './store/useMilestoneStore';

export default function App() {
  const { user, initialize, loading } = useAuthStore();
  const fetchMilestones = useMilestoneStore((s) => s.fetchMilestones);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user && user.is_onboarded) {
      fetchMilestones();
    }
  }, [user, fetchMilestones]);

  useEffect(() => {
    if (!loading && user && !user.is_onboarded && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="trending" element={<TrendingPage />} />
          <Route path="bookmarks" element={<BookmarkPage />} />
          <Route path="milestones" element={<MilestonePage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="settings" element={<EditProfilePage />} />
          
          {/* Post Routes */}
          <Route path="posts/create" element={<CreatePostPage />} />
          <Route path="posts/:id" element={<PostDetailPage />} />
          <Route path="moderator" element={<ModeratorPage />} />
          <Route path="admin" element={<AdminDashboardPage />} />
        </Route>
      </Routes>
    </>
  );
}
