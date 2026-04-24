const PUZZLES = [
    { id: 'landscape-painting', title: 'Manzara Resmi', image: 'https://e0.pxfuel.com/wallpapers/887/741/desktop-wallpaper-landscape-painting-nature-drawing.jpg', pieces: 1000, difficulty: 4 },
    { id: 'natural-drawing', title: 'Doğal Çizim', image: 'https://e0.pxfuel.com/wallpapers/490/378/desktop-wallpaper-natural-drawing-nature-drawing.jpg', pieces: 100, difficulty: 1 },
    { id: 'japanese-forest', title: 'Japon Ormanı', image: 'https://e1.pxfuel.com/desktop-wallpaper/735/26/desktop-wallpaper-japanese-landscape-painting-forest-painting.jpg', pieces: 500, difficulty: 3 },
    { id: 'digital-art', title: 'Dijital Sanat', image: 'https://c4.wallpaperflare.com/wallpaper/692/608/59/digital-digital-art-artwork-illustration-drawing-hd-wallpaper-preview.jpg', pieces: 250, difficulty: 2 },
    { id: 'color-drawing', title: 'Renkli Çizim', image: 'https://c4.wallpaperflare.com/wallpaper/814/140/833/drawing-wallpaper-preview.jpg', pieces: 1000, difficulty: 4 },
    { id: 'foggy-scenery', title: 'Sisli Manzara', image: 'https://4kwallpapers.com/images/wallpapers/foggy-scenery-3840x2160-14972.jpg', pieces: 500, difficulty: 3 },
    { id: 'abstract-landscape', title: 'Soyut Manzara', image: 'https://e1.pxfuel.com/desktop-wallpaper/810/913/desktop-wallpaper-landscape-painting-abstract-landscape-real-painting.jpg', pieces: 1000, difficulty: 4 }
];

let currentGame = null;
let currentFilter = 'all';

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => document.getElementById('loading-screen').classList.add('hide'), 1200);

    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    });

    const theme = localStorage.getItem('puzzlecraft_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);

    renderPuzzleGrid();
});

// ── THEME ──
function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('puzzlecraft_theme', next);
    updateThemeIcon(next);
}
function updateThemeIcon(t) {
    const i = document.querySelector('.theme-toggle i');
    if (i) i.className = t === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// ── NAV ──
function showHome() {
    ['hero-section'].forEach(id => document.getElementById(id).classList.remove('hidden'));
    document.querySelector('.announcements').classList.remove('hidden');
    document.querySelector('.gallery-section').classList.remove('hidden');
    document.getElementById('saved-section').classList.add('hidden');
    document.getElementById('game-section').classList.add('hidden');
    document.getElementById('footer').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    setActiveNav('home');
    document.body.style.overflow = '';
}

function showSaved() {
    document.getElementById('hero-section').classList.add('hidden');
    document.querySelector('.announcements').classList.add('hidden');
    document.querySelector('.gallery-section').classList.add('hidden');
    document.getElementById('saved-section').classList.remove('hidden');
    document.getElementById('game-section').classList.add('hidden');
    document.getElementById('footer').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    setActiveNav('saved');
    document.body.style.overflow = '';
    renderSavedGames();
}

function showGame() {
    document.getElementById('hero-section').classList.add('hidden');
    document.querySelector('.announcements').classList.add('hidden');
    document.querySelector('.gallery-section').classList.add('hidden');
    document.getElementById('saved-section').classList.add('hidden');
    document.getElementById('game-section').classList.remove('hidden');
    document.getElementById('footer').classList.add('hidden');
    document.getElementById('navbar').classList.add('hidden');
    document.body.style.overflow = 'hidden';
}

function setActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
}

function scrollToPuzzles() {
    document.getElementById('puzzles').scrollIntoView({ behavior: 'smooth' });
}

