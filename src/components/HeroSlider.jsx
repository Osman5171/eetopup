import React from 'react';

const HeroSlider = () => {
  return (
    <div className="w-full mt-4 rounded-lg overflow-hidden relative shadow-md">
      {/* Banner Image - Ekhane apnar admin panel theke asha slider image boshbe */}
      <img 
        src="https://eagleeyetopup.com/slider1.jpg" // Original website er banner image er link diben
        alt="Top Up Banner" 
        className="w-full h-40 md:h-72 lg:h-96 object-cover bg-gray-900"
      />
      
      {/* Slider Navigation Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        <span className="block w-4 h-1 bg-white rounded-full"></span>
        <span className="block w-4 h-1 bg-gray-400 rounded-full"></span>
        <span className="block w-4 h-1 bg-gray-400 rounded-full"></span>
      </div>
    </div>
  );
};

export default HeroSlider;