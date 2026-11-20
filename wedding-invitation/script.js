(() => {
  const data = window.WEDDING || {};
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const text = (selector, value) => $$(selector).forEach(el => { el.textContent = value; });
  text('[data-groom]', data.groom || "Groom's Name");
  text('[data-bride]', data.bride || "Bride's Name");
  text('[data-date-label]', data.dateLabel || 'DATE TO BE ANNOUNCED');
  text('[data-invite-message]', data.invitationMessage || 'Your presence and blessings would mean the world to us.');
  text('[data-family-line]', data.familyLine || 'With love, our families');
  text('[data-story]', data.story || 'Our story is still being written.');
  text('[data-couple-signature]', `${data.groom || 'Groom'} & ${data.bride || 'Bride'}`);
  text('[data-venue-name]', data.venueName || 'Venue Name');
  text('[data-venue-address]', data.venueAddress || 'Venue address');
  $('#mapLink').href = data.mapUrl || 'https://maps.google.com/';

  // Gate opening
  $('#enterButton').addEventListener('click', () => {
    if ($('#gateScreen').classList.contains('opened')) return;
    $('#gateScreen').classList.add('opened');
    setTimeout(() => { $('#gateScreen').remove(); $('#site').classList.remove('hidden'); document.body.classList.add('entered'); revealObserver.observeAll?.(); requestAnimationFrame(() => requestAnimationFrame(initScratch)); }, 1050);
  });

  // Event cards
  const grid = $('#eventsGrid');
  (data.events || []).forEach((event, i) => {
    const card = document.createElement('article'); card.className = 'event-card reveal';
    const img = document.createElement('div'); img.className = 'event-image';
    if (event.image) { const image = document.createElement('img'); image.src = event.image; image.alt = `${event.name} event`; image.onerror = () => img.classList.add('image-empty'); img.append(image); }
    const body = document.createElement('div'); body.className = 'event-body';
    body.innerHTML = `<span class="event-number">0${i+1} / CELEBRATION</span><h3></h3><p class="event-description"></p><div class="event-meta"><span>◷ <b class="event-time"></b></span><span>⌖ <b class="event-venue"></b></span></div><div class="event-date"></div>`;
    body.querySelector('h3').textContent = event.name || 'Wedding event';
    body.querySelector('.event-description').textContent = event.description || '';
    body.querySelector('.event-time').textContent = event.time || 'Time to be announced';
    body.querySelector('.event-venue').textContent = event.venue || 'Venue to be announced';
    body.querySelector('.event-date').textContent = event.date || 'Date to be announced';
    card.append(img, body); grid.append(card);
  });

  // Floating music player. Add your licensed audio file at assets/music.mp3.
  const audio = $('#weddingAudio'), musicButton = $('#musicToggle');
  const musicLabel = musicButton.querySelector('.music-label');
  musicButton.addEventListener('click', async () => {
    if (audio.paused) {
      musicLabel.textContent = 'LOADING…';
      try { await audio.play(); musicButton.classList.add('playing'); musicLabel.textContent = 'PLAYING'; }
      catch (err) { if (err && err.name === 'AbortError') return; musicLabel.textContent = 'TAP TO RETRY'; }
    } else { audio.pause(); musicButton.classList.remove('playing'); musicLabel.textContent = 'PLAY MUSIC'; }
  });
  audio.addEventListener('error', () => { musicButton.classList.remove('playing'); musicLabel.textContent = 'MUSIC UNAVAILABLE'; });

  // Countdown
  const target = data.weddingDate ? new Date(data.weddingDate).getTime() : NaN;
  const countdownNote = $('#countdownNote');
  function tick() {
    if (document.hidden) return;
    if (!Number.isFinite(target)) { countdownNote.textContent = 'Add the wedding date in content.js to activate the countdown.'; return; }
    let diff = Math.max(0, target - Date.now());
    const vals = [Math.floor(diff/86400000), Math.floor(diff/3600000)%24, Math.floor(diff/60000)%60, Math.floor(diff/1000)%60];
    ['days','hours','minutes','seconds'].forEach((id,i) => $('#'+id).textContent = String(vals[i]).padStart(2,'0'));
    if (diff === 0) countdownNote.textContent = 'Today is the day! Let the celebrations begin.';
  }
  tick(); setInterval(tick, 1000);

  // Scratch-to-reveal canvas
  // (fixed: it used to be sized while the page was still hidden => 0x0 canvas,
  //  and it was sized to the inner text box instead of the whole card.)
  const scratchWrap = $('.scratch-wrap'), canvas = $('#scratchCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const scratchHint = $('.scratch-hint');
  const BRUSH = 26;                       // brush radius in CSS px
  let cssW = 0, cssH = 0, revealed = false, drawing = false, last = null, lastCheck = 0;

  function paintCover() {
    const w = scratchWrap.clientWidth, h = scratchWrap.clientHeight;
    if (!w || !h) return false;           // not visible yet
    const dpr = Math.min(window.devicePixelRatio || 1, 2);   // cap = lighter on phones
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    cssW = w; cssH = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#9b7131'); g.addColorStop(.45, '#f4dfa0'); g.addColorStop(1, '#b58a43');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    for (let i = 0; i < 90; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(120,84,32,.55)';
    ctx.font = `${Math.round(h * .38)}px Georgia, serif`; ctx.fillText('♡', w / 2, h * .42);
    ctx.font = '600 11px Montserrat, sans-serif'; ctx.fillText('SCRATCH HERE', w / 2, h * .74);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = '#000'; ctx.fillStyle = '#000';
    ctx.lineWidth = BRUSH * 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    return true;
  }

  function reveal() {
    if (revealed) return;
    revealed = true; drawing = false;
    scratchWrap.classList.add('revealed');
    if (scratchHint) scratchHint.textContent = '✧ SAVE THE DATE ✧';
    setTimeout(() => { canvas.style.display = 'none'; }, 1000);
  }

  function checkProgress() {
    if (revealed || !canvas.width) return;
    const { width, height } = canvas, data = ctx.getImageData(0, 0, width, height).data;
    const step = 6; let clear = 0, total = 0;
    for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
      total++; if (data[(y * width + x) * 4 + 3] < 40) clear++;
    }
    if (total && clear / total > .45) reveal();
  }

  const point = e => {                    // robust even while the card is mid-animation (scaled)
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (cssW / (r.width || 1)), y: (e.clientY - r.top) * (cssH / (r.height || 1)) };
  };
  const stroke = (a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };

  canvas.addEventListener('pointerdown', e => {
    if (revealed) return;
    drawing = true; last = point(e);
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    ctx.beginPath(); ctx.arc(last.x, last.y, BRUSH, 0, Math.PI * 2); ctx.fill();
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = point(e); stroke(last, p); last = p; e.preventDefault();
    const now = performance.now(); if (now - lastCheck > 700) { lastCheck = now; checkProgress(); }
  });
  const endDraw = () => { if (!drawing) return; drawing = false; checkProgress(); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => canvas.addEventListener(ev, endDraw));
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.tabIndex = 0;                    // keyboard users: Enter / Space reveals the date
  canvas.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } });

  // Paint once the section is really visible, and only repaint if the WIDTH changes
  // (mobile address-bar show/hide fires 'resize' while scrolling and used to wipe the scratch).
  let scratchWidth = 0;
  function initScratch() {
    if (revealed) return;
    if (paintCover()) scratchWidth = scratchWrap.clientWidth;
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      const w = scratchWrap.clientWidth;
      if (w && w !== scratchWidth && !revealed && !drawing) initScratch();
    }).observe(scratchWrap);
  }

  // Scroll reveals with staggered section choreography
  const revealObserver = { observeAll() {
    $$('.reveal').forEach((el, i) => { el.style.setProperty('--reveal-delay', `${Math.min(i % 4, 3) * 110}ms`); observer.observe(el); });
    $$('.section-title, .section-kicker, .section-sub, .countdown-note, .closing-copy').forEach(el => { el.classList.add('scroll-reveal'); observer.observe(el); });
  }};
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold:.12, rootMargin:'0px 0px -35px 0px'});

  // A fine progress line helps guests understand the invitation is a journey.
  const progress = document.createElement('div'); progress.className = 'scroll-progress'; progress.innerHTML = '<span></span>';
  document.body.append(progress);
  const progressBar = progress.firstElementChild;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, {passive:true});
  window.addEventListener('resize', updateProgress); updateProgress();

  // Subtle falling petals: decorative only, automatically reduced for reduced-motion users.
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const layer = document.createElement('div'); layer.className = 'petal-layer'; layer.setAttribute('aria-hidden','true');
    const petalCount = window.matchMedia('(max-width:650px)').matches ? 6 : 10;
    for(let i=0;i<petalCount;i++){
      const petal = document.createElement('span'); petal.className = 'petal';
      petal.style.left = `${(i * 37 + 9) % 100}%`;
      petal.style.setProperty('--duration', `${12 + (i % 5) * 2.2}s`);
      petal.style.setProperty('--delay', `${-(i * 1.7)}s`);
      layer.append(petal);
    }
    document.body.append(layer);
  }

  // Make the first screen feel alive without overwhelming the invitation.
  document.addEventListener('visibilitychange', () => {
    if(document.hidden && !audio.paused){ audio.pause(); musicButton.classList.remove('playing'); musicButton.querySelector('.music-label').textContent='PLAY MUSIC'; }
  });
})();
