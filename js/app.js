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
                    <img src="${puzzle.image}" alt="${puzzle.title}" 
