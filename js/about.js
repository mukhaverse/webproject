// ================= CARDS =================
const cards = [...document.querySelectorAll('.feature-card')];
let activeIndex = 0;

function positionCards() {
  cards.forEach((card, index) => {
    const offset = (index - activeIndex + cards.length) % cards.length;

    if (offset === 0) {
      card.style.transform = 'translate3d(0, 0, 120px)';
      card.style.opacity = '1';
      card.style.zIndex = '3';
    } 
    else if (offset === 1) {
      card.style.transform = 'translate3d(42px, -26px, 40px)';
      card.style.opacity = '0.9';
      card.style.zIndex = '2';
    } 
    else {
      card.style.transform = 'translate3d(82px, 16px, -40px)';
      card.style.opacity = '0.8';
      card.style.zIndex = '1';
    }
  });
}

positionCards();

setInterval(() => {
  activeIndex = (activeIndex + 1) % cards.length;
  positionCards();
}, 2600);


// ================= SCROLL ANIMATION =================
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.2 });

revealEls.forEach(el => observer.observe(el));