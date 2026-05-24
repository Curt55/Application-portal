import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, Upload, MessageCircle, LogOut, 
  CheckCircle, Clock, XCircle, Send, Mail,
  FolderOpen, User, AlertCircle, FileCheck,
  File, Save, Image, FilePlus, Loader
} from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} color="#10b981" />,
    error: <XCircle size={20} color="#ef4444" />,
    warning: <AlertCircle size={20} color="#f59e0b" />,
    info: <Mail size={20} color="#3b82f6" />
  };

  const bgColors = {
    success: '#d1fae5',
    error: '#fee2e2',
    warning: '#fef3c7',
    info: '#dbeafe'
  };

  const textColors = {
    success: '#065f46',
    error: '#991b1b',
    warning: '#92400e',
    info: '#1e40af'
  };

  const IconComponent = icons[type] || icons.success;
  const bgColor = bgColors[type] || bgColors.success;
  const textColor = textColors[type] || textColors.success;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: bgColor,
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${icons[type]?.props?.color || '#10b981'}`,
        minWidth: '280px'
      }}>
        {IconComponent}
        <span style={{ color: textColor, fontSize: '14px', fontWeight: '500' }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: textColor,
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes progressGlow {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1.02);
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </div>
  );
};

// Professional Progress Tracker Component
const ProgressTracker = ({ status, adminNotes }) => {
  const steps = [
    { id: 'submitted', label: 'Application Submitted', icon: '📝', description: 'Your application has been received' },
    { id: 'reviewing', label: 'Under Review', icon: '🔍', description: 'Admin is reviewing your application' },
    { id: 'processing', label: 'Processing', icon: '⚙️', description: 'Your application is being processed' },
    { id: 'approved', label: 'Approved', icon: '✅', description: 'Your application has been approved!' },
    { id: 'declined', label: 'Declined', icon: '❌', description: 'Your application was declined' }
  ];

  const statusOrder = ['incomplete', 'reviewing', 'processing', 'approved', 'declined'];
  const currentStepIndex = statusOrder.indexOf(status);
  
  const isDeclined = status === 'declined';
  const isIncomplete = status === 'incomplete';

  if (isIncomplete) {
    return (
      <div style={{
        background: '#fef3c7',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        borderLeft: '4px solid #f59e0b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px' }}>📋</span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', margin: 0 }}>Application Not Started</h3>
            <p style={{ fontSize: '13px', color: '#b45309', margin: '4px 0 0 0' }}>Please complete all required fields and upload documents</p>
          </div>
        </div>
      </div>
    );
  }

  if (isDeclined) {
    return (
      <div style={{
        background: '#fee2e2',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        borderLeft: '4px solid #ef4444'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '28px' }}>❌</span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#991b1b', margin: 0 }}>Application Declined</h3>
            <p style={{ fontSize: '13px', color: '#b91c1c', margin: '4px 0 0 0' }}>Your application was not approved at this time</p>
          </div>
        </div>
        {adminNotes && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '12px'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>Admin Notes:</p>
            <p style={{ fontSize: '13px', color: '#4a5568', margin: 0 }}>{adminNotes}</p>
          </div>
        )}
      </div>
    );
  }

  const progressPercentage = ((currentStepIndex + 1) / (steps.length - 1)) * 100;

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '24px',
      padding: '28px',
      marginBottom: '32px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>Application Progress</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Track your application status</p>
        </div>
        <div style={{
          background: '#e0e7ff',
          padding: '6px 14px',
          borderRadius: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#4f46e5' }}>
            {status === 'reviewing' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{
          background: '#e2e8f0',
          borderRadius: '10px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: '10px',
            transition: 'width 0.5s ease-out',
            position: 'relative',
            animation: 'progressGlow 0.5s ease-out'
          }}>
            <div style={{
              position: 'absolute',
              right: '0',
              top: '-4px',
              width: '16px',
              height: '16px',
              background: '#764ba2',
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 0 2px rgba(118,75,162,0.2)'
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>0%</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>25%</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>50%</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>75%</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>100%</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: '16px' }}>
        {steps.slice(0, -1).map((step, index) => {
          const isCompleted = statusOrder.indexOf(status) >= index;
          const isCurrent = statusOrder.indexOf(status) === index;
          
          return (
            <div key={step.id} style={{
              flex: 1,
              textAlign: 'center',
              minWidth: '80px',
              position: 'relative'
            }}>
              {index < steps.length - 2 && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: 'calc(50% + 20px)',
                  right: 'calc(-50% + 20px)',
                  height: '2px',
                  background: isCompleted ? '#10b981' : '#e2e8f0',
                  zIndex: 0
                }} />
              )}
              
              <div style={{
                width: '40px',
                height: '40px',
                margin: '0 auto 12px auto',
                background: isCompleted ? '#10b981' : (isCurrent ? '#667eea' : '#f1f5f9'),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s',
                boxShadow: isCurrent ? '0 0 0 4px rgba(102,126,234,0.2)' : 'none',
                transform: isCurrent ? 'scale(1.05)' : 'scale(1)'
              }}>
                {isCompleted ? (
                  <CheckCircle size={20} color="#fff" />
                ) : (
                  <span style={{ fontSize: '18px', opacity: isCurrent ? 1 : 0.5 }}>{step.icon}</span>
                )}
              </div>
              
              <div>
                <p style={{
                  fontSize: '11px',
                  fontWeight: isCurrent ? '600' : '400',
                  color: isCompleted ? '#10b981' : (isCurrent ? '#667eea' : '#94a3b8'),
                  marginBottom: '4px'
                }}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {adminNotes && status !== 'declined' && status !== 'incomplete' && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '12px',
          borderLeft: '3px solid #667eea'
        }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Notes</p>
          <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: '1.5' }}>{adminNotes}</p>
        </div>
      )}
    </div>
  );
};

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submission');
  const [formData, setFormData] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const messagesEndRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get('/api/client/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
      setFormData(response.data.submission?.field_data || {});
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      showToast('Failed to load dashboard', 'error');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/messages/unread/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchDashboard();
  }, [token, navigate, fetchDashboard]);

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [token, fetchUnreadCount]);

  useEffect(() => {
    if (activeTab === 'messages' && dashboardData?.messages?.length > 0) {
      const unreadMessages = dashboardData.messages.filter(
        m => !m.is_read && m.to_user_id === user.id
      );
      unreadMessages.forEach(async (msg) => {
        try {
          await axios.patch(`/api/messages/${msg.id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });
      fetchUnreadCount();
    }
  }, [activeTab, dashboardData?.messages, user.id, token, fetchUnreadCount]);

  useEffect(() => {
    if (messagesEndRef.current && activeTab === 'messages') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dashboardData?.messages, activeTab]);

  const handleSubmitData = async () => {
    setSaving(true);
    try {
      await axios.put('/api/client/submission', 
        { field_data: formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Data saved successfully!', 'success');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      fetchDashboard();
    } catch (error) {
      showToast('Failed to save data: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!selectedDocType) {
      showToast('Please select a document type first', 'warning');
      return;
    }

    setUploading(true);
    setUploadSuccess('');
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('document_type', selectedDocType);

    try {
      await axios.post('/api/client/upload', uploadData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadSuccess(`✅ ${selectedDocType} uploaded successfully!`);
      setSelectedDocType('');
      setTimeout(() => setUploadSuccess(''), 3000);
      fetchDashboard();
    } catch (error) {
      showToast('Failed to upload document: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (sending) return;
    
    setSending(true);
    try {
      await axios.post('/api/client/message', 
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchDashboard();
      showToast('Message sent to admin!', 'success');
    } catch (error) {
      showToast('Failed to send message: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusConfig = () => {
    const status = dashboardData?.submission?.status;
    switch(status) {
      case 'approved':
        return { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', text: 'Approved', message: 'Your application has been approved!' };
      case 'declined':
        return { icon: XCircle, color: '#ef4444', bg: '#fee2e2', text: 'Declined', message: 'Your application was declined. Please contact support.' };
      case 'processing':
        return { icon: Clock, color: '#3b82f6', bg: '#dbeafe', text: 'Processing', message: 'Your application is being processed.' };
      case 'reviewing':
        return { icon: FileCheck, color: '#f59e0b', bg: '#fef3c7', text: 'Under Review', message: 'An admin is reviewing your application.' };
      default:
        return { icon: AlertCircle, color: '#6b7280', bg: '#f3f4f6', text: 'Not Started', message: 'Please complete all required fields and upload documents.' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  const requirements = dashboardData?.requirements || { required_fields: [], required_documents: [] };
  const documents = dashboardData?.documents || [];
  const messages = dashboardData?.messages || [];
  const uploadedDocTypes = new Set(documents.map(d => d.document_type));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <aside style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        position: 'fixed',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '30px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: 0 }}>AMI-GROUP</h1>
          <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '6px' }}>Client Portal</p>
        </div>
        
        <nav style={{ flex: 1, padding: '24px 16px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#718096', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '12px' }}>MAIN MENU</p>
          {[
            { id: 'submission', label: 'My Application', icon: FileText, color: '#667eea' },
            { id: 'documents', label: 'My Documents', icon: FolderOpen, color: '#48bb78' },
            { id: 'messages', label: 'Messages', icon: Mail, color: '#ed64a6' }
          ].map(item => (
            <div key={item.id} style={item.id === 'messages' ? { position: 'relative' } : {}}>
              <div
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '6px',
                  cursor: 'pointer',
                  background: activeTab === item.id ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)` : 'transparent',
                  color: activeTab === item.id ? item.color : '#a0aec0',
                  borderLeft: activeTab === item.id ? `3px solid ${item.color}` : '3px solid transparent',
                  transition: 'all 0.3s'
                }}
              >
                <item.icon size={18} />
                <span style={{ fontSize: '14px', fontWeight: activeTab === item.id ? '500' : '400' }}>{item.label}</span>
                {item.id === 'messages' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '20px'
                  }}>{unreadCount}</span>
                )}
              </div>
            </div>
          ))}
        </nav>
        
        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '12px', 
            padding: '12px', 
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '11px', color: '#718096', margin: 0 }}>Logged in as</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: '4px 0 0 0' }}>{user.full_name}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.2)',
              border: 'none',
              borderRadius: '12px',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: '280px', padding: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
            Welcome, {user.full_name}
          </h1>
          <p style={{ color: '#718096', marginTop: '6px' }}>Manage your application and documents</p>
        </div>

        <ProgressTracker 
          status={dashboardData?.submission?.status || 'incomplete'}
          adminNotes={dashboardData?.submission?.admin_notes}
        />

        {activeTab === 'submission' && (
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '20px', 
            padding: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
              Application Form
            </h3>
            <p style={{ color: '#718096', fontSize: '14px', marginBottom: '32px' }}>
              Please complete all required fields below
            </p>
            
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '20px' }}>
                Personal Information
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                {requirements.required_fields.map((field, index) => (
                  <div key={index}>
                    <label style={{ 
                      display: 'block', 
                      color: '#374151', 
                      marginBottom: '8px', 
                      fontSize: '13px', 
                      fontWeight: '500' 
                    }}>
                      {field} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                      placeholder={`Enter ${field.toLowerCase()}`}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '20px' }}>
                Required Documents
              </h4>
              
              {uploadSuccess && (
                <div style={{
                  background: '#d1fae5',
                  color: '#10b981',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {uploadSuccess}
                </div>
              )}
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {requirements.required_documents.map((doc, index) => {
                  const isUploaded = uploadedDocTypes.has(doc);
                  return (
                    <div key={index} style={{
                      padding: '16px',
                      background: isUploaded ? '#d1fae5' : '#f8fafc',
                      borderRadius: '16px',
                      border: `2px solid ${isUploaded ? '#10b981' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isUploaded ? (
                          <CheckCircle size={24} color="#10b981" />
                        ) : (
                          <File size={24} color="#94a3b8" />
                        )}
                        <div>
                          <p style={{ fontWeight: '600', color: '#1a202c', margin: 0 }}>{doc}</p>
                          <p style={{ fontSize: '12px', color: isUploaded ? '#10b981' : '#94a3b8', margin: '4px 0 0 0' }}>
                            {isUploaded ? '✓ Uploaded' : 'Not uploaded yet'}
                          </p>
                        </div>
                      </div>
                      {!isUploaded && (
                        <label style={{
                          padding: '8px 16px',
                          background: '#667eea',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="file"
                            onChange={(e) => {
                              setSelectedDocType(doc);
                              const file = e.target.files[0];
                              if (file) {
                                const uploadData = new FormData();
                                uploadData.append('file', file);
                                uploadData.append('document_type', doc);
                                setUploading(true);
                                axios.post('/api/client/upload', uploadData, {
                                  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                                }).then(() => {
                                  setUploadSuccess(`✅ ${doc} uploaded successfully!`);
                                  setTimeout(() => setUploadSuccess(''), 3000);
                                  fetchDashboard();
                                }).catch(err => showToast('Upload failed', 'error')).finally(() => setUploading(false));
                              }
                            }}
                            style={{ display: 'none' }}
                            accept=".pdf,.jpg,.png,.doc,.docx"
                          />
                          {uploading && selectedDocType === doc ? 'Uploading...' : 'Upload'}
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ 
              paddingTop: '24px', 
              borderTop: '2px solid #e2e8f0',
              textAlign: 'right'
            }}>
              <button
                onClick={handleSubmitData}
                disabled={saving}
                style={{
                  padding: '14px 32px',
                  background: saveSuccess ? '#10b981' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: saving ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  animation: saveSuccess ? 'pulse 0.5s ease-out' : 'none'
                }}
              >
                {saving ? (
                  <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                ) : saveSuccess ? (
                  <CheckCircle size={18} />
                ) : null}
                {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Application'}
              </button>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                You can save your progress and come back later
              </p>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '20px', 
            padding: '32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>
              My Documents
            </h3>
            <p style={{ color: '#718096', fontSize: '14px', marginBottom: '32px' }}>
              All documents you have uploaded
            </p>
            
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
                <FolderOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '14px', color: '#718096', fontSize: '12px' }}>Document Type</th>
                      <th style={{ textAlign: 'left', padding: '14px', color: '#718096', fontSize: '12px' }}>File Name</th>
                      <th style={{ textAlign: 'left', padding: '14px', color: '#718096', fontSize: '12px' }}>Uploaded</th>
                      <th style={{ textAlign: 'left', padding: '14px', color: '#718096', fontSize: '12px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '14px', fontSize: '14px', fontWeight: '500', color: '#1a202c' }}>{doc.document_type || 'General'}</td>
                        <td style={{ padding: '14px', fontSize: '13px', color: '#718096' }}>{doc.file_name}</td>
                        <td style={{ padding: '14px', fontSize: '13px', color: '#718096' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                        <td style={{ padding: '14px' }}>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{
                            padding: '6px 14px',
                            background: '#dbeafe',
                            borderRadius: '8px',
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <FileText size={12} /> View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '20px', 
            height: 'calc(100vh - 180px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px 20px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={24} color="#fff" />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>Messages</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
                    Chat with support
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#f8fafc'
            }}>
              {messages.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px', 
                  color: '#718096',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <MessageCircle size={64} style={{ opacity: 0.3 }} />
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>No messages yet</p>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>Send a message to get started</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isFromMe = msg.from_user_id === user.id;
                  const showAvatar = index === 0 || messages[index - 1]?.from_user_id !== msg.from_user_id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isFromMe ? 'flex-end' : 'flex-start',
                        marginBottom: '8px',
                        animation: 'messageAppear 0.3s ease-out'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isFromMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%'
                      }}>
                        {showAvatar && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                            marginLeft: isFromMe ? '0' : '8px',
                            marginRight: isFromMe ? '8px' : '0'
                          }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              background: isFromMe ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#10b981',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {isFromMe ? 'Y' : (msg.profiles?.full_name?.charAt(0) || 'A')}
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                              {isFromMe ? 'You' : (msg.profiles?.full_name || 'Admin')}
                            </span>
                          </div>
                        )}
                        <div style={{
                          background: isFromMe ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#ffffff',
                          borderRadius: isFromMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                          padding: '12px 16px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          border: isFromMe ? 'none' : '1px solid #e2e8f0'
                        }}>
                          <p style={{
                            color: isFromMe ? '#fff' : '#1e293b',
                            margin: 0,
                            fontSize: '14px',
                            lineHeight: '1.5',
                            wordBreak: 'break-word'
                          }}>
                            {msg.message}
                          </p>
                          <p style={{
                            fontSize: '10px',
                            color: isFromMe ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                            margin: '6px 0 0 0',
                            textAlign: isFromMe ? 'right' : 'left'
                          }}>
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              borderRadius: '0 0 20px 20px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    fontSize: '14px',
                    resize: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#fff',
                    cursor: (sending || !newMessage.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (sending || !newMessage.trim()) ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500'
                  }}
                >
                  {sending && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  <Send size={16} />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
