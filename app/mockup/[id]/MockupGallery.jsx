'use client'

import { useState } from 'react'

export default function MockupGallery({ mockupUrls, businessName, submissionId, firstName }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [responded, setResponded] = useState(false)
    const [isInterested, setIsInterested] = useState(null)
    const [loading, setLoading] = useState(false)

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? mockupUrls.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === mockupUrls.length - 1 ? 0 : prev + 1))
    }

    const handleInterest = async (interested) => {
        setLoading(true)
        try {
            await fetch('/api/interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId, interested })
            })
            setIsInterested(interested)
            setResponded(true)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section style={{
            padding: '48px 24px',
            maxWidth: '1000px',
            margin: '0 auto'
        }}>
            {/* Thumbnails - only show if multiple images */}
            {mockupUrls.length > 1 && (
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap'
                }}>
                    {mockupUrls.map((url, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            style={{
                                padding: '4px',
                                border: currentIndex === index ? '2px solid #EE2C7C' : '2px solid #ddd',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <img
                                src={url}
                                alt={`Design ${index + 1}`}
                                style={{
                                    width: '80px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    display: 'block'
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Mockup Display */}
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                position: 'relative'
            }}>
                {/* Browser bar */}
                <div style={{
                    backgroundColor: '#2d2d2d',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#ff5f57', borderRadius: '50%' }} />
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#ffbd2e', borderRadius: '50%' }} />
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#28c940', borderRadius: '50%' }} />
                    </div>
                    <div style={{ flex: 1 }} />
                    {mockupUrls.length > 1 && (
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            color: '#888'
                        }}>
                            {currentIndex + 1} / {mockupUrls.length}
                        </div>
                    )}
                </div>

                {/* Mockup image with navigation */}
                <div style={{ position: 'relative' }}>
                    {/* Navigation arrows - only show if multiple images */}
                    {mockupUrls.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    color: '#252525',
                                    zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                            >
                                ←
                            </button>
                            <button
                                onClick={goToNext}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    color: '#252525',
                                    zIndex: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                            >
                                →
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div style={{ overflow: 'auto' }}>
                        <img
                            src={mockupUrls[currentIndex]}
                            alt={`${businessName} website preview ${currentIndex + 1}`}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Design labels - only show if multiple images */}
            {mockupUrls.length > 1 && (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center',
                    marginTop: '24px'
                }}>
                    {mockupUrls.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: currentIndex === index ? '#EE2C7C' : '#ddd',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Interest Section */}
            <div id="interest" style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '40px',
                marginTop: '32px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}>
                {!responded ? (
                    <>
                        <h3 style={{
                            color: '#252525',
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '12px'
                        }}>
                            Want to make this design a reality?
                        </h3>
                        <p style={{
                            color: '#888',
                            fontSize: '14px',
                            marginBottom: '24px'
                        }}>
                            Don't worry, nothing is set in stone... we can make changes.
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => handleInterest(true)}
                                disabled={loading}
                                style={{
                                    padding: '16px 48px',
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    cursor: loading ? 'wait' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => handleInterest(false)}
                                disabled={loading}
                                style={{
                                    padding: '16px 48px',
                                    backgroundColor: '#f7f8f8',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    cursor: loading ? 'wait' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                No
                            </button>
                        </div>
                    </>
                ) : isInterested ? (
                    <>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#10B981',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <span style={{ color: 'white', fontSize: '32px' }}>✓</span>
                        </div>
                        <h3 style={{
                            color: '#252525',
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '12px'
                        }}>
                            Awesome {firstName}, we'll be in touch very soon!
                        </h3>
                        <p style={{
                            color: '#666',
                            fontSize: '16px'
                        }}>
                            Keep an eye on your email.
                        </p>
                    </>
                ) : (
                    <>
                        <h3 style={{
                            color: '#252525',
                            fontSize: '24px',
                            fontWeight: '700',
                            marginBottom: '12px'
                        }}>
                            No problem, thanks for looking!
                        </h3>
                        <p style={{
                            color: '#666',
                            fontSize: '16px'
                        }}>
                            If you change your mind, just reply to our email.
                        </p>
                    </>
                )}
            </div>
        </section>
    )
}