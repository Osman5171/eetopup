import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, CreditCard, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminDeposits = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  // ডাটাবেস থেকে ডিপোজিট রিকোয়েস্টগুলো আনা
  const fetchDeposits = async () => {
    setLoading(true);
    // deposits টেবিল থেকে ডাটা আনবে এবং সাথে profiles টেবিল থেকে ইউজারের নাম ও ফোন নাম্বার আনবে
    const { data, error } = await supabase
      .from('deposits')
      .select(`
        *,
        profiles:user_id (full_name, phone)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setDeposits(data);
    }
    if (error) {
      console.error("Error fetching deposits:", error);
    }
    setLoading(false);
  };

  // ডিপোজিট Approve করার ফাংশন
  const handleApprove = async (deposit) => {
    if (!window.confirm(`আপনি কি ৳${deposit.amount} ব্যালেন্স অ্যাড করতে চান?`)) return;
    setProcessingId(deposit.id);

    try {
      // ১. ইউজারের বর্তমান ব্যালেন্স চেক করা
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', deposit.user_id)
        .single();

      const newBalance = Number(profile.balance || 0) + Number(deposit.amount);

      // ২. ইউজারের ব্যালেন্স আপডেট করা
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', deposit.user_id);

      if (profileError) throw profileError;

      // ৩. ডিপোজিটের স্ট্যাটাস 'approved' করে দেওয়া
      const { error: depositError } = await supabase
        .from('deposits')
        .update({ status: 'approved' })
        .eq('id', deposit.id);

      if (depositError) throw depositError;

      alert('Deposit Approved & Balance Added Successfully! ✅');
      fetchDeposits(); // লিস্ট রিফ্রেশ করা

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // ডিপোজিট Reject করার ফাংশন
  const handleReject = async (id) => {
    if (!window.confirm(`আপনি কি এই রিকোয়েস্টটি বাতিল করতে চান?`)) return;
    setProcessingId(id);

    try {
      const { error } = await supabase
        .from('deposits')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      
      alert('Deposit Request Rejected! ❌');
      fetchDeposits(); // লিস্ট রিফ্রেশ করা
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // এক্টিভ ট্যাবের ওপর ভিত্তি করে ফিল্টার করা
  const filteredDeposits = deposits.filter(dep => dep.status === activeTab);

  return (
    <div className="animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1930] flex items-center gap-2">
            <CreditCard className="text-[#0052FF]" /> Manage Deposits
          </h1>
          <p className="text-gray-500 text-sm mt-1">Approve or reject user add money requests</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by TrxID..." 
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
          onClick={() => setActiveTab('approved')}
          className={`pb-2 px-2 text-sm font-bold transition ${activeTab === 'approved' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Approved
        </button>
        <button 
          onClick={() => setActiveTab('rejected')}
          className={`pb-2 px-2 text-sm font-bold transition ${activeTab === 'rejected' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Rejected
        </button>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">User Info</th>
                <th className="p-4 font-medium">Payment Method</th>
                <th className="p-4 font-medium">Sender & TrxID</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2" size={24}/> Loading deposits...
                  </td>
                </tr>
              ) : filteredDeposits.length > 0 ? (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-blue-50/50 transition">
                    
                    <td className="p-4">
                      <p className="font-bold text-[#0a1930] text-sm">{dep.profiles?.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{new Date(dep.created_at).toLocaleString()}</p>
                    </td>
                    
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        dep.method === 'bKash' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {dep.method}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{dep.sender_number}</p>
                      <p className="text-xs text-blue-600 font-mono font-semibold bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1">
                        Trx: {dep.trx_id}
                      </p>
                    </td>
                    
                    <td className="p-4">
                      <p className="text-sm font-black text-green-600">৳{dep.amount}</p>
                    </td>
                    
                    <td className="p-4 text-right flex justify-end gap-2">
                      {activeTab === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleApprove(dep)}
                            disabled={processingId === dep.id}
                            className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition disabled:opacity-50" 
                            title="Approve"
                          >
                            {processingId === dep.id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14} />} Approve
                          </button>
                          <button 
                            onClick={() => handleReject(dep.id)}
                            disabled={processingId === dep.id}
                            className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition disabled:opacity-50" 
                            title="Reject"
                          >
                            {processingId === dep.id ? <Loader2 size={14} className="animate-spin"/> : <XCircle size={14} />} Reject
                          </button>
                        </>
                      ) : (
                         <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                           {dep.status === 'approved' ? <CheckCircle size={14} className="text-green-600"/> : <XCircle size={14} className="text-red-600"/>} 
                           {dep.status.toUpperCase()}
                         </span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No {activeTab} deposits found.
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

export default AdminDeposits;