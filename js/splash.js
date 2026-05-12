/**
 * splash.js
 *
 * Drop this BEFORE transition.js and 3d.js in your <script> tags.
 * Exposes:
 *   window.splashProgress(0–1)  → called from 3d.js loader progress
 *   window.splashDismiss()      → called from 3d.js loader onLoad
 *
 * Fires a custom event "splashDone" on window when fully gone,
 * which transition.js listens for instead of "load".
 */

(function () {

  // Flag so transition.js knows not to run its entry animation yet
  window.__splashDone = false;

  const CIRCUMFERENCE = 2 * Math.PI * 96;

  // ── Build splash DOM ──────────────────────────────────────────────

  const splash = document.createElement('div');
  splash.id = 'splash';
  splash.innerHTML = `
    <div class="splash-panel"></div>
    <div class="splash-panel"></div>
    <div class="splash-panel"></div>
    <div class="splash-panel"></div>

    <div class="splash-ring-wrap">
      <svg class="splash-ring-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle class="splash-ring-track" cx="100" cy="100" r="96"/>
        <circle class="splash-ring-fill" cx="100" cy="100" r="96" id="splashRingFill"/>
      </svg>
      <img class="splash-logo" src="assets/medixa.svg" alt="Medixa">
    </div>

    <p class="splash-slogan">Don't guess. Check.</p>
  `;
  document.body.prepend(splash);

  const ringWrap = splash.querySelector('.splash-ring-wrap');
  const slogan   = splash.querySelector('.splash-slogan');
  const ringFill = splash.querySelector('#splashRingFill');
  const panels   = splash.querySelectorAll('.splash-panel');


  // ── Animate logo + slogan in on load ─────────────────────────────

  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      ringWrap.classList.add('visible');
      slogan.classList.add('visible');
    });
  });


  // ── Progress hook (called from 3d.js) ────────────────────────────

  let dismissed = false;

  window.splashProgress = function (ratio) {
    if (dismissed) return;
    const clamped = Math.min(ratio, 0.92);
    const offset = CIRCUMFERENCE * (1 - clamped);
    ringFill.style.strokeDashoffset = offset;
  };


  // ── Dismiss (called from 3d.js onLoad) ───────────────────────────

  window.splashDismiss = function () {
    if (dismissed) return;
    dismissed = true;

    // Complete the ring
    ringFill.style.strokeDashoffset = 0;

    setTimeout(() => {
      exitSplash();
    }, 400);
  };


  // ── Exit: splash panels stagger up, then fire splashDone ─────────

  function exitSplash() {

    // Fade out logo & slogan
    ringWrap.style.transition = 'opacity 0.3s ease';
    ringWrap.style.opacity = '0';
    slogan.style.transition = 'opacity 0.3s ease';
    slogan.style.opacity = '0';

    // Stagger splash panels upward
    panels.forEach((panel, i) => {
      setTimeout(() => {
        panel.style.transition = 'transform 0.55s cubic-bezier(0.76, 0, 0.24, 1)';
        panel.style.transform = 'translateY(-100%)';
      }, i * 90);
    });

    // After all splash panels are gone, remove splash and hand off to transition.js
    const total = (panels.length - 1) * 90 + 550 + 100;
    setTimeout(() => {
      splash.remove();
      window.__splashDone = true;
      window.dispatchEvent(new Event('splashDone'));
    }, total);
  }


  // ── Safety fallback: dismiss after 8s if 3d.js never fires ───────

  const fallbackTimer = setTimeout(() => {
    if (!dismissed) window.splashDismiss();
  }, 8000);

  const _dismiss = window.splashDismiss;
  window.splashDismiss = function () {
    clearTimeout(fallbackTimer);
    _dismiss();
  };

})();