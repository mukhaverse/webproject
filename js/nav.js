// JS/nav.js
// =============================================================
//  Navigation — Sliding Pill + Auth State
//
//  WHAT THIS FILE DOES:
//    1. Animates the sliding pill/highlight under the active nav tab
//       (this was your original nav behaviour, preserved exactly)
//    2. Delegates auth-state rendering to auth.js via updateNavAuth()
//       (auth.js is always loaded before nav.js)
//
//  LOAD ORDER IN HTML:
//    <script src="/JS/auth.js"></script>   ← must be BEFORE nav.js
//    <script src="/JS/nav.js"></script>
//
//  The sliding pill works by absolutely positioning a background
//  div (#tabBg) under whichever tab is currently hovered/active,
//  and animating its position with CSS transitions.
// =============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ── Sliding Tab Highlight ──────────────────────────────────
  //
  //  Get all nav tabs and the background pill element.
  //  The pill moves to sit under whichever tab is active or hovered.

  const tabs     = document.querySelectorAll(".nav-tab");
  const tabBg    = document.getElementById("tabBg");
  const activeTab = document.querySelector(".nav-tab.active");

  // Move the background pill to sit behind `el`
  function movePill(el) {
    if (!tabBg || !el) return;
    tabBg.style.width  = el.offsetWidth  + "px";
    tabBg.style.height = el.offsetHeight + "px";
    tabBg.style.left   = el.offsetLeft   + "px";
    tabBg.style.top    = el.offsetTop    + "px";
  }

  // On page load: position the pill under the active tab immediately
  movePill(activeTab);
  window.addEventListener("resize", () => {
  const currentActive = document.querySelector(".nav-tab.active");
  movePill(currentActive);
  });

  // On hover: slide the pill to the hovered tab
  // On hover out: slide back to the active tab
  tabs.forEach(tab => {
    tab.addEventListener("mouseenter", () => movePill(tab));
    tab.addEventListener("mouseleave", () => movePill(activeTab));
  });

  // ── Auth State Update ──────────────────────────────────────
  //
  //  auth.js defines updateNavAuth() and registers it on DOMContentLoaded.
  //  Since both files register on DOMContentLoaded, both run on page load.
  //  We don't need to call updateNavAuth() here — auth.js handles it.
  //  This comment is just here to document why we don't call it explicitly.

});