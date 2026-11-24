/* Figure lightbox for intro-to-HDA-site.
   Attaches to every <figure> containing an <img> on the page.
   Expand button (and clicking the image) opens fullscreen;
   arrows / arrow keys / swipe navigate; Esc or X closes. */
(function () {
  'use strict';

  var EXPAND_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/>' +
    '<path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>';

  function collectFigures() {
    var figs = Array.prototype.slice.call(document.querySelectorAll('figure'));
    return figs
      .map(function (fig) {
        var img = fig.querySelector('img');
        if (!img || !img.getAttribute('src')) return null;
        var cap = fig.querySelector('figcaption');
        return {
          fig: fig,
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt') || '',
          caption: cap ? cap.textContent.trim().replace(/\s+/g, ' ') : ''
        };
      })
      .filter(Boolean);
  }

  function buildOverlay(items, onClose) {
    var overlay = document.createElement('div');
    overlay.className = 'hda-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Figure viewer');
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="hda-counter" aria-live="polite"></div>' +
      '<button class="hda-close" aria-label="Close viewer">&times;</button>' +
      '<button class="hda-prev" aria-label="Previous figure">&#8249;</button>' +
      '<img alt="">' +
      '<button class="hda-next" aria-label="Next figure">&#8250;</button>' +
      '<div class="hda-caption"></div>';
    document.body.appendChild(overlay);

    var img = overlay.querySelector('img');
    var caption = overlay.querySelector('.hda-caption');
    var counter = overlay.querySelector('.hda-counter');
    var idx = 0;

    function show(i) {
      idx = (i + items.length) % items.length;
      var it = items[idx];
      img.src = it.src;
      img.alt = it.alt;
      caption.textContent = it.caption;
      counter.textContent = (idx + 1) + ' / ' + items.length;
    }

    function open(i) {
      show(i);
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      overlay.querySelector('.hda-close').focus();
    }

    function close() {
      overlay.hidden = true;
      document.body.style.overflow = '';
      onClose();
    }

    overlay.querySelector('.hda-close').addEventListener('click', close);
    overlay.querySelector('.hda-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
    overlay.querySelector('.hda-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    document.addEventListener('keydown', function (e) {
      if (overlay.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });

    // Touch swipe navigation
    var startX = null;
    overlay.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });

    return { open: open, close: close };
  }

  function init() {
    var items = collectFigures();
    if (!items.length) return;

    var lastFocus = null;
    var overlay = buildOverlay(items, function () {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });

    items.forEach(function (item, i) {
      item.fig.classList.add('hda-fig');
      var btn = document.createElement('button');
      btn.className = 'hda-expand';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'View figure fullscreen');
      btn.innerHTML = EXPAND_SVG;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        lastFocus = btn;
        overlay.open(i);
      });
      item.fig.appendChild(btn);

      var img = item.fig.querySelector('img');
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () {
        lastFocus = img;
        overlay.open(i);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
