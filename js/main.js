(function () {
    "use strict";

    const nav = document.getElementById("nav");
    const navToggle = document.getElementById("navToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileMenuLinks = document.querySelectorAll(".mobile-menu-link");
    const scrollProgress = document.getElementById("scrollProgress");
    const heroStage = document.querySelector(".hero-stage");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cinematicTargets = [...document.querySelectorAll(".section-shell, .featured-project, .showcase-rail, .contact-panel")];
    const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
    let ticking = false;

    function setNavState() {
        if (!nav) return;
        nav.classList.toggle("scrolled", window.scrollY > 28);
    }

    function setScrollProgress() {
        if (!scrollProgress) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    }

    function setHeroParallax() {
        if (!heroStage || prefersReducedMotion || hasGsap) return;
        const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
        heroStage.style.setProperty("--stage-lift", `${progress * -28}px`);
        heroStage.style.setProperty("--stage-fade", `${1 - progress * 0.42}`);
    }

    function initCinematicScroll() {
        if (prefersReducedMotion || hasGsap) return;

        const viewportCenter = window.innerHeight * 0.52;
        cinematicTargets.forEach((target) => {
            const rect = target.getBoundingClientRect();
            const targetCenter = rect.top + rect.height * 0.5;
            const distance = (targetCenter - viewportCenter) / Math.max(window.innerHeight, 1);
            const clamped = Math.max(-1, Math.min(1, distance));
            const presence = 1 - Math.min(1, Math.abs(clamped));

            target.style.setProperty("--cinema-y", `${(clamped * -28).toFixed(2)}px`);
            target.style.setProperty("--cinema-scale", `${(0.985 + presence * 0.015).toFixed(4)}`);
            target.style.setProperty("--cinema-presence", presence.toFixed(3));
        });
    }

    function initScrollProgress() {
        function update() {
            ticking = false;
            setNavState();
            setScrollProgress();
            setHeroParallax();
            initCinematicScroll();
        }

        update();
        window.addEventListener("scroll", () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });
    }

    function openMenu() {
        mobileMenu?.classList.add("active");
        navToggle?.classList.add("active");
        navToggle?.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    function closeMenu() {
        mobileMenu?.classList.remove("active");
        navToggle?.classList.remove("active");
        navToggle?.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    function toggleMenu() {
        if (mobileMenu?.classList.contains("active")) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", (event) => {
                const targetId = anchor.getAttribute("href");
                if (!targetId || targetId === "#") return;

                const target = document.querySelector(targetId);
                if (!target) return;

                event.preventDefault();
                closeMenu();

                const navHeight = nav?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

                window.scrollTo({
                    top,
                    behavior: prefersReducedMotion ? "auto" : "smooth"
                });
            });
        });
    }

    function initReveal() {
        if (hasGsap && !prefersReducedMotion) return;

        const revealItems = document.querySelectorAll(".reveal");

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealItems.forEach((item) => item.classList.add("visible"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            });
        }, {
            root: null,
            rootMargin: "0px 0px -12% 0px",
            threshold: 0.14
        });

        revealItems.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
            observer.observe(item);
        });
    }

    function initGsapMotion() {
        if (!hasGsap) return false;

        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        document.body.classList.add("gsap-motion");

        if (prefersReducedMotion) {
            gsap.set(".reveal", { autoAlpha: 1, y: 0, clearProps: "transform" });
            return true;
        }

        gsap.defaults({ ease: "power3.out" });
        gsap.set(".project-detail-grid > div, .project-notes span, .contact-link, .douyin-contact", {
            autoAlpha: 0
        });

        const heroTimeline = gsap.timeline({ defaults: { duration: 0.82 } });
        heroTimeline
            .fromTo(".hero .eyebrow", { autoAlpha: 0.72, y: 14 }, { autoAlpha: 1, y: 0 })
            .fromTo(".hero-title", { autoAlpha: 0.72, y: 36, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.95 }, "-=0.56")
            .fromTo(".hero-name-note", { autoAlpha: 0.72, y: 18 }, { autoAlpha: 1, y: 0 }, "-=0.72")
            .fromTo(".hero-subtitle", { autoAlpha: 0.76, y: 22 }, { autoAlpha: 1, y: 0 }, "-=0.62")
            .fromTo(".hero-actions", { autoAlpha: 0.8, y: 16 }, { autoAlpha: 1, y: 0 }, "-=0.48")
            .fromTo(".hero-metrics", { autoAlpha: 0.82, y: 20 }, { autoAlpha: 1, y: 0 }, "-=0.42")
            .fromTo(".hero-stage", { autoAlpha: 0.76, y: 46, scale: 0.96, rotateX: 3 }, { autoAlpha: 1, y: 0, scale: 1, rotateX: 0, duration: 1 }, "-=0.88")
            .fromTo(".blade-orbit", { autoAlpha: 0.64, scale: 0.84, rotateZ: -22 }, { autoAlpha: 1, scale: 1, rotateZ: -10, duration: 1 }, "-=0.72")
            .fromTo(".kunwu-sword-photo", { autoAlpha: 0.78, y: 18, scale: 0.94 }, { autoAlpha: 1, y: -18, scale: 1, duration: 0.98 }, "-=0.9");

        gsap.to(".hero-copy", {
            y: -56,
            autoAlpha: 0.72,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 0.8
            }
        });

        gsap.to(".hero-stage", {
            y: -54,
            autoAlpha: 0.62,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 0.8
            }
        });

        ScrollTrigger.batch(".section-header, .profile-panel, .capability-card, .honor-card, .life-panel", {
            start: "top 82%",
            once: true,
            onEnter: (elements) => {
                gsap.fromTo(elements,
                    { autoAlpha: 0, y: 46, scale: 0.985 },
                    { autoAlpha: 1, y: 0, scale: 1, duration: 0.86, stagger: 0.08 }
                );
            }
        });

        gsap.fromTo(".featured-project",
            { autoAlpha: 0, y: 70, scale: 0.96 },
            {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: ".featured-project",
                    start: "top 78%",
                    toggleActions: "play none none none"
                }
            }
        );

        gsap.to(".featured-visual img", {
            y: -28,
            scale: 1.08,
            rotate: -2,
            ease: "none",
            scrollTrigger: {
                trigger: ".featured-project",
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });

        ScrollTrigger.batch(".project-detail-grid > div, .project-notes span", {
            start: "top 86%",
            once: true,
            onEnter: (elements) => {
                gsap.fromTo(elements,
                    { autoAlpha: 0, y: 20 },
                    { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.04, ease: "power2.out" }
                );
            }
        });

        ScrollTrigger.batch(".project-card", {
            start: "top 82%",
            once: true,
            onEnter: (cards) => {
                gsap.fromTo(cards,
                    { autoAlpha: 0, y: 62, rotateX: 7, scale: 0.965 },
                    { autoAlpha: 1, y: 0, rotateX: 0, scale: 1, duration: 0.92, stagger: 0.12 }
                );
            }
        });

        gsap.to(".showcase-rail", {
            y: -34,
            ease: "none",
            scrollTrigger: {
                trigger: ".projects",
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1
            }
        });

        gsap.fromTo(".contact-panel",
            { autoAlpha: 0, y: 64, scale: 0.97 },
            {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.92,
                scrollTrigger: {
                    trigger: ".contact-panel",
                    start: "top 82%",
                    toggleActions: "play none none none"
                }
            }
        );

        gsap.fromTo(".contact-link, .douyin-contact",
            { autoAlpha: 0, x: 24 },
            {
                autoAlpha: 1,
                x: 0,
                duration: 0.62,
                stagger: 0.06,
                scrollTrigger: {
                    trigger: ".contact-stack",
                    start: "top 82%",
                    toggleActions: "play none none none"
                }
            }
        );

        const refreshScrollTriggers = () => {
            ScrollTrigger.refresh(true);
            ScrollTrigger.update();
        };
        requestAnimationFrame(refreshScrollTriggers);
        window.setTimeout(refreshScrollTriggers, 300);
        window.addEventListener("load", refreshScrollTriggers, { once: true });
        return true;
    }

    function initActiveNav() {
        const sections = [...document.querySelectorAll("main section[id]")];
        const links = [...document.querySelectorAll(".nav-link")];
        if (!sections.length || !links.length) return;

        function updateActiveLink() {
            const currentY = window.scrollY + (nav?.offsetHeight || 0) + 120;
            let currentId = sections[0].id;

            sections.forEach((section) => {
                if (currentY >= section.offsetTop) currentId = section.id;
            });

            links.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
            });
        }

        updateActiveLink();
        window.addEventListener("scroll", updateActiveLink, { passive: true });
    }

    function initMagneticButtons() {
        if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

        document.querySelectorAll(".magnetic").forEach((item) => {
            item.addEventListener("mousemove", (event) => {
                const rect = item.getBoundingClientRect();
                const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
                const y = (event.clientY - rect.top - rect.height / 2) * 0.2;
                item.style.setProperty("--x", `${x}px`);
                item.style.setProperty("--y", `${y}px`);
            });

            item.addEventListener("mouseleave", () => {
                item.style.setProperty("--x", "0px");
                item.style.setProperty("--y", "0px");
            });
        });
    }

    function initCardTilt() {
        if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

        document.querySelectorAll(".project-card").forEach((card) => {
            card.addEventListener("mousemove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const rx = ((y / rect.height) - 0.5) * -7;
                const ry = ((x / rect.width) - 0.5) * 8;

                card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
                card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
                card.style.setProperty("--mx", `${((x / rect.width) * 100).toFixed(1)}%`);
                card.style.setProperty("--my", `${((y / rect.height) * 100).toFixed(1)}%`);
            });

            card.addEventListener("mouseleave", () => {
                card.style.setProperty("--rx", "0deg");
                card.style.setProperty("--ry", "0deg");
                card.style.setProperty("--mx", "50%");
                card.style.setProperty("--my", "50%");
            });
        });
    }

    function initCursorAura() {
        if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

        const aura = document.createElement("div");
        aura.className = "cursor-aura";
        document.body.appendChild(aura);

        let targetX = -200;
        let targetY = -200;
        let currentX = targetX;
        let currentY = targetY;
        let visible = false;

        document.addEventListener("mousemove", (event) => {
            targetX = event.clientX;
            targetY = event.clientY;
            if (!visible) {
                visible = true;
                aura.style.opacity = "1";
            }
        });

        document.addEventListener("mouseleave", () => {
            visible = false;
            aura.style.opacity = "0";
        });

        function render() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            aura.style.left = `${currentX}px`;
            aura.style.top = `${currentY}px`;
            requestAnimationFrame(render);
        }

        render();
    }

    function initBladeStage() {
        const stage = document.querySelector(".blade-stage");
        const blade = stage?.querySelector(".blade-object");
        if (!stage || !blade) return;

        let targetY = -8;
        let targetX = -6;
        let currentY = targetY;
        let currentX = targetX;
        let lastX = 0;
        let lastY = 0;
        let dragging = false;

        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function setBladeTransform() {
            stage.style.setProperty("--blade-rotate", `${currentY.toFixed(2)}deg`);
            stage.style.setProperty("--blade-tilt", `${currentX.toFixed(2)}deg`);
        }

        function render(now) {
            if (!prefersReducedMotion && !dragging && !stage.matches(":hover")) {
                targetY = -8 + Math.sin(now * 0.00045) * 2.6;
                targetX = -6 + Math.cos(now * 0.00038) * 1.4;
            }

            currentY += (targetY - currentY) * 0.1;
            currentX += (targetX - currentX) * 0.1;
            setBladeTransform();
            requestAnimationFrame(render);
        }

        stage.addEventListener("pointerdown", (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            dragging = true;
            lastX = event.clientX;
            lastY = event.clientY;
            stage.classList.add("has-interacted");
            stage.classList.add("is-dragging");
            stage.setPointerCapture?.(event.pointerId);
        });

        stage.addEventListener("pointermove", (event) => {
            const rect = stage.getBoundingClientRect();
            const pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

            if (!dragging) {
                targetY = clamp(pointerX * 12, -16, 16);
                targetX = clamp(-6 - pointerY * 4.5, -13, 5);
                stage.classList.add("has-interacted");
                return;
            }

            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;
            targetY = clamp(targetY + dx * 0.16, -24, 24);
            targetX = clamp(targetX - dy * 0.08, -14, 8);
            lastX = event.clientX;
            lastY = event.clientY;
            event.preventDefault();
        });

        stage.addEventListener("pointerleave", () => {
            if (dragging) return;
            targetY = -8;
            targetX = -6;
        });

        function releaseBlade(event) {
            if (!dragging) return;
            dragging = false;
            stage.classList.remove("is-dragging");
            if (event?.pointerId !== undefined) stage.releasePointerCapture?.(event.pointerId);
        }

        stage.addEventListener("pointerup", releaseBlade);
        stage.addEventListener("pointercancel", releaseBlade);
        stage.addEventListener("lostpointercapture", releaseBlade);

        setBladeTransform();
        requestAnimationFrame(render);
    }

    function initKeyboard() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });
    }

    function init() {
        initScrollProgress();
        initSmoothScroll();
        const gsapReady = initGsapMotion();
        if (!gsapReady) initReveal();
        initActiveNav();
        initMagneticButtons();
        initCardTilt();
        initCursorAura();
        initBladeStage();
        initKeyboard();

        navToggle?.addEventListener("click", toggleMenu);
        mobileMenuLinks.forEach((link) => link.addEventListener("click", closeMenu));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
