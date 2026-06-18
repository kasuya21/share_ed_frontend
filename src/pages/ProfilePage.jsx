import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Coins, 
  FileText, 
  Bookmark as BookmarkIcon, 
  Pencil, 
  Users, 
  Heart,
  Target,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link, useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMyPosts,
  fetchPosts,
  fetchUserProfile,
  followUser,
  unfollowUser,
  fetchBookmarks
} from '../services/endpoints';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import PostCard from '../components/shared/PostCard';
import { normalizePost } from '../lib/postUtils';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('posts');

  const profileId = id || (currentUser ? String(currentUser.id) : null);
  const isOwner = currentUser && String(currentUser.id) === String(profileId);

  // Fetch user profile info
  const { data: profileUser, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user', profileId],
    queryFn: () => fetchUserProfile(profileId),
    enabled: !!profileId,
  });

  // For the owner: use /posts/user/my-posts (returns all statuses).
  // For other users: use /posts (only PUBLISHED, filtered client-side by author).
  const { data: allPostsRaw = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', profileId, isOwner],
    queryFn: isOwner
      ? fetchMyPosts
      : () => fetchPosts(),
    enabled: !!profileId,
  });

  const postsArray = (Array.isArray(allPostsRaw) ? allPostsRaw : [])
    .filter(p => p.post_status !== 'DELETED');
  
  // Published posts — for non-owners, filter by author_id since backend doesn't support it
  const publishedPosts = postsArray
    .filter((p) => p.post_status === 'ACTIVE' && (!isOwner ? (String(p.author_id) === String(profileId) || String(p.author?.id) === String(profileId)) : true))
    .map((p) => normalizePost(p, currentUser?.id));

  // Draft posts (only visible to owner)
  const draftPosts = postsArray
    .filter((p) => p.post_status === 'DRAFT')
    .map((p) => normalizePost(p, currentUser?.id));

  // Fetch bookmarks
  const { data: bookmarksRaw = [], isLoading: isBookmarksLoading } = useQuery({
    queryKey: ['user-bookmarks', profileId],
    queryFn: fetchBookmarks,
    enabled: isOwner && activeTab === 'bookmarks',
  });

  const bookmarkedPosts = (Array.isArray(bookmarksRaw) ? bookmarksRaw : [])
    .map((b) => b.post || b)
    .filter(p => p.post_status !== 'DELETED')
    .map((p) => normalizePost(p, currentUser?.id));

  // Fetch followers to check following state
  const { data: followersList = [] } = useQuery({
    queryKey: ['followers', profileId],
    queryFn: () => api.get(`/follow/${profileId}/followers`).then((res) => res.data.data),
    enabled: !!profileId,
  });

  // Check following state directly from query data
  const isFollowing = currentUser && followersList.some((follower) => String(follower.id) === String(currentUser.id));

  const followMutation = useMutation({
    mutationFn: () => (isFollowing ? unfollowUser(profileId) : followUser(profileId)),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['followers', profileId] });
      
      // Snapshot previous value
      const previousFollowers = queryClient.getQueryData(['followers', profileId]);
      
      // Optimistically update cache
      queryClient.setQueryData(['followers', profileId], (old) => {
        const oldArray = Array.isArray(old) ? old : [];
        if (isFollowing) {
          return oldArray.filter((f) => String(f.id) !== String(currentUser.id));
        } else {
          return [...oldArray, { id: currentUser.id, username: currentUser.username, profile_image: currentUser.profile_image }];
        }
      });

      return { previousFollowers };
    },
    onError: (err, variables, context) => {
      console.error('Follow error:', err);
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      // Revert optimistic update
      if (context?.previousFollowers) {
        queryClient.setQueryData(['followers', profileId], context.previousFollowers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', profileId] });
      queryClient.invalidateQueries({ queryKey: ['followers', profileId] });
    },
  });

  if (isProfileLoading) {
    return (
      <div className="flex-center min-h-[60vh] bg-background text-muted-foreground">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-32 text-muted-foreground bg-background">
        <p className="text-lg font-bold">ไม่พบโปรไฟล์ผู้ใช้นี้</p>
      </div>
    );
  }

  const stats = {
    followers: profileUser.followers?.length ?? profileUser._count?.followers ?? 0,
    following: profileUser.following?.length ?? profileUser._count?.following ?? 0,
    likes: profileUser.likes?.length ?? profileUser._count?.likes ?? 0,
  };

  const eduBadgeLabel = 
    profileUser.education_level === 'MIDDLE_SCHOOL' || profileUser.education_level === 'ม.ต้น' ? 'ม.ต้น' :
    profileUser.education_level === 'HIGH_SCHOOL' || profileUser.education_level === 'ม.ปลาย' ? 'ม.ปลาย' : 'มหาวิทยาลัย';

  // Equipped frame styling
  const frameColor = profileUser.current_frame_id ? 'border-amber-400 ring-4 ring-amber-200/50' : 'border-white';
  const bannerImage = profileUser.cover_image || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* 1. Header Card (Banner & Profile Details) */}
        <div className="card-premium flex flex-col relative border-0 shadow-lg">
          
          {/* Banner Image */}
          <div className="h-48 md:h-64 w-full relative bg-secondary">
            <img
              src={bannerImage}
              alt="Profile Banner"
              className="w-full h-full object-cover"
            />
            {isOwner && (
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900/80 text-white p-2.5 rounded-full transition-colors backdrop-blur-sm shadow-md"
                title="ตั้งค่าโปรไฟล์"
              >
                <Settings size={20} />
              </button>
            )}
          </div>

          {/* Profile Details Container */}
          <div className="px-6 md:px-10 pb-8 relative flex flex-col pt-16">
            
            {/* Circular Avatar (overlapping) */}
            <div className={`w-32 h-32 md:w-36 md:h-36 rounded-full border-4 ${frameColor} bg-card shadow-xl overflow-hidden absolute -top-16 left-6 md:left-10 z-10`}>
              <img
                src={profileUser.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                alt={profileUser.username}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Details */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-black text-foreground tracking-tight">
                    {profileUser.username || 'ผู้ใช้'}
                  </h1>
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {eduBadgeLabel}
                  </span>
                </div>
                
                <p className="text-muted-foreground font-bold text-sm leading-relaxed mt-1">
                  {profileUser.bio || 'คำอธิบายตัวเอง...'}
                </p>

                {/* Followers count row */}
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground mt-2">
                  <span>{stats.followers.toLocaleString()} ผู้ติดตาม</span>
                  <span className="text-border">|</span>
                  <span>{stats.following.toLocaleString()} กำลังติดตาม</span>
                  <span className="text-border">|</span>
                  <span>{publishedPosts.length.toLocaleString()} โพสต์</span>
                </div>

                {/* Social Links (Widgets) */}
                {profileUser.social_links && (profileUser.social_links.facebook || profileUser.social_links.instagram || profileUser.social_links.youtube) && (
                  <div className="flex items-center gap-3 mt-3">
                    {profileUser.social_links.facebook && (
                      <a href={profileUser.social_links.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
                      </a>
                    )}
                    {profileUser.social_links.instagram && (
                      <a href={profileUser.social_links.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-colors">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </a>
                    )}
                    {profileUser.social_links.youtube && (
                      <a href={profileUser.social_links.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Coins Balance or Follow Button */}
              <div className="flex items-center gap-3 shrink-0">
                {isOwner ? (
                  <Link to="/milestones" className="btn-premium btn-primary-custom px-5 py-2.5 rounded-2xl flex items-center gap-2 font-black text-base shadow-sm hover:-translate-y-1 transition-transform">
                    <Target size={20} className="text-yellow-400" />
                    <span>ความสำเร็จ</span>
                  </Link>
                ) : (
                  <button 
                    disabled={followMutation.isPending}
                    onClick={() => {
                      if (!currentUser) {
                        toast.error('กรุณาเข้าสู่ระบบเพื่อติดตาม');
                        return;
                      }
                      followMutation.mutate();
                    }}
                    className={`btn-premium px-6 py-2.5 rounded-2xl text-sm font-extrabold shadow-sm transition-all ${
                      isFollowing
                        ? 'border border-border hover:bg-secondary text-muted-foreground bg-card'
                        : 'btn-primary-custom'
                    } ${followMutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {followMutation.isPending ? 'รอสักครู่...' : isFollowing ? 'กำลังติดตาม' : 'ติดตาม'}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 2. Grid Cards Content Section (Tabs) */}
        <div className="card-premium p-6 md:p-8 flex flex-col gap-6">
          
          {/* Tabs row & right header */}
          <div className="flex items-center justify-between border-b border-border pb-4 flex-wrap gap-4">
            {/* Tabs List */}
            <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === 'posts'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText size={16} />
                <span>โพสต์</span>
              </button>

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookmarks')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                      activeTab === 'bookmarks'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BookmarkIcon size={16} />
                    <span>บุ๊กมาร์ก</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('drafts')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                      activeTab === 'drafts'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Pencil size={16} />
                    <span>ฉบับร่าง</span>
                  </button>
                </>
              )}
            </div>

            {/* Right Header Text */}
            <span className="font-extrabold text-foreground text-lg">
              {activeTab === 'posts' && `โพสต์ของคุณ (${publishedPosts.length})`}
              {activeTab === 'bookmarks' && `บุ๊กมาร์กของคุณ (${bookmarkedPosts.length})`}
              {activeTab === 'drafts' && `ฉบับร่างของคุณ (${draftPosts.length})`}
            </span>
          </div>

          {/* Cards Grid */}
          <div className="pt-2">
            {activeTab === 'posts' && (
              publishedPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {publishedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <h3 className="text-lg font-bold text-foreground mb-1">ยังไม่มีโพสต์</h3>
                  <p className="text-sm">ร่วมเป็นคนแรกในการแบ่งปันความรู้กันเถอะ!</p>
                  {isOwner && (
                    <Link to="/posts/create" className="btn-premium btn-primary-custom px-5 py-2 text-sm font-bold mt-4 inline-flex items-center">
                      สร้างโพสต์แรก
                    </Link>
                  )}
                </div>
              )
            )}

            {activeTab === 'bookmarks' && (
              isBookmarksLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              ) : bookmarkedPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {bookmarkedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  <h3 className="text-lg font-bold text-foreground mb-1 font-bold">ไม่มีบุ๊กมาร์ก</h3>
                  <p className="text-sm">คุณสามารถบันทึกโพสต์ดีๆ ไว้กลับมาอ่านทีหลังได้ที่นี่</p>
                </div>
              )
            )}

            {activeTab === 'drafts' && (
              draftPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {draftPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-muted-foreground text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground border border-border">
                    <Pencil size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">ยังไม่มีฉบับที่ร่างไว้</h3>
                </div>
              )
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
