const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'Client Portal Backend is running! 🚀' });
});

// ============ AUTHENTICATION ============
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  if (profileError) {
    return res.status(500).json({ error: 'Profile fetch failed' });
  }
  
  res.json({
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name: profile.full_name,
      role: profile.role
    }
  });
});

// ============ MIDDLEWARE ============
const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  req.user = user;
  next();
};

// ============ ADMIN ROUTES ============
app.get('/api/admin/clients', isAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data || []);
});

// Add more routes here (copy from your index.js)

// Export the handler
exports.handler = serverless(app);