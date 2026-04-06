import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const NoticeBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [notice, setNotice] = useState('Loading notice...');

  useEffect(() => {
    fetchNotice();
  }, []);

  const fetchNotice = async () => {
    const { data } = await supabase.from('settings').select('notice_text').eq('id', 1).single();
    if (data) {
      setNotice(data.notice_text);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#0052FF] to-[#003bc2] text-white px-4 py-2.5 flex justify-between items-center mt-4 mb-6 rounded-lg shadow-md animate-fade-in-up">
      
      <div className="flex items-center gap-3 w-full overflow-hidden">
        {/* Notice Badge */}
        <span className="bg-white text-[#0052FF] px-3 py-1 rounded-md text-xs font-black whitespace-nowrap shadow-sm">
          NOTICE
        </span>
        
        {/* Scrolling Text from Database */}
        <marquee className="text-sm font-medium pt-0.5">
          {notice}
        </marquee>
      </div>
      
      {/* Close Button */}
      <button 
        onClick={() => setIsVisible(false)} 
        className="ml-3 text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition duration-200"
        title="Close Notice"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
    </div>
  );
};

export default NoticeBar;