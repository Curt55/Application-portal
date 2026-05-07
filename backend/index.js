const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const crypto = require('crypto');
const upload = multer({ storage: multer.memoryStorage() }); // Store file in RAM temporarily
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const portalSettings = {
  applicationFields: [],
  documentTypes: [],
};

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to read JSON sent from React

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simple Test Route
app.get('/', (req, res) => {
  res.send('Portal Backend is running! 🚀');
});

// Middleware to check if the user is an Admin
const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) return res.status(401).json({ error: "No token provided" });

  // Verify the token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return res.status(401).json({ error: "Invalid session" });

  // Check the role in the database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  // If everything is fine, proceed to the next function
  req.user = user;
  next();
};

const loadPortalSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('portal_settings')
      .select('key, value')
      .in('key', ['applicationFields', 'documentTypes']);

    if (error || !Array.isArray(data)) {
      throw error || new Error('Settings not available');
    }

    const settings = { ...portalSettings };
    data.forEach((row) => {
      if (row.key === 'applicationFields') settings.applicationFields = row.value || [];
      if (row.key === 'documentTypes') settings.documentTypes = row.value || [];
    });
    return settings;
  } catch (err) {
    return { ...portalSettings };
  }
};

const savePortalSettings = async (settings) => {
  try {
    const payload = [
      { key: 'applicationFields', value: settings.applicationFields || [] },
      { key: 'documentTypes', value: settings.documentTypes || [] },
    ];

    const { error } = await supabase
      .from('portal_settings')
      .upsert(payload, { onConflict: 'key' });

    if (error) throw error;
    return settings;
  } catch (err) {
    Object.assign(portalSettings, settings);
    return { ...portalSettings };
  }
};

app.get('/api/admin/settings', isAdmin, async (req, res) => {
  const settings = await loadPortalSettings();
  res.status(200).json(settings);
});

app.post('/api/admin/settings', isAdmin, async (req, res) => {
  const { applicationFields, documentTypes } = req.body;
  const saved = await savePortalSettings({ applicationFields: applicationFields || [], documentTypes: documentTypes || [] });
  res.status(200).json(saved);
});

app.get('/api/user/settings', async (req, res) => {
  const settings = await loadPortalSettings();
  res.status(200).json(settings);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is purring on http://localhost:${PORT}`);
});

// Admin Route: Register a new user
app.post('/api/admin/register-user', isAdmin, async (req, res) => {
  const { email, password, fullName } = req.body;
  const generatedPassword = password || crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, 'A');

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: generatedPassword,
    email_confirm: true // This bypasses the need for the user to click a link to activate
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const userId = authData.user.id;

  try {
    // 2. Insert into the 'profiles' table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { id: userId, email: email, full_name: fullName, role: 'user' }
      ]);

    if (profileError) throw profileError;

    // 3. Create an initial 'application' entry for them
    const { error: appError } = await supabase
      .from('applications')
      .insert([
        { user_id: userId, status: 'Pending' }
      ]);

    if (appError) throw appError;

    res.status(201).json({ 
      message: 'User registered successfully!', 
      user: authData.user,
      credentials: {
        email,
        password: generatedPassword,
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});

// Admin Route: List all users
app.get('/api/admin/users', isAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data || []);
});

// Admin Route: Reset user password
app.post('/api/admin/users/:id/reset-password', isAdmin, async (req, res) => {
  const userId = req.params.id;
  const newPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, 'A');

  const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({
    message: 'Password reset successfully',
    credentials: {
      email: updatedUser.user.email,
      password: newPassword,
    },
  });
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Authenticate with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });

  // 2. Fetch the user's role from our 'profiles' table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single();

  if (profileError) return res.status(500).json({ error: "Profile fetch failed" });

  // 3. Send back the session and the role
  res.status(200).json({
    message: "Login successful",
    session: data.session,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile.role,
      fullName: profile.full_name
    }
  });
});

// User Route: Fetch current user info
app.get('/api/user/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError) return res.status(500).json({ error: profileError.message });

  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('id, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (applicationsError) return res.status(500).json({ error: applicationsError.message });

  const applicationIds = applications.map((app) => app.id);
  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('id, file_name, file_url, created_at, application_id, document_type')
    .in('application_id', applicationIds);

  if (documentsError) return res.status(500).json({ error: documentsError.message });

  const settings = await loadPortalSettings();
  const uploadedDocumentTypes = new Set((documents || []).map((doc) => doc.document_type).filter(Boolean));
  const missingDocuments = (settings.documentTypes || []).filter((type) => !uploadedDocumentTypes.has(type));

  res.status(200).json({ user: profile, applications, documents, settings, missingDocuments });
});

// User Route: Upload a document
app.post('/api/user/upload', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    const { applicationId, userId } = req.body; // Sent from frontend

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // 1. Create a unique file path (e.g., user_123/162534_resume.pdf)
    const filePath = `${userId}/${Date.now()}_${file.originalname}`;

    // 2. Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('user-documents') // The bucket name we created
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (storageError) throw storageError;

    // 3. Get the Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-documents')
      .getPublicUrl(filePath);

    // 4. Save metadata to the 'documents' table
    const documentPayload = {
      application_id: applicationId,
      file_name: file.originalname,
      file_url: publicUrl,
      ...(req.body.documentType ? { document_type: req.body.documentType } : {}),
    };

    let dbError;
    let insertResult = await supabase.from('documents').insert([documentPayload]);
    dbError = insertResult.error;

    if (dbError && dbError.message && dbError.message.toLowerCase().includes('column')) {
      // Fallback if the documents table does not have a document_type column
      const fallbackPayload = {
        application_id: applicationId,
        file_name: file.originalname,
        file_url: publicUrl,
      };
      insertResult = await supabase.from('documents').insert([fallbackPayload]);
      dbError = insertResult.error;
    }

    if (dbError) throw dbError;

    res.status(200).json({ message: "File uploaded successfully!", url: publicUrl });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Admin Route: Get all documents for all users
app.get('/api/admin/documents', isAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      applications (
        status,
        profiles (full_name, email)
      )
    `);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
});