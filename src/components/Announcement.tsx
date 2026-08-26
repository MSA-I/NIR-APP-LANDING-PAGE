// The strip above the running head.
//
// It lives INSIDE the folio's fixed header rather than above it. A second
// fixed element would have to tell the first one how tall it is, and every
// scroll offset on the page would then depend on whether the strip had been
// dismissed. One fixed box that is sometimes two rows tall has no such
// arithmetic.
//
// Dismissal is remembered for the session only. `localStorage` would mean a
// reader who closed it in March never learns what changed in April, and this
// strip is the page's only place for that.

import { useEffect, useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'

const KEY = 'inplace.announce.v1'

export function Announcement({
  text,
  linkLabel,
  href,
  dismissLabel,
}: {
  text: string
  linkLabel: string
  href: string
  dismissLabel: string
}) {
  // Starts closed and opens on mount, so a reader who dismissed it earlier in
  // the session never sees it flash back in before the effect runs.
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) !== 'closed') setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [])

  if (!open) return null

  return (
    <div className="announce">
      <a className="announce__link" href={href}>
        <span className="announce__dot" aria-hidden="true" />
        <span className="announce__text">{text}</span>
        <span className="announce__cta">
          {linkLabel}
          <ArrowLeft className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
        </span>
      </a>
      <button
        type="button"
        className="announce__close"
        aria-label={dismissLabel}
        onClick={() => {
          setOpen(false)
          try {
            sessionStorage.setItem(KEY, 'closed')
          } catch {
            /* private mode: the strip simply comes back next navigation */
          }
        }}
      >
        <X className="size-3.5" aria-hidden="true" strokeWidth={2.5} />
      </button>
    </div>
  )
}
