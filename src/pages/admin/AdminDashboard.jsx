import React from 'react';
import { ShoppingCart, Users, DollarSign, Activity } from 'lucide-react';

const AdminDashboard = () => {
  // Dummy Stats Data
  const stats = [
    { title: "Total Users", value: "1,250", icon: <Users size={24} className="text-blue-500"/>, bg: "bg-blue-100" },
    { title: "Pending Orders", value: "45", icon: <ShoppingCart size={24} className="text-orange-500"/>, bg: "bg-orange-100" },
    { title: "Total Revenue", value: "৳ 85,400", icon: <DollarSign size={24} className="text-green-500"/>, bg: "bg-green-100" },
    { title: "Completed Orders", value: "3,200", icon: <Activity size={24} className="text-purple-500"/>, bg: "bg-purple-100" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-[#0a1930] mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition duration-300">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-[#0a1930]">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#0a1930]">Recent Pending Orders</h2>
          <button className="text-sm text-[#0052FF] font-semibold hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">User / Player ID</th>
                <th className="p-4 font-medium">Package</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((item) => (
                <tr key={item} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-sm font-semibold">#EE-902{item}</td>
                  <td className="p-4 text-sm">
                    <p className="font-bold text-[#0a1930]">Md. Ashif</p>
                    <p className="text-xs text-gray-500">ID: 102938475</p>
                  </td>
                  <td className="p-4 text-sm font-semibold">115 Diamond</td>
                  <td className="p-4 text-sm font-bold text-orange-500">৳77 (bKash)</td>
                  <td className="p-4 text-sm text-right">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold mr-2 transition">
                      Complete
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;