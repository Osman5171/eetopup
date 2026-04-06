import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Routing er jonno import
import Header from './components/Header';
import Home from './pages/Home';
import Topup from './pages/Topup'; // Notun banano Topup page
import Footer from './components/Footer'; 
import Profile from './pages/Profile';

function App() {
  return (
    // Puro app tike Router er vetor rakhte hobe
    <Router>
      <div className="min-h-screen bg-[#f4f7fb] font-sans flex flex-col">
        
        <Header />

        {/* Main Content Area */}
        <main className="container mx-auto px-4 pb-12 flex-grow">
           {/* Ekhane amra Routes bebohar kore page gulo set korechi */}
           <Routes>
            <Route path="/profile" element={<Profile />} />
             <Route path="/" element={<Home />} />           {/* Main url e asle Home dekhabe */}
             <Route path="/topup" element={<Topup />} />     {/* /topup url e gele Topup page dekhabe */}
           </Routes>
        </main>
        
        {/* Nicher Footer */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;