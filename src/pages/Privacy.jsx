import React from 'react';
import { ShieldCheck, Lock, Eye, FileWarning } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 md:p-10 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up mb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-[#0052FF] rounded-xl">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-bold text-[#0a1930]">Privacy Policy</h1>
      </div>

      <div className="prose prose-blue text-gray-600 space-y-6">
        <section>
          <h3 className="text-xl font-bold text-[#0a1930] flex items-center gap-2">
            <Eye size={20} className="text-blue-500"/> Information We Collect
          </h3>
          <p>We collect basic information such as your name, email address, and phone number when you register or place an order. For game top-ups, we also collect your Player ID/UID.</p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#0a1930] flex items-center gap-2">
            <Lock size={20} className="text-blue-500"/> Data Security
          </h3>
          <p>Your security is our priority. We use encryption to protect your personal data and transaction details. We never store your payment credentials like bKash/Nagad PINs or passwords.</p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#0a1930] flex items-center gap-2">
            <FileWarning size={20} className="text-blue-500"/> Third-Party Disclosure
          </h3>
          <p>We do not sell or trade your personal information. However, necessary details (like Player ID) are shared with our game top-up providers only to complete your order.</p>
        </section>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-8">
          <p className="text-sm text-blue-800 font-medium">
            Note: By using Eagle Eye Topup, you consent to our privacy policy. We may update this policy periodically to improve our services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;