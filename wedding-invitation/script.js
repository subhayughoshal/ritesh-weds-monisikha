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
    $('#gateScreen').classList.add('opened');
    setTimeout(() => { $('#gateScreen').remove(); $('#site').classList.remove('hidden'); document.body.classList.add('entered'); revealObserver.observeAll?.(); }, 1050);
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
  musicButton.addEventListener('click', async () => {
    if (audio.paused) { try { await audio.play(); musicButton.classList.add('playing'); musicButton.querySelector('.music-label').textContent = 'PLAYING'; } catch { musicButton.querySelector('.music-label').textContent = 'ADD MUSIC FILE'; } }
    else { audio.pause(); musicButton.classList.remove('playing'); musicButton.querySelector('.music-label').textContent = 'PLAY MUSIC'; }
  });
  audio.addEventListener('error', () => { if (!audio.paused) musicButton.querySelector('.music-label').textContent = 'ADD MUSIC FILE'; });

  // Countdown
  const target = data.weddingDate ? new Date(data.weddingDate).getTime() : NaN;
  const countdownNote = $('#countdownNote');
  function tick() {
    if (!Number.isFinite(target)) { countdownNote.textContent = 'Add the wedding date in content.js to activate the countdown.'; return; }
    let diff = Math.max(0, target - Date.now());
    const vals = [Math.floor(diff/86400000), Math.floor(diff/3600000)%24, Math.floor(diff/60000)%60, Math.floor(diff/1000)%60];
    ['days','hours','minutes','seconds'].forEach((id,i) => $('#'+id).textContent = String(vals[i]).padStart(2,'0'));
    if (diff === 0) countdownNote.textContent = 'Today is the day! Let the celebrations begin.';
  }
  tick(); setInterval(tick, 1000);

  // Scratch-to-reveal canvas
  const canvas = $('#scratchCanvas'), ctx = canvas.getContext('2d'), scratchDate = $('#scratchDate');
  function setupScratch() {
    const rect = scratchDate.getBoundingClientRect(), dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = rect.width*dpr; canvas.height = rect.height*dpr; canvas.style.width = rect.width+'px'; canvas.style.height = rect.height+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const grad = ctx.createLinearGradient(0,0,rect.width,rect.height); grad.addColorStop(0,'#9b7131'); grad.addColorStop(.45,'#f4dfa0'); grad.addColorStop(1,'#b58a43');
    ctx.fillStyle = grad; ctx.fillRect(0,0,rect.width,rect.height);
    ctx.fillStyle = 'rgba(255,255,255,.28)'; for(let i=0;i<90;i++){ const x=Math.random()*rect.width,y=Math.random()*rect.height; ctx.fillRect(x,y,1.2,1.2); }
    ctx.globalCompositeOperation='destination-out';
  }
  let drawing = false;
  function erase(e) { if(!drawing) return; const r=canvas.getBoundingClientRect(), p=e.touches?e.touches[0]:e; ctx.beginPath(); ctx.arc(p.clientX-r.left,p.clientY-r.top,22,0,Math.PI*2); ctx.fill(); }
  canvas.addEventListener('pointerdown',e=>{drawing=true;canvas.setPointerCapture(e.pointerId);erase(e)});
  canvas.addEventListener('pointermove',erase); ['pointerup','pointercancel','pointerleave'].forEach(ev=>canvas.addEventListener(ev,()=>drawing=false));
  setupScratch(); window.addEventListener('resize',setupScratch);

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
    for(let i=0;i<13;i++){
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
