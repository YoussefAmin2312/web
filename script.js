/* ========================================
   CashGraph Landing Page - Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in class to elements that should animate
    const animateElements = document.querySelectorAll(
        '.feature-card, .stat-item, .ai-coach-content, .ai-coach-visual, .download-container'
    );

    animateElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        fadeObserver.observe(el);
    });

    // Navbar background opacity on scroll
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.8)';
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // Hero panel micro-interaction (desktop only)
    const heroPanels = document.querySelectorAll('[data-hero-panel]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && heroPanels.length > 0 && window.innerWidth > 1024) {
        heroPanels.forEach((panel) => {
            panel.addEventListener('mousemove', (e) => {
                const rect = panel.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                const rotateX = (-y * 6).toFixed(2);
                const rotateY = (x * 7).toFixed(2);

                panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            panel.addEventListener('mouseleave', () => {
                panel.style.transform = '';
            });
        });
    }

    // Ensure hero screenshots render as soon as loaded
    document.querySelectorAll('.hero-panel .phone-screen').forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        }, { once: true });
    });
});
