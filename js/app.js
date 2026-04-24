var PUZZLES = [
    {
        id: 'landscape-painting',
        title: 'Manzara Resmi',
        image: 'images/landscape-painting-nature-drawing.jpg',
        pieces: 1000,
        difficulty: 4
    },
    {
        id: 'natural-drawing',
        title: 'Doğal Çizim',
        image: 'images/natural-drawing-nature-drawing.jpg',
        pieces: 100,
        difficulty: 1
    },
    {
        id: 'japanese-forest',
        title: 'Japon Ormanı',
        image: 'images/japanese-landscape-painting-forest-painting.jpg',
        pieces: 500,
        difficulty: 3
    },
    {
        id: 'digital-art',
        title: 'Dijital Sanat',
        image: 'images/art-artwork-illustration-drawing-hd-wallpaper-preview.jpg',
        pieces: 250,
        difficulty: 2
    },
    {
        id: 'color-drawing',
        title: 'Renkli Çizim',
        image: 'images/drawing-wallpaper-preview.jpg',
        pieces: 1000,
        difficulty: 4
    },
    {
        id: 'foggy-scenery',
        title: 'Sisli Manzara',
        image: 'images/foggy-scenery-3840x2160-14972.jpg',
        pieces: 500,
        difficulty: 3
    },
    {
        id: 'abstract-landscape',
        title: 'Soyut Manzara',
        image: 'images/landscape-painting-abstract-landscape-real-painting.jpg',
        pieces: 1000,
        difficulty: 4
    }
];

var currentGame = null;
var currentFilter = 'all';

// ── INIT ──
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        document.getElementById('loading-screen').classList.add('hide');
    }, 1200);

    window.addEventListener('scroll', function () {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    });

    var theme = localStorage.getItem('puzzlecraft_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);

    renderPuzzleGrid();
});

// ── THEME ──
function toggleTheme() {
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('puzzlecraft_theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(t) {
    var i = document.querySelector('.theme-toggle i');
    if (i) i.className = t === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// ── NAV ──
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
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
        links[i].classList.toggle('active', links[i].dataset.page === page);
    }
}

function scrollToPuzzles() {
    document.getElementById('puzzles').scrollIntoView({ behavior: 'smooth' });
}

// ── GRID ──
function renderPuzzleGrid() {
    var grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    var list = [];
    for (var i = 0; i < PUZZLES.length; i++) {
        if (currentFilter === 'all' || PUZZLES[i].pieces === currentFilter) {
            list.push(PUZZLES[i]);
        }
    }

    for (var i = 0; i < list.length; i++) {
        var puzzle = list[i];
        var hasSave = Storage.hasSave(puzzle.id);
        var save = Storage.getSave(puzzle.id);
        var progress = save ? (save.progress || 0) : 0;

        var badgeClass = 'p1000';
        if (puzzle.pieces <= 100) badgeClass = 'p100';
        else if (puzzle.pieces <= 250) badgeClass = 'p250';
        else if (puzzle.pieces <= 500) badgeClass = 'p500';

        var dots = '';
        for (var d = 0; d < 4; d++) {
            dots += '<div class="diff-dot ' + (d < puzzle.difficulty ? 'active' : '') + '"></div>';
        }

        var saveHtml = '';
        if (hasSave) {
            saveHtml = '<div class="card-progress-bar"><div class="card-progress-fill" style="width:' + progress + '%"></div></div>' +
                '<div class="card-saved-info"><span>%' + progress + ' tamamlandı</span><span>' + timeAgo(save.lastPlayed) + '</span></div>';
        }

        var card = document.createElement('div');
        card.className = 'puzzle-card';
        card.setAttribute('data-puzzle-id', puzzle.id);
        card.innerHTML =
            '<div class="card-image">' +
            '<img src="' + puzzle.image + '" alt="' + puzzle.title + '" loading="lazy">' +
            '<div class="card-overlay"><div class="play-btn-overlay"><i class="fas fa-play"></i></div></div>' +
            '<span class="piece-badge ' + badgeClass + '">' + puzzle.pieces + ' Parça</span>' +
            '<div class="difficulty-dots">' + dots + '</div>' +
            '</div>' +
            '<div class="card-body">' +
            '<div class="card-title">' + puzzle.title + '</div>' +
            '<div class="card-meta">' +
            '<div class="card-pieces"><i class="fas fa-puzzle-piece"></i><span>' + puzzle.pieces + ' parça</span></div>' +
            '<button class="card-action">' + (hasSave ? '<i class="fas fa-play"></i> Devam Et' : '<i class="fas fa-play"></i> Başla') + '</button>' +
            '</div>' +
            saveHtml +
            '</div>';

        (function (pid) {
            card.addEventListener('click', function () {
                startPuzzle(pid);
            });
        })(puzzle.id);

        grid.appendChild(card);
    }
}

function filterPuzzles(f) {
    currentFilter = f;
    var btns = document.querySelectorAll('.filter-btn');
    for (var i = 0; i < btns.length; i++) {
        var txt = btns[i].textContent.trim();
        var val = txt === 'Tümü' ? 'all' : parseInt(txt);
        btns[i].classList.toggle('active', val === f);
    }
    renderPuzzleGrid();
}

