const emailButton = document.getElementById('copyEmailBtn');
const contactForm = document.getElementById('contactForm');
const sendBtn = document.getElementById('sendBtn');

function restartFormAnimation() {
  const icon = document.querySelector('.mail-icon-wrap');
  const title = document.querySelector('.form-title');
  const subtitle = document.querySelector('.form-subtitle');

  if (!icon || !title || !subtitle) return;

  icon.style.animation = 'none';
  title.style.animation = 'none';
  subtitle.style.animation = 'none';

  void icon.offsetWidth;

  icon.style.animation = 'slideIcon 0.8s ease forwards';
  title.style.animation = 'fadeInText 0.45s ease forwards 0.45s';
  subtitle.style.animation = 'fadeUp 0.45s ease forwards 0.9s';
}

setInterval(restartFormAnimation, 10000);

const formFields = [
  document.getElementById('firstName'),
  document.getElementById('lastName'),
  document.getElementById('subject'),
  document.getElementById('message')
];

emailButton.addEventListener('click', async () => {
  const email = 'Medixainquiry@gmail.com';

  try {
    await navigator.clipboard.writeText(email);
    } 
  catch (error) {
    console.error('Failed to copy email:', error);
  }
});

function checkFormCompletion() {
  const allFilled = formFields.every((field) => field.value.trim() !== '');

  sendBtn.disabled = !allFilled;
  sendBtn.classList.toggle('enabled', allFilled);
}

formFields.forEach((field) => {
  field.addEventListener('input', checkFormCompletion);
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const allFilled = formFields.every((field) => field.value.trim() !== '');
  if (!allFilled) return;

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  const emailBody = `First Name: ${firstName}\nLast Name: ${lastName}\n\nMessage:\n${message}`;
  const mailtoLink = `mailto:Medixainquiry@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

  window.location.href = mailtoLink;
});

const faqSlides = document.querySelectorAll('.faq-slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentSlide = 0;
let autoSlide;

function showSlide(index) {
  faqSlides.forEach((slide) => slide.classList.remove('active'));
  dots.forEach((dot) => dot.classList.remove('active'));

  faqSlides[index].classList.add('active');
  dots[index].classList.add('active');
  currentSlide = index;
}

function nextSlide() {
  const nextIndex = (currentSlide + 1) % faqSlides.length;
  showSlide(nextIndex);
}

function prevSlide() {
  const prevIndex = (currentSlide - 1 + faqSlides.length) % faqSlides.length;
  showSlide(prevIndex);
}

function startAutoSlide() {
  autoSlide = setInterval(() => {
    nextSlide();
  }, 5000);
}

function resetAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}

nextBtn.addEventListener('click', () => {
  nextSlide();
  resetAutoSlide();
});

prevBtn.addEventListener('click', () => {
  prevSlide();
  resetAutoSlide();
});

dots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const slideIndex = Number(dot.dataset.index);
    showSlide(slideIndex);
    resetAutoSlide();
  });
});

showSlide(0);
startAutoSlide();
checkFormCompletion();
