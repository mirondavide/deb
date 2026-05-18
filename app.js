// ===== AUDIO ENGINE =====
let audioCtx = null;
let noiseBuffer = null;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const len = audioCtx.sampleRate * 0.1;
    noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
}

function typeSound() {
    if (!audioCtx) return;
    const ctx = audioCtx;
    const t = ctx.currentTime;
    const p = 0.9 + Math.random() * 0.2;

    const s1 = ctx.createBufferSource(); s1.buffer = noiseBuffer;
    const f1 = ctx.createBiquadFilter(); f1.type = 'lowpass'; f1.frequency.value = 600 * p; f1.Q.value = 0.7;
    const g1 = ctx.createGain(); g1.gain.setValueAtTime(0.22, t); g1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s1.connect(f1); f1.connect(g1); g1.connect(ctx.destination); s1.start(t); s1.stop(t + 0.05);

    const s2 = ctx.createBufferSource(); s2.buffer = noiseBuffer;
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 4000 * p; f2.Q.value = 2;
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.10, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
    s2.connect(f2); f2.connect(g2); g2.connect(ctx.destination); s2.start(t); s2.stop(t + 0.02);
}

document.addEventListener('keydown', (e) => {
    if (!audioCtx) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') typeSound();
});

// ===== TYPEWRITER ENGINE =====
function typewrite(container, lines, onDone) {
    container.innerHTML = '';
    let lineIdx = 0;

    function nextLine() {
        if (lineIdx >= lines.length) {
            const cursorEl = document.createElement('span');
            cursorEl.className = 'cursor';
            container.appendChild(cursorEl);
            if (onDone) onDone();
            return;
        }

        const cfg = lines[lineIdx];
        lineIdx++;

        if (cfg.type === 'spacer') {
            const sp = document.createElement('div');
            sp.className = 'spacer';
            container.appendChild(sp);
            setTimeout(nextLine, 60);
            return;
        }

        const el = document.createElement('div');
        el.className = 'line' + (cfg.body ? ' line-body' : '');
        if (cfg.cls) el.className += ' ' + cfg.cls;
        if (cfg.id) el.id = cfg.id;
        container.appendChild(el);

        if (cfg.menu) {
            const a = document.createElement('span');
            a.className = 'menu-item' + (cfg.boxed ? ' boxed' : '');
            a.id = cfg.menuId || '';
            el.appendChild(a);
            typeChars(a, cfg.text, 0, () => {
                setTimeout(nextLine, cfg.pause || 90);
            });
        } else {
            typeChars(el, cfg.text, 0, () => {
                setTimeout(nextLine, cfg.pause || 90);
            });
        }
    }

    function typeChars(el, text, idx, done) {
        if (idx >= text.length) { done(); return; }
        el.textContent += text[idx];
        typeSound();
        const ch = text[idx];
        let delay = 20 + Math.random() * 15;
        if (ch === ' ') delay = 12 + Math.random() * 8;
        if (ch === '.' || ch === '—' || ch === ',') delay = 42 + Math.random() * 25;
        setTimeout(() => typeChars(el, text, idx + 1, done), delay);
    }

    nextLine();
}

// ===== PAGE DEFINITIONS =====
const homeLines = [
    { text: 'DEBUT / COMING SOON TO IOS & ANDROID' },
    { type: 'spacer' },
    { text: 'WAITLIST OPEN NOW' },
    { type: 'spacer' },
    { text: '[1] APPLY', menu: true, boxed: true, menuId: 'menuApply', pause: 80 },
    { type: 'spacer' },
    { text: '[2] MANIFESTO', menu: true, menuId: 'menuManifesto', pause: 80 },
    { type: 'spacer' },
    { text: '[3] FAQ', menu: true, menuId: 'menuFaq', pause: 80 },
];

const applyLines = [
    { text: 'JOIN THE WAITLIST' },
    { type: 'spacer' },
    { text: 'be among the first to experience debut.', body: true },
];

const manifestoLines = [
    { text: 'MANIFESTO' },
    { type: 'spacer' },
    { text: 'job hunting is broken. debut fixes it.', body: true },
    { type: 'spacer' },
    { text: 'swipe through curated startup roles. apply instantly. no cover letters, no forms, no friction.', body: true },
    { type: 'spacer' },
    { text: 'ONE SWIPE. ONE PROFILE. ZERO FRICTION.' },
];

