import React from 'react';
import { BookOpen, Users, Globe, Shield, Heart } from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    { name: 'EyeJungJaRun', role: 'Founder & Lead Developer' },
    // Add more members if needed
  ];

  return (
    <div className="w-full bg-background min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        
        {/* Hero Section */}
        <div className="card-premium p-10 flex flex-col items-center text-center gap-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-4xl shadow-md">
            SE
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              เกี่ยวกับ <span className="text-primary">ShareED</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto italic">
              "Sharing Knowledge, Shaping the Future" <br />
              แบ่งปันความรู้ เพื่ออนาคตทางการศึกษา
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-premium p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
              <Globe size={24} />
            </div>
            <h2 className="text-2xl font-black text-foreground">วิสัยทัศน์ของเรา</h2>
            <p className="text-muted-foreground leading-relaxed font-medium">
              เราเชื่อว่าการศึกษาควรเข้าถึงได้ง่ายสำหรับทุกคน พื้นที่นี้ถูกสร้างขึ้นเพื่อเป็นแหล่งรวมและแบ่งปันความรู้ สื่อการเรียนการสอน และประสบการณ์ดีๆ ที่จะช่วยยกระดับการศึกษาของไทยให้ก้าวไกลยิ่งขึ้น
            </p>
          </div>

          <div className="card-premium p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-black text-foreground">พันธกิจของเรา</h2>
            <p className="text-muted-foreground leading-relaxed font-medium">
              ส่งเสริมให้เกิดสังคมแห่งการเรียนรู้ (Learning Community) ที่ทุกคนสามารถเป็นได้ทั้งผู้ให้และผู้รับ ผ่านแพลตฟอร์มที่ใช้งานง่าย ปลอดภัย และสร้างสรรค์
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="card-premium p-8">
          <h2 className="text-2xl font-black text-foreground mb-8 text-center">ค่านิยมองค์กร</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Heart size={28} />
              </div>
              <h3 className="font-extrabold text-foreground text-lg">ใส่ใจและแบ่งปัน</h3>
              <p className="text-sm text-muted-foreground">ให้ความสำคัญกับการแบ่งปันเนื้อหาที่มีประโยชน์ต่อส่วนรวม</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Users size={28} />
              </div>
              <h3 className="font-extrabold text-foreground text-lg">ชุมชนที่เข้มแข็ง</h3>
              <p className="text-sm text-muted-foreground">สร้างเครือข่ายผู้เรียนและผู้สอนที่ช่วยเหลือซึ่งกันและกัน</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Shield size={28} />
              </div>
              <h3 className="font-extrabold text-foreground text-lg">ปลอดภัยและเชื่อถือได้</h3>
              <p className="text-sm text-muted-foreground">รักษามาตรฐานและคุณภาพของเนื้อหาบนแพลตฟอร์ม</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="card-premium p-8">
          <h2 className="text-2xl font-black text-foreground mb-6 text-center">ทีมงานของเรา</h2>
          <div className="flex justify-center">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 bg-secondary/50 p-6 rounded-2xl border border-border min-w-[200px]">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border border-primary/20">
                  {member.name.charAt(0)}
                </div>
                <div className="text-center">
                  <h3 className="font-extrabold text-foreground text-lg">{member.name}</h3>
                  <p className="text-sm text-primary font-bold">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
