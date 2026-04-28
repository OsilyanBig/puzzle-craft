// ── Eski save temizliği ──
(function() {
    try {
        localStorage.removeItem('puzzlecraft_saves');
        var saves = JSON.parse(localStorage.getItem('puzzlecraft_saves_v2')) || {};
        var keys = Object.keys(saves);
        for (var i = 0; i < keys.length; i++) {
            var s = saves[keys[i]];
            if (s && s.pieces && s.pieces.length > 0) {
                var first = s.pieces[0];
                if (!first.r && first.r !== 0) { delete saves[keys[i]]; }
            }
            if (s && !s.edgesH) { delete saves[keys[i]]; }
        }
        localStorage.setItem('puzzlecraft_saves_v2', JSON.stringify(saves));
    } catch(e) {}
})();

// ── KATEGORİLER ──
var CATEGORIES = [
    { id: 'all', name: 'Tümü', icon: 'fas fa-th', color: '#6c5ce7' },
    { id: 'landscape', name: 'Manzara', icon: 'fas fa-mountain', color: '#00b894' },
    { id: 'animals', name: 'Hayvanlar', icon: 'fas fa-paw', color: '#fdcb6e' },
    { id: 'art', name: 'Sanat', icon: 'fas fa-palette', color: '#e17055' },
    { id: 'gaming', name: 'Oyun', icon: 'fas fa-gamepad', color: '#0984e3' },
    { id: 'cities', name: 'Şehirler', icon: 'fas fa-city', color: '#a29bfe' },
    { id: 'space', name: 'Uzay', icon: 'fas fa-rocket', color: '#2d3436' },
    { id: 'flowers', name: 'Çiçekler', icon: 'fas fa-seedling', color: '#55efc4' },
    { id: 'foods', name: 'Yemek', icon: 'fas fa-utensils', color: '#fd79a8' }
];

