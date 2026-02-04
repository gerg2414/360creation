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
      backgroundColor: 'white',
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
        <a
          href="#interest"
          style={{
            backgroundColor: '#EE2C7C',
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            padding: '12px 24px',
            borderRadius: '50px',
            fontWeight: '600'
          }}
        >
          I want this
        </a>
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

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        backgroundColor: '#1a1a1a'
      }}>
        <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
          © {new Date().getFullYear()} 360 Creation. All rights reserved.
        </p>
      </footer>
    </div>
  )
}