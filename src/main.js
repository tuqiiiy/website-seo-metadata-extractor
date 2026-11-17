import { Actor } from 'apify';
import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';

await Actor.init();

const input = await Actor.getInput() || {};
const rawUrls = input.startUrls || ['https://github.com', 'https://stripe.com'];
const maxConcurrency = Math.min(input.maxConcurrency || 10, 50);

// Normalize input URLs (support both array of strings and array of objects { url: string })
const urls = rawUrls.map(item => {
    if (typeof item === 'string') return item.trim();
    if (item && typeof item === 'object' && item.url) return item.url.trim();
    return null;
}).filter(u => u && (u.startsWith('http://') || u.startsWith('https://')));

console.log(`[SEO Extractor] Starting metadata extraction for ${urls.length} URLs (concurrency: ${maxConcurrency})...`);

const results = [];

for (let i = 0; i < urls.length; i += maxConcurrency) {
    const chunk = urls.slice(i, i + maxConcurrency);
    const chunkPromises = chunk.map(async (targetUrl) => {
        const startTime = Date.now();
        try {
            const response = await gotScraping({
                url: targetUrl,
                timeout: { request: 15000 },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
            });

            const responseTimeMs = Date.now() - startTime;
            const html = response.body;
            const $ = cheerio.load(html);

            const h1List = [];
            $('h1').each((_, el) => {
                const text = $(el).text().trim().replace(/\s+/g, ' ');
                if (text && !h1List.includes(text)) h1List.push(text);
            });

            const h2List = [];
            $('h2').slice(0, 10).each((_, el) => {
                const text = $(el).text().trim().replace(/\s+/g, ' ');
                if (text && !h2List.includes(text)) h2List.push(text);
            });

            const favicon = $('link[rel="icon" i]').attr('href') ||
                            $('link[rel="shortcut icon" i]').attr('href') ||
                            $('link[rel="apple-touch-icon" i]').attr('href') || null;

            let resolvedFavicon = favicon;
            if (favicon && !favicon.startsWith('http')) {
                try {
                    resolvedFavicon = new URL(favicon, targetUrl).href;
                } catch {
                    // keep raw
                }
            }

            const record = {
                url: targetUrl,
                finalUrl: response.url || targetUrl,
                statusCode: response.statusCode,
                responseTimeMs,
                title: $('title').first().text().trim() || null,
                description: $('meta[name="description" i]').attr('content')?.trim() || null,
                keywords: $('meta[name="keywords" i]').attr('content')?.trim() || null,
                canonicalUrl: $('link[rel="canonical" i]').attr('href')?.trim() || null,
                robots: $('meta[name="robots" i]').attr('content')?.trim() || null,
                ogTitle: $('meta[property="og:title" i]').attr('content')?.trim() || null,
                ogDescription: $('meta[property="og:description" i]').attr('content')?.trim() || null,
                ogImage: $('meta[property="og:image" i]').attr('content')?.trim() || null,
                ogType: $('meta[property="og:type" i]').attr('content')?.trim() || null,
                ogUrl: $('meta[property="og:url" i]').attr('content')?.trim() || null,
                ogSiteName: $('meta[property="og:site_name" i]').attr('content')?.trim() || null,
                twitterCard: $('meta[name="twitter:card" i]').attr('content')?.trim() || null,
                twitterTitle: $('meta[name="twitter:title" i]').attr('content')?.trim() || null,
                twitterDescription: $('meta[name="twitter:description" i]').attr('content')?.trim() || null,
                twitterImage: $('meta[name="twitter:image" i]').attr('content')?.trim() || null,
                favicon: resolvedFavicon,
                h1: h1List,
                h2: h2List,
                charset: $('meta[charset]').attr('charset') || null,
                language: $('html').attr('lang') || null,
                scrapedAt: new Date().toISOString(),
            };

            return record;
        } catch (err) {
            console.error(`[SEO Extractor] Failed to extract ${targetUrl}:`, err.message);
            return {
                url: targetUrl,
                statusCode: err.response?.statusCode || 0,
                error: err.message,
                scrapedAt: new Date().toISOString(),
            };
        }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
}

console.log(`[SEO Extractor] Extraction finished for ${results.length} URLs. Saving to dataset...`);
if (results.length > 0) {
    await Actor.pushData(results);
}

await Actor.exit();
