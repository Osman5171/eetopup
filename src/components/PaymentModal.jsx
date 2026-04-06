import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, amount, paymentMethod }) => {
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  if (!isOpen) return null;

  // Method onujayi rong o logo change hobe
  const isBkash = paymentMethod === 'bkash';
  const themeColor = isBkash ? 'bg-[#e2136e]' : 'bg-[#f7931e]'; // bKash pink, Nagad orange
  const title = isBkash ? 'bKash Payment' : 'Nagad Payment';

  const handleConfirm = (e) => {
    e.preventDefault();
    alert(`Payment Submitted!\nNumber: ${senderNumber}\nTrxID: ${trxId}\nAmount: ৳${amount}`);
    // Vobisshote ekhane Supabase database e order save korar code thakbe
    onClose();
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
            {/* Ekhane apnar admin number boshaben */}
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
              className={`w-full text-white font-bold rounded-lg p-3 mt-2 transition shadow-md ${themeColor} hover:opacity-90`}
            >
              Confirm Payment
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;