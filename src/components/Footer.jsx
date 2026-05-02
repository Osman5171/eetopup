import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageCircle, ShieldCheck, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Custom Social Icons
const FacebookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
const InstagramIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);
const YoutubeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>);

const Footer = () => {
  const [settings, setSettings] = useState({
    whatsapp_link: '#',
    support_telegram: '#',
    show_app_link: true,
    app_link_url: '#'
  });

  useEffect(() => {
    const fetchFooterSettings = async () => {
      const { data } = await supabase.from('settings').select('whatsapp_link, support_telegram, show_app_link, app_link_url').eq('id', 1).single();
      if (data) {
        setSettings({
            whatsapp_link: data.whatsapp_link || '#',
            support_telegram: data.support_telegram || '#',
            show_app_link: data.show_app_link !== false,
            app_link_url: data.app_link_url || '#'
        });
      }
    };
    fetchFooterSettings();
  }, []);

  return (
    <footer className="bg-[#0a1526] text-white pt-12 pb-6 mt-10 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          
          {/* Column 1: About & Socials */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-500">Stay Connected</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
               Eagle Eye Topup is your trusted partner for all gaming needs.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-all duration-300">
                <FacebookIcon />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-all duration-300">
                <InstagramIcon />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-all duration-300">
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-500">Quick Links</h3>
            <ul className="text-gray-400 text-sm space-y-3">
              <li><Link to="/" className="hover:text-blue-500 transition-colors flex items-center gap-2">Home</Link></li>
              <li><Link to="/topup" className="hover:text-blue-500 transition-colors flex items-center gap-2">Shop/Topup</Link></li>
              <li><Link to="/profile" className="hover:text-blue-500 transition-colors flex items-center gap-2">My Account</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors flex items-center gap-2">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal Info & App */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-500">Legal Info</h3>
            <ul className="text-gray-400 text-sm space-y-3">
              <li><Link to="/terms" className="hover:text-blue-500 transition-colors flex items-center gap-2"><FileText size={16}/> Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-500 transition-colors flex items-center gap-2"><ShieldCheck size={16}/> Privacy Policy</Link></li>
              
              {/* Dynamic App Link */}
              {settings.show_app_link && (
                  <li>
                    <p className="mt-4 font-bold text-gray-300">Our Mobile App</p>
                    <a href={settings.app_link_url} target="_blank" rel="noreferrer" className="inline-block mt-2 hover:opacity-80 transition">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                        alt="Get it on Google Play" 
                        className="h-10"
                    />
                    </a>
                  </li>
              )}

            </ul>
          </div>

          {/* Column 4: Support Center (Dynamic Links) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-blue-500">Support Center</h3>
            <div className="flex flex-col gap-3">
              
              {/* Dynamic Whatsapp */}
              <a href={settings.whatsapp_link.includes('wa.me') ? settings.whatsapp_link : `https://wa.me/${settings.whatsapp_link.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl hover:bg-gray-800 transition-all border border-gray-700 hover:border-green-500">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-green-500/20">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">9AM - 11PM</p>
                  <p className="font-bold text-sm">WhatsApp HelpLine</p>
                </div>
              </a>
              
              {/* Dynamic Telegram */}
              <a href={settings.support_telegram} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl hover:bg-gray-800 transition-all border border-gray-100/10 hover:border-blue-500">
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Send size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Fastest Support</p>
                  <p className="font-bold text-sm text-blue-400">Telegram Channel</p>
                </div>
              </a>

            </div>
          </div>
        </div>

        {/* Copyright Bar (Name Changed) */}
        <div className="text-center border-t border-gray-800 pt-6 mt-6">
          <p className="text-gray-500 text-xs md:text-sm">
              &copy; {new Date().getFullYear()} <span className="text-white font-bold">Eagle Eye Topup</span> | All Rights Reserved | Developed by <span className="text-blue-500 font-bold">nahidul islam</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;