// ── GRID ──
function renderPuzzleGrid() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';
    const list = currentFilter === 'all' ? PUZZLES : PUZZLES.filter(p => p.pieces === currentFilter);

    list.forEach(puzzle => {
        const hasSave = Storage.hasSave(puzzle.id);
        const save = Storage.getSave(puzzle.id);
        const progress = save ? (save.progress || 0) : 0;
        const badgeClass = puzzle.pieces <= 100 ? 'p100' : puzzle.pieces <= 250 ? 'p250' : puzzle.pieces <= 500 ? 'p500' : 'p1000';
        const dots = Array.from({ length: 4 }, (_, i) => `<div class="diff-dot ${i < puzzle.difficulty ? 'active' : ''}"></div>`).join('');

        const card = document.createElement('div');
        card.className = 'puzzle-card';
        card.onclick = () => startPuzzle(puzzle.id);
        card.innerHTML = `
            <div class="card-image">
                <img src="${puzzle.image}" alt="${puzzle.title}" loading="lazy">
                <div class="card-overlay"><div class="play-btn-overlay"><i class="fas fa-play"></i></div></div>
                <span class="piece-badge ${badgeClass}">${puzzle.pieces} Parça</span>
                <div class="difficulty-dots">${dots}</div>
            </div>
            <div class="card-body">
                <div class="card-title">${puzzle.title}</div>
                <div class="card-meta">
                    <div class="card-pieces"><i class="fas fa-puzzle-piece"></i><span>${puzzle.pieces} parça</span></div>
                    <button class="card-action">${hasSave ? '<i class="fas fa-play"></i> Devam Et' : '<i class="fas fa-play"></i> Başla'}</button>
                </div>
                ${hasSave ? `<div class="card-progress-bar"><div class="card-progress-fill" style="width:${progress}%"></div></div><div class="card-saved-info"><span>%${progress} tamamlandı</span><span>${timeAgo(save.lastPlayed)}</span></div>` : ''}
            </div>`;
        grid.appendChild(card);
    });
}

function filterPuzzles(f) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const v = btn.textContent.includes('Tümü') ? 'all' : parseInt(btn.textContent);
        btn.classList.toggle('active', v === f);
    });
    renderPuzzleGrid();
}

// ── SAVED ──
function renderSavedGames() {
    const grid = document.getElementById('saved-grid');
    const noEl = document.getElementById('no-saves');
    const saves = Storage.getAllSaves();
    const entries = Object.entries(saves);

    if (!entries.length) { grid.classList.add('hidden'); noEl.classList.remove('hidden'); return; }
    grid.classList.remove('hidden'); noEl.classList.add('hidden');
    grid.innerHTML = '';

    entries.sort((a, b) => b[1].lastPlayed - a[1].lastPlayed).forEach(([pid, save]) => {
        const puzzle = PUZZLES.find(p => p.id === pid);
        if (!puzzle) return;
        const progress = save.progress || 0;
        const badgeClass = puzzle.pieces <= 100 ? 'p100' : puzzle.pieces <= 250 ? 'p250' : puzzle.pieces <= 500 ? 'p500' : 'p1000';

        const card = document.createElement('div');
        card.className = 'puzzle-card';
        card.onclick = () => startPuzzle(pid);
        card.innerHTML = `
            <div class="card-image">
                <img src="${puzzle.image}" alt="${puzzle.title}" loading="lazy">
                <div class="card-overlay"><div class="play-btn-overlay"><i class="fas fa-play"></i></div></div>
                <span class="piece-badge ${badgeClass}">${puzzle.pieces} Parça</span>
            </div>
            <div class="card-body">
                <div class="card-title">${puzzle.title}</div>
                <div class="card-meta">
                    <div class="card-pieces"><i class="fas fa-puzzle-piece"></i><span>${save.placedCount || 0}/${save.totalPieces || puzzle.pieces}</span></div>
                    <button class="card-action"><i class="fas fa-play"></i> Devam Et</button>
                </div>
                <div class="card-progress-bar"><div class="card-progress-fill" style="width:${progress}%"></div></div>
                <div class="card-saved-info"><span>%${progress}</span><span>${timeAgo(save.lastPlayed)}</span></div>
            </div>`;
        grid.appendChild(card);
    });
}

