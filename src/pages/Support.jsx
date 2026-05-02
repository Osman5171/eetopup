import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MessageCircle, Send, Loader } from 'lucide-react';

const Support = () => {
  const [links, setLinks] = useState({ whatsapp: '', telegram: '' });
  const [loading, setLoading] = useState(true);

  // ডাটাবেস (settings টেবিল) থেকে সাপোর্ট লিংক ফেচ করা
  useEffect(() => {
    const fetchSupportLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key_name, key_value')
          .in('key_name', ['support_whatsapp', 'support_telegram']);

        if (data) {
          const newLinks = { whatsapp: '', telegram: '' };
          data.forEach(item => {
            if (item.key_name === 'support_whatsapp') newLinks.whatsapp = item.key_value;
            if (item.key_name === 'support_telegram') newLinks.telegram = item.key_value;
          });
          setLinks(newLinks);
        }
      } catch (err) {
        console.error("Error fetching support links:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportLinks();
  }, []);

  const handleWhatsApp = () => {
    if (links.whatsapp) {
      const number = links.whatsapp.replace(/[^0-9]/g, ''); 
      window.open(`https://wa.me/${number}`, '_blank');
    }
  };

  const handleTelegram = () => {
    if (links.telegram) {
      const username = links.telegram.replace('@', '');
      window.open(`https://t.me/${username}`, '_blank');
    }
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <Loader className="animate-spin text-[#fbbf24] mb-4" size={40} />
      <p className="text-gray-400">Loading Support Options...</p>
    </div>
  );

  return (
    <div className="min-h-[85vh] p-5 flex flex-col items-center pt-10">
      
      <h2 className="text-2xl font-bold text-white mb-2">Need Help?</h2>
      <p className="text-gray-400 mb-8 text-center text-sm">
        Contact our official support team for any queries or issues.
      </p>

      <div className="w-full max-w-md space-y-4">
        
        {/* Telegram Card */}
        <div 
          onClick={handleTelegram}
          className="relative bg-[#0088cc] rounded-xl overflow-hidden cursor-pointer shadow-lg transform transition active:scale-95 hover:shadow-cyan-500/20 group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Send size={80} color="white" />
          </div>
          
          <div className="p-5 flex items-center gap-5">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
               <Send size={32} className="text-white fill-current" />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white tracking-wide">TELEGRAM SUPPORT</h3>
               <p className="text-blue-100 text-xs font-medium">Join our channel & chat</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Card */}
        <div 
          onClick={handleWhatsApp}
          className="relative bg-[#25D366] rounded-xl overflow-hidden cursor-pointer shadow-lg transform transition active:scale-95 hover:shadow-green-500/20 group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <MessageCircle size={80} color="white" />
          </div>
          
          <div className="p-5 flex items-center gap-5">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
               <MessageCircle size={32} className="text-white fill-current" />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white tracking-wide">WHATSAPP SUPPORT</h3>
               <p className="text-green-100 text-xs font-medium">Chat directly with admin</p>
            </div>
          </div>
        </div>

      </div>

      <p className="mt-10 text-gray-500 text-xs text-center px-6">
        Note: Support is available 24/7. Please allow some time for a response during busy hours.
      </p>
    </div>
  );
};

export default Support;