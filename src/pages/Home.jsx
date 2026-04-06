import React from 'react';
import { Link } from 'react-router-dom'; // Routing er jonno Link import kora holo
import NoticeBar from '../components/NoticeBar';
import HeroSlider from '../components/HeroSlider';
import LatestOrders from '../components/LatestOrders'; // Latest Orders import kora holo

const Home = () => {
  // Eita holo ekta mock data. Vobisshote eita Supabase Database theke ashbe.
  const categories = [
    { id: 1, name: 'Diamond Top Up', type: 'Diamond Top Up', image: 'https://eagleeyetopup.com/ff.png' },
    { id: 2, name: 'Weekly/Monthly', type: 'Weekly/Monthly', image: 'https://eagleeyetopup.com/ff.png' },
    { id: 3, name: 'E-Badge/Evo Gun Access', type: 'E-Badge', image: 'https://eagleeyetopup.com/ff.png' },
    { id: 4, name: 'New Level Up Pass', type: 'Level Up', image: 'https://eagleeyetopup.com/ff.png' },
    { id: 5, name: 'Unipin Voucher (BD)', type: 'Unipin', image: 'https://eagleeyetopup.com/ff.png' },
  ];

  return (
    // Ekhane animate-fade-in-up add kora holo
    <div className="w-full animate-fade-in-up">
      <NoticeBar />
      <HeroSlider />

      {/* Free Fire Section */}
      <div className="mt-10">
        <h2 className="text-center text-2xl font-bold text-[#0a1930] mb-8">Free Fire</h2>
        
        {/* Grid for Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((item) => (
            // div er poriborte ekhane Link bebohar kora hoyeche
            <Link to="/topup" key={item.id} className="flex flex-col items-center cursor-pointer group">
              {/* Image Container with gradient background */}
              <div className="bg-gradient-to-b from-[#0052FF] to-[#002f99] p-[2px] rounded-2xl shadow-lg transition transform group-hover:-translate-y-1">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl bg-[#0a1930]" 
                />
              </div>
              {/* Title */}
              <p className="mt-3 text-sm md:text-base font-bold text-[#0a1930] text-center">
                {item.name}
              </p>
              {item.type && (
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  💎 {item.type}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Orders Section */}
      <LatestOrders />

    </div>
  );
};

export default Home;