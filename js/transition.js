const panels = document.querySelectorAll(".panel");


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




// document.querySelectorAll("a").forEach(link => {
//   if (link.hostname === window.location.hostname) {
//     link.addEventListener("click", function (e) {
//       e.preventDefault();

//       const href = this.href;

//       gsap.to(panels, {
//         y: "0%",
//         stagger: 0.1,
//         duration: 0.3,
//         onComplete: () => {
//           window.location.href = href;
//         }
//       });
//     });
//   }
// });



document.addEventListener("click", (e) => {

  const link = e.target.closest("a");

  if (!link) return;

  if (link.hostname !== window.location.hostname) return;

  const href = link.href;

  if (
    !href ||
    href.includes("#") ||
    link.target === "_blank"
  ) {
    return;
  }

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