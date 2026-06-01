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
        if (!heroStage || prefersReducedMotion) return;
        const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
        heroStage.style.setProperty("--stage-lift", `${progress * -28}px`);
        heroStage.style.setProperty("--stage-fade", `${1 - progress * 0.42}`);
    }

    function initCinematicScroll() {
        if (prefersReducedMotion) return;

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
        const canvas = stage?.querySelector(".kunwu-blade-canvas");
        if (!stage || !blade) return;

        if (canvas && window.THREE) {
            initThreeBladeStage(stage, canvas);
            return;
        }

        let rotateY = -18;
        let rotateX = -8;
        let lastX = 0;
        let lastY = 0;
        let lastFrame = performance.now();
        const startedAt = lastFrame;
        let resumeAt = 0;
        let dragging = false;
        let hasInteracted = false;
        const autoSpeed = 360 / 45000;

        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function setBladeTransform() {
            stage.style.setProperty("--blade-rotate", `${rotateY.toFixed(2)}deg`);
            stage.style.setProperty("--blade-tilt", `${rotateX.toFixed(2)}deg`);
        }

        function render(now) {
            const delta = Math.min(now - lastFrame, 34);
            lastFrame = now;

            if (!prefersReducedMotion && !dragging && now > resumeAt) {
                const hovering = stage.matches(":hover");
                rotateY = (rotateY + delta * (hovering ? autoSpeed * 0.52 : autoSpeed)) % 360;
                rotateX += (-8 - rotateX) * 0.025;
                setBladeTransform();
            }

            requestAnimationFrame(render);
        }

        stage.addEventListener("pointerdown", (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            if (!hasInteracted) {
                rotateY = (-18 + (performance.now() - startedAt) * autoSpeed) % 360;
                hasInteracted = true;
                stage.classList.add("has-interacted");
            }
            dragging = true;
            lastX = event.clientX;
            lastY = event.clientY;
            stage.classList.add("is-dragging");
            stage.setPointerCapture?.(event.pointerId);
            setBladeTransform();
        });

        stage.addEventListener("pointermove", (event) => {
            if (!dragging) return;
            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;
            rotateY = (rotateY + dx * 0.58) % 360;
            rotateX = clamp(rotateX - dy * 0.18, -18, 14);
            lastX = event.clientX;
            lastY = event.clientY;
            setBladeTransform();
            event.preventDefault();
        });

        function releaseBlade(event) {
            if (!dragging) return;
            dragging = false;
            resumeAt = performance.now() + 420;
            stage.classList.remove("is-dragging");
            if (event?.pointerId !== undefined) stage.releasePointerCapture?.(event.pointerId);
        }

        stage.addEventListener("pointerup", releaseBlade);
        stage.addEventListener("pointercancel", releaseBlade);
        stage.addEventListener("lostpointercapture", releaseBlade);

        setBladeTransform();
        requestAnimationFrame(render);
    }

    function createBladeGeometry(THREE) {
        const sections = [
            { y: -0.84, width: 0.24, depth: 0.105 },
            { y: 0.28, width: 0.195, depth: 0.092 },
            { y: 1.54, width: 0.13, depth: 0.072 },
            { y: 2.48, width: 0.052, depth: 0.04 }
        ];
        const tip = [0, 2.96, 0];
        const positions = [];

        const diamond = (section) => ({
            front: [0, section.y, section.depth],
            right: [section.width, section.y, 0],
            back: [0, section.y, -section.depth],
            left: [-section.width, section.y, 0]
        });
        const pushFace = (...points) => points.forEach((point) => positions.push(...point));
        const rings = sections.map(diamond);

        for (let index = 0; index < rings.length - 1; index += 1) {
            const a = rings[index];
            const b = rings[index + 1];
            pushFace(a.front, b.front, b.right, a.front, b.right, a.right);
            pushFace(a.right, b.right, b.back, a.right, b.back, a.back);
            pushFace(a.back, b.back, b.left, a.back, b.left, a.left);
            pushFace(a.left, b.left, b.front, a.left, b.front, a.front);
        }

        const last = rings[rings.length - 1];
        pushFace(last.front, tip, last.right);
        pushFace(last.right, tip, last.back);
        pushFace(last.back, tip, last.left);
        pushFace(last.left, tip, last.front);

        const base = rings[0];
        pushFace(base.front, base.right, base.back, base.front, base.back, base.left);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.computeVertexNormals();
        return geometry;
    }

    function initThreeBladeStage(stage, canvas) {
        const THREE = window.THREE;
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0.28, 7.2);

        const sword = new THREE.Group();
        sword.rotation.x = -0.08;
        scene.add(sword);

        const bladeMaterial = new THREE.MeshStandardMaterial({
            color: 0xdfe6ee,
            metalness: 0.96,
            roughness: 0.18
        });
        const darkMaterial = new THREE.MeshStandardMaterial({
            color: 0x080b10,
            metalness: 0.72,
            roughness: 0.36
        });
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: 0xb8a278,
            metalness: 0.88,
            roughness: 0.3
        });
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0xf6fbff,
            metalness: 1,
            roughness: 0.12,
            emissive: 0x5bbdda,
            emissiveIntensity: 0.08
        });

        const bladeMesh = new THREE.Mesh(createBladeGeometry(THREE), bladeMaterial);
        sword.add(bladeMesh);

        const ridge = new THREE.Mesh(
            new THREE.BoxGeometry(0.018, 3.34, 0.028),
            edgeMaterial
        );
        ridge.position.y = 0.79;
        ridge.position.z = 0.093;
        sword.add(ridge);

        const leftEdge = ridge.clone();
        leftEdge.scale.set(0.55, 0.86, 0.65);
        leftEdge.position.set(-0.085, 0.56, 0.05);
        leftEdge.rotation.z = -0.027;
        sword.add(leftEdge);

        const rightEdge = ridge.clone();
        rightEdge.scale.set(0.55, 0.86, 0.65);
        rightEdge.position.set(0.085, 0.56, 0.05);
        rightEdge.rotation.z = 0.027;
        sword.add(rightEdge);

        const guard = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.075, 0.28), accentMaterial);
        guard.position.y = -0.86;
        sword.add(guard);

        const guardCore = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.34), accentMaterial);
        guardCore.position.y = -0.86;
        sword.add(guardCore);

        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.18, 32), accentMaterial);
        collar.position.y = -0.98;
        sword.add(collar);

        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.118, 0.88, 32), darkMaterial);
        grip.position.y = -1.48;
        sword.add(grip);

        const wrapTop = new THREE.Mesh(new THREE.TorusGeometry(0.114, 0.012, 8, 32), accentMaterial);
        wrapTop.position.y = -1.16;
        wrapTop.rotation.x = Math.PI / 2;
        sword.add(wrapTop);

        const wrapBottom = wrapTop.clone();
        wrapBottom.position.y = -1.8;
        sword.add(wrapBottom);

        const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.135, 0.18, 32), accentMaterial);
        pommel.position.y = -1.98;
        sword.add(pommel);

        const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
        keyLight.position.set(2.4, 3.2, 4.5);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0x77d9ff, 2.8);
        rimLight.position.set(-3.2, 1.4, -2.6);
        scene.add(rimLight);
        const fillLight = new THREE.HemisphereLight(0xe9eef7, 0x05070b, 1.25);
        scene.add(fillLight);

        let targetY = -0.92;
        let currentY = targetY;
        let targetX = -0.16;
        let currentX = targetX;
        let lastX = 0;
        let lastY = 0;
        let dragging = false;
        let resumeAt = 0;
        let lastFrame = performance.now();
        const clock = new THREE.Clock();

        function resize() {
            const rect = stage.getBoundingClientRect();
            const width = Math.max(Math.floor(rect.width), 1);
            const height = Math.max(Math.floor(rect.height), 1);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }

        function render(now) {
            const delta = Math.min(now - lastFrame, 34);
            lastFrame = now;

            if (!prefersReducedMotion && !dragging && now > resumeAt) {
                targetY += delta * (stage.matches(":hover") ? 0.00034 : 0.00062);
            }
            currentY += (targetY - currentY) * 0.12;
            currentX += (targetX - currentX) * 0.12;
            sword.rotation.y = currentY;
            sword.rotation.x = currentX;
            sword.position.y = Math.sin(clock.getElapsedTime() * 1.1) * 0.018;
            renderer.render(scene, camera);
            requestAnimationFrame(render);
        }

        stage.addEventListener("pointerdown", (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            dragging = true;
            lastX = event.clientX;
            lastY = event.clientY;
            stage.classList.add("is-dragging");
            stage.setPointerCapture?.(event.pointerId);
        });

        stage.addEventListener("pointermove", (event) => {
            if (!dragging) return;
            const dx = event.clientX - lastX;
            const dy = event.clientY - lastY;
            targetY += dx * 0.012;
            targetX = Math.min(Math.max(targetX + dy * 0.004, -0.32), 0.26);
            lastX = event.clientX;
            lastY = event.clientY;
            event.preventDefault();
        });

        function releaseBlade(event) {
            if (!dragging) return;
            dragging = false;
            resumeAt = performance.now() + 520;
            stage.classList.remove("is-dragging");
            if (event?.pointerId !== undefined) stage.releasePointerCapture?.(event.pointerId);
        }

        stage.addEventListener("pointerup", releaseBlade);
        stage.addEventListener("pointercancel", releaseBlade);
        stage.addEventListener("lostpointercapture", releaseBlade);
        window.addEventListener("resize", resize);

        resize();
        stage.classList.add("three-ready");
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
        initReveal();
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