// ── PUZZLELAR ──
var PUZZLES = [
    // ─── LANDSCAPE (8) ───
    { id: 'landscape-1', title: 'Manzara 1', image: './images/landscape/landscape-1.jpg', pieces: 250, difficulty: 3, category: 'landscape' },
    { id: 'landscape-2', title: 'Manzara 2', image: './images/landscape/landscape-2.jpg', pieces: 100, difficulty: 2, category: 'landscape' },
    { id: 'landscape-3', title: 'Manzara 3', image: './images/landscape/landscape-3.jpg', pieces: 50, difficulty: 1, category: 'landscape' },
    { id: 'landscape-4', title: 'Manzara 4', image: './images/landscape/landscape-4.jpg', pieces: 250, difficulty: 3, category: 'landscape' },
    { id: 'landscape-5', title: 'Manzara 5', image: './images/landscape/landscape-5.jpg', pieces: 100, difficulty: 2, category: 'landscape' },
    { id: 'landscape-6', title: 'Manzara 6', image: './images/landscape/landscape-6.jpg', pieces: 50, difficulty: 1, category: 'landscape' },
    { id: 'landscape-7', title: 'Manzara 7', image: './images/landscape/landscape-7.jpg', pieces: 250, difficulty: 3, category: 'landscape' },
    { id: 'landscape-8', title: 'Manzara 8', image: './images/landscape/landscape-8.jpg', pieces: 100, difficulty: 2, category: 'landscape' },

    // ─── ANIMALS (4) ───
    { id: 'animals-1', title: 'Hayvan 1', image: './images/animals/animals-1.jpg', pieces: 100, difficulty: 2, category: 'animals' },
    { id: 'animals-2', title: 'Hayvan 2', image: './images/animals/animals-2.jpg', pieces: 50, difficulty: 1, category: 'animals' },
    { id: 'animals-3', title: 'Hayvan 3', image: './images/animals/animals-3.jpg', pieces: 250, difficulty: 3, category: 'animals' },
    { id: 'animals-4', title: 'Hayvan 4', image: './images/animals/animals-4.jpg', pieces: 100, difficulty: 2, category: 'animals' },

    // ─── ART (4) ───
    { id: 'art-1', title: 'Sanat 1', image: './images/art/art-1.jpg', pieces: 250, difficulty: 3, category: 'art' },
    { id: 'art-2', title: 'Sanat 2', image: './images/art/art-2.jpg', pieces: 100, difficulty: 2, category: 'art' },
    { id: 'art-3', title: 'Sanat 3', image: './images/art/art-3.jpg', pieces: 50, difficulty: 1, category: 'art' },
    { id: 'art-4', title: 'Sanat 4', image: './images/art/art-4.jpg', pieces: 250, difficulty: 3, category: 'art' },

    // ─── GAMING (2) ───
    { id: 'gaming-1', title: 'Oyun 1', image: './images/gaming/gaming-1.jpg', pieces: 100, difficulty: 2, category: 'gaming' },
    { id: 'gaming-2', title: 'Oyun 2', image: './images/gaming/gaming-2.jpg', pieces: 250, difficulty: 3, category: 'gaming' },

    // ─── CITIES (7) ───
    { id: 'cities-1', title: 'Şehir 1', image: './images/cities/cities-1.jpg', pieces: 250, difficulty: 3, category: 'cities' },
    { id: 'cities-2', title: 'Şehir 2', image: './images/cities/cities-2.jpg', pieces: 100, difficulty: 2, category: 'cities' },
    { id: 'cities-3', title: 'Şehir 3', image: './images/cities/cities-3.jpg', pieces: 50, difficulty: 1, category: 'cities' },
    { id: 'cities-4', title: 'Şehir 4', image: './images/cities/cities-4.jpg', pieces: 250, difficulty: 3, category: 'cities' },
    { id: 'cities-5', title: 'Şehir 5', image: './images/cities/cities-5.jpg', pieces: 100, difficulty: 2, category: 'cities' },
    { id: 'cities-6', title: 'Şehir 6', image: './images/cities/cities-6.jpg', pieces: 50, difficulty: 1, category: 'cities' },
    { id: 'cities-7', title: 'Şehir 7', image: './images/cities/cities-7.jpg', pieces: 250, difficulty: 3, category: 'cities' },

    // ─── SPACE (6) ───
    { id: 'space-1', title: 'Uzay 1', image: './images/space/space-1.jpg', pieces: 250, difficulty: 3, category: 'space' },
    { id: 'space-2', title: 'Uzay 2', image: './images/space/space-2.jpg', pieces: 100, difficulty: 2, category: 'space' },
    { id: 'space-3', title: 'Uzay 3', image: './images/space/space-3.jpg', pieces: 50, difficulty: 1, category: 'space' },
    { id: 'space-4', title: 'Uzay 4', image: './images/space/space-4.jpg', pieces: 250, difficulty: 3, category: 'space' },
    { id: 'space-5', title: 'Uzay 5', image: './images/space/space-5.jpg', pieces: 100, difficulty: 2, category: 'space' },
    { id: 'space-6', title: 'Uzay 6', image: './images/space/space-6.jpg', pieces: 50, difficulty: 1, category: 'space' },

    // ─── FLOWERS (5) ───
    { id: 'flowers-1', title: 'Çiçek 1', image: './images/flowers/flowers-1.jpg', pieces: 100, difficulty: 2, category: 'flowers' },
    { id: 'flowers-2', title: 'Çiçek 2', image: './images/flowers/flowers-2.jpg', pieces: 50, difficulty: 1, category: 'flowers' },
    { id: 'flowers-3', title: 'Çiçek 3', image: './images/flowers/flowers-3.jpg', pieces: 250, difficulty: 3, category: 'flowers' },
    { id: 'flowers-4', title: 'Çiçek 4', image: './images/flowers/flowers-4.jpg', pieces: 100, difficulty: 2, category: 'flowers' },
    { id: 'flowers-5', title: 'Çiçek 5', image: './images/flowers/flowers-5.jpg', pieces: 50, difficulty: 1, category: 'flowers' },

    // ─── FOODS (5) ───
    { id: 'foods-1', title: 'Yemek 1', image: './images/foods/foods-1.jpg', pieces: 100, difficulty: 2, category: 'foods' },
    { id: 'foods-2', title: 'Yemek 2', image: './images/foods/foods-2.jpg', pieces: 50, difficulty: 1, category: 'foods' },
    { id: 'foods-3', title: 'Yemek 3', image: './images/foods/foods-3.jpg', pieces: 250, difficulty: 3, category: 'foods' },
    { id: 'foods-4', title: 'Yemek 4', image: './images/foods/foods-4.jpg', pieces: 100, difficulty: 2, category: 'foods' },
    { id: 'foods-5', title: 'Yemek 5', image: './images/foods/foods-5.jpg', pieces: 50, difficulty: 1, category: 'foods' }
];

