import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import { supabase } from '../supabaseClient';
import { Loader2, Tag, CheckCircle2, XCircle, Minus, Plus } from 'lucide-react';
import { sendTelegramMessage, sendEmailNotification } from '../utils/notify';

const Topup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productQuery = searchParams.get('product'); 
  const brandQuery = searchParams.get('brand');

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [playerId, setPlayerId] = useState('');
  
  const [quantity, setQuantity] = useState(1);
  
  const [productInfo, setProductInfo] = useState({ 
    name: 'Loading...', 
    brand_name: '',
    image_url: 'https://eagleeyetopup.com/logo.png',
    product_type: 'Top Up'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');

  const isVoucher = productInfo?.product_type === 'Voucher';

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

    if (targetProduct) {
      const { data: pData } = await supabase.from('products').select('*').eq('name', targetProduct).single();
      if (pData) setProductInfo(pData);
    } else {
      const { data: firstProd } = await supabase.from('products').select('*').eq('status', 'Active').limit(1).single();
      if (firstProd) {
        targetProduct = firstProd.name;
        setProductInfo(firstProd);
      }
    }

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
  const subTotal = currentPrice * quantity;
  const finalPrice = Math.max(0, subTotal - discount);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoStatus('loading');
    const codeToApply = promoCode.toUpperCase().trim();

    const { data: promo, error } = await supabase
      .from('promo_codes').select('*').eq('code', codeToApply).eq('status', 'Active').single();

    if (error || !promo) {
      setPromoStatus('error');
      setPromoMessage('Invalid Promo Code!');
      setDiscount(0);
      return;
    }

    if (promo.current_uses >= promo.max_uses) {
      setPromoStatus('error');
      setPromoMessage('Usage Limit Reached!');
      setDiscount(0);
      return;
    }

    setPromoStatus('success');
    setPromoMessage(`Awesome! Got ৳${promo.discount_amount} discount.`);
    setDiscount(promo.discount_amount);
  };

  const handleRemovePromo = () => {
    setPromoCode(''); setDiscount(0); setPromoStatus(null); setPromoMessage('');
  };

  const handleBuyNow = async () => {
    if (!isVoucher && !playerId) return alert("দয়া করে আপনার Player ID দিন!");
    if (isVoucher && !playerId) return alert("দয়া করে ডেলিভারির জন্য WhatsApp/Email দিন!");
    if (!selectedPackage) return alert("দয়া করে একটি প্যাকেজ সিলেক্ট করুন!");
    if (!user) {
      alert("অর্ডার করতে হলে আগে লগিন করতে হবে!");
      return navigate('/auth');
    }

    if (paymentMethod === 'instant') {
      setIsModalOpen(true); 
    } else {
      if(window.confirm(`আপনি কি ৳${finalPrice} দিয়ে ${currentPkg.name} ${isVoucher ? `(${quantity} টি)` : ''} কিনতে চান?`)) {
        setProcessing(true);

        if (userBalance < finalPrice) {
          alert("আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই! দয়া করে Add Money করুন।");
          setProcessing(false);
          return;
        }

        let orderStatus = 'pending';
        let assignedVouchers = null;

        if (isVoucher) {
            const match = currentPkg.name.match(/\d+/);
            const upVal = match ? parseInt(match[0], 10) : null;

            if (upVal) {
                const { data: availableVouchers } = await supabase
                    .from('vouchers')
                    .select('*')
                    .eq('status', 'available')
                    .ilike('type', `${upVal} UP%`)
                    .limit(Number(quantity));

                if (availableVouchers && availableVouchers.length === quantity) {
                    const vIds = availableVouchers.map(v => v.id);
                    const { error: updateError } = await supabase
                        .from('vouchers')
                        .update({ status: 'sold' })
                        .in('id', vIds);

                    if (!updateError) {
                        assignedVouchers = availableVouchers.map(v => v.code).join('\n\n');
                        orderStatus = 'completed';
                    }
                }
            }
        }

        const newBalance = userBalance - finalPrice;
        await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);

        const orderPackageName = isVoucher ? `${currentPkg.name} (x${quantity})` : currentPkg.name;
        const orderPlayerId = isVoucher ? `Contact: ${playerId} | Qty: ${quantity}` : playerId;
        const totalBuyPrice = (currentPkg.buy_price || 0) * (isVoucher ? quantity : 1);

        const orderData = {
          user_id: user.id,
          package_name: orderPackageName + (discount > 0 ? ` (Promo: ${promoCode})` : ''),
          player_id: orderPlayerId, 
          amount: finalPrice,
          buy_price: totalBuyPrice,
          payment_method: 'Wallet',
          status: orderStatus,
          voucher_code: assignedVouchers 
        };

        console.log("Order Data Sending to DB:", orderData);

        const { data: newOrder, error: insertError } = await supabase
          .from('orders')
          .insert([orderData])
          .select();

        if (discount > 0 && promoCode) {
          await supabase.rpc('increment_promo_usage', { p_code: promoCode.toUpperCase() });
        }

        if (insertError) {
           console.error("Database Insert Error:", insertError);
           alert("অর্ডার ডাটাবেসে সেভ হয়নি! Error: " + insertError.message);
          
           await supabase.from('profiles').update({ balance: userBalance }).eq('id', user.id);
        } else {
          const telegramMsg = `🚨 <b>New Order!</b>\n\n👤 <b>User:</b> ${user.email}\n${isVoucher ? `📞 <b>Contact:</b> ${playerId}\n📦 <b>Qty:</b> ${quantity}` : `🎮 <b>ID:</b> <code>${playerId}</code>`}\n💎 <b>Package:</b> ${currentPkg.name}\n🛒 <b>Product:</b> ${productInfo.name}\n💰 <b>Paid:</b> ৳${finalPrice}\n💳 <b>Method:</b> Wallet`;
          await sendTelegramMessage(telegramMsg);

          sendEmailNotification({ user_email: user.email, player_id: orderPlayerId, package: orderPackageName, amount: finalPrice });

          if (orderStatus === 'completed') {
              alert("আপনার অর্ডারটি সফলভাবে প্লেস করা হয়েছে এবং ভাউচার ডেলিভারি হয়েছে! ✅");
          } else {
              alert("আপনার অর্ডারটি প্লেস করা হয়েছে! (খুব শীঘ্রই ভাউচার দেওয়া হবে) ⏳");
          }
          navigate('/profile?tab=orders'); 
        }
        setProcessing(false);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-[#8B5CF6]" size={40}/></div>;

  return (
    <div className="w-full mt-6 relative animate-fade-in-up">
      
      <div className="bg-[#1E293B] rounded-2xl p-4 shadow-lg border border-[#334155] flex items-center gap-4 mb-6">
        <img src={productInfo.image_url} alt={productInfo.name} className="w-16 h-16 rounded-xl object-cover bg-[#0F172A]"/>
        <div>
          <h1 className="text-xl font-bold text-white">{productInfo.name}</h1>
          <p className="text-sm text-[#A78BFA] font-medium">{productInfo.brand_name} / {productInfo.product_type}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#1E293B] rounded-2xl p-5 shadow-lg border border-[#334155]">
            <h2 className="text-lg font-bold text-white flex items-center gap-3 border-b border-[#334155] pb-3 mb-4">
              <span className="bg-[#8B5CF6] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(139,92,246,0.5)]">1</span>
              Select Recharge
            </h2>
            
            {packages.length === 0 ? (
              <p className="text-red-400 text-center py-4 font-bold">No active packages found!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id} onClick={() => setSelectedPackage(pkg.id)}
                    className={`border rounded-xl p-3.5 flex justify-between items-center cursor-pointer transition-all duration-300 ${
                      selectedPackage === pkg.id ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 ring-1 ring-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'border-[#334155] hover:border-[#8B5CF6]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border transition-all ${selectedPackage === pkg.id ? 'border-[5px] border-[#8B5CF6]' : 'border-gray-500'}`}></div>
                      <span className={`text-sm font-bold ${selectedPackage === pkg.id ? 'text-white' : 'text-gray-300'}`}>{pkg.name}</span>
                    </div>
                    <span className="text-[#00E5FF] font-black text-sm">৳{pkg.sell_price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {isVoucher ? (
            <div className="bg-[#1E293B] rounded-2xl p-5 shadow-lg border border-[#334155] flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="bg-[#8B5CF6] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(139,92,246,0.5)]">Q</span>
                Quantity
              </h2>
              
              <div className="flex items-center gap-4 bg-[#0F172A] rounded-xl p-1.5 border border-[#334155]">
                <button 
                  onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} 
                  className="w-8 h-8 flex justify-center items-center text-white bg-[#1E293B] rounded-lg hover:bg-gray-700 transition shadow-sm"
                >
                  <Minus size={16}/>
                </button>
                <span className="font-black text-white w-6 text-center text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)} 
                  className="w-8 h-8 flex justify-center items-center text-white bg-[#1E293B] rounded-lg hover:bg-gray-700 transition shadow-sm"
                >
                  <Plus size={16}/>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1E293B] rounded-2xl p-5 shadow-lg border border-[#334155]">
              <h2 className="text-lg font-bold text-white flex items-center gap-3 border-b border-[#334155] pb-3 mb-4">
                <span className="bg-[#8B5CF6] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(139,92,246,0.5)]">2</span>
                Account Info
              </h2>
              <input 
                type="text" value={playerId} onChange={(e) => setPlayerId(e.target.value)}
                placeholder="এখানে Player ID/Info দিন..." 
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] font-bold tracking-wider placeholder-gray-500 transition-all"
              />
            </div>
          )}

          {isVoucher && (
            <div className="bg-[#1E293B] rounded-2xl p-5 shadow-lg border border-[#334155]">
              <h2 className="text-lg font-bold text-white flex items-center gap-3 border-b border-[#334155] pb-3 mb-4">
                <span className="bg-[#8B5CF6] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(139,92,246,0.5)]">2</span>
                Delivery Info
              </h2>
              <input 
                type="text" value={playerId} onChange={(e) => setPlayerId(e.target.value)}
                placeholder="WhatsApp Number or Email..." 
                className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] font-bold tracking-wider placeholder-gray-500 transition-all"
              />
            </div>
          )}

          <div className="bg-[#1E293B] rounded-2xl p-5 shadow-lg border border-[#334155]">
            <h2 className="text-lg font-bold text-white flex items-center gap-3 border-b border-[#334155] pb-3 mb-4">
              <span className="bg-[#8B5CF6] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-[0_0_10px_rgba(139,92,246,0.5)]">3</span>
              Payment
            </h2>
            
            <div className="mb-4 bg-[#0F172A] p-3 rounded-xl border border-[#334155]">
              <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                <Tag size={14}/> Have a Promo Code?
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter Code" disabled={promoStatus === 'success'}
                  className="w-full bg-[#1E293B] border border-[#334155] text-white rounded-lg p-2 uppercase text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
                {promoStatus === 'success' ? (
                  <button onClick={handleRemovePromo} className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg font-bold text-sm hover:bg-red-500 hover:text-white transition">Remove</button>
                ) : (
                  <button onClick={handleApplyPromo} disabled={promoStatus === 'loading'} className="bg-[#8B5CF6] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-600 transition disabled:opacity-50">
                    {promoStatus === 'loading' ? <Loader2 size={16} className="animate-spin"/> : 'Apply'}
                  </button>
                )}
              </div>
              {promoStatus === 'success' && <p className="text-green-400 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle2 size={14}/> {promoMessage}</p>}
              {promoStatus === 'error' && <p className="text-red-400 text-xs font-bold mt-2 flex items-center gap-1"><XCircle size={14}/> {promoMessage}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div onClick={() => setPaymentMethod('wallet')} className={`border rounded-xl cursor-pointer overflow-hidden transition-all duration-300 ${paymentMethod === 'wallet' ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'border-[#334155] opacity-60 hover:opacity-100'}`}>
                <div className="p-4 flex justify-center h-16 items-center bg-[#0F172A]"><span className="font-black text-white">👛 Wallet Pay</span></div>
                <div className="bg-[#1E293B] text-gray-400 text-center text-xs py-2 font-bold border-t border-[#334155]">My Balance</div>
              </div>
              <div onClick={() => setPaymentMethod('instant')} className={`border rounded-xl cursor-pointer overflow-hidden transition-all duration-300 ${paymentMethod === 'instant' ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'border-[#334155] opacity-60 hover:opacity-100'}`}>
                <div className="p-4 flex justify-center h-16 items-center bg-[#0F172A]">
                  <img src="https://freelogopng.com/images/all_img/1656234782bkash-app-logo.png" alt="bKash" className="h-6 opacity-90 hover:opacity-100" />
                </div>
                <div className="bg-[#1E293B] text-gray-400 text-center text-xs py-2 font-bold border-t border-[#334155]">Instant Pay</div>
              </div>
            </div>

            <div className="text-sm text-gray-300 mb-6 bg-[#0F172A] p-4 rounded-xl border border-[#334155] space-y-2">
              <div className="flex justify-between"><span>Wallet Balance:</span><span className="font-bold text-white">৳{userBalance}</span></div>
              <div className="flex justify-between">
                <span>Subtotal {isVoucher && `(x${quantity})`}:</span>
                <span className="font-bold">৳{subTotal}</span>
              </div>
              {discount > 0 && <div className="flex justify-between text-green-400 font-bold"><span>Discount:</span><span>- ৳{discount}</span></div>}
              <div className="flex justify-between font-black border-t border-[#334155] pt-2 mt-2">
                <span>Total Payable:</span><span className="text-[#00E5FF] text-xl">৳{finalPrice}</span>
              </div>
            </div>

            <button onClick={handleBuyNow} disabled={processing || !selectedPackage} className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white rounded-xl p-3.5 font-bold text-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all flex justify-center items-center gap-2 disabled:opacity-70">
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