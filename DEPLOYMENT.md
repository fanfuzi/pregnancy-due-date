# DEPLOYMENT.md - Pregnancy Due Date Calculator

## Live URLs
- Primary domain: https://pregnancycalculatorhub.com
- Cloudflare Pages project: `pregnancy-due-date` (https://pregnancy-due-date.pages.dev)
- GitHub: https://github.com/fanfuzi/pregnancy-due-date

## Publish workflow
1. One-time setup: `npm install`
2. Write or edit content
3. `bash publish.sh "commit message"`
   - rebuilds `css/tailwind.css` (compiled Tailwind)
   - commits, pushes to GitHub, and deploys via `wrangler pages deploy`

## Keep CSS in sync (important)
The site uses **compiled Tailwind CSS** (`css/tailwind.css`), not the Tailwind CDN.
- Source: `src/input.css` + `tailwind.config.js`
- Scanned content: `index.html`, `about.html`, `privacy-policy.html`, `blog/**/*.html`, `js/**/*.js`
- After adding new utility classes to HTML, run `npm run build:css` (publish.sh does this automatically).

## E-E-A-T / author & medical review (TODO — do this to rank)
The author is currently `Pregnancy Calculator Hub Editorial Team` (in each article's byline + JSON-LD). To strengthen trust signals, replace it with a real named author and ideally add a credentialed medical reviewer:

1. Use a real person's name and credentials (editorial or clinical background).
2. Add a "Medically reviewed by `<Name>`, `<credentials>`" line under the byline in each article.
3. Update JSON-LD `author` to a `Person` (and add optional `reviewedBy`).
4. Do **not** fabricate names or credentials — Google treats fake medical credentials as spam and it is harmful to readers.

## Cloudflare settings (one-time, in dashboard)
- 301 redirect `pregnancy-due-date.pages.dev` → `https://pregnancycalculatorhub.com` to consolidate authority. Canonical tags already point to the main domain, so this is a belt-and-suspenders step.
- Custom domain + SSL are already active.

## Monetization (when ready)
- AdSense: set `adsensePublisherId` in `js/config.js` (replace `YOUR-PUB-ID`).
- Amazon Associates: `amazonAssociateId` is already set to `justinlin-20`.
