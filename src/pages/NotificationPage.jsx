import React from 'react';
import { ArrowLeft, Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/endpoints';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'เมื่อสักครู่';
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  return `${diffDay} วันที่แล้ว`;
};

export default function NotificationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
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

        {/* Header Title & Mark All Read */}
        <div className="flex items-center justify-between flex-wrap gap-4 px-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">การแจ้งเตือน</h1>
              {unreadCount > 0 && (
                <p className="text-sm font-bold text-primary">{unreadCount} ยังไม่ได้อ่าน</p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              className="bg-card border border-border hover:bg-secondary text-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>อ่านทั้งหมด</span>
            </button>
          )}
        </div>

        {/* List items */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <div className="flex justify-center py-20 bg-card rounded-3xl border border-border shadow-sm">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-card rounded-2xl p-5 border flex items-center justify-between gap-4 transition-all shadow-sm ${
                  !notif.is_read ? 'border-primary/20 bg-primary/5' : 'border-border'
                }`}
              >
                {/* Unread indicator dot */}
                {!notif.is_read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                )}

                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* System icon instead of user avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bell size={20} className="text-primary" />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-foreground text-sm leading-snug">
                      {notif.message}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-bold mt-0.5">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!notif.is_read && (
                    <button
                      type="button"
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                      title="ทำเครื่องหมายว่าอ่านแล้ว"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(notif.id)}
                    className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                    title="ลบ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card py-20 text-center rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center text-muted-foreground">
              <Bell size={48} className="mb-4 opacity-30 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">ไม่มีการแจ้งเตือน</h3>
              <p className="text-sm mt-1">การอัปเดตใหม่ๆ จะแสดงที่นี่</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
