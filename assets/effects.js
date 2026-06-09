(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── 0. PAGE LOADER ── */
    (function () {
        var loader   = document.getElementById('page-loader');
        if (!loader) return;
        var statusEl = document.getElementById('ld-status');
        var hexEl    = document.getElementById('ld-hex');
        var progFill = document.getElementById('ld-prog-fill');
        var progPct  = document.getElementById('ld-prog-pct');

        var statuses = [
            'LOADING PAGE',
            'PREPARING CONTENT',
            'ALMOST THERE',
            'WELCOME',
            'FASILKOM BELONGS TO US',
            'READY'
        ];
        var hexVals = [
            '0x464153494C4B4F4D',
            '0x55 4C 54 52 41 53',
            '0x46 41 53 49 4C 4B',
            '0x4F 4D 00 E6 39 FF',
            '0x554C545241535F4656'
        ];

        var statusIdx = 0;
        var curProg   = 0;
        var dismissed = false;

        var hexTimer = setInterval(function () {
            hexEl.textContent = hexVals[Math.floor(Math.random() * hexVals.length)];
        }, 380);

        function animProg(target, dur, cb) {
            var t0   = performance.now();
            var from = curProg;
            (function step(now) {
                var t = Math.min((now - t0) / dur, 1);
                var e = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
                curProg = from + (target - from) * e;
                progFill.style.width = curProg + '%';
                progPct.textContent  = Math.floor(curProg) + '%';
                if (t < 1) requestAnimationFrame(step);
                else { curProg = target; if (cb) cb(); }
            })(t0);
        }

        function nextStatus() {
            if (statusIdx < statuses.length - 1) {
                statusIdx++;
                statusEl.textContent = statuses[statusIdx];
            }
        }

        function dismiss() {
            if (dismissed) return;
            dismissed = true;
            clearInterval(hexTimer);
            statusEl.textContent = statuses[statuses.length - 1];
            animProg(100, 350, function () {
                setTimeout(function () {
                    loader.classList.add('ld-out');
                    setTimeout(function () { loader.remove(); }, 750);
                }, 180);
            });
        }

        // Boot sequence
        setTimeout(function () {
            animProg(28, 550, function () {
                nextStatus();
                setTimeout(function () {
                    animProg(58, 750, function () {
                        nextStatus();
                        setTimeout(function () {
                            animProg(82, 600, function () { nextStatus(); });
                        }, 300);
                    });
                }, 380);
            });
        }, 150);

        if (document.readyState === 'complete') {
            setTimeout(dismiss, 600);
        } else {
            window.addEventListener('load', function () { setTimeout(dismiss, 300); });
        }
        setTimeout(dismiss, 4200);
    })();

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
