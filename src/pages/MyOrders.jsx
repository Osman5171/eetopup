import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Clock, ShoppingBag, CheckCircle2, Copy, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      navigate('/auth');
      return;
    }
    
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (orders) {
      setOrderHistory(orders);
    }
    setLoading(false);
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#8B5CF6]">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="font-bold text-gray-300">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 mb-12 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/profile')} className="bg-[#1e293b] p-2 rounded-full shadow text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="text-[#8B5CF6]" /> My Orders & Vouchers
        </h1>
      </div>

      <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-[#334155] p-6">
        <div className="space-y-4">
          {orderHistory.length > 0 ? (
            orderHistory.map((order, index) => (
              <div key={order.id} className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 md:p-5 hover:border-[#8B5CF6]/50 transition-all shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-2.5">
                    <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                      Serial NO: <span className="text-white">{index + 1} <span className="text-gray-600 text-xs ml-1">(#{order.id})</span></span>
                    </p>
                    <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                      Date: <span className="text-white">
                         {/* <-- ফিক্স করা হয়েছে: Date ক্র্যাশ এড়াতে সেফটি যোগ করা হয়েছে */}
                         {order?.created_at ? new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                      Package: <span className="text-white">{order.package_name}</span>
                    </p>
                  </div>
                  
                  <div className="space-y-2.5">
                    <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                      Info/ID: <span className="text-white">{order.player_id}</span>
                    </p>
                    <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                      Price: <span className="text-[#00E5FF]">৳ {order.amount}</span>
                    </p>
                    <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2 items-center">
                      Status: 
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-black ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>

                {order.voucher_code && order.voucher_code.trim() !== '' && (
                  <div className="mt-4 pt-4 border-t border-[#334155]">
                    <p className="text-xs font-bold text-[#A78BFA] mb-2 uppercase tracking-wider flex items-center gap-1">
                        Your Delivered Voucher Code(s):
                    </p>
                    <div className="bg-[#1E293B] p-3 rounded-lg border border-[#8B5CF6]/30">
                      {order.voucher_code.split('\n\n').filter(c => c.trim()).map((code, idx) => (
                        <div key={idx} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${idx > 0 ? 'mt-3 pt-3 border-t border-[#334155]' : ''}`}>
                          <div className="font-mono text-sm text-[#00E5FF] font-bold break-all">
                            {idx > 0 && <span className="text-gray-500 text-xs mr-1">#{idx + 1}</span>}
                            {code.trim()}
                          </div>
                          <button
                            onClick={() => handleCopyCode(code.trim(), `${order.id}-${idx}`)}
                            className="shrink-0 bg-[#8B5CF6] hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            {copiedId === `${order.id}-${idx}` ? (
                              <><CheckCircle2 size={14} /> Copied!</>
                            ) : (
                              <><Copy size={12} /> Copy</>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 font-medium">
              You have no orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;