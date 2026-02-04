import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendMockupReady } from '@/lib/email'

export async function POST(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const submissionId = formData.get('submissionId')
    const mockups = formData.getAll('mockups')

    if (!mockups || mockups.length === 0 || mockups[0].size === 0) {
      return NextResponse.json({ error: 'No mockup files provided' }, { status: 400 })
    }

    const mockupUrls = []

    // Upload each mockup to Supabase Storage
    for (let i = 0; i < mockups.length; i++) {
      const mockup = mockups[i]
      const fileExt = mockup.name.split('.').pop()
      const fileName = `${submissionId}-mockup-${i + 1}.${fileExt}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('mockups')
        .upload(fileName, mockup, {
          contentType: mockup.type,
          upsert: true
        })

      if (uploadError) {
        console.error('Mockup upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload mockup' }, { status: 500 })
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('mockups')
        .getPublicUrl(fileName)

      mockupUrls.push(publicUrl)
    }

    // Update submission with mockup URLs (JSON array) and status
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('submissions')
      .update({
        mockup_url: mockupUrls[0], // Keep first one for backwards compatibility
        mockup_urls: mockupUrls, // New field for all mockups
        status: 'mockup_sent',
        mockup_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
    }

    // Send email to customer
    await sendMockupReady(submission)

    return NextResponse.json({ success: true, submission })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}