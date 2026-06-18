import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, Save, Loader2, User, Palette, Shield, Bell } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import useAuthStore from '../store/useAuthStore';
import { equipUserItem } from '../services/endpoints';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const { user, fetchUserProfile } = useAuthStore();
  const currentThemeId = user?.current_theme_id || 'default';
  const currentFrameId = user?.current_frame_id || 'none';
  const equipItem = equipUserItem;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // Tabs: 'profile', 'themes', 'privacy', 'notifications'
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    education_level: user?.education_level || 'HIGH_SCHOOL',
    social_links: user?.social_links || { facebook: '', instagram: '', youtube: '' }
  });
  
  // Privacy & Notifications toggles
  const [privacyToggles, setPrivacyToggles] = useState({
    publicProfile: true,
  });

  const [notificationToggles, setNotificationToggles] = useState({
    email: true,
    push: true,
    comments: true,
    followers: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user');

  // Themes & Frames sub-tab: 'theme' or 'frame'
  const [subTab, setSubTab] = useState('theme');
  const [selectedTheme, setSelectedTheme] = useState(currentThemeId || 'default');
  const [selectedFrame, setSelectedFrame] = useState(currentFrameId || 'none');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [name]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Load list of owned items dynamically from user purchases + fallback default options
  const purchasedThemes = (user?.purchases || [])
    .map(p => p.item)
    .filter(item => item && item.item_type === 'THEME')
    .map(item => ({
      id: item.id,
      name: item.item_name,
      desc: 'ธีมที่สะสมไว้',
      image: item.image_url,
    }));

  const purchasedFrames = (user?.purchases || [])
    .map(p => p.item)
    .filter(item => item && item.item_type === 'FRAME')
    .map(item => ({
      id: item.id,
      name: item.item_name,
      desc: 'กรอบที่สะสมไว้',
      color: item.id === 'gold' ? 'border-amber-400 bg-amber-50' :
             item.id === 'silver' ? 'border-slate-300 bg-slate-50' :
             item.id === 'bronze' ? 'border-amber-700 bg-amber-50/50' : 'border-slate-100 bg-white'
    }));

  const ownedThemes = [
    { id: 'default', name: 'Default', desc: 'ธีมเริ่มต้น', color: 'bg-amber-200' },
    ...purchasedThemes
  ];

  const ownedFrames = [
    { id: 'none', name: 'None', desc: 'ไม่ใส่กรอบ', color: 'border-slate-100 bg-white' },
    ...purchasedFrames
  ];

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('bio', formData.bio);
      data.append('education_level', formData.education_level);
      data.append('social_links', JSON.stringify(formData.social_links));
      
      if (imageFile) {
        data.append('profile_image', imageFile);
      }

      await api.put('/users/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await fetchUserProfile(); // refresh user data
      toast.success('บันทึกข้อมูลส่วนตัวสำเร็จ!');
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEquipEquipables = async () => {
    setIsLoading(true);
    try {
      if (selectedTheme !== currentThemeId) {
        await equipItem(selectedTheme, 'THEME');
      }
      if (selectedFrame !== currentFrameId) {
        await equipItem(selectedFrame, 'FRAME');
      }
      toast.success('ติดตั้งธีมและกรอบสำเร็จ!');
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error(error);
      toast.error('ไม่สามารถติดตั้งไอเทมได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (type, key) => {
    if (type === 'privacy') {
      setPrivacyToggles(prev => {
        const next = { ...prev, [key]: !prev[key] };
        toast.success('บันทึกความเป็นส่วนตัวแล้ว');
        return next;
      });
    } else {
      setNotificationToggles(prev => {
        const next = { ...prev, [key]: !prev[key] };
        toast.success('อัปเดตการแจ้งเตือนแล้ว');
        return next;
      });
    }
  };

  const sidebarLinks = [
    { id: 'profile', label: 'โปรไฟล์', icon: User },
    { id: 'themes', label: 'ธีมและกรอบ', icon: Palette },
    { id: 'privacy', label: 'ความเป็นส่วนตัว', icon: Shield },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell },
  ];

  if (!user) return null;

  const eduBadgeLabel = 
    formData.education_level === 'MIDDLE_SCHOOL' || formData.education_level === 'ม.ต้น' ? 'ม.ต้น' :
    formData.education_level === 'HIGH_SCHOOL' || formData.education_level === 'ม.ปลาย' ? 'ม.ปลาย' : 'มหาวิทยาลัย';

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        <h1 className="text-3xl font-black text-foreground px-1">
          ตั้งค่าโปรไฟล์
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Left Navigation Sidebar Panel */}
          <div className="md:col-span-1 card-premium p-3 flex flex-col gap-1.5">
            {sidebarLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  setActiveTab(link.id);
                  navigate(`/settings?tab=${link.id}`, { replace: true });
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-extrabold text-sm transition-all text-left ${
                  activeTab === link.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          {/* Right Content View Area */}
          <div className="md:col-span-3 card-premium p-6 md:p-8">
            
            {/* TAB 1: PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmitProfile} className="flex flex-col gap-6">
                <h2 className="text-xl font-black text-foreground border-b border-border pb-3 flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  แก้ไขโปรไฟล์
                </h2>

                {/* Avatar Preview & Upload Trigger */}
                <div className="flex items-center gap-6 pb-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-4 border-card bg-secondary relative group cursor-pointer shadow-md overflow-hidden"
                  >
                    <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-extrabold text-foreground text-lg">
                      {formData.username || 'user'}
                    </span>
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary w-fit">
                      {eduBadgeLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold">
                      รองรับ JPG, PNG ขนาดไม่เกิน 2MB
                    </span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-muted-foreground uppercase">ชื่อเล่น</label>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    maxLength={30}
                    className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary font-bold" 
                  />
                  <span className="text-[10px] text-muted-foreground font-bold text-right pr-1">
                    {formData.username.length}/30 ตัวอักษร
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-muted-foreground uppercase">คำอธิบายตัวเอง</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={200}
                    placeholder="กรอกคำอธิบายของตัวเอง"
                    className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary h-28 resize-none font-medium placeholder-muted-foreground"
                  ></textarea>
                  <span className="text-[10px] text-muted-foreground font-bold text-right pr-1">
                    {formData.bio.length}/200 ตัวอักษร
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-muted-foreground uppercase">ระดับการศึกษา</label>
                  <select 
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleInputChange}
                    className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary appearance-none font-bold"
                  >
                    <option value="MIDDLE_SCHOOL">มัธยมศึกษาตอนต้น</option>
                    <option value="HIGH_SCHOOL">มัธยมศึกษาตอนปลาย</option>
                    <option value="UNIVERSITY">มหาวิทยาลัย</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-muted-foreground uppercase">ลิงก์โซเชียลมีเดีย (Widgets)</label>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="url" 
                      name="facebook"
                      placeholder="Facebook URL (https://facebook.com/...)"
                      value={formData.social_links?.facebook || ''}
                      onChange={handleSocialLinkChange}
                      pattern="https?://(www\.)?facebook\.com/.*"
                      className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold" 
                    />
                    <input 
                      type="url" 
                      name="instagram"
                      placeholder="Instagram URL (https://instagram.com/...)"
                      value={formData.social_links?.instagram || ''}
                      onChange={handleSocialLinkChange}
                      pattern="https?://(www\.)?instagram\.com/.*"
                      className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold" 
                    />
                    <input 
                      type="url" 
                      name="youtube"
                      placeholder="YouTube URL (https://youtube.com/...)"
                      value={formData.social_links?.youtube || ''}
                      onChange={handleSocialLinkChange}
                      pattern="https?://(www\.)?youtube\.com/.*"
                      className="w-full bg-secondary border border-border rounded-2xl py-3 px-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-premium btn-primary-custom w-full py-3.5 rounded-2xl text-base shadow-sm mt-4 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                  <span>บันทึกข้อมูล</span>
                </button>
              </form>
            )}

            {/* TAB 2: THEMES & FRAMES */}
            {activeTab === 'themes' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-black text-foreground border-b border-border pb-3 flex items-center gap-2">
                  <Palette size={20} className="text-primary" />
                  ธีมและกรอบ
                </h2>

                {/* Sub-tabs selector */}
                <div className="flex items-center gap-2 bg-secondary p-1.5 rounded-2xl w-fit">
                  <button
                    type="button"
                    onClick={() => setSubTab('theme')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      subTab === 'theme'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ธีม
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTab('frame')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      subTab === 'frame'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    กรอบโปรไฟล์
                  </button>
                </div>

                <h3 className="text-lg font-black text-foreground mt-2">
                  {subTab === 'theme' ? 'ธีมที่คุณมี' : 'กรอบที่คุณมี'}
                </h3>

                {/* Grid items */}
                {subTab === 'theme' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {ownedThemes.map((theme) => {
                      const isSelected = selectedTheme === theme.id;
                      return (
                        <div 
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={`rounded-2xl border overflow-hidden cursor-pointer transition-all shadow-sm relative ${
                            isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                          }`}
                        >
                          <div className="w-full aspect-[2/1] bg-secondary relative">
                            {theme.image ? (
                              <img src={theme.image} alt={theme.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full ${theme.color}`} />
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-card">
                            <h4 className="font-extrabold text-foreground text-sm">{theme.name}</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{theme.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {ownedFrames.map((frame) => {
                      const isSelected = selectedFrame === frame.id;
                      return (
                        <div 
                          key={frame.id}
                          onClick={() => setSelectedFrame(frame.id)}
                          className={`rounded-2xl border p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3 relative ${
                            isSelected ? 'border-primary ring-2 ring-primary/20 bg-card' : 'border-border bg-secondary/50'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-full border-4 ${frame.color} flex items-center justify-center shrink-0 shadow bg-card`}>
                            <User size={20} className="text-muted-foreground" />
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                          <div>
                            <h4 className="font-extrabold text-foreground text-sm">{frame.name}</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{frame.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={handleEquipEquipables}
                  disabled={isLoading}
                  className="btn-premium btn-primary-custom w-full py-3.5 rounded-2xl text-base shadow-sm mt-4 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            )}

            {/* TAB 3: PRIVACY SETTINGS */}
            {activeTab === 'privacy' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-black text-foreground border-b border-border pb-3 flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  ความเป็นส่วนตัว
                </h2>

                <div className="flex items-center justify-between py-4 border-b border-border gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-extrabold text-foreground text-base">โปรไฟล์สาธารณะ:</span>
                    <span className="text-xs text-muted-foreground font-bold">อนุญาตให้ทุกคนเห็นโปรไฟล์ของคุณ</span>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle('privacy', 'publicProfile')}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                      privacyToggles.publicProfile ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        privacyToggles.publicProfile ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS SETTINGS */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-black text-foreground border-b border-border pb-3 flex items-center gap-2">
                  <Bell size={20} className="text-primary" />
                  ตั้งค่าการแจ้งเตือน
                </h2>

                <div className="flex flex-col gap-2">
                  {/* 1. Email */}
                  <div className="flex items-center justify-between py-4 border-b border-border gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-foreground text-base">การแจ้งเตือนทางอีเมล</span>
                      <span className="text-xs text-muted-foreground font-bold">รับอีเมลเมื่อมีกิจกรรมใหม่</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('notifications', 'email')}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                        notificationToggles.email ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${notificationToggles.email ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* 2. Push Notifications */}
                  <div className="flex items-center justify-between py-4 border-b border-border gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-foreground text-base">การแจ้งเตือนแบบพุช</span>
                      <span className="text-xs text-muted-foreground font-bold">แจ้งเตือนผ่านเบราว์เซอร์</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('notifications', 'push')}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                        notificationToggles.push ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${notificationToggles.push ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* 3. New comments */}
                  <div className="flex items-center justify-between py-4 border-b border-border gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-foreground text-base">ความคิดเห็นใหม่</span>
                      <span className="text-xs text-muted-foreground font-bold">แจ้งเตือนเมื่อมีคนแสดงความคิดเห็นในโพสต์ของคุณ</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('notifications', 'comments')}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                        notificationToggles.comments ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${notificationToggles.comments ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* 4. New followers */}
                  <div className="flex items-center justify-between py-4 border-b border-border gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-extrabold text-foreground text-base">ผู้ติดตามใหม่</span>
                      <span className="text-xs text-muted-foreground font-bold">แจ้งเตือนเมื่อมีคนติดตามคุณ</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('notifications', 'followers')}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                        notificationToggles.followers ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${notificationToggles.followers ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
