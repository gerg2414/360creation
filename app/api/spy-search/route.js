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
    // Top 3 get ~70% of clicks, #1 gets most
    const positionMultiplier = position === 1 ? 0.35 : position === 2 ? 0.20 : 0.15

    // More reviews = more trust = higher conversion
    const reviewMultiplier = reviewCount > 100 ? 1.3 : reviewCount > 50 ? 1.15 : reviewCount > 20 ? 1.0 : 0.8

    // Higher rating = better conversion
    const ratingMultiplier = rating >= 4.8 ? 1.2 : rating >= 4.5 ? 1.1 : rating >= 4.0 ? 1.0 : 0.85

    const baseLeads = searchVolume * positionMultiplier
    const adjustedLeads = baseLeads * reviewMultiplier * ratingMultiplier

    // Convert to actual calls/enquiries (~10-15% of clicks become leads)
    return Math.floor(adjustedLeads * 0.12)
}

export async function POST(request) {
    try {
        const { businessName, location, trade } = await request.json()

        if (!businessName || !location) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Search for the business on Google Places
        const searchQuery = encodeURIComponent(`${businessName} ${location}`)

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchQuery}&inputtype=textquery&fields=name,formatted_address,place_id,rating,user_ratings_total,business_status,photos&key=${GOOGLE_API_KEY}`
        )

        const data = await response.json()

        console.log('Search query:', `${businessName} ${location}`)
        console.log('Google response:', data)

        // Get estimated searches for this location
        const estimatedSearches = getEstimatedSearches(location)
        const searchVolume = Math.floor(Math.random() * (estimatedSearches.max - estimatedSearches.min) + estimatedSearches.min)

        if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
            const business = data.candidates[0]

            const rating = business.rating || 0
            const reviewCount = business.user_ratings_total || 0

            // Estimate their monthly leads
            const estimatedLeads = estimateMonthlyLeads(searchVolume, rating, reviewCount, 1)

            // Calculate estimated revenue (avg job value for trade)
            const avgJobValue = 250 // Conservative estimate
            const estimatedRevenue = estimatedLeads * avgJobValue

            // Generate "insights" about why they rank
            const insights = []
            if (reviewCount > 50) insights.push(`${reviewCount} reviews builds serious trust`)
            if (reviewCount > 20 && reviewCount <= 50) insights.push(`${reviewCount} reviews - decent but beatable`)
            if (reviewCount < 20) insights.push(`Only ${reviewCount} reviews - vulnerability here`)
            if (rating >= 4.8) insights.push(`${rating} star rating - excellent reputation`)
            if (rating >= 4.5 && rating < 4.8) insights.push(`${rating} star rating - strong but not perfect`)
            if (rating < 4.5) insights.push(`${rating} star rating - room for you to beat them`)
            insights.push('Likely has optimised business description')
            insights.push('Probably posts regular updates')

            return NextResponse.json({
                found: true,
                business: {
                    name: business.name,
                    address: business.formatted_address,
                    rating: rating,
                    reviewCount: reviewCount,
                    placeId: business.place_id
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

        // Business not found
        return NextResponse.json({
            found: false,
            message: "Couldn't find that business. Check the spelling or try a different name.",
            location
        })

    } catch (error) {
        console.error('Spy Search error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}