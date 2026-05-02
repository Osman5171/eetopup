import React, { useState, useEffect } from 'react';
import { Save, Settings, MessageCircle, Smartphone, Bell, Loader2, Link as LinkIcon, Send } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    notice_text: '',
    bkash_number: '',
    nagad_number: '',
    whatsapp_link: '',
    support_telegram: '',
    show_app_link: true,
    app_link_url: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (data) {
      setConfig({
        notice_text: data.notice_text || '',
        bkash_number: data.bkash_number || '',
        nagad_number: data.nagad_number || '',
        whatsapp_link: data.whatsapp_link || '',
        support_telegram: data.support_telegram || '',
        show_app_link: data.show_app_link !== false, // ডিফল্ট true
        app_link_url: data.app_link_url || ''
      });
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('settings').update(config).eq('id', 1);
    if (!error) {
        alert('Settings Updated Successfully!');
    } else {
        alert('Error updating settings: ' + error.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center text-white"><Loader2 className="animate-spin inline mr-2"/> Loading Settings...</div>;

  return (
    <div className="animate-fade-in-up max-w-3xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-[#fbbf24] mb-6 flex items-center gap-2"><Settings /> Global Settings</h1>
      
      <form onSubmit={handleSave} className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-xl space-y-6">
        
        {/* Notice & Numbers */}
        <div className="border-b border-gray-700 pb-6 space-y-6">
            <div>
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2"><Bell size={14}/> Notice Bar Text</label>
            <textarea 
                className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 text-white outline-none focus:border-blue-500"
                rows="2" value={config.notice_text} onChange={e => setConfig({...config, notice_text: e.target.value})}
            />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2"><Smartphone size={14}/> bKash Number</label>
                <input type="text" className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 text-white outline-none focus:border-blue-500" value={config.bkash_number} onChange={e => setConfig({...config, bkash_number: e.target.value})} />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2"><Smartphone size={14}/> Nagad Number</label>
                <input type="text" className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 text-white outline-none focus:border-blue-500" value={config.nagad_number} onChange={e => setConfig({...config, nagad_number: e.target.value})} />
            </div>
            </div>
        </div>

        {/* Support Links */}
        <div className="border-b border-gray-700 pb-6 space-y-6">
            <h3 className="text-lg font-bold text-white mb-2">Support Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2"><MessageCircle size={14}/> WhatsApp Full Link / Number</label>
                    <input type="text" placeholder="https://wa.me/+8801..." className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 text-white outline-none focus:border-blue-500" value={config.whatsapp_link} onChange={e => setConfig({...config, whatsapp_link: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2"><Send size={14}/> Telegram Channel Link</label>
                    <input type="text" placeholder="https://t.me/yourchannel" className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 text-white outline-none focus:border-blue-500" value={config.support_telegram} onChange={e => setConfig({...config, support_telegram: e.target.value})} />
                </div>
            </div>
        </div>

        {/* App Link Settings */}
        <div className="border-b border-gray-700 pb-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Mobile App Setting (Footer)</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={config.show_app_link} onChange={(e) => setConfig({...config, show_app_link: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    <span className="ml-3 text-sm font-medium text-gray-300">{config.show_app_link ? 'Enabled' : 'Disabled'}</span>
                </label>
            </div>
            
            {config.show_app_link && (
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2"><LinkIcon size={14}/> Play Store App Link</label>
                    <input type="text" placeholder="https://play.google.com/..." className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 text-white outline-none focus:border-blue-500" value={config.app_link_url} onChange={e => setConfig({...config, app_link_url: e.target.value})} />
                </div>
            )}
        </div>

        <button disabled={saving} className="w-full bg-[#0052FF] hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2 shadow-lg">
          {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Save All Settings
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;