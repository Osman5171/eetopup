import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminOrders = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      // Database schema onujayi shudhu full_name ebong phone select kora hocche
      .select(`
        *,
        profiles:user_id (full_name, phone)
      `)
      .order('created_at', { ascending: false });
      
    if (data) setOrders(data);
    if (error) console.error("Error fetching admin orders:", error);
    setLoading(false);
  };

  const handleComplete = async (order) => {
    const isVoucherOrder = order.package_name.toLowerCase().includes('voucher') || order.package_name.toLowerCase().includes('unipin');
    let manualCode = null;
    
    if (isVoucherOrder) {
        manualCode = window.prompt('দয়া করে ভাউচার কোডটি দিন:\n(কোড না থাকলে ফাঁকা রেখে OK চাপুন)');
        if (manualCode === null) return;
    } else {
        if (!window.confirm('অর্ডারটি Complete হিসেবে মার্ক করতে চান? OK চাপুন।')) return;
    }

    setProcessingId(order.id);
    try {
      const updateData = { status: 'completed' };
      if (manualCode && manualCode.trim() !== '') {
          updateData.voucher_code = manualCode; 
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;
      alert('Order marked as Completed! ✅');
      fetchOrders(); 
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (order) => {
    if (!window.confirm(`অর্ডারটি Cancel করতে চান? OK চাপলে ইউজারের ব্যালেন্সে ৳${order.amount} ফেরত যাবে!`)) return;
    
    setProcessingId(order.id);
    try {
      const { error: orderError } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      if (orderError) throw orderError;

      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', order.user_id).single();
      const newBalance = Number(profile.balance || 0) + Number(order.amount);
      
      const { error: refundError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', order.user_id);
      if (refundError) throw refundError;

      alert('Order Cancelled & Amount Refunded Successfully! ✅');
      fetchOrders(); 
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = order.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = String(order.id).toLowerCase().includes(searchLower) || 
                          (order.player_id && order.player_id.toLowerCase().includes(searchLower)) ||
                          (order.profiles?.full_name && order.profiles.full_name.toLowerCase().includes(searchLower));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1930] flex items-center gap-2">
            <ShoppingCart className="text-[#0052FF]" /> Manage Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">Complete or cancel user top-up orders</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ID, Name or Player ID..." className="w-full border border-gray-300 rounded-lg pl-10 p-2 focus:ring-2 focus:ring-[#0052FF] outline-none text-sm font-medium"/>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
        <button onClick={() => setActiveTab('pending')} className={`pb-2 px-2 text-sm font-bold transition whitespace-nowrap ${activeTab === 'pending' ? 'text-[#0052FF] border-b-2 border-[#0052FF]' : 'text-gray-500 hover:text-gray-700'}`}>Pending Orders</button>
        <button onClick={() => setActiveTab('completed')} className={`pb-2 px-2 text-sm font-bold transition whitespace-nowrap ${activeTab === 'completed' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>Completed</button>
        <button onClick={() => setActiveTab('cancelled')} className={`pb-2 px-2 text-sm font-bold transition whitespace-nowrap ${activeTab === 'cancelled' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Cancelled</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="p-4 font-bold">Order ID & Date</th>
                <th className="p-4 font-bold">User Support Info</th>
                <th className="p-4 font-bold">Package & ID</th>
                {activeTab === 'completed' && <th className="p-4 font-bold text-purple-600">Delivered Code</th>}
                <th className="p-4 font-bold">Buy / Sale</th>
                <th className="p-4 font-bold">Profit</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-[#0052FF]"><Loader2 className="animate-spin inline-block mr-2" size={24}/> Loading...</td></tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const buyPrice = Number(order.buy_price || 0);
                  const salePrice = Number(order.amount || 0);
                  const profit = salePrice - buyPrice;

                  return (
                    <tr key={order.id} className="hover:bg-blue-50/50 transition">
                      <td className="p-4">
                        <p className="font-black text-[#0052FF] text-sm">#{order.id}</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{new Date(order.created_at).toLocaleString('en-GB')}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#0a1930] text-sm">{order.profiles?.full_name || 'Unknown User'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{order.profiles?.phone || 'No Contact'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-800">{order.package_name}</p>
                        <p className="text-xs text-purple-600 font-bold bg-purple-50 inline-block px-2 py-0.5 rounded mt-1 border border-purple-100">
                          {order.player_id}
                        </p>
                      </td>
                      
                      {activeTab === 'completed' && (
                        <td className="p-4">
                          <div className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 p-1.5 rounded border border-purple-100 whitespace-pre-wrap max-w-[150px] overflow-hidden text-ellipsis">
                            {order.voucher_code || '-'}
                          </div>
                        </td>
                      )}

                      <td className="p-4 text-xs font-bold">
                        <span className="text-red-500">৳{buyPrice}</span> / <span className="text-green-600">৳{salePrice}</span>
                      </td>
                      <td className="p-4 text-sm font-black text-blue-600">৳{profit > 0 ? profit : 0}</td>
                      <td className="p-4 text-right flex justify-end gap-2 items-center h-full pt-5">
                        {activeTab === 'pending' ? (
                          <>
                            <button onClick={() => handleComplete(order)} disabled={processingId === order.id} className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition shadow-sm">
                              {processingId === order.id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14} />} Complete
                            </button>
                            <button onClick={() => handleCancel(order)} disabled={processingId === order.id} className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-1 transition shadow-sm">
                              {processingId === order.id ? <Loader2 size={14} className="animate-spin"/> : <XCircle size={14} />} Cancel
                            </button>
                          </>
                        ) : (
                           <span className={`flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-lg uppercase shadow-sm border ${order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                             {order.status === 'completed' ? <CheckCircle size={14}/> : <XCircle size={14}/>} {order.status}
                           </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500 font-medium">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;