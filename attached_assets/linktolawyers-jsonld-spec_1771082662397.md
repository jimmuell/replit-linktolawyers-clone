# LinkToLawyers JSON-LD Implementation Spec

## Overview

Implement JSON-LD structured data across the site using the existing `useSEO` hook pattern. This enables rich snippets in Google search results.

## Implementation Approach

Extend the existing `useSEO.ts` hook to accept an optional `structuredData` parameter. Add this logic inside the `useEffect`:

```typescript
// Add to useSEO.ts useEffect, after the existing meta tag logic:

// Remove any existing JSON-LD
const existingSchema = document.querySelector('script.jsonld-seo');
if (existingSchema) existingSchema.remove();

// Add new JSON-LD if provided
if (structuredData) {
  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  schemaScript.className = 'jsonld-seo';
  schemaScript.text = JSON.stringify(structuredData);
  document.head.appendChild(schemaScript);
}
```

Update the hook signature to accept structured data:

```typescript
interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object; // Add this
}
```

---

## Schema Definitions by Page Type

### 1. Homepage (English: `/`, Spanish: `/es`)

```json
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "LinkToLawyers",
  "alternateName": "Link To Lawyers",
  "description": "Compare immigration attorney fees nationwide. Get matched with qualified immigration lawyers for family visas, work permits, asylum, citizenship, and deportation defense.",
  "url": "https://linktolawyers.com",
  "logo": "https://linktolawyers.com/logo.png",
  "serviceType": [
    "Immigration Law",
    "Family Immigration",
    "Employment Immigration", 
    "Asylum and Refugee Law",
    "Deportation Defense",
    "Citizenship and Naturalization"
  ],
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "availableLanguage": [
    {
      "@type": "Language",
      "name": "English",
      "alternateName": "en"
    },
    {
      "@type": "Language", 
      "name": "Spanish",
      "alternateName": "es"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Immigration Legal Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Attorney Fee Comparison"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Immigration Attorney Matching"
        }
      }
    ]
  }
}
```

**Spanish version (`/es`):** Same structure, but update:
- `"description"`: `"Compare tarifas de abogados de inmigración en todo el país. Encuentre abogados calificados para visas familiares, permisos de trabajo, asilo, ciudadanía y defensa contra deportación."`
- `"url"`: `"https://linktolawyers.com/es"`

---

### 2. Blog Index (English: `/blog`, Spanish: `/es/blog`)

```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "LinkToLawyers Immigration Law Blog",
  "description": "Stay informed with the latest immigration law news, policy updates, and legal guides.",
  "url": "https://linktolawyers.com/blog",
  "inLanguage": "en-US",
  "publisher": {
    "@type": "Organization",
    "name": "LinkToLawyers",
    "url": "https://linktolawyers.com"
  }
}
```

**Spanish version (`/es/blog`):**
- `"name"`: `"Blog de Leyes de Inmigración de LinkToLawyers"`
- `"description"`: `"Manténgase informado con las últimas noticias sobre leyes de inmigración, actualizaciones de políticas y guías legales."`
- `"url"`: `"https://linktolawyers.com/es/blog"`
- `"inLanguage"`: `"es"`

---

### 3. Individual Blog Posts (Dynamic)

Generate this dynamically from post data in the blog post component:

```typescript
// In BlogPost component, construct this from post data:
const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://linktolawyers.com/blog/${post.slug}`
  },
  "headline": post.title,
  "description": post.excerpt || post.content.substring(0, 160),
  "image": post.featuredImage || "https://linktolawyers.com/default-blog-image.png",
  "datePublished": post.createdAt, // ISO 8601 format
  "dateModified": post.updatedAt || post.createdAt,
  "author": {
    "@type": "Organization",
    "name": "LinkToLawyers"
  },
  "publisher": {
    "@type": "Organization",
    "name": "LinkToLawyers",
    "logo": {
      "@type": "ImageObject",
      "url": "https://linktolawyers.com/logo.png"
    }
  },
  "inLanguage": isSpanish ? "es" : "en-US"
};

