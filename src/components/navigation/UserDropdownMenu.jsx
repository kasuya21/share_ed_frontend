import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, Shield, LogOut, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function UserDropdownMenu() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    toast.success('ออกจากระบบสำเร็จ');
    navigate('/');
  };

  const eduBadgeLabel = 
    user.education_level === 'MIDDLE_SCHOOL' || user.education_level === 'ม.ต้น' ? 'ม.ต้น' :
    user.education_level === 'HIGH_SCHOOL' || user.education_level === 'ม.ปลาย' ? 'ม.ปลาย' : 'มหาวิทยาลัย';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="w-10 h-10 rounded-full border-2 border-slate-200 hover:border-[#0F2C59] overflow-hidden transition-all focus:outline-none"
        >
          <img
            src={user.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
            alt={user.username || 'User'}
            className="w-full h-full object-cover"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[220px] bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
          align="end"
          sideOffset={8}
        >
          {/* Header Info */}
          <div className="flex items-center justify-between gap-3 pb-1">
            <span className="font-extrabold text-slate-800 text-lg">
              {user.username || 'ผู้ใช้'}
            </span>
            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              {eduBadgeLabel}
            </span>
          </div>

          <DropdownMenu.Separator className="h-px bg-slate-100" />

          {/* Links */}
          <DropdownMenu.Item asChild>
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer outline-none focus:bg-slate-50"
            >
              <User size={18} className="text-[#0F2C59]" />
              <span>โปรไฟล์</span>
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              to="/settings?tab=privacy"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer outline-none focus:bg-slate-50"
            >
              <Shield size={18} className="text-[#0F2C59]" />
              <span>ความเป็นส่วนตัว</span>
            </Link>
          </DropdownMenu.Item>

          {user.role === 'ADMIN' && (
            <DropdownMenu.Item asChild>
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-indigo-700 hover:bg-indigo-50 font-bold text-sm transition-colors cursor-pointer outline-none focus:bg-indigo-50"
              >
                <ShieldAlert size={18} className="text-indigo-600" />
                <span>แดชบอร์ดแอดมิน</span>
              </Link>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="h-px bg-slate-100" />

          {/* Log Out */}
          <DropdownMenu.Item
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-sm transition-colors cursor-pointer outline-none focus:bg-rose-50"
          >
            <span>ออกจากระบบ</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
