#!/usr/bin/env node
/**
 * SEO consistency checker — run before every publish:
 *
 *   npm run check   (or: node scripts/check-links.js)
 *
 * Verifies, for every real page (excludes blog/pin-*.html which are noindex):
 *   1. the page declares a canonical URL that matches the extensionless URL
 *   2. the URL is present in sitemap.xml
 *   3. the .html -> extensionless rule exists in _redirects
 *   4. no internal <a href> still points to a ".html" URL
 *   5. every relative internal link resolves to a page that exists in this repo
 *   6. JSON-LD datePublished / dateModified are not in the future
 *
 * Exit code is 1 when any problem is found (so it can gate a CI deploy).
 * No dependencies — plain Node 18+.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://pregnancycalculatorhub.com';
const PIN_PREFIX = 'pin-';

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            walk(full, out);
        } else if (entry.name.endsWith('.html')) {
            out.push(full);
        }
    }
    return out;
}

function pageSlug(file) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    if (rel === 'index.html') return '/';
    if (rel === 'blog/index.html') return '/blog/';
    return '/' + rel.replace(/\.html$/, '');
}

/** Directory slug of a page ('' -> '/', 'blog/x.html' -> '/blog/'). */
function baseDirOf(file) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    const dir = path.posix.dirname(rel);
    return dir === '.' ? '/' : '/' + dir + '/';
}

/** Collapse trailing slashes except for the bare root. */
function normalize(target) {
    return target.replace(/\/+$/, '') || '/';
}

const problems = [];
// Google verification file is not a real page: skip canonical/sitemap rules.
const EXCLUDE = new Set(['googlef81d0f696dce2c05.html']);
const htmlFiles = walk(ROOT).filter(
    (f) => !path.basename(f).startsWith(PIN_PREFIX) && !EXCLUDE.has(path.basename(f))
);
const slugsRaw = new Set(htmlFiles.map(pageSlug));
const linkTargets = new Set(Array.from(slugsRaw).map(normalize));

const today = new Date().toISOString().slice(0, 10);

for (const file of htmlFiles) {
    const slug = pageSlug(file);
    const html = fs.readFileSync(file, 'utf8');
    const name = path.relative(ROOT, file);

    // 1. canonical
    const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1];
    const expectedCanonical = SITE + slug;
    if (!canonical) {
        problems.push(`${name}: missing <link rel="canonical">`);
    } else if (canonical !== expectedCanonical) {
        problems.push(`${name}: canonical "${canonical}" != expected "${expectedCanonical}"`);
    }

    // 2. sitemap coverage
    const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
    if (!sitemap.includes('<loc>' + expectedCanonical + '</loc>')) {
        problems.push(`${name}: ${expectedCanonical} missing from sitemap.xml`);
    }

    // 3. _redirects rule for non-root pages
    if (slug !== '/') {
        const redirects = fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8');
        const htmlPath = slug === '/blog/' ? '/blog/index.html' : slug + '.html';
        if (!redirects.includes(`${htmlPath} ${slug} 301`)) {
            problems.push(`${name}: no "_redirects" rule for ${htmlPath} -> ${slug}`);
        }
    }

    // 4 & 5. internal links (resolved against the page's own directory)
    const linkRe = /<a\s+[^>]*href="([^"]+)"/g;
    let m;
    while ((m = linkRe.exec(html)) !== null) {
        const href = m[1];
        if (/\.html(#|\?|$)/.test(href)) {
            problems.push(`${name}: internal link to ".html" URL: "${href}"`);
            continue;
        }
        if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) continue; // external / anchor / scheme
        const resolved = href.startsWith('/') ? href : baseDirOf(file) + href;
        if (!linkTargets.has(normalize(resolved))) {
            problems.push(`${name}: internal link "${href}" (-> ${normalize(resolved)}) does not match any page`);
        }
    }

    // 6. JSON-LD dates
    const jsonLdRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let jm;
    while ((jm = jsonLdRe.exec(html)) !== null) {
        let json;
        try {
            json = JSON.parse(jm[1].trim());
        } catch {
            problems.push(`${name}: invalid JSON-LD block`);
            continue;
        }
        for (const key of ['datePublished', 'dateModified']) {
            if (json[key] && json[key] > today) {
                problems.push(`${name}: JSON-LD ${key} "${json[key]}" is in the future (today ${today})`);
            }
        }
    }
}

if (problems.length) {
    console.error(`✗ ${problems.length} problem(s) found:\n`);
    for (const p of problems) console.error('  - ' + p);
    process.exit(1);
}
console.log(`✓ SEO check passed for ${htmlFiles.length} pages (pins excluded).`);
