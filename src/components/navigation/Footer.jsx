import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer className="bg-[#162447] text-white py-16 px-6 md:px-12 mt-auto">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Left Column - Logo & Motto */}
        <div className="flex flex-col gap-6 md:pl-10">
          <div className="relative inline-flex items-center w-fit">
            <img 
              src="/logo.png" 
              alt="ShareED" 
              className="h-16 w-auto object-contain relative z-10" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} 
            />
            <div className="hidden w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl items-center justify-center text-white font-extrabold text-3xl shadow-sm">
              SE
            </div>
            {/* Rotated text 'Shered' as seen in the mockup */}
            <span className="absolute -top-2 -right-12 text-sm font-medium tracking-wide rotate-[-25deg] opacity-90 text-white/90">
              Shered
            </span>
          </div>
          <div className="text-white/80 text-xs sm:text-sm flex flex-col gap-1">
            <p className="font-semibold tracking-wide">"Sharing Knowledge, Shaping the Future"</p>
            <p className="opacity-90 tracking-wide">"แบ่งปันความรู้ เพื่ออนาคตทางการศึกษา"</p>
          </div>
        </div>

        {/* Center Column - Services / Contact */}
        <div className="flex flex-col gap-4 md:items-center pt-2">
          <div className="w-full max-w-[200px]">
            <h3 className="text-sm font-bold tracking-widest mb-6 text-white uppercase">
              SERVICES
            </h3>
            <div className="flex items-start gap-3 text-white/90">
              <div className="mt-1">
                <User size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold opacity-90 tracking-wide">ติดต่อได้ที่</span>
                <span className="font-bold text-sm tracking-wide">EyeJungJaRun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Social Media */}
        <div className="flex flex-col gap-4 md:items-start pt-2">
          <div className="w-full max-w-[200px]">
            <h3 className="text-sm font-bold tracking-widest mb-6 text-white uppercase">
              SOCIAL
            </h3>
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-white/90 hover:text-white transition-colors text-sm font-bold tracking-wide"
                >
                  <svg className="w-[18px] h-[18px] text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>ShareED</span>
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-white/90 hover:text-white transition-colors text-sm font-bold tracking-wide"
                >
                  <svg className="w-[18px] h-[18px] text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                  <span>ShareED</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
}
