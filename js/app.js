// ========== PUZZLE DATA ==========
const PUZZLES = [
    {
        id: 'landscape-painting',
        title: 'Manzara Resmi',
        image: 'https://e0.pxfuel.com/wallpapers/887/741/desktop-wallpaper-landscape-painting-nature-drawing.jpg',
        pieces: 1000,
        difficulty: 4
    },
    {
        id: 'natural-drawing',
        title: 'Doğal Çizim',
        image: 'https://e0.pxfuel.com/wallpapers/490/378/desktop-wallpaper-natural-drawing-nature-drawing.jpg',
        pieces: 100,
        difficulty: 1
    },
    {
        id: 'japanese-forest',
        title: 'Japon Ormanı',
        image: 'https://e1.pxfuel.com/desktop-wallpaper/735/26/desktop-wallpaper-japanese-landscape-painting-forest-painting.jpg',
        pieces: 500,
        difficulty: 3
    },
    {
        id: 'digital-art',
        title: 'Dijital Sanat',
        image: 'https://c4.wallpaperflare.com/wallpaper/692/608/59/digital-digital-art-artwork-illustration-drawing-hd-wallpaper-preview.jpg',
        pieces: 250,
        difficulty: 2
    },
    {
        id: 'color-drawing',
        title: 'Renkli Çizim',
        image: 'https://c4.wallpaperflare.com/wallpaper/814/140/833/drawing-wallpaper-preview.jpg',
        pieces: 1000,
        difficulty: 4
    },
    {
        id: 'foggy-scenery',
        title: 'Sisli Manzara',
        image: 'https://4kwallpapers.com/images/wallpapers/foggy-scenery-3840x2160-14972.jpg',
        pieces: 500,
        difficulty: 3
    },
    {
        id: 'abstract-landscape',
        title: 'Soyut Manzara',
        image: 'https://e1.pxfuel.com/desktop-wallpaper/810/913/desktop-wallpaper-landscape-painting-abstract-landscape-real-painting.jpg',
        pieces: 1000,
        difficulty: 4
    }
];

let currentGame = null;
let currentFilter = 'all';

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    // Loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hide');
    }, 1500);

    // Scroll handling for navbar
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Theme
    const savedTheme = localStorage.getItem('puzzlecraft_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Render puzzles
    renderPuzzleGrid();

    // Context menu prevention on canvas
    document.addEventListener('contextmenu', e => {
        if (e.target.tagName === 'CANVAS') e.preventDefault();
    });
});

