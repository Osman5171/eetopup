import React, { useEffect, useState } from 'react'; // 👈 useState যুক্ত করা হয়েছে
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import OneSignal from 'react-onesignal';
import { supabase } from './supabaseClient'; // 👈 supabase ইমপোর্ট নিশ্চিত করুন

// User Components
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import InstallBanner from './components/InstallBanner';
import Home from './pages/Home';
import Topup from './pages/Topup';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Maintenance from './pages/Maintenance'; // 👈 মেইনটেন্যান্স পেজ ইমপোর্ট

// Admin Components & Layout
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminPackages from './pages/admin/AdminPackages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSlider from './pages/admin/AdminSlider';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPromo from './pages/admin/AdminPromo';
import AdminActivityLogs from './pages/admin/AdminActivityLogs'; // 👈 এটিও যুক্ত করে দিলাম

// সাধারণ ইউজারদের লেআউট
const UserLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pb-12 flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <InstallBanner /> 
    </div>
  );
};

function App() {
  const [maintenance, setMaintenance] = useState({ active: false, endTime: null });
  const [loading, setLoading] = useState(true);

  // ১. OneSignal এবং মেইনটেন্যান্স চেক
  useEffect(() => {
    // OneSignal শুরু করা
    const runOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "YOUR_ONESIGNAL_APP_ID_HERE", 
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: true },
        });
        OneSignal.Slidedown.promptPush();
      } catch (e) { console.error(e); }
    };
    runOneSignal();

    // মেইনটেন্যান্স স্ট্যাটাস চেক করা
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setMaintenance({
          active: data.is_maintenance,
          endTime: data.maintenance_end_time
        });
      }
    } catch (error) {
      console.error("Settings fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ডাটা লোড হওয়ার আগে কিছু দেখাবে না
  if (loading) return null;

  // ২. মেইনটেন্যান্স অন থাকলে শুধু এই পেজটিই দেখাবে
  if (maintenance.active) {
    return <Maintenance endTime={maintenance.endTime} />;
  }

  return (
    <Router>
      <Routes>
        
        {/* User Der Jonno Routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/topup" element={<Topup />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        {/* Admin Der Jonno Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> 
          <Route path="orders" element={<AdminOrders />} />
          <Route path="deposits" element={<AdminDeposits />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="slider" element={<AdminSlider />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="promo" element={<AdminPromo />} /> 
          <Route path="logs" element={<AdminActivityLogs />} />
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;