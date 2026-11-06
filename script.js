(() => {
  const $ = s => document.querySelector(s);
  const slides = [...document.querySelectorAll('.slide')];
  const stage = $('#stage'), view = $('#view'), route = $('#route'), count = $('#count'), menu = $('#menu');
  let i = 0;

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const halo = document.createElement('div');
    halo.id = 'cursor-halo';
    halo.setAttribute('aria-hidden', 'true');
    document.body.append(halo);
    addEventListener('pointermove', e => {
      halo.style.left = `${e.clientX}px`;
      halo.style.top = `${e.clientY}px`;
      halo.classList.add('visible');
    }, { passive: true });
    addEventListener('pointerleave', () => halo.classList.remove('visible'));
  }

  const cues = {
    '1.0 Red Alert': { paragraphs: ['TRIGGERS'], points: ['DISTURBANCE', 'TERRORISM', 'OCCASIONS', 'THREATS'] },
    '1.0 Staff duty': { paragraphs: ['VIGILANCE'] },
    '2.0 Imposition': { paragraphs: ['AUTHORITY'] },
    '2.0 Non-availability and deployment': { paragraphs: ['CONTINGENCY', 'DEPLOYMENT'] },
    '3.0 Chief Controller/OCC': { points: ['CONTROLLERS', 'STATIONS', 'FIRE', 'PROJECT', 'PILOT', 'ANNOUNCEMENTS'] },
    '3.1 Station Managers and Staff (1)': { points: ['VIGILANCE', 'PATROLS', 'COVERAGE', 'VULNERABILITIES', 'COMMUNICATIONS'] },
    '3.1 Station Managers and Staff (2)': { points: ['AFC WATCH', 'TICKETING', 'VERIFICATION', 'PARKING'] },
    '3.2 Police Security Controller': { points: ['ALERTS', 'ESCALATION', 'COORDINATION', 'STATIONS', 'DEPOTS', 'CRITICAL SITES'] },
    '3.3 TPC': { points: ['NOTIFICATIONS', 'INSTALLATIONS', 'STAFFING', 'INSPECTIONS', 'STATUS REPORTS'] },
    '3.4 FMC': { points: ['NOTIFICATIONS', 'ROOM STAFF', 'INSPECTIONS', 'STAFFING', 'SYSTEMS'] },
    '3.5 RSC': { points: ['NOTIFICATIONS', 'TRAIN CHECKS', 'TECHNICAL STAFF', 'TRAIN VIGILANCE', 'BREAKDOWN READINESS'] },
    '3.6 DCC': { points: ['OPERATOR ALERT', 'DEPOT VIGILANCE'] },
    '3.7 Train Operators': { points: ['TRAIN SEARCH', 'ROUTE WATCH', 'REPORTING'] },
    '3.8 Security Staff': { points: ['AGENCY ALERT', 'SCREENING', 'DEPLOYMENT', 'SPOT CHECKS', 'FEEDBACK'] },
    '3.9 Project Wing': { points: ['SITE SECURITY', 'IDENTITY CARDS', 'WORKER VIGILANCE'] },
    'Items 4, 5 and 6': { points: ['VEHICLE READINESS', 'SECURE ROOMS', 'VISITOR ACCESS'] },
    '7 Withdrawal': { points: ['AUTHORIZATION', 'RESTORE NORMALCY', 'CONTROLLER ALERT', 'CASCADE'] }
  };

  function addCue(node, label) {
    if (!label) return;
    const copy = document.createElement('span');
    copy.className = 'point-copy';
    while (node.firstChild) copy.append(node.firstChild);
    const cue = document.createElement('strong');
    cue.className = 'cue';
    cue.textContent = label;
    copy.prepend(cue);
    node.append(copy);
  }

  slides.forEach((s, n) => {
    const t = s.dataset.title;
    const slideCues = cues[t];
    if (slideCues) {
      s.querySelectorAll('.main p').forEach((p, index) => addCue(p, slideCues.paragraphs?.[index]));
      s.querySelectorAll('.main .rn li').forEach((li, index) => addCue(li, slideCues.points?.[index]));
    }

    const stop = document.createElement('button');
    stop.className = 'stop'; stop.title = t;
    stop.setAttribute('aria-label', `Slide ${n + 1}: ${t}`);
    stop.onclick = () => go(n);
    route.append(stop);
    const item = document.createElement('button');
    item.textContent = `${n + 1}. ${t}`;
    item.onclick = () => { go(n); menu.classList.remove('open'); };
    menu.append(item);
  });

  function go(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    const hideFooter = i === 0 || i === slides.length - 1;
    document.body.classList.toggle('no-footer', hideFooter);
    if (hideFooter) menu.classList.remove('open');
    slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k !== i); });
    [...route.children].forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('past', k < i); });
    [...menu.children].forEach((b, k) => b.classList.toggle('on', k === i));
    count.textContent = `${i + 1} / ${slides.length}`;
    history.replaceState(null, '', '#' + (i + 1));
    fit();
  }

  function fit() {
    const scale = Math.min(view.clientWidth / 1920, view.clientHeight / 1080);
    stage.style.setProperty('--stage-scale', String(scale));
  }

  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('ra-theme', t); } catch (e) {}
  }
  const toggleTheme = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  const toggleFull = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();

  $('#prev').onclick = () => go(i - 1);
  $('#next').onclick = () => go(i + 1);
  $('#toc').onclick = () => menu.classList.toggle('open');
  $('#theme').onclick = toggleTheme;
  $('#full').onclick = toggleFull;

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k) && e.target.tagName !== 'BUTTON') go(i + 1);
    else if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(k)) go(i + 1);
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(k)) go(i - 1);
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'f' || k === 'F') toggleFull();
    else if (k === 't' || k === 'T') toggleTheme();
    else if (k === 'm' || k === 'M') menu.classList.toggle('open');
    else if (k === 'Escape') menu.classList.remove('open');
  });

  let x0 = null;
  addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  addEventListener('resize', fit);
  addEventListener('fullscreenchange', fit);
  let saved = null;
  try { saved = localStorage.getItem('ra-theme'); } catch (e) {}
  setTheme(saved || 'light');
  fit();
  go((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
