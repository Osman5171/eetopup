import React, { useState, useEffect } from 'react';
import { Users, DollarSign, ShoppingCart, Wallet, Activity, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingDeposits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // ১. Total Users (মোট ইউজার কতজন)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // ২. Total Revenue (শুধুমাত্র কমপ্লিট হওয়া অর্ডারের যোগফল)
      const { data: revenueData } = await supabase
        .from('orders')
        .select('amount')
        .eq('status', 'completed');
      
      const revenue = revenueData ? revenueData.reduce((sum, order) => sum + Number(order.amount), 0) : 0;

      // ৩. Pending Orders (কয়টি অর্ডার পেন্ডিং আছে)
      const { count: pendingOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // ৪. Pending Deposits (কয়টি অ্যাড মানি রিকোয়েস্ট পেন্ডিং আছে)
      const { count: pendingDepositsCount } = await supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // State এ ডাটা সেট করা
      setStats({
        totalUsers: usersCount || 0,
        totalRevenue: revenue,
        pendingOrders: pendingOrdersCount || 0,
        pendingDeposits: pendingDepositsCount || 0
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-[#0052FF] mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-500">Loading Dashboard Data...</h2>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-[#0a1930] flex items-center gap-2">
          <Activity className="text-[#0052FF]" /> Overview Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Real-time statistics from your database.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#0a1930] to-[#1e3a6e] rounded-xl p-6 shadow-lg text-white relative overflow-hidden group hover:scale-105 transition duration-300 cursor-pointer">
          <div className="relative z-10">
            <p className="text-blue-200 font-medium mb-1 text-sm uppercase tracking-wider">Total Revenue</p>
            <h2 className="text-3xl font-black">৳ {stats.totalRevenue.toLocaleString()}</h2>
          </div>
          <DollarSign className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:scale-110 transition" size={100} />
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Pending Orders</p>
              <h2 className="text-3xl font-black text-orange-500">{stats.pendingOrders}</h2>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg text-orange-500">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>

        {/* Pending Deposits */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Pending Deposits</p>
              <h2 className="text-3xl font-black text-[#0052FF]">{stats.pendingDeposits}</h2>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-[#0052FF]">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wider">Total Users</p>
              <h2 className="text-3xl font-black text-green-600">{stats.totalUsers}</h2>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-green-600">
              <Users size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Links Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-[#0a1930] mb-4 border-b pb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/admin/orders" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-[#0052FF] transition group">
            <span className="font-bold text-gray-700 group-hover:text-[#0052FF]">Manage Orders</span>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#0052FF]" />
          </Link>
          <Link to="/admin/deposits" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-[#0052FF] transition group">
            <span className="font-bold text-gray-700 group-hover:text-[#0052FF]">Review Deposits</span>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#0052FF]" />
          </Link>
          <Link to="/admin/packages" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-[#0052FF] transition group">
            <span className="font-bold text-gray-700 group-hover:text-[#0052FF]">Update Packages</span>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#0052FF]" />
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;