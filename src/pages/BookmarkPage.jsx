import React from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import PostCard from '../components/shared/PostCard';
import { fetchBookmarks } from '../services/endpoints';
import useAuthStore from '../store/useAuthStore';
import { normalizePost } from '../lib/postUtils';

export default function BookmarkPage() {
  const { user } = useAuthStore();

  const { data: bookmarksRaw, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarks,
    enabled: !!user,
  });

  const posts = (Array.isArray(bookmarksRaw) ? bookmarksRaw : [])
    .map((b) => b.post || b)
    .filter((p) => p && p.post_status !== 'DELETED')
    .map((p) => normalizePost({ ...p, isBookmarked: true }, user?.id));

  if (!user) {
    return (
      <div className="w-full bg-background min-h-screen flex items-center justify-center p-4">
        <div className="card-premium p-12 text-center max-w-md w-full">
          <Bookmark size={48} className="text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-xl font-black text-foreground mb-2">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-muted-foreground text-sm mb-6">เข้าสู่ระบบเพื่อดูโพสต์ที่คุณบันทึกไว้</p>
          <Link to="/" className="btn-premium btn-primary-custom px-6 py-2.5 rounded-2xl text-sm font-extrabold inline-block">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bookmark size={24} className="text-primary fill-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">บุ๊กมาร์ก</h1>
            <p className="text-muted-foreground text-sm font-bold">โพสต์ที่คุณบันทึกไว้</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="card-premium py-20 flex flex-col items-center justify-center text-center">
            <Bookmark size={48} className="text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-black text-foreground mb-2">ยังไม่มีบุ๊กมาร์ก</h2>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              กดที่ไอคอนบุ๊กมาร์กบนโพสต์ที่ชอบเพื่อบันทึกไว้อ่านทีหลัง
            </p>
            <Link to="/" className="btn-premium btn-primary-custom px-6 py-2.5 rounded-2xl text-sm font-extrabold">
              ค้นพบโพสต์
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
