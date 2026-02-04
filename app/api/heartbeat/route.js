import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
    try {
        const {
            visitorId,
            page,
            utmSource
        } = await request.json()

        // Get IP from headers
        const forwardedFor = request.headers.get('x-forwarded-for')
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'

        // Get geolocation from IP (using free ip-api.com)
        let city = null
        let region = null
        let country = null
        let lat = null
        let lon = null

        if (ip && ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1') {
            try {
                const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,lat,lon`)
                const geoData = await geoResponse.json()
                if (geoData.status === 'success') {
                    city = geoData.city
                    region = geoData.regionName
                    country = geoData.country
                    lat = geoData.lat
                    lon = geoData.lon
                }
            } catch (e) {
                console.error('Geo lookup failed:', e)
            }
        }

        // Upsert visitor (update if exists, insert if not)
        const { error } = await supabaseAdmin
            .from('live_visitors')
            .upsert({
                visitor_id: visitorId,
                page: page,
                utm_source: utmSource || null,
                ip_address: ip,
                city: city,
                region: region,
                country: country,
                lat: lat,
                lon: lon,
                last_seen: new Date().toISOString()
            }, {
                onConflict: 'visitor_id'
            })

        if (error) {
            console.error('Heartbeat error:', error)
            return NextResponse.json({ error: 'Failed to record heartbeat' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Heartbeat error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}