var currentGame = null;
var currentPuzzleId = null;
var currentCategory = 'all';
var currentPieceFilter = 'all';

// ── INIT ──
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () { document.getElementById('loading-screen').classList.add('hide'); }, 1200);
    window.addEventListener('scroll', function () {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    });
    var theme = localStorage.getItem('puzzlecraft_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
    renderCategoryTabs();
    renderPuzzleGrid();
    updateHeroStats();
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

// ── MOBILE MENU ──
function toggleMobileMenu() { document.getElementById('mobile-menu').classList.toggle('hidden'); }
function closeMobileMenu() { document.getElementById('mobile-menu').classList.add('hidden'); }

// ── NAV ──
function hideAllSections() {
    document.getElementById('hero-section').classList.add('hidden');
    document.querySelector('.announcements').classList.add('hidden');
    document.querySelector('.gallery-section').classList.add('hidden');
    document.getElementById('saved-section').classList.add('hidden');
    document.getElementById('completed-section').classList.add('hidden');
    document.getElementById('stats-section').classList.add('hidden');
    document.getElementById('game-section').classList.add('hidden');
    var adTop = document.getElementById('ad-top');
    if (adTop) adTop.classList.add('hidden');
}

function showHome() {
    hideAllSections();
    document.getElementById('hero-section').classList.remove('hidden');
    document.querySelector('.announcements').classList.remove('hidden');
    document.querySelector('.gallery-section').classList.remove('hidden');
    var adTop = document.getElementById('ad-top');
    if (adTop) adTop.classList.remove('hidden');
    document.getElementById('footer').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    setActiveNav('home'); document.body.style.overflow = '';
    updateHeroStats();
    updateCategoryBackground('all');
}

function showSaved() {
    hideAllSections();
    document.getElementById('saved-section').classList.remove('hidden');
    document.getElementById('footer').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    setActiveNav('saved'); document.body.style.overflow = '';
    renderSavedGames();
}

function showCompleted() {
    hideAllSections();
    document.getElementById('completed-section').classList.remove('hidden');
    document.getElementById('footer').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    setActiveNav('completed'); document.body.style.overflow = '';
    renderCompletedGames();
}

function showStats() {
    hideAllSections();
    document.getElementById('stats-section').classList.remove('hidden');
    document.getElementById('footer').classList.remove('hidden');
    document.getElementById('navbar').classList.remove('hidden');
    setActiveNav('stats'); document.body.style.overflow = '';
    renderStats();
}

function showGame() {
    hideAllSections();
    document.getElementById('game-section').classList.remove('hidden');
    document.getElementById('footer').classList.add('hidden');
    document.getElementById('navbar').classList.add('hidden');
    document.body.style.overflow = 'hidden';
}

function setActiveNav(page) {
    var links = document.querySelectorAll('.nav-link, .mobile-link');
    for (var i = 0; i < links.length; i++) {
        links[i].classList.toggle('active', links[i].dataset.page === page);
    }
}

function scrollToPuzzles() { document.getElementById('puzzles').scrollIntoView({ behavior: 'smooth' }); }

function updateHeroStats() {
    var completed = Storage.getAllCompleted();
    var el = document.getElementById('hero-completed-count');
    if (el) el.textContent = Object.keys(completed).length;
    var el2 = document.getElementById('hero-total-puzzles');
    if (el2) el2.textContent = PUZZLES.length;
}

// ── KATEGORİ ARKAPLAN ──
function updateCategoryBackground(catId) {
    var hero = document.getElementById('hero-section');
    if (!hero) return;
    hero.className = 'hero';
    if (catId !== 'all') {
        hero.classList.add('hero-cat-' + catId);
    }
}

// ── KATEGORİ TABLARI ──
function renderCategoryTabs() {
    var container = document.getElementById('category-tabs');
    if (!container) return;
    container.innerHTML = '';

    for (var i = 0; i < CATEGORIES.length; i++) {
        var cat = CATEGORIES[i];
        var count = cat.id === 'all' ? PUZZLES.length : countCategory(cat.id);
        var tab = document.createElement('button');
        tab.className = 'cat-tab' + (cat.id === currentCategory ? ' active' : '');
        tab.setAttribute('data-cat', cat.id);
        tab.style.setProperty('--cat-color', cat.color);
        tab.innerHTML = '<i class="' + cat.icon + '"></i><span>' + cat.name + '</span><span class="cat-count">' + count + '</span>';
        (function(id) {
            tab.addEventListener('click', function() { selectCategory(id); });
        })(cat.id);
        container.appendChild(tab);
    }
}

function countCategory(catId) {
    var c = 0;
    for (var i = 0; i < PUZZLES.length; i++) {
        if (PUZZLES[i].category === catId) c++;
    }
    return c;
}

function selectCategory(catId) {
    currentCategory = catId;
    var tabs = document.querySelectorAll('.cat-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', tabs[i].getAttribute('data-cat') === catId);
    }
    updateCategoryBackground(catId);
    renderPuzzleGrid();
}

