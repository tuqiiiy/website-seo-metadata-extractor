# Website SEO & OpenGraph Metadata Extractor 🔍

Extract comprehensive SEO tags, social share metadata, headings, and technical properties from any website in seconds.

Built for SEO consultants, growth marketers, site auditing tools, and Zapier/Make automation workflows.

---

## ⚡ Extracted Fields

- **Page Title & Status**: HTTP status code, response time in ms, final redirected URL, `<title>`.
- **Search Metadata**: Meta Description, Keywords, Canonical URL, Robots directive.
- **Social Metadata (OpenGraph & Twitter)**:
  - `og:title`, `og:description`, `og:image`, `og:type`, `og:url`, `og:site_name`
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- **Headings & Structure**: Top `<h1>` and `<h2>` headings.
- **Branding & Technical**: High-resolution Favicon link, charset, and page language (`lang`).

---

## 📥 Input Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `startUrls` | Array | `["https://github.com", "https://stripe.com"]` | Web URLs to inspect. Accepts strings or objects. |
| `maxConcurrency` | Integer | `10` | Number of concurrent URL inspections (up to 50). |

---

## 📤 Output Sample

```json
{
  "url": "https://github.com",
  "finalUrl": "https://github.com/",
  "statusCode": 200,
  "responseTimeMs": 145,
  "title": "GitHub: Let’s build from here · GitHub",
  "description": "GitHub is where over 100 million developers shape the future of software...",
  "canonicalUrl": "https://github.com/",
  "ogTitle": "GitHub: Let’s build from here",
  "ogImage": "https://github.githubassets.com/images/modules/site/social-cards/campaign-social.png",
  "ogType": "website",
  "twitterCard": "summary_large_image",
  "favicon": "https://github.githubassets.com/favicons/favicon.svg",
  "h1": ["Build and ship software on a single, collaborative platform"],
  "language": "en"
}
```

---

## 💡 Practical Applications

1. **SEO Audits**: Check whether client or competitor pages have proper meta descriptions, canonical URLs, and OG cards.
2. **Social Media Previews**: Verify that shared links display high-quality preview images and titles.
3. **Zapier / Make Automation**: Enrich scraped links automatically before publishing to CMS or social media.
