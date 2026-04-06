import React, { useState, useEffect } from 'react';

const HeroSlider = () => {
  // Apatoto dummy images. Pore Supabase theke apnar ImgBB er URL gulo ekhane ashbe
  const [images, setImages] = useState([
    'https://eagleeyetopup.com/logo.png', // Apnar original link
    'https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png', // Dummy banner 2
    'https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png'  // Dummy banner 3
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto Slider Logic (Proti 3 second por por slide change hobe)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // 3000ms = 3 seconds

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="w-full mt-4 rounded-xl overflow-hidden relative shadow-md group">
      
      {/* Images Container (Ekhane smooth transition er jonno transform bebohar kora hoyeche) */}
      <div 
        className="flex transition-transform duration-500 ease-out h-40 md:h-72 lg:h-96 bg-[#0a1930]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, index) => (
          <img 
            key={index}
            src={img} 
            alt={`Banner ${index + 1}`} 
            className="min-w-full h-full object-contain md:object-cover"
          />
        ))}
      </div>
      
      {/* Slider Navigation Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index 
                ? 'w-6 h-2 bg-[#0052FF]' // Active dot ta ektu lomba o blue hobe
                : 'w-2 h-2 bg-white/70 hover:bg-white' // Inactive dot choto o sada hobe
            }`}
          ></button>
        ))}
      </div>

    </div>
  );
};

export default HeroSlider;