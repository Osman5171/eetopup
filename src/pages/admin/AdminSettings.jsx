import React, { useState, useEffect } from 'react';
import { Save, Settings, MessageCircle, Smartphone, Bell, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    notice_text: '',
    bkash_number: '',
    nagad_number: '',
    whatsapp_link: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (data) setConfig(data);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('settings').update(config).eq('id', 1);
    if (!error) alert('Settings Updated Successfully! ✅');
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center text-white"><Loader2 className="animate-spin inline mr-2"/> Loading Settings...</div>;

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#fbbf24] mb-6 flex items-center gap-2"><Settings /> Global Settings</h1>
      
      <form onSubmit={handleSave} className="bg-[#1e293b] p-6 rounded-2xl border border-gray-700 shadow-xl space-y-6">
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

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2"><MessageCircle size={14}/> WhatsApp Support Link</label>
          <input type="text" className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 text-white outline-none focus:border-blue-500" value={config.whatsapp_link} onChange={e => setConfig({...config, whatsapp_link: e.target.value})} />
        </div>

        <button disabled={saving} className="w-full bg-[#0052FF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} Save Changes
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;