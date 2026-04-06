import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const HeroSlider = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ডাটাবেস থেকে স্লাইডার ছবিগুলো আনা
  useEffect(() => {
    const fetchSliderImages = async () => {
      const { data } = await supabase.from('slider').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setImages(data);
      }
      setLoading(false);
    };
    fetchSliderImages();
  }, []);

  // অটো স্লাইডারের লজিক (৩ সেকেন্ড পর পর)
  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  if (loading) {
    return (
      <div className="w-full mt-4 h-40 md:h-72 lg:h-96 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
        <Loader2 className="animate-spin text-[#0052FF]" size={32} />
      </div>
    );
  }

  // যদি ডাটাবেসে কোনো ছবি না থাকে, তবে একটি ডিফল্ট ছবি দেখাবে
  if (images.length === 0) {
    return (
      <div className="w-full mt-4 rounded-xl overflow-hidden shadow-md">
        <img src="https://eagleeyetopup.com/logo.png" alt="Default Banner" className="w-full h-40 md:h-72 lg:h-96 object-contain bg-[#0a1930]" />
      </div>
    );
  }

  return (
    <div className="w-full mt-4 rounded-xl overflow-hidden relative shadow-md group">
      {/* Images Container */}
      <div 
        className="flex transition-transform duration-500 ease-out h-40 md:h-72 lg:h-96 bg-[#0a1930]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img) => (
          <img 
            key={img.id}
            src={img.image_url} 
            alt="Banner" 
            className="min-w-full h-full object-cover"
          />
        ))}
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index ? 'w-6 h-2 bg-[#0052FF]' : 'w-2 h-2 bg-white/70 hover:bg-white'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;