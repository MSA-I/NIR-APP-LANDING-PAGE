/* ============================================================================
   InPlace — the page's own behaviour. The engine is never touched.

   Two things live here:

     1. THE MAP. A continuous world's navigation is a map, and a map you cannot
        move around in is a video. Nine stations along the floor of the hall, a
        run that fills as you travel, and every station is a real button that
        scrolls there.

     2. THE TWELFTH DOCUMENT. Eleven documents fall in leg one and are in the
        film. This is the twelfth: live markup that drifts after the pointer
        with mass, restates itself at every waypoint, leaves the hand at the
        peak to become a row, comes back for the exception, and opens at the
        close as the object the ask sits on.
   ========================================================================== */
(function () {
  'use strict'

  var root = document.documentElement
  var world = document.querySelector('[data-sc-mode="worldflight"]')
  if (!world) return

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v }
  var clamp01 = function (v) { return clamp(v, 0, 1) }
  var smooth = function (u) { u = clamp01(u); return u * u * (3 - 2 * u) }

  // Leg weights, in the same order and the same units the markup declares.
  var segs = [].slice.call(world.querySelectorAll('[data-sc-segment]'))
  var W = segs.map(function (s) { return parseFloat(s.getAttribute('data-sc-w')) || 1.3 })
  var TOTAL = W.reduce(function (a, b) { return a + b }, 0)
  var C0 = []
  ;(function () { var run = 0; W.forEach(function (w, i) { C0[i] = run; run += w }) })()

  /* ------------------------------------------------------------- the map -- */
  var stops = [].slice.call(document.querySelectorAll('.ip-map__stop'))
  var run = document.querySelector('.ip-map__run')

  stops.forEach(function (b, i) {
    b.addEventListener('click', function () {
      // Land a little past the leg's own start so the reader arrives inside the
      // shot rather than on its first frame.
      var y = world.offsetTop + (C0[i] + W[i] * 0.12) * innerHeight
      scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' })
    })
  })

  // one copy block per leg, in order, so the leg index reads its anchor
  var copyBlocks = [].slice.call(document.querySelectorAll('[data-sc-copy]'))

  addEventListener('sc:waypoint', function (e) {
    var i = e.detail.index
    stops.forEach(function (b, k) { b.setAttribute('aria-current', String(k === i)) })
    setDocState(i)
    setDocSide(i)
  })

  /* --------------------------------------------- the twelfth document ---- */
  var card = document.querySelector('.ip-doc')
  var stateEl = card && card.querySelector('[data-doc-state]')
  var STATES = window.IP_DOC_STATES || []
  var lastState = -1

  function setDocState(i) {
    if (!stateEl || !STATES[i] || i === lastState) return
    lastState = i
    stateEl.textContent = STATES[i].text
    card.setAttribute('data-tone', STATES[i].tone)
  }
  setDocState(0)

  function setDocSide(i) {
    if (!card) return
    var block = copyBlocks[i]
    // the copy sits at the start edge, so the card takes the other one
    var toEnd = !block || block.classList.contains('ip-at-start') ||
                block.classList.contains('ip-at-middle')
    card.classList.toggle('ip-doc--end', toEnd)
    card.classList.toggle('ip-doc--start', !toEnd)
  }
  setDocSide(0)

  // Where on the track the card does each thing. These are fractions of the
  // whole track and they line up with the copy windows in i18n/*.js.
  // Legs 1-3 already have eleven documents in the film; a twelfth live one
  // there is just more paper, and it lands on the headline. The visitor picks
  // it up when the camera lifts off the floor, and it is the one they carry.
  var TAKE_FROM  = 0.268, TAKE_TO  = 0.322
  var LEAVE_FROM = 0.600, LEAVE_TO = 0.688   // flies out of the hand, becomes a row
  var BACK_FROM  = 0.706, BACK_TO  = 0.740   // returns for the exception
  var OPEN_AT    = 0.928                     // opens as the ask

  // pointer drift, interpolated rather than tracked: direct tracking carries no
  // momentum and reads as artificial
  var px = 0, py = 0, tx = 0, ty = 0, rot = -2, open = false

  if (fine && !reduce) {
    addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect()
      var cx = r.left + r.width / 2
      var cy = r.top + r.height / 2
      tx = clamp((e.clientX - cx) * 0.22, -170, 170)
      ty = clamp((e.clientY - cy) * 0.22, -130, 130)
    }, { passive: true })
  }

  // On touch there is no pointer, so the sway comes from how hard the reader is
  // scrolling. Same idea, different input.
  var lastY = scrollY, vel = 0
  addEventListener('scroll', function () {
    vel = vel * 0.72 + (scrollY - lastY) * 0.28
    lastY = scrollY
    if (!fine) { tx = clamp(-vel * 1.4, -60, 60); ty = clamp(vel * 0.9, -70, 70) }
  }, { passive: true })

  function track() {
    var top = world.offsetTop
    var t = clamp((scrollY - top) / innerHeight, 0, TOTAL)
    return t / TOTAL
  }

  function frame() {
    var pr = track()

    if (run) run.style.setProperty('--ip-run', pr.toFixed(4))

    // The wordmark and the language links belong to the dark. Once the hall is
    // lit they sit on top of the product's own chrome inside every screenshot,
    // so they leave, and the close carries the languages on the card instead.
    var chrome = 1 - smooth((pr - 0.185) / 0.055)
    root.style.setProperty('--ip-chrome', chrome.toFixed(3))
    root.style.setProperty('--ip-chrome-pe', chrome > 0.5 ? 'auto' : 'none')
    root.classList.toggle('ip-chrome-off', chrome < 0.02)

    if (card) {
      // The card is absent until it has fallen with the others, present through
      // the journey, gone through the release, back for the exception, and open
      // at the close.
      var vis = smooth((pr - TAKE_FROM) / (TAKE_TO - TAKE_FROM))
      vis *= 1 - smooth((pr - LEAVE_FROM) / (LEAVE_TO - LEAVE_FROM))
      vis = Math.max(vis, smooth((pr - BACK_FROM) / (BACK_TO - BACK_FROM)))

      var leaving = smooth((pr - LEAVE_FROM) / (LEAVE_TO - LEAVE_FROM))
      var shouldOpen = pr >= OPEN_AT
      if (shouldOpen !== open) {
        open = shouldOpen
        card.classList.toggle('is-open', open)
      }

      px += (tx - px) * (reduce ? 1 : 0.065)
      py += (ty - py) * (reduce ? 1 : 0.065)

      // While it is leaving the hand it stops answering the pointer and travels
      // to the middle of the frame, where the wall is.
      var toMid = leaving * (1 - Math.min(pr >= BACK_FROM ? 1 : 0, 1))
      var dx = px * (1 - toMid)
      var dy = py * (1 - toMid)
      var scale = 1 - 0.42 * toMid
      var targetRot = reduce ? 0 : clamp(-2 - px * 0.02, -7, 3)
      rot += (targetRot - rot) * 0.08

      if (open) {
        card.style.setProperty('--ip-dx', '0px')
        card.style.setProperty('--ip-dy', '0px')
        card.style.setProperty('--ip-rot', '0deg')
        card.style.setProperty('--ip-scale', '1')
        card.style.setProperty('--ip-doc-op', '1')
      } else {
        card.style.setProperty('--ip-dx', dx.toFixed(1) + 'px')
        card.style.setProperty('--ip-dy', dy.toFixed(1) + 'px')
        card.style.setProperty('--ip-rot', rot.toFixed(2) + 'deg')
        card.style.setProperty('--ip-scale', scale.toFixed(3))
        card.style.setProperty('--ip-doc-op', vis.toFixed(3))
      }
    }

    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)

  /* --------------------------------------------------------- clip warmth --
     The engine fetches a leg only within 1.6 viewport-heights of it, which is
     right for bandwidth and means the reader can still arrive at a poster. It
     fetches with fetch(), so warming the same URLs into the HTTP cache first
     makes that fetch resolve immediately. Sequential and idle-timed, so it
     never competes with the leg the reader is actually looking at. */
  var warmList = segs.map(function (s) {
    var v = s.querySelector('video')
    if (!v) return null
    var mobile = !matchMedia('(hover: hover) and (pointer: fine)').matches || innerWidth < 860
    return (mobile && v.getAttribute('data-sc-src-mobile')) || v.getAttribute('data-sc-src')
  }).filter(Boolean)

  var warmed = []
  function warm(i) {
    if (reduce || i < 0 || i >= warmList.length || warmed[i]) return
    warmed[i] = true
    fetch(warmList[i], { cache: 'force-cache' }).then(function (r) { return r.blob() }).catch(function () {})
  }
  // Bounded on purpose: warming all nine up front would download the whole
  // flight before the first screen and undo the point of loading on approach.
  addEventListener('load', function () { warm(0); warm(1); warm(2) })
  addEventListener('sc:waypoint', function (e) { warm(e.detail.index + 1); warm(e.detail.index + 2) })

  /* ------------------------------------------------------------- layout --
     The engine sizes the spacer once, at mount, from innerHeight. If that
     reports 0 the track is 0px and the flight silently never advances, which
     looks exactly like success. One resize after the window and the fonts have
     settled makes it re-measure. */
  function relayout() { dispatchEvent(new Event('resize')) }
  addEventListener('load', relayout)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout)

  /* ------------------------------------------------------------ the skip --
     The ask lives on an object at the end of a 16-viewport flight, and it is
     display:none until it opens, so a keyboard user tabbing from the top never
     reaches it. The skip link takes them to the end of the track and puts the
     cursor on the button. */
  var skip = document.querySelector('.ip-skip')
  if (skip) {
    skip.addEventListener('click', function (e) {
      e.preventDefault()
      scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })
      // one frame for the open state to land before the button can take focus
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var btn = card && card.querySelector('.ip-btn--primary')
          if (btn) btn.focus()
        })
      })
    })
  }
})()
