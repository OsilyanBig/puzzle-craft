var SAVE_VERSION = 2;

var Storage = {
    SAVES_KEY: 'puzzlecraft_saves_v2',
    COMPLETED_KEY: 'puzzlecraft_completed',
    STATS_KEY: 'puzzlecraft_stats',

    // ── İlk çalışmada eski verileri temizle ──
    init: function() {
        // Eski format save'leri sil
        try {
            localStorage.removeItem('puzzlecraft_saves');
            var oldV2 = localStorage.getItem(this.SAVES_KEY);
            if (oldV2) {
                var parsed = JSON.parse(oldV2);
                var keys = Object.keys(parsed);
                for (var i = 0; i < keys.length; i++) {
                    var s = parsed[keys[i]];
                    if (s && s.pieces && s.pieces.length > 0) {
                        var first = s.pieces[0];
                        if (!first.r && first.r !== 0) {
                            delete parsed[keys[i]];
                        }
                    }
                    if (s && !s.edgesH) {
                        delete parsed[keys[i]];
                    }
                }
                localStorage.setItem(this.SAVES_KEY, JSON.stringify(parsed));
            }
        } catch(e) {}
    },

    // ── SAVE (devam eden oyunlar) ──
    getAllSaves: function() {
        try {
            return JSON.parse(localStorage.getItem(this.SAVES_KEY)) || {};
        } catch(e) { return {}; }
    },

    getSave: function(id) {
        return this.getAllSaves()[id] || null;
    },

    savePuzzle: function(id, data) {
        var saves = this.getAllSaves();
        saves[id] = data;
        saves[id].lastPlayed = Date.now();
        saves[id].version = SAVE_VERSION;
        try {
            localStorage.setItem(this.SAVES_KEY, JSON.stringify(saves));
        } catch(e) {
            console.warn('Save failed:', e);
        }
    },

    deleteSave: function(id) {
        var saves = this.getAllSaves();
        delete saves[id];
        localStorage.setItem(this.SAVES_KEY, JSON.stringify(saves));
    },

    hasSave: function(id) {
        return !!this.getSave(id);
    },

    // ── COMPLETED (bitirilen oyunlar) ──
    getAllCompleted: function() {
        try {
            return JSON.parse(localStorage.getItem(this.COMPLETED_KEY)) || {};
        } catch(e) { return {}; }
    },

    getCompleted: function(id) {
        return this.getAllCompleted()[id] || null;
    },

    saveCompleted: function(id, data) {
        var all = this.getAllCompleted();
        var existing = all[id];

        if (!all[id]) {
            all[id] = {
                puzzleId: id,
                bestTime: data.time,
                bestTimeMs: data.timeMs,
                lastTime: data.time,
                lastTimeMs: data.timeMs,
                pieces: data.pieces,
                hintsUsed: data.hintsUsed || 0,
                completedAt: Date.now(),
                timesCompleted: 1,
                isNewRecord: true
            };
        } else {
            var isRecord = data.timeMs < existing.bestTimeMs;
            all[id].lastTime = data.time;
            all[id].lastTimeMs = data.timeMs;
            all[id].completedAt = Date.now();
            all[id].timesCompleted = (existing.timesCompleted || 1) + 1;
            all[id].hintsUsed = Math.min(existing.hintsUsed || 0, data.hintsUsed || 0);
            all[id].isNewRecord = isRecord;
            if (isRecord) {
                all[id].bestTime = data.time;
                all[id].bestTimeMs = data.timeMs;
            }
        }

        localStorage.setItem(this.COMPLETED_KEY, JSON.stringify(all));
        return all[id].isNewRecord;
    },

    isCompleted: function(id) {
        return !!this.getCompleted(id);
    },

    // ── STATS ──
    getStats: function() {
        try {
            return JSON.parse(localStorage.getItem(this.STATS_KEY)) || {
                totalSolved: 0,
                totalTimeMs: 0,
                totalPieces: 0,
                totalHints: 0,
                bestTimeMs: 0,
                history: []
            };
        } catch(e) {
            return { totalSolved: 0, totalTimeMs: 0, totalPieces: 0, totalHints: 0, bestTimeMs: 0, history: [] };
        }
    },

    addToStats: function(puzzleId, puzzleTitle, timeMs, pieces, hints) {
        var stats = this.getStats();
        stats.totalSolved++;
        stats.totalTimeMs += timeMs;
        stats.totalPieces += pieces;
        stats.totalHints += (hints || 0);

        if (stats.bestTimeMs === 0 || timeMs < stats.bestTimeMs) {
            stats.bestTimeMs = timeMs;
        }

        stats.history.unshift({
            puzzleId: puzzleId,
            title: puzzleTitle,
            timeMs: timeMs,
            pieces: pieces,
            hints: hints || 0,
            date: Date.now()
        });

        // Son 50 çözümü tut
        if (stats.history.length > 50) {
            stats.history = stats.history.slice(0, 50);
        }

        localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    }
};

// Başlangıçta temizlik yap
Storage.init();
