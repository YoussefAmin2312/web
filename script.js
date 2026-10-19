/* ========================================
   Moneviq Landing Page - Interactions
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Scroll reveal: stagger siblings that enter together
    const revealObserver = new IntersectionObserver((entries) => {
        let batch = 0;
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.style.setProperty('--reveal-delay', `${Math.min(batch, 5) * 0.08}s`);
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
            batch++;
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    const updateNavbar = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    // Hero panel micro-interaction (desktop only)
    const heroPanels = document.querySelectorAll('[data-hero-panel]');

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

    buildHeatmap();
    initEntryDemo(prefersReducedMotion);
    initHeroSwirl();
});

// Habit heatmap card: 22 weeks x 7 days, quiet at first then building into a habit
function buildHeatmap() {
    const grid = document.querySelector('[data-heatmap]');
    if (!grid) return;

    let seed = 7;
    const random = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    };

    const weeks = 22;
    const cells = [];
    for (let w = 0; w < weeks; w++) {
        for (let d = 0; d < 7; d++) {
            let level = 0;
            if (w >= 8) {
                const weekday = d < 5 ? 0.35 : 0;
                const r = random() + weekday;
                level = r > 1.15 ? 4 : r > 0.9 ? 3 : r > 0.6 ? 2 : r > 0.3 ? 1 : 0;
            }
            cells.push(`<i data-l="${level}" style="--i:${w * 7 + d}"></i>`);
        }
    }
    grid.innerHTML = cells.join('');
}

// Smart Entry demo: types a sentence, then shows the parsed transactions
function initEntryDemo(reducedMotion) {
    const demo = document.querySelector('[data-entry-demo]');
    if (!demo) return;

    const textEl = demo.querySelector('[data-entry-text]');
    const resultsEl = demo.querySelector('[data-entry-results]');

    const examples = [
        {
            text: 'coffee $5, lunch $12',
            rows: [
                { name: 'Coffee', cat: 'Food', amt: '-$5.00', ico: 'F', color: '#f5b971' },
                { name: 'Lunch', cat: 'Food', amt: '-$12.00', ico: 'F', color: '#f5b971' }
            ]
        },
        {
            text: 'uber ride 23 dollars',
            rows: [
                { name: 'Uber ride', cat: 'Transport', amt: '-$23.00', ico: 'T', color: '#c4b5fd' }
            ]
        },
        {
            text: 'got 500 salary',
            rows: [
                { name: 'Salary', cat: 'Income', amt: '+$500.00', ico: '$', color: '#34d399', income: true }
            ]
        }
    ];

    const renderRows = (rows) => {
        resultsEl.innerHTML = rows.map((row, i) => `
            <div class="entry-row" style="animation-delay:${i * 0.12}s">
                <span class="entry-row-ico" style="--c:${row.color}">${row.ico}</span>
                <span>
                    <div class="entry-row-name">${row.name}</div>
                    <div class="entry-row-cat">${row.cat}</div>
                </span>
                <span class="entry-row-amt${row.income ? ' income' : ''}">${row.amt}</span>
            </div>`).join('');
    };

    if (reducedMotion) {
        textEl.textContent = examples[0].text;
        renderRows(examples[0].rows);
        return;
    }

    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    let started = false;

    const run = async () => {
        for (let n = 0; ; n = (n + 1) % examples.length) {
            const ex = examples[n];
            resultsEl.innerHTML = '';
            textEl.textContent = '';
            await wait(400);
            for (const ch of ex.text) {
                textEl.textContent += ch;
                await wait(45 + Math.random() * 45);
            }
            await wait(350);
            demo.classList.add('sending');
            await wait(250);
            demo.classList.remove('sending');
            renderRows(ex.rows);
            await wait(2600);
        }
    };

    new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            obs.disconnect();
            run();
        }
    }, { threshold: 0.3 }).observe(demo);
}

function initHeroSwirl() {
    const container = document.querySelector('.hero .content--canvas');
    if (!container) return;

    const TAU = Math.PI * 2;
    const cos = Math.cos;
    const sin = Math.sin;

    const rand = (n = 1) => Math.random() * n;
    const randRange = (n) => (Math.random() - 0.5) * 2 * n;
    const lerp = (a, b, t) => a + (b - a) * t;
    const fadeInOut = (t, m) => {
        const half = m / 2;
        if (t < half) return Math.max(t / half, 0);
        return Math.max(1 - (t - half) / half, 0);
    };

    const grad3 = new Float32Array([
        1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
        1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
        0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
    ]);

    class SimplexNoise {
        constructor(random = Math.random) {
            this.perm = new Uint8Array(512);
            this.permMod12 = new Uint8Array(512);
            const p = new Uint8Array(256);
            for (let i = 0; i < 256; i++) p[i] = i;
            for (let i = 255; i > 0; i--) {
                const n = Math.floor((i + 1) * random());
                const q = p[i];
                p[i] = p[n];
                p[n] = q;
            }
            for (let i = 0; i < 512; i++) {
                this.perm[i] = p[i & 255];
                this.permMod12[i] = this.perm[i] % 12;
            }
        }

        noise3D(xin, yin, zin) {
            const F3 = 1 / 3;
            const G3 = 1 / 6;
            let n0 = 0, n1 = 0, n2 = 0, n3 = 0;

            const s = (xin + yin + zin) * F3;
            const i = Math.floor(xin + s);
            const j = Math.floor(yin + s);
            const k = Math.floor(zin + s);
            const t = (i + j + k) * G3;
            const X0 = i - t;
            const Y0 = j - t;
            const Z0 = k - t;
            const x0 = xin - X0;
            const y0 = yin - Y0;
            const z0 = zin - Z0;

            let i1 = 0, j1 = 0, k1 = 0;
            let i2 = 0, j2 = 0, k2 = 0;

            if (x0 >= y0) {
                if (y0 >= z0) {
                    i1 = 1; j1 = 0; k1 = 0;
                    i2 = 1; j2 = 1; k2 = 0;
                } else if (x0 >= z0) {
                    i1 = 1; j1 = 0; k1 = 0;
                    i2 = 1; j2 = 0; k2 = 1;
                } else {
                    i1 = 0; j1 = 0; k1 = 1;
                    i2 = 1; j2 = 0; k2 = 1;
                }
            } else {
                if (y0 < z0) {
                    i1 = 0; j1 = 0; k1 = 1;
                    i2 = 0; j2 = 1; k2 = 1;
                } else if (x0 < z0) {
                    i1 = 0; j1 = 1; k1 = 0;
                    i2 = 0; j2 = 1; k2 = 1;
                } else {
                    i1 = 0; j1 = 1; k1 = 0;
                    i2 = 1; j2 = 1; k2 = 0;
                }
            }

            const x1 = x0 - i1 + G3;
            const y1 = y0 - j1 + G3;
            const z1 = z0 - k1 + G3;
            const x2 = x0 - i2 + 2 * G3;
            const y2 = y0 - j2 + 2 * G3;
            const z2 = z0 - k2 + 2 * G3;
            const x3 = x0 - 1 + 3 * G3;
            const y3 = y0 - 1 + 3 * G3;
            const z3 = z0 - 1 + 3 * G3;

            const ii = i & 255;
            const jj = j & 255;
            const kk = k & 255;
            const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]] * 3;
            const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] * 3;
            const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] * 3;
            const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] * 3;

            let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
            if (t0 > 0) {
                t0 *= t0;
                n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
            }

            let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
            if (t1 > 0) {
                t1 *= t1;
                n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
            }

            let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
            if (t2 > 0) {
                t2 *= t2;
                n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
            }

            let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
            if (t3 > 0) {
                t3 *= t3;
                n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
            }

            return 32 * (n0 + n1 + n2 + n3);
        }
    }

    const particleCount = window.innerWidth < 768 ? 350 : 700;
    const particlePropCount = 9;
    const particlePropsLength = particleCount * particlePropCount;
    const rangeY = 100;
    const baseTTL = 50;
    const rangeTTL = 150;
    const baseSpeed = 0.1;
    const rangeSpeed = 2;
    const baseRadius = 1;
    const rangeRadius = 4;
    const baseHue = 220;
    const rangeHue = 100;
    const noiseSteps = 8;
    const xOff = 0.00125;
    const yOff = 0.00125;
    const zOff = 0.0005;
    const backgroundColor = 'hsla(260,40%,5%,1)';

    let canvas;
    let ctx;
    let center;
    let tick;
    let simplex;
    let particleProps;

    function createCanvas() {
        canvas = {
            a: document.createElement('canvas'),
            b: document.createElement('canvas')
        };
        canvas.b.style.position = 'absolute';
        canvas.b.style.inset = '0';
        canvas.b.style.width = '100%';
        canvas.b.style.height = '100%';
        container.appendChild(canvas.b);
        ctx = {
            a: canvas.a.getContext('2d'),
            b: canvas.b.getContext('2d')
        };
        center = [];
    }

    function resize() {
        const { width, height } = container.getBoundingClientRect();
        canvas.a.width = width;
        canvas.a.height = height;
        canvas.b.width = width;
        canvas.b.height = height;
        center[0] = 0.5 * width;
        center[1] = 0.5 * height;
    }

    function initParticles() {
        tick = 0;
        simplex = new SimplexNoise();
        particleProps = new Float32Array(particlePropsLength);
        for (let i = 0; i < particlePropsLength; i += particlePropCount) {
            initParticle(i);
        }
    }

    function initParticle(i) {
        const x = rand(canvas.a.width);
        const y = center[1] + randRange(rangeY);
        const vx = 0;
        const vy = 0;
        const life = 0;
        const ttl = baseTTL + rand(rangeTTL);
        const speed = baseSpeed + rand(rangeSpeed);
        const radius = baseRadius + rand(rangeRadius);
        const hue = baseHue + rand(rangeHue);
        particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
    }

    function drawParticles() {
        for (let i = 0; i < particlePropsLength; i += particlePropCount) {
            updateParticle(i);
        }
    }

    function updateParticle(i) {
        const i2 = 1 + i;
        const i3 = 2 + i;
        const i4 = 3 + i;
        const i5 = 4 + i;
        const i6 = 5 + i;
        const i7 = 6 + i;
        const i8 = 7 + i;
        const i9 = 8 + i;

        const x = particleProps[i];
        const y = particleProps[i2];
        const n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
        const vx = lerp(particleProps[i3], cos(n), 0.5);
        const vy = lerp(particleProps[i4], sin(n), 0.5);
        const life = particleProps[i5];
        const ttl = particleProps[i6];
        const speed = particleProps[i7];
        const x2 = x + vx * speed;
        const y2 = y + vy * speed;
        const radius = particleProps[i8];
        const hue = particleProps[i9];

        drawParticle(x, y, x2, y2, life, ttl, radius, hue);

        const nextLife = life + 1;
        particleProps[i] = x2;
        particleProps[i2] = y2;
        particleProps[i3] = vx;
        particleProps[i4] = vy;
        particleProps[i5] = nextLife;

        if (checkBounds(x2, y2) || nextLife > ttl) initParticle(i);
    }

    function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
        ctx.a.save();
        ctx.a.lineCap = 'round';
        ctx.a.lineWidth = radius;
        ctx.a.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
        ctx.a.beginPath();
        ctx.a.moveTo(x, y);
        ctx.a.lineTo(x2, y2);
        ctx.a.stroke();
        ctx.a.closePath();
        ctx.a.restore();
    }

    function checkBounds(x, y) {
        return x > canvas.a.width || x < 0 || y > canvas.a.height || y < 0;
    }

    function renderGlow() {
        ctx.b.save();
        ctx.b.filter = 'blur(8px) brightness(200%)';
        ctx.b.globalCompositeOperation = 'lighter';
        ctx.b.drawImage(canvas.a, 0, 0);
        ctx.b.restore();

        ctx.b.save();
        ctx.b.filter = 'blur(4px) brightness(200%)';
        ctx.b.globalCompositeOperation = 'lighter';
        ctx.b.drawImage(canvas.a, 0, 0);
        ctx.b.restore();
    }

    function renderToScreen() {
        ctx.b.save();
        ctx.b.globalCompositeOperation = 'lighter';
        ctx.b.drawImage(canvas.a, 0, 0);
        ctx.b.restore();
    }

    function draw() {
        tick++;
        ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
        ctx.b.fillStyle = backgroundColor;
        ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);
        drawParticles();
        renderGlow();
        renderToScreen();
        window.requestAnimationFrame(draw);
    }

    createCanvas();
    resize();
    initParticles();
    draw();

    window.addEventListener('resize', resize);
}
