'use client';

import React, { useState, useEffect } from 'react';

const PlumberMockupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    businessName: '',
    location: '',
    email: '',
    phone: '',
    extras: ''
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const examples = [
    {
      business: 'Mr. Rooter Plumbing',
      location: 'Sussex',
      color: '#C41230',
      image: '/mockups/mr-rooter.png'
    },
    {
      business: 'Rapid Response Plumbing',
      location: 'Cardiff',
      color: '#0d47a1',
      image: '/mockups/rapid-response.png'
    },
    {
      business: 'ProFlow Plumbing & Heating',
      location: 'Newport',
      color: '#00838f',
      image: '/mockups/proflow.png'
    },
  ];

  const faqs = [
    {
      question: "Is this really free?",
      answer: "Yes, completely free. No card details, no hidden fees. We design your mockup and send it over - that's it."
    },
    {
      question: "What exactly do I get?",
      answer: "A custom mockup design showing what your website could look like. It's a visual design, not a working website."
    },
    {
      question: "How long does it take?",
      answer: "We'll have your mockup in your inbox within 24 hours."
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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('extras', formData.extras);
      formDataToSend.append('trade', 'plumber');

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
          Click to expand
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
          cursor: 'default'
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

        {/* Full image */}
        <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
          <img
            src={example.image}
            alt={`${example.business} website mockup`}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
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
    </div>
  );

  return (
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
          Get my free mockup
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
              🇬🇧 Designed for 100+ UK Plumbers
            </p>

            <h1 style={{
              color: '#252525',
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: '700',
              lineHeight: '1.15',
              marginBottom: '12px'
            }}>
              Your new plumber website mockup design, no cost.
            </h1>

            <p style={{
              color: '#EE2C7C',
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              Like it? We'll talk.
            </p>

            <p style={{
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '24px',
              maxWidth: '440px'
            }}>
              We'll design a mockup of your website so you can see exactly what it'd look like. No obligation, no cost.
            </p>

            {/* Google Rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} style={{ color: '#FBBC04', fontSize: '18px' }}>★</span>
                ))}
              </div>
              <span style={{ color: '#252525', fontSize: '14px', fontWeight: '600' }}>5.0 on Google</span>
            </div>

            {/* Review */}
            <p style={{
              color: '#666',
              fontSize: '14px',
              fontStyle: 'italic',
              marginBottom: '28px'
            }}>
              "Excellent service, design and aftercare. Would highly recommend!"
            </p>

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
              Get my free mockup
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
      </section>

      {/* Modal */}
      {modalOpen && (
        <ImageModal
          example={examples[currentSlide]}
          onClose={() => setModalOpen(false)}
        />
      )}

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
                Fill this in and we'll have your design ready within 24 hours.
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

                {/* Extras */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{
                    display: 'block',
                    color: '#252525',
                    fontWeight: '600',
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}>
                    Anything else? <span style={{ color: '#999', fontWeight: '400' }}>(optional)</span>
                  </label>
                  <textarea
                    placeholder="Colours you like, style preferences, anything you want us to know..."
                    value={formData.extras}
                    onChange={(e) => setFormData({ ...formData, extras: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
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

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
          © 2025 360 Creation
        </p>
      </footer>

      <style>{`
        input:focus, textarea:focus {
          border-color: #EE2C7C !important;
        }
      `}</style>
    </div>
  );
};

export default PlumberMockupPage;