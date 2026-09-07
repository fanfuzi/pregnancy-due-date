/**
 * Monetization - AdSense & Amazon Associates
 * Reads config from js/config.js
 */

(function () {
    if (!window.SITE_CONFIG) {
        console.warn('SITE_CONFIG not found in js/config.js');
        return;
    }

    const cfg = window.SITE_CONFIG;

    // Inject AdSense script if publisher ID is set
    // NOTE: do NOT set crossOrigin on the AdSense loader — AdSense serves
    // without CORS headers and crossorigin="anonymous" can block ad delivery.
    if (cfg.adsensePublisherId && cfg.adsensePublisherId !== 'YOUR-PUB-ID') {
        const adScript = document.createElement('script');
        adScript.async = true;
        adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${cfg.adsensePublisherId}`;
        document.head.appendChild(adScript);
    }

    // Replace legacy .adsense-placeholder elements with real ad units.
    // NOTE: homepage no longer ships visible placeholder boxes. Recommended
    // approach once approved: insert static <ins class="adsbygoogle"> units
    // directly in HTML with numeric data-ad-slot from the AdSense dashboard,
    // then push them here is unnecessary — put the loader script below in
    // <head> and call (adsbygoogle=window.adsbygoogle||[]).push({}) inline.
    document.querySelectorAll('.adsense-placeholder').forEach(function (el) {
        const slot = el.getAttribute('data-ad-slot');
        if (!slot) return;

        if (cfg.adsensePublisherId && cfg.adsensePublisherId !== 'YOUR-PUB-ID') {
            // data-ad-slot must be the numeric slot ID from your AdSense
            // account (placeholder values like "HOME_TOP" are invalid and
            // will show no ads until replaced with the real slot numbers).
            const adHtml = `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-${cfg.adsensePublisherId}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
            el.outerHTML = adHtml;

            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.warn('AdSense push failed', e);
            }
        }
    });

    // Replace Amazon Associate links
    if (cfg.amazonAssociateId && cfg.amazonAssociateId !== 'YOUR-TAG-20') {
        document.querySelectorAll('a[data-amazon-url]').forEach(function (a) {
            const base = a.getAttribute('data-amazon-url');
            a.setAttribute('href', base + (base.includes('?') ? '&' : '?') + 'tag=' + cfg.amazonAssociateId);
        });

        // Also patch recommended products in config if rendered dynamically
        if (cfg.recommendedProducts && cfg.recommendedProducts.length) {
            cfg.recommendedProducts.forEach(function (p) {
                if (p.url && !p.url.includes('tag=')) {
                    const sep = p.url.includes('?') ? '&' : '?';
                    p.url = p.url + sep + 'tag=' + cfg.amazonAssociateId;
                }
            });
        }
    }
})();