// Pass to useSEO hook:
useSEO({
  title: `${post.title} | LinkToLawyers`,
  description: post.excerpt,
  structuredData: blogPostSchema
});
```

---

### 4. Help/FAQ Pages (English: `/help`, Spanish: `/es/ayuda`)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does an immigration lawyer cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Immigration attorney fees vary widely based on case type and complexity. Family-based green cards typically range from $1,500-$5,000, while deportation defense can cost $5,000-$15,000+. LinkToLawyers helps you compare fees from multiple attorneys."
      }
    },
    {
      "@type": "Question",
      "name": "How do I choose an immigration attorney?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Look for attorneys who specialize in your specific case type, check their reviews and success rates, compare fees, and ensure they are licensed to practice immigration law. LinkToLawyers matches you with qualified attorneys based on your case needs."
      }
    },
    {
      "@type": "Question",
      "name": "What types of immigration cases do you cover?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We connect clients with attorneys for all immigration matters including family-based immigration, employment visas (H-1B, L-1, O-1), asylum and refugee cases, deportation defense, citizenship and naturalization, and DACA renewals."
      }
    },
    {
      "@type": "Question",
      "name": "Is the attorney matching service free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, submitting a request and receiving attorney quotes through LinkToLawyers is completely free. You only pay if you choose to hire one of the matched attorneys."
      }
    },
    {
      "@type": "Question",
      "name": "How long does the matching process take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A qualified legal professional reviews your request within 24-48 hours. You'll then receive quotes from matched attorneys to compare before making your decision."
      }
    }
  ]
}
```

**Spanish version:** Translate all question/answer pairs to Spanish.

---

### 5. Free Resources Pages (English: `/free-resources`, Spanish: `/es/recursos-gratuitos`)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Free Immigration Resources",
  "description": "Access free immigration guides, legal forms, checklists, and educational resources in English and Spanish.",
  "url": "https://linktolawyers.com/free-resources",
  "inLanguage": "en-US",
  "isPartOf": {
    "@type": "WebSite",
    "name": "LinkToLawyers",
    "url": "https://linktolawyers.com"
  },
  "about": {
    "@type": "Thing",
    "name": "Immigration Law Resources"
  }
}
```

---

### 6. AI Chat Pages (English: `/chat`, Spanish: `/es/chat`)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "LinkToLawyers AI Immigration Assistant",
  "description": "Get free immigration legal guidance from our AI-powered assistant. Available 24/7 in English and Spanish.",
  "url": "https://linktolawyers.com/chat",
  "applicationCategory": "Legal",
  "operatingSystem": "Web Browser",
  "availableLanguage": ["English", "Spanish"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

---

## Implementation Checklist

- [ ] Update `useSEO.ts` hook to accept `structuredData` parameter
- [ ] Add JSON-LD injection logic to the hook's useEffect
- [ ] Homepage: Add LegalService schema (both `/` and `/es`)
- [ ] Blog index: Add Blog schema (both `/blog` and `/es/blog`)
- [ ] Blog posts: Add dynamic BlogPosting schema
- [ ] Help pages: Add FAQPage schema (both `/help` and `/es/ayuda`)
- [ ] Resources pages: Add WebPage schema (both languages)
- [ ] Chat pages: Add WebApplication schema (both languages)
- [ ] Test with Google Rich Results Test: https://search.google.com/test/rich-results
- [ ] Validate with Schema.org validator: https://validator.schema.org/

---

## Testing

After implementation, test each page type:

1. **Google Rich Results Test:** https://search.google.com/test/rich-results
   - Paste the live URL
   - Verify structured data is detected and valid

2. **Schema.org Validator:** https://validator.schema.org/
   - Paste the JSON-LD directly
   - Check for errors or warnings

3. **Browser DevTools:**
   - View page source or inspect `<head>`
   - Verify `<script type="application/ld+json">` is present with correct data

---

## Additional Request: Pre-rendering Assessment

The current CSR-only approach may hurt search indexing for a new domain. Please assess the effort to implement pre-rendering (e.g., using prerender.io, react-snap, or similar) for these high-priority pages:

1. Homepage (`/` and `/es`)
2. Blog posts (`/blog/:slug` and `/es/blog/:slug`)
3. Free resources (`/free-resources` and `/es/recursos-gratuitos`)

What's the estimated effort and recommended approach for our React/Vite stack?
