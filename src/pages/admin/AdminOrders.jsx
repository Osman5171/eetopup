import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';

const AdminOrders = () => {
  const [activeTab, setActiveTab] = useState('pending');

  // Dummy Orders Data
  const orders = [
    { id: '#EE-1001', user: 'Md. Ashif', playerId: '102938475', package: '115 Diamond', amount: '৳77', method: 'bKash', status: 'pending', date: '06 Apr, 10:30 AM' },
    { id: '#EE-1002', user: 'Jamiul Hasan', playerId: '998877665', package: 'Weekly Pass', amount: '৳153', method: 'Nagad', status: 'pending', date: '06 Apr, 10:45 AM' },
    { id: '#EE-1003', user: 'Roni', playerId: '112233445', package: 'Monthly Pass', amount: '৳760', method: 'Wallet', status: 'completed', date: '05 Apr, 02:15 PM' },
    { id: '#EE-1004', user: 'Sakib', playerId: '556677889', package: '25 Diamond', amount: '৳23', method: 'bKash', status: 'cancelled', date: '05 Apr, 11:10 AM' },
  ];

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => order.status === activeTab);

  return (
    <div className="animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-[#0a1930]">Manage Orders</h1>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID..." 
            className="w-full border border-gray-300 rounded-lg pl-10 p-2 focus:ring-2 focus:ring-[#0052FF] outline-none text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-2 text-sm font-bold transition ${activeTab === 'pending' ? 'text-[#0052FF] border-b-2 border-[#0052FF]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pending (2)
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-2 px-2 text-sm font-bold transition ${activeTab === 'completed' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Completed
        </button>
        <button 
          onClick={() => setActiveTab('cancelled')}
          className={`pb-2 px-2 text-sm font-bold transition ${activeTab === 'cancelled' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Cancelled
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Order Info</th>
                <th className="p-4 font-medium">User & ID</th>
                <th className="p-4 font-medium">Package</th>
                <th className="p-4 font-medium">Amount & Method</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 transition">
                    
                    <td className="p-4">
                      <p className="font-bold text-[#0a1930] text-sm">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </td>
                    
                    <td className="p-4">
                      <p className="font-bold text-[#0a1930] text-sm">{order.user}</p>
                      <p className="text-xs text-blue-600 font-semibold bg-blue-100 inline-block px-2 py-0.5 rounded mt-1">ID: {order.playerId}</p>
                    </td>
                    
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{order.package}</p>
                    </td>
                    
                    <td className="p-4">
                      <p className="text-sm font-bold text-[#0a1930]">{order.amount}</p>
                      <p className="text-xs text-gray-500 capitalize">{order.method}</p>
                    </td>
                    
                    <td className="p-4 text-right flex justify-end gap-2">
                      {activeTab === 'pending' && (
                        <>
                          <button className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white p-2 rounded-lg transition" title="Complete Order">
                            <CheckCircle size={18} />
                          </button>
                          <button className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white p-2 rounded-lg transition" title="Cancel Order">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition" title="View Details">
                        <Eye size={18} />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No {activeTab} orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminOrders;