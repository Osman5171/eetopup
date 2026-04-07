import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

Deno.serve(async (req) => {
  // CORS Headers for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, fullName, email, userId } = await req.json();
    
    const apiKey = Deno.env.get('UDDOKTAPAY_API_KEY');
    const baseUrl = Deno.env.get('UDDOKTAPAY_BASE_URL');

    if (!apiKey || !baseUrl) throw new Error("API Keys missing in Supabase!");

    const payload = {
      full_name: fullName || 'Topup User',
      email: email,
      amount: amount,
      metadata: {
        user_id: userId,
        type: 'add_money'
      },
      // ⚠️ এখানে আপনার ওয়েবসাইটের আসল লিংক দেবেন
      redirect_url: "https://topup.eagleeyeesports.com/#/profile",
      cancel_url: "https://topup.eagleeyeesports.com/#/topup",
      webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/uddokta-webhook`
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'RT-UDDOKTAPAY-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, headers: corsHeaders 
    });
  }
})