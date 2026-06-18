import React, { useState } from 'react';
import { Heart, Eye, Bookmark, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { toggleBookmark, toggleLike } from '../../services/endpoints';
import useAuthStore from '../../store/useAuthStore';

export default function PostCard({ post }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);

  const author = post.author || {
    id: post.author_id,
    username: 'anonymous',
    profile_image: null,
    educationLevel: post.education_level,
  };

  // Check if this post has PDF attachments
  const hasPdf = post.media?.some(m => m.media_type === 'PDF');

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post.id),
    onMutate: () => {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c - 1 : c + 1));
    },
    onError: () => {
      setLiked(post.isLiked);
      setLikeCount(post.likes ?? 0);
      toast.error('Sign in to like posts');
    },
    onSuccess: (res) => {
      const isLiked = res.data?.isLiked;
      if (isLiked !== undefined) setLiked(isLiked);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(post.id),
    onMutate: () => setBookmarked((v) => !v),
    onError: () => {
      setBookmarked(post.isBookmarked);
      toast.error('Sign in to bookmark posts');
    },
  });

  const handleLike = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Sign in to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Sign in to bookmark posts');
      return;
    }
    bookmarkMutation.mutate();
  };

  const isAmber = 
    post.isImage || 
    post.type === 'notebook' || 
    post.title?.toLowerCase().includes('english') || 
    post.title?.includes('ภาษาอังกฤษ') || 
    post.tags?.some(t => t.includes('อังกฤษ') || t.toLowerCase().includes('english'));

  const getEmoji = () => {
    const title = post.title?.toLowerCase() || '';
    if (title.includes('math') || title.includes('คณิต')) return '📐';
    if (title.includes('ai') || title.includes('tech') || title.includes('คอม')) return '💻';
    if (title.includes('english') || title.includes('อังกฤษ') || title.includes('verb')) return '📝';
    if (title.includes('wellness') || title.includes('health') || title.includes('employee')) return '🍐';
    return '📚';
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group relative">
      <Link to={`/posts/${post.id}`} className="flex flex-col flex-1">
        {/* Thumbnail Image / Custom styled template matching mockup */}
        <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden relative">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
            />
          ) : isAmber ? (
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-full h-full flex flex-col items-center justify-center p-4 text-center group-hover:scale-[1.03] transition-transform duration-300">
              <span className="text-indigo-900 font-extrabold text-sm md:text-base line-clamp-3">
                {post.title}
              </span>
              <span className="text-[10px] text-amber-600 font-extrabold tracking-wider uppercase mt-2">
                Notebook Style
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-sky-200 to-sky-300 w-full h-full flex flex-col items-center justify-center p-6 text-center group-hover:scale-[1.03] transition-transform duration-300">
              <div className="text-4xl mb-2">{getEmoji()}</div>
              <span className="text-sky-900 font-extrabold text-[10px] tracking-wider uppercase">
                {post.category || 'General'}
              </span>
            </div>
          )}

          {/* PDF badge */}
          {hasPdf && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider z-10">
              <FileText size={10} />
              PDF
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-1">
          <div>
            {/* Title Row */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-extrabold text-slate-900 text-[15px] leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <button
                type="button"
                disabled={bookmarkMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookmark(e);
                }}
                className={`p-1 flex-shrink-0 transition-colors text-slate-800 hover:text-blue-600 mt-[-4px] mr-[-4px] ${bookmarkMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Bookmark size={18} strokeWidth={2.5} className={bookmarked ? 'fill-slate-800' : 'fill-slate-800'} />
              </button>
            </div>

            {/* Tag */}
            <div className="flex mt-2.5">
              <span className="bg-[#3B5998] text-white font-extrabold text-[10px] px-3 py-1 rounded-full whitespace-nowrap tracking-wide">
                {post.category || 'ทั่วไป'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1 mt-2">
            {/* Author */}
            <div 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity z-10 relative cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/profile/${author.id}`);
              }}
              title={`ดูโปรไฟล์ของ ${author.username || 'unknown'}`}
            >
              <img 
                src={author.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username || 'user'}`} 
                alt={author.username || 'author'} 
                className="w-5 h-5 rounded-full object-cover border border-slate-200 bg-slate-50"
              />
              <span className="text-xs text-slate-500 font-semibold hover:text-blue-600 transition-colors">
                by {author.username || 'unknown'}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-[11px] text-slate-800 font-bold mt-1">
              <button
                type="button"
                disabled={likeMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLike(e);
                }}
                className={`flex items-center space-x-1.5 transition-colors ${liked ? 'text-rose-600' : 'hover:text-rose-600'} ${likeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart size={14} className={liked ? 'fill-rose-600' : 'fill-slate-800'} strokeWidth={2.5} />
                <span>{likeCount} likes</span>
              </button>
              
              <span className="flex items-center space-x-1.5">
                <Eye size={14} strokeWidth={2.5} />
                <span>{post.views ?? 0} views</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
