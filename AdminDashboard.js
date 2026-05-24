import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, FileText, LayoutDashboard, LogOut,
  CheckCircle, XCircle, Clock, Mail,
  MessageCircle, Settings, Eye, RefreshCw,
  TrendingUp, UserPlus, Shield, UserCheck, FolderOpen,
  Send, Loader, Trash2, Key
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import RequirementsModal from '../components/RequirementsModal';

// Toast Component - UPDATED with longer duration (8 seconds)
// Toast Component - UPDATED with Copy button for password messages
const Toast = ({ message, type, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(), 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} color="#10b981" />,
    error: <XCircle size={20} color="#ef4444" />,
  };

  const bgColors = {
    success: '#d1fae5',
    error: '#fee2e2',
  };

  const textColors = {
    success: '#065f46',
    error: '#991b1b',
  };

  const IconComponent = icons[type] || icons.success;
  const bgColor = bgColors[type] || bgColors.success;
  const textColor = textColors[type] || textColors.success;

  // Extract password from message
  const extractPassword = () => {
    const match = message.match(/password: (\S+)/i);
    return match ? match[1] : null;
  };

  const password = extractPassword();

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        borderLeft: `4px solid ${type === 'success' ? '#10b981' : '#ef4444'}`,
        minWidth: '320px'
      }}>
        {IconComponent}
        <span style={{ color: textColor, fontSize: '14px', fontWeight: '500', flex: 1 }}>{message}</span>
        {password && (
          <button
            onClick={handleCopy}
            style={{
              padding: '4px 12px',
              background: textColor,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        )}
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: textColor, fontSize: '18px' }}>×</button>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes messageAppear {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isProcessing }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '28px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        animation: 'fadeInUp 0.3s ease-out'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Trash2 size={24} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1a202c', marginBottom: '8px' }}>{title}</h3>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {isProcessing && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {isProcessing ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// View Data Modal Component
const ViewDataModal = ({ isOpen, data, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '550px',
        maxHeight: '85vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        animation: 'modalPop 0.2s ease-out'
      }}>
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Application Data</h3>
              <p style={{ fontSize: '12px', opacity: 0.8, margin: '4px 0 0 0' }}>Client submitted information</p>
            </div>
            <button 
              onClick={onClose} 
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        </div>
        
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          maxHeight: 'calc(85vh - 140px)'
        }}>
          {Object.entries(data || {}).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#94a3b8' }}>No data submitted yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(data || {}).map(([key, value]) => (
                <div key={key} style={{
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '12px'
                }}>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#667eea',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '6px'
                  }}>
                    {key}
                  </p>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#1e293b',
                    margin: 0
                  }}>
                    {value || '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <button 
            onClick={onClose} 
            style={{
              width: '100%',
              padding: '10px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '10px',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalPop {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// Conversation Item Component
const ConversationItem = ({ conv, currentUser, token, onReplySent, showToast, fetchAllData }) => {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  const unreadCount = conv.messages.filter(m => !m.is_read && m.to_user_id === currentUser.id).length;
  
  React.useEffect(() => {
    if (messagesEndRef.current && expanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [expanded, conv.messages]);
  
  const handleSendReply = async () => {
    if (!replyText.trim() || isSending) return;
    setIsSending(true);
    try {
      await axios.post('/api/admin/messages', {
        to_user_id: conv.user.id,
        message: replyText
      }, { headers: { Authorization: `Bearer ${token}` } });
      setReplyText('');
      setExpanded(false);
      if (onReplySent) onReplySent();
      if (fetchAllData) fetchAllData();
      showToast('Message sent!', 'success');
    } catch (error) {
      showToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      marginBottom: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          background: unreadCount > 0 ? '#e0e7ff' : '#ffffff',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={(e) => e.currentTarget.style.background = unreadCount > 0 ? '#e0e7ff' : '#ffffff'}
      >
        <div style={{
          width: '48px',
          height: '48px',
          background: conv.user?.role === 'admin' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#10b981',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: '600',
          fontSize: '18px'
        }}>
          {conv.user?.full_name?.charAt(0) || 'U'}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c', margin: 0 }}>
              {conv.user?.full_name || 'Unknown'}
            </h4>
            {unreadCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 8px',
                borderRadius: '20px'
              }}>{unreadCount} new</span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            {conv.user?.role === 'admin' ? 'Administrator' : 'Client'}
          </p>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            {conv.messages[conv.messages.length - 1]?.message?.substring(0, 50)}...
          </p>
        </div>
        
        <div style={{
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
          color: '#94a3b8'
        }}>
          ▼
        </div>
      </div>

      {expanded && (
        <div style={{
          borderTop: '1px solid #e2e8f0',
          background: '#fafbfc'
        }}>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '20px'
          }}>
            {conv.messages.map(msg => {
              const isFromMe = msg.from_user_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isFromMe ? 'flex-end' : 'flex-start',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    background: isFromMe ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f1f5f9',
                    borderRadius: isFromMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    padding: '12px 16px'
                  }}>
                    <p style={{
                      color: isFromMe ? '#fff' : '#1e293b',
                      margin: 0,
                      fontSize: '14px',
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
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${conv.user?.full_name}...`}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleSendReply}
                disabled={isSending || !replyText.trim()}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  borderRadius: '16px',
                  color: '#fff',
                  cursor: (isSending || !replyText.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (isSending || !replyText.trim()) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500'
                }}
              >
                {isSending && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(null);
  const [showRequirementsModal, setShowRequirementsModal] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', full_name: '', password: '' });
  const [replyMessage, setReplyMessage] = useState('');
  const [requirementsFields, setRequirementsFields] = useState([]);
  const [requirementsDocs, setRequirementsDocs] = useState([]);
  const [viewDataModal, setViewDataModal] = useState(null);
  
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isSavingRequirements, setIsSavingRequirements] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 8000); // Changed from 3000 to 8000
  };

  const fetchAllData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [usersRes, submissionsRes, documentsRes, messagesRes] = await Promise.all([
        axios.get('/api/admin/clients', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/submissions', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/documents', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data || []);
      setSubmissions(submissionsRes.data || []);
      setDocuments(documentsRes.data || []);
      setMessages(messagesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
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
    if (!token || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAllData();
  }, [token, currentUser.role, navigate, fetchAllData]);

  useEffect(() => {
    if (token && currentUser.role === 'admin') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [token, currentUser.role, fetchUnreadCount]);

  useEffect(() => {
    if (activeTab === 'messages' && messages.length > 0) {
      const unreadMessages = messages.filter(m => !m.is_read && m.to_user_id === currentUser.id);
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
  }, [activeTab, messages, currentUser.id, token, fetchUnreadCount]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (isCreatingUser) return;
    setIsCreatingUser(true);
    try {
      const response = await axios.post('/api/admin/clients', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setNewUser({ email: '', full_name: '', password: '' });
      fetchAllData();
      showToast(`User created! Password: ${response.data.credentials.password}`, 'success');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to create user', 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (isDeletingUser || !userToDelete) return;
    if (userToDelete.id === currentUser.id) {
      showToast('You cannot delete your own account', 'error');
      setShowDeleteModal(false);
      return;
    }
    
    setIsDeletingUser(true);
    try {
      await axios.delete(`/api/admin/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('User deleted successfully!', 'success');
      fetchAllData();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to delete user', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // WORKING: Reset password and show new password in toast
  const handleResetPassword = async (user) => {
    if (isResettingPassword) return;
    setIsResettingPassword(true);
    try {
      const response = await axios.post(`/api/admin/users/${user.id}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`New password for ${user.full_name || user.email}: ${response.data.credentials.password}`, 'success');
    } catch (error) {
      showToast('Failed to reset password', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSaveRequirements = async (fields, docs) => {
    if (isSavingRequirements || !showRequirementsModal) return;
    
    setIsSavingRequirements(true);
    try {
      const response = await axios.put(`/api/admin/clients/${showRequirementsModal.id}/requirements`, {
        required_fields: fields,
        required_documents: docs
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (response.data.success || response.status === 200) {
        showToast('Requirements saved successfully!', 'success');
        setShowRequirementsModal(null);
        setRequirementsFields([]);
        setRequirementsDocs([]);
        fetchAllData();
      } else {
        showToast('Failed to save requirements', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save requirements', 'error');
    } finally {
      setIsSavingRequirements(false);
    }
  };

  const handleUpdateStatus = async (submissionId, status, adminNotes = null) => {
    if (isUpdatingStatus || statusUpdatingId === submissionId) return;
    setIsUpdatingStatus(true);
    setStatusUpdatingId(submissionId);
    try {
      await axios.patch(`/api/admin/submissions/${submissionId}`, { 
        status, 
        admin_notes: adminNotes 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllData();
      const statusMessages = {
        reviewing: 'Application moved to Under Review',
        processing: 'Application moved to Processing',
        approved: 'Application approved!',
        declined: 'Application declined'
      };
      showToast(statusMessages[status] || `Application ${status}!`, 'success');
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
      setStatusUpdatingId(null);
    }
  };

  const handleSendMessage = async (toUserId) => {
    if (isSendingMessage) return;
    if (!replyMessage.trim()) return;
    setIsSendingMessage(true);
    try {
      await axios.post('/api/admin/messages', {
        to_user_id: toUserId,
        message: replyMessage
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowMessageModal(null);
      setReplyMessage('');
      showToast('Message sent successfully!', 'success');
      fetchAllData();
    } catch (error) {
      showToast('Failed to send message', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#10b981';
      case 'declined': return '#ef4444';
      case 'reviewing': return '#f59e0b';
      case 'processing': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'approved': return '#d1fae5';
      case 'declined': return '#fee2e2';
      case 'reviewing': return '#fef3c7';
      case 'processing': return '#dbeafe';
      default: return '#f3f4f6';
    }
  };

  const monthlyData = [
    { month: 'Jan', users: 0, submissions: 0 },
    { month: 'Feb', users: 0, submissions: 0 },
    { month: 'Mar', users: 0, submissions: 0 },
    { month: 'Apr', users: 0, submissions: 0 },
    { month: 'May', users: users.length, submissions: submissions.length },
    { month: 'Jun', users: 0, submissions: 0 },
  ];

  const pieData = [
    { name: 'Incomplete', value: submissions.filter(s => s.status === 'incomplete').length, color: '#6b7280' },
    { name: 'Reviewing', value: submissions.filter(s => s.status === 'reviewing').length, color: '#f59e0b' },
    { name: 'Processing', value: submissions.filter(s => s.status === 'processing').length, color: '#3b82f6' },
    { name: 'Approved', value: submissions.filter(s => s.status === 'approved').length, color: '#10b981' },
    { name: 'Declined', value: submissions.filter(s => s.status === 'declined').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const stats = {
    totalUsers: users.length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    totalClients: users.filter(u => u.role === 'client').length,
    pendingSubmissions: submissions.filter(s => s.status === 'incomplete' || s.status === 'reviewing').length,
    totalDocuments: documents.length,
    unreadMessages: messages.filter(m => !m.is_read && m.to_user_id === currentUser.id).length,
  };

  const getConversations = () => {
    const conversations = {};
    messages.forEach(msg => {
      const otherUser = msg.from_user_id === currentUser.id ? msg.to_user : msg.from_user;
      const otherUserId = otherUser?.id;
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          user: otherUser,
          messages: []
        };
      }
      conversations[otherUserId].messages.push(msg);
    });
    
    Object.values(conversations).forEach(conv => {
      conv.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });
    
    return Object.values(conversations).sort((a, b) => 
      new Date(b.messages[b.messages.length - 1]?.created_at) - new Date(a.messages[a.messages.length - 1]?.created_at)
    );
  };

  const conversations = getConversations();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.full_name || userToDelete?.email}? This action cannot be undone and will delete all their data.`}
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        isProcessing={isDeletingUser}
      />

      <ViewDataModal
        isOpen={!!viewDataModal}
        data={viewDataModal}
        onClose={() => setViewDataModal(null)}
      />

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
          <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '6px' }}>Administration Portal</p>
        </div>
        
        <nav style={{ flex: 1, padding: '24px 16px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#718096', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '12px' }}>MAIN MENU</p>
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, color: '#667eea' },
            { id: 'users', label: 'User Management', icon: Users, color: '#48bb78' },
            { id: 'submissions', label: 'Submissions', icon: FileText, color: '#ed8936' },
            { id: 'documents', label: 'Documents', icon: FolderOpen, color: '#4299e1' },
            { id: 'messages', label: 'Messages', icon: Mail, color: '#ed64a6' }
          ].map(item => (
            <div key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
              marginBottom: '6px', cursor: 'pointer',
              background: activeTab === item.id ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)` : 'transparent',
              color: activeTab === item.id ? item.color : '#a0aec0',
              borderLeft: activeTab === item.id ? `3px solid ${item.color}` : '3px solid transparent',
              transition: 'all 0.3s', position: 'relative'
            }}>
              <item.icon size={18} />
              <span style={{ fontSize: '14px' }}>{item.label}</span>
              {item.id === 'messages' && unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px' }}>{unreadCount}</span>
              )}
            </div>
          ))}
        </nav>
        
        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', marginBottom: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#718096', margin: 0 }}>Logged in as</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: '4px 0 0 0' }}>{currentUser.full_name}</p>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: '12px', color: '#fca5a5', cursor: 'pointer', fontSize: '14px' }}>
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: '280px', padding: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a202c', margin: 0 }}>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'submissions' && 'Application Submissions'}
            {activeTab === 'documents' && 'Document Library'}
            {activeTab === 'messages' && 'Message Center'}
          </h1>
          <p style={{ color: '#718096', marginTop: '6px' }}>Welcome back, {currentUser.full_name}</p>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
              <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>Total Users</p><p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', margin: '8px 0 0 0' }}>{stats.totalUsers}</p></div>
                  <Users size={40} style={{ opacity: 0.8 }} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '12px' }}>{stats.totalClients} clients, {stats.totalAdmins} admins</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>Pending Reviews</p><p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', margin: '8px 0 0 0' }}>{stats.pendingSubmissions}</p></div>
                  <Clock size={40} style={{ opacity: 0.8 }} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '12px' }}>Awaiting your review</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>Documents</p><p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', margin: '8px 0 0 0' }}>{stats.totalDocuments}</p></div>
                  <FileText size={40} style={{ opacity: 0.8 }} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '12px' }}>Total uploaded files</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>Unread Messages</p><p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', margin: '8px 0 0 0' }}>{stats.unreadMessages}</p></div>
                  <Mail size={40} style={{ opacity: 0.8 }} />
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '12px' }}>From clients</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
              <div style={{ background: '#fff', borderRadius: '20px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Growth Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={3} name="Users" />
                    <Line type="monotone" dataKey="submissions" stroke="#48bb78" strokeWidth={3} name="Submissions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#fff', borderRadius: '20px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Application Status</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div style={{ textAlign: 'center', padding: '100px 0', color: '#718096' }}>No submissions yet</div>}
              </div>
            </div>
          </>
        )}

        {/* USERS TAB with Working Reset Password Button */}
        {activeTab === 'users' && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Registered Users</h3>
                <p style={{ fontSize: '13px', color: '#718096' }}>{users.length} total users</p>
              </div>
              <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={16} /> Add New User
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{user.full_name || 'No name'}</td>
                      <td style={{ padding: '12px' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', background: user.role === 'admin' ? '#e0e7ff' : '#d1fae5', color: user.role === 'admin' ? '#4f46e5' : '#10b981' }}>
                          {user.role === 'admin' ? 'Admin' : 'Client'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {user.role === 'client' && (
                            <>
                              <button 
                                onClick={async () => {
                                  try {
                                    const response = await axios.get(`/api/admin/clients/${user.id}/requirements`, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    setRequirementsFields(response.data.required_fields || []);
                                    setRequirementsDocs(response.data.required_documents || []);
                                    setShowRequirementsModal(user);
                                  } catch (error) {
                                    setRequirementsFields([]);
                                    setRequirementsDocs([]);
                                    setShowRequirementsModal(user);
                                  }
                                }} 
                                style={{ padding: '6px 12px', background: '#fef3c7', border: 'none', borderRadius: '8px', color: '#d97706', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <Settings size={12} /> Requirements
                              </button>
                              <button 
                                onClick={() => setShowMessageModal(user)} 
                                style={{ padding: '6px 12px', background: '#dbeafe', border: 'none', borderRadius: '8px', color: '#2563eb', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <MessageCircle size={12} /> Message
                              </button>
                              <button 
                                onClick={() => handleResetPassword(user)} 
                                disabled={isResettingPassword}
                                style={{ padding: '6px 12px', background: '#fef3c7', border: 'none', borderRadius: '8px', color: '#d97706', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <Key size={12} /> Reset Password
                              </button>
                            </>
                          )}
                          {user.role === 'admin' && (
                            <button 
                              onClick={() => setShowMessageModal(user)} 
                              style={{ padding: '6px 12px', background: '#dbeafe', border: 'none', borderRadius: '8px', color: '#2563eb', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <MessageCircle size={12} /> Message
                            </button>
                          )}
                          {user.id !== currentUser.id && (
                            <button 
                              onClick={() => openDeleteModal(user)} 
                              style={{ padding: '6px 12px', background: '#fee2e2', border: 'none', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Application Submissions</h3>
              <button onClick={fetchAllData} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Client</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{sub.profiles?.full_name || 'Unknown'} </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', background: getStatusBg(sub.status), color: getStatusColor(sub.status) }}>
                          {sub.status === 'incomplete' ? 'Incomplete' : sub.status === 'reviewing' ? 'Under Review' : sub.status === 'processing' ? 'Processing' : sub.status === 'approved' ? 'Approved' : 'Declined'}
                        </span>
                       </td>
                      <td style={{ padding: '12px' }}>{new Date(sub.created_at).toLocaleDateString()} </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {sub.status === 'incomplete' && (
                            <button onClick={() => {
                              const notes = prompt('Add notes for the client (optional):');
                              handleUpdateStatus(sub.id, 'reviewing', notes);
                            }} style={{ padding: '6px 12px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', color: '#d97706', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={12} /> Start Review
                            </button>
                          )}
                          {sub.status === 'reviewing' && (
                            <button onClick={() => {
                              const notes = prompt('Add notes for the client (optional):');
                              handleUpdateStatus(sub.id, 'processing', notes);
                            }} style={{ padding: '6px 12px', background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#2563eb', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Settings size={12} /> Start Processing
                            </button>
                          )}
                          {sub.status === 'processing' && (
                            <>
                              <button onClick={() => {
                                const notes = prompt('Add approval notes:');
                                handleUpdateStatus(sub.id, 'approved', notes);
                              }} style={{ padding: '6px 12px', background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#10b981', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button onClick={() => {
                                const notes = prompt('Reason for decline:');
                                handleUpdateStatus(sub.id, 'declined', notes);
                              }} style={{ padding: '6px 12px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <XCircle size={12} /> Decline
                              </button>
                            </>
                          )}
                          {sub.status === 'approved' && (
                            <span style={{ padding: '6px 12px', background: '#d1fae5', borderRadius: '8px', color: '#10b981', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle size={12} /> Approved
                            </span>
                          )}
                          {sub.status === 'declined' && (
                            <span style={{ padding: '6px 12px', background: '#fee2e2', borderRadius: '8px', color: '#ef4444', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <XCircle size={12} /> Declined
                            </span>
                          )}
                          <button onClick={() => setViewDataModal(sub.field_data)} style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Eye size={12} /> View Data
                          </button>
                        </div>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Document Library</h3>
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>No documents uploaded yet</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Client</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Document Type</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>File Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Uploaded</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>{doc.profiles?.full_name || 'Unknown'} </td>
                        <td style={{ padding: '12px' }}>{doc.document_type || 'General'} </td>
                        <td style={{ padding: '12px' }}>{doc.file_name} </td>
                        <td style={{ padding: '12px' }}>{new Date(doc.uploaded_at).toLocaleDateString()} </td>
                        <td style={{ padding: '12px' }}>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', background: '#dbeafe', borderRadius: '8px', textDecoration: 'none', color: '#2563eb' }}><Eye size={12} /> View</a>
                        </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
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
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: 0 }}>Message Center</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
                    {conversations.length} conversations
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: '#f8fafc',
              padding: '16px'
            }}>
              {conversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
                  <MessageCircle size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p>No messages yet</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <ConversationItem 
                    key={conv.user?.id}
                    conv={conv}
                    currentUser={currentUser}
                    token={token}
                    fetchAllData={fetchAllData}
                    showToast={showToast}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => !isCreatingUser && setShowCreateModal(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>Add New User</h3>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '16px' }}><label>Full Name</label><input type="text" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div style={{ marginBottom: '16px' }}><label>Email</label><input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
              <div style={{ marginBottom: '24px' }}><label>Password (optional)</label><input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }} placeholder="Leave blank to auto-generate" /></div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={isCreatingUser} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>{isCreatingUser ? 'Creating...' : 'Create User'}</button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requirements Modal */}
      <RequirementsModal
        isOpen={!!showRequirementsModal}
        user={showRequirementsModal}
        initialFields={requirementsFields}
        initialDocs={requirementsDocs}
        onSave={handleSaveRequirements}
        onClose={() => {
          setShowRequirementsModal(null);
          setRequirementsFields([]);
          setRequirementsDocs([]);
        }}
        isSaving={isSavingRequirements}
      />

      {/* Message Modal */}
      {showMessageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => !isSendingMessage && setShowMessageModal(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3>Send Message to {showMessageModal.full_name}</h3>
            <textarea rows={4} value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Type your message..." style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleSendMessage(showMessageModal.id)} disabled={isSendingMessage || !replyMessage.trim()} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>{isSendingMessage ? 'Sending...' : 'Send Message'}</button>
              <button onClick={() => setShowMessageModal(null)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
