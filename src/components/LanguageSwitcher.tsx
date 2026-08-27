import { Check, ChevronDown, Globe2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { LocaleCode } from '@/content/locales'

type LanguageOption = {
  label: string
  short: string
  href: string
  dir: string
}

export function LanguageSwitcher({
  current,
  label,
  menuLabel,
  currentLabel,
  options,
}: {
  current: LocaleCode
  label: string
  menuLabel: string
  currentLabel: string
  options: Record<LocaleCode, LanguageOption>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const selected = options[current]

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      ref.current?.querySelector<HTMLButtonElement>('[data-language-trigger]')?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openAndFocus = () => {
    setOpen(true)
    requestAnimationFrame(() => ref.current?.querySelector<HTMLAnchorElement>('[role="menuitem"]')?.focus())
  }

  return (
    <div ref={ref} className="language-switcher">
      <button
        type="button"
        data-language-trigger=""
        className="language-switcher__trigger"
        aria-label={`${label}: ${selected.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            openAndFocus()
          }
        }}
      >
        <Globe2 className="size-4" aria-hidden="true" strokeWidth={1.8} />
        <span className="language-switcher__short">{selected.short}</span>
        <ChevronDown
          className="language-switcher__chevron size-3.5"
          aria-hidden="true"
          data-open={open ? 'true' : 'false'}
        />
      </button>

      <div
        id={menuId}
        data-language-menu=""
        className="language-switcher__menu"
        role="menu"
        aria-label={menuLabel}
        hidden={!open}
      >
        <p className="language-switcher__label">{menuLabel}</p>
        {(Object.entries(options) as [LocaleCode, LanguageOption][]).map(([code, option]) => {
          const active = code === current
          const hash = typeof window === 'undefined' ? '' : window.location.hash
          return (
            <a
              key={code}
              role="menuitem"
              lang={code}
              dir={option.dir}
              href={`${option.href}${hash}`}
              aria-current={active ? 'page' : undefined}
              aria-label={active ? `${option.label}, ${currentLabel}` : option.label}
              className="language-switcher__option"
              onClick={() => {
                try {
                  localStorage.setItem('inplace.locale', code)
                } catch {
                  // Navigation still works when storage is unavailable.
                }
              }}
            >
              <span>{option.label}</span>
              <span className="language-switcher__option-code">{option.short}</span>
              <Check className="size-4" aria-hidden="true" data-active={active ? 'true' : 'false'} />
            </a>
          )
        })}
      </div>
    </div>
  )
}