// ── STARS ──
function getStars(difficulty) {
    var html = '';
    for (var i = 0; i < 3; i++) {
        html += '<i class="fas fa-star star-icon ' + (i < difficulty ? 'star-active' : 'star-inactive') + '"></i>';
    }
    return html;
}

// ── PARÇA FİLTRE ──
function filterPieces(f) {
    currentPieceFilter = f;
    var btns = document.querySelectorAll('.filter-btn');
    for (var i = 0; i < btns.length; i++) {
        var txt = btns[i].textContent.trim();
        var val = txt === 'Tümü' ? 'all' : parseInt(txt);
        btns[i].classList.toggle('active', val === f);
    }
    renderPuzzleGrid();
}

// ── PUZZLE GRID ──
function renderPuzzleGrid() {
    var grid = document.getElementById('puzzle-grid');
    grid.innerHTML = '';

    var list = [];
    for (var i = 0; i < PUZZLES.length; i++) {
        var p = PUZZLES[i];
        var catMatch = currentCategory === 'all' || p.category === currentCategory;
        var pieceMatch = currentPieceFilter === 'all' || p.pieces === currentPieceFilter;
        if (catMatch && pieceMatch) list.push(p);
    }

    if (list.length === 0) {
        grid.innerHTML = '<div class="empty-grid"><i class="fas fa-search"></i><p>Bu filtrelere uygun puzzle bulunamadı</p></div>';
        return;
    }

    for (var i = 0; i < list.length; i++) {
        var puzzle = list[i];
        var hasSave = Storage.hasSave(puzzle.id);
        var save = Storage.getSave(puzzle.id);
        var progress = save ? (save.progress || 0) : 0;
        var isCompleted = Storage.isCompleted(puzzle.id);
        var completedData = Storage.getCompleted(puzzle.id);

        var badgeClass = puzzle.pieces <= 50 ? 'p50' : puzzle.pieces <= 100 ? 'p100' : 'p250';
        var stars = getStars(puzzle.difficulty);
        var catObj = findCategory(puzzle.category);
        var catColor = catObj ? catObj.color : '#6c5ce7';

        var statusHTML = '';
        if (isCompleted) {
            statusHTML = '<div class="card-completed-badge"><i class="fas fa-check-circle"></i> Tamamlandı</div>';
            if (completedData) statusHTML += '<div class="card-record">Rekor: ' + completedData.bestTime + '</div>';
        } else if (hasSave) {
            statusHTML = '<div class="card-progress-bar"><div class="card-progress-fill" style="width:' + progress + '%"></div></div>';
            statusHTML += '<div class="card-saved-info"><span>%' + progress + '</span><span>' + timeAgo(save.lastPlayed) + '</span></div>';
        }

        var btnText = isCompleted ? '<i class="fas fa-redo"></i> Tekrar' : (hasSave ? '<i class="fas fa-play"></i> Devam' : '<i class="fas fa-play"></i> Başla');

        var card = document.createElement('div');
        card.className = 'puzzle-card' + (isCompleted ? ' completed' : '');
        card.style.setProperty('--card-accent', catColor);
        card.innerHTML =
            '<div class="card-image">' +
                '<img src="' + puzzle.image + '" alt="' + puzzle.title + '" loading="lazy">' +
                '<div class="card-overlay"><div class="play-btn-overlay"><i class="fas fa-play"></i></div></div>' +
                '<span class="piece-badge ' + badgeClass + '">' + puzzle.pieces + ' Parça</span>' +
                '<span class="cat-badge" style="background:' + catColor + '"><i class="' + (catObj ? catObj.icon : '') + '"></i></span>' +
                (isCompleted ? '<div class="completed-ribbon"><i class="fas fa-trophy"></i></div>' : '') +
            '</div>' +
            '<div class="card-body">' +
                '<div class="card-title-row"><div class="card-title">' + puzzle.title + '</div><div class="card-stars">' + stars + '</div></div>' +
                '<div class="card-meta">' +
                    '<div class="card-pieces"><i class="fas fa-puzzle-piece"></i><span>' + puzzle.pieces + ' parça</span></div>' +
                    '<button class="card-action">' + btnText + '</button>' +
                '</div>' +
                statusHTML +
            '</div>';

        (function (pid) { card.addEventListener('click', function () { startPuzzle(pid); }); })(puzzle.id);
        grid.appendChild(card);

        // Her 4 karttan sonra reklam
        if ((i + 1) % 4 === 0 && i < list.length - 1) {
            var adCard = document.createElement('div');
            adCard.className = 'ad-card';
            adCard.innerHTML = '<div class="ad-placeholder"><i class="fas fa-ad"></i><span>Reklam</span></div>';
            grid.appendChild(adCard);
        }
    }
}

