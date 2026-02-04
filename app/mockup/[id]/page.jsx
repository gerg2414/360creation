import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import MockupGallery from './MockupGallery'

async function getSubmission(id) {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  // Update viewed status
  await supabaseAdmin
    .from('submissions')
    .update({
      viewed_at: data.viewed_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  return data
}

export default async function MockupPage({ params }) {
  const submission = await getSubmission(params.id)

  if (!submission || !submission.mockup_url) {
    notFound()
  }

  // Get all mockup URLs (use array if exists, otherwise single URL)
  const mockupUrls = submission.mockup_urls || [submission.mockup_url]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7f8f8',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '20px 24px',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.png"
              alt="360 Creation"
              style={{ height: '32px', width: 'auto' }}
            />
          </div>
          <a
            href="https://threesixtycreation.co.uk"
            style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}
          >
            threesixtycreation.co.uk
          </a>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        backgroundColor: 'white',
        padding: '60px 24px',
        textAlign: 'center',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
          <h1 style={{
            color: '#252525',
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            Your website preview is ready!
          </h1>
          <p style={{
            color: '#666',
            fontSize: '18px',
            lineHeight: '1.6'
          }}>
            Here's what your new <strong>{submission.business_name}</strong> website could look like.
          </p>
          {mockupUrls.length > 1 && (
            <p style={{ color: '#888', fontSize: '14px', marginTop: '12px' }}>
              {mockupUrls.length} designs to explore
            </p>
          )}
        </div>
      </section>

      {/* Mockup Gallery */}
      <MockupGallery mockupUrls={mockupUrls} businessName={submission.business_name} submissionId={submission.id} firstName={submission.first_name} />

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        backgroundColor: '#252525',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            Love it? Let's make it real.
          </h2>
          <p style={{
            color: '#888',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            This is just a preview. We can build you a fully functional website that looks exactly like this - and works beautifully too.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="https://threesixtycreation.co.uk/#contact"
              style={{
                display: 'inline-block',
                padding: '18px 36px',
                backgroundColor: '#EE2C7C',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Get in touch
            </a>
            <a
              href="tel:01onal"
              style={{
                display: 'inline-block',
                padding: '18px 36px',
                backgroundColor: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                border: '2px solid #444'
              }}
            >
              Call us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        backgroundColor: '#1a1a1a'
      }}>
        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
          © 2025 360 Creation. All rights reserved.
        </p>
      </footer>
    </div>
  )
}