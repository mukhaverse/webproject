

document.addEventListener("DOMContentLoaded", () => {



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


  

});