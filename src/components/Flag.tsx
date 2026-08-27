import type { LocaleCode } from '@/content/locales'

// Flag emoji do not render on Windows — the platform ships no flag glyphs and
// falls back to the two letters of the country code. The reference component
// uses emoji; on the audience's own machines that would have printed "IL" and
// "US" instead of flags, so the two marks this page needs are drawn here.
export function Flag({ code }: { code: LocaleCode }) {
  const common = {
    viewBox: '0 0 20 14',
    className: 'language-switcher__flag',
    'aria-hidden': true as const,
  }

  if (code === 'he') {
    return (
      <svg {...common}>
        <rect width="20" height="14" rx="2" fill="#fff" />
        <path d="M0 2h20v1.7H0zM0 10.3h20V12H0z" fill="#0038b8" />
        <path
          d="M10 4.6 12 8H8zM10 9.4 8 6h4z"
          fill="none"
          stroke="#0038b8"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <rect width="20" height="14" rx="2" fill="#fff" />
      <path
        d="M0 1h20v1H0zM0 3h20v1H0zM0 5h20v1H0zM0 7h20v1H0zM0 9h20v1H0zM0 11h20v1H0zM0 13h20v1H0z"
        fill="#b31942"
      />
      <rect width="9" height="8" rx="1" fill="#0a3161" />
      <path
        d="M2 2.2h.9M4 2.2h.9M6 2.2h.9M3 4h.9M5 4h.9M2 5.8h.9M4 5.8h.9M6 5.8h.9"
        stroke="#fff"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
