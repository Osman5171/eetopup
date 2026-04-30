import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, DollarSign, ShoppingCart, ShoppingBag, 
  Wallet, Activity, Loader2, ArrowRight, TrendingUp, 
  BarChart2, Calendar, Award, Landmark 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersToday: 0,
    systemBalance: 0,
    
    totalRevenue: 0,
    lifetimeProfit: 0,
    todayProfit: 0,
    yesterdayProfit: 0,
    last7DaysProfit: 0,
    thisMonthProfit: 0,

    pendingOrders: 0,
    todayOrders: 0,
    pendingDeposits: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      
      const endOfYesterday = new Date(startOfToday);
      endOfYesterday.setMilliseconds(-1);
      
      const startOf7Days = new Date(startOfToday);
      startOf7Days.setDate(startOf7Days.getDate() - 6);
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // ১. Fetch Profiles for Users & System Balance
      const { data: profiles } = await supabase.from('profiles').select('created_at, balance');
      
      let totalUsers = 0;
      let usersToday = 0;
      let systemBalance = 0;

      if (profiles) {
        totalUsers = profiles.length;
        profiles.forEach(p => {
          systemBalance += Number(p.balance || 0);
          if (new Date(p.created_at) >= startOfToday) {
            usersToday++;
          }
        });
      }

      // ২. Fetch Completed Orders for Revenue & Profit
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('amount, buy_price, created_at')
        .eq('status', 'completed');

      let totalRevenue = 0;
      let lifetimeProfit = 0;
      let todayProfit = 0;
      let yesterdayProfit = 0;
      let last7DaysProfit = 0;
      let thisMonthProfit = 0;

      if (completedOrders) {
        completedOrders.forEach(order => {
          const amount = Number(order.amount || 0);
          const buyPrice = Number(order.buy_price || 0);
          const profit = amount - buyPrice;
          const orderDate = new Date(order.created_at);

          totalRevenue += amount;
          lifetimeProfit += profit;

          if (orderDate >= startOfToday) {
            todayProfit += profit;
          }
          if (orderDate >= startOfYesterday && orderDate <= endOfYesterday) {
            yesterdayProfit += profit;
          }
          if (orderDate >= startOf7Days) {
            last7DaysProfit += profit;
          }
          if (orderDate >= startOfMonth) {
            thisMonthProfit += profit;
          }
        });
      }

      // ৩. Fetch Today's Orders (All Statuses)
      const { count: todayOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfToday.toISOString());

      // ৪. Pending Orders
      const { count: pendingOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // ৫. Pending Deposits
      const { count: pendingDepositsCount } = await supabase
        .from('deposits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Set State
      setStats({
        totalUsers,
        usersToday,
        systemBalance,
        totalRevenue,
        lifetimeProfit,
        todayProfit,
        yesterdayProfit,
        last7DaysProfit,
        thisMonthProfit,
        pendingOrders: pendingOrdersCount || 0,
        todayOrders: todayOrdersCount || 0,
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
        <p className="text-gray-500 mt-1">Real-time statistics and financial overview.</p>
      </div>

      {/* Primary Highlights (Gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-gradient-to-br from-purple-900 to-purple-600 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group hover:scale-105 transition duration-300 cursor-pointer">
          <div className="relative z-10">
            <p className="text-purple-200 font-bold mb-1 text-xs uppercase tracking-wider flex items-center gap-2"><Award size={14}/> Lifetime Profit</p>
            <h2 className="text-3xl font-black">৳ {stats.lifetimeProfit.toLocaleString()}</h2>
          </div>
          <Award className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:scale-110 transition" size={100} />
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-400 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group hover:scale-105 transition duration-300 cursor-pointer">
          <div className="relative z-10">
            <p className="text-green-100 font-bold mb-1 text-xs uppercase tracking-wider flex items-center gap-2"><TrendingUp size={14}/> Today's Profit</p>
            <h2 className="text-3xl font-black">৳ {stats.todayProfit.toLocaleString()}</h2>
          </div>
          <TrendingUp className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:scale-110 transition" size={100} />
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-blue-600 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group hover:scale-105 transition duration-300 cursor-pointer">
          <div className="relative z-10">
            <p className="text-blue-200 font-bold mb-1 text-xs uppercase tracking-wider flex items-center gap-2"><Landmark size={14}/> System Balance</p>
            <h2 className="text-3xl font-black">৳ {stats.systemBalance.toLocaleString()}</h2>
          </div>
          <Landmark className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:scale-110 transition" size={100} />
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-slate-700 rounded-xl p-6 shadow-lg text-white relative overflow-hidden group hover:scale-105 transition duration-300 cursor-pointer">
          <div className="relative z-10">
            <p className="text-gray-300 font-bold mb-1 text-xs uppercase tracking-wider flex items-center gap-2"><DollarSign size={14}/> Total Revenue</p>
            <h2 className="text-3xl font-black">৳ {stats.totalRevenue.toLocaleString()}</h2>
          </div>
          <DollarSign className="absolute -bottom-4 -right-4 text-white opacity-10 group-hover:scale-110 transition" size={100} />
        </div>

      </div>

      {/* Secondary Profit Analysis */}
      <h3 className="text-lg font-bold text-[#0a1930] mb-4 border-l-4 border-[#0052FF] pl-3">Profit Analysis</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-indigo-300 transition">
          <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600"><BarChart2 size={24}/></div>
          <div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Yesterday Profit</p>
            <h3 className="text-2xl font-black text-indigo-700">৳ {stats.yesterdayProfit.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-teal-300 transition">
          <div className="bg-teal-50 p-3 rounded-lg text-teal-600"><Calendar size={24}/></div>
          <div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">Last 7 Days Profit</p>
            <h3 className="text-2xl font-black text-teal-700">৳ {stats.last7DaysProfit.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:border-sky-300 transition">
          <div className="bg-sky-50 p-3 rounded-lg text-sky-600"><Calendar size={24}/></div>
          <div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">This Month Profit</p>
            <h3 className="text-2xl font-black text-sky-700">৳ {stats.thisMonthProfit.toLocaleString()}</h3>
          </div>
        </div>

      </div>

      {/* Operational Stats (Users & Orders) */}
      <h3 className="text-lg font-bold text-[#0a1930] mb-4 border-l-4 border-orange-500 pl-3">Users & Operations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-bold mb-1 text-[10px] uppercase tracking-wider">Total Users</p>
              <h2 className="text-2xl font-black text-gray-800">{stats.totalUsers}</h2>
            </div>
            <div className="bg-gray-100 p-2.5 rounded-lg text-gray-600"><Users size={20} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-bold mb-1 text-[10px] uppercase tracking-wider">Users Today</p>
              <h2 className="text-2xl font-black text-blue-600">{stats.usersToday}</h2>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><UserPlus size={20} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-bold mb-1 text-[10px] uppercase tracking-wider">Today Orders</p>
              <h2 className="text-2xl font-black text-purple-600">{stats.todayOrders}</h2>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600"><ShoppingBag size={20} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-bold mb-1 text-[10px] uppercase tracking-wider">Pending Orders</p>
              <h2 className="text-2xl font-black text-orange-500">{stats.pendingOrders}</h2>
            </div>
            <div className="bg-orange-100 p-2.5 rounded-lg text-orange-500"><ShoppingCart size={20} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-bold mb-1 text-[10px] uppercase tracking-wider">Pending Deposits</p>
              <h2 className="text-2xl font-black text-[#0052FF]">{stats.pendingDeposits}</h2>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg text-[#0052FF]"><Wallet size={20} /></div>
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