// Initialize highlight.js
document.addEventListener('DOMContentLoaded', function() {
    hljs.highlightAll();
});

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.style.display === 'flex') {
        mobileMenu.style.display = 'none';
    } else {
        mobileMenu.style.display = 'flex';
    }
}

// Tab switching for code examples
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Re-highlight code
    hljs.highlightAll();
}

// Capability tabs switching
function showCapability(capabilityName) {
    // Hide all capability panels
    const panels = document.querySelectorAll('.capability-panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.capability-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected panel
    document.getElementById(capabilityName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Re-highlight code
    hljs.highlightAll();
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu.style.display === 'flex') {
                mobileMenu.style.display = 'none';
            }
        }
    });
});

// Header scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Add copy button to code blocks
document.querySelectorAll('pre code').forEach((block) => {
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.innerHTML = '<i class="fas fa-copy"></i>';
    button.title = 'Copy code';
    
    button.addEventListener('click', async () => {
        const code = block.textContent;
        try {
            await navigator.clipboard.writeText(code);
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
                button.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
    
    const pre = block.parentElement;
    pre.style.position = 'relative';
    
    // Add copy button
    const btnContainer = document.createElement('div');
    btnContainer.className = 'code-actions';
    btnContainer.appendChild(button);
    pre.appendChild(btnContainer);
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .example-card, .capability-panel').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Close mobile menu on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu.style.display = 'none';
    }
});

// Add style for copy button
const style = document.createElement('style');
style.textContent = `
    .code-actions {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        display: flex;
        gap: 0.5rem;
    }
    
    .copy-code-btn {
        padding: 0.5rem 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 0.375rem;
        color: white;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
    }
    
    .copy-code-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    pre {
        position: relative;
    }
`;
document.head.appendChild(style);

console.log('🚀 MCP Testing Framework Documentation loaded');
