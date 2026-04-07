import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Loader2, Edit } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminPromo = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount_amount: '', max_uses: '100', status: 'Active' });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    if (data) setPromos(data);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // কোডটি সবসময় বড় হাতের (UPPERCASE) করে সেভ হবে
    const codeToSave = formData.code.toUpperCase().trim();

    const { error } = await supabase.from('promo_codes').insert({
      code: codeToSave,
      discount_amount: parseFloat(formData.discount_amount),
      max_uses: parseInt(formData.max_uses),
      status: formData.status
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Promo Code Created! 🎉");
      setFormData({ code: '', discount_amount: '', max_uses: '100', status: 'Active' });
      fetchPromos();
    }
    setSaving(false);
  };

  const handleDelete = async (id, code) => {
    if(window.confirm(`আপনি কি "${code}" কুপনটি ডিলিট করতে চান?`)) {
      await supabase.from('promo_codes').delete().eq('id', id);
      fetchPromos();
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a1930] flex items-center gap-2"><Tag className="text-[#0052FF]"/> Manage Promo Codes</h1>
        <p className="text-gray-500 text-sm mt-1">Create discount coupons for your users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
          <h2 className="font-bold text-[#0a1930] mb-4 border-b pb-2">Create New Coupon</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Promo Code</label>
              <input type="text" required placeholder="e.g. EID50" className="w-full mt-1 border border-gray-300 rounded p-2.5 outline-none focus:border-[#0052FF] uppercase font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Discount Amount (৳)</label>
              <input type="number" required placeholder="e.g. 10" className="w-full mt-1 border border-gray-300 rounded p-2.5 outline-none focus:border-[#0052FF]" value={formData.discount_amount} onChange={e => setFormData({...formData, discount_amount: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Max Usage Limit</label>
              <input type="number" required className="w-full mt-1 border border-gray-300 rounded p-2.5 outline-none focus:border-[#0052FF]" value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
              <select className="w-full mt-1 border border-gray-300 rounded p-2.5 outline-none focus:border-[#0052FF]" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button disabled={saving} className="w-full bg-[#0052FF] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
              {saving ? 'Creating...' : 'Create Promo Code'}
            </button>
          </form>
        </div>

        {/* List of Promos */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Usage (Used/Max)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin inline" /></td></tr>
                ) : promos.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">No promo codes found.</td></tr>
                ) : (
                  promos.map(p => (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition">
                      <td className="p-4 font-black text-[#0052FF] tracking-wider">{p.code}</td>
                      <td className="p-4 font-bold text-green-600">৳{p.discount_amount}</td>
                      <td className="p-4 text-sm text-gray-600">{p.current_uses} / {p.max_uses}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(p.id, p.code)} className="text-red-500 hover:bg-red-50 p-2 rounded transition"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPromo;