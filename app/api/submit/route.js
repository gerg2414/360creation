import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendAdminNotification, sendCustomerConfirmation } from '@/lib/email'

export async function POST(request) {
  try {
    const formData = await request.formData()

    const firstName = formData.get('firstName')
    const businessName = formData.get('businessName')
    const location = formData.get('location')
    const email = formData.get('email')
    const phone = formData.get('phone')
    const extras = formData.get('extras')
    const trade = formData.get('trade') || 'plumber'
    const logo = formData.get('logo')
    const utmSource = formData.get('utmSource') || null
    const utmMedium = formData.get('utmMedium') || null
    const utmCampaign = formData.get('utmCampaign') || null

    // Upload logo to Supabase Storage
    let logoUrl = null
    if (logo && logo.size > 0) {
      const fileExt = logo.name.split('.').pop()
      const fileName = `${Date.now()}-${businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('logos')
        .upload(fileName, logo, {
          contentType: logo.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Logo upload error:', uploadError)
      } else {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('logos')
          .getPublicUrl(fileName)
        logoUrl = publicUrl
      }
    }

    // Insert submission into database
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('submissions')
      .insert({
        first_name: firstName,
        business_name: businessName,
        location: location,
        email: email,
        phone: phone || null,
        extras: extras || null,
        trade: trade,
        logo_url: logoUrl,
        status: 'new',
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    // Send admin notification
    await sendAdminNotification(submission)

    // Send customer confirmation
    await sendCustomerConfirmation(submission)

    return NextResponse.json({ success: true, id: submission.id })

  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}