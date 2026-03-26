const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
async function test() {
  const { data, error } = await supabase.from('bookings').select('*, profiles(email), services(name, price_mga)').limit(1).single();
  console.log('Result:', data, error);
}
test();
