'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getTradeBySlug } from '@/lib/trades'

export default function GBPSpyPage() {
    const params = useParams()
    const trade = getTradeBySlug(params.trade) || getTradeBySlug('trade')

    const [businessName, setBusinessName] = useState('')
    const [location, setLocation] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [searchStep, setSearchStep] = useState(0)
    const [results, setResults] = useState(null)
    const [email, setEmail] = useState('')
    const [showEmailCapture, setShowEmailCapture] = useState(false)

    const searchSteps = [
        'Searching Google Business Profiles...',
        'Analysing their ranking signals...',
        'Calculating their lead flow...',
        'Generating competitor report...'
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!businessName || !location) return

        setIsSearching(true)
        setSearchStep(0)
        setResults(null)

        const stepInterval = setInterval(() => {
            setSearchStep(prev => {
                if (prev < searchSteps.length - 1) return prev + 1
                return prev
            })
        }, 1000)

        try {
            const response = await fetch('/api/spy-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName,
                    location,
                    trade: trade.singular
                })
            })

            const data = await response.json()

            setTimeout(() => {
                clearInterval(stepInterval)
                setIsSearching(false)
                if (data.found) {
                    setShowEmailCapture(true)
                    setResults(data)
                } else {
                    setResults(data)
                }
            }, 4500)

        } catch (error) {
            console.error('Error:', error)
            clearInterval(stepInterval)
            setIsSearching(false)
        }
    }

    const handleEmailSubmit = (e) => {
        e.preventDefault()
        // TODO: Save email to database
        setShowEmailCapture(false)
    }

    const resetSearch = () => {
        setResults(null)
        setBusinessName('')
        setLocation('')
        setShowEmailCapture(false)
    }

    return (
        <>
            <style>{`
        html { scroll-behavior: smooth; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .count-up {
          animation: countUp 0.5s ease-out forwards;
        }
        input:focus {
          border-color: #10B981 !important;
          outline: none;
        }
      `}</style>

            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0f172a',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
                color: 'white'
            }}>
                {/* Header */}
                <header style={{
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>🔍</span>
                        <span style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            GBP SPY
                        </span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                        Competitor Intelligence Tool
                    </span>
                </header>

                {/* Main Content */}
                <main style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '40px 24px 80px'
                }}>

                    {!isSearching && !results && (
                        <>
                            {/* Hero - Split Layout */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '48px',
                                alignItems: 'center',
                                marginBottom: '60px'
                            }}>
                                {/* Left - Content */}
                                <div>
                                    <p style={{
                                        display: 'inline-block',
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10B981',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        padding: '8px 16px',
                                        borderRadius: '50px',
                                        marginBottom: '24px',
                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}>
                                        🔍 Free Competitor Analysis
                                    </p>

                                    <h1 style={{
                                        color: 'white',
                                        fontSize: 'clamp(28px, 4vw, 42px)',
                                        fontWeight: '700',
                                        lineHeight: '1.2',
                                        marginBottom: '16px'
                                    }}>
                                        How many leads is your competitor getting from Google?
                                    </h1>

                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '17px',
                                        lineHeight: '1.6',
                                        marginBottom: '24px'
                                    }}>
                                        Enter any {trade.singular} business in your area. See their reviews, estimated leads, and discover why they're ranking above you.
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        {[
                                            'See their Google rating & reviews',
                                            'Estimated leads they get per month',
                                            'Why they rank higher than you'
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#10B981',
                                                    borderRadius: '50%',
                                                    flexShrink: 0
                                                }} />
                                                <span style={{ color: '#cbd5e1', fontSize: '15px' }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right - Form */}
                                <div style={{
                                    backgroundColor: '#1e293b',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    border: '1px solid #334155'
                                }}>
                                    <h2 style={{
                                        color: 'white',
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        marginBottom: '8px',
                                        textAlign: 'center'
                                    }}>
                                        Spy on a competitor
                                    </h2>
                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '14px',
                                        textAlign: 'center',
                                        marginBottom: '24px'
                                    }}>
                                        Enter their business name to see their stats
                                    </p>

                                    <form onSubmit={handleSubmit}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{
                                                display: 'block',
                                                color: '#cbd5e1',
                                                fontWeight: '600',
                                                marginBottom: '8px',
                                                fontSize: '14px'
                                            }}>
                                                Competitor's business name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={`e.g. Smith's ${trade.title}`}
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 16px',
                                                    border: '1px solid #334155',
                                                    borderRadius: '8px',
                                                    fontSize: '16px',
                                                    backgroundColor: '#0f172a',
                                                    color: 'white',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                color: '#cbd5e1',
                                                fontWeight: '600',
                                                marginBottom: '8px',
                                                fontSize: '14px'
                                            }}>
                                                Their location
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Bristol"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 16px',
                                                    border: '1px solid #334155',
                                                    borderRadius: '8px',
                                                    fontSize: '16px',
                                                    backgroundColor: '#0f172a',
                                                    color: 'white',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🔍 Reveal their stats
                                        </button>
                                    </form>

                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '12px',
                                        textAlign: 'center',
                                        marginTop: '16px'
                                    }}>
                                        Free • Instant results • No signup
                                    </p>
                                </div>
                            </div>

                            {/* How it works */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '24px',
                                paddingTop: '40px',
                                borderTop: '1px solid #1e293b'
                            }}>
                                {[
                                    { icon: '🔍', title: 'Search', desc: 'Enter any competitor' },
                                    { icon: '📊', title: 'Analyse', desc: 'We pull their GBP data' },
                                    { icon: '💡', title: 'Learn', desc: 'See why they rank' }
                                ].map((item, i) => (
                                    <div key={i} style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: '32px' }}>{item.icon}</span>
                                        <p style={{ color: 'white', fontWeight: '600', margin: '12px 0 4px' }}>{item.title}</p>
                                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Searching Animation */}
                    {isSearching && (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                border: '4px solid #1e293b',
                                borderTop: '4px solid #10B981',
                                borderRadius: '50%',
                                margin: '0 auto 32px',
                                animation: 'spin 1s linear infinite'
                            }} />

                            <div style={{ minHeight: '120px' }}>
                                {searchSteps.map((step, index) => (
                                    <p
                                        key={index}
                                        className={index <= searchStep ? 'fade-in' : ''}
                                        style={{
                                            color: index === searchStep ? '#10B981' : '#64748b',
                                            fontSize: '16px',
                                            marginBottom: '12px',
                                            opacity: index <= searchStep ? 1 : 0,
                                            fontWeight: index === searchStep ? '600' : '400',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {index < searchStep ? '✓' : index === searchStep ? '●' : '○'} {step}
                                    </p>
                                ))}
                            </div>

                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '32px' }}>
                                Analysing <strong style={{ color: 'white' }}>{businessName}</strong> in <strong style={{ color: 'white' }}>{location}</strong>
                            </p>
                        </div>
                    )}

                    {/* Email Capture Modal */}
                    {showEmailCapture && results?.found && (
                        <div style={{
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
                            padding: '24px'
                        }}>
                            <div className="fade-in" style={{
                                backgroundColor: '#1e293b',
                                borderRadius: '16px',
                                padding: '32px',
                                maxWidth: '400px',
                                width: '100%',
                                border: '1px solid #334155'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <span style={{ fontSize: '48px' }}>🎯</span>
                                    <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '700', margin: '16px 0 8px' }}>
                                        We found them!
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '15px' }}>
                                        Enter your email to see <strong style={{ color: 'white' }}>{results.business.name}'s</strong> full competitor report.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit}>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            backgroundColor: '#0f172a',
                                            color: 'white',
                                            boxSizing: 'border-box',
                                            marginBottom: '16px'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, #10B981, #059669)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Show me their stats →
                                    </button>
                                </form>

                                <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
                                    No spam. Just the report.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Results - Found */}
                    {results && results.found && !showEmailCapture && (
                        <div className="fade-in">
                            {/* Competitor Card */}
                            <div style={{
                                backgroundColor: '#1e293b',
                                borderRadius: '16px',
                                padding: '32px',
                                marginBottom: '32px',
                                border: '1px solid #334155'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap',
                                    gap: '16px',
                                    marginBottom: '24px'
                                }}>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Competitor</p>
                                        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: 0 }}>
                                            {results.business.name}
                                        </h2>
                                        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
                                            {results.business.address}
                                        </p>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        backgroundColor: '#0f172a',
                                        padding: '12px 16px',
                                        borderRadius: '8px'
                                    }}>
                                        <span style={{ color: '#facc15', fontSize: '20px' }}>★</span>
                                        <span style={{ color: 'white', fontSize: '20px', fontWeight: '700' }}>{results.business.rating}</span>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>({results.business.reviewCount} reviews)</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '16px'
                                }}>
                                    <div style={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>Monthly Searches</p>
                                        <p className="count-up" style={{ color: '#10B981', fontSize: '32px', fontWeight: '700', margin: 0 }}>
                                            {results.stats.searchVolume.toLocaleString()}
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>in {results.location}</p>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>Est. Leads/Month</p>
                                        <p className="count-up" style={{ color: '#10B981', fontSize: '32px', fontWeight: '700', margin: 0 }}>
                                            {results.stats.estimatedLeads}
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>calls & enquiries</p>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>Est. Revenue</p>
                                        <p className="count-up" style={{ color: '#10B981', fontSize: '32px', fontWeight: '700', margin: 0 }}>
                                            £{results.stats.estimatedRevenue.toLocaleString()}
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>per month from Google</p>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>Calls/Week</p>
                                        <p className="count-up" style={{ color: '#10B981', fontSize: '32px', fontWeight: '700', margin: 0 }}>
                                            {results.stats.estimatedCallsPerWeek}
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>from this profile</p>
                                    </div>
                                </div>
                            </div>

                            {/* Why They Rank */}
                            <div style={{
                                backgroundColor: '#1e293b',
                                borderRadius: '16px',
                                padding: '32px',
                                marginBottom: '32px',
                                border: '1px solid #334155'
                            }}>
                                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                                    🔍 Why they're ranking
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {results.insights.map((insight, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ color: '#10B981' }}>✓</span>
                                            <span style={{ color: '#cbd5e1', fontSize: '15px' }}>{insight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div style={{
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                borderRadius: '16px',
                                padding: '32px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
                                    Want to outrank them?
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                                    Get our free guide: "The Local SEO Secrets Most {trade.title} Don't Know" — learn exactly how to beat competitors like {results.business.name}.
                                </p>
                                <button
                                    style={{
                                        padding: '16px 32px',
                                        backgroundColor: 'white',
                                        color: '#059669',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Get the free guide →
                                </button>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '12px' }}>
                                    Or <a href="#" style={{ color: 'white', textDecoration: 'underline' }}>get us to do it for you →</a>
                                </p>
                            </div>

                            <button
                                onClick={resetSearch}
                                style={{
                                    display: 'block',
                                    margin: '32px auto 0',
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Spy on another competitor
                            </button>
                        </div>
                    )}

                    {/* Results - Not Found */}
                    {results && !results.found && (
                        <div className="fade-in" style={{ textAlign: 'center', padding: '60px 0' }}>
                            <span style={{ fontSize: '64px' }}>🤔</span>
                            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: '24px 0 12px' }}>
                                Couldn't find that business
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px' }}>
                                {results.message}
                            </p>
                            <button
                                onClick={resetSearch}
                                style={{
                                    padding: '16px 32px',
                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer style={{
                    padding: '24px',
                    textAlign: 'center',
                    borderTop: '1px solid #1e293b'
                }}>
                    <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>
                        © {new Date().getFullYear()} GBP Spy • A tool by 360 Creation
                    </p>
                </footer>
            </div>
        </>
    )
}