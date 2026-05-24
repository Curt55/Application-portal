const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test route
app.get('/', (req, res) => {
  res.send('Client Portal Backend is running! 🚀');
});

// ============ AUTHENTICATION ============

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });
  
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  
  // Get profile
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

// Check if user is admin
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

// Get client from token
const getClient = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.client = user;
  next();
};

// ============ ADMIN ROUTES ============

// Get all users (both admins and clients) - FIXED
app.get('/api/admin/clients', isAdmin, async (req, res) => {
  console.log('Fetching all users...');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Users fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log(`Found ${data?.length || 0} users`);
  res.json(data || []);
});

// Create new client
app.post('/api/admin/clients', isAdmin, async (req, res) => {
  const { email, full_name, password } = req.body;
  
  const finalPassword = password || Math.random().toString(36).slice(-8);
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: finalPassword,
    email_confirm: true,
    user_metadata: { full_name }
  });
  
  if (authError) {
    return res.status(400).json({ error: authError.message });
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      full_name,
      role: 'client'
    })
    .select()
    .single();
  
  if (profileError) {
    return res.status(500).json({ error: profileError.message });
  }
  
  await supabase.from('client_requirements').insert({ client_id: profile.id });
  await supabase.from('submissions').insert({ client_id: profile.id, status: 'incomplete' });
  
  res.json({
    message: 'Client created successfully',
    client: profile,
    credentials: { email, password: finalPassword }
  });
});

// Get client requirements
app.get('/api/admin/clients/:id/requirements', isAdmin, async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('client_requirements')
    .select('*')
    .eq('client_id', id)
    .maybeSingle();
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data || { required_fields: [], required_documents: [] });
});

// Update client requirements
app.put('/api/admin/clients/:id/requirements', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { required_fields, required_documents } = req.body;
  
  const { data, error } = await supabase
    .from('client_requirements')
    .update({
      required_fields: required_fields || [],
      required_documents: required_documents || [],
      updated_at: new Date()
    })
    .eq('client_id', id)
    .select();
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data[0] || { success: true });
});

// Get all submissions
app.get('/api/admin/submissions', isAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Submissions fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log('Found submissions:', data?.length);
  res.json(data || []);
});

// Update submission status
app.patch('/api/admin/submissions/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;
  
  console.log('Updating submission:', id, 'to status:', status);
  
  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: status,
      admin_notes: admin_notes || null,
      updated_at: new Date()
    })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Status update error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log('Status updated successfully');
  res.json(data[0] || { success: true });
});

// Get all documents
app.get('/api/admin/documents', isAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order('uploaded_at', { ascending: false });
  
  if (error) {
    console.error('Documents fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log('Found documents:', data?.length);
  res.json(data || []);
});

// Get all messages for admin
app.get('/api/admin/messages', isAdmin, async (req, res) => {
  console.log('Fetching all messages');
  
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      from_user:profiles!from_user_id (
        id,
        full_name,
        email,
        role
      ),
      to_user:profiles!to_user_id (
        id,
        full_name,
        email,
        role
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Messages fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log('Found messages:', data?.length || 0);
  res.json(data || []);
});

// Mark message as read
app.patch('/api/messages/:id/read', async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const { error: updateError } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', id)
    .eq('to_user_id', user.id);
  
  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }
  
  res.json({ success: true });
});

// Get unread count for current user
app.get('/api/messages/unread/count', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const { count, error: countError } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', user.id)
    .eq('is_read', false);
  
  if (countError) {
    return res.status(500).json({ error: countError.message });
  }
  
  res.json({ unreadCount: count || 0 });
});

// Get available statuses
app.get('/api/admin/statuses', isAdmin, async (req, res) => {
  res.json({
    statuses: [
      { value: 'incomplete', label: 'Incomplete', color: '#6b7280' },
      { value: 'reviewing', label: 'Under Review', color: '#f59e0b' },
      { value: 'processing', label: 'Processing', color: '#3b82f6' },
      { value: 'approved', label: 'Approved', color: '#10b981' },
      { value: 'declined', label: 'Declined', color: '#ef4444' }
    ]
  });
});

// Send message to client
app.post('/api/admin/messages', isAdmin, async (req, res) => {
  const { to_user_id, message } = req.body;
  
  console.log('Admin sending message to:', to_user_id);
  
  if (!message || !to_user_id) {
    return res.status(400).json({ error: 'Message and recipient are required' });
  }
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      from_user_id: req.user.id,
      to_user_id: to_user_id,
      message: message,
      is_read: false,
      created_at: new Date()
    })
    .select();
  
  if (error) {
    console.error('Insert error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log('Message sent successfully');
  res.json({ success: true, message: 'Message sent' });
});

// ============ CLIENT ROUTES ============

// Get client dashboard data
app.get('/api/client/dashboard', getClient, async (req, res) => {
  const clientId = req.client.id;
  
  const { data: requirements } = await supabase
    .from('client_requirements')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle();
  
  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle();
  
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', clientId)
    .order('uploaded_at', { ascending: false });
  
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      profiles!from_user_id (
        full_name,
        role
      )
    `)
    .or(`from_user_id.eq.${clientId},to_user_id.eq.${clientId}`)
    .order('created_at', { ascending: true });
  
  res.json({
    requirements: requirements || { required_fields: [], required_documents: [] },
    submission: submission || { field_data: {}, status: 'incomplete' },
    documents: documents || [],
    messages: messages || []
  });
});

// Update client submission
app.put('/api/client/submission', getClient, async (req, res) => {
  const { field_data } = req.body;
  const clientId = req.client.id;
  
  try {
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('client_id', clientId)
      .maybeSingle();
    
    if (existing) {
      await supabase
        .from('submissions')
        .update({
          field_data: field_data,
          updated_at: new Date()
        })
        .eq('client_id', clientId);
    } else {
      await supabase
        .from('submissions')
        .insert({
          client_id: clientId,
          field_data: field_data,
          status: 'incomplete',
          created_at: new Date(),
          updated_at: new Date()
        });
    }
    
    res.json({ success: true, message: 'Submission saved' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload document
app.post('/api/client/upload', getClient, upload.single('file'), async (req, res) => {
  const { document_type } = req.body;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const filePath = `${req.client.id}/${Date.now()}_${file.originalname}`;
  
  const { error: uploadError } = await supabase.storage
    .from('client-documents')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype
    });
  
  if (uploadError) {
    return res.status(500).json({ error: uploadError.message });
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('client-documents')
    .getPublicUrl(filePath);
  
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      client_id: req.client.id,
      document_type,
      file_name: file.originalname,
      file_url: publicUrl
    })
    .select();
  
  if (docError) {
    return res.status(500).json({ error: docError.message });
  }
  
  res.json(document[0]);
});

// Send message to admin
app.post('/api/client/message', getClient, async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    const { data: admin, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();
    
    if (adminError || !admin) {
      return res.status(500).json({ error: 'No admin found' });
    }
    
    const { error } = await supabase
      .from('messages')
      .insert({
        from_user_id: req.client.id,
        to_user_id: admin.id,
        message: message,
        is_read: false,
        created_at: new Date()
      });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ success: true, message: 'Message sent' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Route: Delete a user completely (auth + profiles + all related data)
app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
  const userId = req.params.id;
  
  // Don't allow deleting yourself
  if (userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  
  try {
    // 1. Get user's submissions
    const { data: submissions } = await supabase
      .from('submissions')
      .select('id')
      .eq('client_id', userId);
    
    const submissionIds = submissions?.map(s => s.id) || [];
    
    // 2. Delete documents linked to submissions
    if (submissionIds.length > 0) {
      await supabase.from('documents').delete().in('submission_id', submissionIds);
    }
    
    // 3. Delete documents directly linked to user
    await supabase.from('documents').delete().eq('client_id', userId);
    
    // 4. Delete messages
    await supabase.from('messages').delete().or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
    
    // 5. Delete submissions
    await supabase.from('submissions').delete().eq('client_id', userId);
    
    // 6. Delete requirements
    await supabase.from('client_requirements').delete().eq('client_id', userId);
    
    // 7. Delete profile
    await supabase.from('profiles').delete().eq('id', userId);
    
    // 8. Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Auth delete error:', authError);
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SEND PASSWORD RESET EMAIL ROUTE (USES SUPABASE BUILT-IN EMAIL) ============

// Admin Route: Send password reset email to user (no email config needed!)
// Admin Route: Reset user password and return new password (no email needed)
app.post('/api/admin/users/:id/reset-password', isAdmin, async (req, res) => {
  const userId = req.params.id;
  const newPassword = Math.random().toString(36).slice(-8);
  
  console.log(`Resetting password for user: ${userId}`);
  
  try {
    const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    
    if (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    // Get user email and name for response
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      credentials: {
        email: profile?.email || updatedUser.user?.email,
        password: newPassword,
      },
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;