import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// User Components
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat'; // নতুন ইমপোর্ট
import Home from './pages/Home';
import Topup from './pages/Topup';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Contact from './pages/Contact'; // নতুন ইমপোর্ট

// Admin Components & Layout
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminPackages from './pages/admin/AdminPackages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSlider from './pages/admin/AdminSlider';
import AdminSettings from './pages/admin/AdminSettings';

// সাধারণ ইউজারদের লেআউট (Header ও Footer সহ)
const UserLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pb-12 flex-grow">
        <Outlet /> {/* এখানে Home, Topup, Contact এগুলো লোড হবে */}
      </main>
      <Footer />
      {/* WhatsApp Floating Button - এটি সব পেজে দেখা যাবে */}
      <WhatsAppFloat />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* User Der Jonno Routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/topup" element={<Topup />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} /> {/* নতুন রুট */}
        </Route>

        {/* Admin Der Jonno Routes (সবগুলো AdminLayout এর ভেতরে) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> 
          <Route path="orders" element={<AdminOrders />} />
          <Route path="deposits" element={<AdminDeposits />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="slider" element={<AdminSlider />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;