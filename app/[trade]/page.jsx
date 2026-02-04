'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getTradeBySlug } from '@/lib/trades';

const TradeLandingPage = () => {
    const params = useParams();
    const trade = getTradeBySlug(params.trade);

    if (!trade) {
        notFound();
    }

    const [formData, setFormData] = useState({
        firstName: '',
        businessName: '',
        location: '',
        email: '',
        phone: '',
        extras: ''
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [noLogo, setNoLogo] = useState(false);
    const [needsLogoDesign, setNeedsLogoDesign] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewingCount, setViewingCount] = useState(11);
    const [currentReview, setCurrentReview] = useState(0);

    const reviews = [
        {
            name: 'Simon H.',
            text: 'Excellent service, design and aftercare. Would highly recommend!',
        },
        {
            name: 'Rich A.',
            text: "First class service from start to finish. My requirements were not straightforward, but Greg dealt with it perfectly for me. Highly recommend.",
        },
        {
            name: 'Ryan H.',
            text: "Greg designed a website for me and I couldn't be happier with the work he's done. His knowledge and professionalism is great and he communicates very well.",
        }
    ];

    // Auto-rotate reviews every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentReview(prev => (prev + 1) % reviews.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Fluctuate viewing count randomly - slower and smaller jumps
    useEffect(() => {
        const interval = setInterval(() => {
            setViewingCount(prev => {
                // Small change: -1, 0, or +1
                const change = Math.floor(Math.random() * 3) - 1;
                const newCount = prev + change;
                // Keep between 8 and 15
                return Math.max(8, Math.min(15, newCount));
            });
        }, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, []);

    // Track page view on load
    useEffect(() => {
        const trackPageView = async () => {
            // Get or create visitor ID
            let visitorId = localStorage.getItem('visitor_id');
            if (!visitorId) {
                visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now();
                localStorage.setItem('visitor_id', visitorId);
            }

            // Get UTM params
            const urlParams = new URLSearchParams(window.location.search);
            const utmSource = urlParams.get('utm_source') || '';

            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        visitorId,
                        page: window.location.pathname,
                        utmSource: utmSource,
                        utmMedium: urlParams.get('utm_medium') || '',
                        utmCampaign: urlParams.get('utm_campaign') || '',
                        referrer: document.referrer || '',
                        userAgent: navigator.userAgent || ''
                    })
                });
            } catch (error) {
                console.error('Track error:', error);
            }

            // Send initial heartbeat
            const sendHeartbeat = async () => {
                try {
                    await fetch('/api/heartbeat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            visitorId,
                            page: window.location.pathname,
                            utmSource: utmSource
                        })
                    });
                } catch (error) {
                    console.error('Heartbeat error:', error);
                }
            };

            sendHeartbeat();

            // Send heartbeat every 30 seconds
            const heartbeatInterval = setInterval(sendHeartbeat, 30000);

            return () => clearInterval(heartbeatInterval);
        };

        trackPageView();
    }, []);

    const examples = trade.examples;

    const faqs = [
        {
            question: "Is this really free?",
            answer: "Yes, completely free. No card details, no hidden fees. We design your preview and send it over - that's it."
        },
        {
            question: "What's the catch?",
            answer: "There isn't one. If you love it, we can build it. If not, no hard feelings. We're betting you'll like what you see."
        },
        {
            question: "What exactly do I get?",
            answer: "A custom design showing what your website could look like. It's a visual preview, not a working website."
        },
        {
            question: "How long does it take?",
            answer: "We'll have your preview in your inbox within 48 hours."
        },
        {
            question: "What if I like it?",
            answer: "We'll have a chat about building it for real. No pressure, just a conversation."
        },
        {
            question: "What if I don't like it?",
            answer: "No problem at all. There's no obligation. It's yours to keep either way."
        }
    ];

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Capture UTM params from URL
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source') || '';
        const utmMedium = urlParams.get('utm_medium') || '';
        const utmCampaign = urlParams.get('utm_campaign') || '';

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('firstName', formData.firstName);
            formDataToSend.append('businessName', formData.businessName);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('trade', trade.slug);
            formDataToSend.append('needsLogoDesign', needsLogoDesign === true ? 'yes' : 'no');
            formDataToSend.append('utmSource', utmSource);
            formDataToSend.append('utmMedium', utmMedium);
            formDataToSend.append('utmCampaign', utmCampaign);

            // Get the logo file from the input
            const logoInput = document.querySelector('input[type="file"]');
            if (logoInput?.files[0]) {
                formDataToSend.append('logo', logoInput.files[0]);
            }

            const response = await fetch('/api/submit', {
                method: 'POST',
                body: formDataToSend,
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % examples.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + examples.length) % examples.length);
    };

    // Hover state for pausing carousel
    const [isHovered, setIsHovered] = useState(false);

    // Auto-rotate every 5 seconds (pause on hover or when modal open)
    useEffect(() => {
        if (isHovered || modalOpen) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % examples.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered, modalOpen]);

    // Swipe handling
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    const MockupCard = ({ example, onClick }) => (
        <div
            onClick={onClick}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
            }}
        >
            <div style={{
                backgroundColor: '#2d2d2d',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#ff5f57', borderRadius: '50%' }} />
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#ffbd2e', borderRadius: '50%' }} />
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#28c940', borderRadius: '50%' }} />
                </div>
                <div style={{
                    flex: 1,
                    backgroundColor: '#1a1a1a',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    color: '#666',
                    textAlign: 'center'
                }}>
                    {example.business.toLowerCase().replace(/['\s.]/g, '')}.co.uk
                </div>
            </div>

            {/* Mockup image */}
            <div style={{
                height: '450px',
                overflow: 'hidden',
                backgroundColor: '#fff'
            }}>
                {example.image ? (
                    <img
                        src={example.image}
                        alt={`${example.business} website mockup`}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                    />
                ) : (
                    <div style={{
                        padding: '16px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999'
                    }}>
                        Mockup preview
                    </div>
                )}
            </div>

            {/* Info bar */}
            <div style={{
                backgroundColor: '#2d2d2d',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{example.business}</div>
                    <div style={{ color: '#888', fontSize: '11px' }}>{example.location}</div>
                </div>
                <div style={{
                    color: '#888',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    See full design
                </div>
            </div>
        </div>
    );

    const ImageModal = ({ example, onClose }) => (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '40px 20px',
                overflow: 'auto',
                cursor: 'pointer'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    maxWidth: '800px',
                    width: '100%',
                    cursor: 'default',
                    position: 'relative'
                }}
            >
                {/* Browser bar */}
                <div style={{
                    backgroundColor: '#2d2d2d',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#ff5f57', borderRadius: '50%' }} />
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#ffbd2e', borderRadius: '50%' }} />
                            <div style={{ width: '12px', height: '12px', backgroundColor: '#28c940', borderRadius: '50%' }} />
                        </div>
                        <div style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: '4px',
                            padding: '6px 16px',
                            fontSize: '12px',
                            color: '#666'
                        }}>
                            {example.business.toLowerCase().replace(/['\s.]/g, '')}.co.uk
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '0 8px'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Full image with scroll indicator */}
                <div style={{ maxHeight: '70vh', overflow: 'auto', position: 'relative' }}>
                    <img
                        src={example.image}
                        alt={`${example.business} website mockup`}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                    />

                    {/* Scroll indicator */}
                    <div style={{
                        position: 'sticky',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pointerEvents: 'none',
                        width: 'fit-content',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            padding: '10px 20px',
                            borderRadius: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ color: 'white', fontSize: '13px' }}>Scroll to see more</span>
                            <div style={{
                                animation: 'bounce 1.5s infinite',
                                color: 'white',
                                fontSize: '16px'
                            }}>
                                ↓
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info bar */}
                <div style={{
                    backgroundColor: '#2d2d2d',
                    padding: '16px',
                    textAlign: 'center'
                }}>
                    <div style={{ color: 'white', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                        {example.business}
                    </div>
                    <div style={{ color: '#888', fontSize: '13px' }}>{example.location}</div>
                </div>
            </div>

            <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(6px);
          }
          60% {
            transform: translateY(3px);
          }
        }
      `}</style>
        </div>
    );

    return (
        <>
            <style>{`html { scroll-behavior: smooth; }`}</style>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src="/logo.png"
                            alt="360 Creation"
                            style={{ height: '36px', width: 'auto' }}
                        />
                    </div>
                    <a href="#form" style={{
                        color: 'white',
                        backgroundColor: '#EE2C7C',
                        textDecoration: 'none',
                        fontSize: '14px',
                        padding: '12px 24px',
                        borderRadius: '50px',
                        fontWeight: '600'
                    }}>
                        Get my free preview
                    </a>
                </header>

                {/* Hero - Split on desktop, stacked on mobile */}
                <section style={{
                    padding: '40px 24px 60px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '48px',
                        alignItems: 'center'
                    }}>
                        {/* Left - Content */}
                        <div>
                            <p style={{
                                display: 'inline-block',
                                backgroundColor: '#f7f8f8',
                                color: '#252525',
                                fontSize: '13px',
                                fontWeight: '600',
                                marginBottom: '20px',
                                padding: '10px 18px',
                                borderRadius: '50px',
                                letterSpacing: '0.5px'
                            }}>
                                🇬🇧 Designed for 100+ UK {trade.title}
                            </p>

                            <h1 style={{
                                color: '#252525',
                                fontSize: 'clamp(32px, 5vw, 54px)',
                                fontWeight: '700',
                                lineHeight: '1.15',
                                marginBottom: '12px'
                            }}>
                                Get a preview of your new {trade.websiteType} website. No cost.
                            </h1>

                            <p style={{
                                color: '#EE2C7C',
                                fontSize: 'clamp(24px, 4vw, 34px)',
                                fontWeight: '600',
                                marginBottom: '20px'
                            }}>
                                Like it? We'll build it.
                            </p>

                            <p style={{
                                color: '#666',
                                fontSize: '16px',
                                lineHeight: '1.6',
                                marginBottom: '24px',
                                maxWidth: '440px'
                            }}>
                                We'll design a preview of your website so you can see exactly what it'd look like. Without any payment.
                            </p>

                            {/* Social proof */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '20px',
                                fontSize: '13px',
                                color: '#666'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#10B981',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s infinite'
                                }} />
                                <span><strong style={{ color: '#252525' }}>{viewingCount} {trade.plural}</strong> viewing</span>
                                <span style={{ color: '#ccc' }}>·</span>
                                <span><strong style={{ color: '#252525' }}>47 designs</strong> previewed this month</span>
                            </div>

                            <a
                                href="#form"
                                style={{
                                    display: 'inline-block',
                                    padding: '16px 32px',
                                    backgroundColor: '#EE2C7C',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '50px',
                                    fontSize: '15px',
                                    fontWeight: '600'
                                }}
                            >
                                Get my free preview
                            </a>
                        </div>

                        {/* Right - Carousel */}
                        <div
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div style={{
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    transition: 'transform 0.4s ease-in-out',
                                    transform: `translateX(-${currentSlide * 100}%)`
                                }}>
                                    {examples.map((example, index) => (
                                        <div key={index} style={{ minWidth: '100%' }}>
                                            <MockupCard
                                                example={example}
                                                onClick={() => setModalOpen(true)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Carousel controls */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '16px',
                                marginTop: '20px'
                            }}>
                                <button
                                    onClick={prevSlide}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '1px solid #ddd',
                                        backgroundColor: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        color: '#252525'
                                    }}
                                >
                                    ←
                                </button>

                                {/* Dots */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {examples.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                backgroundColor: currentSlide === index ? '#EE2C7C' : '#ddd',
                                                cursor: 'pointer',
                                                padding: 0
                                            }}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={nextSlide}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        border: '1px solid #ddd',
                                        backgroundColor: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        color: '#252525'
                                    }}
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Benefits line */}
                    <div style={{
                        marginTop: '48px',
                        textAlign: 'center'
                    }}>
                        {/* Desktop - all 3 visible */}
                        <div className="benefits-desktop" style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '40px',
                            flexWrap: 'wrap'
                        }}>
                            {[
                                'Professional custom design',
                                'Optimised to generate enquiries',
                                'Mobile & desktop ready'
                            ].map((benefit, index) => (
                                <span key={index} style={{
                                    color: '#666',
                                    fontSize: '16px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <span style={{ color: '#10B981', marginRight: '8px' }}>✓</span>
                                    {benefit}
                                </span>
                            ))}
                        </div>
                        {/* Mobile - only 2 */}
                        <div className="benefits-mobile" style={{
                            display: 'none',
                            justifyContent: 'center',
                            gap: '20px'
                        }}>
                            {[
                                'Optimised to generate enquiries',
                                'Mobile & desktop ready'
                            ].map((benefit, index) => (
                                <span key={index} style={{
                                    color: '#666',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <span style={{ color: '#10B981', marginRight: '6px' }}>✓</span>
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Modal */}
                {modalOpen && (
                    <ImageModal
                        example={examples[currentSlide]}
                        onClose={() => setModalOpen(false)}
                    />
                )}

                {/* How it works */}
                <section style={{
                    padding: '80px 24px',
                    backgroundColor: '#f7f8f8'
                }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h2 style={{
                            color: '#252525',
                            fontSize: '32px',
                            fontWeight: '700',
                            textAlign: 'center',
                            marginBottom: '48px'
                        }}>
                            How it works
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '32px'
                        }}>
                            {[
                                {
                                    step: '1',
                                    title: 'Fill in the form',
                                    description: 'Tell us your business name, location, and upload your logo if you have one.',
                                    icon: '📝'
                                },
                                {
                                    step: '2',
                                    title: 'We design it',
                                    description: `Our team creates a custom website design for your ${trade.websiteType} business. Within 48 hours.`,
                                    icon: '🎨'
                                },
                                {
                                    step: '3',
                                    title: 'You decide',
                                    description: "You'll get an email with your preview. Love it? We'll chat. Not for you? No worries.",
                                    icon: '✉️'
                                }
                            ].map((item, index) => (
                                <div key={index} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    textAlign: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}>
                                    <div style={{
                                        fontSize: '48px',
                                        marginBottom: '16px'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{
                                        display: 'inline-block',
                                        backgroundColor: '#EE2C7C',
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        marginBottom: '16px'
                                    }}>
                                        Step {item.step}
                                    </div>
                                    <h3 style={{
                                        color: '#252525',
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        marginBottom: '12px'
                                    }}>
                                        {item.title}
                                    </h3>
                                    <p style={{
                                        color: '#666',
                                        fontSize: '15px',
                                        lineHeight: '1.6',
                                        margin: 0
                                    }}>
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Reviews Section */}
                <section style={{
                    padding: '80px 24px',
                    backgroundColor: '#f7f8f8'
                }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '8px'
                            }}>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} style={{ color: '#FBBC04', fontSize: '24px' }}>★</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ color: '#252525', fontSize: '15px', fontWeight: '600' }}>5.0</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '20px', height: '20px' }}>
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                </svg>
                                <span style={{ color: '#666', fontSize: '15px' }}>40 reviews on Google</span>
                            </div>
                        </div>

                        {/* Single Review Display */}
                        <div style={{
                            minHeight: '180px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <p style={{
                                color: '#252525',
                                fontSize: '22px',
                                lineHeight: '1.6',
                                marginBottom: '24px',
                                fontStyle: 'italic',
                                maxWidth: '600px'
                            }}>
                                "{reviews[currentReview].text}"
                            </p>
                            <div style={{ color: '#666', fontSize: '15px', fontWeight: '600' }}>
                                — {reviews[currentReview].name}
                            </div>
                        </div>

                        {/* Dots */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '32px' }}>
                            {reviews.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentReview(index)}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        backgroundColor: currentReview === index ? '#EE2C7C' : '#ddd',
                                        cursor: 'pointer',
                                        padding: 0,
                                        transition: 'background-color 0.3s'
                                    }}
                                />
                            ))}
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <a
                                href="https://www.google.com/search?q=360+creation+monmouth"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#EE2C7C',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}
                            >
                                See all reviews on Google →
                            </a>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section style={{
                    padding: '80px 24px',
                    backgroundColor: '#ffffff'
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{
                            color: '#252525',
                            fontSize: '28px',
                            fontWeight: '700',
                            marginBottom: '32px',
                            textAlign: 'center'
                        }}>
                            Questions?
                        </h2>

                        <div>
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    style={{
                                        borderBottom: index < faqs.length - 1 ? '1px solid #eee' : 'none'
                                    }}
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        style={{
                                            width: '100%',
                                            padding: '20px 0',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <span style={{
                                            color: '#252525',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                        }}>
                                            {faq.question}
                                        </span>
                                        <span style={{
                                            color: '#EE2C7C',
                                            fontSize: '20px',
                                            fontWeight: '300',
                                            transform: openFaq === index ? 'rotate(45deg)' : 'none',
                                            transition: 'transform 0.2s ease'
                                        }}>
                                            +
                                        </span>
                                    </button>
                                    {openFaq === index && (
                                        <p style={{
                                            color: '#666',
                                            fontSize: '15px',
                                            lineHeight: '1.6',
                                            paddingBottom: '20px',
                                            margin: 0
                                        }}>
                                            {faq.answer}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Form */}
                <section id="form" style={{
                    padding: '80px 24px',
                    backgroundColor: '#f7f8f8'
                }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        {!submitted ? (
                            <>
                                <h2 style={{
                                    color: '#252525',
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    marginBottom: '12px',
                                    textAlign: 'center'
                                }}>
                                    Let's get some quick details
                                </h2>
                                <p style={{
                                    color: '#666',
                                    fontSize: '15px',
                                    textAlign: 'center',
                                    marginBottom: '32px'
                                }}>
                                    Fill this in and we'll have your design ready within 48 hours.
                                </p>

                                <form onSubmit={handleSubmit} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '32px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                                }}>
                                    {/* Logo */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{
                                            display: 'block',
                                            color: '#252525',
                                            fontWeight: '600',
                                            marginBottom: '10px',
                                            fontSize: '14px'
                                        }}>
                                            Your logo
                                        </label>

                                        {!noLogo ? (
                                            <>
                                                <div style={{
                                                    border: '2px dashed #ddd',
                                                    borderRadius: '8px',
                                                    padding: '28px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    position: 'relative'
                                                }}>
                                                    {logoPreview ? (
                                                        <div>
                                                            <img
                                                                src={logoPreview}
                                                                alt="Logo"
                                                                style={{ maxWidth: '120px', maxHeight: '70px' }}
                                                            />
                                                            <p style={{ color: '#EE2C7C', fontSize: '13px', marginTop: '8px', marginBottom: 0 }}>Click to change</p>
                                                        </div>
                                                    ) : (
                                                        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                                                            Click to upload your logo
                                                        </p>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoUpload}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            opacity: 0,
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => { setNoLogo(true); setLogoPreview(null); }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#888',
                                                        fontSize: '13px',
                                                        marginTop: '10px',
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    I don't have a logo
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{
                                                backgroundColor: '#f7f8f8',
                                                borderRadius: '8px',
                                                padding: '20px',
                                                textAlign: 'center'
                                            }}>
                                                <p style={{ color: '#252525', fontSize: '14px', marginBottom: '16px' }}>
                                                    Would you like us to design a logo for you?
                                                </p>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNeedsLogoDesign(true)}
                                                        style={{
                                                            padding: '10px 24px',
                                                            backgroundColor: needsLogoDesign === true ? '#EE2C7C' : 'white',
                                                            color: needsLogoDesign === true ? 'white' : '#252525',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '50px',
                                                            fontSize: '14px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Yes please
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNeedsLogoDesign(false)}
                                                        style={{
                                                            padding: '10px 24px',
                                                            backgroundColor: needsLogoDesign === false ? '#EE2C7C' : 'white',
                                                            color: needsLogoDesign === false ? 'white' : '#252525',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '50px',
                                                            fontSize: '14px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        No thanks
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => { setNoLogo(false); setNeedsLogoDesign(null); }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#888',
                                                        fontSize: '13px',
                                                        marginTop: '12px',
                                                        cursor: 'pointer',
                                                        textDecoration: 'underline'
                                                    }}
                                                >
                                                    Actually, I do have a logo
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* First name */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            color: '#252525',
                                            fontWeight: '600',
                                            marginBottom: '10px',
                                            fontSize: '14px'
                                        }}>
                                            Your first name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Dave"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                border: '1px solid #ddd',
                                                borderRadius: '6px',
                                                fontSize: '15px',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    {/* Two column row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                color: '#252525',
                                                fontWeight: '600',
                                                marginBottom: '10px',
                                                fontSize: '14px'
                                            }}>
                                                Business name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Smith's Plumbing"
                                                value={formData.businessName}
                                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 16px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    fontSize: '15px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                color: '#252525',
                                                fontWeight: '600',
                                                marginBottom: '10px',
                                                fontSize: '14px'
                                            }}>
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Bristol"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 16px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    fontSize: '15px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Two column row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                color: '#252525',
                                                fontWeight: '600',
                                                marginBottom: '10px',
                                                fontSize: '14px'
                                            }}>
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="you@email.co.uk"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 16px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    fontSize: '15px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{
                                                display: 'block',
                                                color: '#252525',
                                                fontWeight: '600',
                                                marginBottom: '10px',
                                                fontSize: '14px'
                                            }}>
                                                Phone <span style={{ color: '#999', fontWeight: '400' }}>(optional)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="07123 456789"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '14px 16px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '6px',
                                                    fontSize: '15px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        style={{
                                            width: '100%',
                                            padding: '18px',
                                            backgroundColor: isSubmitting ? '#ccc' : '#EE2C7C',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send my request'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                padding: '56px 40px',
                                textAlign: 'center'
                            }}>
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
                                <h2 style={{
                                    color: '#252525',
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    marginBottom: '12px'
                                }}>
                                    Got it!
                                </h2>
                                <p style={{
                                    color: '#666',
                                    fontSize: '16px'
                                }}>
                                    We'll have your mockup in your inbox within 24 hours.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

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

                <style>{`
        input:focus, textarea:focus {
          border-color: #EE2C7C !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 600px) {
          .benefits-desktop {
            display: none !important;
          }
          .benefits-mobile {
            display: flex !important;
          }
        }
      `}</style>
            </div>
        </>
    );
};

export default TradeLandingPage;