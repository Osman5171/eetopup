import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminPackages = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '', // এটি Brand হিসেবে কাজ করবে
    product_name: '', // এটি Product হিসেবে কাজ করবে
    name: '',
    buy_price: '',
    sell_price: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchPackages();
    fetchBrandsAndProducts();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('category', { ascending: true })
      .order('sell_price', { ascending: true });

    if (data) setPackages(data);
    setLoading(false);
  };

  const fetchBrandsAndProducts = async () => {
    const { data: bData } = await supabase.from('brands').select('*').eq('status', 'Active');
    const { data: pData } = await supabase.from('products').select('*').eq('status', 'Active');

    if (bData) setBrands(bData);
    if (pData) setAllProducts(pData);
  };

  // যখন ব্র্যান্ড পরিবর্তন করা হবে, তখন ওই ব্র্যান্ডের প্রোডাক্টগুলো ফিল্টার হবে
  const handleBrandChange = (brandName) => {
    const availableProducts = allProducts.filter(p => p.brand_name === brandName);
    setFormData({
      ...formData,
      category: brandName,
      product_name: availableProducts.length > 0 ? availableProducts[0].name : ''
    });
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.product_name) {
      alert("দয়া করে ব্র্যান্ড এবং প্রোডাক্ট সিলেক্ট করুন!");
      return;
    }
    setSaving(true);

    try {
      if (editingId) {
        await supabase.from('packages').update(formData).eq('id', editingId);
        alert('Package updated successfully! ✅');
      } else {
        await supabase.from('packages').insert([formData]);
        alert('New package added successfully! 🎉');
      }
      closeModal();
      fetchPackages();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if(!window.confirm(`আপনি কি "${name}" প্যাকেজটি ডিলিট করতে চান?`)) return;
    try {
      await supabase.from('packages').delete().eq('id', id);
      fetchPackages();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const openModal = (pkg = null) => {
    if (pkg) {
      setFormData({
        category: pkg.category,
        product_name: pkg.product_name || '',
        name: pkg.name,
        buy_price: pkg.buy_price,
        sell_price: pkg.sell_price,
        status: pkg.status
      });
      setEditingId(pkg.id);
    } else {
      const initialBrand = brands.length > 0 ? brands[0].name : '';
      const initialProducts = allProducts.filter(p => p.brand_name === initialBrand);
      setFormData({ 
        category: initialBrand, 
        product_name: initialProducts.length > 0 ? initialProducts[0].name : '',
        name: '', 
        buy_price: '', 
        sell_price: '', 
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

  // বর্তমানে সিলেক্ট করা ব্র্যান্ডের আন্ডারে যে প্রোডাক্টগুলো আছে
  const currentProducts = allProducts.filter(p => p.brand_name === formData.category);

  return (
    <div className="animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1930] flex items-center gap-2">
            <Package className="text-[#0052FF]" /> Manage Packages
          </h1>
          <p className="text-gray-500 text-sm mt-1">Add packages under specific Products</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#0052FF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-md">
          <Plus size={18} /> Add New Package
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Package Name</th>
                <th className="p-4 font-medium">Brand</th>
                <th className="p-4 font-medium text-blue-600">Product</th>
                <th className="p-4 font-medium">Buy Price</th>
                <th className="p-4 font-medium">Sell Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline-block mr-2" size={24}/> Loading...</td></tr>
              ) : packages.length > 0 ? (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-blue-50/50 transition">
                    <td className="p-4 font-bold text-[#0a1930]">{pkg.name}</td>
                    <td className="p-4 text-sm text-gray-600 font-medium">{pkg.category}</td>
                    <td className="p-4 text-sm text-blue-600 font-bold">{pkg.product_name || '-'}</td>
                    <td className="p-4 text-sm text-red-500 font-bold">৳{pkg.buy_price}</td>
                    <td className="p-4 text-sm text-green-600 font-bold">৳{pkg.sell_price}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${pkg.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => openModal(pkg)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(pkg.id, pkg.name)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No packages found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 text-[#0a1930]">
              {editingId ? 'Edit Package' : 'Add New Package'}
            </h2>
            
            <form onSubmit={handleSavePackage} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Brand Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Brand</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]"
                    required
                  >
                    {brands.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-1">Select Product</label>
                  <select 
                    value={formData.product_name}
                    onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                    className="w-full border border-blue-300 bg-blue-50 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]"
                    required
                  >
                    {currentProducts.length > 0 ? (
                      currentProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)
                    ) : (
                      <option value="">No Product Found</option>
                    )}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input 
                  type="text" required placeholder="e.g., 500 Diamond" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buy Price (৳)</label>
                  <input 
                    type="number" required placeholder="e.g., 40" 
                    value={formData.buy_price} onChange={(e) => setFormData({...formData, buy_price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sell Price (৳)</label>
                  <input 
                    type="number" required placeholder="e.g., 45" 
                    value={formData.sell_price} onChange={(e) => setFormData({...formData, sell_price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0052FF]"
                >
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

export default AdminPackages;