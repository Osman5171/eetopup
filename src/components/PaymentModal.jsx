import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, X } from 'lucide-react';
// নোটিফিকেশন পাঠানোর ইউটিলস
import { sendTelegramMessage, sendEmailNotification } from '../utils/notify';

const PaymentModal = ({ isOpen, onClose, amount, paymentMethod }) => {
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ডাইনামিক অ্যাডমিন নম্বরগুলোর জন্য স্টেট
  const [adminNumbers, setAdminNumbers] = useState({ bkash: 'Loading...', nagad: 'Loading...' });

  useEffect(() => {
    if (isOpen) {
      fetchAdminNumbers();
    }
  }, [isOpen]);

  const fetchAdminNumbers = async () => {
    const { data } = await supabase.from('settings').select('bkash_number, nagad_number').eq('id', 1).single();
    if (data) {
      setAdminNumbers({ bkash: data.bkash_number, nagad: data.nagad_number });
    }
  };

  if (!isOpen) return null;

  const isBkash = paymentMethod === 'bkash';
  const themeColor = isBkash ? 'bg-[#e2136e]' : 'bg-[#f7931e]'; 
  const title = isBkash ? 'bKash Payment' : 'Nagad Payment';
  const activeAdminNumber = isBkash ? adminNumbers.bkash : adminNumbers.nagad;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please login first!");
        setLoading(false);
        return;
      }

      // ১. ডাটাবেসে রিকোয়েস্ট সেভ
      const { error } = await supabase.from('deposits').insert({
        user_id: session.user.id,
        method: isBkash ? 'bKash' : 'Nagad',
        sender_number: senderNumber,
        trx_id: trxId,
        amount: amount,
        status: 'pending'
      });

      if (error) throw error;

      // ২. টেলিগ্রাম এবং ইমেইল নোটিফিকেশন পাঠানো
      const method = isBkash ? 'bKash' : 'Nagad';
      const telegramMsg = `💸 <b>New Deposit Request!</b>\n\n👤 <b>User:</b> ${session.user.email}\n💳 <b>Method:</b> ${method}\n📱 <b>Sender:</b> <code>${senderNumber}</code>\n📝 <b>TrxID:</b> <code>${trxId}</code>\n💰 <b>Amount:</b> ৳${amount}`;
      
      await sendTelegramMessage(telegramMsg);
      
      sendEmailNotification({
        user_email: session.user.email,
        package: `Add Money (${method})`,
        player_id: senderNumber,
        amount: amount
      });

      alert('Payment Request Submitted Successfully! ✅');
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className={`${themeColor} text-white px-5 py-4 flex justify-between items-center`}>
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-white hover:opacity-80 transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 md:p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-1 font-medium">নিচের নাম্বারে টাকা পাঠিয়ে তথ্য দিন</p>
            {/* ডাইনামিক নম্বর */}
            <p className="text-2xl font-black text-[#0a1930] tracking-wider mb-2">{activeAdminNumber}</p>
            <p className="text-sm font-semibold text-gray-500">পরিমাণ: <span className="text-red-500 font-bold">৳{amount}</span></p>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Sender Number</label>
              <input 
                type="text" 
                required
                placeholder="01XXXXXXXXX"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#0052FF] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Transaction ID</label>
              <input 
                type="text" 
                required
                placeholder="TrxID..."
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#0052FF] outline-none transition"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white font-bold rounded-lg p-3.5 mt-2 transition shadow-md flex justify-center items-center gap-2 ${themeColor} hover:brightness-95 disabled:opacity-70`}
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