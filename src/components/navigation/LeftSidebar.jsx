import React from 'react';
import { NavLink, Link } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import useGamificationStore from '../../store/useGamificationStore';
import { 
  Home, 
  Compass, 
  TrendingUp, 
  Bookmark, 
  Target, 
  Store, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  PenSquare,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';

export default function LeftSidebar({ onClose }) {
  const { user, signInWithGoogle, signOut, isModerator, isAdmin } = useAuthStore();
  const { milestonesCompleted } = useGamificationStore();
  
  const level = (milestonesCompleted || 0) + 1;

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/trending', icon: TrendingUp, label: 'Trending' },
    { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { to: '/quests', icon: Target, label: 'Quests' },
    { to: '/shop', icon: Store, label: 'Shop' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* User Profile Summary or Login CTA */}
      <div className="card-premium p-4 flex flex-col gap-3">
        {!user ? (
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <User size={32} />
            </div>
            <h3 className="font-bold text-lg">Join ShareEd</h3>
            <p className="text-xs text-muted-foreground mb-2">Sign in to achieve milestones and track your progress.</p>
            <button onClick={() => { signInWithGoogle(); handleLinkClick(); }} className="btn-premium btn-primary-custom w-full h-10 min-h-10 text-sm">Log In / Sign Up</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Link to={`/profile/${user.id}`} onClick={handleLinkClick} className="w-12 h-12 rounded-full border-2 border-border overflow-hidden cursor-pointer hover:border-primary transition-colors">
                <img src={user.profile_image || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
              </Link>
              <div className="flex flex-col flex-1 overflow-hidden">
                <Link to={`/profile/${user.id}`} onClick={handleLinkClick} className="font-extrabold text-foreground truncate hover:text-primary transition-colors cursor-pointer">
                  {user.username || 'User'}
                </Link>
                <span className="text-xs font-semibold text-muted-foreground">@{user.username || 'user'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary w-full">Lvl {level}</span>
              <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground w-full border border-border">{user.education_level || 'Student'}</span>
            </div>
          </>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 mt-2 flex-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions (Only for logged in) */}
      {user && (isModerator() || isAdmin()) && (
        <div className="flex flex-col gap-1 border-t border-border pt-4">
          {isModerator() && (
            <Link
              to="/moderator"
              onClick={handleLinkClick}
              className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ShieldCheck size={20} />
              <span>Moderation</span>
            </Link>
          )}
          {isAdmin() && (
            <Link
              to="/admin"
              onClick={handleLinkClick}
              className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <LayoutDashboard size={20} />
              <span>Admin</span>
            </Link>
          )}
        </div>
      )}

      {user && (
        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
          <Link to={`/settings`} onClick={handleLinkClick} className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <button onClick={() => { signOut(); handleLinkClick(); }} className="flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-destructive hover:bg-destructive/10 transition-colors w-full text-left">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      )}

      {user && (
        <Link to="/posts/create" onClick={handleLinkClick} className="btn-premium btn-primary-custom w-full h-12 flex md:hidden mt-2 gap-2">
          <PenSquare size={18} />
          <span>Create Post</span>
        </Link>
      )}
    </div>
  );
}
