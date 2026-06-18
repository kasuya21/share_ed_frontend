import React from 'react';
import { Bell } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import NotificationBell from '../notifications/NotificationBell';
import UserDropdownMenu from './UserDropdownMenu';

export default function TopNav() {
  const { user, signInWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const menuItems = [
    { label: 'หน้าหลัก', path: '/' },
    { label: 'สื่อการเรียนรู้', path: '/explore' },
    { label: 'อันดับ', path: '/trending' },
    { label: 'เกี่ยวกับเรา', path: '/about' },
    { label: 'รายการเพิ่มเติม', path: '/more' },
  ];

  return (
    <header className="fixed top-4 left-4 right-4 md:left-8 md:right-8 lg:max-w-[1400px] lg:mx-auto z-40 bg-[#162447] text-white h-[64px] shadow-lg rounded-full border border-white/5">
      <div className="h-full px-6 flex items-center relative">
        
        {/* Left Side: Logo */}
        <div className="absolute left-6 flex items-center">
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="ShareED" 
              className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} 
            />
            <div className="hidden w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl items-center justify-center text-white font-extrabold text-xl shadow-sm">
              SE
            </div>
          </Link>
        </div>

        {/* Center Side: Nav Links (Desktop) */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-8 text-sm font-bold text-white/90">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path && (item.path !== '/' || location.search === '');
            return (
              <Link
                key={idx}
                to={item.path}
                className={`transition-colors hover:text-white pb-1 ${
                  isActive ? 'text-white font-extrabold' : 'text-white/70'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Actions */}
        <div className="absolute right-6 flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="text-white hover:text-white/80 text-sm font-bold transition-colors"
              >
                สมัครสมาชิก
              </Link>
              <Link
                to="/login"
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <>
              <NotificationBell />
              <UserDropdownMenu />
            </>
          )}
        </div>

      </div>
    </header>
  );
}
