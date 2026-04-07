import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-[#0a1930] mb-6">Terms and Conditions</h1>
      <div className="prose prose-blue text-gray-600 space-y-4">
        <p>Welcome to Eagle Eye Topup. By using our website, you agree to these terms.</p>
        <h3 className="text-xl font-bold text-[#0a1930]">1. Ordering Policy</h3>
        <p>Please provide the correct Player ID. We are not responsible for diamonds sent to the wrong ID due to user error.</p>
        <h3 className="text-xl font-bold text-[#0a1930]">2. Refund Policy</h3>
        <p>Refunds are only applicable if we fail to deliver the product within 24 hours of payment verification.</p>
      </div>
    </div>
  );
};

export default Terms;