// Mobile Menu Toggle
function toggleMobile() {
    const menu = document.getElementById('mobileMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Theme handling
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('theme', theme); } catch(e) {}
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
        btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
    const mobileLabel = document.getElementById('mobileThemeToggle');
    if (mobileLabel) mobileLabel.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
}

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Smooth Scroll
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme early
    const starting = detectPreferredTheme();
    applyTheme(starting);

    // Theme toggle button handler
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Initialize Highlight.js
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Add copy buttons to code blocks
    document.querySelectorAll('pre').forEach(pre => {
                const button = document.createElement('button');
                button.className = 'copy-code';
                button.innerHTML = '<i class="fas fa-copy"></i>';

        pre.style.position = 'relative';
        pre.appendChild(button);
        
        button.addEventListener('click', () => {
            const code = pre.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(() => {
                // show success state
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('copied');
                setTimeout(() => {
                    button.classList.remove('copied');
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                }, 1600);
            });
        });
    });
    
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements
    document.querySelectorAll('.feature, .example, .doc-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Floating TOC: populate from sections with ids and wire toggle + scrollspy
    const tocToggle = document.getElementById('tocToggle');
    const tocPanel = document.getElementById('tocPanel');
    const tocList = document.getElementById('tocList');
    if (tocList) {
        // Build TOC from sections that have ids
        const sections = Array.from(document.querySelectorAll('section[id]'));
        sections.forEach(sec => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + sec.id;
            // Prefer the section header H2 text if present
            const header = sec.querySelector('.section-header h2');
            a.textContent = header ? header.textContent.trim() : sec.id;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                if (tocPanel) { tocPanel.hidden = true; tocToggle && tocToggle.setAttribute('aria-expanded', 'false'); }
                const target = document.getElementById(sec.id);
                if (target) {
                    const offset = 80;
                    const top = target.offsetTop - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
            li.appendChild(a);
            tocList.appendChild(li);
        });

        // Observe sections to mark active TOC link
        const tocObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                if (!id) return;
                const link = tocList.querySelector('a[href="#' + id + '"]');
                if (!link) return;
                if (entry.isIntersecting) {
                    tocList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        }, { threshold: 0.45 });

        sections.forEach(s => tocObserver.observe(s));
    }

    if (tocToggle && tocPanel) {
        tocToggle.addEventListener('click', (e) => {
            const wasHidden = tocPanel.hidden;
            tocPanel.hidden = !wasHidden;
            tocToggle.setAttribute('aria-expanded', (!wasHidden).toString());
        });

        // close TOC when clicking outside
        document.addEventListener('click', (e) => {
            if (!tocPanel || !tocToggle) return;
            const inside = tocPanel.contains(e.target) || tocToggle.contains(e.target);
            if (!inside) {
                tocPanel.hidden = true;
                tocToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.mobile-toggle');
    
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.style.display = 'none';
    }
});
