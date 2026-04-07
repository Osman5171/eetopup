import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const uddoktaApiKey = Deno.env.get('UDDOKTAPAY_API_KEY');

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // API Key Verification
    const reqApiKey = req.headers.get('RT-UDDOKTAPAY-API-KEY') || req.headers.get('rt-uddoktapay-api-key');
    if (uddoktaApiKey && reqApiKey !== uddoktaApiKey) {
        return new Response('Unauthorized Webhook Request', { status: 401 });
    }

    const payload = await req.json();
    const { status, amount, transaction_id, invoice_id, metadata, payment_method, sender_number } = payload;
    
    const finalTrxId = transaction_id || invoice_id;
    const userId = metadata?.user_id;

    if (!userId) return new Response('User ID missing', { status: 400 });

    // শুধুমাত্র পেমেন্ট COMPLETED হলেই ব্যালেন্স অ্যাড হবে
    if (String(status).trim().toUpperCase() === 'COMPLETED') {
      
      // ১. চেক করা যে এই TrxID আগে ব্যবহার হয়েছে কিনা (Double Add বন্ধ করতে)
      const { data: existingTrx } = await supabase.from('deposits').select('id').eq('trx_id', finalTrxId).single();
      
      if (existingTrx) {
        return new Response('Transaction already processed', { status: 200 });
      }

      // ২. ইউজারের ব্যালেন্স আপডেট করা
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', userId).single();
      const newBalance = parseFloat(profile?.balance || 0) + parseFloat(amount);
      
      await supabase.from('profiles').update({ balance: newBalance }).eq('id', userId);

      // ৩. Deposits টেবিলে রেকর্ড সেভ করা
      await supabase.from('deposits').insert({
          user_id: userId,
          amount: parseFloat(amount),
          trx_id: finalTrxId,
          sender_number: sender_number || 'Auto Gateway',
          method: payment_method || 'UddoktaPay',
          status: 'approved' // অটো এপ্রুভ হয়ে যাবে
      });

      console.log(`✅ Balance ${amount} added to user ${userId}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
})