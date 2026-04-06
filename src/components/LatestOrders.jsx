import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, CheckCircle, Clock, ShoppingBag } from 'lucide-react';

const LatestOrders = () => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Proti 1 minute por por time update hobe (Live update feeling er jonno)
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000); 
    return () => clearInterval(interval);
  }, []);

  // Eita dummy data, pore database theke ashbe. List boro korechi jate scroll ta dekha jay.
  const orders = [
    { id: 1, name: "Diamond Top up", amount: "৳760", user: "Md. Ashif", time: "Just now", status: "Completed", userImage: "https://i.pravatar.cc/150?img=11" },
    { id: 2, name: "25 Diamond", amount: "৳23", user: "Jamiul Hasan", time: "2 min ago", status: "Completed", userImage: null, initial: "J" },
    { id: 3, name: "Weekly Pass", amount: "৳153", user: "Roni", time: "5 min ago", status: "Pending", userImage: "https://i.pravatar.cc/150?img=13" },
    { id: 4, name: "115 Diamond", amount: "৳77", user: "Sakib", time: "12 min ago", status: "Completed", userImage: "https://i.pravatar.cc/150?img=14" },
    { id: 5, name: "Monthly Pass", amount: "৳760", user: "Unknown Player", time: "25 min ago", status: "Completed", userImage: null, initial: "U" },
    { id: 6, name: "50 Diamond", amount: "৳37", user: "Fahim", time: "1 hour ago", status: "Completed", userImage: "https://i.pravatar.cc/150?img=15" },
  ];

  return (
    <div className="mt-14 mb-8 w-full animate-fade-in-up">
      
      {/* Header Section (Esports site er moto premium header) */}
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

        {/* Scrollable Body (Esports site er moto) */}
        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="grid grid-cols-3 p-3 border-b border-gray-50 last:border-none items-center hover:bg-blue-50/50 transition duration-300"
            >
              
              {/* Col 1: Avatar & Info */}
              <div className="flex items-center gap-3 overflow-hidden">
                {/* User Avatar or Initial */}
                {order.userImage ? (
                  <img src={order.userImage} alt="User" className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#0a1930] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    {order.initial}
                  </div>
                )}
                
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-bold text-[#0a1930] truncate">
                    {order.user}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate mt-0.5">
                    <ShoppingBag size={10} className="text-[#0052FF]" /> {order.name} • {order.time}
                  </p>
                </div>
              </div>

              {/* Col 2: Amount Badge */}
              <div className="text-center">
                <span className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold text-[#0052FF] shadow-sm inline-block">
                  {order.amount}
                </span>
              </div>

              {/* Col 3: Status Icon & Text */}
              <div className="flex justify-end">
                {order.status === 'Completed' ? (
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
          ))}
        </div>
      </div>

      {/* Hide Scrollbar CSS directly included */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
};

export default LatestOrders;