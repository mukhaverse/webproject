const tabs = document.querySelectorAll('.nav-tab');
  const bg   = document.getElementById('tabBg');
  const container = document.getElementById('navTabs');


  function moveIndicator(tab) {
    const cRect = container.getBoundingClientRect();
    const tRect = tab.getBoundingClientRect();
    bg.style.left  = (tRect.left - cRect.left - 4) + 'px';
    bg.style.width = tRect.width + 'px';
  }


  window.addEventListener('load', () => {
    const active = container.querySelector('.active');
    if (active) moveIndicator(active);
  });

  
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      moveIndicator(tab);
    });
  });