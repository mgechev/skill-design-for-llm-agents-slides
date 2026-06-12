(() => {
  'use strict';

  const container = document.getElementById('presentation');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  const progressBar = document.getElementById('progress-bar');
  const progressIndicator = document.getElementById('progress-indicator');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  let current = 0;
  let autoplayTimer = null;

  // ── Scaling ──
  function scale() {
    const sx = window.innerWidth / 720;
    const sy = window.innerHeight / 405;
    container.style.setProperty('--scale', Math.min(sx, sy));
  }
  window.addEventListener('resize', scale);
  scale();

  // ── Navigation ──
  function goTo(idx, forward = true) {
    idx = Math.max(0, Math.min(total - 1, idx));
    if (idx === current) return;

    const transition = () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
        autoplayTimer = null;
      }
      // Reset iframe on navigation away to stop playback and reset state
      const oldSlide = slides[current];
      if (oldSlide) {
        const root = oldSlide.shadowRoot || oldSlide;
        const iframe = root.querySelector('iframe');
        if (iframe) {
          if (iframe._loadListener) {
            iframe.removeEventListener('load', iframe._loadListener);
            iframe._loadListener = null;
          }
          try {
            const src = iframe.getAttribute('src');
            iframe.src = '';
            iframe.src = src;
          } catch (e) {
            console.error('Failed to reset iframe:', e);
          }
        }
      }
      slides[current].classList.remove('active');
      current = idx;
      slides[current].classList.add('active');
      updateHUD();
      if (slides[idx] && (slides[idx].id === 'slide-38' || slides[idx].id === 'slide-39')) {
        const slideId = slides[idx].id;
        const targetSlide = document.getElementById(slideId);
        const iframe = (targetSlide.shadowRoot || targetSlide).querySelector('iframe');
        if (iframe) {
          if (iframe._loadListener) {
            iframe.removeEventListener('load', iframe._loadListener);
          }
          const triggerStart = () => {
            autoplayTimer = setTimeout(() => {
              iframe.contentWindow.postMessage({ start: true }, '*');
            }, 2000);
          };
          iframe._loadListener = triggerStart;
          try {
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
              triggerStart();
            } else {
              iframe.addEventListener('load', triggerStart, { once: true });
            }
          } catch (err) {
            triggerStart();
          }
        }
      }
    };

    if (document.startViewTransition) {
      try {
        const t = document.startViewTransition(transition);
        if (t.ready) t.ready.catch(() => {});
        if (t.updateCallbackDone) t.updateCallbackDone.catch(() => {});
        t.finished.then(() => {
          location.hash = current + 1;
        }).catch(() => {
          location.hash = current + 1;
        });
      } catch (err) {
        transition();
        location.hash = current + 1;
      }
    } else {
      transition();
      location.hash = current + 1;
    }
  }

  function next() { goTo(current + 1, true); }
  function prev() { goTo(current - 1, false); }

  function updateHUD() {
    progressIndicator.textContent = `${current + 1} / ${total}`;
    progressBar.style.width = `${((current + 1) / total) * 100}%`;
  }

  // ── Keyboard ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault(); next();
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
      e.preventDefault(); prev();
    } else if (e.key === 'Home') {
      e.preventDefault(); goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault(); goTo(total - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  });

  // ── Touch ──
  let touchX = 0;
  document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  // ── Click ──
  container.addEventListener('click', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (x > 0.5) next(); else prev();
  });

  // ── HUD buttons ──
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  fullscreenBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(); });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // ── Hash-based navigation ──
  function readHash() {
    const m = location.hash.match(/^#(\d+)$/);
    if (m) {
      const idx = parseInt(m[1], 10) - 1;
      if (idx >= 0 && idx < total && idx !== current) {
        goTo(idx);
      }
    }
  }
  window.addEventListener('hashchange', readHash);

  // Initialize
  if (location.search.includes('clean=true')) {
    const style = document.createElement('style');
    style.innerHTML = '.presentation-hud, .timeline-bar { display: none !important; }';
    document.head.appendChild(style);
  }
  readHash();
  updateHUD();
})();
