import { NextResponse } from 'next/server'

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function GET() {
    return NextResponse.json({ status: 'ok', message: 'Spy search API is running. Use POST to search.' })
}

// Population-based estimated searches per month
const getEstimatedSearches = (location) => {
    const majorCities = ['london', 'birmingham', 'manchester', 'leeds', 'glasgow', 'liverpool', 'newcastle', 'sheffield', 'bristol', 'edinburgh']
    const largeTowns = ['cardiff', 'belfast', 'nottingham', 'leicester', 'coventry', 'bradford', 'stoke', 'wolverhampton', 'plymouth', 'southampton', 'reading', 'derby', 'brighton', 'hull']
    const mediumTowns = ['swansea', 'milton keynes', 'northampton', 'norwich', 'luton', 'preston', 'aberdeen', 'blackpool', 'bournemouth', 'middlesbrough', 'bolton', 'ipswich', 'oxford', 'cambridge', 'york', 'gloucester', 'exeter', 'chester', 'bath', 'worcester', 'lincoln', 'newport', 'hereford', 'monmouth']

    const loc = location.toLowerCase()

    if (majorCities.some(city => loc.includes(city))) {
        return { min: 2000, max: 4000 }
    } else if (largeTowns.some(town => loc.includes(town))) {
        return { min: 800, max: 1500 }
    } else if (mediumTowns.some(town => loc.includes(town))) {
        return { min: 400, max: 800 }
    } else {
        return { min: 150, max: 400 }
    }
}

// Estimate leads based on ranking position and reviews
const estimateMonthlyLeads = (searchVolume, rating, reviewCount, position = 1) => {
    const positionMultiplier = position === 1 ? 0.35 : position === 2 ? 0.20 : position === 3 ? 0.15 : 0.05
    const reviewMultiplier = reviewCount > 100 ? 1.3 : reviewCount > 50 ? 1.15 : reviewCount > 20 ? 1.0 : 0.8
    const ratingMultiplier = rating >= 4.8 ? 1.2 : rating >= 4.5 ? 1.1 : rating >= 4.0 ? 1.0 : 0.85

    const baseLeads = searchVolume * positionMultiplier
    const adjustedLeads = baseLeads * reviewMultiplier * ratingMultiplier

    return Math.floor(adjustedLeads * 0.12)
}

export async function POST(request) {
    try {
        const { location, trade, placeId, action } = await request.json()

        // Action 1: Get list of competitors
        if (action === 'list' || !placeId) {
            if (!location) {
                return NextResponse.json({ error: 'Missing location' }, { status: 400 })
            }

            const searchQuery = encodeURIComponent(`${trade || 'tradespeople'} in ${location}`)

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${GOOGLE_API_KEY}`
            )

            const data = await response.json()

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const competitors = data.results.slice(0, 10).map((place, index) => ({
                    name: place.name,
                    address: place.formatted_address,
                    rating: place.rating || 0,
                    reviewCount: place.user_ratings_total || 0,
                    placeId: place.place_id,
                    position: index + 1
                }))

                return NextResponse.json({
                    action: 'list',
                    competitors,
                    location
                })
            }

            return NextResponse.json({
                action: 'list',
                competitors: [],
                message: 'No businesses found in this area',
                location
            })
        }

        // Action 2: Get details for specific competitor
        if (action === 'details' && placeId) {
            const estimatedSearches = getEstimatedSearches(location)
            const searchVolume = Math.floor(Math.random() * (estimatedSearches.max - estimatedSearches.min) + estimatedSearches.min)

            // Get place details
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,reviews,opening_hours,website,formatted_phone_number&key=${GOOGLE_API_KEY}`
            )

            const data = await response.json()

            if (data.status === 'OK' && data.result) {
                const place = data.result
                const rating = place.rating || 0
                const reviewCount = place.user_ratings_total || 0
                const position = 1 // Assume top position for estimates

                const estimatedLeads = estimateMonthlyLeads(searchVolume, rating, reviewCount, position)
                const avgJobValue = 250
                const estimatedRevenue = estimatedLeads * avgJobValue

                // Generate insights
                const insights = []
                if (reviewCount > 50) insights.push(`${reviewCount} reviews builds serious trust`)
                if (reviewCount > 20 && reviewCount <= 50) insights.push(`${reviewCount} reviews - decent but beatable`)
                if (reviewCount < 20) insights.push(`Only ${reviewCount} reviews - vulnerability here`)
                if (rating >= 4.8) insights.push(`${rating} star rating - excellent reputation`)
                if (rating >= 4.5 && rating < 4.8) insights.push(`${rating} star rating - strong but not perfect`)
                if (rating < 4.5 && rating > 0) insights.push(`${rating} star rating - room for you to beat them`)
                if (place.website) insights.push('Has a website linked')
                if (place.opening_hours) insights.push('Has opening hours set')
                insights.push('Likely has optimised business description')

                return NextResponse.json({
                    action: 'details',
                    found: true,
                    business: {
                        name: place.name,
                        address: place.formatted_address,
                        rating: rating,
                        reviewCount: reviewCount,
                        placeId: placeId,
                        website: place.website || null,
                        phone: place.formatted_phone_number || null
                    },
                    stats: {
                        searchVolume,
                        estimatedLeads,
                        estimatedRevenue,
                        estimatedCallsPerWeek: Math.ceil(estimatedLeads / 4)
                    },
                    insights,
                    location
                })
            }

            return NextResponse.json({
                action: 'details',
                found: false,
                message: "Couldn't get details for this business"
            })
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    } catch (error) {
        console.error('Spy Search error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}