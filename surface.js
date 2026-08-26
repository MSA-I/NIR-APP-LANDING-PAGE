/* ============================================================================
   InPlace build 3 — the page's own behaviour.
   ----------------------------------------------------------------------------
   Two things, neither of which belongs in the engine:

     1. the folio        which chapter the reader is in, and which ground the
                         bar is currently sitting on
     2. the chain        chapter 02's five stations

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
  // Every cream plate, not just the first one: the FAQ sits on a second
  // plate, and a dark translucent bar over a cream section reads as a bug.
  var lightPlates = Array.prototype.slice.call(doc.querySelectorAll('.plate'));

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

      var onLight = lightPlates.some(function (el) {
        var r = el.getBoundingClientRect();
        return r.top <= barH && r.bottom >= barH;
      });
      folio.classList.toggle('folio--light', onLight);
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

})();
