function runCounters() {
  const counters = document.querySelectorAll('.counter');

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    let current = 0;

    const duration = 900;
    const stepTime = 10;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current);
        setTimeout(updateCounter, stepTime);
      } else {
        counter.textContent = target;
      }
    };

    setTimeout(updateCounter, 300);
  });
}



document.addEventListener('intro-done', runCounters, { once: true });
setTimeout(() => {
  if (document.querySelector('.counter').textContent === '0') runCounters();
}, 4000);