function findCategory(catId) {
    for (var i = 0; i < CATEGORIES.length; i++) {
        if (CATEGORIES[i].id === catId) return CATEGORIES[i];
    }
    return null;
}

// ── SAVED GAMES ──
function renderSavedGames() {
    var grid = document.getElementById('saved-grid');
    var noEl = document.getElementById('no-saves');
    var saves = Storage.getAllSaves();
    var keys = Object.keys(saves);

    if (!keys.length) { grid.classList.add('hidden'); noEl.classList.remove('hidden'); return; }
    grid.classList.remove('hidden'); noEl.classList.add('hidden'); grid.innerHTML = '';

    keys.sort(function (a, b) { return (saves[b].lastPlayed || 0) - (saves[a].lastPlayed || 0); });

    for (var k = 0; k < keys.length; k++) {
        var pid = keys[k], save = saves[pid];
        var puzzle = findPuzzle(pid);
        if (!puzzle) continue;
        var progress = save.progress || 0;
        var badgeClass = puzzle.pieces <= 50 ? 'p50' : puzzle.pieces <= 100 ? 'p100' : 'p250';

        var card = document.createElement('div');
        card.className = 'puzzle-card';
        card.innerHTML =
            '<div class="card-image"><img src="' + puzzle.image + '" alt="' + puzzle.title + '" loading="lazy"><div class="card-overlay"><div class="play-btn-overlay"><i class="fas fa-play"></i></div></div><span class="piece-badge ' + badgeClass + '">' + puzzle.pieces + ' Parça</span></div>' +
            '<div class="card-body"><div class="card-title">' + puzzle.title + '</div><div class="card-meta"><div class="card-pieces"><i class="fas fa-puzzle-piece"></i><span>' + (save.placedCount || 0) + '/' + (save.totalPieces || puzzle.pieces) + '</span></div><button class="card-action"><i class="fas fa-play"></i> Devam</button></div>' +
            '<div class="card-progress-bar"><div class="card-progress-fill" style="width:' + progress + '%"></div></div><div class="card-saved-info"><span>%' + progress + '</span><span>' + timeAgo(save.lastPlayed) + '</span></div></div>';

        (function (id) { card.addEventListener('click', function () { startPuzzle(id); }); })(pid);
        grid.appendChild(card);
    }
}

// ── COMPLETED GAMES ──
function renderCompletedGames() {
    var grid = document.getElementById('completed-grid');
    var noEl = document.getElementById('no-completed');
    var all = Storage.getAllCompleted();
    var keys = Object.keys(all);

    if (!keys.length) { grid.classList.add('hidden'); noEl.classList.remove('hidden'); return; }
    grid.classList.remove('hidden'); noEl.classList.add('hidden'); grid.innerHTML = '';

    keys.sort(function (a, b) { return (all[b].completedAt || 0) - (all[a].completedAt || 0); });

    for (var k = 0; k < keys.length; k++) {
        var pid = keys[k], data = all[pid];
        var puzzle = findPuzzle(pid);
        if (!puzzle) continue;

        var card = document.createElement('div');
        card.className = 'puzzle-card completed';
        card.innerHTML =
            '<div class="card-image"><img src="' + puzzle.image + '" alt="' + puzzle.title + '" loading="lazy"><div class="card-overlay"><div class="play-btn-overlay"><i class="fas fa-eye"></i></div></div><span class="piece-badge p-done">✓</span><div class="completed-ribbon"><i class="fas fa-trophy"></i></div></div>' +
            '<div class="card-body"><div class="card-title">' + puzzle.title + '</div>' +
            '<div class="completed-info"><div class="ci"><i class="fas fa-trophy"></i> ' + data.bestTime + '</div><div class="ci"><i class="fas fa-redo"></i> ' + (data.timesCompleted || 1) + 'x</div></div>' +
            '<div class="card-meta"><button class="card-action" onclick="event.stopPropagation();openViewer(\'' + pid + '\')"><i class="fas fa-eye"></i> Gör</button><button class="card-action" onclick="event.stopPropagation();startPuzzle(\'' + pid + '\')"><i class="fas fa-redo"></i> Tekrar</button></div></div>';

        (function (id) { card.addEventListener('click', function () { openViewer(id); }); })(pid);
        grid.appendChild(card);
    }
}

// ── VIEWER ──
var viewerPuzzleId = null;
function openViewer(pid) {
    viewerPuzzleId = pid;
    var puzzle = findPuzzle(pid);
    var data = Storage.getCompleted(pid);
    if (!puzzle || !data) return;
    document.getElementById('viewer-image').src = puzzle.image;
    document.getElementById('viewer-title').textContent = puzzle.title;
    document.getElementById('viewer-pieces').textContent = data.pieces || puzzle.pieces;
    document.getElementById('viewer-time').textContent = data.lastTime;
    document.getElementById('viewer-record').textContent = data.bestTime;
    document.getElementById('viewer-modal').classList.remove('hidden');
}
function closeViewer() { document.getElementById('viewer-modal').classList.add('hidden'); viewerPuzzleId = null; }
function replayFromViewer() { if (viewerPuzzleId) { closeViewer(); startPuzzle(viewerPuzzleId); } }

