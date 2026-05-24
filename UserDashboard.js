import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [settings, setSettings] = useState({ applicationFields: [], documentTypes: [] });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  }, [navigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Good morning';
    if (hour < 18) return '☀️ Good afternoon';
    return '🌙 Good evening';
  }, []);

  const localTime = useMemo(() => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), []);

  const missingDocuments = useMemo(() => {
    if (!settings.documentTypes?.length) return [];

    const submittedTypes = new Set(
      documents
        .map((doc) => doc.document_type || '')
        .filter(Boolean)
    );

    return settings.documentTypes.filter((type) => !submittedTypes.has(type));
  }, [documents, settings.documentTypes]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, settingsRes] = await Promise.all([
        axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/user/settings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProfile(profileRes.data.user);
      setApplications(profileRes.data.applications || []);
      setDocuments(profileRes.data.documents || []);
      setSettings(settingsRes.data || { applicationFields: [], documentTypes: [] });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        logout();
        return;
      }
      setError(err?.response?.data?.error || err?.message || 'Unable to load user data.');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    loadProfile();
  }, [navigate, token, loadProfile]);

  const handleUpload = async (event) => {
    event.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    if (settings.documentTypes.length > 0 && !selectedDocumentType) {
      setUploadError('Please select the document type requested by your admin.');
      return;
    }

    const applicationId = applications[0]?.id;
    if (!applicationId) {
      setUploadError('No active application found.');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('applicationId', applicationId);
    formData.append('userId', profile.id);
    if (selectedDocumentType) {
      formData.append('documentType', selectedDocumentType);
    }

    setUploadLoading(true);
    try {
      const res = await axios.post('/api/user/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUploadSuccess(res.data.message || 'Upload successful');
      setSelectedFile(null);
      setSelectedDocumentType('');
      await loadProfile();
    } catch (err) {
      setUploadError(err?.response?.data?.error || err?.message || 'Upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return <div className="page-shell"><LoadingSpinner message="Loading your portal..." /></div>;
  }

  return (
    <div className="user-page page-shell">
      <div className="top-bar card">
        <div>
          <p className="eyebrow">Applicant portal</p>
          <h1>{greeting} {profile?.full_name || 'Applicant'}</h1>
          <p className="subtext">It is {localTime}. Track your application status and upload the requested documents.</p>
        </div>
        <button className="secondary-button" onClick={logout}>Logout</button>
      </div>

      <div className="user-grid">
        <div className="card user-summary">
          <h2>Your profile</h2>
          <p><strong>Name:</strong> {profile?.full_name || 'Unknown'}</p>
          <p><strong>Email:</strong> {profile?.email}</p>
          <p><strong>Role:</strong> {profile?.role}</p>
        </div>

        <div className="card user-summary">
          <h2>Application status</h2>
          {applications.length === 0 ? (
            <p>No application found yet.</p>
          ) : (
            <div>
              <p><strong>Status:</strong> {applications[0].status || 'Pending'}</p>
              <p>
                <strong>Submitted:</strong>{' '}
                {new Date(applications[0].inserted_at || applications[0].created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card form-card">
        <h2>Required application details</h2>
        <p className="subtext">Complete the fields your admin requested for this application.</p>
        {settings.applicationFields.length === 0 ? (
          <div className="empty-state">No additional fields have been requested yet.</div>
        ) : (
          <ul className="required-list">
            {settings.applicationFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card form-card">
        <h2>Required documents</h2>
        <p className="subtext">Upload the documents requested by your admin.</p>
        {settings.documentTypes.length === 0 ? (
          <div className="empty-state">No specific documents requested yet.</div>
        ) : (
          <>
            <ul className="required-list">
              {settings.documentTypes.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
            {missingDocuments.length > 0 && (
              <div className="status-block">
                <p><strong>Missing documents:</strong></p>
                <ul className="required-list">
                  {missingDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
            {missingDocuments.length === 0 && settings.documentTypes.length > 0 && (
              <div className="success-card"><p>You have uploaded all required documents.</p></div>
            )}
          </>
        )}
      </div>

      <div className="card form-card">
        <h2>Upload a document</h2>
        <p className="subtext">Attach a file for your application.</p>
        <form className="create-user-form" onSubmit={handleUpload}>
          <label>
            Choose file
            <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          </label>
          {settings.documentTypes.length > 0 && (
            <label>
              Document type
              <select value={selectedDocumentType} onChange={(e) => setSelectedDocumentType(e.target.value)}>
                <option value="">Select document type</option>
                {settings.documentTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" disabled={uploadLoading}>{uploadLoading ? 'Uploading...' : 'Upload'}</button>
        </form>
        {uploadError && <div className="error">{uploadError}</div>}
        {uploadSuccess && <div className="success-card"><p>{uploadSuccess}</p></div>}
      </div>

      <div className="table-card card">
        <div className="table-card-header">
          <div>
            <h2>Your documents</h2>
            <p className="subtext">Uploaded files associated with your application.</p>
          </div>
          <span className="badge">{documents.length} files</span>
        </div>
        {documents.length === 0 ? (
          <div className="empty-state">No documents uploaded yet.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Uploaded</th>
                  <th>Type</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.file_name}</td>
                    <td>{new Date(doc.inserted_at || doc.created_at || Date.now()).toLocaleDateString()}</td>
                    <td>{doc.document_type || 'Custom'}</td>
                    <td><a href={doc.file_url} target="_blank" rel="noreferrer">View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default UserDashboard;

