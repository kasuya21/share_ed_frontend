import React from 'react';
import { Shield, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchModeratorPosts, moderatorPostAction } from '../../services/endpoints';
import useAuthStore from '../../store/useAuthStore';
import { Link, Navigate } from 'react-router';

export default function ModeratorPage() {
  const isModerator = useAuthStore((s) => s.isModerator());
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['moderator-posts'],
    queryFn: fetchModeratorPosts,
    enabled: isModerator,
  });

  const actionMutation = useMutation({
    mutationFn: ({ postId, action }) => moderatorPostAction(postId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderator-posts'] });
      toast.success('Action applied');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  if (!isModerator) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Shield size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Moderation</h1>
          <p className="text-muted-foreground">Review reported or inactive posts.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card-premium py-16 text-center text-muted-foreground">
          No posts pending moderation.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="card-premium p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <Link to={`/posts/${post.id}`} className="font-bold text-lg text-foreground hover:text-primary">
                    {post.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    by {post.author?.username} • {post.post_status} • {post._count?.reports ?? 0} reports
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => actionMutation.mutate({ postId: post.id, action: 'RESTORE' })}
                    className="btn-premium gap-2 bg-accent/10 text-accent hover:bg-accent/20"
                  >
                    <RotateCcw size={16} /> Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => actionMutation.mutate({ postId: post.id, action: 'SOFT_DELETE' })}
                    className="btn-premium gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
              {post.reports?.length > 0 && (
                <ul className="text-xs text-muted-foreground border-t border-border pt-3 space-y-1">
                  {post.reports.map((r) => (
                    <li key={r.id}>
                      {r.user?.username}: {r.reason || 'Reported'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
