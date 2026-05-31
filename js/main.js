(function () {
    "use strict";

    const nav = document.getElementById("nav");
    const navToggle = document.getElementById("navToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileMenuLinks = document.querySelectorAll(".mobile-menu-link");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setNavState() {
        if (!nav) return;
        nav.classList.toggle("scrolled", window.scrollY > 28);
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

    function initKeyboard() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });
    }

    function init() {
        setNavState();
        initSmoothScroll();
        initReveal();
        initActiveNav();
        initMagneticButtons();
        initCursorAura();
        initKeyboard();

        window.addEventListener("scroll", setNavState, { passive: true });
        navToggle?.addEventListener("click", toggleMenu);
        mobileMenuLinks.forEach((link) => link.addEventListener("click", closeMenu));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
