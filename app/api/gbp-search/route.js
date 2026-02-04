import { NextResponse } from 'next/server'

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY

// Population-based estimated searches per month
const getEstimatedSearches = (location) => {
    // Major cities
    const majorCities = ['london', 'birmingham', 'manchester', 'leeds', 'glasgow', 'liverpool', 'newcastle', 'sheffield', 'bristol', 'edinburgh']
    // Large towns
    const largeTowns = ['cardiff', 'belfast', 'nottingham', 'leicester', 'coventry', 'bradford', 'stoke', 'wolverhampton', 'plymouth', 'southampton', 'reading', 'derby', 'brighton', 'hull']
    // Medium towns
    const mediumTowns = ['swansea', 'milton keynes', 'northampton', 'norwich', 'luton', 'preston', 'aberdeen', 'blackpool', 'bournemouth', 'middlesbrough', 'bolton', 'ipswich', 'oxford', 'cambridge', 'york', 'gloucester', 'exeter', 'chester', 'bath', 'worcester', 'lincoln', 'newport', 'hereford']

    const loc = location.toLowerCase()

    if (majorCities.some(city => loc.includes(city))) {
        return { min: 2000, max: 4000, label: 'high' }
    } else if (largeTowns.some(town => loc.includes(town))) {
        return { min: 800, max: 1500, label: 'medium-high' }
    } else if (mediumTowns.some(town => loc.includes(town))) {
        return { min: 400, max: 800, label: 'medium' }
    } else {
        // Small towns / villages
        return { min: 150, max: 400, label: 'local' }
    }
}

export async function POST(request) {
    try {
        const { businessName, location, trade } = await request.json()

        if (!businessName || !location) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Search for the business on Google Places
        const searchQuery = encodeURIComponent(`${businessName} ${trade} ${location}`)

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchQuery}&inputtype=textquery&fields=name,formatted_address,place_id,rating,user_ratings_total,business_status&key=${GOOGLE_API_KEY}`
        )

        const data = await response.json()

        // Get estimated searches for this location
        const estimatedSearches = getEstimatedSearches(location)
        const searchVolume = Math.floor(Math.random() * (estimatedSearches.max - estimatedSearches.min) + estimatedSearches.min)

        // Check if we found the business
        if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
            const business = data.candidates[0]

            // Check if it looks like a match (name similarity)
            const nameMatch = business.name.toLowerCase().includes(businessName.toLowerCase().split(' ')[0])

            if (nameMatch) {
                // Found the business
                return NextResponse.json({
                    found: true,
                    business: {
                        name: business.name,
                        address: business.formatted_address,
                        rating: business.rating || null,
                        reviewCount: business.user_ratings_total || 0,
                        placeId: business.place_id
                    },
                    searchVolume,
                    estimatedLeads: Math.floor(searchVolume * 0.15), // ~15% of searches become leads for top 3
                    location
                })
            }
        }

        // Business not found
        return NextResponse.json({
            found: false,
            searchVolume,
            estimatedLeads: Math.floor(searchVolume * 0.15),
            location
        })

    } catch (error) {
        console.error('GBP Search error:', error)
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}