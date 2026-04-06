import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, ShoppingCart, Loader2, Eye } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminOrders = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // ডাটাবেস থেকে অর্ডারগুলো আনা
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
    }
    if (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  // অর্ডার কমপ্লিট করার ফাংশন
  const handleComplete = async (id) => {
    if (!window.confirm('আপনি কি এই অর্ডারটি Complete করতে চান? গেম আইডিতে টপ-আপ দেওয়া হয়ে থাকলে OK চাপুন।')) return;
    setProcessingId(id);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;

      alert('Order marked as Completed! ✅');
      fetchOrders(); // লিস্ট রিফ্রেশ করা

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // অর্ডার ক্যানসেল এবং রিফান্ড করার ফাংশন
  const handleCancel = async (order) => {
    if (!window.confirm(`আপনি কি অর্ডারটি Cancel করতে চান? OK চাপলে ইউজারের ব্যালেন্সে ৳${order.amount} রিফান্ড হয়ে যাবে!`)) return;
    setProcessingId(order.id);

    try {
      // ১. অর্ডারের স্ট্যাটাস 'cancelled' করে দেওয়া
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // ২. ইউজারের বর্তমান ব্যালেন্স চেক করা
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', order.user_id)
        .single();

      // ৩. ক্যানসেল হওয়া টাকা ওয়ালেটে রিফান্ড করা
      const newBalance = Number(profile.balance || 0) + Number(order.amount);
      const { error: refundError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', order.user_id);

      if (refundError) throw refundError;

      alert('Order Cancelled & Amount Refunded Successfully! ❌');
      fetchOrders(); // লিস্ট রিফ্রেশ করা

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter(order => order.status === activeTab);

  return (
    <div className="animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1930] flex items-center gap-2">
            <ShoppingCart className="text-[#0052FF]" /> Manage Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">Complete or cancel user top-up orders</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Player ID..." 
            className="w-full border border-gray-300 rounded-lg pl-10 p-2 focus:ring-2 focus:ring-[#0052FF] outline-none text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-2 text-sm font-bold transition ${activeTab === 'pending' ? 'text-[#0052FF] border-b-2 border-[#0052FF]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-2 px-2 text-sm font-bold transition ${activeTab === 'completed' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Completed
        </button>
        <button 
          onClick={() => setActiveTab('cancelled')}
          className={`pb-2 px-2 text-sm font-bold transition ${activeTab === 'cancelled' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Cancelled
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Order Info</th>
                <th className="p-4 font-medium">User & Game ID</th>
                <th className="p-4 font-medium">Package</th>
                <th className="p-4 font-medium">Amount & Method</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2" size={24}/> Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 transition">
                    
                    <td className="p-4">
                      <p className="font-bold text-[#0a1930] text-sm">#EE-{order.id}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </td>
                    
                    <td className="p-4">
                      <p className="font-bold text-[#0a1930] text-sm">{order.profiles?.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-blue-600 font-semibold bg-blue-100 inline-block px-2 py-0.5 rounded mt-1">
                        ID: {order.player_id}
                      </p>
                    </td>
                    
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{order.package_name}</p>
                    </td>
                    
                    <td className="p-4">
                      <p className="text-sm font-bold text-[#0a1930]">৳{order.amount}</p>
                      <p className="text-xs text-gray-500 capitalize">{order.payment_method}</p>
                    </td>
                    
                    <td className="p-4 text-right flex justify-end gap-2">
                      {activeTab === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleComplete(order.id)}
                            disabled={processingId === order.id}
                            className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition disabled:opacity-50" 
                            title="Complete Order"
                          >
                            {processingId === order.id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14} />} Complete
                          </button>
                          <button 
                            onClick={() => handleCancel(order)}
                            disabled={processingId === order.id}
                            className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition disabled:opacity-50" 
                            title="Cancel & Refund"
                          >
                            {processingId === order.id ? <Loader2 size={14} className="animate-spin"/> : <XCircle size={14} />} Cancel
                          </button>
                        </>
                      ) : (
                         <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg ${order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                           {order.status === 'completed' ? <CheckCircle size={14}/> : <XCircle size={14}/>} 
                           {order.status.toUpperCase()}
                         </span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No {activeTab} orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminOrders;