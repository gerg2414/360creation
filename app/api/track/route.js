import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
    try {
        const {
            visitorId,
            page,
            utmSource,
            utmMedium,
            utmCampaign,
            referrer,
            userAgent
        } = await request.json()

        const { error } = await supabaseAdmin
            .from('page_views')
            .insert({
                visitor_id: visitorId,
                page: page,
                utm_source: utmSource || null,
                utm_medium: utmMedium || null,
                utm_campaign: utmCampaign || null,
                referrer: referrer || null,
                user_agent: userAgent || null
            })

        if (error) {
            console.error('Track error:', error)
            return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Track error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}