document.addEventListener("DOMContentLoaded", () => {

  const user = (typeof Auth !== "undefined") ? Auth.getUser() : null;

  // ── Determine path prefix based on current location ──
  const inHtmlFolder = window.location.pathname.includes("/html/");
  const prefix = inHtmlFolder ? "" : "../html/";
  const rootPrefix = inHtmlFolder ? "../" : "";

  // ─────────────────────────────────────────────
  // Dynamic Tabs
  // ─────────────────────────────────────────────
  if (user) {

    // ── USER TABS ──
    if (user.role === "user") {

      const extraTabs = [
        {
          text: "Ask Pharmacist",
          page: "ask-pharmacist",
          href: `${prefix}ask-pharmacist.html`
        },
        {
          text: "Profile",
          page: "profile",
          href: `${prefix}profile.html`
        }
      ];

      // Desktop tabs
      const navTabs = document.getElementById("navTabs");

      extraTabs.forEach(tab => {

        if (navTabs && !navTabs.querySelector(`[data-page="${tab.page}"]`)) {

          const newTab = document.createElement("a");

          newTab.href = tab.href;
          newTab.className = "nav-tab";
          newTab.dataset.page = tab.page;
          newTab.textContent = tab.text;

          navTabs.appendChild(newTab);
        }
      });

      // Mobile/sidebar tabs
      const sidebarTabs = document.getElementById("navSidebarTabs");

      extraTabs.forEach(tab => {

        if (sidebarTabs && !sidebarTabs.querySelector(`[data-page="${tab.page}"]`)) {

          const newTab = document.createElement("a");

          newTab.href = tab.href;
          newTab.className = "nav-tab";
          newTab.dataset.page = tab.page;
          newTab.textContent = tab.text;

          sidebarTabs.appendChild(newTab);
        }
      });
    }

    // ── ADMIN TABS ──
    if (user.role === "admin") {

      const adminTabs = [
        {
          text: "Chat Management",
          page: "chat-management",
          href: `${prefix}chatManagement.html`
        }
      ];

      // Desktop tabs
      const navTabs = document.getElementById("navTabs");

      adminTabs.forEach(tab => {

        if (navTabs && !navTabs.querySelector(`[data-page="${tab.page}"]`)) {

          const newTab = document.createElement("a");

          newTab.href = tab.href;
          newTab.className = "nav-tab";
          newTab.dataset.page = tab.page;
          newTab.textContent = tab.text;

          navTabs.appendChild(newTab);
        }
      });

      // Mobile/sidebar tabs
      const sidebarTabs = document.getElementById("navSidebarTabs");

      adminTabs.forEach(tab => {

        if (sidebarTabs && !sidebarTabs.querySelector(`[data-page="${tab.page}"]`)) {

          const newTab = document.createElement("a");

          newTab.href = tab.href;
          newTab.className = "nav-tab";
          newTab.dataset.page = tab.page;
          newTab.textContent = tab.text;

          sidebarTabs.appendChild(newTab);
        }
      });
    }
  }




  
  // ─────────────────────────────────────────────
  // Replace Sign In with User Name
  // ─────────────────────────────────────────────
  const signinBtn = document.querySelector(".nav-signin");

  if (signinBtn) {

    if (user) {

      signinBtn.textContent = user.name.split(" ")[0];
      signinBtn.href = "#";

      signinBtn.addEventListener("click", (e) => {

        e.preventDefault();

        const panels = document.querySelectorAll(".panel");

        if (typeof gsap !== "undefined" && panels.length) {

          gsap.to(panels, {
            y: "0%",
            stagger: 0.1,
            duration: 0.3,
            onComplete: () => Auth.logout()
          });

        } else {
          Auth.logout();
        }
      });

    } else {

      signinBtn.textContent = "Sign In";
      signinBtn.href = `${prefix}login.html`;
    }
  }





  // ─────────────────────────────────────────────
  // Desktop Sliding Tab Background
  // ─────────────────────────────────────────────
  const tabBg = document.getElementById("tabBg");

  // IMPORTANT:
  // Select tabs AFTER adding dynamic tabs
  const tabs = document.querySelectorAll(".nav-tabs .nav-tab");

  const active = document.querySelector(".nav-tabs .nav-tab.active");

  function moveTabBg(el) {

    if (!tabBg || !el) return;

    tabBg.style.left = el.offsetLeft + "px";
    tabBg.style.width = el.offsetWidth + "px";
    tabBg.style.opacity = "1";
  }

  if (active) moveTabBg(active);

  tabs.forEach(tab => {

    tab.addEventListener("mouseenter", () => moveTabBg(tab));

    tab.addEventListener("mouseleave", () => {
      if (active) moveTabBg(active);
    });
  });





  const hamburger = document.getElementById("navHamburger");

  if (!hamburger) return;

  // USER LINKS
  const pharmacistLink = user && user.role === "user"
    ? `<a href="${prefix}askPharmacist.html" class="mm-link">Ask Pharmacist</a>`
    : "";

  const userProfileLink = user && user.role === "user"
    ? `<a href="${prefix}profile.html" class="mm-link">Profile</a>`
    : "";

  // ADMIN LINKS
  const adminLinks = user && user.role === "admin"
    ? `
      <a href="${prefix}chat-management.html" class="mm-link">Chat Management</a>
      <a href="${prefix}drug-mappings.html" class="mm-link">Admin Panel</a>
    `
    : "";

  // Sign-in / user name
  let signinLabel;
  let signinHref;
  let isLoggedIn;

  if (user) {

    signinLabel = user.name.split(" ")[0];
    signinHref = "#";
    isLoggedIn = true;

  } else {

    signinLabel = "Sign In";
    signinHref = `${prefix}login.html`;
    isLoggedIn = false;
  }





  // Create menu
  const menu = document.createElement("div");

  menu.id = "mobileMenu";

  menu.innerHTML = `
    <div class="mm-panel">

      <div class="mm-top">
        <img src="${rootPrefix}assets/medixa.svg" alt="Medixa" class="mm-logo">
        <button class="mm-close" id="mmClose">×</button>
      </div>

      <nav class="mm-links">
        <a href="/${rootPrefix}index.html" class="mm-link">Home</a>
        <a href="${prefix}interactionCheck.html" class="mm-link">Check Interactions</a>
        <a href="${prefix}about.html" class="mm-link">About Us</a>
        <a href="${prefix}contact.html" class="mm-link">Contact Us</a>

        ${pharmacistLink}
        ${userProfileLink}
        ${adminLinks}
      </nav>

      <div class="mm-bottom">
        <a href="${signinHref}" class="mm-signin" id="mmSignin">
          ${signinLabel}
        </a>
      </div>

    </div>
  `;

  document.body.appendChild(menu);






  if (isLoggedIn) {

    const mmSignin = menu.querySelector("#mmSignin");

    mmSignin.addEventListener("click", (e) => {

      e.preventDefault();

      const panels = document.querySelectorAll(".panel");

      if (typeof gsap !== "undefined" && panels.length) {

        gsap.to(panels, {
          y: "0%",
          stagger: 0.1,
          duration: 0.3,
          onComplete: () => Auth.logout()
        });

      } else {
        Auth.logout();
      }
    });
  }





  const panel = menu.querySelector(".mm-panel");
  const closeBtn = menu.querySelector("#mmClose");
  const links = menu.querySelectorAll(".mm-link, .mm-signin");

  let isOpen = false;

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

        gsap.fromTo(
          links,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.07,
            duration: 0.35,
            ease: "power2.out"
          }
        );
      }
    });
  }

  function closeMenu() {

    if (!isOpen) return;

    gsap.to(links, {
      y: -16,
      opacity: 0,
      stagger: 0.04,
      duration: 0.2,
      ease: "power2.in",

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

  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {
      closeMenu();
    }
  });

});