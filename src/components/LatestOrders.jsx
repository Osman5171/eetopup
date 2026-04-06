import React from 'react';

const LatestOrders = () => {
  // Eita dummy data, pore admin panel/database theke ashbe
  const orders = [
    {
      id: 1,
      name: "Dimond Top up",
      details: "1 Monthly - ৳760",
      time: "10:53 PM 30 March",
      ago: "12 hours ago",
      status: "Completed",
      userInitial: "D",
      userImage: null
    },
    {
      id: 2,
      name: "25 Diamond",
      details: "৳23",
      user: "Md. Jamiul Hasan",
      time: "10:32 PM 30 March",
      ago: "12 hours ago",
      status: "Completed",
      userInitial: "M",
      userImage: "https://i.pravatar.cc/150?img=12" // Demo image
    },
    {
      id: 3,
      name: "1 Weekly",
      details: "৳153",
      user: "Abdullah ibne Roni",
      time: "7:19 PM 30 March",
      ago: "15 hours ago",
      status: "Completed",
      userInitial: "A",
      userImage: "https://i.pravatar.cc/150?img=13"
    }
  ];

  return (
    <div className="mt-12 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0a1930]">Latest Orders</h2>
        <p className="text-blue-600 text-sm mt-1 font-medium">সর্বশেষ আপডেট করা হয়েছে ১২ ঘণ্টা আগে</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {orders.map((order, index) => (
          <div 
            key={order.id} 
            className={`flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition ${
              index !== orders.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            {/* Bam Dike: User Info o Order Details */}
            <div className="flex items-center gap-4 mb-3 md:mb-0">
              {/* Avatar */}
              {order.userImage ? (
                <img src={order.userImage} alt="User" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#5b6ebf] text-white flex items-center justify-center font-bold text-lg">
                  {order.userInitial}
                </div>
              )}
              
              {/* Details */}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#0a1930] text-sm md:text-base">
                    {order.user ? order.user : order.name}
                  </h4>
                  {order.user && (
                     <span className="text-gray-400 text-xs hidden md:inline">{order.time}</span>
                  )}
                </div>
                {!order.user && <span className="text-gray-400 text-xs block md:hidden mb-1">{order.time}</span>}
                <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                  {order.user ? order.name : ''} {order.user ? '-' : ''} {order.details}
                </p>
              </div>
            </div>

            {/* Dan Dike: Time o Status */}
            <div className="flex items-center justify-between md:justify-end md:gap-6 w-full md:w-auto pl-14 md:pl-0">
              <span className="text-gray-400 text-xs md:text-sm">{order.ago}</span>
              <span className="bg-[#10b981] text-white px-3 py-1 rounded-full text-xs font-bold">
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestOrders;