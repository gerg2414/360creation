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
    const mockup = formData.get('mockup')

    if (!mockup || mockup.size === 0) {
      return NextResponse.json({ error: 'No mockup file provided' }, { status: 400 })
    }

    // Upload mockup to Supabase Storage
    const fileExt = mockup.name.split('.').pop()
    const fileName = `${submissionId}-mockup.${fileExt}`

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

    // Update submission with mockup URL and status
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('submissions')
      .update({ 
        mockup_url: publicUrl, 
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
