import React from 'react';

const ThemePreview = () => {
  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-10 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black text-center mb-10 text-gray-800">
        🎨 Choose Your Favorite Theme
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        
        {/* Theme 1: Dark & Neon Gaming */}
        <div className="bg-[#0F172A] p-6 rounded-2xl shadow-2xl border border-gray-800 transform hover:scale-105 transition-transform cursor-pointer">
          <h2 className="text-white text-xl font-bold mb-2">1. Dark & Neon</h2>
          <p className="text-[#94A3B8] text-xs mb-6">Cyberpunk / Modern Gamer</p>
          <div className="bg-[#1E293B] p-5 rounded-xl border border-gray-700">
            <p className="text-[#94A3B8] text-sm mb-2">100 Diamonds Topup</p>
            <p className="text-white font-black text-2xl mb-4">৳ 85</p>
            <button className="w-full bg-[#00E5FF] text-black font-black py-2.5 rounded-lg hover:shadow-[0_0_15px_rgba(0,229,255,0.6)] transition-all">
              Buy Now
            </button>
          </div>
        </div>

        {/* Theme 2: Premium Black & Gold */}
        <div className="bg-[#121212] p-6 rounded-2xl shadow-2xl border border-[#27272A] transform hover:scale-105 transition-transform cursor-pointer">
          <h2 className="text-[#FBBF24] text-xl font-bold mb-2">2. Black & Gold</h2>
          <p className="text-gray-500 text-xs mb-6">Luxurious / VIP / Trusted</p>
          <div className="bg-[#1F1F1F] p-5 rounded-xl border border-[#333]">
            <p className="text-gray-400 text-sm mb-2">100 Diamonds Topup</p>
            <p className="text-white font-black text-2xl mb-4">৳ 85</p>
            <button className="w-full bg-[#FBBF24] text-[#121212] font-black py-2.5 rounded-lg hover:bg-yellow-400 transition-all shadow-[0_4px_15px_rgba(251,191,36,0.2)]">
              Buy Now
            </button>
          </div>
        </div>

        {/* Theme 3: Aggressive Red */}
        <div className="bg-[#000000] p-6 rounded-2xl shadow-2xl border border-red-900/40 transform hover:scale-105 transition-transform cursor-pointer">
          <h2 className="text-white text-xl font-bold mb-2">3. Aggressive Red</h2>
          <p className="text-gray-500 text-xs mb-6">Energetic / Free Fire Vibe</p>
          <div className="bg-[#1C1C1E] p-5 rounded-xl border border-[#2C2C2E]">
            <p className="text-gray-400 text-sm mb-2">100 Diamonds Topup</p>
            <p className="text-white font-black text-2xl mb-4">৳ 85</p>
            <button className="w-full bg-[#E11D48] text-white font-black py-2.5 rounded-lg hover:bg-red-700 transition-all shadow-[0_4px_15px_rgba(225,29,72,0.4)]">
              Buy Now
            </button>
          </div>
        </div>

        {/* Theme 4: Clean Indigo Fintech */}
        <div className="bg-[#F8FAFC] p-6 rounded-2xl shadow-2xl border border-gray-200 transform hover:scale-105 transition-transform cursor-pointer">
          <h2 className="text-[#1E293B] text-xl font-bold mb-2">4. Clean Indigo</h2>
          <p className="text-gray-500 text-xs mb-6">Corporate / Smart App</p>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-2">100 Diamonds Topup</p>
            <p className="text-[#1E293B] font-black text-2xl mb-4">৳ 85</p>
            <button className="w-full bg-[#4F46E5] text-white font-black py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-[0_4px_15px_rgba(79,70,229,0.3)]">
              Buy Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemePreview;