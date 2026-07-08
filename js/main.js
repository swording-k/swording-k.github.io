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

    function splitMotionText(selector) {
        document.querySelectorAll(selector).forEach((element) => {
            if (element.dataset.splitReady === "true") return;
            const text = element.textContent || "";
            element.setAttribute("aria-label", text);
            element.textContent = "";
            [...text].forEach((char) => {
                const span = document.createElement("span");
                span.className = "motion-char";
                span.setAttribute("aria-hidden", "true");
                span.textContent = char === " " ? "\u00a0" : char;
                element.appendChild(span);
            });
            element.dataset.splitReady = "true";
        });
    }

    function initGsapMotion() {
        if (!hasGsap) return false;

        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        document.body.classList.add("gsap-motion");

        if (prefersReducedMotion) {
            gsap.set(".reveal", { y: 0, clearProps: "transform" });
            return true;
        }

        gsap.defaults({ ease: "power3.out" });
        splitMotionText(".hero-name-main, .hero-roman");
        const heroTimeline = gsap.timeline({ defaults: { duration: 0.78, ease: "expo.out" } });
        heroTimeline
            .fromTo(".hero .eyebrow", { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1 })
            .fromTo(".hero-edition span", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.54, stagger: 0.06 }, "-=0.42")
            .fromTo(".hero-name-main .motion-char", { yPercent: 100, rotateX: -54, autoAlpha: 0 }, { yPercent: 0, rotateX: 0, autoAlpha: 1, duration: 0.88, stagger: 0.07 }, "-=0.32")
            .fromTo(".hero-alias", { y: -14, scale: 0.9, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.62 }, "-=0.52")
            .fromTo(".hero-roman .motion-char", { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.56, stagger: 0.022 }, "-=0.5")
            .fromTo(".hero-name-note", { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, "-=0.38")
            .fromTo(".hero-signal-row span", { y: 18, scale: 0.94, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, stagger: 0.055 }, "-=0.42")
            .fromTo(".hero-subtitle", { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, "-=0.42")
            .fromTo(".hero-actions .button", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.08 }, "-=0.34")
            .fromTo(".hero-metrics > div", { y: 30, rotateX: 8, autoAlpha: 0 }, { y: 0, rotateX: 0, autoAlpha: 1, stagger: 0.08 }, "-=0.3")
            .fromTo(".hero-stage", { x: 58, scale: 0.88, rotateY: -9, autoAlpha: 0 }, { x: 0, scale: 1, rotateY: 0, autoAlpha: 1, duration: 1.12 }, "-=1.2")
            .fromTo(".blade-orbit", { scale: 0.62, rotateZ: -58, autoAlpha: 0 }, { scale: 1, rotateZ: -10, autoAlpha: 1, duration: 1.14 }, "-=0.72")
            .fromTo(".kunwu-sword-photo", { y: 36, scale: 0.9, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.08 }, "-=0.98")
            .fromTo(".artifact-label, .hero-artifact .console-row, .stage-caption", { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.62, stagger: 0.06 }, "-=0.52")
            .fromTo(".stage-timeline span", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1 }, "-=0.48");

        gsap.to(".stage-timeline span", {
            autoAlpha: 0.38,
            yoyo: true,
            repeat: -1,
            duration: 1.4,
            stagger: 0.22,
            ease: "sine.inOut"
        });

        gsap.to(".hero-copy", {
            y: -56,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 0.8
            }
        });

        gsap.to(".hero-stage", {
            y: -76,
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: 0.8
            }
        });

        ScrollTrigger.batch(".section-header, .profile-panel, .capability-card, .life-panel", {
            start: "top 82%",
            once: true,
            onEnter: (elements) => {
                gsap.fromTo(elements,
                    { y: 46, scale: 0.985 },
                    { y: 0, scale: 1, duration: 0.86, stagger: 0.08 }
                );
            }
        });

        gsap.fromTo(".featured-project",
            { y: 88, scale: 0.94, autoAlpha: 0 },
            {
                y: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 1.05,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: ".featured-project",
                    start: "top 78%",
                    toggleActions: "play none none none"
                }
            }
        );

        gsap.fromTo(".launch-strip span",
            { y: 24, autoAlpha: 0 },
            {
                y: 0,
                autoAlpha: 1,
                duration: 0.68,
                stagger: 0.08,
                scrollTrigger: {
                    trigger: ".launch-strip",
                    start: "top 84%",
                    toggleActions: "play none none none"
                }
            }
        );

        ScrollTrigger.batch(".project-ledger span", {
            start: "top 84%",
            once: true,
            onEnter: (items) => {
                gsap.fromTo(items,
                    { y: 24 },
                    { y: 0, duration: 0.58, stagger: 0.055, ease: "power2.out" }
                );
            }
        });

        gsap.to(".featured-visual img", {
            y: -42,
            scale: 1.12,
            rotate: -3,
            ease: "none",
            scrollTrigger: {
                trigger: ".featured-project",
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });

        gsap.to(".fit-stage-glow", {
            scale: 1.22,
            rotate: 40,
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
                    { y: 20 },
                    { y: 0, duration: 0.58, stagger: 0.04, ease: "power2.out" }
                );
            }
        });

        ScrollTrigger.batch(".project-card", {
            start: "top 82%",
            once: true,
            onEnter: (cards) => {
                gsap.fromTo(cards,
                    { y: 62, rotateX: 7, scale: 0.965 },
                    { y: 0, rotateX: 0, scale: 1, duration: 0.92, stagger: 0.12 }
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
            { y: 64, scale: 0.97 },
            {
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

        gsap.fromTo(".contact-link",
            { x: 24 },
            {
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
            const orderedSections = [...sections].sort((a, b) => a.offsetTop - b.offsetTop);
            let currentId = orderedSections[0].id;

            orderedSections.forEach((section) => {
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
                const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
                const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
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
                const rx = ((y / rect.height) - 0.5) * -4.5;
                const ry = ((x / rect.width) - 0.5) * 5;

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

    function initSwordQiTrail() {
        if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

        const POOL_MAX = 22;
        const pool = [];
        let lastSpawn = 0;
        let lastX = 0;
        let lastY = 0;
        let armed = false;

        function spawn(x, y, angle, speed) {
            let el = pool.find((node) => !node.classList.contains("is-live"));
            if (!el) {
                if (pool.length >= POOL_MAX) return;
                el = document.createElement("div");
                el.className = "sword-qi";
                el.addEventListener("animationend", () => {
                    el.classList.remove("is-live");
                });
                document.body.appendChild(el);
                pool.push(el);
            }
            const cyan = Math.random() < 0.3;
            const len = 32 + Math.min(speed * 0.5, 42);
            el.style.setProperty("--qx", `${x}px`);
            el.style.setProperty("--qy", `${y}px`);
            el.style.setProperty("--qrot", `${angle}deg`);
            el.style.setProperty("--qlen", `${len}px`);
            el.style.setProperty("--qhue", cyan ? "#8fd2e3" : "#c7a56d");
            el.classList.remove("is-live");
            void el.offsetWidth;
            el.classList.add("is-live");
        }

        document.addEventListener(
            "mousemove",
            (event) => {
                const now = performance.now();
                if (!armed) {
                    armed = true;
                    lastX = event.clientX;
                    lastY = event.clientY;
                    lastSpawn = now;
                    return;
                }
                const dx = event.clientX - lastX;
                const dy = event.clientY - lastY;
                const dist = Math.hypot(dx, dy);
                if (now - lastSpawn < 14 || dist < 2) return;
                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                spawn(event.clientX, event.clientY, angle, dist);
                lastX = event.clientX;
                lastY = event.clientY;
                lastSpawn = now;
            },
            { passive: true }
        );
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
            if (event.key === "Escape") {
                closeImageLightbox();
                closeMenu();
            }
        });
    }

    function imageNameFromSrc(src) {
        try {
            const url = new URL(src, window.location.href);
            const name = url.pathname.split("/").filter(Boolean).pop();
            return name || "image";
        } catch (_) {
            return "image";
        }
    }

    function setCopyButtonState(button, label, copied = false) {
        if (!button) return;
        button.textContent = label;
        button.classList.toggle("is-copied", copied);
    }

    function canvasToPngBlob(canvas) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Unable to export canvas"));
                }
            }, "image/png");
        });
    }

    async function normalizeClipboardImage(blob) {
        if (blob.type === "image/png") return blob;
        if (!window.createImageBitmap) return blob;

        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d");
        context.drawImage(bitmap, 0, 0);
        bitmap.close?.();
        return canvasToPngBlob(canvas);
    }

    function closeImageLightbox() {
        const lightbox = document.getElementById("imageLightbox");
        if (!lightbox?.classList.contains("is-open")) return;

        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    /* =============================================
       Advanced Dynamic Interactions
       ============================================= */

    // --- Sword Aura Mist ---
    function initSwordAuraMist() {
        if (prefersReducedMotion) return;

        if (document.querySelector(".sword-aura-mist")) return;

        const layer = document.createElement("div");
        layer.className = "sword-aura-mist";
        layer.setAttribute("aria-hidden", "true");

        const veils = [
            "sword-aura-mist__veil sword-aura-mist__veil--gold",
            "sword-aura-mist__veil sword-aura-mist__veil--cyan",
            "sword-aura-mist__veil sword-aura-mist__veil--smoke"
        ];

        veils.forEach((className) => {
            const veil = document.createElement("span");
            veil.className = className;
            layer.appendChild(veil);
        });

        document.body.prepend(layer);
    }

    // --- Typewriter Effect ---
    function initTypewriter() {
        const subtitle = document.querySelector(".hero-subtitle span");
        if (!subtitle) return;

        const fullText = subtitle.textContent || "";
        subtitle.textContent = "";

        const cursor = document.createElement("span");
        cursor.className = "typewriter-cursor";
        cursor.setAttribute("aria-hidden", "true");
        subtitle.parentNode.appendChild(cursor);

        let charIndex = 0;
        const baseSpeed = 72;
        const variation = () => baseSpeed + Math.random() * 50;

        function type() {
            if (charIndex < fullText.length) {
                subtitle.textContent += fullText[charIndex];
                charIndex++;
                setTimeout(type, variation());
            } else {
                // Keep cursor blinking, then fade after a while
                setTimeout(() => {
                    cursor.style.transition = "opacity 1.2s ease";
                    cursor.style.opacity = "0";
                }, 3000);
            }
        }

        // Start typing after hero animation settles
        setTimeout(type, 1800);
    }

    // --- Mouse Trail Particles ---
    function initMouseTrail() {
        if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

        const colors = [
            "rgba(199, 165, 109, 0.4)",
            "rgba(143, 210, 227, 0.3)",
            "rgba(255, 255, 255, 0.2)"
        ];

        let lastTime = 0;
        const throttle = 40;

        document.addEventListener("mousemove", (e) => {
            const now = Date.now();
            if (now - lastTime < throttle) return;
            lastTime = now;

            const trail = document.createElement("div");
            trail.className = "mouse-trail";
            const size = Math.random() * 8 + 4;
            trail.style.width = `${size}px`;
            trail.style.height = `${size}px`;
            trail.style.left = `${e.clientX - size / 2}px`;
            trail.style.top = `${e.clientY - size / 2}px`;
            trail.style.background = colors[Math.floor(Math.random() * colors.length)];

            document.body.appendChild(trail);

            trail.addEventListener("animationend", () => trail.remove());
            // Safety cleanup
            setTimeout(() => trail.remove(), 900);
        });
    }

    // --- Scroll-driven Accent Shift ---
    function initScrollAccentShift() {
        if (prefersReducedMotion) return;

        function updateAccent() {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;
            const progress = window.scrollY / maxScroll;
            // Subtle hue shift from gold (0) to slightly warmer (8deg)
            const shift = progress * 8;
            document.documentElement.style.setProperty("--accent-shift", `${shift.toFixed(1)}deg`);
        }

        window.addEventListener("scroll", updateAccent, { passive: true });
        updateAccent();
    }

    // --- Card Glare Elements ---
    function initCardGlare() {
        if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

        document.querySelectorAll(".project-card").forEach((card) => {
            if (card.querySelector(".card-glare")) return;

            const glare = document.createElement("div");
            glare.className = "card-glare";
            glare.setAttribute("aria-hidden", "true");
            card.appendChild(glare);
        });
    }

    // --- Hero Title Gleam ---
    function initHeroGleam() {
        if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

        const heroLayout = document.querySelector(".hero-layout");
        if (!heroLayout) return;

        heroLayout.addEventListener("mousemove", (e) => {
            const rect = heroLayout.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            heroLayout.style.setProperty("--gleam-x", `${x}%`);
            heroLayout.style.setProperty("--gleam-y", `${y}%`);
        });
    }

    // --- Section Scroll Enter Effect ---
    function initSectionEnterFX() {
        if (prefersReducedMotion) return;

        const sections = document.querySelectorAll(".section-shell");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-entering");
                    setTimeout(() => entry.target.classList.remove("is-entering"), 600);
                }
            });
        }, { threshold: 0.15 });

        sections.forEach((s) => observer.observe(s));
    }

    async function copyImageToClipboard(src, button, fallbackLink) {
        setCopyButtonState(button, "复制中...");

        try {
            if (!navigator.clipboard || !window.ClipboardItem) {
                throw new Error("Clipboard image copy is not supported");
            }

            const response = await fetch(src);
            const blob = await response.blob();
            const clipboardBlob = await normalizeClipboardImage(blob);
            await navigator.clipboard.write([
                new ClipboardItem({ [clipboardBlob.type || "image/png"]: clipboardBlob })
            ]);
            setCopyButtonState(button, "已复制", true);
            window.setTimeout(() => setCopyButtonState(button, "复制图片"), 1400);
        } catch (_) {
            setCopyButtonState(button, "打开原图后复制");
            fallbackLink?.click();
            window.setTimeout(() => setCopyButtonState(button, "复制图片"), 1800);
        }
    }

    function initImageLightbox() {
        const lightbox = document.getElementById("imageLightbox");
        const image = document.getElementById("lightboxImage");
        const title = document.getElementById("lightboxTitle");
        const openLink = document.getElementById("lightboxOpen");
        const downloadLink = document.getElementById("lightboxDownload");
        const copyButton = document.getElementById("lightboxCopy");
        if (!lightbox || !image || !title || !openLink || !downloadLink || !copyButton) return;

        function openImageLightbox(sourceImage) {
            const src = sourceImage.dataset.lightboxSrc || sourceImage.currentSrc || sourceImage.src;
            const imageTitle = sourceImage.dataset.lightboxTitle || sourceImage.alt || "图片";
            image.src = src;
            image.alt = sourceImage.dataset.lightboxAlt || sourceImage.alt || imageTitle;
            title.textContent = imageTitle;
            openLink.href = src;
            downloadLink.href = src;
            downloadLink.download = imageNameFromSrc(src);
            setCopyButtonState(copyButton, "复制图片");
            lightbox.classList.add("is-open");
            lightbox.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }

        document.querySelectorAll("[data-lightbox-image], [data-lightbox-src]").forEach((item) => {
            item.setAttribute("tabindex", "0");
            item.setAttribute("role", "button");
            if (!item.getAttribute("aria-label")) {
                item.setAttribute("aria-label", `放大查看${item.dataset.lightboxTitle || item.alt || "图片"}`);
            }
            item.addEventListener("click", (event) => {
                event.preventDefault();
                openImageLightbox(item);
            });
            item.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                openImageLightbox(item);
            });
        });

        lightbox.querySelectorAll("[data-lightbox-close]").forEach((button) => {
            button.addEventListener("click", closeImageLightbox);
        });

        copyButton.addEventListener("click", () => {
            copyImageToClipboard(image.src, copyButton, openLink);
        });
    }

    function initFootprint() {
        const el = document.getElementById("footprint");
        const countEl = document.getElementById("footprintCount");
        if (!el || !countEl) return;

        const apiBase = "https://baojian-personalweb.vercel.app";
        fetch(`${apiBase}/api/visit`, { credentials: "include" })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) return;
                countEl.textContent = data.count.toLocaleString();
                if (data.persisted) {
                    el.classList.add("is-ready");
                } else {
                    el.classList.add("is-warming");
                    countEl.textContent = "准备中";
                }
                el.hidden = false;
            })
            .catch(() => {
                el.hidden = true;
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
        // initCursorAura removed — conflicts with sword-qi trail
        initSwordQiTrail();
        initBladeStage();
        initImageLightbox();
        initFootprint();
        initKeyboard();

        // Advanced Interactions
        initSwordAuraMist();
        initTypewriter();
        // initMouseTrail removed — conflicts with sword-qi trail
        initScrollAccentShift();
        initCardGlare();
        initHeroGleam();
        initSectionEnterFX();

        navToggle?.addEventListener("click", toggleMenu);
        mobileMenuLinks.forEach((link) => link.addEventListener("click", closeMenu));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
