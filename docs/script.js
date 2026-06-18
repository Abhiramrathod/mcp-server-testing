function toggleMobile() {
  const m = document.getElementById('mobileMenu');
  m.style.display = m.style.display === 'block' ? 'none' : 'block';
}

function applyTheme(t) {
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
  try { localStorage.setItem('theme', t); } catch (e) {}
  updateUI(t);
}

function detectTheme() {
  const s = (() => { try { return localStorage.getItem('theme'); } catch(e) { return null; } })();
  if (s) return s;
  if (matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function updateUI(t) {
  const btn = document.getElementById('themeToggle');
  if (btn) { btn.innerHTML = t === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'; }
  const mb = document.getElementById('mobileThemeToggle');
  if (mb) mb.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

function switchTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById(id).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(detectTheme());
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  if (typeof hljs !== 'undefined') hljs.highlightAll();

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const h = this.getAttribute('href');
      if (h && h.length > 1) {
        e.preventDefault();
        const t = document.querySelector(h);
        if (t) window.scrollTo({ top: t.offsetTop - 72, behavior: 'smooth' });
      }
    });
  });

  // Copy buttons
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-code';
    btn.innerHTML = '<i class="fas fa-copy"></i>';
    pre.appendChild(btn);
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.querySelector('code').textContent).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add('copied');
        setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<i class="fas fa-copy"></i>'; }, 1600);
      });
    });
  });

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar?.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      });
      ticking = true;
    }
  });

  // TOC dots
  const toc = document.getElementById('floatingToc');
  const sections = document.querySelectorAll('section[id]');
  if (toc && sections.length) {
    const dots = [];
    sections.forEach(s => {
      const d = document.createElement('a');
      d.className = 'toc-dot';
      d.href = '#' + s.id;
      d.setAttribute('aria-label', s.id);
      d.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: s.offsetTop - 72, behavior: 'smooth' });
      });
      toc.appendChild(d);
      dots.push({ dot: d, el: s });
    });
    const tocObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const i = Array.from(sections).indexOf(e.target);
        if (i >= 0) dots[i].dot.classList.toggle('active', e.isIntersecting);
      });
    }, { threshold: 0.3 });
    sections.forEach(s => tocObserver.observe(s));
  }

  // Close mobile menu on outside click
  document.addEventListener('click', e => {
    const m = document.getElementById('mobileMenu');
    const t = document.querySelector('.mobile-toggle');
    if (m && t && !m.contains(e.target) && !t.contains(e.target)) m.style.display = 'none';
  });
});
