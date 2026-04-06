import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0a1526] text-white pt-12 pb-4 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 mb-10">
          
          {/* Column 1: Stay Connected */}
          <div>
            <h3 className="text-lg font-bold mb-4 uppercase">Stay Connected</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              কোন সমস্যায় পড়লে টেলিগ্রাম এ যোগাযোগ করবেন।<br/>তাহলে দ্রুত সমাধান পেয়ে যাবেন।
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:bg-blue-600 transition">
                <span className="font-bold">f</span>
              </a>
              <a href="#" className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:bg-pink-600 transition">
                <span className="font-bold">in</span>
              </a>
              <a href="#" className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:bg-red-600 transition">
                <span className="font-bold">yt</span>
              </a>
              <a href="#" className="w-10 h-10 rounded border border-gray-600 flex items-center justify-center hover:bg-blue-400 transition">
                <span className="font-bold">@</span>
              </a>
            </div>
          </div>

          {/* Column 2: Our Mobile App */}
          <div className="flex flex-col items-start md:items-center">
            <h3 className="text-lg font-bold mb-4 uppercase">Our Mobile App</h3>
            <a href="#" className="inline-block hover:opacity-80 transition">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Get it on Google Play" 
                className="h-12"
              />
            </a>
          </div>

          {/* Column 3: Support Center */}
          <div>
            <h3 className="text-lg font-bold mb-4 uppercase">Support Center</h3>
            <div className="flex flex-col gap-3">
              {/* Whatsapp */}
              <div className="flex items-center gap-3 border border-gray-700 p-3 rounded-lg hover:border-gray-500 cursor-pointer transition">
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                  <span className="text-white font-bold">W</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Help line [9AM-12PM]</p>
                  <p className="font-bold text-sm">Whatsapp HelpLine</p>
                </div>
              </div>
              
              {/* Telegram */}
              <div className="flex items-center gap-3 border border-gray-700 p-3 rounded-lg hover:border-gray-500 cursor-pointer transition">
                <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Help line [9AM-12PM]</p>
                  <p className="font-bold text-sm">টেলিগ্রামে সাপোর্ট</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-center border-t border-gray-800 pt-4 mt-6">
          <p className="text-gray-500 text-sm">
            © eagleeyetopup 2026 | All Rights Reserved | Developed by <span className="text-blue-500 font-bold">Team Mahal</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;