(() => {

  const overlay = document.createElement('div');
  overlay.id = 'intro-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: '#f4f7fa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    backgroundImage: 'linear-gradient(#d0d0d0 1px,transparent 1px),linear-gradient(90deg,#d0d0d0 1px,transparent 1px)',
    backgroundSize: '200px 200px'
  });


  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const finalW = Math.min(vw * 0.72, 980);
  const finalH = Math.min(vh * 0.82, 680);


  
  const finalOffsetY = vh * 0.45;


  
  const paperW = 300;
  const paperH = 130;



  const paper = document.createElement('div');
  Object.assign(paper.style, {
    position: 'fixed',
    top: '50%', left: '50%',
    width: paperW + 'px',
    height: paperH + 'px',
    marginTop: -(paperH / 2) + 'px',
    marginLeft: -(paperW / 2) + 'px',
    background: '#f4f7fa',
    border: '1px solid #d0d0d0',
    borderRadius: '2px',
    zIndex: '10001',
    overflow: 'hidden',
    opacity: '0'
  });


  

  ['25%', '50%', '75%'].forEach(pos => {
    const crease = document.createElement('div');
    Object.assign(crease.style, {
      position: 'absolute', top: '0', bottom: '0',
      left: pos, width: '1px', background: 'rgba(0,0,0,0.06)'
    });
    paper.appendChild(crease);
  });


  

  [
    { top: '16px', width: '45%', height: '2px', bg: '#1e1b4b' },
    { top: '24px', width: '28%', height: '1px', bg: '#c0c0c0' },
    { top: '38px', width: '75%', height: '1px', bg: '#e0e0e0' },
    { top: '46px', width: '65%', height: '1px', bg: '#e0e0e0' },
    { top: '54px', width: '70%', height: '1px', bg: '#e0e0e0' },
    { top: '68px', width: '38%', height: '2px', bg: '#c8c8c8' },
    { top: '80px', width: '80%', height: '1px', bg: '#e0e0e0' },
    { top: '88px', width: '55%', height: '1px', bg: '#e0e0e0' },
    { top: '104px', width: '42%', height: '1px', bg: '#e0e0e0' },
    { top: '112px', width: '60%', height: '1px', bg: '#e0e0e0' },
  ].forEach(s => {
    const l = document.createElement('div');
    Object.assign(l.style, {
      position: 'absolute', left: '16px',
      top: s.top, width: s.width, height: s.height,
      background: s.bg, borderRadius: '1px'
    });
    paper.appendChild(l);
  });


  
  const foldCanvas = document.createElement('canvas');
  const foldSize = 52;
  foldCanvas.width = foldSize;
  foldCanvas.height = foldSize;
  Object.assign(foldCanvas.style, {
    position: 'absolute', top: '0', right: '0',
    width: foldSize + 'px', height: foldSize + 'px',
    zIndex: '6', pointerEvents: 'none'
  });
  paper.appendChild(foldCanvas);
  const foldCtx = foldCanvas.getContext('2d');

  function drawFold(progress) {
    foldCtx.clearRect(0, 0, foldSize, foldSize);
    const s = foldSize * progress;
    const inset = 3 * progress;
    foldCtx.beginPath();
    foldCtx.moveTo(foldSize, 0);
    foldCtx.lineTo(foldSize, s);
    foldCtx.lineTo(foldSize - s, 0);
    foldCtx.closePath();
    foldCtx.fillStyle = '#a0a0a0';
    foldCtx.fill();
    foldCtx.beginPath();
    foldCtx.moveTo(foldSize, 0);
    foldCtx.lineTo(foldSize, s - inset);
    foldCtx.lineTo(foldSize - s + inset, 0);
    foldCtx.closePath();
    foldCtx.fillStyle = '#e4e4e4';
    foldCtx.fill();
  }
  drawFold(0);


  




  const scene = document.createElement('div');
  Object.assign(scene.style, {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '10003',
  });


  

  const boxWrap = document.createElement('div');
  Object.assign(boxWrap.style, {
    position: 'relative',
    width: '420px',
    height: '162px',
    /* shift the whole thing slightly so side/bottom faces are visible */
    marginRight: '-14px',
    marginBottom: '-10px',
  });


  
  const sideFace = document.createElement('div');
  Object.assign(sideFace.style, {
    position: 'absolute',
    top: '6px', left: '420px',      /* attached to right edge of front */
    width: '14px',
    height: '162px',
    background: '#c8ccd6',          /* darker than front white */
    transformOrigin: 'left top',
    transform: 'skewY(-8deg)',
    borderRadius: '0 3px 0 0',
  });

  

  const bottomFace = document.createElement('div');
  Object.assign(bottomFace.style, {
    position: 'absolute',
    top: '162px', left: '6px',
    width: '420px',
    height: '10px',
    background: '#b0b4be',
    transformOrigin: 'left top',
    transform: 'skewX(-8deg)',
    borderRadius: '0 0 3px 0',
  });


  
  const carton = document.createElement('div');
  Object.assign(carton.style, {
    position: 'absolute',
    top: '0', left: '0',
    width: '420px', height: '162px',
    background: '#ffffff',
    border: '1.5px solid #d8d8d8',
    borderRadius: '5px',
    overflow: 'hidden',
    boxShadow: '2px 2px 0 #d0d3db',
  });


  
  const band = document.createElement('div');
  Object.assign(band.style, {
    position: 'absolute', top: '0', left: '0', right: '0',
    height: '46px', background: '#1e1b4b',
    display: 'flex', alignItems: 'center',
    padding: '0 20px', gap: '8px'
  });

  [
    ['Rx', '#9795c5', '700', '13px', '0.5px'],
    ['·', 'rgba(255,255,255,0.2)', '400', '13px', '0'],
    ['medication info', 'rgba(255,255,255,0.45)', '500', '10px', '2px']
  ].forEach(([text, color, weight, size, spacing]) => {
    const el = document.createElement('span');
    Object.assign(el.style, {
      color, fontWeight: weight, fontSize: size,
      letterSpacing: spacing, textTransform: 'uppercase',
      fontFamily: 'Inter, sans-serif'
    });
    el.textContent = text;
    band.appendChild(el);
  });


  
  const bandSide = document.createElement('div');
  Object.assign(bandSide.style, {
    position: 'absolute',
    top: '0', right: '-14px',
    width: '14px', height: '46px',
    background: '#141236',
    transformOrigin: 'left top',
    transform: 'skewY(-8deg)',
    zIndex: '1'
  });

  const body = document.createElement('div');
  Object.assign(body.style, {
    position: 'absolute', top: '46px', left: '0', right: '32px', bottom: '0',
    padding: '14px 20px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px'
  });

  const brandName = document.createElement('div');
  Object.assign(brandName.style, {
    fontSize: '38px', fontWeight: '800',
    fontFamily: 'Inter, sans-serif',
    color: '#1e1b4b', lineHeight: '1', letterSpacing: '0.5px'
  });
  brandName.textContent = 'MEDIXA';

  const dosage = document.createElement('div');
  Object.assign(dosage.style, {
    fontSize: '10px', fontFamily: 'Inter, sans-serif',
    color: '#9ca3af', letterSpacing: '2px',
    textTransform: 'uppercase', fontWeight: '500'
  });
  dosage.textContent = 'About · 500mg';

  body.appendChild(brandName);
  body.appendChild(dosage);

  const tab = document.createElement('div');
  Object.assign(tab.style, {
    position: 'absolute', right: '0', top: '46px', bottom: '0',
    width: '32px', borderLeft: '1.5px dashed #d0d0d0',
    background: '#f9f9f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  });
  const tabDots = document.createElement('div');
  Object.assign(tabDots.style, { display: 'flex', flexDirection: 'column', gap: '5px' });
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      width: '4px', height: '4px', borderRadius: '50%', background: '#d0d0d0'
    });
    tabDots.appendChild(dot);
  }
  tab.appendChild(tabDots);

  carton.appendChild(band);
  carton.appendChild(body);
  carton.appendChild(tab);


  
  boxWrap.appendChild(bottomFace);
  boxWrap.appendChild(sideFace);
  boxWrap.appendChild(bandSide);
  boxWrap.appendChild(carton);
  scene.appendChild(boxWrap);


  
  overlay.appendChild(paper);
  overlay.appendChild(scene);
  document.body.appendChild(overlay);

  gsap.set(paper, { x: 260, opacity: 0 });


  
  const foldObj = { p: 0 };

  const tl = gsap.timeline({
    onComplete: () => {
      overlay.remove();
      document.dispatchEvent(new Event('intro-done'));
    }
  });

  tl
    /* box enters */
    .from(scene, { y: 35, opacity: 0, duration: 0.45, ease: 'back.out(1.4)' })

    /* slight tilt */
    .to(scene, { rotation: -4, duration: 0.32, ease: 'power2.inOut' }, '+=0.14')

    /* paper slides RIGHT out from under the box */
    .to(paper, { opacity: 1, duration: 0.08 }, '+=0.08')
    .to(paper, { x: 460, duration: 0.55, ease: 'power2.inOut' })

    /* box straightens and retreats */
    .to(scene, { rotation: 0, x: -100, opacity: 0, duration: 0.38, ease: 'power2.in' }, '+=0.06')

    /* paper floats to center, well below midpoint */
    .to(paper, { x: 0, y: finalOffsetY, duration: 0.36, ease: 'power2.inOut' }, '<')

    /* paper unfolds to fill screen */
    .to(paper, {
      width: finalW,
      height: finalH,
      marginLeft: -(finalW / 2) + 'px',
      marginTop: -(finalH / 2) + 'px',
      duration: 0.58,
      ease: 'power3.inOut'
    }, '+=0.03')

    /* corner fold grows, overlaps with fade */
    .to(foldObj, {
      p: 1,
      duration: 0.38,
      ease: 'power2.out',
      onUpdate: () => drawFold(foldObj.p)
    }, '-=0.1')

    /* fade starts while fold is still finishing */
    .to(overlay, { opacity: 0, duration: 0.38, ease: 'power2.in' }, '-=0.1');


    
})();




