import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  image?: string;
  lang?: 'en' | 'es';
  alternateLang?: { lang: string; path: string };
}

const BASE_TITLE = 'LinkToLawyers';

function setMetaTag(property: string, content: string, isName = false) {
  const attr = isName ? 'name' : 'property';
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string, extraAttrs?: Record<string, string>) {
  const selector = extraAttrs
    ? `link[rel="${rel}"]${Object.entries(extraAttrs).map(([k, v]) => `[${k}="${v}"]`).join('')}`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (extraAttrs) {
      Object.entries(extraAttrs).forEach(([k, v]) => el!.setAttribute(k, v));
    }
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function removeLinks(rel: string) {
  document.querySelectorAll(`link[rel="${rel}"]`).forEach(el => el.remove());
}

export function useSEO({ title, description, path, type = 'website', image, lang = 'en', alternateLang }: SEOProps) {
  useEffect(() => {
    const fullTitle = title === BASE_TITLE ? title : `${title} | ${BASE_TITLE}`;
    document.title = fullTitle;

    document.documentElement.lang = lang;

    setMetaTag('description', description, true);

    setMetaTag('og:title', fullTitle);
    setMetaTag('og:description', description);
    setMetaTag('og:type', type);
    if (path) {
      setMetaTag('og:url', `${window.location.origin}${path}`);
    }
    if (image) {
      setMetaTag('og:image', image);
    }
    setMetaTag('og:site_name', BASE_TITLE);

    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', fullTitle, true);
    setMetaTag('twitter:description', description, true);
    if (image) {
      setMetaTag('twitter:image', image, true);
    }

    if (path) {
      setLinkTag('canonical', `${window.location.origin}${path}`);
    }

    removeLinks('alternate');
    if (alternateLang && path) {
      setLinkTag('alternate', `${window.location.origin}${path}`, { hreflang: lang });
      setLinkTag('alternate', `${window.location.origin}${alternateLang.path}`, { hreflang: alternateLang.lang });
      setLinkTag('alternate', `${window.location.origin}${path}`, { hreflang: 'x-default' });
    }

    return () => {
      document.title = `${BASE_TITLE} - Find Your Attorney | Compare Legal Fees Nationwide`;
      removeLinks('alternate');
    };
  }, [title, description, path, type, image, lang, alternateLang]);
}
