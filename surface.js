/* ============================================================================
   InPlace build 3 — the page's own behaviour.
   ----------------------------------------------------------------------------
   Three things, none of which belong in the engine:

     1. the folio        which chapter the reader is in, and which ground the
                         bar is currently sitting on
     2. the tabs         chapter 02's five steps
     3. the apparatus    the signature move: a live footnote

   The engine is not touched. Everything here runs off IntersectionObserver and
   ordinary events, not off the scroll loop, because none of it needs a frame.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;

  /* ------------------------------------------------------------- 1. folio -- */

  var folio = doc.querySelector('.folio');
  var folioOut = doc.querySelector('[data-folio-out]');
  var chapters = Array.prototype.slice.call(doc.querySelectorAll('[data-folio]'));
  var lightPlate = doc.querySelector('.ch--what .plate');

  if (folio && folioOut && chapters.length) {
    // The chapter the bar is standing on is the last one whose top has passed
    // the bar. An observer alone gets this wrong on a fast flick, so the state
    // is derived from geometry and the observer only decides when to re-derive.
    var barH = folio.offsetHeight;

    var settle = function () {
      // A third of the way down the viewport, not the bar's own edge: the
      // folio names the chapter the reader is IN, and a reader whose screen
      // is mostly the next chapter is already in it.
      var y = window.scrollY + Math.max(barH + 1, innerHeight * 0.34);
      var now = chapters[0];
      for (var i = 0; i < chapters.length; i++) {
        if (chapters[i].offsetTop <= y) now = chapters[i];
      }
      var label = now.getAttribute('data-folio');
      if (folioOut.textContent !== label) folioOut.textContent = label;

      if (lightPlate) {
        var r = lightPlate.getBoundingClientRect();
        folio.classList.toggle('folio--light', r.top <= barH && r.bottom >= barH);
      }
    };

    var queued = false;
    var onScroll = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; settle(); });
    };

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', function () { barH = folio.offsetHeight; settle(); });
    settle();
  }

  /* -------------------------------------------------------------- 2. tabs -- */

  var tabs = Array.prototype.slice.call(doc.querySelectorAll('.chain__step'));
  var panels = Array.prototype.slice.call(doc.querySelectorAll('.panel'));

  function selectTab(i, focus) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach(function (p, j) { p.hidden = i !== j; });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(i, false); });
    t.addEventListener('keydown', function (e) {
      // RTL: ArrowLeft advances, ArrowRight goes back. Reading order, not
      // screen order, is what a keyboard user means by "next".
      var rtl = doc.documentElement.dir === 'rtl';
      var next = rtl ? 'ArrowLeft' : 'ArrowRight';
      var prev = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === next) { e.preventDefault(); selectTab((i + 1) % tabs.length, true); }
      else if (e.key === prev) { e.preventDefault(); selectTab((i - 1 + tabs.length) % tabs.length, true); }
      else if (e.key === 'Home') { e.preventDefault(); selectTab(0, true); }
      else if (e.key === 'End') { e.preventDefault(); selectTab(tabs.length - 1, true); }
    });
  });

  /* --------------------------------------------------------- 3. apparatus -- */
  /* The signature move. Every real figure in the running copy carries a source
     number; the strip at the foot of the page names the source of the figure
     the reader is standing on, and lights its row in the full list at the
     close. The list is the apparatus; the strip is only its reading head, so
     it is aria-hidden and nothing is lost without it. */

  var strip = doc.querySelector('[data-apparatus]');
  var notes = window.IP_NOTES || [];
  var byId = {};
  notes.forEach(function (n) { byId[n.id] = n; });

  var figures = Array.prototype.slice.call(doc.querySelectorAll('.fig[data-note]'));

  if (strip && figures.length && notes.length) {
    var outId = strip.querySelector('[data-apparatus-id]');
    var outT = strip.querySelector('[data-apparatus-t]');
    var outS = strip.querySelector('[data-apparatus-s]');
    var current = null;
    var hideTimer = 0;

    function show(id) {
      var n = byId[id];
      if (!n || current === id) return;
      current = id;

      outId.textContent = n.id;
      outT.textContent = n.t;
      outS.textContent = n.s;
      strip.hidden = false;
      // hidden -> shown in the same frame does not transition; let the browser
      // see the un-hidden element once first.
      requestAnimationFrame(function () { strip.classList.add('is-on'); });

      figures.forEach(function (f) {
        f.classList.toggle('is-lit', f.getAttribute('data-note') === id);
      });
      Array.prototype.forEach.call(doc.querySelectorAll('.note'), function (li) {
        li.classList.toggle('is-lit', li.id === 'note-' + id);
      });

      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 4200);
    }

    function hide() {
      current = null;
      strip.classList.remove('is-on');
      figures.forEach(function (f) { f.classList.remove('is-lit'); });
      Array.prototype.forEach.call(doc.querySelectorAll('.note'), function (li) {
        li.classList.remove('is-lit');
      });
    }

    // A band across the middle of the viewport, so the note names the figure
    // the reader is actually looking at rather than one entering at the edge.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) show(e.target.getAttribute('data-note'));
      });
    }, { rootMargin: '-38% 0px -46% 0px', threshold: 0 });

    figures.forEach(function (f) { io.observe(f); });

    // The colophon is where the apparatus lives in full; a floating copy of one
    // of its rows on top of it is noise.
    var colophon = doc.querySelector('.apparatus-list');
    if (colophon) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { clearTimeout(hideTimer); hide(); } });
      }, { threshold: 0.12 }).observe(colophon);
    }
  }
})();
