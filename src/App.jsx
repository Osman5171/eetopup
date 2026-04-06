import React from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// User Components
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Topup from './pages/Topup';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminDeposits from './pages/admin/AdminDeposits';

// Admin Components
import AdminSlider from './pages/admin/AdminSlider';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders'; // Notun AdminOrders import kora holo

// Sadharon user der layout (Header o Footer soho)
const UserLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pb-12 flex-grow">
        <Outlet /> {/* Ekhane Home, Topup egulo load hobe */}
      </main>
      <Footer />
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
        </Route>

        {/* Admin Der Jonno Routes */}
        <Route path="deposits" element={<AdminDeposits />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} /> {/* /admin e gele eita dekhabe */}
          <Route path="orders" element={<AdminOrders />} /> {/* Orders er notun route add kora holo */}
        </Route>

      </Routes>
    </Router>
  );
}

export default App;