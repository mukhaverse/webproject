document.addEventListener("DOMContentLoaded", () => {

  const user = (typeof Auth !== "undefined") ? Auth.getUser() : null;

  // ── Determine path prefix based on current location ──
  const inHtmlFolder = window.location.pathname.includes("/html/");
  const prefix = inHtmlFolder ? "" : "html/";
  const rootPrefix = inHtmlFolder ? "../" : "";

  if (user && user.role === "user") {
    
    const navTabs = document.getElementById("navTabs");
    if (navTabs && !navTabs.querySelector('[data-page="profile"]')) {
      const profileTab = document.createElement("a");
      profileTab.href = `${prefix}profile.html`;
      profileTab.className = "nav-tab";
      profileTab.dataset.page = "profile";
      profileTab.textContent = "Profile";
      navTabs.appendChild(profileTab);
    }

    const sidebarTabs = document.getElementById("navSidebarTabs");
    if (sidebarTabs && !sidebarTabs.querySelector('[data-page="profile"]')) {
      const profileSideTab = document.createElement("a");
      profileSideTab.href = `${prefix}profile.html`;
      profileSideTab.className = "nav-tab";
      profileSideTab.dataset.page = "profile";
      profileSideTab.textContent = "Profile";
      sidebarTabs.appendChild(profileSideTab);
    }
  }

  // ── Desktop tab sliding background ──
  const tabBg  = document.getElementById("tabBg");
  const tabs   = document.querySelectorAll(".nav-tabs .nav-tab");
  const active = document.querySelector(".nav-tabs .nav-tab.active");

  function moveTabBg(el) {
    if (!tabBg || !el) return;
    tabBg.style.left    = el.offsetLeft + "px";
    tabBg.style.width   = el.offsetWidth + "px";
    tabBg.style.opacity = "1";
  }

  if (active) moveTabBg(active);
  tabs.forEach(tab => {
    tab.addEventListener("mouseenter", () => moveTabBg(tab));
    tab.addEventListener("mouseleave", () => active && moveTabBg(active));
  });

  // ── Mobile menu ──
  const hamburger = document.getElementById("navHamburger");
  if (!hamburger) return;

  // Build correct links based on folder depth
  const profileLink = user && user.role === "user"
    ? `<a href="${prefix}profile.html" class="mm-link">Profile</a>`
    : "";

  // Determine sign-in label and href
  let signinLabel, signinHref, isLoggedIn;
  if (user) {
    signinLabel = user.name.split(" ")[0];
    signinHref  = "#";
    isLoggedIn  = true;
  } else {
    signinLabel = "Sign In";
    signinHref  = `${prefix}login.html`;
    isLoggedIn  = false;
  }

  const menu = document.createElement("div");
  menu.id = "mobileMenu";
  menu.innerHTML = `
    <div class="mm-panel">
      <div class="mm-top">
        <img src="${rootPrefix}assets/medixa.svg" alt="Medixa" class="mm-logo">
        <button class="mm-close" id="mmClose">×</button>
      </div>
      <nav class="mm-links">
        <a href="${rootPrefix}index.html" class="mm-link">Home</a>
        <a href="${prefix}interactionCheck.html" class="mm-link">Check Interactions</a>
        <a href="${prefix}about.html" class="mm-link">About Us</a>
        <a href="${prefix}contact.html" class="mm-link">Contact Us</a>
        ${profileLink}
      </nav>
      <div class="mm-bottom">
        <a href="${signinHref}" class="mm-signin" id="mmSignin">${signinLabel}</a>
      </div>
    </div>
  `;
  document.body.appendChild(menu);

  // Wire up logout for logged-in users
  if (isLoggedIn) {
    const mmSignin = menu.querySelector("#mmSignin");
    mmSignin.addEventListener("click", (e) => {
      e.preventDefault();
      const panels = document.querySelectorAll(".panel");
      if (typeof gsap !== "undefined" && panels.length) {
        gsap.to(panels, {
          y: "0%", stagger: 0.1, duration: 0.3,
          onComplete: () => Auth.logout()
        });
      } else {
        Auth.logout();
      }
    });
  }

  const panel    = menu.querySelector(".mm-panel");
  const closeBtn = menu.querySelector("#mmClose");
  const links    = menu.querySelectorAll(".mm-link, .mm-signin");
  let isOpen     = false;

  gsap.set(panel, { y: "100%" });

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    hamburger.classList.add("is-open");
    menu.classList.add("active");

    gsap.to(panel, {
      y: "0%",
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.fromTo(links,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.35, ease: "power2.out" }
        );
      }
    });
  }

  function closeMenu() {
    if (!isOpen) return;

    gsap.to(links, {
      y: -16, opacity: 0,
      stagger: 0.04, duration: 0.2, ease: "power2.in",
      onComplete: () => {
        gsap.to(panel, {
          y: "100%",
          duration: 0.45,
          ease: "power3.inOut",
          onComplete: () => {
            menu.classList.remove("active");
            isOpen = false;
            hamburger.classList.remove("is-open");
          }
        });
      }
    });
  }

  hamburger.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  document.addEventListener("keydown", e => e.key === "Escape" && closeMenu());
});