// ========== THEME ==========
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('puzzlecraft_theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.querySelector('.theme-toggle i');
    if (btn) {
        btn.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// ========== NAVIGATION ==========
function showHome() {
    document.getElementById('hero-section').classList.remove('hidden');
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
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
}

function scrollToPuzzles() {
    document.getElementById('puzzles').scrollIntoView({ behavior: 'smooth' });
}

// ========== RENDER PUZZLE GRID ==========
function renderPuzzleGrid() {
    const grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    const filtered = currentFilter === 'all'
        ? PUZZLES
        : PUZZLES.filter(p => p.pieces === currentFilter);

    filtered.forEach(puzzle => {
        const hasSave = Storage.hasSave(puzzle.id);
        const save = Storage.getSave(puzzle.id);
        const progress = save ? (save.progress || 0) : 0;

        const diffDots = Array.from({ length: 4 }, (_, i) =>
            `<div class="diff-dot ${i < puzzle.difficulty ? 'active' : ''}"></div>`
        ).join('');

        const pieceBadgeClass = `p${puzzle.pieces <= 100 ? 100 : puzzle.pieces <= 250 ? 250 : puzzle.pieces <= 500 ? 500 : 1000}`;

        const card = document.createElement('div');
        card.className = 'puzzle-card';
        card.dataset.pieces = puzzle.pieces;
        card.onclick = () => startPuzzle(puzzle.id);

        card.innerHTML = `
            <div class="card-image">
                <img src="${puzzle.image}" alt="${puzzle.title}" loading="lazy" crossorigin="anonymous">
                <div class="card-overlay">
                    <div class="play-btn-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <span class="piece-badge ${pieceBadgeClass}">${puzzle.pieces} Parça</span>
                <div class="difficulty-dots">${diffDots}</div>
            </div>
            <div class="card-body">
                <div class="card-title">${puzzle.title}</div>
                <div class="card-meta">
                    <div class="card-pieces">
                        <i class="fas fa-puzzle-piece"></i>
                        <span>${puzzle.pieces} parça</span>
                    </div>
                    <button class="card-action">
                        ${hasSave ? '<i class="fas fa-play"></i> Devam Et' : '<i class="fas fa-play"></i> Başla'}
                    </button>
                </div>
                ${hasSave ? `
                    <div class="card-progress-bar">
                        <div class="card-progress-fill" style="width:${progress}%"></div>
                    </div>
                    <div class="card-saved-info">
                        <span>%${progress} tamamlandı</span>
                        <span>${getTimeAgo(save.lastPlayed)}</span>
                    </div>
                ` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterPuzzles(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const val = btn.textContent.includes('Tümü') ? 'all' : parseInt(btn.textContent);
        btn.classList.toggle('active', val === filter);
    });
    renderPuzzleGrid();
}

// ========== SAVED GAMES ==========
function renderSavedGames() {
    const grid = document.getElementById('saved-grid');
    const noSaves = document.getElementById('no-saves');
    const saves = Storage.getAllSaves();
    const saveEntries = Object.entries(saves);

    if (saveEntries.length === 0) {
        grid.classList.add('hidden');
        noSaves.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    noSaves.classList.add('hidden');
    grid.innerHTML = '';

    saveEntries
        .sort((a, b) => b[1].lastPlayed - a[1].lastPlayed)
        .forEach(([puzzleId, save]) => {
            const puzzle = PUZZLES.find(p => p.id === puzzleId);
            if (!puzzle) return;

            const progress = save.progress || 0;
            const card = document.createElement('div');
            card.className = 'puzzle-card';
            card.onclick = () => startPuzzle(puzzleId);

            card.innerHTML = `
                <div class="card-image">
                    <img src="${puzzle.image}" alt="${puzzle.title}" loading="lazy" crossorigin="anonymous">
                    <div class="card-overlay">
                        <div class="play-btn-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <span class="piece-badge p${puzzle.pieces <= 100 ? 100 : puzzle.pieces <= 250 ? 250 : puzzle.pieces <= 500 ? 500 : 1000}">${puzzle.pieces} Parça</span>
                </div>
                <div class="card-body">
                    <div class="card-title">${puzzle.title}</div>
                    <div class="card-meta">
                        <div class="card-pieces">
                            <i class="fas fa-puzzle-piece"></i>
                            <span>${save.placedCount || 0}/${save.totalPieces || puzzle.pieces}</span>
                        </div>
                        <button class="card-action">
                            <i class="fas fa-play"></i> Devam Et
                        </button>
                    </div>
                    <div class="card-progress-bar">
                        <div class="card-progress-fill" style="width:${progress}%"></div>
                    </div>
                    <div class="card-saved-info">
                        <span>%${progress} tamamlandı</span>
                        <span>${getTimeAgo(save.lastPlayed)}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
}

// ========== START PUZZLE ==========
async function startPuzzle(puzzleId) {
    const puzzle = PUZZLES.find(p => p.id === puzzleId);
    if (!puzzle) return;

    showGame();

    const canvas = document.getElementById('puzzle-canvas');
    const previewImg = document.getElementById('preview-image');
    previewImg.src = puzzle.image;

    // Destroy previous game
    if (currentGame) {
        currentGame.destroy();
    }

    // Reset UI
    document.getElementById('pieces-info').textContent = `0/${puzzle.pieces}`;
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = '0%';
    document.getElementById('complete-modal').classList.add('hidden');

    // Check saved state
    const savedState = Storage.getSave(puzzleId);

    currentGame = new PuzzleGame(canvas, puzzle.image, puzzle.pieces, puzzleId);

    currentGame.onProgress = (pct) => {
        // Already handled in _updateProgress
    };

    currentGame.onComplete = (time, pieces) => {
        document.getElementById('complete-time').textContent = time;
        document.getElementById('complete-pieces').textContent = pieces;
        document.getElementById('complete-message').textContent =
            `${puzzle.title} puzzle'ını ${time} sürede tamamladınız!`;
        document.getElementById('complete-modal').classList.remove('hidden');
        createConfetti();
    };

    try {
        await currentGame.init(savedState);
    } catch (err) {
        console.error('Puzzle yüklenemedi:', err);
        alert('Puzzle resmi yüklenemedi. Lütfen tekrar deneyin.');
        exitGame();
    }
}

function exitGame() {
    if (currentGame) {
        currentGame._autoSave();
        currentGame.destroy();
        currentGame = null;
    }
    showHome();
    renderPuzzleGrid();
}

function replayPuzzle() {
    if (!currentGame) return;
    const puzzleId = currentGame.puzzleId;
    Storage.deleteSave(puzzleId);
    document.getElementById('complete-modal').classList.add('hidden');
    startPuzzle(puzzleId);
}

// ========== GAME CONTROLS ==========
function togglePreview() {
    document.getElementById('preview-overlay').classList.toggle('hidden');
}

function toggleEdgeMode() {
    if (!currentGame) return;
    const active = currentGame.toggleEdges();
    document.getElementById('edge-btn').classList.toggle('active', active);
}

function zoomIn() {
    if (currentGame) currentGame.zoomIn();
}

function zoomOut() {
    if (currentGame) currentGame.zoomOut();
}

function resetZoom() {
    if (currentGame) currentGame.resetZoom();
}

// ========== CONFETTI ==========
function createConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';
    const colors = ['#6c5ce7', '#a29bfe', '#fd79a8', '#00cec9', '#fdcb6e', '#e17055'];

    for (let i = 0; i < 60; i++) {
        const conf = document.createElement('div');
        conf.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            animation: confettiFall ${Math.random() * 2 + 2}s ease-in forwards;
            animation-delay: ${Math.random() * 0.5}s;
            opacity: 0.8;
        `;
        container.appendChild(conf);
    }

    // Add confetti animation
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== UTILITIES ==========
function getTimeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
}
