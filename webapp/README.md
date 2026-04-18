# Contentful Next.js Landing Page Webapp

This is a specialized lightweight [Next.js](https://nextjs.org) application designed to serve raw HTML and CSS payloads directly from Contentful, built with dynamic internationalized (i18n) routing and powered by GraphQL.

## Architecture Decisions

### 1. Stripped Boilerplate
The standard Next.js Tailwind configuration and Vercel boilerplate components have been entirely removed. The default presentation layers in `app/globals.css` and local layout structures have been completely stripped because the styling payload (HTML structure mapped to CSS) is supplied natively by the Contentful `content` field payload. 

### 2. Internationalization (i18n) Route Mapping
The routing map completely dropped the default `app/page.tsx` base paths. The app now mandates that all user visitation explicitly runs against a defined mapping: `domain/[lang]/[slug]`.
For example: `http://localhost:3000/en/my-landing-page` 

### 3. Next.js 16 Proxy Redirects
To handle edge cases where a user navigates to an empty local branch (i.e. `domain/my-landing-page`), we leverage Next.js 16's `proxy.ts` (which replaced the deprecated `middleware.ts`). 

The `proxy.ts` interceptor validates incoming URL paths. If the root segment is not explicitly a recognized mapped `$locale` code (such as `/en/` or `/fr/`), it will natively intercept and redirect the browser payload to `/en/[pathname]` by default — acting as a strong seamless fallback for standard traffic.

### 4. Contentful GraphQL Integration
Rather than standard REST Delivery requests, this iteration leans deeply on Contentful's GraphQL `POST` behaviors inside `lib/contentful.ts`. It maps exactly to Contentful's graph parameter schemas:
- Takes in `$locale` defined strictly by Next's App Router parameter.
- Employs `$preview` dynamically via the search query parameters (`?preview=true`), safely routing the Fetch API into using the un-cached Preview token seamlessly. 
- Disables cache checking automatically when requesting dynamically un-published content (`revalidate: 0`).

---

## Getting Started

### 1. Environment Configurations
Configure your environment using `.env.local`:
```bash
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ENVIRONMENT=master # e.g. master
CONTENTFUL_ACCESS_TOKEN=your_content_delivery_token
CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_content_preview_token
```

### 2. Development Server
Run the local environment:
```bash
npm run dev
```

### 3. Test Suites
Unit tests checking various API responses properly run via Jest standard parameters configured globally against Mock Fetch APIs:
```bash
npm run test
```
