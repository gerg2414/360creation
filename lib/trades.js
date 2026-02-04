export const trades = {
    trade: {
        slug: 'trade',
        websiteType: 'trade',
        singular: 'tradesperson',
        plural: 'tradespeople',
        title: 'Tradespeople'
    },
    plumber: {
        slug: 'plumber',
        websiteType: 'plumbing',
        singular: 'plumber',
        plural: 'plumbers',
        title: 'Plumbers'
    },
    electrician: {
        slug: 'electrician',
        websiteType: 'electrician',
        singular: 'electrician',
        plural: 'electricians',
        title: 'Electricians'
    },
    builder: {
        slug: 'builder',
        websiteType: 'building',
        singular: 'builder',
        plural: 'builders',
        title: 'Builders'
    },
    landscaper: {
        slug: 'landscaper',
        websiteType: 'landscaping',
        singular: 'landscaper',
        plural: 'landscapers',
        title: 'Landscapers'
    },
    groundworks: {
        slug: 'groundworks',
        websiteType: 'groundworks',
        singular: 'groundworker',
        plural: 'groundworkers',
        title: 'Groundworkers'
    },
    carpenter: {
        slug: 'carpenter',
        websiteType: 'carpentry',
        singular: 'carpenter',
        plural: 'carpenters',
        title: 'Carpenters'
    },
    roofer: {
        slug: 'roofer',
        websiteType: 'roofing',
        singular: 'roofer',
        plural: 'roofers',
        title: 'Roofers'
    },
    locksmith: {
        slug: 'locksmith',
        websiteType: 'locksmith',
        singular: 'locksmith',
        plural: 'locksmiths',
        title: 'Locksmiths'
    },
    'windows-doors': {
        slug: 'windows-doors',
        websiteType: 'windows & doors',
        singular: 'fitter',
        plural: 'fitters',
        title: 'Window & Door Fitters'
    },
    removals: {
        slug: 'removals',
        websiteType: 'removals',
        singular: 'removal company',
        plural: 'removal companies',
        title: 'Removal Companies'
    }
}

export const getTradeBySlug = (slug) => {
    return trades[slug] || null
}

export const getAllTradeSlugs = () => {
    return Object.keys(trades)
}