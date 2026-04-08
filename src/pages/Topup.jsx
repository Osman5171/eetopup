import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import { supabase } from '../supabaseClient';
import { Loader2, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { sendTelegramMessage, sendEmailNotification } from '../utils/notify';

const Topup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productQuery = searchParams.get('product'); // URL থেকে প্রোডাক্টের নাম ধরা হচ্ছে
  const brandQuery = searchParams.get('brand');

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [playerId, setPlayerId] = useState('');
  
  // ডাইনামিক প্রোডাক্ট ইনফো
  const [productInfo, setProductInfo] = useState({ 
    name: 'Loading...', 
    brand_name: '',
    image_url: 'https://eagleeyetopup.com/logo.png' 
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  // --- Promo Code States ---
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [productQuery]);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', session.user.id).single();
      if (profile) setUserBalance(profile.balance || 0);
    }

    let targetProduct = productQuery;

    // URL থেকে প্রোডাক্টের তথ্য আনা
    if (targetProduct) {
      const { data: pData } = await supabase.from('products').select('*').eq('name', targetProduct).single();
      if (pData) setProductInfo(pData);
    } else {
      // যদি URL এ প্রোডাক্ট না থাকে তবে প্রথম প্রোডাক্টটি ডিফল্ট হিসেবে দেখাবে
      const { data: firstProd } = await supabase.from('products').select('*').eq('status', 'Active').limit(1).single();
      if (firstProd) {
        targetProduct = firstProd.name;
        setProductInfo(firstProd);
      }
    }

    // শুধুমাত্র সিলেক্ট করা 'প্রোডাক্টের' প্যাকেজগুলো ফিল্টার করে আনবে
    let pkgQuery = supabase.from('packages').select('*').eq('status', 'Active').order('sell_price', { ascending: true });
    if (targetProduct) {
      pkgQuery = pkgQuery.eq('product_name', targetProduct); 
    }

    const { data: pkgs } = await pkgQuery;
    if (pkgs && pkgs.length > 0) {
      setPackages(pkgs);
      setSelectedPackage(pkgs[0].id);
    } else {
      setPackages([]);
      setSelectedPackage(null);
    }
    setLoading(false);
  };

  const currentPkg = packages.find(p => p.id === selectedPackage);
  const currentPrice = currentPkg?.sell_price || 0;
  const finalPrice = Math.max(0, currentPrice - discount);

  // --- Promo Code Apply Function ---
  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoStatus('loading');
    
    const codeToApply = promoCode.toUpperCase().trim();

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', codeToApply)
      .eq('status', 'Active')
      .single();

    if (error || !promo) {
      setPromoStatus('error');
      setPromoMessage('Invalid or Expired Promo Code!');
      setDiscount(0);
      return;
    }

    if (promo.current_uses >= promo.max_uses) {
      setPromoStatus('error');
      setPromoMessage('Promo Code Usage Limit Reached!');
      setDiscount(0);
      return;
    }

    setPromoStatus('success');
    setPromoMessage(`Awesome! You got ৳${promo.discount_amount} discount.`);
    setDiscount(promo.discount_amount);
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscount(0);
    setPromoStatus(null);
    setPromoMessage('');
  };

  // --- Buy Now Function ---
  const handleBuyNow = async () => {
    if (!playerId) return alert("দয়া করে আপনার Player ID দিন!");
    if (!selectedPackage) return alert("দয়া করে একটি প্যাকেজ সিলেক্ট করুন!");
    if (!user) {
      alert("অর্ডার করতে হলে আগে লগিন করতে হবে!");
      return navigate('/auth');
    }

    if (paymentMethod === 'instant') {
      setIsModalOpen(true); 
    } else {
      if(window.confirm(`আপনি কি ৳${finalPrice} দিয়ে ${currentPkg.name} কিনতে চান?`)) {
        setProcessing(true);

        if (userBalance < finalPrice) {
          alert("আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই! দয়া করে Add Money করুন।");
          setProcessing(false);
          return;
        }

        const newBalance = userBalance - finalPrice;
        await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);

        const { error } = await supabase.from('orders').insert({
          user_id: user.id,
          package_name: currentPkg.name + (discount > 0 ? ` (Promo: ${promoCode})` : ''),
          player_id: playerId,
          amount: finalPrice,
          payment_method: 'Wallet',
          status: 'pending' 
        });

        if (discount > 0 && promoCode) {
          await supabase.rpc('increment_promo_usage', { p_code: promoCode.toUpperCase() });
        }

        if (!error) {
          const telegramMsg = `🚨 <b>New Order!</b>\n\n👤 <b>User:</b> ${user.email}\n🎮 <b>ID:</b> <code>${playerId}</code>\n💎 <b>Package:</b> ${currentPkg.name}\n🛒 <b>Category:</b> ${productInfo.brand_name} - ${productInfo.name}\n💰 <b>Paid:</b> ৳${finalPrice}\n💳 <b>Method:</b> Wallet`;
          await sendTelegramMessage(telegramMsg);

          sendEmailNotification({
            user_email: user.email,
            player_id: playerId,
            package: currentPkg.name,
            amount: finalPrice
          });

          alert("আপনার অর্ডারটি সফলভাবে প্লেস করা হয়েছে! ✅");
          navigate('/profile'); 
        } else {
          alert("Error: " + error.message);
        }
        setProcessing(false);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-[#0052FF]" size={40}/></div>;

  return (
    <div className="w-full mt-6 relative animate-fade-in-up">
      
      {/* 👈 Dynamic Product Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center gap-4 mb-6">
        <img src={productInfo.image_url} alt={productInfo.name} className="w-16 h-16 rounded object-cover bg-[#0a1930]"/>
        <div>
          <h1 className="text-xl font-bold text-[#0a1930]">{productInfo.name}</h1>
          <p className="text-sm text-gray-500 font-medium text-[#0052FF]">{productInfo.brand_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Select Package
            </h2>
            
            {packages.length === 0 ? (
              <p className="text-red-500 text-center py-4 font-bold">No active packages found for {productInfo.name}!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id} onClick={() => setSelectedPackage(pkg.id)}
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
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Account Info
            </h2>
            <input 
              type="text" value={playerId} onChange={(e) => setPlayerId(e.target.value)}
              placeholder="এখানে Player ID/Info দিন..." 
              className="w-full border border-gray-300 rounded p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] font-bold tracking-wider"
            />
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#0a1930] flex items-center gap-2 border-b pb-3 mb-4">
              <span className="bg-[#0052FF] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Payment
            </h2>
            
            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                <Tag size={14}/> Have a Promo Code?
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter Code" disabled={promoStatus === 'success'}
                  className="w-full border border-gray-300 rounded-lg p-2 uppercase text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
                {promoStatus === 'success' ? (
                  <button onClick={handleRemovePromo} className="bg-red-500 text-white px-3 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition">Remove</button>
                ) : (
                  <button onClick={handleApplyPromo} disabled={promoStatus === 'loading'} className="bg-[#0a1930] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#1e3a6e] transition disabled:opacity-50">
                    {promoStatus === 'loading' ? <Loader2 size={16} className="animate-spin"/> : 'Apply'}
                  </button>
                )}
              </div>
              {promoStatus === 'success' && <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle2 size={14}/> {promoMessage}</p>}
              {promoStatus === 'error' && <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1"><XCircle size={14}/> {promoMessage}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div onClick={() => setPaymentMethod('wallet')} className={`border rounded-lg cursor-pointer overflow-hidden transition ${paymentMethod === 'wallet' ? 'border-[#0052FF] ring-2 ring-[#0052FF] shadow-md' : 'border-gray-200 opacity-70'}`}>
                <div className="p-4 flex justify-center h-16 items-center"><span className="font-black text-[#0a1930]">👛 Wallet Pay</span></div>
                <div className="bg-gray-100 text-center text-xs py-1.5 font-bold border-t">My Balance</div>
              </div>
              <div onClick={() => setPaymentMethod('instant')} className={`border rounded-lg cursor-pointer overflow-hidden transition ${paymentMethod === 'instant' ? 'border-[#0052FF] ring-2 ring-[#0052FF] shadow-md' : 'border-gray-200 opacity-70'}`}>
                <div className="p-4 flex justify-center h-16 items-center gap-3 bg-gray-50">
                  <img src="https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png" alt="bKash" className="h-6" />
                </div>
                <div className="bg-gray-100 text-center text-xs py-1.5 font-bold border-t">Instant Pay</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-1.5">
              <div className="flex justify-between"><span>Wallet Balance:</span><span className="font-bold text-[#0a1930]">৳{userBalance}</span></div>
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-bold">৳{currentPrice}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600 font-bold"><span>Discount:</span><span>- ৳{discount}</span></div>}
              <div className="flex justify-between font-black border-t border-blue-200 pt-1.5 mt-1.5">
                <span>Total Payable:</span><span className="text-[#0052FF] text-lg">৳{finalPrice}</span>
              </div>
            </div>

            <button onClick={handleBuyNow} disabled={processing || !selectedPackage} className="w-full bg-[#0052FF] text-white rounded-lg p-3.5 font-bold text-lg hover:bg-blue-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70">
              {processing ? <Loader2 className="animate-spin" size={24} /> : 'Place Order'}
            </button>
          </div>

        </div>
      </div>

      <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} amount={finalPrice} paymentMethod="bkash" />
    </div>
  );
};

export default Topup;