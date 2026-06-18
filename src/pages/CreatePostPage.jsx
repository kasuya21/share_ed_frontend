import React, { useState, useRef } from 'react';
import { ArrowLeft, UploadCloud, FileText, Image as ImageIcon, X, Loader2, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, Link as LinkIcon, Image as ToolbarImage, List, ListOrdered, Undo, Redo, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
export default function CreatePostPage() {
  const navigate = useNavigate();
  const coverInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    objective: '',
    steps: '',
    context: '',
    category: 'Mathematics',
    education_level: 'HIGH_SCHOOL',
    tags: []
  });

  const [currentTag, setCurrentTag] = useState('');
  
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagModalData, setTagModalData] = useState({
    eduLevel: '',
    noEduLevel: false,
    category: '',
    noCategory: false,
    customTag: '',
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files);
    const newPdfs = files.map(f => ({ file: f, name: f.name, size: f.size }));
    setPdfFiles(prev => [...prev, ...newPdfs]);
    e.target.value = '';
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setGalleryImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removePdf = (idx) => {
    setPdfFiles(pdfFiles.filter((_, i) => i !== idx));
  };

  const removeGalleryImage = (idx) => {
    URL.revokeObjectURL(galleryImages[idx].preview);
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleTagModalSubmit = () => {
    const newTags = [];
    const hasEduTag = formData.education_level && formData.tags.includes(formData.education_level);
    const hasCategoryTag = formData.category && formData.tags.includes(formData.category);

    if (!hasEduTag && !tagModalData.noEduLevel && tagModalData.eduLevel.trim()) {
      newTags.push(tagModalData.eduLevel.trim());
      setFormData(prev => ({ ...prev, education_level: tagModalData.eduLevel.trim() }));
    }
    if (!hasCategoryTag && !tagModalData.noCategory && tagModalData.category.trim()) {
      newTags.push(tagModalData.category.trim());
      setFormData(prev => ({ ...prev, category: tagModalData.category.trim() }));
    }
    if (tagModalData.customTag.trim()) {
      const customTagsCount = formData.tags.filter(t => t !== formData.education_level && t !== formData.category).length;
      if (customTagsCount < 3) {
        newTags.push(tagModalData.customTag.trim());
      }
    }
    
    if (newTags.length > 0) {
      const uniqueTags = newTags.filter(t => !formData.tags.includes(t));
      setFormData(prev => ({ ...prev, tags: [...prev.tags, ...uniqueTags] }));
    }
    
    setIsTagModalOpen(false);
    setTagModalData({ eduLevel: '', noEduLevel: false, category: '', noCategory: false, customTag: '' });
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => {
      const newFormData = { ...prev, tags: prev.tags.filter(t => t !== tagToRemove) };
      if (tagToRemove === prev.education_level) newFormData.education_level = '';
      if (tagToRemove === prev.category) newFormData.category = '';
      return newFormData;
    });
  };

  const handleSubmit = async (e, postStatus = 'ACTIVE') => {
    if (e) e.preventDefault();
    
    if (!formData.title) {
      toast.error('กรุณากรอกหัวข้อโพสต์');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('summary', formData.summary || formData.objective.substring(0, 100));
      
      const combinedContent = `<h2>จุดประสงค์การสอน</h2>\n${formData.objective || '-'}\n<h2>ขั้นตอน</h2>\n${formData.steps || '-'}\n<h2>บริบท หรือ ข้อเสนอแนะ</h2>\n${formData.context || '-'}`;
      
      data.append('content', combinedContent);
      data.append('education_level', formData.education_level);
      data.append('post_status', postStatus);
      
      data.append('tags', JSON.stringify(formData.tags));

      if (coverImage) {
        data.append('cover_image', coverImage);
      }

      for (const pdf of pdfFiles) {
        data.append('media_files', pdf.file);
      }

      for (const img of galleryImages) {
        data.append('media_files', img.file);
      }

      const res = await api.post('/posts', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(postStatus === 'ACTIVE' ? 'สร้างโพสต์สำเร็จ' : 'บันทึกแบบร่างสำเร็จ!');
      navigate(`/posts/${res.data.data.id}`);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 429) {
        toast.error('คุณสร้างโพสต์ครบ 3 ครั้งใน 24 ชั่วโมงแล้ว');
      } else {
        toast.error(error.response?.data?.message || 'ไม่สามารถสร้างโพสต์ได้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuillChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ align: [] }],
      ['link', 'image'],
      [{ list: 'bullet' }, { list: 'ordered' }],
      ['clean'],
    ],
  };

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Top bar controls */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary bg-card border border-border rounded-full px-5 py-2 hover:bg-secondary transition-colors font-extrabold text-sm shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>กลับ</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="border border-border bg-card hover:bg-secondary text-foreground px-6 py-2 rounded-full text-sm font-extrabold transition-all shadow-sm"
            >
              พรีวิว
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(null, 'DRAFT')}
              disabled={isLoading}
              className="border border-border bg-card hover:bg-secondary text-foreground px-6 py-2 rounded-full text-sm font-extrabold transition-all shadow-sm"
            >
              แบบร่าง
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(null, 'ACTIVE')}
              disabled={isLoading}
              className="btn-premium btn-primary-custom px-6 py-2 rounded-full text-sm font-extrabold flex items-center gap-2 transition-all shadow-sm"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>เพิ่มโพสต์</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={(e) => handleSubmit(e, 'ACTIVE')} className="card-premium p-6 md:p-10 flex flex-col gap-8">

          {/* Top Section: Cover Image (Left) + Title & Tags (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8">
            
            {/* 1. Cover Image Upload */}
            <div className="flex flex-col gap-2">
              <div 
                onClick={() => coverInputRef.current?.click()}
                className="border border-transparent rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors flex flex-col items-center justify-center h-full min-h-[220px] cursor-pointer p-6 relative group overflow-hidden"
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2">
                      <UploadCloud size={24} />
                      เปลี่ยนรูปภาพ
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-foreground text-sm">คลิกเพื่ออัพโหลดรูปภาพ</span>
                    <span className="text-[10px] text-muted-foreground mt-1 text-center">PNG, JPG (รูปภาพต้องมีขนาดไม่เกิน 10 mb)</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden" 
              />
            </div>

            {/* 2. Title and Tags */}
            <div className="flex flex-col gap-6 justify-center">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-extrabold text-foreground">หัวข้อโพสต์ของคุณ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-card border border-border rounded-2xl py-3 px-4 text-foreground text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-extrabold text-foreground">เพิ่มแท็กโพสต์ของคุณ <span className="text-red-500">*</span></label>
                <p className="text-[10px] text-muted-foreground mt-[-4px]">เพิ่มแท็ก เพื่อให้โพสต์ได้รับการมองเห็นมากขึ้น</p>
                
                {/* Display added tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1 mb-2">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="text-primary hover:text-primary/80 bg-card/50 rounded-full p-0.5 transition-colors">
                          <X size={12} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <button 
                  type="button" 
                  onClick={() => setIsTagModalOpen(true)}
                  className="border border-border bg-card text-primary px-6 py-2 rounded-full text-sm font-extrabold hover:bg-secondary shadow-sm transition-all w-fit"
                >
                  เพิ่มแท็ก
                </button>
              </div>
            </div>

          </div>

          {/* 3. Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-extrabold text-foreground">คำอธิบายโพสต์ <span className="text-red-500">*</span></label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              className="w-full bg-card border border-border rounded-2xl py-3 px-4 text-foreground text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[60px]"
              required
            />
          </div>

          {/* 4. Attachment Slots */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-extrabold text-foreground">เพิ่มไฟล์ที่เกี่ยวข้อง <span className="text-red-500">*</span></label>
            <p className="text-[10px] text-muted-foreground">อัพโหลดไฟล์รวมกันได้สูงสุด 15 ไฟล์และรวมกันไม่เกิน 20 MB (PDF, PNG, JPG)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {/* PDF upload box */}
              <div 
                onClick={() => pdfInputRef.current?.click()}
                className="border border-border rounded-2xl bg-card hover:bg-secondary transition-all flex flex-col items-center justify-center p-8 cursor-pointer text-center group shadow-sm"
              >
                <FileText size={32} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-foreground text-sm">เพิ่มไฟล์ PDF</span>
                <span className="text-[10px] text-muted-foreground mt-1">สูงสุด 20 mb</span>
              </div>
              <input 
                type="file" 
                ref={pdfInputRef}
                accept=".pdf"
                multiple
                onChange={handlePdfChange}
                className="hidden" 
              />

              {/* Gallery Images upload box */}
              <div 
                onClick={() => galleryInputRef.current?.click()}
                className="border border-border rounded-2xl bg-card hover:bg-secondary transition-all flex flex-col items-center justify-center p-8 cursor-pointer text-center group shadow-sm"
              >
                <ImageIcon size={32} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-extrabold text-foreground text-sm">เพิ่มรูปภาพของโพสต์</span>
                <span className="text-[10px] text-muted-foreground mt-1">สูงสุด 15 รูป 5 mb</span>
              </div>
              <input 
                type="file" 
                ref={galleryInputRef}
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="hidden" 
              />
            </div>

            {/* Selected PDFs List */}
            {pdfFiles.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-xs font-bold text-slate-500">ไฟล์ PDF ที่เลือก ({pdfFiles.length}):</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pdfFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-red-50/50 rounded-xl px-4 py-3 border border-red-100">
                      <div className="flex items-center gap-3 text-slate-700 text-xs font-bold min-w-0">
                        <FileText size={16} className="text-red-600" />
                        <span className="truncate block text-sm font-bold">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removePdf(idx)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Gallery Images List */}
            {galleryImages.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-xs font-bold text-slate-500">รูปภาพแกลเลอรีที่เลือก ({galleryImages.length}):</span>
                <div className="flex flex-wrap gap-3">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="w-24 h-24 rounded-xl border border-slate-200 relative group/img overflow-hidden">
                      <img src={img.preview} alt="Gallery Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover/img:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. 3 Rich Text Editors */}
          <div className="flex flex-col gap-6 mt-4">
            
            {/* Objective */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-extrabold text-foreground">จุดประสงค์การสอน</label>
              <div className="border border-border rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-primary bg-card">
                <ReactQuill
                  theme="snow"
                  value={formData.objective}
                  onChange={(val) => handleQuillChange('objective', val)}
                  modules={quillModules}
                  className="bg-card min-h-[150px] [&>.ql-container]:min-h-[150px] [&>.ql-container]:border-none [&>.ql-toolbar]:border-none [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-border [&>.ql-toolbar]:bg-secondary"
                />
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-extrabold text-foreground">ขั้นตอน</label>
              <div className="border border-border rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-primary bg-card">
                <ReactQuill
                  theme="snow"
                  value={formData.steps}
                  onChange={(val) => handleQuillChange('steps', val)}
                  modules={quillModules}
                  className="bg-card min-h-[150px] [&>.ql-container]:min-h-[150px] [&>.ql-container]:border-none [&>.ql-toolbar]:border-none [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-border [&>.ql-toolbar]:bg-secondary"
                />
              </div>
            </div>

            {/* Context/Recommendations */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-extrabold text-foreground">บริบท หรือ ข้อเสนอแนะ</label>
              <div className="border border-border rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-primary bg-card">
                <ReactQuill
                  theme="snow"
                  value={formData.context}
                  onChange={(val) => handleQuillChange('context', val)}
                  modules={quillModules}
                  className="bg-card min-h-[150px] [&>.ql-container]:min-h-[150px] [&>.ql-container]:border-none [&>.ql-toolbar]:border-none [&>.ql-toolbar]:border-b [&>.ql-toolbar]:border-border [&>.ql-toolbar]:bg-secondary"
                />
              </div>
            </div>

          </div>

          {/* Bottom Alert */}
          <div className="flex justify-end pt-2">
            <span className="text-red-500 font-extrabold text-sm tracking-wide">
              *** กรุณาตรวจสอบข้อมูลของท่านก่อนโพสต์ ***
            </span>
          </div>

        </form>
      </div>

      {/* Tag Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-card rounded-[24px] w-full max-w-xl p-8 relative shadow-2xl">
            <button 
              type="button"
              onClick={() => setIsTagModalOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-black text-center text-foreground mb-8">เพิ่มแท็กให้โพสต์</h2>
            
            <div className="flex flex-col gap-6">
              {/* Education Level */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-extrabold text-foreground">เหมาะกับระดับชั้นไหน?</label>
                {formData.education_level && formData.tags.includes(formData.education_level) ? (
                  <div className="text-sm font-bold text-muted-foreground bg-secondary p-3.5 rounded-xl border border-border">
                    เพิ่มระดับชั้นไปแล้ว: <span className="text-primary">{formData.education_level}</span> <span className="text-muted-foreground font-normal ml-1">(หากต้องการเปลี่ยนให้ลบแท็กออกก่อน)</span>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        checked={tagModalData.noEduLevel}
                        onChange={(e) => setTagModalData({...tagModalData, noEduLevel: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-muted-foreground">ไม่เกี่ยวกับระดับชั้นไหนเป็นพิเศษ</span>
                    </label>
                    <input 
                      type="text"
                      disabled={tagModalData.noEduLevel}
                      value={tagModalData.eduLevel}
                      onChange={(e) => setTagModalData({...tagModalData, eduLevel: e.target.value})}
                      className="w-full border border-border bg-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary disabled:bg-secondary disabled:text-muted-foreground font-bold"
                    />
                  </>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-extrabold text-foreground">เกี่ยวกับ/เหมาะกับหมวดหมู่วิชาอะไร?</label>
                {formData.category && formData.tags.includes(formData.category) ? (
                  <div className="text-sm font-bold text-muted-foreground bg-secondary p-3.5 rounded-xl border border-border">
                    เพิ่มหมวดหมู่วิชาไปแล้ว: <span className="text-primary">{formData.category}</span> <span className="text-muted-foreground font-normal ml-1">(หากต้องการเปลี่ยนให้ลบแท็กออกก่อน)</span>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        checked={tagModalData.noCategory}
                        onChange={(e) => setTagModalData({...tagModalData, noCategory: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-muted-foreground">ไม่เกี่ยวกับหมวดหมู่วิชาไหนเป็นพิเศษ</span>
                    </label>
                    <input 
                      type="text"
                      disabled={tagModalData.noCategory}
                      value={tagModalData.category}
                      onChange={(e) => setTagModalData({...tagModalData, category: e.target.value})}
                      className="w-full border border-border bg-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary disabled:bg-secondary disabled:text-muted-foreground font-bold"
                    />
                  </>
                )}
              </div>

              {/* Custom Tag */}
              <div className="flex flex-col gap-3 pt-2">
                <label className="text-[15px] font-extrabold text-foreground">แท็กอื่นๆ ที่ต้องการเพิ่ม <span className="text-muted-foreground font-normal text-sm">(สูงสุด 3 แท็ก)</span></label>
                {(() => {
                  const customTagsCount = formData.tags.filter(t => t !== formData.education_level && t !== formData.category).length;
                  if (customTagsCount >= 3) {
                    return (
                      <div className="text-sm font-bold text-muted-foreground bg-secondary p-3.5 rounded-xl border border-border">
                        คุณเพิ่มแท็กอื่นๆ ครบ 3 อันแล้ว <span className="text-muted-foreground font-normal ml-1">(หากต้องการเปลี่ยนให้ลบแท็กออกก่อน)</span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input 
                        type="text"
                        value={tagModalData.customTag}
                        onChange={(e) => setTagModalData({...tagModalData, customTag: e.target.value})}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleTagModalSubmit();
                          }
                        }}
                        placeholder={`พิมพ์แท็กเพิ่มเติมที่นี่... (เพิ่มได้อีก ${3 - customTagsCount} แท็ก)`}
                        className="w-full border border-border bg-card rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary font-bold"
                      />
                      <button 
                        type="button" 
                        onClick={handleTagModalSubmit}
                        className="border border-primary bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-extrabold hover:bg-primary/90 shadow-sm transition-all whitespace-nowrap"
                      >
                        เพิ่ม
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button 
                type="button"
                onClick={handleTagModalSubmit}
                className="border border-border text-primary px-8 py-2.5 rounded-2xl text-sm font-extrabold hover:bg-secondary transition-colors shadow-sm"
              >
                เพิ่มแท็ก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