// FAQ accordion logic
document.getElementById('faqAccordion').addEventListener('click', (e) => {
    const item = e.target.closest('.faq-item');
    if (!item) return;
    const wasActive = item.classList.contains('active-item');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active-item'));
    if (!wasActive) item.classList.add('active-item');
});

// ===== NAVIGATION =====
const pages = {
    home: document.getElementById('homePage'),
    apply: document.getElementById('applyPage'),
    manifesto: document.getElementById('manifestoPage'),
    faq: document.getElementById('faqPage'),
};

const visitedPages = {};

function renderInstant(container, lines, onDone) {
    container.innerHTML = '';
    lines.forEach(cfg => {
        if (cfg.type === 'spacer') {
            const sp = document.createElement('div');
            sp.className = 'spacer';
            container.appendChild(sp);
            return;
        }
        const el = document.createElement('div');
        el.className = 'line' + (cfg.body ? ' line-body' : '');
        if (cfg.cls) el.className += ' ' + cfg.cls;
        if (cfg.id) el.id = cfg.id;
        if (cfg.menu) {
            const a = document.createElement('span');
            a.className = 'menu-item' + (cfg.boxed ? ' boxed' : '');
            a.id = cfg.menuId || '';
            a.textContent = cfg.text;
            el.appendChild(a);
        } else {
            el.textContent = cfg.text;
        }
        container.appendChild(el);
    });
    const cursorEl = document.createElement('span');
    cursorEl.className = 'cursor';
    container.appendChild(cursorEl);
    if (onDone) onDone();
}

function showPage(name) {
    Object.values(pages).forEach(p => p.classList.remove('active'));
    pages[name].classList.add('active');
    window.scrollTo(0, 0);

    if (name === 'home') {
        if (visitedPages.home) {
            renderInstant(document.getElementById('homeContent'), homeLines, () => {
                document.getElementById('homeFooter').style.opacity = '1';
                bindMenuClicks();
            });
        } else {
            typewrite(document.getElementById('homeContent'), homeLines, () => {
                document.getElementById('homeFooter').style.opacity = '1';
                bindMenuClicks();
            });
        }
        visitedPages.home = true;
    } else if (name === 'apply') {
        const form = document.getElementById('waitlistForm');
        form.style.display = 'none';
        document.getElementById('successState').classList.remove('active');
        document.getElementById('errorMsg').classList.remove('active');
        if (visitedPages.apply) {
            renderInstant(document.getElementById('applyContent'), applyLines, () => {
                form.style.display = 'block';
            });
        } else {
            typewrite(document.getElementById('applyContent'), applyLines, () => {
                form.style.display = 'block';
            });
        }
        visitedPages.apply = true;
    } else if (name === 'manifesto') {
        if (visitedPages.manifesto) {
            renderInstant(document.getElementById('manifestoContent'), manifestoLines);
        } else {
            typewrite(document.getElementById('manifestoContent'), manifestoLines);
        }
        visitedPages.manifesto = true;
    } else if (name === 'faq') {
        document.querySelectorAll('.faq-item').forEach((el, i) => {
            el.classList.toggle('active-item', i === 0);
        });
    }
}

function bindMenuClicks() {
    const a = document.getElementById('menuApply');
    const m = document.getElementById('menuManifesto');
    const f = document.getElementById('menuFaq');
    if (a) a.addEventListener('click', () => showPage('apply'));
    if (m) m.addEventListener('click', () => showPage('manifesto'));
    if (f) f.addEventListener('click', () => showPage('faq'));
}

document.getElementById('backFromApply').addEventListener('click', () => showPage('home'));
document.getElementById('backFromManifesto').addEventListener('click', () => showPage('home'));
document.getElementById('backFromFaq').addEventListener('click', () => showPage('home'));

let selectedMenu = 0;
const menuTargets = ['apply', 'manifesto', 'faq'];

function updateMenuHighlight() {
    const items = document.querySelectorAll('#homeContent .menu-item');
    items.forEach((el, i) => {
        if (i === selectedMenu) el.classList.add('boxed');
        else el.classList.remove('boxed');
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { showPage('home'); return; }

    if (pages.home.classList.contains('active')) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

        if (e.key === 'ArrowDown' || e.key === 'j') {
            e.preventDefault();
            selectedMenu = (selectedMenu + 1) % 3;
            updateMenuHighlight();
        } else if (e.key === 'ArrowUp' || e.key === 'k') {
            e.preventDefault();
            selectedMenu = (selectedMenu - 1 + 3) % 3;
            updateMenuHighlight();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            showPage(menuTargets[selectedMenu]);
        } else if (e.key === '1') { selectedMenu = 0; showPage('apply'); }
        else if (e.key === '2') { selectedMenu = 1; showPage('manifesto'); }
        else if (e.key === '3') { selectedMenu = 2; showPage('faq'); }
    }

    if (pages.faq.classList.contains('active')) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
        const faqItems = document.querySelectorAll('.faq-item');
        const activeIdx = [...faqItems].findIndex(el => el.classList.contains('active-item'));

        if (e.key === 'ArrowDown' || e.key === 'j') {
            e.preventDefault();
            const next = (activeIdx + 1) % faqItems.length;
            faqItems.forEach(el => el.classList.remove('active-item'));
            faqItems[next].classList.add('active-item');
            faqItems[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });

        } else if (e.key === 'ArrowUp' || e.key === 'k') {
            e.preventDefault();
            const prev = (activeIdx - 1 + faqItems.length) % faqItems.length;
            faqItems.forEach(el => el.classList.remove('active-item'));
            faqItems[prev].classList.add('active-item');
            faqItems[prev].scrollIntoView({ block: 'nearest', behavior: 'smooth' });

        }
    }
});

// ===== BOOT =====
function boot() {

    showPage('home');
}


// ================================================================
//  POST-PROCESSING OVERLAY — scanlines, grain, vignette, bloom
// ================================================================
var PostFX = (function() {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:1001;pointer-events:none;';
    document.getElementById('intro-container').appendChild(canvas);
    var ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function render(time, warpProgress) {
        var W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Scanlines — subtle horizontal bands
        var scanAlpha = 0.04 + warpProgress * 0.06;
        ctx.fillStyle = 'rgba(0,0,0,' + scanAlpha + ')';
        for (var y = 0; y < H; y += 3) {
            ctx.fillRect(0, y, W, 1);
        }

        // Film grain
        var grainAlpha = 0.015 + warpProgress * 0.02;
        var grainData = ctx.createImageData(W >> 2, H >> 2);
        var d = grainData.data;
        for (var i = 0; i < d.length; i += 4) {
            var v = Math.random() * 255;
            d[i] = 0; d[i+1] = v * 0.3; d[i+2] = 0; d[i+3] = v * grainAlpha * 8;
        }
        ctx.save();
        ctx.scale(4, 4);
        ctx.putImageData(grainData, 0, 0);
        ctx.restore();

        // Vignette
        var vigAlpha = 0.35 + warpProgress * 0.15;
        var grad = ctx.createRadialGradient(W/2, H/2, W*0.25, W/2, H/2, W*0.7);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,' + vigAlpha + ')');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Bloom glow (subtle green radial glow centered on screen area)
        var bloomAlpha = 0.03 + warpProgress * 0.04;
        var bgrad = ctx.createRadialGradient(W*0.5, H*0.42, 0, W*0.5, H*0.42, W*0.35);
        bgrad.addColorStop(0, 'rgba(0,255,65,' + bloomAlpha + ')');
        bgrad.addColorStop(1, 'rgba(0,255,65,0)');
        ctx.fillStyle = bgrad;
        ctx.fillRect(0, 0, W, H);
    }

    function destroy() {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    return { render: render, destroy: destroy, canvas: canvas };
})();

// ================================================================
//  GLITCH TRANSITION OVERLAY
// ================================================================
var GlitchFX = (function() {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:1003;pointer-events:none;mix-blend-mode:screen;';
    document.getElementById('intro-container').appendChild(canvas);
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    function render(intensity) {
        var W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        if (intensity < 0.01) return;

        // Noise blocks
        var blockCount = Math.floor(intensity * 25);
        for (var i = 0; i < blockCount; i++) {
            var bx = Math.random() * W;
            var by = Math.random() * H;
            var bw = 20 + Math.random() * 80 * intensity;
            var bh = 2 + Math.random() * 8;
            ctx.fillStyle = 'rgba(0,255,65,' + (Math.random() * intensity * 0.4) + ')';
            ctx.fillRect(bx, by, bw, bh);
        }

        // Horizontal slice displacement
        if (intensity > 0.15) {
            var sliceCount = Math.floor(intensity * 8);
            for (var s = 0; s < sliceCount; s++) {
                var sy = Math.floor(Math.random() * H);
                var sh = 1 + Math.floor(Math.random() * 6 * intensity);
                var sx = (Math.random() - 0.5) * 40 * intensity;
                try {
                    var slice = ctx.getImageData(0, sy, W, sh);
                    ctx.putImageData(slice, sx, sy);
                } catch(e) {}
            }
        }

        // Screen tear lines
        var tearCount = Math.floor(intensity * 6);
        for (var t = 0; t < tearCount; t++) {
            var ty = Math.random() * H;
            ctx.strokeStyle = 'rgba(0,255,65,' + (0.15 + intensity * 0.3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, ty);
            ctx.lineTo(W, ty + (Math.random() - 0.5) * 4);
            ctx.stroke();
        }

        // Flash frames (only at high intensity)
        if (intensity > 0.5 && Math.random() < intensity * 0.15) {
            ctx.fillStyle = 'rgba(0,255,65,' + (intensity * 0.12) + ')';
            ctx.fillRect(0, 0, W, H);
        }

        // White flash at very end
        if (intensity > 0.85 && Math.random() < 0.08) {
            ctx.fillStyle = 'rgba(255,255,255,' + (intensity * 0.08) + ')';
            ctx.fillRect(0, 0, W, H);
        }
    }

    function destroy() {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }

    return { render: render, destroy: destroy };
})();

// ===== FORM HANDLING =====
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeUitUmMJc55uMaEtBLHF1H1LOcRME3DTVtTG1iI3Gdjpcb6w/formResponse';

document.getElementById('waitlistForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.classList.remove('active');

    const email = document.getElementById('email').value.trim().toLowerCase();
    const linkedin = document.getElementById('linkedin').value.trim();
    const price = document.getElementById('price').value;
    const role = document.getElementById('role').value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMsg.textContent = 'error: invalid email address.';
        errorMsg.classList.add('active');
        return;
    }

    if (linkedin && !linkedin.match(/^https?:\/\/(www\.)?linkedin\.com\//)) {
        errorMsg.textContent = 'error: invalid linkedin url.';
        errorMsg.classList.add('active');
        return;
    }

    if (!price || isNaN(price) || Number(price) < 0) {
        errorMsg.textContent = 'error: price must be 0 or more.';
        errorMsg.classList.add('active');
        return;
    }

    if (!role) {
        errorMsg.textContent = 'error: select your background.';
        errorMsg.classList.add('active');
        return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = '[ SUBMITTING... ]';

    const formData = new FormData();
    formData.append('entry.1987568372', email);
    formData.append('entry.1176068081', linkedin);
    formData.append('entry.90417696', price);
    formData.append('entry.1087707908', role);

    try {
        await fetch(GOOGLE_FORM_URL, { method: 'POST', mode: 'no-cors', body: formData });
        document.getElementById('waitlistForm').style.display = 'none';
        document.getElementById('successState').classList.add('active');
    } catch (err) {
        errorMsg.textContent = 'error: something went wrong. try again.';
        errorMsg.classList.add('active');
        btn.disabled = false;
        btn.textContent = '[ SUBMIT ]';
    }
});

// ===== BACKGROUND MUSIC =====
var bgMusic = new Audio('bg-music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0;

var musicBtn = document.getElementById('musicToggle');
var musicPlaying = false;
var musicFadeInterval = null;

function fadeInMusic() {
    bgMusic.currentTime = 15;
    bgMusic.volume = 0;
    bgMusic.play().then(function() {
        musicPlaying = true;
        musicBtn.style.display = 'block';
        musicBtn.textContent = '♪ MUSIC: ON';
        var vol = 0;
        clearInterval(musicFadeInterval);
        musicFadeInterval = setInterval(function() {
            vol += 0.02;
            if (vol >= 0.15) {
                vol = 0.15;
                clearInterval(musicFadeInterval);
            }
            bgMusic.volume = vol;
        }, 40);
    }).catch(function() {
        musicBtn.style.display = 'block';
        musicBtn.textContent = '♪ MUSIC: OFF';
    });
}

musicBtn.addEventListener('click', function() {
    if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        musicBtn.textContent = '♪ MUSIC: OFF';
    } else {
        bgMusic.currentTime = bgMusic.currentTime || 15;
        bgMusic.volume = 0.15;
        bgMusic.play();
        musicPlaying = true;
        musicBtn.textContent = '♪ MUSIC: ON';
    }
});
