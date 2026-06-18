import React, { useState } from 'react';
import { Eye, Heart, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PostCard from '../components/shared/PostCard';
import { fetchMostLikedPosts, fetchTrendingPosts } from '../services/endpoints';
import useAuthStore from '../store/useAuthStore';
import { normalizePost } from '../lib/postUtils';

export default function TrendingPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('likes'); // 'views' or 'likes'

  const { data: trending = [], isLoading: loadingTrending } = useQuery({
    queryKey: ['posts-trending'],
    queryFn: fetchTrendingPosts,
  });

  const { data: mostLiked = [], isLoading: loadingLiked } = useQuery({
    queryKey: ['posts-most-liked'],
    queryFn: fetchMostLikedPosts,
  });

  const trendingPosts = (Array.isArray(trending) ? trending : [])
    .filter(p => p.post_status !== 'DELETED')
    .map((p) => normalizePost(p, user?.id));
    
  const likedPosts = (Array.isArray(mostLiked) ? mostLiked : [])
    .filter(p => p.post_status !== 'DELETED')
    .map((p) => normalizePost(p, user?.id));

  const isLoading = loadingTrending || loadingLiked;

  // Use up to 3 posts for the top section
  const topTrending = trendingPosts.slice(0, 3);
  
  // Bottom section uses the selected tab data (up to 9 posts)
  const bottomPosts = activeTab === 'likes' ? likedPosts.slice(0, 9) : trendingPosts.slice(0, 9);

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4 pb-20">
      <div className="max-w-[1000px] mx-auto flex flex-col gap-12">

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mt-4">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Trending Now</h1>
          <p className="text-muted-foreground font-semibold mt-2 text-sm tracking-wide">โพสต์ยอดนิยมประจำสัปดาห์</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        ) : (
          <>
            {/* Top Section - Trending Now */}
            <section className="w-full">
              {topTrending.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topTrending.map((post) => (
                    <PostCard key={`top-${post.id}`} post={post} />
                  ))}
                </div>
              ) : (
                <div className="card-premium py-12 text-center text-muted-foreground font-bold">
                  ยังไม่มีโพสต์มาแรง
                </div>
              )}
            </section>

            {/* Filter / Bottom Section */}
            <section className="flex flex-col gap-6">
              
              {/* Filter Row */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {activeTab === 'likes' ? 'ยอดไลก์สูงสุด' : 'ยอดเข้าชมสูงสุด'}
                </h2>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab('views')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                      activeTab === 'views' 
                        ? 'btn-primary-custom' 
                        : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    <Eye size={14} />
                    Most View
                  </button>
                  <button 
                    onClick={() => setActiveTab('likes')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                      activeTab === 'likes' 
                        ? 'btn-primary-custom' 
                        : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    <Heart size={14} />
                    Most Like
                  </button>
                </div>
              </div>

              {/* Bottom Posts Grid */}
              {bottomPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {bottomPosts.map((post) => (
                    <PostCard key={`bottom-${post.id}`} post={post} />
                  ))}
                </div>
              ) : (
                <div className="card-premium py-12 text-center text-muted-foreground font-bold">
                  ยังไม่มีโพสต์
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${
                      num === 1 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-card text-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              
            </section>
          </>
        )}
      </div>
    </div>
  );
}
