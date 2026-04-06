import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const Topup = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [playerId, setPlayerId] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    // ১. ইউজার চেক করা এবং ব্যালেন্স আনা
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
      if (profile) setUserBalance(profile.balance);
    }

    // ২. ডাটাবেস থেকে প্যাকেজগুলো আনা
    const { data: pkgs } = await supabase
      .from('packages')
      .select('*')
      .eq('status', 'Active')
      .order('sell_price', { ascending: true });

    if (pkgs && pkgs.length > 0) {
      setPackages(pkgs);
      setSelectedPackage(pkgs[0].id); // প্রথমটা ডিফল্ট সিলেক্ট থাকবে
    }
    setLoading(false);
  };

  const currentPkg = packages.find(p => p.id === selectedPackage);
  const currentPrice = currentPkg?.sell_price || 0;

  // Buy Now বাটনের ফাংশন
  const handleBuyNow = async () => {
    if (!playerId) return alert("দয়া করে আপনার Player ID দিন!");
    if (!selectedPackage) return alert("দয়া করে একটি প্যাকেজ সিলেক্ট করুন!");
    if (!user) {
      alert("অর্ডার করতে হলে আগে লগিন করতে হবে!");
      return navigate('/auth');
    }

    if (paymentMethod === 'instant') {
      setIsModalOpen(true); // Instant pay হলে bKash/Nagad Modal ওপেন হবে
    } else {
      // Wallet Payment লজিক
      if(window.confirm(`আপনি কি ৳${currentPrice} দিয়ে ${currentPkg.name} কিনতে চান?`)) {
        setProcessing(true);

        // ব্যালেন্স চেক
        if (userBalance < currentPrice) {
          alert("আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই! দয়া করে Add Money করুন।");
          setProcessing(false);
          return;
        }

        // ১. ব্যালেন্স কাটা
        const newBalance = userBalance - currentPrice;
        await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);

        // ২. ডাটাবেসে অর্ডার সেভ করা
        const { error } = await supabase.from('orders').insert({
          user_id: user.id,
          package_name: currentPkg.name,
          player_id: playerId,
          amount: currentPrice,
          payment_method: 'Wallet',
          status: 'pending' 
        });

        if (!error) {
          alert("আপনার অর্ডারটি সফলভাবে প্লেস করা হয়েছে! ✅");
          navigate('/profile'); // অর্ডার শেষে প্রোফাইল পেজে নিয়ে যাবে
        } else {
          alert("Error: " + error.message);
        }
        setProcessing(false);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-[#0052FF]" size={40}/></div>;
  }

  return (
    <div className="w-full mt-6 relative animate-fade-in-up">
      
      {/* Product Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-4 mb-6">
        <img 
          src="https://eagleeyetopup.com/ff.png" 
          alt="Diamond Top Up" 
          className="w-16 h-16 rounded object-cover bg-[#0a1930]"
        />
        <div>
          <h1 className="text-xl font-bold text-[#0a1930]">Free Fire Top Up</h1>
          <p className="text-sm text-gray-500">Player ID Code</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Select Recharge */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Select Recharge
            </h2>
            
            {packages.length === 0 ? (
              <p className="text-red-500 text-center py-4">No active packages found!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`border rounded-md p-3 flex justify-between items-center cursor-pointer transition ${
                      selectedPackage === pkg.id ? 'border-[#0052FF] bg-blue-50 ring-1 ring-[#0052FF]' : 'border-gray-200 hover:border-[#0052FF]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border ${selectedPackage === pkg.id ? 'border-[5px] border-[#0052FF]' : 'border-gray-300'}`}></div>
                      <span className="text-sm font-medium text-gray-700">{pkg.name}</span>
                    </div>
                    <span className="text-[#FF5722] font-bold text-sm">৳{pkg.sell_price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] border-b pb-3 mb-4">Rules & Conditions</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-2"><span>⦿</span> শুধুমাত্র Bangladesh সার্ভারে ID Code দিয়ে টপ আপ হবে।</li>
              <li className="flex gap-2"><span>⦿</span> Player ID ভুল দিয়ে Diamond না পেলে কর্তৃপক্ষ দায়ী নয়।</li>
            </ul>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Account Info */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Account Info
            </h2>
            <div className="mb-2">
              <input 
                type="number" 
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="এখানে Player ID দিন..." 
                className="w-full border border-gray-300 rounded p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] font-bold tracking-wider"
              />
            </div>
          </div>

          {/* Payment Option */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Payment Option
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div 
                onClick={() => setPaymentMethod('wallet')}
                className={`border rounded-lg cursor-pointer overflow-hidden transition ${paymentMethod === 'wallet' ? 'border-[#0052FF] ring-2 ring-[#0052FF] shadow-md' : 'border-gray-200 opacity-70 hover:opacity-100'}`}
              >
                <div className="p-4 flex justify-center h-16 items-center">
                  <span className="font-black text-[#0a1930] flex items-center gap-2">👛 Wallet Pay</span>
                </div>
                <div className="bg-gray-100 text-center text-xs py-1.5 text-gray-700 font-bold border-t">My Balance</div>
              </div>

              <div 
                onClick={() => setPaymentMethod('instant')}
                className={`border rounded-lg cursor-pointer overflow-hidden transition ${paymentMethod === 'instant' ? 'border-[#0052FF] ring-2 ring-[#0052FF] shadow-md' : 'border-gray-200 opacity-70 hover:opacity-100'}`}
              >
                <div className="p-4 flex justify-center h-16 items-center gap-3 bg-gray-50">
                  <img src="https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png" alt="bKash" className="h-6" />
                  <img src="https://freelogopng.com/images/all_img/1679248787Nagad-Logo.png" alt="Nagad" className="h-6" />
                </div>
                <div className="bg-gray-100 text-center text-xs py-1.5 text-gray-700 font-bold border-t">Instant Pay</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex justify-between mb-1">
                <span>My Wallet Balance:</span>
                <span className="font-bold text-[#0a1930]">৳{userBalance}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Payable:</span>
                <span className="text-[#0052FF] text-lg">৳{currentPrice}</span>
              </div>
            </div>

            <button 
              onClick={handleBuyNow} 
              disabled={processing}
              className="w-full bg-[#0052FF] text-white rounded-lg p-3.5 font-bold text-lg hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {processing ? <Loader2 className="animate-spin" size={24} /> : 'Place Order'}
            </button>
          </div>

        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        amount={currentPrice}
        paymentMethod="bkash" 
        // Modal-এর কাজ আমরা পরে কানেক্ট করবো, আপাতত Wallet Pay ফোকাস করছি
      />
    </div>
  );
};

export default Topup;