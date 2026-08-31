# Visual evidence

## `og-cover-served-to-all-18-pages.jpg`

The single Open Graph card that every page on the site points at, both languages.
Its visible text is Hebrew: "כל מה שקורה בין ההזמנה לכסף, במקום אחד."

The nine `/en/` pages serve this image beneath an English `og:title`, and their
`og:image:alt` describes it in English. `/assets/og-cover-en.jpg` returns 404.

See `../findings/images.md`.

## Rendering checks (performed live, not archived)

Desktop (1280×720) and mobile (375×812) renders were reviewed in a live browser
on 31.08.2026. Both render correctly. Above the fold on mobile: announcement bar,
navigation, eyebrow, H1, two CTAs and the reassurance line.

One thing checked and ruled out: early captures showed the hero blurred, which
looked like a slow entrance animation delaying LCP. It is not. A declarative read
of the H1 and its full ancestor chain returns `opacity: 1`, `filter: none`,
`transform: none`, with no animation attached at any level. The seven animations
running on the page are all decorative loops — announcement sweep, logo marquee,
footer marquee, plan gloss, FAQ accordion — and none touch the hero text. The blur
was an artifact of the capture pipeline, not of the site.
