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
    if (cfg.adsensePublisherId && cfg.adsensePublisherId !== 'YOUR-PUB-ID') {
        const adScript = document.createElement('script');
        adScript.async = true;
        adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${cfg.adsensePublisherId}`;
        adScript.crossOrigin = 'anonymous';
        document.head.appendChild(adScript);
    }

    // Replace AdSense placeholders with real ad units
    document.querySelectorAll('.adsense-placeholder').forEach(function (el) {
        const slot = el.getAttribute('data-ad-slot');
        if (!slot) return;

        if (cfg.adsensePublisherId && cfg.adsensePublisherId !== 'YOUR-PUB-ID') {
            const adHtml = `<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-${cfg.adsensePublisherId}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
            el.outerHTML = adHtml;

            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
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