import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Plus } from 'lucide-react';
import TopNav from '../components/navigation/TopNav';
import Footer from '../components/navigation/Footer';
import useAuthStore from '../store/useAuthStore';

export default function AppLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col relative">
      <TopNav />
      
      {/* Main Content Area - Full Width Centered */}
      <main className="flex-1 w-full flex flex-col pt-28">
        <div className="w-full flex-1">
          <Outlet />
        </div>
      </main>

      <Footer />

      {/* Floating Create Post Button (Bottom Right) */}
      {user && location.pathname !== '/posts/create' && (
        <Link 
          to="/posts/create"
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-yellow-500 hover:bg-yellow-400 text-[#0F2C59] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(234,179,8,0.3)] transition-all hover:-translate-y-1 active:scale-95 group"
          title="เพิ่มโพสต์"
        >
          <Plus size={28} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
        </Link>
      )}
    </div>
  );
}