// ── GAME ──
async function startPuzzle(puzzleId) {
    const puzzle = PUZZLES.find(p => p.id === puzzleId);
    if (!puzzle) return;

    showGame();

    document.getElementById('preview-image').src = puzzle.image;
    document.getElementById('pieces-info').textContent = `0/${puzzle.pieces}`;
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = '0%';
    document.getElementById('complete-modal').classList.add('hidden');

    if (currentGame) currentGame.destroy();

    const canvas = document.getElementById('puzzle-canvas');
    const saved = Storage.getSave(puzzleId);

    currentGame = new PuzzleGame(canvas, puzzle.image, puzzle.pieces, puzzleId);
    currentGame.onComplete = (time, pieces) => {
        document.getElementById('complete-time').textContent = time;
        document.getElementById('complete-pieces').textContent = pieces;
        document.getElementById('complete-message').textContent = `${puzzle.title} puzzle'ını ${time} sürede tamamladınız!`;
        document.getElementById('complete-modal').classList.remove('hidden');
        createConfetti();
    };

    try {
        await currentGame.load(saved);
    } catch (e) {
        console.error(e);
        alert('Resim yüklenemedi. Lütfen tekrar deneyin.');
        exitGame();
    }
}

function exitGame() {
    if (currentGame) { currentGame._autoSave(); currentGame.destroy(); currentGame = null; }
    showHome();
    renderPuzzleGrid();
}

function replayPuzzle() {
    if (!currentGame) return;
    const pid = currentGame.puzzleId;
    Storage.deleteSave(pid);
    document.getElementById('complete-modal').classList.add('hidden');
    startPuzzle(pid);
}

// ── CONTROLS ──
function togglePreview() { document.getElementById('preview-overlay').classList.toggle('hidden'); }
function toggleEdgeMode() { if (currentGame) { const a = currentGame.toggleEdges(); document.getElementById('edge-btn').classList.toggle('active', a); } }
function doZoomIn() { if (currentGame) currentGame.zoomIn(); }
function doZoomOut() { if (currentGame) currentGame.zoomOut(); }
function doResetZoom() { if (currentGame) currentGame.resetZoom(); }

// ── CONFETTI ──
function createConfetti() {
    const c = document.getElementById('confetti');
    c.innerHTML = '';
    if (!document.getElementById('confetti-style')) {
        const s = document.createElement('style');
        s.id = 'confetti-style';
        s.textContent = `@keyframes confFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(500px) rotate(720deg);opacity:0}}`;
        document.head.appendChild(s);
    }
    const colors = ['#6c5ce7','#a29bfe','#fd79a8','#00cec9','#fdcb6e','#e17055'];
    for (let i = 0; i < 50; i++) {
        const d = document.createElement('div');
        d.style.cssText = `position:absolute;width:${5 + Math.random() * 8}px;height:${5 + Math.random() * 8}px;background:${colors[~~(Math.random()*6)]};left:${Math.random()*100}%;top:-10px;border-radius:${Math.random()>.5?'50%':'2px'};animation:confFall ${2+Math.random()*2}s ease-in forwards;animation-delay:${Math.random()*.5}s;opacity:.85;`;
        c.appendChild(d);
    }
}

// ── UTIL ──
function timeAgo(ts) {
    if (!ts) return '';
    const d = Date.now() - ts;
    const m = ~~(d / 60000), h = ~~(d / 3600000), dy = ~~(d / 86400000);
    if (m < 1) return 'Az önce';
    if (m < 60) return m + ' dk önce';
    if (h < 24) return h + ' saat önce';
    return dy + ' gün önce';
}
