import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { MessageCircle, Send, Loader } from 'lucide-react';

const Support = () => {
  const [links, setLinks] = useState({ whatsapp: '', telegram: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupportLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('whatsapp_link, support_telegram')
          .eq('id', 1)
          .single();
          
        if (data) {
          setLinks({ 
              whatsapp: data.whatsapp_link || '', 
              telegram: data.support_telegram || '' 
          });
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
      window.open(links.whatsapp.includes('http') ? links.whatsapp : `https://wa.me/${links.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  const handleTelegram = () => {
    if (links.telegram) {
      window.open(links.telegram.includes('http') ? links.telegram : `https://t.me/${links.telegram.replace('@', '')}`, '_blank');
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
        <button
          onClick={handleTelegram}
          disabled={!links.telegram}
          className={`relative rounded-xl overflow-hidden transition transform ${links.telegram ? 'cursor-pointer hover:shadow-cyan-500/20 active:scale-95' : 'cursor-not-allowed opacity-60'} bg-[#0088cc] shadow-lg`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 transition">
            <Send size={80} color="white" />
          </div>
          <div className="p-5 flex items-center gap-5">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
               <Send size={32} className="text-white" />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white tracking-wide">TELEGRAM SUPPORT</h3>
               <p className="text-blue-100 text-xs font-medium">Join our channel & chat</p>
            </div>
          </div>
        </button>

        {/* WhatsApp Card */}
        <button
          onClick={handleWhatsApp}
          disabled={!links.whatsapp}
          className={`relative rounded-xl overflow-hidden transition transform ${links.whatsapp ? 'cursor-pointer hover:shadow-green-500/20 active:scale-95' : 'cursor-not-allowed opacity-60'} bg-[#25D366] shadow-lg`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 transition">
            <MessageCircle size={80} color="white" />
          </div>
          <div className="p-5 flex items-center gap-5">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
               <MessageCircle size={32} className="text-white" />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white tracking-wide">WHATSAPP SUPPORT</h3>
               <p className="text-green-100 text-xs font-medium">Chat directly with admin</p>
            </div>
          </div>
        </button>
      </div>
      {!links.whatsapp && !links.telegram && (
        <p className="mt-4 text-sm text-gray-300 text-center">
          Support links are not configured. Please contact the admin from the app or use the support button below.
        </p>
      )}
    </div>
  );
};

export default Support;