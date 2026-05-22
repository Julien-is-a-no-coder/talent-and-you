/* ============================================================
   TALENT AND YOU — Interactions
   ============================================================ */

(() => {
  // ============ NAV scrolled state ============
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ============ REVEAL on scroll ============
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        if (e.target.dataset.once !== 'no') io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  // ============ COUNTERS ============
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.decimals|0) || 0;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = 1600;
      const start = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 3);
      const tick = (t) => {
        const k = Math.min(1, (t - start) / dur);
        const v = target * ease(k);
        el.textContent = prefix + (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('fr-FR')) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cio.observe(c));

  // ============ TABS ============
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      contents.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const id = t.dataset.tab;
      document.querySelector(`.tab-content[data-tab="${id}"]`).classList.add('active');
    });
  });

  // ============ ORBIT (secteurs) ============
  const orbitWrap = document.querySelector('.orbit-section');
  const bubbles = document.querySelectorAll('.orbit-bubble');
  const legendItems = document.querySelectorAll('.orbit-legend li');
  const spokes = document.querySelectorAll('.orbit-spokes line');
  const orbitName = document.querySelector('.orbit-center .name');
  const orbitSub = document.querySelector('.orbit-center .sub');
  const defaultName = orbitName ? orbitName.textContent : '';
  const defaultSub = orbitSub ? orbitSub.textContent : '';

  const setActive = (key, color) => {
    if (!orbitWrap) return;
    if (!key) {
      orbitWrap.classList.remove('dim');
      bubbles.forEach(s => s.classList.remove('active'));
      legendItems.forEach(s => s.classList.remove('active'));
      spokes.forEach(s => { s.classList.remove('active'); s.style.removeProperty('--spoke-color'); });
      if (orbitName) orbitName.textContent = defaultName;
      if (orbitSub) orbitSub.textContent = defaultSub;
      return;
    }
    orbitWrap.classList.add('dim');
    bubbles.forEach(s => s.classList.toggle('active', s.dataset.key === key));
    legendItems.forEach(s => s.classList.toggle('active', s.dataset.key === key));
    spokes.forEach(s => {
      const on = s.dataset.key === key;
      s.classList.toggle('active', on);
      if (on && color) s.style.setProperty('--spoke-color', color);
    });
    const item = document.querySelector(`.orbit-legend li[data-key="${key}"]`);
    if (item && orbitName) {
      orbitName.textContent = item.querySelector('.lbl').textContent;
      orbitSub.textContent = item.dataset.sub || '';
    }
  };

  const getColor = (el) => getComputedStyle(el).getPropertyValue('--bubble-color').trim();

  bubbles.forEach(s => {
    s.addEventListener('mouseenter', () => setActive(s.dataset.key, getColor(s)));
    s.addEventListener('mouseleave', () => setActive(null));
    s.addEventListener('focus', () => setActive(s.dataset.key, getColor(s)));
    s.addEventListener('blur', () => setActive(null));
  });
  legendItems.forEach(s => {
    s.addEventListener('mouseenter', () => setActive(s.dataset.key, getColor(s)));
    s.addEventListener('mouseleave', () => setActive(null));
  });

  // ============ TWEAKS PANEL ============
  const tweaks = document.querySelector('.tweaks');
  const tweaksToggle = document.querySelector('.tweaks-toggle');
  const tweaksClose = document.querySelector('.tw-close');

  // Listen for parent toolbar Tweaks toggle
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === '__activate_edit_mode') {
      tweaks.classList.add('show');
      tweaksToggle.classList.add('hidden');
    } else if (e.data.type === '__deactivate_edit_mode') {
      tweaks.classList.remove('show');
      tweaksToggle.classList.remove('hidden');
    }
  });
  // Announce availability AFTER listener is set
  window.parent && window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  // Manual toggle (in-page)
  tweaksToggle.addEventListener('click', () => {
    tweaks.classList.add('show');
    tweaksToggle.classList.add('hidden');
  });
  tweaksClose.addEventListener('click', () => {
    tweaks.classList.remove('show');
    tweaksToggle.classList.remove('hidden');
    window.parent && window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  });

  // Theme + font controls
  const root = document.documentElement;
  document.querySelectorAll('.swatch-btn').forEach(b => {
    b.addEventListener('click', () => {
      const theme = b.dataset.theme;
      if (theme === 'signature') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', theme);
      document.querySelectorAll('.swatch-btn').forEach(x => x.dataset.active = (x === b));
    });
  });
  document.querySelectorAll('.font-btn').forEach(b => {
    b.addEventListener('click', () => {
      const f = b.dataset.font;
      const map = {
        bricolage: '"Bricolage Grotesque", system-ui, sans-serif',
        instrument: '"Instrument Serif", Georgia, serif',
        space: '"Space Grotesk", system-ui, sans-serif',
        fraunces: '"Fraunces", Georgia, serif'
      };
      root.style.setProperty('--f-display', map[f] || map.bricolage);
      document.querySelectorAll('.font-btn').forEach(x => x.dataset.active = (x === b));
    });
  });

  // ============ MAGNETIC BUTTONS ============
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ============ HERO PARALLAX ============
  const art = document.querySelector('.hero-art');
  if (art) {
    let mx = 0, my = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mx = (e.clientX - cx) / cx;
      my = (e.clientY - cy) / cy;
    });
    const loop = () => {
      tx += (mx * 14 - tx) * 0.06;
      ty += (my * 14 - ty) * 0.06;
      art.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }
})();
