const panels = document.querySelectorAll(".panel");

// splash (on load)
window.addEventListener("load", () => {
  gsap.to(panels, {
    y: "0%",
    stagger: 0.1,
    duration: 0.5,
  });

  gsap.to(panels, {
    y: "-100%",
    stagger: 0.1,
    delay: 0.5,
    duration: 0.5,
  });
});

// page transition
document.querySelectorAll("a").forEach(link => {
  if (link.hostname === window.location.hostname) {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const href = this.href;

      gsap.to(panels, {
        y: "0%",
        stagger: 0.1,
        duration: 0.5,
        onComplete: () => {
          window.location.href = href;
        }
      });
    });
  }
});