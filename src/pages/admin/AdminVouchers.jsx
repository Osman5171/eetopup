import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [bulkCodes, setBulkCodes] = useState('');

  // Unipin Auto-Detection Logic
  const detectVoucherType = (code) => {
    const prefix = code.substring(0, 6).toUpperCase();
    
    switch (prefix) {
      // 20 UP
      case 'BDMB-T': return '20 UP (BDMB)';
      case 'UPBD-Q': return '20 UP (UPBD)';
      // 36 UP
      case 'BDMB-U': return '36 UP (BDMB)';
      case 'UPBD-R': return '36 UP (UPBD)';
      // 80 UP
      case 'BDMB-J': return '80 UP (BDMB)';
      case 'UPBD-G': return '80 UP (UPBD)';
      // 160 UP
      case 'BDMB-I': return '160 UP (BDMB)';
      case 'UPBD-F': return '160 UP (UPBD)';
      // 161 UP
      case 'BDMB-Q': return '161 UP (BDMB)';
      case 'UPBD-N': return '161 UP (UPBD)';
      // 405 UP
      case 'BDMB-K': return '405 UP (BDMB)';
      case 'UPBD-H': return '405 UP (UPBD)';
      // 800 UP
      case 'BDMB-S': return '800 UP (BDMB)';
      case 'UPBD-P': return '800 UP (UPBD)';
      // 810 UP
      case 'BDMB-L': return '810 UP (BDMB)';
      case 'UPBD-I': return '810 UP (UPBD)';
      // 1625 UP
      case 'BDMB-M': return '1625 UP (BDMB)';
      case 'UPBD-J': return '1625 UP (UPBD)';
      // 2000 UP
      case 'UPBD-7': return '2000 UP (UPBD)';
      
      // Default / Unknown
      default: return 'Default Voucher';
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    // Group by type to show stock
    const { data, error } = await supabase.from('vouchers').select('*');
    if (data) setVouchers(data);
    setLoading(false);
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    if (!bulkCodes.trim()) return alert("Please paste some codes first!");
    
    setAdding(true);
    // Split by new line, remove empty lines and spaces
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

  // Stock Calculation
  const stockCounts = vouchers.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = { available: 0, sold: 0 };
    acc[curr.type][curr.status]++;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Ticket className="text-[#0052FF]" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-[#0a1930]">Voucher Stock</h1>
          <p className="text-gray-500 text-sm">Auto-detects Unipin types based on prefix</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Bulk Upload Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1 h-fit">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Add Bulk Vouchers</h2>
          <form onSubmit={handleBulkAdd}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Codes Here (One per line)
            </label>
            <textarea 
              rows="10" 
              value={bulkCodes}
              onChange={(e) => setBulkCodes(e.target.value)}
              placeholder="BDMB-T-S-02059853 8365-9942-9479-5443&#10;UPBD-Q-S-02000257 4795-7935-5464-6476"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0052FF] text-sm font-mono"
            ></textarea>
            
            <button disabled={adding} type="submit" className="mt-4 w-full bg-[#0052FF] text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2">
              {adding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} 
              {adding ? 'Processing...' : 'Upload Vouchers'}
            </button>
          </form>
        </div>

        {/* Right: Stock Summary & List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Stock Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.keys(stockCounts).map(type => (
              <div key={type} className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                <h3 className="font-bold text-[#0a1930] text-sm mb-1">{type}</h3>
                <p className="text-2xl font-black text-[#0052FF]">{stockCounts[type].available} <span className="text-xs font-normal text-gray-500">Available</span></p>
                <p className="text-xs text-red-500 font-medium mt-1">{stockCounts[type].sold} Sold</p>
              </div>
            ))}
          </div>

          {/* Table of all vouchers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-y-auto max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Voucher Code</th>
                    <th className="p-4 font-medium">Detected Type</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline" /> Loading...</td></tr>
                  ) : vouchers.length > 0 ? (
                    vouchers.slice().reverse().map(v => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm font-mono font-medium text-gray-800">{v.code}</td>
                        <td className="p-4 text-xs font-bold text-[#0052FF]">{v.type}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${v.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                           <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-400">No vouchers uploaded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminVouchers;