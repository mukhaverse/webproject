const panels = document.querySelectorAll(".panel");


// ── Page entry animation ──────────────────────────────────────────
// Waits for splashDone instead of "load" so it never fights the splash.
// If there's no splash (e.g. other pages), falls back to load.

function runEntryAnimation() {
  gsap.fromTo(panels,
    { y: "0%" },
    {
      y: "-100%",
      stagger: 0.1,
      duration: 0.5,
      ease: "power2.inOut"
    }
  );
}

if (window.__splashDone) {
  // Splash already finished before this script ran (unlikely but safe)
  runEntryAnimation();
} else {
  window.addEventListener('splashDone', runEntryAnimation, { once: true });
}


// ── Page-to-page transition ───────────────────────────────────────

document.addEventListener("click", (e) => {

  const link = e.target.closest("a");

  if (!link) return;
  if (link.hostname !== window.location.hostname) return;

  const href = link.href;
  if (!href || href.includes("#") || link.target === "_blank") return;

  e.preventDefault();

  gsap.to(panels, {
    y: "0%",
    stagger: 0.1,
    duration: 0.3,
    onComplete: () => {
      window.location.href = href;
    }
  });

});