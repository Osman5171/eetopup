import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import OneSignal from 'react-onesignal';
import { supabase } from './supabaseClient';

// User Components
import ThemePreview from './pages/ThemePreview';
import AdminBrands from './pages/admin/AdminBrands';
import BottomNav from './components/BottomNav';
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
import Maintenance from './pages/Maintenance';

// Admin Components & Layout
import AdminProducts from './pages/admin/AdminProducts';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminPackages from './pages/admin/AdminPackages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSlider from './pages/admin/AdminSlider';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPromo from './pages/admin/AdminPromo';

// সাধারণ ইউজারদের লেআউট
const UserLayout = () => {
  return (
    // 👈 pb-16 যোগ করা হয়েছে যাতে নিচের BottomNav এর নিচে কন্টেন্ট না ঢোকে
    <div className="min-h-screen bg-[#f4f7fb] font-sans flex flex-col pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 pb-12 flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <InstallBanner /> 
      <BottomNav /> {/* 👈 BottomNav এখানে যুক্ত করা হয়েছে */}
    </div>
  );
};

function App() {
  const [maintenance, setMaintenance] = useState({ active: false, endTime: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // OneSignal শুরু করা
    const runOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "e880ec17-fedf-4994-848d-73810e36f442", 
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: true },
        });
        OneSignal.Slidedown.promptPush();
      } catch (e) { console.error(e); }
    };
    runOneSignal();

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

  if (loading) return null;

  if (maintenance.active) {
    return <Maintenance endTime={maintenance.endTime} />;
  }

  return (
    <Router>
      <Routes>
        
        {/* User Der Jonno Routes */}
          <Route path="/preview" element={<ThemePreview />} />
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
          <Route path="brands" element={<AdminBrands />} /> {/* 👈 এটিকে সঠিক জায়গায় /admin এর ভেতরে আনা হয়েছে */}
          <Route path="products" element={<AdminProducts />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="slider" element={<AdminSlider />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="promo" element={<AdminPromo />} /> 
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;