import React, { useState } from 'react';
import { LayoutDashboard, Users, FileText, AlertTriangle, EyeOff, ArrowLeft, Edit3, Loader2, Ban, CheckCircle, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Navigate, useNavigate } from 'react-router';
import {
  changeUserRole,
  fetchAdminUsers,
  banUser,
  unbanUser
} from '../../services/endpoints';
import useAuthStore from '../../store/useAuthStore';

export default function AdminDashboardPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState('all');

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    enabled: isAdmin,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('อัปเดตบทบาทผู้ใช้สำเร็จ');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'ทำรายการไม่สำเร็จ'),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, isBanned }) => isBanned ? unbanUser(id) : banUser(id, 'ละเมิดกฎของชุมชน'),
    onSuccess: (_, { isBanned }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(isBanned ? 'ปลดแบนผู้ใช้สำเร็จ' : 'แบนผู้ใช้สำเร็จ');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'ทำรายการไม่สำเร็จ'),
  });

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Stats derived from real API data
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED' || u.status === 'BANNED').length;
  const stats = [
    { label: 'ผู้ใช้ทั้งหมด', value: usersLoading ? '...' : users.length.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'ผู้ดูแลระบบ', value: usersLoading ? '...' : users.filter(u => u.role === 'ADMIN' || u.role === 'MODERATOR').length.toLocaleString(), icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'สมาชิกปกติ', value: usersLoading ? '...' : users.filter(u => u.role === 'MEMBER').length.toLocaleString(), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'ถูกระงับ/แบน', value: usersLoading ? '...' : suspendedCount.toLocaleString(), icon: EyeOff, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const filteredUsers = users.filter(u => {
    if (subTab === 'admins') return u.role === 'ADMIN' || u.role === 'MODERATOR';
    if (subTab === 'banned') return u.status === 'BANNED' || u.status === 'SUSPENDED';
    return true; // 'all'
  });

  const tableData = filteredUsers.map(u => ({
    id: u.id,
    username: u.username,
    profile_image: u.profile_image,
    followers: u._count?.followers ?? u.followers?.length ?? 0,
    registered: new Date(u.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
    role: u.role,
    status: u.status
  }));

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Back Button */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-extrabold text-base"
          >
            <ArrowLeft size={18} />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between px-1 flex-wrap gap-4">
          <h1 className="text-3xl font-black text-foreground">
            แดชบอร์ดผู้ดูแลระบบ
          </h1>
          <button
            onClick={() => navigate('/moderator')}
            className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-5 py-2.5 rounded-xl font-bold transition-colors"
          >
            <AlertTriangle size={18} />
            จัดการโพสต์ที่ถูกรายงาน
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="card-premium p-6 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <span className="text-3xl font-black text-foreground leading-tight">{stat.value}</span>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-card p-1.5 rounded-2xl border border-border w-fit shadow-sm">
          <button
            type="button"
            onClick={() => setSubTab('all')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              subTab === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={16} />
            <span>ผู้ใช้งานทั้งหมด</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('admins')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              subTab === 'admins'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield size={16} />
            <span>ผู้ดูแลระบบ</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('banned')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
              subTab === 'banned'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Ban size={16} />
            <span>ผู้ใช้ที่ถูกระงับ</span>
          </button>
        </div>

        {/* Users / Reported List Table inside light blue panel */}
        <div className="bg-primary/5 rounded-3xl p-6 md:p-8 border border-primary/10 shadow-sm">
          {usersLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-muted-foreground font-extrabold border-b border-primary/20 pb-3">
                    <th className="pb-4 pt-2 font-black">ผู้ใช้</th>
                    <th className="pb-4 pt-2 font-black text-center">ผู้ติดตาม</th>
                    <th className="pb-4 pt-2 font-black text-center">สมัครเมื่อ</th>
                    <th className="pb-4 pt-2 font-black text-right pr-4">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-muted-foreground font-bold">ไม่พบข้อมูลผู้ใช้</td>
                    </tr>
                  ) : tableData.map((row) => (
                    <tr key={row.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                      <td className="py-4 font-extrabold text-foreground">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.username}`}
                            alt="user avatar"
                            className="w-8 h-8 rounded-full border border-border bg-card object-cover"
                          />
                          <div className="flex flex-col">
                            <span>{row.username}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                              row.role === 'ADMIN' ? 'bg-primary/20 text-primary' :
                              row.role === 'MODERATOR' ? 'bg-purple-100 text-purple-700' :
                              'bg-secondary text-muted-foreground'
                            }`}>{row.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center font-bold text-foreground">{row.followers}</td>
                      <td className="py-4 text-center font-bold text-foreground">{row.registered}</td>
                      <td className="py-4 text-right pr-4">
                        <button
                          type="button"
                          onClick={() => {
                            const newRole = row.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
                            toast.promise(
                              roleMutation.mutateAsync({ id: row.id, role: newRole }),
                              {
                                loading: 'กำลังอัปเดต...',
                                success: 'อัปเดตบทบาทแล้ว!',
                                error: 'ล้มเหลว',
                              }
                            );
                          }}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center"
                            title="แก้ไขบทบาท"
                          >
                            <Edit3 size={18} />
                          </button>
                          {row.role !== 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => {
                                const isBanned = row.status === 'BANNED';
                                if (confirm(isBanned ? 'ยืนยันการปลดแบนผู้ใช้นี้?' : 'ยืนยันการแบนผู้ใช้นี้?')) {
                                  toast.promise(
                                    banMutation.mutateAsync({ id: row.id, isBanned }),
                                    {
                                      loading: 'กำลังประมวลผล...',
                                      success: isBanned ? 'ปลดแบนเรียบร้อย' : 'แบนผู้ใช้เรียบร้อย',
                                      error: 'ล้มเหลว'
                                    }
                                  );
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-colors inline-flex items-center ml-2 ${
                                row.status === 'BANNED' 
                                  ? 'text-emerald-600 hover:bg-emerald-50' 
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                              title={row.status === 'BANNED' ? 'ปลดแบน' : 'แบนผู้ใช้'}
                            >
                              {row.status === 'BANNED' ? <CheckCircle size={18} /> : <Ban size={18} />}
                            </button>
                          )}
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
