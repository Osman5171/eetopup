import React, { useState } from 'react';
import PaymentModal from '../components/PaymentModal'; // Notun modal import kora holo

const Topup = () => {
  const [selectedPackage, setSelectedPackage] = useState(1); // Default vabe 1 no package select thakbe
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal control korar state

  // Dummy Packages Data (Pore Admin panel theke ashbe)
  const packages = [
    { id: 1, name: '25 Diamond', price: 23 },
    { id: 2, name: '50 Diamond', price: 37 },
    { id: 3, name: '115 Diamond', price: 77 },
    { id: 4, name: '240 Diamond', price: 155 },
    { id: 5, name: '315 Diamond', price: 215 },
    { id: 6, name: '405 Diamond', price: 265 },
  ];

  // Je package select kora ache tar daam ber kora
  const currentPrice = packages.find(p => p.id === selectedPackage)?.price || 0;

  // Buy Now button a click korle ki hobe tar function
  const handleBuyNow = () => {
    if (paymentMethod === 'instant') {
      setIsModalOpen(true); // Instant pay hole bKash/Nagad modal open hobe
    } else {
      alert(`Wallet theke ৳${currentPrice} কাটা হবে এবং Order complete হবে!`);
    }
  };

  return (
    <div className="w-full mt-6 relative">
      
      {/* Product Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-4 mb-6">
        <img 
          src="https://eagleeyetopup.com/ff.png" 
          alt="Diamond Top Up" 
          className="w-16 h-16 rounded object-cover bg-[#0a1930]"
        />
        <div>
          <h1 className="text-xl font-bold text-[#0a1930]">Diamond Top Up</h1>
          <p className="text-sm text-gray-500">Game / Top up</p>
        </div>
      </div>

      {/* Main Content Grid (Left & Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Select Recharge & Rules */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* 1. Select Recharge Section */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Select Recharge
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packages.map((pkg) => (
                <div 
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`border rounded-md p-3 flex justify-between items-center cursor-pointer transition ${
                    selectedPackage === pkg.id ? 'border-[#0052FF] bg-blue-50' : 'border-gray-200 hover:border-[#0052FF]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border ${selectedPackage === pkg.id ? 'border-[5px] border-[#0052FF]' : 'border-gray-300'}`}></div>
                    <span className="text-sm font-medium text-gray-700">{pkg.name}</span>
                  </div>
                  <span className="text-[#FF5722] font-bold text-sm">{pkg.price} TK</span>
                </div>
              ))}
            </div>
            
            <a href="#" className="text-pink-500 text-sm flex items-center gap-1 mt-4 hover:underline">
              <span>🔗</span> কিভাবে অর্ডার করবেন?
            </a>
          </div>

          {/* Rules & Conditions Section */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] border-b pb-3 mb-4">Rules & Conditions</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-2"><span>⦿</span> শুধুমাত্র Bangladesh, Nepal সার্ভারে ID Code দিয়ে টপ আপ হবে</li>
              <li className="flex gap-2"><span>⦿</span> Player ID ভুল দিয়ে Diamond না পেলে EAGLE EYE কর্তৃপক্ষ দায়ী নয়</li>
              <li className="flex gap-2"><span>⦿</span> Order কমপ্লিট হওয়ার পরেও আইডিতে ডায়মন্ড না গেলে চেক করার জন্য ID Pass দিতে হবে</li>
            </ul>
          </div>

        </div>

        {/* Right Column: Account Info & Payment */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* 2. Account Info Section */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Account Info
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">এখানে গেমের আইডি কোড দিন</label>
              <input 
                type="text" 
                placeholder="এখানে গেমের আইডি কোড দিন" 
                className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#0052FF]"
              />
            </div>
            <button className="w-full bg-[#0052FF] text-white rounded p-2 text-sm font-bold hover:bg-blue-700 transition">
              আপনার গেম আইডির নাম চেক করুন
            </button>
          </div>

          {/* 3. Payment Option Section */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Select one option
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Wallet Pay */}
              <div 
                onClick={() => setPaymentMethod('wallet')}
                className={`border rounded-lg cursor-pointer overflow-hidden transition ${paymentMethod === 'wallet' ? 'border-[#0052FF] ring-1 ring-[#0052FF]' : 'border-gray-200'}`}
              >
                <div className="p-4 flex justify-center h-20 items-center">
                  <img src="https://eagleeyetopup.com/logo.png" alt="Wallet" className="h-10" />
                </div>
                <div className="bg-gray-200 text-center text-xs py-1 text-gray-700 font-bold">Wallet Pay</div>
              </div>

              {/* Instant Pay */}
              <div 
                onClick={() => setPaymentMethod('instant')}
                className={`border rounded-lg cursor-pointer overflow-hidden transition ${paymentMethod === 'instant' ? 'border-[#0052FF] ring-1 ring-[#0052FF]' : 'border-gray-200'}`}
              >
                <div className="p-4 flex justify-center h-20 items-center gap-2">
                  <img src="https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png" alt="bKash" className="h-6" />
                  <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-6" />
                </div>
                <div className="bg-gray-200 text-center text-xs py-1 text-gray-700 font-bold">Instant Pay</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <p className="flex items-center gap-2">
                <span>ℹ️</span> আপনার একাউন্ট ব্যালেন্স <span className="text-[#0052FF] font-bold">৳ 7294.00</span>
              </p>
              <p className="flex items-center gap-2">
                {/* Ekhane currentPrice variable use kora hoyeche */}
                <span>ℹ️</span> প্রোডাক্টটি কিনতে আপনার প্রয়োজন <span className="text-[#0052FF] font-bold">৳ {currentPrice}</span>
              </p>
            </div>

            {/* Buy Now button a onClick event add kora hoyeche */}
            <button 
              onClick={handleBuyNow} 
              className="w-full bg-[#0052FF] text-white rounded-lg p-3 font-bold text-lg hover:bg-blue-700 transition shadow-md"
            >
              Buy Now
            </button>
          </div>

        </div>

      </div>

      {/* Payment Modal ekdom niche call kora holo */}
      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        amount={currentPrice}
        paymentMethod="bkash" 
      />

    </div>
  );
};

export default Topup;