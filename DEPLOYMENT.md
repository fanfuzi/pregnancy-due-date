# DEPLOYMENT.md - Pregnancy Due Date Calculator

## Current Status
- ✅ GitHub: https://github.com/fanfuzi/pregnancy-due-date
- ✅ Cloudflare Pages: https://pregnancy-due-date.pages.dev (primary live URL)
- ✅ All files deployed and live

## Next Steps

### 1. Buy a domain (recommended)
Buy one of these from Namecheap/GoDaddy:
- `pregnancycalculatorhub.com` (brand match)
- `duedatecalculatorhub.com` (exact match)
- `weekbyweekpregnancy.com` (long-tail keyword)

After buying:
1. Add site in Cloudflare Dashboard
2. Change nameservers at your registrar to Cloudflare's
3. Add custom domain in Cloudflare Pages → get free SSL

### 2. Connect GitHub auto-deploy
Cloudflare Pages can auto-deploy on every push:
1. Go to Cloudflare Dashboard → Pages → pregnancy-due-date
2. Settings → Build settings → Connect to Git
3. Authorize GitHub and select `fanfuzi/pregnancy-due-date`
4. Production branch: `main`
5. Save

### 3. Replace domain placeholders
Search and replace `pregnancycalculatorhub.com` with your actual domain in:
- `index.html` (title, meta, OG, canonical, JSON-LD)
- `blog/*.html` (canonical links)
- `sitemap.xml` (all URLs)
- `robots.txt` (Sitemap line)

### 4. Monetization (when ready)
- AdSense: Uncomment the `<script>` in `index.html` head and replace `YOUR-PUB-ID`
- Amazon Associates: Add product links in the blog articles