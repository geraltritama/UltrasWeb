(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── 1. SECTION REVEAL ── */
    if (!reduceMotion && 'IntersectionObserver' in window) {
        const revealObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));
    } else {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
    }

    /* ── 2. CUSTOM CURSOR ── */
    const isMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isMouse && !reduceMotion) {
        const cursor = document.createElement('div');
        cursor.id = 'fx-cursor';
        const dot = document.createElement('div');
        dot.id = 'fx-cursor-dot';
        document.body.appendChild(cursor);
        document.body.appendChild(dot);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        let rafId;

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top  = mouseY + 'px';
        }, { passive: true });

        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.14;
            cursorY += (mouseY - cursorY) * 0.14;
            cursor.style.left = cursorX + 'px';
            cursor.style.top  = cursorY + 'px';
            rafId = requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Grow on hover interactive elements
        const interactiveSelector = 'a, button, [class*="cursor-pointer"], input, textarea, select, label';
        document.querySelectorAll(interactiveSelector).forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });

        // Click feedback
        document.addEventListener('mousedown', () => {
            cursor.classList.add('clicked');
            cursor.classList.remove('hovered');
        });
        document.addEventListener('mouseup', () => {
            cursor.classList.remove('clicked');
        });

        // Hide when leaving window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            dot.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            dot.style.opacity = '1';
        });
    }

    /* ── 3. COUNTER ANIMATION ── */
    function animateCounter(valueEl, target, suffix, duration) {
        const start = performance.now();
        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            valueEl.textContent = Math.floor(eased * target) + (suffix || '');
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
        const counterObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                if (el.dataset.counted) return;
                el.dataset.counted = '1';
                const valueEl = el.querySelector('[data-counter-value]');
                if (valueEl) {
                    animateCounter(
                        valueEl,
                        parseInt(el.dataset.counter, 10),
                        el.dataset.suffix || '',
                        reduceMotion ? 0 : 1800
                    );
                }
                counterObs.unobserve(el);
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('[data-counter]').forEach(el => counterObs.observe(el));
    }
})();
