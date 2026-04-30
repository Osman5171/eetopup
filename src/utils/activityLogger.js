import { supabase } from '../supabaseClient';

export const logActivity = async (action, details) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, name')
        .eq('id', user.id)
        .single();

    // Top-up site a generally 'full_name' thake, esp te 'name' thakto
    const adminName = profile?.full_name || profile?.name || 'Unknown Admin';

    const { error } = await supabase.from('activity_logs').insert([
      {
        admin_id: user.id,
        admin_name: adminName,
        action: action,
        details: details
      }
    ]);

    if (error) console.error('Failed to log activity:', error);
  } catch (err) {
    console.error('Logger Error:', err);
  }
};