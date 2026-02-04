import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
    try {
        const { submissionId, interested } = await request.json()

        if (!submissionId) {
            return NextResponse.json({ error: 'Missing submission ID' }, { status: 400 })
        }

        // Get the submission
        const { data: submission, error: fetchError } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .eq('id', submissionId)
            .single()

        if (fetchError || !submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
        }

        // Update submission with interest status
        const { error: updateError } = await supabaseAdmin
            .from('submissions')
            .update({
                interested: interested,
                interested_at: new Date().toISOString(),
                status: interested ? 'converted' : submission.status,
                updated_at: new Date().toISOString()
            })
            .eq('id', submissionId)

        if (updateError) {
            console.error('Update error:', updateError)
            return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
        }

        // Notify admin
        const subject = interested
            ? `🎉 ${submission.business_name} wants to go ahead!`
            : `${submission.business_name} passed on the preview`

        const body = interested
            ? `Great news! ${submission.first_name} from ${submission.business_name} is interested in making their website a reality.

Contact details:
- Name: ${submission.first_name}
- Business: ${submission.business_name}
- Email: ${submission.email}
- Phone: ${submission.phone || 'Not provided'}
- Location: ${submission.location}

Time to give them a call! 🚀`
            : `${submission.first_name} from ${submission.business_name} viewed their preview but clicked "No".

Contact details:
- Name: ${submission.first_name}
- Business: ${submission.business_name}
- Email: ${submission.email}
- Location: ${submission.location}

Maybe follow up to see if there's feedback?`

        await resend.emails.send({
            from: 'notifications@notifications.360creation.uk',
            to: 'greg@threesixtycreation.co.uk',
            subject: subject,
            text: body
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Interest error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}