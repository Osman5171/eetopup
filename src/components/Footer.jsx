import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Send, MessageCircle, ShieldCheck, FileText, Download } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a1526] text-white pt-12 pb-6 mt-10 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          
          {/* Column 1: About & Socials */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-500">Stay Connected</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              বাংলাদেশের সবচেয়ে দ্রুত এবং বিশ্বস্ত গেম টপ-আপ সার্ভিস। যেকোনো সমস্যায় আমাদের টেলিগ্রাম বা হোয়াটসঅ্যাপে যোগাযোগ করুন।
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-all duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-all duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-all duration-300">
                <Youtube size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-blue-400 transition-all duration-300">
                <Send size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (New Section) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-500">Quick Links</h3>
            <ul className="text-gray-400 text-sm space-y-3">
              <li><Link to="/" className="hover:text-blue-500 transition-colors flex items-center gap-2">Home</Link></li>
              <li><Link to="/topup" className="hover:text-blue-500 transition-colors flex items-center gap-2">Shop/Topup</Link></li>
              <li><Link to="/profile" className="hover:text-blue-500 transition-colors flex items-center gap-2">My Account</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors flex items-center gap-2">Add Money</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal Info (New Section) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-500">Legal Info</h3>
            <ul className="text-gray-400 text-sm space-y-3">
              <li><Link to="/terms" className="hover:text-blue-500 transition-colors flex items-center gap-2"><FileText size={16}/> Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ShieldCheck size={16}/> Privacy Policy</Link></li>
              <li>
                <p className="mt-4 font-bold text-gray-300">Our Mobile App</p>
                <a href="#" className="inline-block mt-2 hover:opacity-80 transition">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                    alt="Get it on Google Play" 
                    className="h-10"
                  />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Support Center */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-500">Support Center</h3>
            <div className="flex flex-col gap-3">
              {/* Whatsapp */}
              <a href="https://wa.me/YOUR_NUMBER" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl hover:bg-gray-800 transition-all border border-gray-700 hover:border-green-500">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-green-500/20">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">9AM - 11PM</p>
                  <p className="font-bold text-sm">WhatsApp HelpLine</p>
                </div>
              </a>
              
              {/* Telegram */}
              <a href="https://t.me/YOUR_CHANNEL" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl hover:bg-gray-800 transition-all border border-gray-100/10 hover:border-blue-500">
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Send size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Fastest Support</p>
                  <p className="font-bold text-sm text-blue-400">টেলিগ্রামে সাপোর্ট</p>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="text-center border-t border-gray-800 pt-6 mt-6">
          <p className="text-gray-500 text-xs md:text-sm">
            © {new Date().getFullYear()} <span className="text-white font-bold">Eagle Eye Topup</span> | All Rights Reserved | Developed by <span className="text-blue-500 font-bold">Team Mahal</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;