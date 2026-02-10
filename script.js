/* ========================================
   CashGraph Landing Page - Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
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

    // Parallax effect for phone mockups
    const heroPhones = document.querySelector('.hero-phones');

    if (heroPhones && window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.15;
            heroPhones.style.transform = `translateY(${rate}px)`;
        }, { passive: true });
    }

    // Mouse move parallax for hero section
    const hero = document.querySelector('.hero');
    const phoneMain = document.querySelector('.phone-main');
    const phoneSecondary = document.querySelector('.phone-secondary');

    if (hero && phoneMain && window.innerWidth > 1024) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            requestAnimationFrame(() => {
                phoneMain.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
                if (phoneSecondary) {
                    phoneSecondary.style.transform = `scale(0.85) rotate(5deg) translate(${x * 30}px, ${y * 30}px)`;
                }
            });
        });

        hero.addEventListener('mouseleave', () => {
            phoneMain.style.transform = '';
            if (phoneSecondary) {
                phoneSecondary.style.transform = '';
            }
        });
    }
});
