
(() => {
  /* ── 1. OVERLAY ── */
  const overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: '#f4f7fa', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    backgroundImage: 'linear-gradient(#d0d0d0 1px,transparent 1px),linear-gradient(90deg,#d0d0d0 1px,transparent 1px)',
    backgroundSize: '200px 200px'
  });

  /* ── 2. CARTON ── */
  const carton = document.createElement('div');
  Object.assign(carton.style, {
    position: 'relative', width: '180px',
  });

  /* flap (top fold) */
  const flap = document.createElement('div');
  Object.assign(flap.style, {
    width: '180px', height: '38px',
    background: '#1e1b4b',
    clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
    borderRadius: '3px 3px 0 0',
    position: 'relative', zIndex: '2'
  });
  const flapLabel = document.createElement('span');
  Object.assign(flapLabel.style, {
    position: 'absolute', bottom: '6px', left: '0', right: '0',
    textAlign: 'center', fontSize: '9px', letterSpacing: '2px',
    color: '#9795c5', fontFamily: 'Inter, sans-serif', fontWeight: '600',
    textTransform: 'uppercase'
  });
  flapLabel.textContent = 'medication info';
  flap.appendChild(flapLabel);

  /* box body */
  const box = document.createElement('div');
  Object.assign(box.style, {
    width: '180px', height: '220px',
    background: '#1e1b4b',
    borderRadius: '0 0 4px 4px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '10px', position: 'relative', zIndex: '2'
  });

  /* logo text */
  const logo = document.createElement('div');
  Object.assign(logo.style, {
    color: '#ffffff', fontSize: '28px', fontWeight: '800',
    fontFamily: 'Inter, sans-serif', letterSpacing: '1px'
  });
  logo.textContent = 'MEDIXA';

  /* decorative stripe */
  const stripe = document.createElement('div');
  Object.assign(stripe.style, {
    width: '120px', height: '2px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px'
  });

  /* sub-label */
  const sub = document.createElement('div');
  Object.assign(sub.style, {
    color: 'rgba(255,255,255,0.45)', fontSize: '9px',
    fontFamily: 'Inter, sans-serif', letterSpacing: '2.5px',
    textTransform: 'uppercase', fontWeight: '500'
  });
  sub.textContent = 'Rx · about us';

  /* side accent line */
  const sideBar = document.createElement('div');
  Object.assign(sideBar.style, {
    position: 'absolute', left: '14px', top: '16px', bottom: '16px',
    width: '3px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px'
  });

  box.appendChild(sideBar);
  box.appendChild(logo);
  box.appendChild(stripe);
  box.appendChild(sub);

  /* ── 3. PAPER ── */
  const paper = document.createElement('div');
  Object.assign(paper.style, {
    position: 'absolute',
    bottom: '100%',       /* starts tucked inside carton top */
    left: '50%',
    transform: 'translateX(-50%) scaleY(0)',
    transformOrigin: 'bottom center',
    width: '160px',
    height: '260px',
    background: '#f4f7fa',
    border: '1px solid #e5e5e5',
    borderRadius: '2px 2px 0 0',
    zIndex: '1',
    overflow: 'hidden'
  });

  /* paper lines */
  for (let i = 0; i < 7; i++) {
    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'absolute',
      left: '14px', right: '14px',
      top: `${24 + i * 22}px`,
      height: '1px',
      background: i === 0 ? '#1e1b4b33' : '#d0d0d0',
      borderRadius: '1px'
    });
    paper.appendChild(line);
  }

  /* ── 4. PAPER EXPAND COVER ── */
  /* This is the paper that grows to fill the whole screen */
  const paperFull = document.createElement('div');
  Object.assign(paperFull.style, {
    position: 'absolute', inset: '0',
    background: '#f4f7fa',
    transformOrigin: 'center center',
    transform: 'scale(0)',
    zIndex: '10',
    backgroundImage: 'linear-gradient(#d0d0d0 1px,transparent 1px),linear-gradient(90deg,#d0d0d0 1px,transparent 1px)',
    backgroundSize: '200px 200px'
  });

  /* ── ASSEMBLE ── */
  const cartonWrap = document.createElement('div');
  Object.assign(cartonWrap.style, {
    position: 'relative', display: 'flex', flexDirection: 'column'
  });
  cartonWrap.appendChild(paper);
  cartonWrap.appendChild(flap);
  cartonWrap.appendChild(box);
  carton.appendChild(cartonWrap);
  overlay.appendChild(carton);
  overlay.appendChild(paperFull);
  document.body.appendChild(overlay);

  /* ── 5. GSAP TIMELINE ── */
  const tl = gsap.timeline({
    onComplete: () => {
      overlay.remove();
      /* trigger counters after animation */
      document.dispatchEvent(new Event('intro-done'));
    }
  });

  /* carton tilts in */
  tl.from(carton, { y: 60, opacity: 0, duration: 0.5, ease: 'back.out(1.4)' })
    .to(carton, { rotation: -6, duration: 0.4, ease: 'power2.inOut' })

    /* paper slides up out of the box */
    .to(paper, { scaleY: 1, duration: 0.35, ease: 'power2.out' }, '+=0.15')
    .to(paper, { y: '-180px', duration: 0.5, ease: 'power2.inOut' }, '+=0.1')

    /* carton and paper fade, full-screen paper blooms */
    .to([carton], { opacity: 0, duration: 0.25 }, '+=0.15')
    .to(paperFull, { scale: 1, duration: 0.45, ease: 'power3.out' }, '<+0.1')
    .to(overlay, { opacity: 0, duration: 0.3, ease: 'power1.in' }, '+=0.15');
})();