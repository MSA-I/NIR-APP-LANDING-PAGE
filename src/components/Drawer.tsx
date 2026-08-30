// The phone menu, as a drawer.
//
// 21st.dev's `drawer` (@coss.com, catalogue id 11444, whose own demo is a
// mobile menu), chosen by the owner on 30.08.2026 over the panel this
// replaces: a card hanging off the header with four links in it, which was a
// browser dropdown wearing the page's colours.
//
// WHAT IS CARRIED OVER, and these are the catalogue's numbers, not new ones:
// the panel is `100% - 3rem` wide and caps at 28rem, so the ground it came
// from stays visible behind it; the inner edge is rounded 1rem and the outer
// three are square; a 4px grab bar rides that inner edge; the scrim is black
// at 32% with a small blur; and everything moves on 450ms of
// cubic-bezier(0.32, 0.72, 0, 1), the ease that component uses throughout.
// The swipe comes with it, including the part most copies drop: the scrim's
// opacity is tied to how far the panel has travelled, so a drag let go halfway
// leaves the reader looking at a half-lit page rather than at a switch that
// has already flipped.
//
// FOUR DEPARTURES, each because this page is not the catalogue's demo page:
//
//   1. NOT Base UI. The published file imports `@base-ui/react`'s drawer,
//      checkbox and radio primitives plus `class-variance-authority`, and this
//      repo has none of the four. The footer, which came from the same
//      catalogue, already settled the rule: take the shape, rebuild it on
//      Motion, which is in the bundle either way.
//
//   2. It is a <dialog>, opened with showModal(). Only that call puts the
//      panel in the top layer, makes the rest of the document inert, and hands
//      Escape and the focus trap to the browser. The catalogue re-implements
//      all three; chapter 02's zoom already made the opposite choice in this
//      codebase and this follows it.
//
//   3. The side is LOGICAL. The catalogue picks left or right and writes the
//      transform for it, and a transform is not mirrored by `dir`: on the
//      Hebrew page the panel would arrive from the edge the trigger is not on.
//      `sign` is -1 in LTR and +1 in RTL and every movement is written against
//      it, which is the device ThemeToggle already uses for its knob.
//
//   4. It obeys `prefers-reduced-motion`. With that on the panel is simply
//      there and simply gone, and the drag is off: a reader who asked for less
//      motion did not ask for a faster slide.
//
// The trigger keeps `data-folio-menu-trigger` and the panel keeps
// `data-folio-menu`, because two gates find this control by those attributes
// and neither of them cares what it is made of.

import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useCalm } from '@/lib/motion'

/** The catalogue's ease and duration, unchanged. */
const DRAWER_EASE = [0.32, 0.72, 0, 1] as const
const DRAWER_S = 0.45
/** Leaving is quicker than arriving, which is the catalogue's own asymmetry. */
const DRAWER_OUT = 0.28

/** Motion's drag bounds, which are axis ends and not sides of the page. */
const X_MIN = 'left'
const X_MAX = 'right'

/** How far, or how fast, a swipe has to go before letting go closes it. */
const DISMISS_FRACTION = 0.28
const DISMISS_VELOCITY = 420

