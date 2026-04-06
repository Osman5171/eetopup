import React, { useState } from 'react';

const NoticeBar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#0052FF] text-white px-4 py-3 flex justify-between items-center mt-4 rounded-md shadow-sm">
      <div className="flex items-center gap-2 w-full overflow-hidden">
        <span className="font-bold whitespace-nowrap">Notice:</span>
        {/* HTML er marquee tag diye scrolling text banano hoyeche */}
        <marquee className="text-sm">
          Welcome to Eagle Eye Top Up! Get the fastest delivery and best discounts on all game top-ups.
        </marquee>
      </div>
      
      {/* Close Button */}
      <button onClick={() => setIsVisible(false)} className="ml-4 text-white hover:text-gray-200">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

export default NoticeBar;