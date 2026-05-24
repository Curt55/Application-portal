import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';

const RequirementsModal = ({ isOpen, user, initialFields, initialDocs, onSave, onClose, isSaving }) => {
  const [fields, setFields] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [newField, setNewField] = useState('');
  const [newDoc, setNewDoc] = useState('');
  const [activeTab, setActiveTab] = useState('fields');

  useEffect(() => {
    if (isOpen) {
      setFields(initialFields || []);
      setDocuments(initialDocs || []);
      setNewField('');
      setNewDoc('');
    }
  }, [isOpen, initialFields, initialDocs]);

  const addField = () => {
    if (newField.trim() && !fields.includes(newField.trim())) {
      setFields([...fields, newField.trim()]);
      setNewField('');
    }
  };

  const addDocument = () => {
    if (newDoc.trim() && !documents.includes(newDoc.trim())) {
      setDocuments([...documents, newDoc.trim()]);
      setNewDoc('');
    }
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(fields, documents);
  };

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
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Requirements Manager</h2>
              <p style={{ fontSize: '12px', opacity: 0.9, margin: '4px 0 0 0' }}>
                Configure requirements for {user?.full_name}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <X size={18} color="#fff" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 20px' }}>
          <button
            onClick={() => setActiveTab('fields')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              color: activeTab === 'fields' ? '#667eea' : '#64748b',
              cursor: 'pointer',
              borderBottom: activeTab === 'fields' ? '2px solid #667eea' : 'none',
              marginBottom: '-1px'
            }}
          >
            Required Fields ({fields.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              color: activeTab === 'docs' ? '#667eea' : '#64748b',
              cursor: 'pointer',
              borderBottom: activeTab === 'docs' ? '2px solid #667eea' : 'none',
              marginBottom: '-1px'
            }}
          >
            Required Documents ({documents.length})
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <>
              {/* Existing Fields */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
                  Required Fields
                </label>
                {fields.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', fontSize: '13px' }}>No fields added yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {fields.map((field, index) => (
                      <div key={index} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: '#f1f5f9',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{field}</span>
                        <button
                          onClick={() => removeField(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#94a3b8'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Field */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Add New Field
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    placeholder="e.g., Emergency Contact, LinkedIn Profile"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '13px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && addField()}
                  />
                  <button
                    onClick={addField}
                    style={{
                      padding: '8px 16px',
                      background: '#667eea',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              {/* Common Suggestions */}
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
                  Common Fields (click to add)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Full Name', 'Email', 'Phone Number', 'Address', 'Date of Birth', 'Company Name', 'Position'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        if (!fields.includes(suggestion)) {
                          setFields([...fields, suggestion]);
                        }
                      }}
                      style={{
                        padding: '4px 10px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#475569'
                      }}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Documents Tab */}
          {activeTab === 'docs' && (
            <>
              {/* Existing Documents */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>
                  Required Documents
                </label>
                {documents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', fontSize: '13px' }}>No documents added yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {documents.map((doc, index) => (
                      <div key={index} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: '#f1f5f9',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <span style={{ fontSize: '13px', color: '#1e293b' }}>{doc}</span>
                        <button
                          onClick={() => removeDocument(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#94a3b8'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Document */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Add New Document
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newDoc}
                    onChange={(e) => setNewDoc(e.target.value)}
                    placeholder="e.g., Passport, Resume, Contract"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '13px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && addDocument()}
                  />
                  <button
                    onClick={addDocument}
                    style={{
                      padding: '8px 16px',
                      background: '#667eea',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px'
                    }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              {/* Common Suggestions */}
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#64748b', marginBottom: '8px' }}>
                  Common Documents (click to add)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Passport', 'ID Card', 'Resume/CV', 'Contract', 'Bank Statement', 'Proof of Address', 'Degree Certificate'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        if (!documents.includes(suggestion)) {
                          setDocuments([...documents, suggestion]);
                        }
                      }}
                      style={{
                        padding: '4px 10px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#475569'
                      }}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          background: '#fafbfc'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              color: '#475569'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '8px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Save size={14} />
            {isSaving ? 'Saving...' : 'Save Requirements'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementsModal;
