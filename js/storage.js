// ========== LOCAL STORAGE MANAGER ==========
const Storage = {
    SAVES_KEY: 'puzzlecraft_saves',

    getAllSaves() {
        try {
            const data = localStorage.getItem(this.SAVES_KEY);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    },

    getSave(puzzleId) {
        const saves = this.getAllSaves();
        return saves[puzzleId] || null;
    },

    savePuzzle(puzzleId, data) {
        const saves = this.getAllSaves();
        saves[puzzleId] = {
            ...data,
            lastPlayed: Date.now()
        };
        localStorage.setItem(this.SAVES_KEY, JSON.stringify(saves));
    },

    deleteSave(puzzleId) {
        const saves = this.getAllSaves();
        delete saves[puzzleId];
        localStorage.setItem(this.SAVES_KEY, JSON.stringify(saves));
    },

    hasSave(puzzleId) {
        return !!this.getSave(puzzleId);
    }
};
