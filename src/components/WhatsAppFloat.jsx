import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
  return (
    <a 
      href="https://wa.me/+8801343202970" // ⚠️ Ekhane apnar number diben
      target="_blank" 
      rel="noreferrer"
      className="fixed top-1/2 right-0 -translate-y-1/2 bg-[#0052FF] text-white p-3 rounded-l-xl shadow-[-5px_5px_15px_rgba(0,82,255,0.3)] flex flex-col items-center justify-center gap-1 z-50 hover:bg-blue-700 transition-all group"
    >
      <MessageCircle size={24} className="animate-pulse" />
      {/* Text ti lamba-lambi vabe thakbe */}
      <span className="text-[10px] font-bold hidden md:block" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
        SUPPORT
      </span>
    </a>
  );
};

export default WhatsAppFloat;