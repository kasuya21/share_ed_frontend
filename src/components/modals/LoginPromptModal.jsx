import React from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function LoginPromptModal({ isOpen, onClose, title = "กรุณาเข้าสู่ระบบ", message = "คุณต้องเข้าสู่ระบบเพื่อใช้งานฟีเจอร์นี้" }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center gap-4 mb-8 mt-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <LogIn size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">{title}</h2>
          <p className="text-slate-500 font-medium text-sm px-4">{message}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#0F2C59] hover:bg-[#163160] text-white font-extrabold py-3.5 rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            <span>เข้าสู่ระบบ</span>
          </button>
          
          <button 
            onClick={() => navigate('/register')}
            className="w-full bg-slate-50 hover:bg-slate-100 text-[#0F2C59] font-extrabold py-3.5 rounded-2xl transition-colors border border-slate-200 flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            <span>สมัครสมาชิกใหม่</span>
          </button>
        </div>
      </div>
    </div>
  );
}