// ── SAVED ──
function renderSavedGames() {
    var grid = document.getElementById('saved-grid');
    var noEl = document.getElementById('no-saves');
    var saves = Storage.getAllSaves();
    var keys = Object.keys(saves);

    if (keys.length === 0) {
        grid.classList.add('hidden');
        noEl.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    noEl.classList.add('hidden');
    grid.innerHTML = '';

    keys.sort(function (a, b) {
        return (saves[b].lastPlayed || 0) - (saves[a].lastPlayed || 0);
    });

    for (var k = 0; k < keys.length; k++) {
        var pid = keys[k];
        var save = saves[pid];
        var puzzle = null;

        for (var i = 0; i < PUZZLES.length; i++) {
            if (PUZZLES[i].id === pid) { puzzle = PUZZLES[i]; break; }
        }
        if (!puzzle) continue;

        var progress = save.progress || 0;
        var badgeClass = 'p1000';
        if (puzzle.pieces <= 100) badgeClass = 'p100';
        else if (puzzle.pieces <= 250) badgeClass = 'p250';
        else if (puzzle.pieces <= 500) badgeClass = 'p500';

        var card = document.createElement('div');
        card.className = 'puzzle-card';
        card.innerHTML =
            '<div class="card-image">' +
            '<img src="' + puzzle.image + '" alt="' + puzzle.title + '" loading="lazy">' +
            '<div class="card-overlay"><div class="play-btn-overlay"><i class="fas fa-play"></i></div></div>' +
            '<span class="piece-badge ' + badgeClass + '">' + puzzle.pieces + ' Parça</span>' +
            '</div>' +
            '<div class="card-body">' +
            '<div class="card-title">' + puzzle.title + '</div>' +
            '<div class="card-meta">' +
            '<div class="card-pieces"><i class="fas fa-puzzle-piece"></i><span>' + (save.placedCount || 0) + '/' + (save.totalPieces || puzzle.pieces) + '</span></div>' +
            '<button class="card-action"><i class="fas fa-play"></i> Devam Et</button>' +
            '</div>' +
            '<div class="card-progress-bar"><div class="card-progress-fill" style="width:' + progress + '%"></div></div>' +
            '<div class="card-saved-info"><span>%' + progress + '</span><span>' + timeAgo(save.lastPlayed) + '</span></div>' +
            '</div>';

        (function (id) {
            card.addEventListener('click', function () { startPuzzle(id); });
        })(pid);

        grid.appendChild(card);
    }
}

// ── GAME ──
function startPuzzle(puzzleId) {
    var puzzle = null;
    for (var i = 0; i < PUZZLES.length; i++) {
        if (PUZZLES[i].id === puzzleId) { puzzle = PUZZLES[i]; break; }
    }
    if (!puzzle) return;

    showGame();

    document.getElementById('preview-image').src = puzzle.image;
    document.getElementById('pieces-info').textContent = '0/' + puzzle.pieces;
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = '0%';
    document.getElementById('complete-modal').classList.add('hidden');

    if (currentGame) {
        currentGame.destroy();
        currentGame = null;
    }

    var canvas = document.getElementById('puzzle-canvas');
    var saved = Storage.getSave(puzzleId);

    currentGame = new PuzzleGame(canvas, puzzle.image, puzzle.pieces, puzzleId);

    currentGame.onComplete = function (time, pieces) {
        document.getElementById('complete-time').textContent = time;
        document.getElementById('complete-pieces').textContent = pieces;
        document.getElementById('complete-message').textContent = puzzle.title + ' puzzle\'ını ' + time + ' sürede tamamladınız!';
        document.getElementById('complete-modal').classList.remove('hidden');
        createConfetti();
    };

    currentGame.load(saved).catch(function (e) {
        console.error(e);
        alert('Resim yüklenemedi. Dosya adını kontrol edin.\n\nBeklenen: ' + puzzle.image);
        exitGame();
    });
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
    var pid = currentGame.puzzleId;
    Storage.deleteSave(pid);
    document.getElementById('complete-modal').classList.add('hidden');
    startPuzzle(pid);
}

// ── CONTROLS ──
function togglePreview() {
    document.getElementById('preview-overlay').classList.toggle('hidden');
}

function toggleEdgeMode() {
    if (currentGame) {
        var a = currentGame.toggleEdges();
        document.getElementById('edge-btn').classList.toggle('active', a);
    }
}

function doZoomIn() { if (currentGame) currentGame.zoomIn(); }
function doZoomOut() { if (currentGame) currentGame.zoomOut(); }
function doResetZoom() { if (currentGame) currentGame.resetZoom(); }

// ── CONFETTI ──
function createConfetti() {
    var c = document.getElementById('confetti');
    c.innerHTML = '';
    if (!document.getElementById('confetti-style')) {
        var s = document.createElement('style');
        s.id = 'confetti-style';
        s.textContent 
