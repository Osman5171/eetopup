import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, CheckCircle, Clock, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const LatestOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestOrders();
    // 1 Minute por por live refresh hobe
    const interval = setInterval(() => fetchLatestOrders(), 60000); 
    return () => clearInterval(interval);
  }, []);

  const fetchLatestOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('id, package_name, amount, status, created_at, profiles:user_id (full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (data) setOrders(data);
    setLoading(false);
  };

  const maskName = (name) => {
    if (!name) return "Us***";
    if (name.length <= 2) return name + "***";
    return name.substring(0, 2) + "***" + name.substring(name.length - 1);
  };

  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " mins ago";
    return "Just now";
  };

  return (
    <div className="mt-14 mb-8 w-full animate-fade-in-up">
      
      {/* Header Section */}
      <div className="flex justify-between items-end mb-4 pr-1">
        <h2 className="text-xl md:text-2xl font-bold border-l-4 border-[#0052FF] pl-3 text-[#0a1930] flex items-center gap-2">
          Latest Orders <Activity size={20} className="text-[#0052FF] animate-pulse"/>
        </h2>
        <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 font-medium">
          <RefreshCw size={12} className="text-gray-400" /> Live Updates
        </p>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Table Header Row */}
        <div className="grid grid-cols-3 bg-gray-50 p-3 text-[10px] md:text-xs uppercase font-bold text-gray-500 tracking-wider border-b border-gray-100">
          <div className="pl-2">Player & Item</div>
          <div className="text-center">Amount</div>
          <div className="text-right pr-2">Status</div>
        </div>

        {/* Scrollable Body */}
        <div className="max-h-[350px] overflow-y-auto custom-scrollbar relative">
          
          {loading ? (
             <div className="flex justify-center items-center py-10">
               <Loader2 className="animate-spin text-[#0052FF]" size={30} />
             </div>
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const displayName = order.profiles?.full_name || order.profiles?.email?.split('@')[0] || 'Player';
              const initial = displayName.charAt(0).toUpperCase();

              return (
                <div 
                  key={order.id} 
                  className="grid grid-cols-3 p-3 border-b border-gray-50 last:border-none items-center hover:bg-blue-50/50 transition duration-300"
                >
                  
                  {/* Col 1: Avatar & Info */}
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-[#0a1930] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {initial}
                    </div>
                    
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-bold text-[#0a1930] truncate">
                        {maskName(displayName)}
                      </p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate mt-0.5">
                        <ShoppingBag size={10} className="text-[#0052FF]" /> {order.package_name} • {getTimeAgo(order.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Col 2: Amount Badge */}
                  <div className="text-center">
                    <span className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold text-[#0052FF] shadow-sm inline-block">
                      ৳{order.amount}
                    </span>
                  </div>

                  {/* Col 3: Status Icon & Text */}
                  <div className="flex justify-end">
                    {order.status === 'completed' ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded text-[9px] md:text-[10px] font-bold border uppercase tracking-wide text-green-600 bg-green-50 border-green-200 shadow-sm">
                        <span className="hidden sm:block">Paid</span>
                        <CheckCircle size={14} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 rounded text-[9px] md:text-[10px] font-bold border uppercase tracking-wide text-orange-600 bg-orange-50 border-orange-200 shadow-sm">
                        <span className="hidden sm:block">Pending</span>
                        <Clock size={14} className="animate-pulse" />
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          ) : (
             <div className="text-center text-gray-400 py-10 font-bold text-sm">No recent orders.</div>
          )}

        </div>
      </div>

      {/* Hide Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
};

export default LatestOrders;