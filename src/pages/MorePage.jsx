import React from 'react';
import { HelpCircle, FileText, ShieldAlert, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

export default function MorePage() {
  const moreLinks = [
    {
      title: 'ศูนย์ช่วยเหลือ (Help Center)',
      description: 'ค้นหาคำตอบสำหรับคำถามที่พบบ่อยและวิธีการใช้งานแพลตฟอร์ม',
      icon: HelpCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      link: '#',
      isExternal: false,
    },
    {
      title: 'ข้อกำหนดและเงื่อนไข (Terms of Service)',
      description: 'อ่านข้อกำหนด กติกา และเงื่อนไขการให้บริการของ ShareED',
      icon: FileText,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      link: '#',
      isExternal: false,
    },
    {
      title: 'นโยบายความเป็นส่วนตัว (Privacy Policy)',
      description: 'เรียนรู้วิธีการที่เราปกป้องและจัดการข้อมูลส่วนบุคคลของคุณ',
      icon: ShieldAlert,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      link: '#',
      isExternal: false,
    },
    {
      title: 'ติดต่อเรา (Contact Us)',
      description: 'ช่องทางการติดต่อทีมงานเพื่อแจ้งปัญหาหรือเสนอแนะ',
      icon: Mail,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
      link: '#',
      isExternal: false,
    },
  ];

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-foreground mb-2">รายการเพิ่มเติม</h1>
          <p className="text-muted-foreground font-medium">รวมลิงก์และข้อมูลอื่นๆ ที่เป็นประโยชน์สำหรับคุณ</p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moreLinks.map((item, idx) => (
            <div key={idx} className="card-premium p-6 flex flex-col h-full hover:border-primary/50 transition-colors group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}>
                  <item.icon size={24} />
                </div>
                {item.isExternal ? (
                  <ExternalLink size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <ArrowRight size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                )}
              </div>
              <h3 className="text-xl font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-auto">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* App Version / Info */}
        <div className="mt-8 text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm mb-2 opacity-80">
            SE
          </div>
          <p className="text-sm font-bold text-foreground opacity-70">ShareED Platform</p>
          <p className="text-xs font-medium text-muted-foreground">เวอร์ชัน 1.0.0 &copy; {new Date().getFullYear()} ShareED</p>
        </div>

      </div>
    </div>
  );
}
