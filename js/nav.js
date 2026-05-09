/* nav.js — desktop tab indicator + mobile full-screen sidebar */

document.addEventListener("DOMContentLoaded", () => {


  
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



  





  const hamburger = document.getElementById("navHamburger");
  if (!hamburger) return;



  const menu = document.createElement("div");
  menu.id = "mobileMenu";
  menu.innerHTML = `
    <div class="mm-panel">
      <div class="mm-top">
        <img src="../assets/medixa.svg" alt="Medixa" class="mm-logo">
        <button class="mm-close" id="mmClose">×</button>
      </div>
      <nav class="mm-links">
        <a href="../index.html" class="mm-link">Home</a>
        <a href="html/interactionCheck.html" class="mm-link">Check Interactions</a>
        <a href="html/about.html" class="mm-link">About Us</a>
        <a href="html/contact.html" class="mm-link">Contact Us</a>
      </nav>
      <div class="mm-bottom">
        <a href="#" class="mm-signin">Sign In</a>
      </div>
    </div>
  `;
  document.body.appendChild(menu);

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