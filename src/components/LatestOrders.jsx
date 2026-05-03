import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, CheckCircle, Clock, Loader2, Banknote } from 'lucide-react';
import { supabase } from '../supabaseClient';

const LatestOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestOrders();
    const interval = setInterval(() => fetchLatestOrders(), 60000); 
    return () => clearInterval(interval);
  }, []);

  const fetchLatestOrders = async () => {
    // Fetching from 'orders' table
    const { data, error } = await supabase
      .from('orders')
      .select('id, package_name, amount, status, created_at, profiles:user_id (full_name, phone, whatsapp)')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error("LatestOrders Fetch Error:", error);
    }
      
    if (data) setOrders(data);
    setLoading(false);
  };

  const timeAgo = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const isPaidStatus = (status) => {
    if (!status) return false;
    const s = status.toLowerCase().trim();
    return ['completed', 'success', 'paid'].includes(s);
  };

  const getStatusColor = (status) => isPaidStatus(status) ? 'text-green-400 bg-green-900/20 border-green-500/30' : 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
  const getStatusText = (status) => isPaidStatus(status) ? 'COMPLETE' : 'PENDING';
  const getStatusIcon = (status) => isPaidStatus(status) ? <CheckCircle size={14} className="text-green-500"/> : <Clock size={14} className="text-yellow-500 animate-pulse"/>;

  return (
    <div className="mt-14 mb-8 w-full animate-fade-in-up">
      
      <div className="flex justify-between items-end mb-4 pr-1">
        <h2 className="text-lg font-bold border-l-4 border-green-500 pl-3 text-white flex items-center gap-2">
          Latest Orders <Activity size={16} className="text-green-500 animate-pulse"/>
        </h2>
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <RefreshCw size={10} className="text-gray-500" /> Live Updates
        </p>
      </div>
      
      <div className="bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-2 bg-[#0f172a] p-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-700">
          <div className="pl-1">Player / Package</div>
          <div className="text-right pr-2">Status</div>
        </div>

        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-[#8B5CF6]" size={30} />
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => {
              const displayName = order.profiles?.full_name || order.profiles?.phone || order.profiles?.whatsapp || 'Player';

              return (
                <div key={order.id} className="grid grid-cols-2 p-3 border-b border-gray-700/30 last:border-none items-center hover:bg-gray-800/50 transition duration-300">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-700/50 p-1.5 rounded-full shrink-0 border border-gray-600">
                        <Banknote size={14} className="text-blue-400"/>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white truncate">{order.package_name || 'Top-up Package'}</p>
                      <p className="text-[9px] text-gray-500">{timeAgo(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold border uppercase tracking-wide shadow-sm ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)} {getStatusIcon(order.status)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 py-10 font-bold text-sm">No recent orders.</div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default LatestOrders;