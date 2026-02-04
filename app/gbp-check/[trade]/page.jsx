'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getTradeBySlug } from '@/lib/trades'

export default function GBPCheckPage() {
    const params = useParams()
    const trade = getTradeBySlug(params.trade) || getTradeBySlug('trade')

    const [businessName, setBusinessName] = useState('')
    const [location, setLocation] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [searchStep, setSearchStep] = useState(0)
    const [results, setResults] = useState(null)

    const searchSteps = [
        'Searching Google Business Profiles...',
        `Analysing ${trade.plural} in your area...`,
        'Checking your visibility...',
        'Calculating potential leads...'
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!businessName || !location) return

        setIsSearching(true)
        setSearchStep(0)
        setResults(null)

        // Animate through steps
        const stepInterval = setInterval(() => {
            setSearchStep(prev => {
                if (prev < searchSteps.length - 1) return prev + 1
                return prev
            })
        }, 1200)

        try {
            const response = await fetch('/api/gbp-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName,
                    location,
                    trade: trade.singular
                })
            })

            const data = await response.json()

            // Wait for animation to complete
            setTimeout(() => {
                clearInterval(stepInterval)
                setIsSearching(false)
                setResults(data)
            }, 5000)

        } catch (error) {
            console.error('Error:', error)
            clearInterval(stepInterval)
            setIsSearching(false)
        }
    }

    const resetSearch = () => {
        setResults(null)
        setBusinessName('')
        setLocation('')
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
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        input:focus {
          border-color: #EE2C7C !important;
          outline: none;
        }
      `}</style>

            <div style={{
                minHeight: '100vh',
                backgroundColor: '#ffffff',
                fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
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
                    <img
                        src="/logo.png"
                        alt="360 Creation"
                        style={{ height: '36px', width: 'auto' }}
                    />
                    <a
                        href="tel:01onal"
                        style={{
                            color: '#252525',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        01onal
                    </a>
                </header>

                {/* Main Content */}
                <main style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    padding: '60px 24px 80px'
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
                                        backgroundColor: '#FEF3C7',
                                        color: '#92400E',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        padding: '8px 16px',
                                        borderRadius: '50px',
                                        marginBottom: '24px'
                                    }}>
                                        ⚠️ 87% of customers search Google first
                                    </p>

                                    <h1 style={{
                                        color: '#252525',
                                        fontSize: 'clamp(28px, 4vw, 40px)',
                                        fontWeight: '700',
                                        lineHeight: '1.2',
                                        marginBottom: '16px'
                                    }}>
                                        When someone searches for a {trade.singular} in your area — do they find you?
                                    </h1>

                                    <p style={{
                                        color: '#666',
                                        fontSize: '17px',
                                        lineHeight: '1.6',
                                        marginBottom: '24px'
                                    }}>
                                        Your competitors are getting calls right now from Google. Let's see if you're missing out.
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        {[
                                            'The top 3 profiles get 70% of clicks',
                                            'No profile = invisible to customers',
                                            'Free check, instant results'
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#EE2C7C',
                                                    borderRadius: '50%',
                                                    flexShrink: 0
                                                }} />
                                                <span style={{ color: '#555', fontSize: '15px' }}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right - Form */}
                                <div style={{
                                    backgroundColor: '#f7f8f8',
                                    borderRadius: '16px',
                                    padding: '32px'
                                }}>
                                    <h2 style={{
                                        color: '#252525',
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        marginBottom: '24px',
                                        textAlign: 'center'
                                    }}>
                                        Check your Google visibility
                                    </h2>

                                    <form onSubmit={handleSubmit}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{
                                                display: 'block',
                                                color: '#252525',
                                                fontWeight: '600',
                                                marginBottom: '8px',
                                                fontSize: '14px'
                                            }}>
                                                Your business name
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
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    fontSize: '16px',
                                                    backgroundColor: 'white',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{
                                                display: 'block',
                                                color: '#252525',
                                                fontWeight: '600',
                                                marginBottom: '8px',
                                                fontSize: '14px'
                                            }}>
                                                Your location
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
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    fontSize: '16px',
                                                    backgroundColor: 'white',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                backgroundColor: '#EE2C7C',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Check my visibility
                                        </button>
                                    </form>

                                    <p style={{
                                        color: '#888',
                                        fontSize: '12px',
                                        textAlign: 'center',
                                        marginTop: '16px'
                                    }}>
                                        Free instant check • No signup required
                                    </p>
                                </div>
                            </div>

                            {/* Trust - below the fold */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '32px',
                                flexWrap: 'wrap',
                                paddingTop: '32px',
                                borderTop: '1px solid #eee'
                            }}>
                                {[
                                    `✓ Trusted by 100+ UK ${trade.plural}`,
                                    '✓ 5.0 on Google',
                                    '✓ Local SEO experts'
                                ].map((item, i) => (
                                    <span key={i} style={{ color: '#666', fontSize: '14px', margin: 0 }}>{item}</span>
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
                                border: '4px solid #f0f0f0',
                                borderTop: '4px solid #EE2C7C',
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
                                            color: index === searchStep ? '#252525' : '#888',
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

                            <p style={{ color: '#888', fontSize: '14px', marginTop: '32px' }}>
                                Analysing <strong>{businessName}</strong> in <strong>{location}</strong>
                            </p>
                        </div>
                    )}

                    {/* Results - Not Found */}
                    {results && !results.found && (
                        <div className="fade-in" style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#FEE2E2',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                fontSize: '36px'
                            }}>
                                ⚠️
                            </div>

                            <h2 style={{
                                color: '#252525',
                                fontSize: '28px',
                                fontWeight: '700',
                                marginBottom: '16px'
                            }}>
                                We couldn't find you on Google
                            </h2>

                            <p style={{
                                color: '#666',
                                fontSize: '18px',
                                marginBottom: '32px',
                                maxWidth: '500px',
                                margin: '0 auto 32px'
                            }}>
                                When customers search for a {trade.singular} in {results.location}, they're not finding <strong>{businessName}</strong>.
                            </p>

                            {/* Stats */}
                            <div style={{
                                backgroundColor: '#f7f8f8',
                                borderRadius: '16px',
                                padding: '32px',
                                maxWidth: '500px',
                                margin: '0 auto 32px'
                            }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <p style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>
                                        Estimated monthly searches for {trade.plural} in {results.location}
                                    </p>
                                    <p style={{ color: '#252525', fontSize: '48px', fontWeight: '700' }}>
                                        {results.searchVolume.toLocaleString()}+
                                    </p>
                                </div>

                                <div style={{
                                    backgroundColor: '#FEE2E2',
                                    borderRadius: '8px',
                                    padding: '16px'
                                }}>
                                    <p style={{ color: '#DC2626', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                                        You're invisible to all of them.
                                    </p>
                                </div>
                            </div>

                            <p style={{
                                color: '#666',
                                fontSize: '16px',
                                marginBottom: '24px'
                            }}>
                                The top 3 Google Business Profiles get <strong>70%+ of all clicks</strong>. Right now, that's your competitors — not you.
                            </p>

                            {/* CTA */}
                            <div style={{
                                backgroundColor: '#252525',
                                borderRadius: '16px',
                                padding: '32px',
                                maxWidth: '500px',
                                margin: '0 auto'
                            }}>
                                <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
                                    Let's fix this
                                </h3>
                                <p style={{ color: '#888', fontSize: '15px', marginBottom: '24px' }}>
                                    We'll set up and optimise your Google Business Profile so customers can find you.
                                </p>
                                <a
                                    href="https://threesixtycreation.co.uk/#contact"
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: '#EE2C7C',
                                        color: 'white',
                                        padding: '16px 32px',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Get started — £200
                                </a>
                                <p style={{ color: '#666', fontSize: '13px', marginTop: '16px' }}>
                                    Setup + optimisation included
                                </p>
                            </div>

                            <button
                                onClick={resetSearch}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#888',
                                    fontSize: '14px',
                                    marginTop: '24px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Check another business
                            </button>
                        </div>
                    )}

                    {/* Results - Found */}
                    {results && results.found && (
                        <div className="fade-in" style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#FEF3C7',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                fontSize: '36px'
                            }}>
                                📍
                            </div>

                            <h2 style={{
                                color: '#252525',
                                fontSize: '28px',
                                fontWeight: '700',
                                marginBottom: '16px'
                            }}>
                                We found you — but are you getting leads?
                            </h2>

                            {/* Business Card */}
                            <div style={{
                                backgroundColor: '#f7f8f8',
                                borderRadius: '16px',
                                padding: '24px',
                                maxWidth: '500px',
                                margin: '0 auto 32px',
                                textAlign: 'left'
                            }}>
                                <p style={{ color: '#252525', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                                    {results.business.name}
                                </p>
                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                                    {results.business.address}
                                </p>
                                {results.business.rating && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#FBBC04' }}>★</span>
                                        <span style={{ color: '#252525', fontWeight: '600' }}>{results.business.rating}</span>
                                        <span style={{ color: '#888' }}>({results.business.reviewCount} reviews)</span>
                                    </div>
                                )}
                                {!results.business.rating && (
                                    <p style={{ color: '#DC2626', fontSize: '14px' }}>
                                        ⚠️ No reviews yet — this hurts your visibility
                                    </p>
                                )}
                            </div>

                            {/* The Problem */}
                            <div style={{
                                backgroundColor: '#FEF3C7',
                                borderRadius: '12px',
                                padding: '20px',
                                maxWidth: '500px',
                                margin: '0 auto 32px'
                            }}>
                                <p style={{ color: '#92400E', fontSize: '15px', margin: 0 }}>
                                    <strong>The problem:</strong> Being listed isn't enough. The top 3 profiles in {results.location} are getting <strong>70%+ of the leads</strong>. Are you one of them?
                                </p>
                            </div>

                            {/* Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                maxWidth: '500px',
                                margin: '0 auto 32px'
                            }}>
                                <div style={{
                                    backgroundColor: '#f7f8f8',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }}>
                                    <p style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>
                                        Monthly searches
                                    </p>
                                    <p style={{ color: '#252525', fontSize: '28px', fontWeight: '700' }}>
                                        {results.searchVolume.toLocaleString()}+
                                    </p>
                                </div>
                                <div style={{
                                    backgroundColor: '#f7f8f8',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }}>
                                    <p style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>
                                        Potential leads/month
                                    </p>
                                    <p style={{ color: '#252525', fontSize: '28px', fontWeight: '700' }}>
                                        {results.estimatedLeads}+
                                    </p>
                                </div>
                            </div>

                            <p style={{
                                color: '#666',
                                fontSize: '16px',
                                marginBottom: '24px',
                                maxWidth: '500px',
                                margin: '0 auto 24px'
                            }}>
                                {results.business.reviewCount < 20
                                    ? `With only ${results.business.reviewCount} reviews, you're likely being outranked by competitors with more.`
                                    : `You've got reviews, but is your profile fully optimised? Photos, posts, services, Q&A?`
                                }
                            </p>

                            {/* CTA */}
                            <div style={{
                                backgroundColor: '#252525',
                                borderRadius: '16px',
                                padding: '32px',
                                maxWidth: '500px',
                                margin: '0 auto'
                            }}>
                                <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
                                    Get more leads from Google
                                </h3>
                                <p style={{ color: '#888', fontSize: '15px', marginBottom: '24px' }}>
                                    We'll optimise your profile to rank higher and convert more searchers into customers.
                                </p>
                                <a
                                    href="https://threesixtycreation.co.uk/#contact"
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: '#EE2C7C',
                                        color: 'white',
                                        padding: '16px 32px',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Optimise my profile — £200
                                </a>
                                <p style={{ color: '#666', fontSize: '13px', marginTop: '16px' }}>
                                    Full audit + optimisation included
                                </p>
                            </div>

                            <button
                                onClick={resetSearch}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#888',
                                    fontSize: '14px',
                                    marginTop: '24px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Check another business
                            </button>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer style={{
                    padding: '24px',
                    textAlign: 'center',
                    borderTop: '1px solid #eee'
                }}>
                    <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
                        © {new Date().getFullYear()} 360 Creation
                    </p>
                </footer>
            </div>
        </>
    )
}