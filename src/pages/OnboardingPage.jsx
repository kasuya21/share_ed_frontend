import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import useAuthStore from '../store/useAuthStore';
import { onboardUser } from '../services/endpoints';
import toast from 'react-hot-toast';
import { User, BookOpen, Calendar, FileText, ChevronRight } from 'lucide-react';

export default function OnboardingPage() {
  const { user, fetchUserProfile } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    education_level: 'HIGH_SCHOOL',
    age: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.is_onboarded) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.age) {
      toast.error('กรุณากรอก Username และ อายุ');
      return;
    }

    setLoading(true);
    try {
      await onboardUser(formData);
      toast.success('ตั้งค่าโปรไฟล์สำเร็จ!');
      await fetchUserProfile(); // Refresh user data
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Decorative Blobs */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/50 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] bg-purple-200/50 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-xl z-10 overflow-hidden">
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          <h1 className="text-3xl font-bold text-white mb-2 relative z-10">สร้างโปรไฟล์ของคุณ</h1>
          <p className="text-indigo-100 font-light relative z-10">กรอกข้อมูลเบื้องต้นเพื่อเริ่มต้นใช้งาน Share-ED</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              required
              placeholder="ตั้งชื่อผู้ใช้ของคุณ"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" /> อายุ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                required
                min="1"
                max="100"
                placeholder="อายุของคุณ"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" /> ระดับการศึกษา
              </label>
              <select
                name="education_level"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                value={formData.education_level}
                onChange={handleChange}
              >
                <option value="MIDDLE_SCHOOL">มัธยมต้น</option>
                <option value="HIGH_SCHOOL">มัธยมปลาย</option>
                <option value="UNIVERSITY">มหาวิทยาลัย</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> แนะนำตัว (Bio)
            </label>
            <textarea
              name="bio"
              rows="3"
              placeholder="บอกให้คนอื่นรู้เกี่ยวกับคุณสักหน่อย..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                เข้าสู่ระบบ Share-ED
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