function shareCompleted() {
    if (!viewerPuzzleId) return;
    var puzzle = findPuzzle(viewerPuzzleId);
    var data = Storage.getCompleted(viewerPuzzleId);
    if (puzzle && data) doShare(puzzle, data);
}
function downloadCompleted() {
    if (!viewerPuzzleId) return;
    var puzzle = findPuzzle(viewerPuzzleId);
    if (!puzzle) return;
    var a = document.createElement('a'); a.href = puzzle.image; a.download = puzzle.title + '.jpg'; a.click();
}
function shareFromComplete() {
    if (!currentPuzzleId) return;
    var puzzle = findPuzzle(currentPuzzleId);
    var data = Storage.getCompleted(currentPuzzleId);
    if (puzzle && data) doShare(puzzle, data);
}
function doShare(puzzle, data) {
    var text = '🧩 PuzzleCraft\'ta "' + puzzle.title + '" puzzle\'ını ' + data.bestTime + ' sürede tamamladım! ' + puzzle.pieces + ' parça 💪\n\nSen de dene: ' + window.location.origin;
    if (navigator.share) {
        navigator.share({ title: 'PuzzleCraft', text: text }).catch(function(){});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { alert('Paylaşım metni kopyalandı!'); });
    } else {
        prompt('Paylaşım metnini kopyalayın:', text);
    }
}

// ── STATS ──
function renderStats() {
    var stats = Storage.getStats();
    document.getElementById('stat-total-solved').textContent = stats.totalSolved;
    document.getElementById('stat-total-time').textContent = fmtTimeMs(stats.totalTimeMs);
    document.getElementById('stat-best-time').textContent = stats.bestTimeMs > 0 ? fmtTimeMs(stats.bestTimeMs) : '--:--';
    document.getElementById('stat-total-pieces').textContent = stats.totalPieces;
    document.getElementById('stat-hints-used').textContent = stats.totalHints;
    var avgMs = stats.totalSolved > 0 ? Math.round(stats.totalTimeMs / stats.totalSolved) : 0;
    document.getElementById('stat-avg-time').textContent = avgMs > 0 ? fmtTimeMs(avgMs) : '--:--';

    var histEl = document.getElementById('history-list');
    histEl.innerHTML = '';
    if (!stats.history || stats.history.length === 0) {
        histEl.innerHTML = '<div class="history-empty">Henüz çözüm yok</div>';
        return;
    }
    for (var i = 0; i < Math.min(stats.history.length, 20); i++) {
        var h = stats.history[i];
        var div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML =
            '<div class="hi-info"><span class="hi-title">' + h.title + '</span><span class="hi-date">' + timeAgo(h.date) + '</span></div>' +
            '<div class="hi-stats"><span><i class="fas fa-puzzle-piece"></i> ' + h.pieces + '</span><span><i class="fas fa-clock"></i> ' + fmtTimeMs(h.timeMs) + '</span>' +
            (h.hints > 0 ? '<span><i class="fas fa-lightbulb"></i> ' + h.hints + '</span>' : '') + '</div>';
        histEl.appendChild(div);
    }
}

