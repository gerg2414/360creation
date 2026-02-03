'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthenticated(true);
    fetchSubmissions();
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/submissions', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      } else {
        alert('Invalid password');
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
      });
      if (response.ok) {
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMockupUpload = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const fileInput = e.target.querySelector('input[type="file"]');
    if (!fileInput?.files[0]) {
      alert('Please select a mockup image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('submissionId', selectedSubmission.id);
      formData.append('mockup', fileInput.files[0]);

      const response = await fetch('/api/upload-mockup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Mockup uploaded and customer notified!');
        setSelectedSubmission(null);
        fetchSubmissions();
      } else {
        alert('Failed to upload mockup');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload mockup');
    } finally {
      setUploading(false);
    }
  };

  const statusColors = {
    new: { bg: '#FEF3C7', text: '#92400E' },
    in_progress: { bg: '#DBEAFE', text: '#1E40AF' },
    mockup_sent: { bg: '#D1FAE5', text: '#065F46' },
    followed_up: { bg: '#E9D5FF', text: '#6B21A8' },
    converted: { bg: '#10B981', text: '#FFFFFF' },
    closed: { bg: '#E5E7EB', text: '#374151' }
  };

  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f7f8f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#EE2C7C',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>360</span>
            </div>
            <h1 style={{ color: '#252525', fontSize: '24px', fontWeight: '700' }}>Dashboard</h1>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '15px',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#EE2C7C',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7f8f8',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '16px 32px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#EE2C7C',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>360</span>
          </div>
          <span style={{ fontWeight: '600', color: '#252525', fontSize: '16px' }}>Mockup Dashboard</span>
        </div>
        <button
          onClick={() => {
            setAuthenticated(false);
            setPassword('');
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666'
          }}
        >
          Logout
        </button>
      </header>

      {/* Stats */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {[
            { label: 'Total Requests', value: submissions.length, color: '#252525' },
            { label: 'New', value: submissions.filter(s => s.status === 'new').length, color: '#F59E0B' },
            { label: 'Mockups Sent', value: submissions.filter(s => s.status === 'mockup_sent').length, color: '#10B981' },
            { label: 'Converted', value: submissions.filter(s => s.status === 'converted').length, color: '#EE2C7C' },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>{stat.label}</div>
              <div style={{ color: stat.color, fontSize: '32px', fontWeight: '700' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Submissions Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#252525' }}>
              Submissions
            </h2>
            <button
              onClick={fetchSubmissions}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f7f8f8',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666'
              }}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#888' }}>Loading...</div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#888' }}>No submissions yet</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f7f8f8' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Name / Business</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Location</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#666', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {sub.logo_url && (
                            <img 
                              src={sub.logo_url} 
                              alt="Logo"
                              style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#f7f8f8' }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: '600', color: '#252525' }}>{sub.first_name}</div>
                            <div style={{ fontSize: '13px', color: '#888' }}>{sub.business_name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#666' }}>{sub.location}</td>
                      <td style={{ padding: '16px' }}>
                        <a href={`mailto:${sub.email}`} style={{ color: '#EE2C7C', textDecoration: 'none' }}>{sub.email}</a>
                        {sub.phone && <div style={{ fontSize: '13px', color: '#888' }}>{sub.phone}</div>}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '500',
                          backgroundColor: statusColors[sub.status]?.bg || '#E5E7EB',
                          color: statusColors[sub.status]?.text || '#374151'
                        }}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#888', fontSize: '14px' }}>
                        {new Date(sub.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#EE2C7C',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            {sub.mockup_url ? 'Update Mockup' : 'Upload Mockup'}
                          </button>
                          {sub.mockup_url && (
                            <a
                              href={`/mockup/${sub.id}`}
                              target="_blank"
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f7f8f8',
                                color: '#666',
                                border: 'none',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '13px'
                              }}
                            >
                              View
                            </a>
                          )}
                          <select
                            value={sub.status}
                            onChange={(e) => updateStatus(sub.id, e.target.value)}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In Progress</option>
                            <option value="mockup_sent">Mockup Sent</option>
                            <option value="followed_up">Followed Up</option>
                            <option value="converted">Converted</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 24px', color: '#252525', fontSize: '20px' }}>
              Upload Mockup for {selectedSubmission.business_name}
            </h3>

            {/* Submission Details */}
            <div style={{
              backgroundColor: '#f7f8f8',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                <strong>Location:</strong> {selectedSubmission.location}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                <strong>Email:</strong> {selectedSubmission.email}
              </p>
              {selectedSubmission.extras && (
                <p style={{ margin: 0, fontSize: '14px' }}>
                  <strong>Notes:</strong> {selectedSubmission.extras}
                </p>
              )}
              {selectedSubmission.logo_url && (
                <div style={{ marginTop: '12px' }}>
                  <strong style={{ fontSize: '14px' }}>Logo:</strong>
                  <img 
                    src={selectedSubmission.logo_url} 
                    alt="Logo"
                    style={{ display: 'block', maxWidth: '150px', marginTop: '8px', borderRadius: '6px' }}
                  />
                </div>
              )}
            </div>

            <form onSubmit={handleMockupUpload}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#252525'
                }}>
                  Mockup Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#f7f8f8',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: uploading ? '#ccc' : '#EE2C7C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: uploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload & Notify Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
