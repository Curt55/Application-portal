const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setup() {
  console.log('🚀 Setting up your Client Portal...\n');
  
  // Create Admin User
  console.log('Creating admin user...');
  const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@portal.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: { full_name: 'System Admin' }
  });
  
  if (adminError) {
    console.log('⚠️  Admin might already exist:', adminError.message);
  } else {
    await supabase.from('profiles').insert({
      id: adminAuth.user.id,
      email: 'admin@portal.com',
      full_name: 'System Admin',
      role: 'admin'
    });
    console.log('✅ Admin created: admin@portal.com / admin123');
  }
  
  // Create Test Client
  console.log('\nCreating test client...');
  const { data: clientAuth, error: clientError } = await supabase.auth.admin.createUser({
    email: 'client@test.com',
    password: 'client123',
    email_confirm: true,
    user_metadata: { full_name: 'Test Client' }
  });
  
  if (clientError) {
    console.log('⚠️  Client might already exist:', clientError.message);
  } else {
    await supabase.from('profiles').insert({
      id: clientAuth.user.id,
      email: 'client@test.com',
      full_name: 'Test Client',
      role: 'client'
    });
    
    await supabase.from('client_requirements').insert({ 
      client_id: clientAuth.user.id,
      required_fields: ['Full Name', 'Email', 'Phone Number'],
      required_documents: ['ID Card', 'Contract']
    });
    
    await supabase.from('submissions').insert({ 
      client_id: clientAuth.user.id 
    });
    
    console.log('✅ Client created: client@test.com / client123');
  }
  
  console.log('\n🎉 Setup complete!');
  console.log('\n📝 Login Credentials:');
  console.log('   Admin:  admin@portal.com / admin123');
  console.log('   Client: client@test.com / client123');
  console.log('\n🚀 You can now start your backend: node index.js');
}

setup();