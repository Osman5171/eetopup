import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import OneSignal from 'react-onesignal';
import { supabase } from './supabaseClient';

// User Components
import ErrorBoundary from './components/ErrorBoundary';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import InstallBanner from './components/InstallBanner';
import Home from './pages/Home';
import Topup from './pages/Topup';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders'; // <-- ফিক্স করা হয়েছে (নতুন লাইন)
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Maintenance from './pages/Maintenance';
import Support from './pages/Support';

// Admin Components & Layout
import AdminBrands from './pages/admin/AdminBrands';
import AdminProducts from './pages/admin/AdminProducts';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminVouchers from './pages/admin/AdminVouchers';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminPackages from './pages/admin/AdminPackages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSlider from './pages/admin/AdminSlider';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPromo from './pages/admin/AdminPromo';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans flex flex-col pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 pb-12 flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <InstallBanner /> 
      <BottomNav />
    </div>
  );
}

function App() {
  const [maintenance, setMaintenance] = useState({ active: false, endTime: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  if (maintenance.active) {
    return <Maintenance endTime={maintenance.endTime} />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* User Der Jonno Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/topup" element={<Topup />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* Admin Der Jonno Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} /> 
            <Route path="orders" element={<AdminOrders />} />
            <Route path="vouchers" element={<AdminVouchers />} />
            <Route path="deposits" element={<AdminDeposits />} />
            <Route path="brands" element={<AdminBrands />} /> 
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
    </ErrorBoundary>
  );
}

export default App;