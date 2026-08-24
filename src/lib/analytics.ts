/* Provider-agnostic analytics (research doc §16.3). Zero dependencies.
   Every event lands in window.dataLayer (GTM-compatible) and is forwarded to
   plausible()/gtag() when a provider script is present. No provider yet =
   events still measurable in-page and ready for the day one is wired. */

export type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    plausible?: (event: string, opts?: { props?: EventProps }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, props: EventProps = {}): void {
  try {
    (window.dataLayer ??= []).push({ event, ...props });
    window.plausible?.(event, { props });
    window.gtag?.('event', event, props);
  } catch {
    /* analytics must never break the page */
  }
}

const fired = new Set<string>();

/** Fire an event at most once per page view (demo_started, roi_completed...). */
export function trackOnce(event: string, props: EventProps = {}): void {
  if (fired.has(event)) return;
  fired.add(event);
  track(event, props);
}
