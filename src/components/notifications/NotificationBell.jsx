import React, { useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/endpoints';

const TYPE_STYLES = {
  NEW_LIKE: 'text-destructive bg-destructive/10',
  NEW_COMMENT: 'text-blue-400 bg-blue-500/10',
  NEW_FOLLOWER: 'text-primary bg-primary/10',
  NEW_POST: 'text-violet-400 bg-violet-500/10',
  QUEST_COMPLETED: 'text-yellow-500 bg-yellow-500/10',
};

export default function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const panelRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: open,
    refetchInterval: open ? 30000 : false,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-blue-800/50 transition-colors text-blue-200 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white border-2 border-[#0F2C59] rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,380px)] max-h-[420px] overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-bold text-foreground">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllMutation.mutate()}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                View all
              </Link>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">No notifications yet</p>
            ) : (
              notifications.slice(0, 8).map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 p-4 border-b border-border/50 hover:bg-secondary/50 ${
                    !notif.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      notif.is_read ? 'bg-transparent' : 'bg-primary'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {notif.created_at
                        ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={() => markReadMutation.mutate(notif.id)}
                        className="p-1 text-muted-foreground hover:text-primary"
                        title="Mark read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(notif.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
