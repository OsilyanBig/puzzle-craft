const Storage = {
    SAVES_KEY: 'puzzlecraft_saves',

    getAllSaves() {
        try {
            return JSON.parse(localStorage.getItem(this.SAVES_KEY)) || {};
        } catch { return {}; }
    },

    getSave(id) {
        return this.getAllSaves()[id] || null;
    },

    savePuzzle(id, data) {
        const saves = this.getAllSaves();
        saves[id] = { ...data, lastPlayed: Date.now() };
        try {
            localStorage.setItem(this.SAVES_KEY, JSON.stringify(saves));
        } catch (e) {
            console.warn('Save failed:', e);
        }
    },

    deleteSave(id) {
        const saves = this.getAllSaves();
        delete saves[id];
        localStorage.setItem(this.SAVES_KEY, JSON.stringify(saves));
    },

    hasSave(id) {
        return !!this.getSave(id);
    }
};
