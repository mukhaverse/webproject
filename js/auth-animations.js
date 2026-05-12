document.addEventListener("DOMContentLoaded", () => {

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  /*  fade + slide up  */
  function reveal(targets, options = {}) {
    const defaults = {
      y: 40,
      opacity: 0,
      duration: 0.75,
      ease: "power2.out",
      stagger: 0.12,
    };
    const cfg = { ...defaults, ...options };

    gsap.set(targets, { y: cfg.y, opacity: 0 });

    ScrollTrigger.create({
      trigger: targets[0] || targets,
      // Changed from "top 75%" → "top 88%" so the element is
      // well into the viewport before the animation fires.
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration: cfg.duration,
          ease: cfg.ease,
          stagger: cfg.stagger,
        });
      }
    });
  }


  /* Steps */
  const stepsHeader = document.querySelector(".steps-header");
  const stepItems   = document.querySelectorAll(".step-item");
  const stepsVisual = document.querySelector(".steps-visual");

  if (stepsHeader) reveal([stepsHeader], { y: 30, stagger: 0 });
  if (stepsVisual) reveal([stepsVisual], { y: 50, duration: 0.9, stagger: 0 });
  if (stepItems.length) reveal(stepItems, { y: 35, stagger: 0.15 });


  /* Benefits */
  const benefitsLeft  = document.querySelector(".benefits-left");
  const benefitCards  = document.querySelectorAll(".benefit-card");

  if (benefitsLeft) reveal([benefitsLeft], { y: 30, stagger: 0 });

  if (benefitCards.length) {
    gsap.set(benefitCards, { y: 50, opacity: 0, scale: 0.96 });

    ScrollTrigger.create({
      trigger: ".benefits-grid",
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(benefitCards, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          ease: "power2.out",
          stagger: 0.1,
        });
      }
    });
  }


  /* Testimonials */
  const testimonialLeft  = document.querySelector(".testimonials .left");
  const testimonialRight = document.querySelector(".testimonials .right");

  if (testimonialLeft) {
    gsap.set(testimonialLeft, { x: -40, opacity: 0 });
    ScrollTrigger.create({
      trigger: ".testimonials",
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(testimonialLeft, {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        });
      }
    });
  }

  if (testimonialRight) {
    gsap.set(testimonialRight, { x: 40, opacity: 0 });
    ScrollTrigger.create({
      trigger: ".testimonials",
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(testimonialRight, {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.1,
        });
      }
    });
  }

});