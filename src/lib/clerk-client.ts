// Shared client-side Clerk loader — CDN script tag, not the @clerk/clerk-js npm
// package. That package lazy-loads its UI chunk via a relative dynamic import
// that Vite's bundler rewrites, which breaks at runtime with "Clerk was not
// loaded with UI components". Clerk's own docs recommend the CDN script for
// exactly this case (vanilla JS, no framework SDK) — and @clerk/astro isn't an
// option either, it requires Astro 5+ and this site is on 4.16.
declare global {
  interface Window {
    Clerk?: any;
    __clerkLoadPromise?: Promise<any>;
  }
}

export async function getClerk(publishableKey: string | undefined): Promise<any | null> {
  if (!publishableKey) return null;

  if (!window.__clerkLoadPromise) {
    window.__clerkLoadPromise = (async () => {
      if (!window.Clerk) {
        await new Promise<void>((resolve, reject) => {
          const encoded = publishableKey.replace(/^pk_(test|live)_/, '');
          const frontendApi = atob(encoded).replace(/\$+$/, '');
          const s = document.createElement('script');
          s.async = true;
          s.crossOrigin = 'anonymous';
          s.dataset.clerkPublishableKey = publishableKey;
          s.src = `https://${frontendApi}/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load Clerk script'));
          document.head.appendChild(s);
        });
      }
      await window.Clerk.load();
      return window.Clerk;
    })();
  }

  try {
    return await window.__clerkLoadPromise;
  } catch {
    return null;
  }
}
