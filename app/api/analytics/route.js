import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get page views from last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: pageViews, error: pvError } = await supabaseAdmin
            .from('page_views')
            .select('*')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })

        if (pvError) {
            console.error('Page views error:', pvError)
            return NextResponse.json({ error: 'Failed to fetch page views' }, { status: 500 })
        }

        // Get submissions for conversion calculation
        const { data: submissions, error: subError } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .gte('created_at', thirtyDaysAgo.toISOString())

        if (subError) {
            console.error('Submissions error:', subError)
            return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
        }

        // Calculate stats
        const totalViews = pageViews.length
        const uniqueVisitors = new Set(pageViews.map(pv => pv.visitor_id)).size
        const totalSubmissions = submissions.length
        const conversionRate = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : 0

        // Views by source
        const viewsBySource = pageViews.reduce((acc, pv) => {
            const source = pv.utm_source || 'Direct / Organic'
            acc[source] = (acc[source] || 0) + 1
            return acc
        }, {})

        // Views by campaign
        const viewsByCampaign = pageViews.reduce((acc, pv) => {
            if (pv.utm_campaign) {
                acc[pv.utm_campaign] = (acc[pv.utm_campaign] || 0) + 1
            }
            return acc
        }, {})

        // Views by day (last 7 days)
        const viewsByDay = {}
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            viewsByDay[dateStr] = 0
        }
        pageViews.forEach(pv => {
            const dateStr = pv.created_at.split('T')[0]
            if (viewsByDay.hasOwnProperty(dateStr)) {
                viewsByDay[dateStr]++
            }
        })

        // Submissions by day (last 7 days)
        const submissionsByDay = {}
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            submissionsByDay[dateStr] = 0
        }
        submissions.forEach(sub => {
            const dateStr = sub.created_at.split('T')[0]
            if (submissionsByDay.hasOwnProperty(dateStr)) {
                submissionsByDay[dateStr]++
            }
        })

        return NextResponse.json({
            totalViews,
            uniqueVisitors,
            totalSubmissions,
            conversionRate,
            viewsBySource,
            viewsByCampaign,
            viewsByDay,
            submissionsByDay
        })

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}