// ── START PUZZLE ──
function startPuzzle(puzzleId) {
    var puzzle = findPuzzle(puzzleId);
    if (!puzzle) return;
    currentPuzzleId = puzzleId;
    showGame();

    document.getElementById('preview-image').src = puzzle.image;
    document.getElementById('pieces-info').textContent = '0/' + puzzle.pieces;
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = '0%';
    document.getElementById('complete-modal').classList.add('hidden');
    document.getElementById('record-badge').classList.add('hidden');

    if (currentGame) { currentGame.destroy(); currentGame = null; }

    var canvas = document.getElementById('puzzle-canvas');
    var saved = Storage.getSave(puzzleId);

    currentGame = new PuzzleGame(canvas, puzzle.image, puzzle.pieces, puzzleId);
    currentGame.onComplete = function (timeStr, pieces, timeMs, hintsUsed) {
        var isRecord = Storage.saveCompleted(puzzleId, { time: timeStr, timeMs: timeMs, pieces: pieces, hintsUsed: hintsUsed });
        Storage.addToStats(puzzleId, puzzle.title, timeMs, pieces, hintsUsed);
        document.getElementById('complete-time').textContent = timeStr;
        document.getElementById('complete-pieces').textContent = pieces;
        document.getElementById('complete-hints').textContent = hintsUsed;
        document.getElementById('complete-message').textContent = puzzle.title + ' puzzle\'ını ' + timeStr + ' sürede tamamladınız!';
        if (isRecord) document.getElementById('record-badge').classList.remove('hidden');
        document.getElementById('complete-modal').classList.remove('hidden');
        createConfetti();
    };

    currentGame.load(saved).then(function () {
        currentGame._updateUI();
    }).catch(function (err) {
        console.error(err);
        alert('Resim yüklenemedi: ' + puzzle.title);
        exitGame();
    });
}

function exitGame() {
    if (currentGame) { currentGame._autoSave(); currentGame.destroy(); currentGame = null; }
    currentPuzzleId = null;
    showHome(); renderPuzzleGrid();
}

function replayPuzzle() {
    if (!currentPuzzleId) return;
    var pid = currentPuzzleId;
    Storage.deleteSave(pid);
    document.getElementById('complete-modal').classList.add('hidden');
    startPuzzle(pid);
}

// ── CONTROLS ──
function togglePreview() { document.getElementById('preview-overlay').classList.toggle('hidden'); }
function toggleEdgeMode() {
    if (!currentGame) return;
    document.getElementById('edge-btn').classList.toggle('active', currentGame.toggleEdges());
}
function doZoomIn() { if (currentGame) currentGame.zoomIn(); }
function doZoomOut() { if (currentGame) currentGame.zoomOut(); }
function doResetZoom() { if (currentGame) currentGame.resetZoom(); }
function useHint() { if (currentGame) currentGame.useHint(); }

// ── CONFETTI ──
function createConfetti() {
    var c = document.getElementById('confetti'); c.innerHTML = '';
    if (!document.getElementById('confetti-style')) {
        var s = document.createElement('style'); s.id = 'confetti-style';
        s.textContent = '@keyframes confFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(500px) rotate(720deg);opacity:0}}';
        document.head.appendChild(s);
    }
    var colors = ['#6c5ce7','#a29bfe','#fd79a8','#00cec9','#fdcb6e','#e17055'];
    for (var i = 0; i < 50; i++) {
        var d = document.createElement('div');
        d.style.cssText = 'position:absolute;width:' + (5+Math.random()*8) + 'px;height:' + (5+Math.random()*8) + 'px;background:' + colors[Math.floor(Math.random()*6)] + ';left:' + (Math.random()*100) + '%;top:-10px;border-radius:' + (Math.random()>.5?'50%':'2px') + ';animation:confFall ' + (2+Math.random()*2) + 's ease-in forwards;animation-delay:' + (Math.random()*.5) + 's;opacity:.85;';
        c.appendChild(d);
    }
}

// ── UTILS ──
function findPuzzle(id) {
    for (var i = 0; i < PUZZLES.length; i++) { if (PUZZLES[i].id === id) return PUZZLES[i]; }
    return null;
}
function timeAgo(ts) {
    if (!ts) return '';
    var d = Date.now() - ts, m = Math.floor(d/60000), h = Math.floor(d/3600000), dy = Math.floor(d/86400000);
    if (m < 1) return 'Az önce'; if (m < 60) return m + ' dk önce'; if (h < 24) return h + ' saat önce'; return dy + ' gün önce';
}
function fmtTimeMs(ms) {
    if (!ms) return '00:00';
    var s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    if (h > 0) return h + ':' + (m%60<10?'0':'') + (m%60) + ':' + (s%60<10?'0':'') + (s%60);
    return (m<10?'0':'') + m + ':' + (s%60<10?'0':'') + (s%60);
}
