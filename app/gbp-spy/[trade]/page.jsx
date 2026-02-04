'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getTradeBySlug } from '@/lib/trades'

export default function GBPSpyPage() {
    const params = useParams()
    const trade = getTradeBySlug(params.trade) || getTradeBySlug('trade')

    const [location, setLocation] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [searchStep, setSearchStep] = useState(0)
    const [competitors, setCompetitors] = useState(null)
    const [selectedCompetitor, setSelectedCompetitor] = useState(null)
    const [results, setResults] = useState(null)
    const [email, setEmail] = useState('')
    const [showEmailCapture, setShowEmailCapture] = useState(false)

    const searchSteps = [
        `Searching for ${trade.plural} in ${location}...`,
        'Finding top competitors...',
        'Analysing Google rankings...'
    ]

    const detailSteps = [
        'Analysing their profile...',
        'Calculating their lead flow...',
        'Generating competitor report...'
    ]

    // Step 1: Search for competitors in area
    const handleSearch = async (e) => {
        e.preventDefault()
        if (!location) return

        setIsSearching(true)
        setSearchStep(0)
        setCompetitors(null)
        setResults(null)

        const stepInterval = setInterval(() => {
            setSearchStep(prev => prev < searchSteps.length - 1 ? prev + 1 : prev)
        }, 800)

        try {
            const response = await fetch('/api/spy-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,
                    trade: trade.singular,
                    action: 'list'
                })
            })

            const data = await response.json()

            setTimeout(() => {
                clearInterval(stepInterval)
                setIsSearching(false)
                if (data.competitors && data.competitors.length > 0) {
                    setCompetitors(data.competitors)
                }
            }, 2500)

        } catch (error) {
            console.error('Error:', error)
            clearInterval(stepInterval)
            setIsSearching(false)
        }
    }

    // Step 2: Get details for selected competitor
    const handleSelectCompetitor = async (competitor) => {
        setSelectedCompetitor(competitor)
        setIsSearching(true)
        setSearchStep(0)

        const stepInterval = setInterval(() => {
            setSearchStep(prev => prev < detailSteps.length - 1 ? prev + 1 : prev)
        }, 1000)

        try {
            const response = await fetch('/api/spy-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,
                    trade: trade.singular,
                    placeId: competitor.placeId,
                    action: 'details'
                })
            })

            const data = await response.json()

            setTimeout(() => {
                clearInterval(stepInterval)
                setIsSearching(false)
                if (data.found) {
                    setShowEmailCapture(true)
                    setResults(data)
                }
            }, 3500)

        } catch (error) {
            console.error('Error:', error)
            clearInterval(stepInterval)
            setIsSearching(false)
        }
    }

    const handleEmailSubmit = (e) => {
        e.preventDefault()
        setShowEmailCapture(false)
    }

    const resetSearch = () => {
        setResults(null)
        setCompetitors(null)
        setSelectedCompetitor(null)
        setLocation('')
        setShowEmailCapture(false)
    }

    const currentSteps = selectedCompetitor ? detailSteps : searchSteps

    return (
        <>
            <style>{`
        html { scroll-behavior: smooth; }
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
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .count-up { animation: countUp 0.5s ease-out forwards; }
        input:focus { border-color: #10B981 !important; outline: none; }
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

                    {/* Initial Form */}
                    {!isSearching && !competitors && !results && (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '48px',
                                alignItems: 'center',
                                marginBottom: '60px'
                            }}>
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
                                        How many leads are your competitors getting?
                                    </h1>

                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '17px',
                                        lineHeight: '1.6',
                                        marginBottom: '24px'
                                    }}>
                                        Enter your location to see the top {trade.plural} in your area. Pick any competitor to reveal their estimated leads and how they're doing it.
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            'See who ranks top in your area',
                                            'Estimated leads they get per month',
                                            'Discover how they\'re beating you'
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    width: '8px', height: '8px',
                                                    backgroundColor: '#10B981',
                                                    borderRadius: '50%', flexShrink: 0
                                                }} />
                                                <span style={{ color: '#cbd5e1', fontSize: '15px' }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

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
                                        Find your competitors
                                    </h2>
                                    <p style={{
                                        color: '#64748b',
                                        fontSize: '14px',
                                        textAlign: 'center',
                                        marginBottom: '24px'
                                    }}>
                                        Enter your town or city
                                    </p>

                                    <form onSubmit={handleSearch}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                color: '#cbd5e1',
                                                fontWeight: '600',
                                                marginBottom: '8px',
                                                fontSize: '14px'
                                            }}>
                                                Your location
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Bristol, Manchester, Leeds"
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
                                            🔍 Find {trade.plural} in my area
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
                        </>
                    )}

                    {/* Loading Animation */}
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

                            <div style={{ minHeight: '100px' }}>
                                {currentSteps.map((step, index) => (
                                    <p
                                        key={index}
                                        className={index <= searchStep ? 'fade-in' : ''}
                                        style={{
                                            color: index === searchStep ? '#10B981' : '#64748b',
                                            fontSize: '16px',
                                            marginBottom: '12px',
                                            opacity: index <= searchStep ? 1 : 0,
                                            fontWeight: index === searchStep ? '600' : '400'
                                        }}
                                    >
                                        {index < searchStep ? '✓' : index === searchStep ? '●' : '○'} {step}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Competitor List */}
                    {!isSearching && competitors && !results && (
                        <div className="fade-in">
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                                    Top {trade.title} in {location}
                                </h2>
                                <p style={{ color: '#94a3b8', fontSize: '16px' }}>
                                    Select a competitor to spy on their stats
                                </p>
                            </div>

                            <div style={{
                                display: 'grid',
                                gap: '12px',
                                maxWidth: '600px',
                                margin: '0 auto'
                            }}>
                                {competitors.map((competitor, index) => (
                                    <button
                                        key={competitor.placeId}
                                        onClick={() => handleSelectCompetitor(competitor)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '16px 20px',
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            width: '100%',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.borderColor = '#10B981'
                                            e.currentTarget.style.backgroundColor = '#1e293b'
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.borderColor = '#334155'
                                        }}
                                    >
                                        <span style={{
                                            width: '32px',
                                            height: '32px',
                                            backgroundColor: index < 3 ? '#10B981' : '#334155',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            color: 'white',
                                            flexShrink: 0
                                        }}>
                                            {index + 1}
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                color: 'white',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                margin: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {competitor.name}
                                            </p>
                                            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>
                                                ★ {competitor.rating} ({competitor.reviewCount} reviews)
                                            </p>
                                        </div>
                                        <span style={{ color: '#10B981', fontSize: '20px' }}>→</span>
                                    </button>
                                ))}
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
                                Search different location
                            </button>
                        </div>
                    )}

                    {/* Email Capture Modal */}
                    {showEmailCapture && results?.found && (
                        <div style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
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
                                        Report ready!
                                    </h3>
                                    <p style={{ color: '#94a3b8', fontSize: '15px' }}>
                                        Enter your email to see <strong style={{ color: 'white' }}>{results.business.name}'s</strong> full stats.
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

                    {/* Results */}
                    {results && results.found && !showEmailCapture && (
                        <div className="fade-in">
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

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {[
                                        { label: 'Monthly Searches', value: results.stats.searchVolume.toLocaleString(), sub: `in ${results.location}` },
                                        { label: 'Est. Leads/Month', value: results.stats.estimatedLeads, sub: 'calls & enquiries' },
                                        { label: 'Est. Revenue', value: `£${results.stats.estimatedRevenue.toLocaleString()}`, sub: 'per month from Google' },
                                        { label: 'Calls/Week', value: results.stats.estimatedCallsPerWeek, sub: 'from this profile' }
                                    ].map((stat, i) => (
                                        <div key={i} style={{
                                            backgroundColor: '#0f172a',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            textAlign: 'center'
                                        }}>
                                            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>{stat.label}</p>
                                            <p className="count-up" style={{ color: '#10B981', fontSize: '32px', fontWeight: '700', margin: 0 }}>
                                                {stat.value}
                                            </p>
                                            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>{stat.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

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

                            <div style={{
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                borderRadius: '16px',
                                padding: '32px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
                                    Want to outrank {results.business.name.split(' ')[0]}?
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                                    Get our free guide: "The Local SEO Secrets Most {trade.title} Don't Know" — learn exactly how to beat your competitors.
                                </p>
                                <button style={{
                                    padding: '16px 32px',
                                    backgroundColor: 'white',
                                    color: '#059669',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}>
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