export function Drawer({
  open,
  onClose,
  label,
  closeLabel,
  panelId,
  head,
  tools,
  children,
}: {
  open: boolean
  onClose: () => void
  /** The panel's own accessible name. */
  label: string
  closeLabel: string
  /** What the trigger's `aria-controls` points at: the panel itself. */
  panelId?: string
  /** The mark and the wordmark, at the top of the panel. */
  head?: ReactNode
  /** How the page is read rather than where it goes: the language control and
      the light/dark switch. At the TOP of the panel since 30.08.2026, on the
      owner's placement — under the mark, over everything that navigates. */
  tools?: ReactNode
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const calm = useCalm()

  /**
   * The swipe starts on the bar, and only there.
   *
   * It was on the whole panel, and on a touch screen it did nothing at all:
   * the list inside declares `touch-action: pan-y` so it can scroll, and a
   * browser handed a horizontal move over that list takes the gesture for
   * itself and cancels the pointer stream the drag was reading. Measured
   * 30.08.2026 in both editions — the panel did not move a pixel and the
   * release did not close it. The two gestures cannot share one surface, so
   * they are given two: the list scrolls, and the bar along the inner edge —
   * the full height of the panel, which is why the catalogue draws one — is
   * what the panel is dragged by.
   */
  const drag = useDragControls()

  // +1 when the panel travels toward positive x to leave (RTL, where it sits
  // against the right edge), -1 when it travels toward negative x (LTR).
  const [sign, setSign] = useState(1)
  const [width, setWidth] = useState(320)

  /**
   * How far the panel has been dragged toward the edge, 0 to 1.
   *
   * A VALUE OF ITS OWN, rather than reading the panel's `x`. The panel is
   * dragged AND animated in and out, so its transform has to belong to Motion
   * alone: a motion value bound into `style` is owned by the caller, and the
   * enter and the exit then compete with the gesture for the same key. The drag
   * writes this number instead, and the scrim reads it, so the two things that
   * have to agree — how far the finger has taken the panel, and how lit the
   * page behind it is — agree without either owning the other.
   */
  const progress = useMotionValue(0)
  const dim = useTransform(progress, [0, 1], [1, 0])

  useEffect(() => {
    if (!open) return
    setSign(document.documentElement.dir === 'ltr' ? -1 : 1)
    setWidth(panelRef.current?.offsetWidth || Math.round(window.innerWidth * 0.8))
    progress.set(0)
  }, [open, progress])

  // A floor under the close, whatever the frame budget is doing.
  //
  // The <dialog> is closed by `onExitComplete`, which is Motion reporting that
  // the leave has finished — and on a page carrying a live WebGL ground that
  // report was measured arriving 600-800ms after a 280ms animation, because the
  // frames it is counted in are the frames the shader is competing for. A modal
  // that is still open is a page that is still inert, so the close does not wait
  // on the animation indefinitely: past the exit's own duration plus a frame or
  // two, it happens anyway. The exit still runs and still looks the same when
  // the page is not busy; this only decides who closes the element last.
  useEffect(() => {
    if (open) return
    const el = dialogRef.current
    if (!el?.open) return
    const t = setTimeout(() => el.open && el.close(), DRAWER_OUT * 1000 + 140)
    return () => clearTimeout(t)
  }, [open])

  // showModal, and the one thing the top layer does not bring with it: the
  // document behind a modal is inert to the keyboard and to a pointer, and
  // still scrolls under a finger.
  useEffect(() => {
    const el = dialogRef.current
    if (!el || !open) return
    if (!el.open) el.showModal()
    // showModal moves focus, but with nothing autofocused it lands on the
    // <dialog> element itself — outside the panel, so the first Tab walks the
    // scrim before it reaches anything a reader can use. The panel takes it
    // instead: a screen reader reads the panel's name and Tab goes forward
    // from its first control.
    panelRef.current?.focus()
    const root = document.documentElement
    const held = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = held
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="drawer"
      aria-label={label}
      // Escape reaches the dialog as `cancel`, and the default would close the
      // element outright and cut the panel off mid-frame. The state closes it
      // instead, so the exit runs.
      //
      // THE INNERMOST OPEN THING TAKES THE PRESS, and it takes it where it is:
      // a control inside this panel that answers Escape cancels the keydown,
      // and a cancelled keydown is not a close request, so the drawer never
      // hears it. See the note in LanguageSwitcher.tsx, which is the one
      // control that needs it.
      //
      // This used to be a guard here instead — ignore the cancel while
      // something inside reports `aria-expanded="true"` — and it was a race it
      // could not win: whether the drawer closed on the NEXT press depended on
      // whether React had committed that attribute yet. It passed in one
      // edition and failed in the other, and which one moved between runs.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {/* TWO KEYED SIBLINGS, AND NO FRAGMENT AROUND THEM. AnimatePresence
          tracks what is leaving by key, one child at a time; a fragment is a
          single unkeyed child that is not a motion component, so it had nothing
          to track and the exit never ran. `onExitComplete` is what closes the
          <dialog>, so the panel stayed on screen with its own state already
          saying closed: measured 30.08.2026, Escape left the drawer up four
          times in five. The kind of fault that reads as the browser being slow
          rather than as a bug. */}
      <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
        {open && (
          <motion.button
            key="scrim"
            type="button"
            className="drawer__scrim"
            aria-label={closeLabel}
            tabIndex={-1}
            onClick={onClose}
            style={calm ? undefined : { opacity: dim }}
            initial={calm ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: calm ? 0 : DRAWER_OUT,
                ease: DRAWER_EASE,
              },
            }}
            transition={{ duration: calm ? 0 : DRAWER_S, ease: DRAWER_EASE }}
          />
        )}
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            id={panelId}
            data-folio-menu=""
            tabIndex={-1}
            className="drawer__panel"
            initial={calm ? false : { x: `${sign * 100}%` }}
            animate={{ x: 0 }}
            // The exit carries its own timing. Without it the leave was
            // measured at 600-900ms against the 450 this component is written
            // to, because a draggable element hands its transform to Motion's
            // gesture defaults rather than to the transition beside it — and
            // the <dialog> is only closed when the exit reports finished, so
            // the panel sat on screen after its own state said closed.
            exit={{
              x: `${sign * 100}%`,
              transition: {
                duration: calm ? 0 : DRAWER_OUT,
                ease: DRAWER_EASE,
              },
            }}
            transition={{ duration: calm ? 0 : DRAWER_S, ease: DRAWER_EASE }}
            drag={calm ? false : 'x'}
            dragControls={drag}
            dragListener={false}
            dragDirectionLock
            dragMomentum={false}
            dragElastic={0.04}
            // It can travel toward the edge it came from, and nowhere else.
            // The two bounds are named through constants because they are
            // Motion's VIEWPORT AXES rather than writing-flow sides — the
            // mirroring is already done, by `sign` — and G4 reads a literal
            // `left:` in a source file as a physical direction that escaped
            // the logical-properties rule, which here it would not be.
            dragConstraints={
              sign > 0 ? { [X_MIN]: 0, [X_MAX]: width } : { [X_MIN]: -width, [X_MAX]: 0 }
            }
            onDrag={(_event, info) => {
              progress.set(Math.min(1, Math.max(0, (info.offset.x * sign) / width)))
            }}
            onDragEnd={(_event, info) => {
              const travelled = info.offset.x * sign
              const speed = info.velocity.x * sign
              if (travelled > width * DISMISS_FRACTION || speed > DISMISS_VELOCITY) onClose()
              else progress.set(0)
            }}
          >
            <span
              className="drawer__bar"
              aria-hidden="true"
              onPointerDown={(event) => !calm && drag.start(event)}
            />

            <div className="drawer__head">
              {head}
              <button
                type="button"
                className="drawer__close"
                aria-label={closeLabel}
                onClick={onClose}
              >
                <X className="size-[1.15rem]" aria-hidden="true" strokeWidth={2} />
              </button>
            </div>

            {tools && <div className="drawer__tools">{tools}</div>}

            <div className="drawer__body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  )
}
