/**
 * Yang Kun Portfolio - Main JavaScript
 * Enhanced interactions: cursor trail, 3D card tilt, scroll effects
 */

(function() {
    'use strict';

    // DOM Elements
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    const heroSection = document.querySelector('.hero');

    // ============================================
    // Custom Cursor Trail Effect
    // ============================================
    function initCursorTrail() {
        const trailCount = 12;
        const trails = [];
        const mouse = { x: -100, y: -100 };

        // Create trail elements
        for (let i = 0; i < trailCount; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.cssText = `
                position: fixed;
                width: ${4 + i * 1.5}px;
                height: ${4 + i * 1.5}px;
                background: radial-gradient(circle, rgba(232, 184, 109, ${0.3 - i * 0.02}) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                opacity: 0;
                transform: translate(-50%, -50%);
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(trail);
            trails.push({
                el: trail,
                x: -100,
                y: -100
            });
        }

        let isVisible = false;

        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            if (!isVisible) {
                isVisible = true;
                trails.forEach(t => t.el.style.opacity = '1');
            }
        });

        document.addEventListener('mouseleave', () => {
            isVisible = false;
            trails.forEach(t => t.el.style.opacity = '0');
        });

        function animateTrails() {
            let prevX = mouse.x;
            let prevY = mouse.y;

            trails.forEach((trail, i) => {
                const speed = 0.15 - (i * 0.008);
                trail.x += (prevX - trail.x) * speed;
                trail.y += (prevY - trail.y) * speed;

                trail.el.style.left = trail.x + 'px';
                trail.el.style.top = trail.y + 'px';

                prevX = trail.x;
                prevY = trail.y;
            });

            requestAnimationFrame(animateTrails);
        }

        animateTrails();
    }

    // ============================================
    // 3D Card Tilt Effect
    // ============================================
    function init3DCardTilt() {
        const cards = document.querySelectorAll('.project-card, .hobby-card, .honor-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) translateY(0) rotateX(0) rotateY(0)';
            });
        });
    }

    // ============================================
    // Navigation Scroll Effect
    // ============================================
    function handleNavScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        navToggle.setAttribute('aria-expanded', mobileMenu.classList.contains('active'));
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        navToggle.setAttribute('aria-expanded', 'false');
    }

    // ============================================
    // Scroll Animations (Intersection Observer)
    // ============================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // Smooth Scroll for Navigation
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    closeMobileMenu();

                    const navHeight = nav?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ============================================
    // Active Navigation Highlight
    // ============================================
    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        function highlightNav() {
            const scrollY = window.scrollY + 200;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', highlightNav, { passive: true });
    }

    // ============================================
    // Keyboard Accessibility
    // ============================================
    function initKeyboardNav() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        navToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            }
        });
    }

    // ============================================
    // Parallax Effect on Hero
    // ============================================
    function initParallax() {
        const heroGlow = document.querySelector('.hero-glow');
        const heroGlowSecondary = document.querySelector('.hero-glow-secondary');

        if (!heroGlow || !heroGlowSecondary) return;

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroHeight = heroSection?.offsetHeight || 0;

            if (scrollY < heroHeight) {
                const progress = scrollY / heroHeight;
                heroGlow.style.transform = `translateX(-50%) translateY(${scrollY * 0.3}px)`;
                heroGlowSecondary.style.transform = `translateY(${-scrollY * 0.15}px)`;
                heroGlow.style.opacity = 0.6 - progress * 0.3;
            }
        }, { passive: true });
    }

    // ============================================
    // Initialize
    // ============================================
    function init() {
        // Event Listeners
        window.addEventListener('scroll', handleNavScroll, { passive: true });
        navToggle?.addEventListener('click', toggleMobileMenu);
        mobileMenuLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

        // Initialize Features
        initSmoothScroll();
        initScrollAnimations();
        initActiveNav();
        initKeyboardNav();

        // Enhanced interactions (with feature detection)
        if (window.matchMedia('(pointer: fine)').matches) {
            initCursorTrail();
            init3DCardTilt();
        }
        initParallax();

        // Initial check for nav state
        handleNavScroll();
    }

    // Run on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
