import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Loader2, Trash2, ArrowLeft, CheckCircle, XCircle, Box } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const UNIPIN_TYPES = [
  '20 UP', '36 UP', '80 UP', '160 UP', '161 UP', 
  '405 UP', '800 UP', '810 UP', '1625 UP', '2000 UP'
];

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bulkCodes, setBulkCodes] = useState('');
  
  // 👈 Card Click Track
  const [selectedType, setSelectedType] = useState(null);

  const detectVoucherType = (code) => {
    const prefix = code.substring(0, 6).toUpperCase();
    switch (prefix) {
      case 'BDMB-T': case 'UPBD-Q': return '20 UP';
      case 'BDMB-U': case 'UPBD-R': return '36 UP';
      case 'BDMB-J': case 'UPBD-G': return '80 UP';
      case 'BDMB-I': case 'UPBD-F': return '160 UP';
      case 'BDMB-Q': case 'UPBD-N': return '161 UP';
      case 'BDMB-K': case 'UPBD-H': return '405 UP';
      case 'BDMB-S': case 'UPBD-P': return '800 UP';
      case 'BDMB-L': case 'UPBD-I': return '810 UP';
      case 'BDMB-M': case 'UPBD-J': return '1625 UP';
      case 'UPBD-7': return '2000 UP';
      default: return 'Other Vouchers';
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
    if (data) setVouchers(data);
    setLoading(false);
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    if (!bulkCodes.trim()) return alert("Please paste some codes first!");
    
    setAdding(true);
    const lines = bulkCodes.split('\n').map(line => line.trim()).filter(line => line !== '');
    
    const vouchersToInsert = lines.map(line => {
      const type = detectVoucherType(line);
      return { code: line, type: type, status: 'available' };
    });

    try {
      const { error } = await supabase.from('vouchers').insert(vouchersToInsert);
      if (error) throw error;
      alert(`Successfully added ${vouchersToInsert.length} vouchers! ✅`);
      setBulkCodes('');
      setIsAddModalOpen(false);
      fetchVouchers();
    } catch (error) {
      alert("Error adding vouchers: " + error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this voucher?")) return;
    await supabase.from('vouchers').delete().eq('id', id);
    fetchVouchers();
  };

  // 👈 Mark as Used / Available
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    await supabase.from('vouchers').update({ status: newStatus }).eq('id', id);
    fetchVouchers();
  };

  // Stock Calculation (Initialize with 10 fixed types)
  const stockCounts = {};
  UNIPIN_TYPES.forEach(type => stockCounts[type] = { available: 0, sold: 0 });
  
  vouchers.forEach(v => {
    if(!stockCounts[v.type]) stockCounts[v.type] = { available: 0, sold: 0 };
    stockCounts[v.type][v.status]++;
  });

  const selectedVouchers = selectedType ? vouchers.filter(v => v.type === selectedType) : [];

  return (
    <div className="animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1930] flex items-center gap-2">
            <Ticket className="text-[#0052FF]" /> Voucher Stock
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage Unipin voucher inventory</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#0052FF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-md whitespace-nowrap">
          <Plus size={18} /> Add Bulk Vouchers
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#0052FF]" size={40} /></div>
      ) : selectedType === null ? (
        
        /* 👈 Main View: 10 Cards */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.keys(stockCounts).map(type => (
            <div 
              key={type} 
              onClick={() => setSelectedType(type)}
              className="bg-white border border-gray-200 p-5 rounded-xl text-center cursor-pointer hover:border-[#0052FF] hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition"><Box size={80}/></div>
              <h3 className="font-bold text-[#0a1930] text-sm mb-2">{type} Voucher</h3>
              
              <div className="flex justify-center items-end gap-1">
                <span className={`text-3xl font-black ${stockCounts[type].available > 0 ? 'text-[#0052FF]' : 'text-gray-300'}`}>
                  {stockCounts[type].available}
                </span>
                <span className="text-xs font-medium text-gray-500 mb-1.5">Stock</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                 <span>Sold: <span className="text-red-500">{stockCounts[type].sold}</span></span>
                 <span className="text-[#0052FF] group-hover:underline">Manage ➔</span>
              </div>
            </div>
          ))}
        </div>

      ) : (

        /* 👈 Detail View: Code List for specific card */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <button onClick={() => setSelectedType(null)} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-gray-100 transition"><ArrowLeft size={16}/></button>
               <h2 className="text-lg font-bold text-[#0a1930]">{selectedType} Vouchers</h2>
             </div>
             <div className="text-sm font-bold text-gray-500 bg-white px-3 py-1.5 rounded-lg border">
                Total: {selectedVouchers.length} (Avail: {stockCounts[selectedType].available} / Sold: {stockCounts[selectedType].sold})
             </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Voucher Code</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedVouchers.length > 0 ? (
                  selectedVouchers.map(v => (
                    <tr key={v.id} className="hover:bg-blue-50/50 transition">
                      <td className="p-4 font-mono font-medium text-sm text-gray-800">{v.code}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${v.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                         {v.status === 'available' ? (
                            <button onClick={() => handleToggleStatus(v.id, v.status)} className="bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                               <CheckCircle size={14}/> Mark as Used
                            </button>
                         ) : (
                            <button onClick={() => handleToggleStatus(v.id, v.status)} className="bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                               <XCircle size={14}/> Mark Available
                            </button>
                         )}
                         <button onClick={() => handleDelete(v.id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-1.5 rounded-lg transition" title="Delete">
                            <Trash2 size={16}/>
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="p-8 text-center text-gray-400 font-medium">No codes available in this package.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bulk Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 text-[#0a1930] border-b pb-3">➕ Add Bulk Vouchers</h2>
            <form onSubmit={handleBulkAdd}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paste Codes Here (System will auto-categorize them)</label>
              <textarea 
                rows="8" value={bulkCodes} onChange={(e) => setBulkCodes(e.target.value)} required
                placeholder="BDMB-T-S-02059853 8365-9942-9479-5443&#10;UPBD-Q-S-02000257 4795-7935-5464-6476"
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0052FF] text-sm font-mono whitespace-pre"
              ></textarea>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button disabled={adding} type="submit" className="flex-1 bg-[#0052FF] text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2">
                  {adding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} {adding ? 'Uploading...' : 'Upload Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminVouchers;