import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Content Card */}
      <div className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in duration-200">
        
        {/* Icon & Close */}
        <div className="flex justify-center w-full relative">
          <button 
            onClick={onClose}
            className="absolute -right-2 -top-2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-50"
          >
            <X size={24} />
          </button>
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle size={32} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center flex flex-col gap-2">
          <h3 className="text-2xl font-black text-slate-800">ยืนยันการลบโพสต์?</h3>
          <p className="text-sm font-bold text-slate-500 leading-relaxed">
            โพสต์จะถูกย้ายไปที่ถังขยะ และจะถูก <span className="text-red-500">ลบถาวรในอีก 3 ชั่วโมง</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 rounded-2xl transition-colors text-sm"
          >
            ยกเลิก
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl transition-colors text-sm shadow-md"
          >
            ยืนยันการลบ
          </button>
        </div>
      </div>
    </div>
  );
}
