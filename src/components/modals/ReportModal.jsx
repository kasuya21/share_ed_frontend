import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleReport = () => {
    if (!reason) {
      toast.error('กรุณาเลือกเหตุผลในการรายงาน');
      return;
    }
    if (!confirmed) {
      toast.error('กรุณากดยืนยันการรายงาน');
      return;
    }
    onSubmit(reason);
    setReason('');
    setConfirmed(false);
  };

  const reportReasons = [
    { id: 'spam', label: 'สแปม' },
    { id: 'inappropriate', label: 'โพสต์ไม่เหมาะสม' },
    { id: 'rule_violation', label: 'การละเมิดกฎ' },
    { id: 'incorrect_content', label: 'เนื้อหาไม่ถูกต้อง' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Content Card */}
      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-50"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h3 className="text-2xl font-black text-slate-800 text-center mt-2">
          รายงานโพสต์
        </h3>

        {/* Reasons List */}
        <div className="flex flex-col gap-4 my-2">
          {reportReasons.map((item) => (
            <label 
              key={item.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <input 
                type="radio" 
                name="report_reason" 
                value={item.id}
                checked={reason === item.id}
                onChange={() => setReason(item.id)}
                className="w-5 h-5 text-red-600 border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <span className="font-bold text-slate-700 text-base">
                {item.label}
              </span>
            </label>
          ))}
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 px-1 cursor-pointer">
          <input 
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded text-red-600 border-slate-300 focus:ring-red-500 cursor-pointer"
          />
          <span className="font-bold text-slate-600 text-sm leading-snug">
            คุณแน่ใจว่าต้องการรีพอร์ตใช่มั้ย
          </span>
        </label>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 rounded-2xl transition-colors text-base"
          >
            ยกเลิก
          </button>
          
          <button
            type="button"
            onClick={handleReport}
            className="w-full bg-[#D32F2F] hover:bg-[#C2185B] text-white font-extrabold py-3.5 rounded-2xl transition-colors text-base shadow-md"
          >
            รีพอร์ต
          </button>
        </div>

      </div>
    </div>
  );
}
