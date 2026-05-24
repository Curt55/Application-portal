require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  // Test 1: Simple query
  const { data, error } = await supabase.from('profiles').select('count');
  console.log('Test 1 - Profiles table:', data, error);
  
  // Test 2: List auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  console.log('Test 2 - Auth users count:', authUsers?.users?.length || 0);
  console.log('Test 2 - Auth users:', authUsers?.users?.map(u => u.email));
  
  // Test 3: Check if admin exists
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@portal.com')
    .single();
  console.log('Test 3 - Admin profile exists?', adminProfile);
}

testConnection();