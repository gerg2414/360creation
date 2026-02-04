import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get visitors seen in last 2 minutes (considered "live")
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()

        const { data: visitors, error } = await supabaseAdmin
            .from('live_visitors')
            .select('*')
            .gte('last_seen', twoMinutesAgo)
            .order('last_seen', { ascending: false })

        if (error) {
            console.error('Live visitors error:', error)
            return NextResponse.json({ error: 'Failed to fetch live visitors' }, { status: 500 })
        }

        // Clean up old visitors (older than 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        await supabaseAdmin
            .from('live_visitors')
            .delete()
            .lt('last_seen', fiveMinutesAgo)

        return NextResponse.json({ visitors })

    } catch (error) {
        console.error('Live visitors error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}