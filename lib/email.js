import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAdminNotification(submission) {
  try {
    await resend.emails.send({
      from: 'Mockup Tool <notifications@notifications.360creation.uk>',
      to: process.env.ADMIN_EMAIL,
      subject: `New mockup request: ${submission.business_name}`,
      html: `
        <h2>New Mockup Request</h2>
        <p><strong>Name:</strong> ${submission.first_name}</p>
        <p><strong>Business:</strong> ${submission.business_name}</p>
        <p><strong>Location:</strong> ${submission.location}</p>
        <p><strong>Email:</strong> ${submission.email}</p>
        <p><strong>Phone:</strong> ${submission.phone || 'Not provided'}</p>
        <p><strong>Notes:</strong> ${submission.extras || 'None'}</p>
        <p><strong>Trade:</strong> ${submission.trade}</p>
        <br>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View in Dashboard</a></p>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send admin notification:', error)
    return { success: false, error }
  }
}

export async function sendCustomerConfirmation(submission) {
  try {
    await resend.emails.send({
      from: '360 Creation <notifications@notifications.360creation.uk>',
      to: submission.email,
      subject: `We've received your mockup request!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 20px;">
            <div style="width: 50px; height: 50px; background: #EE2C7C; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: bold; font-size: 14px;">360</span>
            </div>
            <h1 style="color: #252525; font-size: 28px; margin-bottom: 16px;">Thanks ${submission.first_name}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              We've received your request for a free website mockup for <strong>${submission.business_name}</strong>. We'll have it in your inbox within 24 hours.
            </p>
            <div style="background: #f7f8f8; border-radius: 12px; padding: 24px; text-align: left; margin-bottom: 32px;">
              <p style="margin: 0 0 8px; color: #252525; font-size: 14px;"><strong>Business:</strong> ${submission.business_name}</p>
              <p style="margin: 0 0 8px; color: #252525; font-size: 14px;"><strong>Location:</strong> ${submission.location}</p>
              ${submission.extras ? `<p style="margin: 0; color: #252525; font-size: 14px;"><strong>Notes:</strong> ${submission.extras}</p>` : ''}
            </div>
            <p style="color: #666; font-size: 14px;">
              Keep an eye on your inbox - your mockup is on its way!
            </p>
          </div>
          <div style="background: #f7f8f8; padding: 24px; text-align: center;">
            <p style="color: #888; font-size: 14px; margin: 0;">
              Questions? Just reply to this email.
            </p>
          </div>
        </div>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send customer confirmation:', error)
    return { success: false, error }
  }
}

export async function sendMockupReady(submission) {
  try {
    await resend.emails.send({
      from: '360 Creation <notifications@notifications.360creation.uk>',
      to: submission.email,
      subject: `Your ${submission.business_name} website mockup is ready!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 20px;">
            <div style="width: 50px; height: 50px; background: #EE2C7C; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: bold; font-size: 14px;">360</span>
            </div>
            <h1 style="color: #252525; font-size: 28px; margin-bottom: 16px;">Your mockup is ready!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              Hi ${submission.first_name}! We've finished designing your website mockup for ${submission.business_name}. Click below to see what we've created for you.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/mockup/${submission.id}" style="display: inline-block; padding: 16px 32px; background: #EE2C7C; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
              View My Mockup
            </a>
          </div>
          <div style="background: #f7f8f8; padding: 24px; text-align: center;">
            <p style="color: #888; font-size: 14px; margin: 0;">
              Questions? Just reply to this email.
            </p>
          </div>
        </div>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send mockup ready email:', error)
    return { success: false, error }
  }
}