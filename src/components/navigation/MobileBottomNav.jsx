import React from 'react';
import { NavLink } from 'react-router';
import { Home, Compass, PlusSquare, Target, User, Store } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export default function MobileBottomNav() {
  const { user, signInWithGoogle } = useAuthStore();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    ...(user ? [{ to: '/posts/create', icon: PlusSquare, label: 'Create', isCreate: true }] : []),
    { to: '/quests', icon: Target, label: 'Quests' },
    { to: '/shop', icon: Store, label: 'Shop' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full glass-panel border-t border-border pb-safe z-40 bg-background/95">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          if (item.isCreate) {
            return (
              <NavLink 
                key={item.to} 
                to={item.to}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                  <item.icon size={24} />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-16 h-full transition-colors
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              <item.icon size={22} className="mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        {user ? (
          <NavLink 
            to={`/profile/${user.id}`} 
            className={({ isActive }) => `flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <User size={22} className="mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
          </NavLink>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="flex flex-col items-center justify-center w-16 h-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <User size={22} className="mb-1" />
            <span className="text-[10px] font-medium">Log In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
