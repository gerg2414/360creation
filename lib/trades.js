export const trades = {
    trade: {
        slug: 'trade',
        websiteType: 'trade',
        singular: 'tradesperson',
        plural: 'tradespeople',
        title: 'Tradespeople',
        examples: [
            { business: 'Smith & Sons', location: 'Manchester', image: '/mockups/trade/example-1.png' },
            { business: 'Pro Services', location: 'Birmingham', image: '/mockups/trade/example-2.png' },
            { business: 'Quality Work Ltd', location: 'Leeds', image: '/mockups/trade/example-3.png' }
        ]
    },
    plumber: {
        slug: 'plumber',
        websiteType: 'plumbing',
        singular: 'plumber',
        plural: 'plumbers',
        title: 'Plumbers',
        examples: [
            { business: 'Mr Rooter', location: 'Bristol', image: '/mockups/plumber/example-1.png' },
            { business: 'Wilson Mechanical', location: 'Cardiff', image: '/mockups/plumber/example-2.png' },
            { business: 'Parker Plumbing', location: 'London', image: '/mockups/plumber/example-3.png' }
        ]
    },
    electrician: {
        slug: 'electrician',
        websiteType: 'electrician',
        singular: 'electrician',
        plural: 'electricians',
        title: 'Electricians',
        examples: [
            { business: 'Spark Electric', location: 'Manchester', image: '/mockups/electrician/example-1.png' },
            { business: 'PowerFlow Electrical', location: 'Liverpool', image: '/mockups/electrician/example-2.png' },
            { business: 'Bright Sparks', location: 'Newcastle', image: '/mockups/electrician/example-3.png' }
        ]
    },
    builder: {
        slug: 'builder',
        websiteType: 'building',
        singular: 'builder',
        plural: 'builders',
        title: 'Builders',
        examples: [
            { business: 'Solid Build Co', location: 'Bristol', image: '/mockups/builder/example-1.png' },
            { business: 'Foundation First', location: 'Sheffield', image: '/mockups/builder/example-2.png' },
            { business: 'Master Builders', location: 'Leeds', image: '/mockups/builder/example-3.png' }
        ]
    },
    landscaper: {
        slug: 'landscaper',
        websiteType: 'landscaping',
        singular: 'landscaper',
        plural: 'landscapers',
        title: 'Landscapers',
        examples: [
            { business: 'Green Thumb Gardens', location: 'Surrey', image: '/mockups/landscaper/example-1.png' },
            { business: 'Natural Landscapes', location: 'Kent', image: '/mockups/landscaper/example-2.png' },
            { business: 'Eden Outdoor', location: 'Essex', image: '/mockups/landscaper/example-3.png' }
        ]
    },
    groundworks: {
        slug: 'groundworks',
        websiteType: 'groundworks',
        singular: 'groundworker',
        plural: 'groundworkers',
        title: 'Groundworkers',
        examples: [
            { business: 'Dig Deep Ltd', location: 'Birmingham', image: '/mockups/groundworks/example-1.png' },
            { business: 'Foundation Works', location: 'Nottingham', image: '/mockups/groundworks/example-2.png' },
            { business: 'Groundforce', location: 'Leicester', image: '/mockups/groundworks/example-3.png' }
        ]
    },
    carpenter: {
        slug: 'carpenter',
        websiteType: 'carpentry',
        singular: 'carpenter',
        plural: 'carpenters',
        title: 'Carpenters',
        examples: [
            { business: 'Fine Wood Carpentry', location: 'Oxford', image: '/mockups/carpenter/example-1.png' },
            { business: 'Craft Joinery', location: 'Cambridge', image: '/mockups/carpenter/example-2.png' },
            { business: 'Timber Works', location: 'Bath', image: '/mockups/carpenter/example-3.png' }
        ]
    },
    roofer: {
        slug: 'roofer',
        websiteType: 'roofing',
        singular: 'roofer',
        plural: 'roofers',
        title: 'Roofers',
        examples: [
            { business: 'Top Roof Solutions', location: 'Glasgow', image: '/mockups/roofer/example-1.png' },
            { business: 'Apex Roofing', location: 'Edinburgh', image: '/mockups/roofer/example-2.png' },
            { business: 'Slate & Tile Co', location: 'Aberdeen', image: '/mockups/roofer/example-3.png' }
        ]
    },
    locksmith: {
        slug: 'locksmith',
        websiteType: 'locksmith',
        singular: 'locksmith',
        plural: 'locksmiths',
        title: 'Locksmiths',
        examples: [
            { business: 'Quick Lock Services', location: 'London', image: '/mockups/locksmith/example-1.png' },
            { business: 'Secure Entry', location: 'Brighton', image: '/mockups/locksmith/example-2.png' },
            { business: 'Master Keys', location: 'Southampton', image: '/mockups/locksmith/example-3.png' }
        ]
    },
    'windows-doors': {
        slug: 'windows-doors',
        websiteType: 'windows & doors',
        singular: 'fitter',
        plural: 'fitters',
        title: 'Window & Door Fitters',
        examples: [
            { business: 'ClearView Windows', location: 'Norwich', image: '/mockups/windows-doors/example-1.png' },
            { business: 'Premier Doors', location: 'Plymouth', image: '/mockups/windows-doors/example-2.png' },
            { business: 'Frame Perfect', location: 'Exeter', image: '/mockups/windows-doors/example-3.png' }
        ]
    },
    removals: {
        slug: 'removals',
        websiteType: 'removals',
        singular: 'removal company',
        plural: 'removal companies',
        title: 'Removal Companies',
        examples: [
            { business: 'Swift Moves', location: 'London', image: '/mockups/removals/example-1.png' },
            { business: 'Easy Relocations', location: 'Manchester', image: '/mockups/removals/example-2.png' },
            { business: 'Home Movers UK', location: 'Bristol', image: '/mockups/removals/example-3.png' }
        ]
    }
}

export const getTradeBySlug = (slug) => {
    return trades[slug] || null
}

export const getAllTradeSlugs = () => {
    return Object.keys(trades)
}