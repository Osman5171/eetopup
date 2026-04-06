import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const WhatsAppFloat = () => {
  const [link, setLink] = useState('#');

  useEffect(() => {
    const getLink = async () => {
      const { data } = await supabase.from('settings').select('whatsapp_link').eq('id', 1).single();
      if (data) setLink(data.whatsapp_link);
    };
    getLink();
  }, []);

  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 animate-bounce"
      title="Contact on WhatsApp"
    >
      <MessageCircle size={30} fill="currentColor" />
    </a>
  );
};

export default WhatsAppFloat;