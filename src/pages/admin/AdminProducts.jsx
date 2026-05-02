import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Box, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    brand_name: '',
    name: '',
    image_url: '',
    product_type: 'Top Up',
    topup_type: 'id_code', // <-- নতুন ফিল্ড
    status: 'Active'
  });

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    if (error) console.error(error);
    setLoading(false);
  };

  const fetchBrands = async () => {
    const { data } = await supabase.from('brands').select('name').eq('status', 'Active').order('name', { ascending: true });
    if (data && data.length > 0) {
      setBrands(data);
      setFormData(prev => ({ ...prev, brand_name: data[0].name }));
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.brand_name) return alert("Please create a Brand first!");
    setSaving(true);
    
    // ডাটা সেভ করার সময় Top Up না হলে topup_type ক্লিয়ার করে দিচ্ছি
    const dataToSave = { ...formData };
    if (dataToSave.product_type !== 'Top Up') {
        dataToSave.topup_type = 'id_code'; 
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('products').update(dataToSave).eq('id', editingId);
        if (error) throw error;
        alert("Product Updated!");
      } else {
        const { error } = await supabase.from('products').insert([dataToSave]);
        if (error) throw error;
        alert("Product Created!");
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      alert("Error saving product: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete the product "${name}"?`)) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error) {
      alert("Error deleting product: " + error.message);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setFormData({ 
        brand_name: product.brand_name, 
        name: product.name, 
        image_url: product.image_url, 
        product_type: product.product_type || 'Top Up',
        topup_type: product.topup_type || 'id_code', // <-- এডিটের সময় ডাটা লোড হবে
        status: product.status 
      });
      setEditingId(product.id);
    } else {
      setFormData({ 
        brand_name: brands.length > 0 ? brands[0].name : '', 
        name: '', 
        image_url: '', 
        product_type: 'Top Up',
        topup_type: 'id_code',
        status: 'Active' 
      });
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
            <Box className="text-[#0052FF]" /> Manage Products
          </h1>
          <p className="text-gray-500 text-sm mt-1">Add products under specific brands</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#0052FF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-md">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Brand</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Loading products...</td></tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50/50 transition">
                    <td className="p-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-[#0a1930]">
                        {product.name}
                        {product.product_type === 'Top Up' && product.topup_type === 'ingame' && (
                           <span className="ml-2 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">In-Game</span>
                        )}
                    </td>
                    <td className="p-4 text-sm font-semibold text-blue-600">{product.brand_name}</td>
                    
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                        product.product_type === 'Voucher' ? 'bg-purple-100 text-purple-700' : 
                        product.product_type === 'SMM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {product.product_type || 'TOP UP'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2 items-center h-full pt-4">
                      <button onClick={() => openModal(product)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 text-[#0a1930]">{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <select required value={formData.brand_name} onChange={(e) => setFormData({...formData, brand_name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]">
                    {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                  <select value={formData.product_type} onChange={(e) => setFormData({...formData, product_type: e.target.value})} className="w-full border border-blue-300 bg-blue-50 text-blue-800 font-bold rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]">
                    <option value="Top Up">Top Up (Game ID)</option>
                    <option value="Voucher">Voucher / Code</option>
                    <option value="SMM">SMM (Social Media)</option>
                  </select>
                </div>
              </div>

              {/* নতুন অপশন: Top Up Type Selection */}
              {formData.product_type === 'Top Up' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <label className="block text-sm font-medium text-purple-800 mb-1">Top Up Method</label>
                  <select value={formData.topup_type} onChange={(e) => setFormData({...formData, topup_type: e.target.value})} className="w-full border border-purple-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500 font-bold text-gray-700">
                    <option value="id_code">ID Code (Player ID)</option>
                    <option value="ingame">In-Game (FB/Gmail Login)</option>
                    <option value="2_field">2 Field (UID + Zone)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" required placeholder="e.g., Diamond Top Up or Unipin BD" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]" />
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
                  {saving && <Loader2 size={16} className="animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;