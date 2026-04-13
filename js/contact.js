const faqCards = [...document.querySelectorAll('.faq-card')];
const carousel = document.getElementById('carousel');
const dotsWrap = document.getElementById('dots');
let currentIndex = 0;

faqCards.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.className = `dot ${index === 0 ? 'active' : ''}`;
  dot.addEventListener('click', () => {
    currentIndex = index;
    updateCarousel();
    resetAutoSlide();
  });
  dotsWrap.appendChild(dot);
});

const dots = [...document.querySelectorAll('.dot')];

function getCardWidth() {
  const card = faqCards[0];
  const styles = window.getComputedStyle(carousel);
  const gap = parseFloat(styles.gap) || 0;
  return card.offsetWidth + gap;
}

function updateCarousel() {
  const moveX = getCardWidth() * currentIndex;
  carousel.style.transform = `translateX(calc(-${moveX}px + 33.333% + 13px))`;

  faqCards.forEach((card, index) => {
    card.classList.toggle('active', index === currentIndex);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentIndex);
  });
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % faqCards.length;
  updateCarousel();
}

let autoSlide = setInterval(nextSlide, 3200);

function resetAutoSlide() {
  clearInterval(autoSlide);
  autoSlide = setInterval(nextSlide, 3200);
}

window.addEventListener('resize', updateCarousel);
updateCarousel();

const modal = document.getElementById('contactModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const contactInfoBox = document.getElementById('contactInfoBox');
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

const fields = [
  document.getElementById('firstName'),
  document.getElementById('lastName'),
  document.getElementById('subject'),
  document.getElementById('message')
];

function openModal() {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function updateButtonState() {
  const allFilled = fields.every(field => field.value.trim() !== '');
  submitBtn.classList.toggle('enabled', allFilled);
  submitBtn.disabled = !allFilled;
}

fields.forEach(field => field.addEventListener('input', updateButtonState));
updateButtonState();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!submitBtn.classList.contains('enabled')) return;
  contactInfoBox.classList.add('show');
});