import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, LayoutGrid, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('brands').select('*').order('created_at', { ascending: true });
    if (data) setBrands(data);
    if (error) console.error(error);
    setLoading(false);
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        // Update
        const { error } = await supabase.from('brands').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('brands').insert([formData]);
        if (error) throw error;
      }
      closeModal();
      fetchBrands();
    } catch (error) {
      alert("Error saving brand: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete the brand "${name}"?`)) return;
    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
      fetchBrands();
    } catch (error) {
      alert("Error deleting brand: " + error.message);
    }
  };

  const openModal = (brand = null) => {
    if (brand) {
      setFormData({ name: brand.name, image_url: brand.image_url, status: brand.status });
      setEditingId(brand.id);
    } else {
      setFormData({ name: '', image_url: '', status: 'Active' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1930] flex items-center gap-2">
            <LayoutGrid className="text-[#0052FF]" /> Manage Brands
          </h1>
          <p className="text-gray-500 text-sm mt-1">Add or update product brands/categories</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#0052FF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-md"
        >
          <Plus size={18} /> Add New Brand
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Brand Name</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Loading brands...</td></tr>
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-blue-50/50 transition">
                    <td className="p-4">
                      {brand.image_url ? (
                        <img src={brand.image_url} alt={brand.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-[#0a1930]">{brand.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        brand.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {brand.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2 items-center h-full pt-6">
                      <button onClick={() => openModal(brand)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(brand.id, brand.name)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No brands found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 text-[#0a1930]">{editingId ? 'Edit Brand' : 'Add Brand'}</h2>
            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                <input type="text" required placeholder="e.g., Free Fire BD" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]" />
                <p className="text-[10px] text-gray-500 mt-1">*Provide an image link (Imgur, ImgBB, etc.)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#0052FF] text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2">
                  {saving && <Loader2 size={16} className="animate-spin" />} {saving ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;