/* InPlace scroll landing — the signature move.
 *
 *   "השקל בתנועה" — the shekel in transit.
 *
 * One amount rides the station rail for the whole page. Its position on the
 * rail is scroll position, so scrolling IS moving money through the pipeline.
 * Three things make it more than a progress bar:
 *
 *   1. The amount MUTATES as it travels. It leaves the order at 6,384, the
 *      invoice asks 7,624, the decision puts it back to 6,384. The rail is the
 *      money's biography, not a percentage.
 *   2. Scroll velocity is money velocity. Cross a station faster than the
 *      controls can run and the station stamps as skipped: money moving faster
 *      than the checks on it. Scroll back and cross it slowly and it recovers.
 *   3. It accumulates a real ledger. One line per station passed, skips
 *      included, and the closing act reads that ledger back to the visitor.
 *
 * The engine is not touched. Everything here is driven off page scroll and the
 * engine's own --sc-p, exactly as uniqueness.md requires.
 */
(function (global) {
  'use strict'

  // Above this, the reader crossed the station faster than a person reading it
  // could have. Tuned against a trackpad flick (~4-6k) versus a normal wheel
  // read (~700-1800). It is deliberately forgiving: a false skip accusation is
  // worse than a missed one.
  var SKIP_VELOCITY = 3200 // px per second

  var reduced =
    global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches

  function mount(config) {
    var stations = config.stations || []
    var S = config.strings || {}
    var fmt = makeMoney(config.locale, config.currency)

    var track = document.querySelector('[data-track]')
    var token = document.querySelector('[data-token]')
    var tokenAmount = document.querySelector('[data-token-amount]')
    var statusAmount = document.querySelector('[data-status-amount]')
    var statusVelocity = document.querySelector('[data-status-velocity]')
    var ledger = document.querySelector('[data-ledger]')
    var ledgerList = document.querySelector('[data-ledger-list]')
    var ledgerEmpty = document.querySelector('[data-ledger-empty]')
    var ledgerCount = document.querySelector('[data-ledger-count]')
    var ledgerToggle = document.querySelector('[data-ledger-toggle]')
    var recap = document.querySelector('[data-recap]')
    var recapNote = document.querySelector('[data-recap-note]')
    var railLine = document.querySelector('.rail__line')

    if (!track) return

    // ---- the ledger toggle ------------------------------------------------
    if (ledgerToggle && ledger) {
      ledgerToggle.addEventListener('click', function () {
        var open = ledger.hidden
        ledger.hidden = !open
        ledgerToggle.setAttribute('aria-expanded', String(open))
        ledgerToggle.firstElementChild.textContent = open ? S.ledgerClose : S.ledgerOpen
      })
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !ledger.hidden) {
          ledger.hidden = true
          ledgerToggle.setAttribute('aria-expanded', 'false')
          ledgerToggle.firstElementChild.textContent = S.ledgerOpen
          ledgerToggle.focus()
        }
      })
    }

    // ---- geometry ---------------------------------------------------------
    // Each station owns the scroll position where its act begins. Crossing that
    // line is what "passing the station" means.
    var stops = []
    var anchorsReady = false

    function measure() {
      stops = stations
        .map(function (st, i) {
          var stopEl = track.querySelector('[data-stop="' + st.id + '"]')
          var actEl = document.querySelector('[data-station="' + st.id + '"]')
          if (!stopEl || !actEl) return null
          var rect = actEl.getBoundingClientRect()
          var top = rect.top + global.scrollY
          return {
            id: st.id,
            index: i,
            nav: st.nav,
            amount: st.amount,
            state: st.state,
            ledger: st.ledger,
            el: stopEl,
            // Pass the station once its act has come a third of the way up the
            // viewport: the point at which the reader has actually met it.
            anchor: Math.max(0, top - global.innerHeight * 0.62),
            railY: stopEl.offsetTop + stopEl.offsetHeight / 2,
            passed: false,
            skipped: false,
          }
        })
        .filter(Boolean)

      // A station whose act sits above an earlier one would make the trail run
      // backwards. Keep the anchors monotonic.
      for (var i = 1; i < stops.length; i++) {
        if (stops[i].anchor < stops[i - 1].anchor) stops[i].anchor = stops[i - 1].anchor
      }
      anchorsReady = stops.length > 0
      sizeStage()
    }

    // The peak's scatter is expressed as a fraction of its own stage, so the
    // stage has to publish its size. Nothing else about the peak needs JS.
    function sizeStage() {
      var stage = document.querySelector('[data-stage]')
      if (!stage) return
      var r = stage.getBoundingClientRect()
      stage.style.setProperty('--sw', Math.round(r.width))
      stage.style.setProperty('--sh', Math.round(r.height))
    }

    // ---- the ledger -------------------------------------------------------
    function renderLedger() {
      var lines = stops
        .filter(function (s) {
          return s.passed
        })
        .map(function (s) {
          return {
            kind: s.skipped ? 'skip' : 'ok',
            text: s.skipped ? fill(S.skipLine, s.nav) : s.ledger,
          }
        })

      if (ledgerCount) ledgerCount.textContent = String(lines.length)
      if (ledgerEmpty) ledgerEmpty.hidden = lines.length > 0

      paintList(ledgerList, lines, 'ledger')
      paintList(recap, lines, 'recap')

      if (recapNote) {
        var skipped = lines.filter(function (l) {
          return l.kind === 'skip'
        }).length
        recapNote.textContent = skipped ? S.skippedNote : S.cleanNote
      }
    }

    function paintList(el, lines, prefix) {
      if (!el) return
      var html = ''
      for (var i = 0; i < lines.length; i++) {
        html +=
          '<li data-kind="' +
          lines[i].kind +
          '"><span class="' +
          prefix +
          '__n num">' +
          (i + 1) +
          '</span><span>' +
          escapeHtml(lines[i].text) +
          '</span></li>'
      }
      el.innerHTML = html
    }

    // ---- the loop ---------------------------------------------------------
    var lastY = global.scrollY
    var lastT = 0
    var velocity = 0
    var fast = false
    var dirty = true

    function frame(now) {
      if (!anchorsReady) {
        requestAnimationFrame(frame)
        return
      }
      var y = global.scrollY
      var dt = lastT ? Math.max(now - lastT, 1) : 16
      lastT = now

      // Smooth the velocity: a single frame gap on a busy main thread would
      // otherwise read as a flick and stamp a skip the reader did not earn.
      var instant = (Math.abs(y - lastY) / dt) * 1000
      velocity += (instant - velocity) * 0.25
      lastY = y

      var nowFast = velocity > SKIP_VELOCITY
      if (nowFast !== fast) {
        fast = nowFast
        if (statusVelocity) {
          statusVelocity.textContent = fast ? S.velocityFast : S.velocityCalm
        }
      }

      var changed = false
      var current = -1
      var amount = null

      for (var i = 0; i < stops.length; i++) {
        var s = stops[i]
        var beyond = y >= s.anchor

        if (beyond && !s.passed) {
          s.passed = true
          s.skipped = fast
          changed = true
        } else if (!beyond && s.passed) {
          // Scrolled back above it. The station un-passes, so crossing it again
          // slowly is a real second chance rather than a permanent mark.
          //
          // Recovery lives here and ONLY here. Clearing a skip whenever the
          // velocity happens to fall would absolve a reader who flung the page
          // and then sat still, which is the opposite of what the move says:
          // the money got away from you, and going back is what fixes it.
          s.passed = false
          s.skipped = false
          changed = true
        }

        if (s.passed) {
          current = i
          if (s.amount != null) amount = s.amount
        }
      }

      if (changed || dirty) {
        dirty = false
        for (var j = 0; j < stops.length; j++) {
          var st = stops[j]
          st.el.setAttribute('data-passed', st.passed ? '1' : '0')
          st.el.setAttribute('data-skipped', st.skipped ? '1' : '0')
          if (j === current) st.el.setAttribute('aria-current', 'true')
          else st.el.removeAttribute('aria-current')
        }

        var text = amount == null ? S.dash : fmt(amount)
        if (tokenAmount) tokenAmount.textContent = text
        if (statusAmount) statusAmount.textContent = text

        var state = current >= 0 ? stops[current].state : 'idle'
        if (token) token.setAttribute('data-state', state)

        renderLedger()
      }

      // The token rides the rail between station dots, interpolated by how far
      // the reader is between the two anchors.
      if (token && !reduced) {
        var next = current + 1
        var a = current >= 0 ? stops[current] : null
        var b = next < stops.length ? stops[next] : null
        var railY
        if (!a && b) railY = b.railY
        else if (a && !b) railY = a.railY
        else if (a && b) {
          var span = Math.max(b.anchor - a.anchor, 1)
          var f = Math.min(Math.max((y - a.anchor) / span, 0), 1)
          // Ease in, not linear. A linear ride parks the token half way between
          // two dots for most of a station's length, which reads as "it is at
          // the next one already". Money sits AT a station while the controls
          // run on it, then moves.
          railY = a.railY + (b.railY - a.railY) * (f * f * (3 - 2 * f))
        } else railY = 0
        token.style.setProperty('--tokenY', Math.round(railY - 11))
      }

      if (railLine) {
        var trail =
          stops.length > 1
            ? Math.min(Math.max((current + 1) / stops.length, 0), 1)
            : 0
        railLine.style.setProperty('--trail', trail.toFixed(3))
      }

      requestAnimationFrame(frame)
    }

    // Anchors depend on final layout, which depends on the real font.
    measure()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure)
    global.addEventListener('load', measure)
    global.addEventListener('resize', debounce(measure, 150), { passive: true })

    requestAnimationFrame(frame)
  }

  // ---- helpers ------------------------------------------------------------
  function makeMoney(locale, currency) {
    var nf
    try {
      nf = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0,
      })
    } catch (e) {
      nf = null
    }
    return function (n) {
      return nf ? nf.format(n) : String(n)
    }
  }

  function fill(tpl, station) {
    return String(tpl || '').replace('{station}', station)
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function debounce(fn, ms) {
    var t
    return function () {
      clearTimeout(t)
      t = setTimeout(fn, ms)
    }
  }

  global.InPlaceSurface = { mount: mount }
})(window)
