import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
  return (
    <a 
      href="https://wa.me/+8801343202970" // ⚠️ Ekhane apnar number diben
      target="_blank" 
      rel="noreferrer"
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#0052FF] text-white py-2 px-6 rounded-full shadow-[0_5px_15px_rgba(0,82,255,0.3)] flex items-center justify-center gap-2 z-50 hover:bg-blue-700 hover:scale-105 transition-all"
    >
      <MessageCircle size={20} className="animate-pulse" />
      <span className="text-sm font-bold">SUPPORT</span>
    </a>
  );
};

export default WhatsAppFloat;