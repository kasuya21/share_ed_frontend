import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Bookmark,
  Flag,
  ArrowLeft,
  ChevronRight,
  Download,
  FileText,
  Trash2,
  Check,
  Loader2,
  Pencil,
  Plus,
  X,
  Image as ImageIcon,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createComment,
  deleteComment,
  deletePost,
  fetchComments,
  fetchPost,
  followUser,
  toggleBookmark,
  toggleLike,
  unfollowUser,
  updatePost,
} from '../services/endpoints';
import useAuthStore from '../store/useAuthStore';
import { normalizePost } from '../lib/postUtils';
import ReportModal from '../components/modals/ReportModal';
import LoginPromptModal from '../components/modals/LoginPromptModal';
import api from '../services/api';

// ─── PDF Viewer Modal ───
function PdfViewerModal({ url, name, onClose }) {
  // Use Google Docs viewer as universal fallback for cross-origin PDFs (like Cloudinary)
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-red-600" />
            </div>
            <span className="font-bold text-foreground text-sm truncate">{name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ExternalLink size={14} />
              เปิดในแท็บใหม่
            </a>
            <a
              href={url}
              download={name}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-card transition-colors"
            >
              <Download size={14} />
              ดาวน์โหลด
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* PDF iframe */}
        <div className="flex-1 bg-slate-200">
          <iframe
            src={viewerUrl}
            title={name}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

// ─── PDF Preview Card ───
function PdfPreviewCard({ file, onOpenViewer }) {
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all group">
      {/* Preview thumbnail — use iframe to show first page */}
      <div
        className="relative w-full aspect-[4/3] bg-secondary cursor-pointer overflow-hidden"
        onClick={() => onOpenViewer(file)}
      >
        <iframe
          src={viewerUrl}
          title={file.name}
          className="w-full h-full border-0 pointer-events-none scale-100"
          style={{ transform: 'scale(1)', transformOrigin: 'top left' }}
          tabIndex={-1}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <span className="flex items-center gap-2 text-white font-bold text-sm bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
            <Maximize2 size={14} />
            ดูตัวอย่างเต็ม
          </span>
        </div>
        {/* PDF badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider">
          <FileText size={12} />
          PDF
        </div>
      </div>

      {/* File info + actions */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-red-600" />
          </div>
          <span className="font-bold text-foreground text-sm truncate">{file.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onOpenViewer(file)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="ดูตัวอย่าง"
          >
            <Maximize2 size={16} />
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            download={file.name}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            title="ดาวน์โหลดไฟล์"
          >
            <Download size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Component State
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pdfViewer, setPdfViewer] = useState(null); // { url, name }
  
  // Post Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLevel, setEditLevel] = useState('HIGH_SCHOOL');
  const [editTags, setEditTags] = useState('');
  
  // Media state
  const [attachments, setAttachments] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  // Load Post Data
  const { data: postRaw, isLoading: isPostLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
  });

  const post = postRaw ? normalizePost(postRaw, user?.id) : null;
  const author = post?.author || postRaw?.author;
  const tagsString = post?.tags?.join(', ') || '';

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดโพสต์');
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (postRaw && user) {
      setLiked(postRaw.likes?.some((l) => l.user_id === user.id) ?? false);
      setLikeCount(postRaw.likes?.length ?? 0);
      setBookmarked(Boolean(postRaw.isBookmarked));
      
      // Init Edit form fields
      setEditTitle(postRaw.title || '');
      setEditSummary(postRaw.summary || '');
      setEditContent(postRaw.content || '');
      setEditLevel(postRaw.education_level || 'HIGH_SCHOOL');
      setEditTags(tagsString);

      // Load real media attachments if present
      if (postRaw.media && postRaw.media.length > 0) {
        const imgs = postRaw.media.filter(m => m.media_type === 'IMAGE').map(m => m.media_url);
        const pdfs = postRaw.media.filter(m => m.media_type === 'PDF').map((m, idx) => ({
          id: m.id || String(idx),
          name: m.media_url.split('/').pop() || 'document.pdf',
          type: 'PDF',
          url: m.media_url
        }));
        setGalleryImages(imgs);
        setAttachments(pdfs);
      } else {
        setGalleryImages([]);
        setAttachments([]);
      }
    }
  }, [postRaw, user, tagsString]);

  // Load Comments
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchComments(id),
  });

  const handleInteraction = (actionFn) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    actionFn();
  };

  // Mutations
  const commentMutation = useMutation({
    mutationFn: (content) => createComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setCommentText('');
      toast.success('แสดงความคิดเห็นสำเร็จ!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'ไม่สามารถแสดงความคิดเห็นได้'),
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(id),
    onMutate: () => {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c - 1 : c + 1));
    },
    onError: () => {
      setLiked(postRaw.likes?.some((l) => l.user_id === user.id) ?? false);
      setLikeCount(postRaw.likes?.length ?? 0);
      toast.error('กรุณาเข้าสู่ระบบก่อนไลก์');
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(id),
    onMutate: () => setBookmarked((v) => !v),
    onError: () => toast.error('กรุณาเข้าสู่ระบบก่อนเซฟ'),
  });

  const updatePostMutation = useMutation({
    mutationFn: (payload) => updatePost(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      setIsEditing(false);
      toast.success('บันทึกการเปลี่ยนแปลงแล้ว!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก'),
  });

  const reportMutation = useMutation({
    mutationFn: (reason) => api.post(`/reports`, { post_id: id, reason }),
    onSuccess: () => {
      setReportModalOpen(false);
      toast.success('ขอบคุณสำหรับการรายงาน โพสต์นี้จะได้รับการตรวจสอบ');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'ไม่สามารถรายงานได้ในขณะนี้'),
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      toast.success('ลบโพสต์สำเร็จแล้ว!');
      navigate('/');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'ไม่สามารถลบโพสต์ได้'),
  });

  const handleDeletePost = () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?')) {
      deletePostMutation.mutate();
    }
  };

  const isAuthor = user?.id === author?.id;

  if (isPostLoading || isCommentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-background min-h-[60vh]">
        <Loader2 size={48} className="animate-spin mb-4 text-primary" />
        <p className="text-lg font-bold">กำลังโหลดรายละเอียด...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-background min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-2 text-foreground">ไม่พบโพสต์</h2>
        <Link to="/" className="btn-premium btn-primary-custom mt-4">
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTitle || !editContent) {
      toast.error('กรุณากรอกหัวข้อและเนื้อหา');
      return;
    }
    
    updatePostMutation.mutate({
      title: editTitle,
      summary: editSummary,
      content: editContent,
      education_level: editLevel,
      tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
  };

  const handleRemoveAttachment = (attachId) => {
    setAttachments(attachments.filter(a => a.id !== attachId));
  };

  const eduLevelThai = 
    post.education_level === 'MIDDLE_SCHOOL' || post.education_level === 'ม.ต้น' ? 'มัธยมศึกษาตอนต้น' :
    post.education_level === 'HIGH_SCHOOL' || post.education_level === 'ม.ปลาย' ? 'มัธยมศึกษาตอนปลาย' : 'มหาวิทยาลัย';

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto card-premium p-6 md:p-10 flex flex-col gap-8">
        
        {/* Top Header Controls: Back & Edit Post */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-border">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-extrabold text-base"
          >
            <ArrowLeft size={18} />
            <span>ย้อนกลับ</span>
          </button>

          {isAuthor && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={updatePostMutation.isPending}
                  className="btn-premium btn-primary-custom px-5 py-2.5 rounded-2xl text-sm font-extrabold flex items-center gap-2 transition-all shadow-sm"
                >
                  {updatePostMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDeletePost}
                    disabled={deletePostMutation.isPending}
                    className="border border-rose-200 hover:bg-rose-50 text-rose-600 px-5 py-2.5 rounded-2xl text-sm font-extrabold flex items-center gap-2 transition-all"
                  >
                    {deletePostMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    <span>ลบโพสต์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="border border-border hover:bg-secondary text-foreground px-5 py-2.5 rounded-2xl text-sm font-extrabold flex items-center gap-2 transition-all"
                  >
                    <Pencil size={16} />
                    <span>แก้ไขโพสต์</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          /* ================== EDIT VIEW ================== */
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-muted-foreground uppercase">หัวข้อโพสต์ของคุณ *</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary font-bold"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-muted-foreground uppercase">คำอธิบายโพสต์ *</label>
              <textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-muted-foreground uppercase">ระดับการศึกษา *</label>
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary appearance-none font-bold"
                >
                  <option value="MIDDLE_SCHOOL">มัธยมศึกษาตอนต้น</option>
                  <option value="HIGH_SCHOOL">มัธยมศึกษาตอนปลาย</option>
                  <option value="UNIVERSITY">มหาวิทยาลัย</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-muted-foreground uppercase">แท็ก</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="เช่น อังกฤษวันละนิด, SentensesEasyToLearn"
                  className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-muted-foreground uppercase">เนื้อหาของโพสต์ *</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-secondary border border-border rounded-2xl py-3 p-4 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px]"
              />
            </div>

            {/* Editable Attachments */}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-black text-muted-foreground uppercase">ไฟล์แนบ ({attachments.length})</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-secondary rounded-2xl px-5 py-4 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-primary" size={20} />
                      <span className="font-bold text-foreground text-sm">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ================== STANDARD DETAIL VIEW ================== */
          <div className="flex flex-col gap-6">
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
              {post.title}
            </h1>

            {/* Author Block & Engagement Icons */}
            <div className="flex items-center justify-between gap-4 py-4 border-y border-border flex-wrap">
              <div className="flex items-center gap-4">
                <Link to={`/profile/${author?.id}`}>
                  <img
                    src={author?.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={author?.username}
                    className="w-12 h-12 rounded-full border border-border object-cover"
                  />
                </Link>
                <div className="flex flex-col">
                  <Link
                    to={`/profile/${author?.id}`}
                    className="font-extrabold text-foreground text-base hover:text-primary transition-colors"
                  >
                    {author?.username || 'unknown'}
                  </Link>
                  <span className="text-xs text-muted-foreground font-semibold mt-0.5">
                    {post.createdAt}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Like, Save, Report */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={likeMutation.isPending}
                  onClick={() => handleInteraction(() => likeMutation.mutate())}
                  className={`p-2.5 rounded-full hover:bg-rose-50 transition-colors ${
                    liked ? 'text-rose-500 bg-rose-50/50' : 'text-muted-foreground hover:text-rose-500'
                  } ${likeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="ถูกใจ"
                >
                  <Heart size={20} className={liked ? 'fill-rose-500' : ''} />
                </button>
                
                <button
                  type="button"
                  disabled={bookmarkMutation.isPending}
                  onClick={() => handleInteraction(() => bookmarkMutation.mutate())}
                  className={`p-2.5 rounded-full hover:bg-primary/10 transition-colors ${
                    bookmarked ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'
                  } ${bookmarkMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="เซฟโพสต์"
                >
                  <Bookmark size={20} className={bookmarked ? 'fill-primary' : ''} />
                </button>

                {!isAuthor && (
                  <button
                    type="button"
                    onClick={() => handleInteraction(() => setReportModalOpen(true))}
                    className="p-2.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="รายงานโพสต์"
                  >
                    <Flag size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Category / Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/10 text-primary font-extrabold text-xs px-3.5 py-1 rounded-full">
                {eduLevelThai}
              </span>
              <span className="bg-primary text-primary-foreground font-extrabold text-xs px-3.5 py-1 rounded-full uppercase">
                {post.category || 'ทั่วไป'}
              </span>
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary text-muted-foreground font-bold text-xs px-3.5 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Post Cover Image / Styled mockup placeholder */}
            {post.cover_image ? (
              <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-border bg-secondary">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-auto object-cover max-h-[450px]"
                />
              </div>
            ) : (
              <div className={`w-full aspect-[2.4/1] rounded-2xl flex flex-col items-center justify-center p-6 text-center ${
                post.title?.toLowerCase().includes('english') || post.title?.includes('ภาษาอังกฤษ') || post.tags?.some(t => t.includes('อังกฤษ') || t.toLowerCase().includes('english'))
                  ? 'bg-amber-100 text-indigo-900'
                  : 'bg-sky-200 text-sky-900'
              }`}>
                <span className="font-extrabold text-2xl max-w-xl leading-snug">{post.title}</span>
                <span className="text-xs font-bold mt-2 opacity-65">
                  {post.title?.toLowerCase().includes('english') || post.title?.includes('ภาษาอังกฤษ') || post.tags?.some(t => t.includes('อังกฤษ') || t.toLowerCase().includes('english'))
                    ? 'Notebook Style'
                    : 'Study Material'}
                </span>
              </div>
            )}

            {/* Content Body */}
            <div className="prose prose-slate max-w-none text-foreground leading-relaxed font-medium py-4">
              <p className="text-lg font-bold text-muted-foreground border-l-4 border-primary pl-4 mb-6 italic">
                {post.summary}
              </p>
              <div
                className="whitespace-pre-wrap text-base"
                dangerouslySetInnerHTML={{
                  __html: (post.content || '').replace(/\n/g, '<br/>'),
                }}
              />
            </div>

            {/* ═══════ PDF Attachments with PREVIEW ═══════ */}
            {attachments.length > 0 && (
              <div className="flex flex-col gap-5 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <FileText size={18} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">
                    ไฟล์แนบ ({attachments.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map((file) => (
                    <PdfPreviewCard
                      key={file.id}
                      file={file}
                      onOpenViewer={(f) => setPdfViewer({ url: f.url, name: f.name })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {galleryImages.length > 0 && (
              <div className="flex flex-col gap-5 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <ImageIcon size={18} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">
                    รูปภาพเกี่ยวกับเนื้อหา ({galleryImages.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {galleryImages.map((imgUrl, index) => (
                    <div key={index} className="rounded-2xl overflow-hidden aspect-video border border-border bg-secondary shadow-sm hover:scale-[1.02] transition-transform duration-200">
                      <img src={imgUrl} alt={`gallery-${index}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Comments Section */}
        <div id="comments" className="mt-6 pt-8 border-t border-border">
          <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
            แสดงความคิดเห็น ({comments.length})
          </h3>

          {/* Comment Box */}
          <div className="flex gap-4 mb-8 items-start">
            {user ? (
              <img
                src={user.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'}
                alt="Me"
                className="w-10 h-10 rounded-full border border-border shrink-0 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary shrink-0 flex items-center justify-center text-muted-foreground font-bold text-sm">
                ?
              </div>
            )}
            
            <div className="flex-1 flex flex-col items-end gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? 'เขียนความคิดเห็น...' : 'กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น...'}
                disabled={!user || commentMutation.isPending}
                className="w-full h-24 resize-none bg-secondary border border-border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground text-sm font-medium placeholder-muted-foreground disabled:opacity-60"
              />
              {user && (
                <button
                  type="button"
                  onClick={() => commentText.trim() && commentMutation.mutate(commentText)}
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="btn-premium btn-primary-custom px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm"
                >
                  {commentMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  <span>ส่งความคิดเห็น</span>
                </button>
              )}
            </div>
          </div>

          {/* Comments List */}
          <div className="flex flex-col gap-4">
            {comments.map((comment) => {
              const isCommentOwner = user?.id === comment.user_id;

              return (
                <div key={comment.id} className="flex gap-3 items-start bg-secondary/50 p-4 rounded-2xl border border-border/50">
                  <Link to={`/profile/${comment.user_id}`}>
                    <img
                      src={comment.user?.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=c'}
                      alt={comment.user?.username}
                      className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <Link
                          to={`/profile/${comment.user_id}`}
                          className="font-extrabold text-foreground text-sm hover:text-primary transition-colors"
                        >
                          {comment.user?.username || 'unknown'}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      
                      {isCommentOwner && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('ยืนยันการลบความคิดเห็นนี้?')) {
                              await deleteComment(comment.id);
                              queryClient.invalidateQueries({ queryKey: ['comments', id] });
                            }
                          }}
                          className="text-xs font-bold text-rose-500 hover:underline shrink-0"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                    <p className="text-foreground text-sm font-medium mt-1 pr-2 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })}
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                ยังไม่มีความคิดเห็น มาร่วมเป็นคนแรกที่แชร์ความคิดเห็นกันครับ!
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Report Modal Popup */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={(reason) => reportMutation.mutate(reason)}
      />

      <LoginPromptModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />

      {/* PDF Full-Screen Viewer Modal */}
      {pdfViewer && (
        <PdfViewerModal
          url={pdfViewer.url}
          name={pdfViewer.name}
          onClose={() => setPdfViewer(null)}
        />
      )}

    </div>
  );
}
