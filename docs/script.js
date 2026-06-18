function toggleMobile() {
  const menu = document.getElementById('mobileMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  try { localStorage.setItem('theme', theme); } catch (e) {}
  updateThemeToggleUI(theme);
}

function detectPreferredTheme() {
  const stored = (() => { try { return localStorage.getItem('theme'); } catch(e) { return null; } })();
  if (stored) return stored;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function updateThemeToggleUI(theme) {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    btn.title = theme === 'dark' ? 'Light mode' : 'Dark mode';
  }
  const mobileLabel = document.getElementById('mobileThemeToggle');
  if (mobileLabel) mobileLabel.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(detectPreferredTheme());
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  if (typeof hljs !== 'undefined') hljs.highlightAll();

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
        }
      }
    });
  });

  // Copy buttons
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-code';
    btn.innerHTML = '<i class="fas fa-copy"></i>';
    pre.style.position = 'relative';
    pre.appendChild(btn);
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 1600);
      });
    });
  });

  // Fade-in observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Navigation dots TOC
  const toc = document.getElementById('floatingToc');
  const sections = document.querySelectorAll('section[id]');
  if (toc && sections.length) {
    const dots = [];
    sections.forEach(sec => {
      const dot = document.createElement('a');
      dot.className = 'toc-dot';
      dot.href = '#' + sec.id;
      dot.setAttribute('aria-label', sec.id);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: sec.offsetTop - 72, behavior: 'smooth' });
      });
      toc.appendChild(dot);
      dots.push({ dot, el: sec });
    });

    const tocObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = Array.from(sections).indexOf(entry.target);
        if (idx >= 0 && dots[idx]) {
          dots[idx].dot.classList.toggle('active', entry.isIntersecting);
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(s => tocObserver.observe(s));
  }

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.mobile-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.style.display = 'none';
    }
  });
});
