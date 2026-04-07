import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, X, Zap } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, amount, paymentMethod }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isBkash = paymentMethod === 'bkash';
  const themeColor = isBkash ? 'bg-[#e2136e]' : 'bg-[#f7931e]'; 
  const title = "Auto Add Money";

  const handlePayNow = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please login first!");
        setLoading(false);
        return;
      }

      // 1. User er details niye asha (payment gateway te lagbe)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', session.user.id)
        .single();

      // 2. Supabase Edge Function call kora (create-payment)
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: amount,
          fullName: profile?.full_name || 'Gamer',
          email: session.user.email,
          userId: session.user.id
        }
      });

      if (error) {
        throw new Error("Payment initialization failed!");
      }

      // 3. UddoktaPay theke URL asle sekane redirect kora
      if (data && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Failed to get payment link. Try again.");
      }

    } catch (error) {
      console.error(error);
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
          <h3 className="font-bold text-lg flex items-center gap-2"><Zap size={20}/> {title}</h3>
          <button onClick={onClose} className="text-white hover:opacity-80 transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-2 font-medium">Auto Payment Gateway via UddoktaPay</p>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 inline-block w-full">
               <p className="text-sm text-gray-500 mb-1">Total Payable Amount</p>
               <p className="text-3xl font-black text-[#0a1930] tracking-wider">৳{amount}</p>
            </div>
            <p className="text-xs text-green-600 font-bold mt-4 bg-green-50 p-2 rounded-lg inline-block">
              Payment korar sathe sathei auto balance add hobe!
            </p>
          </div>

          <button 
            onClick={handlePayNow} 
            disabled={loading}
            className={`w-full text-white font-bold rounded-xl p-4 transition shadow-lg flex justify-center items-center gap-2 ${themeColor} hover:brightness-95 disabled:opacity-70`}
          >
            {loading ? (
              <> <Loader2 size={20} className="animate-spin"/> Processing... </>
            ) : (
              'Pay Now & Add Balance'
            )}
          </button>

          <p className="text-[10px] text-gray-400 mt-4 text-center">Secure Payment Processed by UddoktaPay</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;