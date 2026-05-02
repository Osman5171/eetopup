import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageCircle, Clock, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (data) setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-[#0052FF]" size={40}/></div>;

  return (
    <div className="animate-fade-in-up mt-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-[#0a1930] mb-2">Contact & Support</h1>
        <p className="text-gray-500">যেকোনো সমস্যা বা জিজ্ঞাসায় আমাদের সাথে যোগাযোগ করুন</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-[#0052FF] transition group">
            <div className="bg-green-50 p-4 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
              <MessageCircle size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">WhatsApp Support</h3>
              <p className="text-sm text-gray-500 mb-2">সরাসরি চ্যাট করতে ক্লিক করুন</p>
              <a href={settings?.whatsapp_link} target="_blank" className="text-[#0052FF] font-bold hover:underline">Chat Now →</a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="bg-blue-50 p-4 rounded-xl text-[#0052FF]">
              <Phone size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Direct Call</h3>
              <p className="text-sm text-gray-500">{settings?.bkash_number || '017XXXXXXXX'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="bg-purple-50 p-4 rounded-xl text-purple-600">
              <Clock size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Support Time</h3>
              <p className="text-sm text-gray-500">সকাল ১০:০০ - রাত ১১:৫৯ (প্রতিদিন)</p>
            </div>
          </div>
        </div>

        {/* FAQ or Simple Message Section */}
        <div className="bg-[#0a1930] text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">অর্ডার ডেলিভারি পাচ্ছেন না?</h2>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex gap-3">
                <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white">1</span>
                আপনার প্রোফাইল পেজে গিয়ে অর্ডারের স্ট্যাটাস চেক করুন।
              </li>
              <li className="flex gap-3">
                <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white">2</span>
                যদি ১০ মিনিটের বেশি সময় লাগে, তবে ট্রানজেকশন আইডি সহ হোয়াটসঅ্যাপে মেসেজ দিন।
              </li>
              <li className="flex gap-3">
                <span className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white">3</span>
                সঠিক প্লেয়ার আইডি (Player ID) দিয়েছেন কিনা নিশ্চিত হোন।
              </li>
            </ul>
          </div>
          <MapPin className="absolute -bottom-10 -right-10 text-white opacity-10" size={200} />
        </div>

      </div>
    </div>
  );
  
};

export default Contact;