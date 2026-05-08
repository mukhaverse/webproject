document.addEventListener("DOMContentLoaded", () => {

  // ── Desktop pill animation ──
  const tabs      = document.querySelectorAll(".nav-tabs .nav-tab");
  const tabBg     = document.getElementById("tabBg");
  const activeTab = document.querySelector(".nav-tabs .nav-tab.active");

  function movePill(el) {
    if (!tabBg || !el) return;
    tabBg.style.width  = el.offsetWidth  + "px";
    tabBg.style.height = el.offsetHeight + "px";
    tabBg.style.left   = el.offsetLeft   + "px";
    tabBg.style.top    = el.offsetTop    + "px";
  }

  movePill(activeTab);

  window.addEventListener("resize", () => {
    const currentActive = document.querySelector(".nav-tabs .nav-tab.active");
    movePill(currentActive);
  });

  tabs.forEach(tab => {
    tab.addEventListener("mouseenter", () => movePill(tab));
    tab.addEventListener("mouseleave", () => {
      const currentActive = document.querySelector(".nav-tabs .nav-tab.active");
      movePill(currentActive);
    });
  });

  // ── Hamburger / Sidebar ──
  const hamburger = document.getElementById("navHamburger");
  const sidebar   = document.getElementById("navSidebar");
  const overlay   = document.getElementById("navSidebarOverlay");
  const closeBtn  = document.getElementById("navSidebarClose");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("visible");
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const isOpen = sidebar.classList.contains("open");
      isOpen ? closeSidebar() : openSidebar();
    });
  }

  if (closeBtn)  closeBtn.addEventListener("click", closeSidebar);
  if (overlay)   overlay.addEventListener("click", closeSidebar);

  // Close sidebar on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  // Close sidebar when a sidebar tab link is clicked
  if (sidebar) {
    sidebar.querySelectorAll(".nav-tab").forEach(tab => {
      tab.addEventListener("click", closeSidebar);
    });
  }

});