import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, amount, paymentMethod }) => {
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isBkash = paymentMethod === 'bkash';
  const themeColor = isBkash ? 'bg-[#e2136e]' : 'bg-[#f7931e]'; 
  const title = isBkash ? 'bKash Payment' : 'Nagad Payment';

  // ডাটাবেসে পেমেন্ট রিকোয়েস্ট পাঠানোর ফাংশন
  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ১. চেক করবে ইউজার লগিন করা আছে কিনা
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please login first to add money!");
        setLoading(false);
        return;
      }

      // ২. ডাটাবেসের 'deposits' টেবিলে রিকোয়েস্ট সেভ করা
      const { error } = await supabase.from('deposits').insert({
        user_id: session.user.id,
        method: isBkash ? 'bKash' : 'Nagad',
        sender_number: senderNumber,
        trx_id: trxId,
        amount: amount,
        status: 'pending' // ডিফল্টভাবে pending থাকবে, অ্যাডমিন পরে এক্সেপ্ট করবে
      });

      if (error) throw error;

      alert('Payment Request Submitted! Admin will verify and add balance soon. ✅');
      
      // ফর্ম ক্লিয়ার করে মোডাল বন্ধ করে দেওয়া
      setSenderNumber('');
      setTrxId('');
      onClose();

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Modal Header */}
        <div className={`${themeColor} text-white px-5 py-4 flex justify-between items-center`}>
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-1">Please Send Money to this number</p>
            {/* এখানে আপনার ওয়েবসাইটের অ্যাডমিন নাম্বারটি বসাবেন */}
            <p className="text-2xl font-bold text-[#0a1930] tracking-wider mb-2">017XX-XXXXXX</p>
            <p className="text-sm font-semibold text-gray-500">Amount: <span className="text-red-500 font-bold">৳{amount}</span></p>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Account Number</label>
              <input 
                type="text" 
                required
                placeholder="01XXXXXXXXX"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#0052FF] focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
              <input 
                type="text" 
                required
                placeholder="TrxID..."
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#0052FF] focus:border-transparent outline-none transition"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white font-bold rounded-lg p-3 mt-2 transition shadow-md flex justify-center items-center gap-2 ${themeColor} hover:opacity-90 disabled:opacity-70`}
            >
              {loading ? <Loader2 size={20} className="animate-spin"/> : 'Confirm Payment'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;