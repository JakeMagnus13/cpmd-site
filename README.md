# CPMD.health

Dr Challis Paterson — Integrative GP on the Gold Coast and Mount Samson.

Built with [Astro](https://astro.build), deployed on [Cloudflare Pages](https://pages.cloudflare.com), email list via [MailerLite](https://mailerlite.com), contact form via [Resend](https://resend.com).

---

## Tech Stack

- **Astro 5** — static site generator, zero JS by default
- **Cloudflare Pages** — hosting, CDN, DNS
- **Cloudflare Pages Functions** — serverless endpoints for form submissions
- **MailerLite** — email list, automation, lead magnet delivery
- **Resend** — transactional email for contact form
- **Content Collections** — type-safe Markdown blog

**Cost:** $0/month until email list exceeds 1,000 subscribers.

---

## Project Structure

```
cpmd-site/
├── astro.config.mjs         # Astro + sitemap config
├── package.json
├── tsconfig.json
├── .env.example             # Template for env vars (never commit .env)
├── public/                  # Static assets served as-is
│   ├── favicon.svg
│   └── robots.txt
├── functions/               # Cloudflare Pages Functions (serverless)
│   └── api/
│       ├── subscribe.ts     # Popup form → MailerLite
│       └── contact.ts       # Contact form → Resend email
└── src/
    ├── content.config.ts    # Blog content collection schema
    ├── styles/
    │   └── global.css       # Design tokens + global styles
    ├── layouts/
    │   └── Layout.astro     # Base layout (nav, footer, popup, SEO)
    ├── components/
    │   ├── Nav.astro
    │   ├── Footer.astro
    │   ├── Popup.astro      # Welcome popup w/ MailerLite integration
    │   ├── Hero.astro
    │   ├── Marquee.astro
    │   ├── Ethos.astro
    │   ├── Services.astro
    │   ├── Locations.astro
    │   ├── FAQ.astro
    │   └── CTABand.astro
    ├── content/
    │   └── blog/            # Markdown blog posts go here
    └── pages/
        ├── index.astro      # Homepage
        ├── about.astro
        ├── services.astro
        ├── locations.astro
        ├── contact.astro
        └── blog/
            ├── index.astro  # Blog listing
            └── [id].astro   # Dynamic blog post page
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

> **Note:** Cloudflare Pages Functions don't run in `astro dev`. For local testing of the popup/contact form, use `wrangler pages dev` (see [Cloudflare docs](https://developers.cloudflare.com/pages/functions/local-development/)).

---

## Adding a Blog Post

Create a new `.md` file in `src/content/blog/` with this frontmatter:

```markdown
---
title: "Your Post Title"
description: "Short description for SEO and previews"
pubDate: 2026-04-15
category: "Integrative Medicine"
tags: ["nutrition", "sleep"]
draft: false
---

Your content here, using **Markdown** formatting.

## Headings work
- So do lists
- And [links](https://example.com)
```

Commit, push — it goes live automatically on the next Cloudflare build.

---

## Full Deployment Guide

### Part 1 — GitHub Setup

1. Create a new repository on GitHub called `cpmd-site` (private is fine).
2. On your local machine, inside the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Astro scaffold"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cpmd-site.git
   git push -u origin main
   ```

### Part 2 — Cloudflare Pages Setup

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up / log in.
2. In the left sidebar, click **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorise Cloudflare to access your GitHub, then select the `cpmd-site` repo.
4. On the build settings page:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** (leave blank)
5. Click **Save and Deploy**. Cloudflare will build and deploy the site. First build takes ~2 minutes.
6. Once deployed, you'll get a URL like `cpmd-site.pages.dev`. Visit it — the site is live.

### Part 3 — MailerLite Setup (for the popup)

1. Sign up at [mailerlite.com](https://mailerlite.com) (free up to 1,000 subscribers).
2. Verify your sending domain (`cpmd.health`) — this takes 5–10 min and requires adding DNS records.
3. Create a subscriber **group**. Name it something like "Newsletter" or "Website Signups".
4. Click into the group — copy the **Group ID** from the URL (e.g. `.../groups/123456789`).
5. Go to **Integrations** → **Developer API** → **Generate new token**. Copy the token.
6. Create an **Automation**:
   - Trigger: "When subscriber joins a group" → select your Newsletter group
   - Action: "Send email" → design the welcome email with the PDF guide attached or linked
   - Activate the automation

### Part 4 — Resend Setup (for the contact form)

1. Sign up at [resend.com](https://resend.com) (free: 3,000 emails/month, 100/day).
2. Add and verify your domain `cpmd.health` — requires DNS records.
3. Once verified, create an API key in **API Keys**. Copy it.
4. Decide on a from address like `contact@cpmd.health`.

### Part 5 — Environment Variables in Cloudflare

1. In Cloudflare dashboard, go to your Pages project → **Settings** → **Environment variables**.
2. Under **Production**, add these:

   | Variable name | Value |
   |---|---|
   | `MAILERLITE_API_KEY` | (paste from MailerLite) |
   | `MAILERLITE_GROUP_ID` | (paste from MailerLite) |
   | `RESEND_API_KEY` | (paste from Resend) |
   | `CONTACT_TO_EMAIL` | `hello@cpmd.health` |
   | `CONTACT_FROM_EMAIL` | `contact@cpmd.health` |

3. Click **Save**.
4. Go to **Deployments** and trigger a new deployment so the functions pick up the variables.

### Part 6 — Custom Domain

1. In Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**.
2. Enter `cpmd.health` and `www.cpmd.health`.
3. If the domain is already on Cloudflare DNS, it's automatic. If not, Cloudflare will give you CNAME instructions to add at your current registrar.
4. **Recommended:** Move the domain fully into Cloudflare (free) for the best performance and easier management.
5. Wait ~5 minutes for SSL. Done.

### Part 7 — Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Add `https://www.cpmd.health` as a property.
3. Verify ownership (easiest method: add a DNS TXT record in Cloudflare).
4. Submit the sitemap: `https://www.cpmd.health/sitemap-index.xml`.
5. This tells Google the site exists and speeds up indexing dramatically.

### Part 8 — Google Business Profile

Separate from the website but critical for local SEO. See the original audit doc — set this up as a parallel task.

---

## Testing Checklist

Before going live, verify:

- [ ] Homepage loads and all sections render correctly
- [ ] Navigation works on mobile (hamburger menu)
- [ ] Popup appears 2 seconds after first visit
- [ ] Popup form successfully adds a test subscriber to MailerLite
- [ ] Welcome email arrives in the test inbox with the PDF guide
- [ ] Popup doesn't re-appear within 7 days after dismissal
- [ ] Contact form sends email to `hello@cpmd.health`
- [ ] All internal links work (about, services, locations, blog, contact)
- [ ] FAQ accordions open and close
- [ ] Site is fast (check at [pagespeed.web.dev](https://pagespeed.web.dev))
- [ ] Schema markup is valid (check at [search.google.com/test/rich-results](https://search.google.com/test/rich-results))
- [ ] Sitemap exists at `/sitemap-index.xml`
- [ ] `robots.txt` exists and points to sitemap

---

## What Still Needs to Be Added by Challis

1. **Professional photos** — headshot, clinic photos, lifestyle shots
2. **The PDF lead magnet** — "The Holistic Health Evaluation" guide
3. **Real copy review** — she should edit tone/phrasing in her voice
4. **Actual leave-of-absence dates** in the popup notice
5. **Testimonial section** — removed due to AHPRA regulations for regulated health practitioners in Australia
6. **Phone numbers confirmation** — verify the clinic numbers in the footer are correct

---

## Ongoing Maintenance

**Low — by design.** Astro builds are fast, Cloudflare handles all infrastructure, and blog posts are just Markdown files committed to GitHub.

**Monthly:**
- Write one blog post
- Check Google Search Console for crawl errors
- Review MailerLite subscriber growth

**As needed:**
- Update the leave-of-absence notice in `Popup.astro` when dates change
- Add new testimonial-free social proof (qualifications, media mentions, speaking engagements)
- Update service descriptions as Challis's practice evolves

---

## Support

Built by Magnus. Questions: magnus@tierraperma.com

