import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import PostCard from '../components/shared/PostCard';
import { Search, Loader2, FileText, TrendingUp, Sparkles, BookOpen, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts, fetchTrendingPosts, fetchPlatformStats } from '../services/endpoints';
import useAuthStore from '../store/useAuthStore';
import { normalizePost } from '../lib/postUtils';

export default function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Load latest posts
  const { data: postsRaw, isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts', searchParams.get('search')],
    queryFn: () => fetchPosts({ search: searchParams.get('search') || undefined }),
  });

  const posts = (Array.isArray(postsRaw) ? postsRaw : [])
    .filter(p => p.post_status !== 'DELETED')
    .map((p) => normalizePost(p, user?.id));

  // Load trending posts for the top section (top 3)
  const { data: trendingRaw, isLoading: isTrendingLoading } = useQuery({
    queryKey: ['posts-trending'],
    queryFn: fetchTrendingPosts,
  });

  const trendingPosts = (Array.isArray(trendingRaw) ? trendingRaw : [])
    .filter(p => p.post_status !== 'DELETED')
    .slice(0, 3)
    .map((p) => normalizePost(p, user?.id));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const { data: statsData } = useQuery({
    queryKey: ['platformStats'],
    queryFn: fetchPlatformStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const totalPostsCount = statsData?.totalPosts ?? 0;
  const totalSharersCount = statsData?.totalSharers ?? 0;

  return (
    <div className="w-full bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header ส่วนหัวข้อและแบนเนอร์ขวา */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-6">
          <div className="space-y-3 max-w-md">
            <h1 className="text-4xl font-extrabold text-foreground border-b-4 border-primary inline-block pb-1">SHARE ED</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-bold">
              พื้นที่รวบรวมไอเดีย กิจกรรม สื่อ เทคนิคการสอน ที่แบ่งปันโดยคนในคอมมูนิตี้
            </p>
            <div className="flex space-x-6 text-sm font-bold pt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen size={16} className="text-primary" />
                </div>
                <div>
                  <span className="text-lg text-foreground font-black">{totalPostsCount.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1 text-xs">โพสต์</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users size={16} className="text-accent" />
                </div>
                <div>
                  <span className="text-lg text-foreground font-black">{totalSharersCount.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1 text-xs">นักแบ่งปัน</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Banner ด้านขวา */}
          <div className="w-full md:w-[450px] bg-gradient-to-br from-primary via-primary/80 to-accent rounded-2xl p-6 text-primary-foreground relative overflow-hidden shadow-lg flex flex-col justify-center items-center text-center shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
            <h3 className="text-sm font-bold bg-background text-primary px-4 py-1.5 rounded-full mb-3 relative z-10">Kids DD มาแชร์</h3>
            <p className="text-2xl font-black tracking-wide relative z-10">โปรแกรม<br />ที่ใช้ทำ Clip VDO</p>
          </div>
        </div>

        {/* ช่องค้นหา */}
        <div className="my-8 relative max-w-3xl mx-auto w-full">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาวิชา #ต่างๆ ชื่อคนที่คนตามหา" 
              className="w-full border-2 border-border rounded-full pl-12 pr-14 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm font-bold bg-card text-foreground placeholder-muted-foreground transition-all"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-2.5 rounded-full hover:bg-primary/90 flex items-center justify-center transition-colors shadow-sm"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* โพสต์ยอดนิยม */}
        <div className="my-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <h2 className="text-2xl font-black text-foreground">โพสต์ยอดนิยม</h2>
          </div>
          
          {isTrendingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : trendingPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="card-premium py-12 px-6 flex flex-col items-center justify-center text-center">
              <TrendingUp size={32} className="text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-bold">ยังไม่มีโพสต์ยอดนิยม</p>
            </div>
          )}
        </div>

        {/* โพสต์ล่าสุด */}
        <div className="bg-secondary/50 -mx-4 px-4 py-10 my-10 rounded-2xl">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles size={20} className="text-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground">โพสต์ล่าสุด</h2>
            </div>
            
            {isPostsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="card-premium py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
                <Search size={32} className="text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">ไม่พบผลการค้นหา</h3>
                <p className="text-muted-foreground text-sm">
                  ลองค้นหาด้วยคำอื่น หรือร่วมเป็นคนแรกที่สร้างเนื้อหาใหม่
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
