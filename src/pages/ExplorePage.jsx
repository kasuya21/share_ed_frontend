import React from 'react';
import { Compass, Search, Flame, BookOpen, Star, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import PostCard from '../components/shared/PostCard';
import { fetchPosts, fetchTrendingPosts } from '../services/endpoints';
import useAuthStore from '../store/useAuthStore';
import { normalizePost } from '../lib/postUtils';
import { useState } from 'react';

const EDUCATION_LEVELS = [
  { value: '', label: 'ทุกระดับ' },
  { value: 'MIDDLE_SCHOOL', label: 'มัธยมต้น' },
  { value: 'HIGH_SCHOOL', label: 'มัธยมปลาย' },
  { value: 'UNIVERSITY', label: 'มหาวิทยาลัย' },
];

export default function ExplorePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState('');
  const [activeSort, setActiveSort] = useState('');

  // Real posts from backend
  const { data: postsRaw = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['explore-posts', activeLevel, activeSort],
    queryFn: () => fetchPosts({ level: activeLevel || undefined, sort: activeSort || undefined }),
  });

  const posts = (Array.isArray(postsRaw) ? postsRaw : [])
    .filter(p => p.post_status !== 'DELETED')
    .filter(p => !searchQuery.trim() || p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(p => normalizePost(p, user?.id));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Compass size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">ค้นพบ</h1>
            <p className="text-muted-foreground text-sm font-bold">ค้นหาสื่อการเรียนรู้และโพสต์ที่น่าสนใจ</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสื่อการเรียนรู้..."
            className="w-full border-2 border-border rounded-full pl-12 pr-14 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm font-bold text-foreground placeholder-muted-foreground bg-card transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Level Filter & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {EDUCATION_LEVELS.map(lvl => (
              <button
                key={lvl.value}
                type="button"
                onClick={() => setActiveLevel(lvl.value)}
                className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all ${
                  activeLevel === lvl.value
                    ? 'btn-primary-custom'
                    : 'bg-card border border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-bold text-muted-foreground">เรียงตาม:</span>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="bg-card border border-border text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary block p-2 font-bold outline-none cursor-pointer hover:border-border/80 transition-colors"
            >
              <option value="">ล่าสุด</option>
              <option value="popular">ยอดเข้าชมสูงสุด</option>
              <option value="likes">ยอดถูกใจสูงสุด</option>
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen size={18} className="text-primary" />
            </div>
            <h2 className="text-xl font-black text-foreground">
              {activeLevel
                ? `${EDUCATION_LEVELS.find(l => l.value === activeLevel)?.label}`
                : 'สื่อการเรียนรู้ทั้งหมด'}
              {!isPostsLoading && ` (${posts.length})`}
            </h2>
          </div>

          {isPostsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="card-premium py-16 text-center flex flex-col items-center gap-3">
              <Search size={40} className="text-muted-foreground/30" />
              <h3 className="font-black text-foreground">ไม่พบผลลัพธ์</h3>
              <p className="text-muted-foreground text-sm">ลองเปลี่ยนคำค้นหาหรือระดับการศึกษา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
