'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewingLogo, setViewingLogo] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'pipeline', or 'analytics'
  const [draggedItem, setDraggedItem] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState([]);

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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch analytics when switching to analytics view
  useEffect(() => {
    if (viewMode === 'analytics' && authenticated && !analytics) {
      fetchAnalytics();
    }
  }, [viewMode, authenticated]);

  const fetchLiveVisitors = async () => {
    try {
      const response = await fetch('/api/live-visitors', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLiveVisitors(data.visitors || []);
      }
    } catch (error) {
      console.error('Live visitors error:', error);
    }
  };

  // Poll for live visitors every 10 seconds when authenticated
  useEffect(() => {
    if (!authenticated) return;

    fetchLiveVisitors();
    const interval = setInterval(fetchLiveVisitors, 10000);

    return () => clearInterval(interval);
  }, [authenticated, password]);

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
    if (!fileInput?.files || fileInput.files.length === 0) {
      alert('Please select at least one mockup image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('submissionId', selectedSubmission.id);

      // Append all selected files
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('mockups', fileInput.files[i]);
      }

      const response = await fetch('/api/upload-mockup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        },
        body: formData
      });

      if (response.ok) {
        alert(`${fileInput.files.length} mockup(s) uploaded and customer notified!`);
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
            <img
              src="/logo.png"
              alt="360 Creation"
              style={{ height: '48px', width: 'auto', marginBottom: '16px', display: 'block', margin: '0 auto 16px' }}
            />
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
                borderRadius: '100px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <img
            src="/logo.png"
            alt="360 Creation"
            style={{ height: '32px', width: 'auto' }}
          />
          <nav style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'table' || viewMode === 'pipeline' ? '#FDF2F8' : 'transparent',
                color: viewMode === 'table' || viewMode === 'pipeline' ? '#EE2C7C' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Leads
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'analytics' ? '#FDF2F8' : 'transparent',
                color: viewMode === 'analytics' ? '#EE2C7C' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Analytics
            </button>
          </nav>
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
            { label: 'Total Leads', value: submissions.length, color: '#252525' },
            { label: 'New', value: submissions.filter(s => s.status === 'new').length, color: '#F59E0B' },
            { label: 'In Progress', value: submissions.filter(s => s.status === 'in_progress').length, color: '#3B82F6' },
            { label: 'Mockups Sent', value: submissions.filter(s => ['mockup_sent', 'followed_up', 'converted'].includes(s.status)).length, color: '#10B981' },
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

        {/* Live Visitors - only show on analytics view */}
        {viewMode === 'analytics' && liveVisitors.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                backgroundColor: '#10B981',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#252525' }}>
                {liveVisitors.length} Live Visitor{liveVisitors.length !== 1 ? 's' : ''}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
              {/* UK Map */}
              <div style={{ position: 'relative', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 200 310" style={{ width: '250px', height: '400px' }}>
                  {/* Simplified but recognizable UK shape */}
                  {/* Scotland */}
                  <path d="M95,8 L105,5 L118,8 L125,3 L135,10 L142,8 L148,15 L155,25 L148,35 L155,48 L150,58 L145,52 L138,60 L128,55 L122,65 L115,60 L105,65 L95,58 L88,65 L78,55 L82,42 L75,32 L80,22 L88,15 Z" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" />

                  {/* England & Wales */}
                  <path d="M122,65 L128,55 L138,60 L145,52 L150,58 L158,68 L162,82 L158,98 L165,115 L160,132 L168,150 L162,168 L155,185 L145,198 L135,210 L122,218 L108,222 L95,218 L85,205 L78,188 L82,170 L75,152 L80,135 L72,118 L78,100 L72,82 L78,68 L88,65 L95,58 L105,65 L115,60 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />

                  {/* Wales bump */}
                  <path d="M72,118 L80,135 L75,152 L82,170 L75,175 L65,165 L58,148 L62,130 L68,120 Z" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="0.5" />

                  {/* Cornwall */}
                  <path d="M78,188 L85,205 L78,215 L65,220 L52,212 L48,198 L55,188 L68,185 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />

                  {/* Northern Ireland */}
                  <path d="M25,78 L38,72 L52,75 L60,82 L55,92 L42,98 L28,95 L22,88 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.5" />

                  {/* Republic of Ireland - faded */}
                  <path d="M22,88 L28,95 L42,98 L48,108 L42,125 L48,145 L38,165 L25,180 L12,175 L5,155 L2,130 L8,108 L15,92 Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.5" />

                  {/* Live visitor dots */}
                  {liveVisitors.map((visitor, index) => {
                    // Convert lat/lon to SVG coordinates
                    // UK bounds approximately: lat 50-59, lon -10 to 2
                    let x = 110, y = 150; // Default to middle England
                    if (visitor.lat && visitor.lon) {
                      x = ((visitor.lon + 10) / 12) * 160 + 20;
                      y = 250 - ((visitor.lat - 50) / 9) * 220;
                    }
                    return (
                      <g key={visitor.visitor_id || index}>
                        <circle cx={x} cy={y} r="12" fill="#EE2C7C" opacity="0.2">
                          <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={x} cy={y} r="5" fill="#EE2C7C" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Visitor List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {liveVisitors.map((visitor, index) => (
                  <div
                    key={visitor.visitor_id || index}
                    style={{
                      backgroundColor: '#f7f8f8',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#10B981',
                      borderRadius: '50%',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#252525' }}>
                        {visitor.city || 'Unknown'}{visitor.region ? `, ${visitor.region}` : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {visitor.page || '/'}
                        {visitor.utm_source && (
                          <span style={{
                            marginLeft: '8px',
                            backgroundColor: '#EFF6FF',
                            color: '#3B82F6',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '10px'
                          }}>
                            {visitor.utm_source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </div>
        )}

        {/* View Toggle - only show for Leads */}
        {(viewMode === 'table' || viewMode === 'pipeline') && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '10px 20px',
                backgroundColor: viewMode === 'table' ? '#EE2C7C' : 'white',
                color: viewMode === 'table' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              style={{
                padding: '10px 20px',
                backgroundColor: viewMode === 'pipeline' ? '#EE2C7C' : 'white',
                color: viewMode === 'pipeline' ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Pipeline View
            </button>
          </div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <div style={{ marginBottom: '32px' }}>
            {analyticsLoading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#888' }}>Loading analytics...</div>
            ) : (
              <>
                {/* Top Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Page Views (30d)</div>
                    <div style={{ color: '#252525', fontSize: '32px', fontWeight: '700' }}>{analytics?.totalViews || 0}</div>
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Unique Visitors (30d)</div>
                    <div style={{ color: '#3B82F6', fontSize: '32px', fontWeight: '700' }}>{analytics?.uniqueVisitors || 0}</div>
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Submissions (30d)</div>
                    <div style={{ color: '#10B981', fontSize: '32px', fontWeight: '700' }}>{analytics?.totalSubmissions || 0}</div>
                  </div>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Conversion Rate</div>
                    <div style={{ color: '#EE2C7C', fontSize: '32px', fontWeight: '700' }}>{analytics?.conversionRate || 0}%</div>
                  </div>
                </div>

                {/* Charts Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px',
                  marginBottom: '24px'
                }}>
                  {/* Views & Submissions Chart */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#252525' }}>
                      Last 7 Days
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analytics?.viewsByDay && Object.entries(analytics.viewsByDay).map(([date, views]) => {
                        const submissions = analytics.submissionsByDay?.[date] || 0;
                        const maxVal = Math.max(...Object.values(analytics.viewsByDay), 1);
                        return (
                          <div key={date} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '60px', fontSize: '12px', color: '#888' }}>
                              {new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{
                                height: '12px',
                                backgroundColor: '#3B82F6',
                                borderRadius: '2px',
                                width: `${(views / maxVal) * 100}%`,
                                minWidth: views > 0 ? '4px' : '0'
                              }} />
                              <div style={{
                                height: '12px',
                                backgroundColor: '#10B981',
                                borderRadius: '2px',
                                width: `${(submissions / maxVal) * 100}%`,
                                minWidth: submissions > 0 ? '4px' : '0'
                              }} />
                            </div>
                            <div style={{ width: '50px', fontSize: '12px', color: '#666', textAlign: 'right' }}>
                              {views} / {submissions}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#3B82F6', borderRadius: '2px' }} />
                        <span style={{ color: '#666' }}>Views</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#10B981', borderRadius: '2px' }} />
                        <span style={{ color: '#666' }}>Submissions</span>
                      </div>
                    </div>
                  </div>

                  {/* Views by Source */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#252525' }}>
                        Traffic Sources
                      </h3>
                      <button
                        onClick={fetchAnalytics}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f7f8f8',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#666'
                        }}
                      >
                        Refresh
                      </button>
                    </div>
                    {analytics?.viewsBySource && Object.entries(analytics.viewsBySource).length > 0 ? (
                      Object.entries(analytics.viewsBySource).map(([source, count]) => (
                        <div key={source} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: '1px solid #eee'
                        }}>
                          <span style={{ color: '#252525', fontSize: '14px' }}>{source}</span>
                          <span style={{
                            backgroundColor: '#EE2C7C',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>{count}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#888', fontSize: '14px' }}>No data yet</div>
                    )}
                  </div>
                </div>

                {/* Bottom Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {/* Page Views by Page */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#252525' }}>
                      Views by Page
                    </h3>
                    {analytics?.viewsByPage && Object.entries(analytics.viewsByPage).length > 0 ? (
                      Object.entries(analytics.viewsByPage).map(([page, count]) => (
                        <div key={page} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: '1px solid #eee'
                        }}>
                          <span style={{ color: '#252525', fontSize: '14px' }}>{page || '/'}</span>
                          <span style={{
                            backgroundColor: '#8B5CF6',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>{count}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#888', fontSize: '14px' }}>No data yet</div>
                    )}
                  </div>

                  {/* Campaigns */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#252525' }}>
                      Campaigns
                    </h3>
                    {analytics?.viewsByCampaign && Object.entries(analytics.viewsByCampaign).length > 0 ? (
                      Object.entries(analytics.viewsByCampaign).map(([campaign, count]) => (
                        <div key={campaign} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: '1px solid #eee'
                        }}>
                          <span style={{ color: '#252525', fontSize: '14px' }}>{campaign}</span>
                          <span style={{
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>{count}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#888', fontSize: '14px' }}>No campaigns tracked yet</div>
                    )}
                  </div>

                  {/* Conversion Funnel */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#252525' }}>
                      Conversion Funnel
                    </h3>
                    {[
                      { label: 'Total Leads', count: submissions.length, color: '#252525' },
                      { label: 'Mockup Sent', count: submissions.filter(s => ['mockup_sent', 'followed_up', 'converted'].includes(s.status)).length, color: '#3B82F6' },
                      { label: 'Followed Up', count: submissions.filter(s => ['followed_up', 'converted'].includes(s.status)).length, color: '#8B5CF6' },
                      { label: 'Converted', count: submissions.filter(s => s.status === 'converted').length, color: '#10B981' },
                    ].map((stage) => (
                      <div key={stage.label} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span style={{ color: '#252525', fontSize: '14px' }}>{stage.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px', justifyContent: 'flex-end' }}>
                          <span style={{
                            backgroundColor: stage.color,
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600',
                            minWidth: '32px',
                            textAlign: 'center'
                          }}>{stage.count}</span>
                          <span style={{ color: '#888', fontSize: '12px', minWidth: '40px', textAlign: 'right' }}>
                            {submissions.length > 0 ? Math.round((stage.count / submissions.length) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Pipeline View */}
        {viewMode === 'pipeline' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
            marginBottom: '32px',
            overflowX: 'auto'
          }}>
            {[
              { status: 'new', label: 'New', color: '#F59E0B' },
              { status: 'in_progress', label: 'In Progress', color: '#3B82F6' },
              { status: 'mockup_sent', label: 'Mockup Sent', color: '#10B981' },
              { status: 'followed_up', label: 'Followed Up', color: '#8B5CF6' },
              { status: 'converted', label: 'Converted', color: '#EE2C7C' },
            ].map((stage) => (
              <div
                key={stage.status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedItem && draggedItem.status !== stage.status) {
                    updateStatus(draggedItem.id, stage.status);
                  }
                  setDraggedItem(null);
                }}
                style={{
                  backgroundColor: draggedItem ? '#f0f0f0' : 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  minWidth: '200px',
                  minHeight: '200px',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `3px solid ${stage.color}`
                }}>
                  <span style={{ fontWeight: '600', color: '#252525' }}>{stage.label}</span>
                  <span style={{
                    backgroundColor: stage.color,
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {submissions.filter(s => s.status === stage.status).length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {submissions
                    .filter(s => s.status === stage.status)
                    .map((sub) => (
                      <div
                        key={sub.id}
                        draggable
                        onDragStart={() => setDraggedItem(sub)}
                        onDragEnd={() => setDraggedItem(null)}
                        style={{
                          backgroundColor: draggedItem?.id === sub.id ? '#ddd' : '#f7f8f8',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'grab',
                          transition: 'background-color 0.2s',
                          opacity: draggedItem?.id === sub.id ? 0.5 : 1
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          {sub.logo_url && (
                            <img
                              src={sub.logo_url}
                              alt="Logo"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingLogo(sub.logo_url);
                              }}
                              style={{
                                width: '36px',
                                height: '36px',
                                objectFit: 'contain',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            />
                          )}
                          <div style={{ flex: 1 }} onClick={() => setSelectedSubmission(sub)}>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#252525', marginBottom: '4px' }}>
                              {sub.first_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                              {sub.business_name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#aaa' }}>
                              {sub.location}
                            </div>
                            {sub.utm_source && (
                              <div style={{
                                fontSize: '10px',
                                color: '#3B82F6',
                                marginTop: '6px',
                                backgroundColor: '#EFF6FF',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-block'
                              }}>
                                {sub.utm_source}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submissions Table */}
        {viewMode === 'table' && (
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
                                onClick={() => setViewingLogo(sub.logo_url)}
                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#f7f8f8', cursor: 'pointer' }}
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
        )}
      </div>

      {/* Logo Modal */}
      {viewingLogo && (
        <div
          onClick={() => setViewingLogo(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            padding: '40px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <img
              src={viewingLogo}
              alt="Logo"
              style={{ width: '100%', height: 'auto' }}
            />
            <button
              onClick={() => setViewingLogo(null)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#f7f8f8',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
                <strong>Name:</strong> {selectedSubmission.first_name}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                <strong>Business:</strong> {selectedSubmission.business_name}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                <strong>Location:</strong> {selectedSubmission.location}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                <strong>Email:</strong> <a href={`mailto:${selectedSubmission.email}`} style={{ color: '#EE2C7C' }}>{selectedSubmission.email}</a>
              </p>
              {selectedSubmission.phone && (
                <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                  <strong>Phone:</strong> <a href={`tel:${selectedSubmission.phone}`} style={{ color: '#EE2C7C' }}>{selectedSubmission.phone}</a>
                </p>
              )}
              {selectedSubmission.extras && (
                <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                  <strong>Notes:</strong> {selectedSubmission.extras}
                </p>
              )}
              <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
                <strong>Submitted:</strong> {new Date(selectedSubmission.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              {(selectedSubmission.utm_source || selectedSubmission.utm_campaign) && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#888', fontWeight: '600' }}>ATTRIBUTION</p>
                  {selectedSubmission.utm_source && (
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#EFF6FF',
                      color: '#3B82F6',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '6px',
                      marginBottom: '6px'
                    }}>
                      {selectedSubmission.utm_source}
                    </span>
                  )}
                  {selectedSubmission.utm_medium && (
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#F0FDF4',
                      color: '#10B981',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '6px',
                      marginBottom: '6px'
                    }}>
                      {selectedSubmission.utm_medium}
                    </span>
                  )}
                  {selectedSubmission.utm_campaign && (
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#FDF4FF',
                      color: '#A855F7',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginBottom: '6px'
                    }}>
                      {selectedSubmission.utm_campaign}
                    </span>
                  )}
                </div>
              )}
              {selectedSubmission.logo_url && (
                <div style={{ marginTop: '12px' }}>
                  <strong style={{ fontSize: '14px' }}>Logo:</strong>
                  <img
                    src={selectedSubmission.logo_url}
                    alt="Logo"
                    onClick={() => {
                      setSelectedSubmission(null);
                      setViewingLogo(selectedSubmission.logo_url);
                    }}
                    style={{ display: 'block', maxWidth: '150px', marginTop: '8px', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', display: 'block' }}>Click to view full size</span>
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
                  Mockup Images
                </label>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                  Upload multiple images (desktop, mobile, different pages)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
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