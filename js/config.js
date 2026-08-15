/**
 * Site Configuration
 * Edit this file to change AdSense, Amazon Associates, and site info across all pages.
 */

window.SITE_CONFIG = {
    // AdSense Publisher ID (without ca-pub- prefix)
    adsensePublisherId: 'YOUR-PUB-ID',

    // Amazon Associates ID (without ?tag= prefix, e.g. 'YOUR-TAG-20')
    amazonAssociateId: 'YOUR-TAG-20',

    // Site basic info
    siteName: 'Pregnancy Calculator Hub',
    siteUrl: 'https://pregnancycalculatorhub.com',
    siteDescription: 'Free, accurate pregnancy tools for expecting parents.',
    siteEmail: 'hello@pregnancycalculatorhub.com',

    // Amazon product recommendations (appears in blog posts)
    recommendedProducts: [
        {
            title: 'Prenatal Vitamins with DHA',
            description: 'Essential vitamins for pregnancy brain development.',
            url: 'https://www.amazon.com/s?k=prenatal+vitamins+dha',
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💊</text></svg>'
        },
        {
            title: 'Pregnancy Body Pillow',
            description: 'Full-body support for better sleep during pregnancy.',
            url: 'https://www.amazon.com/s?k=pregnancy+body+pillow',
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛏️</text></svg>'
        },
        {
            title: 'Witch Hazel Pads (Tucks)',
            description: 'Soothing comfort for postpartum recovery.',
            url: 'https://www.amazon.com/s?k=witch+hazel+pads+tucks',
            image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧴</text></svg>'
        }
    ]
};