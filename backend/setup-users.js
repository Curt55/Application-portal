const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase Admin Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createInitialUsers() {
  try {
    console.log('Creating initial users...');

    // Create Admin User
    const adminEmail = 'admin@portal.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    console.log('Creating admin user...');
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (adminError) {
      console.error('Error creating admin:', adminError.message);
    } else {
      // Insert admin profile
      await supabase.from('profiles').insert([
        { id: adminData.user.id, email: adminEmail, full_name: adminName, role: 'admin' }
      ]);
      console.log('✅ Admin user created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }

    // Create Regular User
    const userEmail = 'user@portal.com';
    const userPassword = 'user123';
    const userName = 'Regular User';

    console.log('Creating regular user...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true
    });

    if (userError) {
      console.error('Error creating user:', userError.message);
    } else {
      // Insert user profile and application
      await supabase.from('profiles').insert([
        { id: userData.user.id, email: userEmail, full_name: userName, role: 'user' }
      ]);

      await supabase.from('applications').insert([
        { user_id: userData.user.id, status: 'Pending' }
      ]);

      console.log('✅ Regular user created successfully!');
      console.log(`Email: ${userEmail}`);
      console.log(`Password: ${userPassword}`);
    }

    console.log('\n🎉 Setup complete! You can now login with these credentials.');

  } catch (error) {
    console.error('Setup failed:', error.message);
  }
}

createInitialUsers();