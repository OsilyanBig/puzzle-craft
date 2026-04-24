// ========== PUZZLE ENGINE ==========
class PuzzleGame {
    constructor(canvas, imageUrl, pieceCount, puzzleId) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.imageUrl = imageUrl;
        this.totalPieces = pieceCount;
        this.puzzleId = puzzleId;
        this.image = null;
        this.pieces = [];
        this.groups = []; // connected piece groups
        this.cols = 0;
        this.rows = 0;
        this.pieceWidth = 0;
        this.pieceHeight = 0;
        this.tabSize = 0;

        // Interaction
        this.dragging = null;
        this.dragOffset = { x: 0, y: 0 };
        this.pan = { x: 0, y: 0 };
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.zoom = 1;
        this.lastMouse = { x: 0, y: 0 };

        // State
        this.placedCount = 0;
        this.startTime = Date.now();
        this.elapsed = 0;
        this.timerInterval = null;
        this.completed = false;
        this.showEdgesOnly = false;
        this.snapDistance = 0;

        // Callbacks
        this.onProgress = null;
        this.onComplete = null;

        this._bindEvents();
    }

    async init(savedState) {
        return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.crossOrigin = 'anonymous';
            this.image.onload = () => {
                this._setupGrid();
                if (savedState) {
                    this._restoreState(savedState);
                } else {
                    this._createPieces();
                    this._shufflePieces();
                }
                this._resizeCanvas();
                this._startTimer();
                this._render();
                resolve();
            };
            this.image.onerror = () => {
                // Try with a proxy
                if (!this.imageUrl.includes('proxy')) {
                    this.image.src = `https://corsproxy.io/?${encodeURIComponent(this.imageUrl)}`;
                } else {
                    reject(new Error('Image load failed'));
                }
            };
            this.image.src = this.imageUrl;
        });
    }

    _setupGrid() {
        const ratio = this.image.width / this.image.height;
        this.cols = Math.round(Math.sqrt(this.totalPieces * ratio));
        this.rows = Math.round(this.totalPieces / this.cols);
        this.totalPieces = this.cols * this.rows;

        // Scale image to reasonable puzzle size
        const maxDim = Math.max(800, Math.min(1600, Math.max(this.image.width, this.image.height)));
        const scale = maxDim / Math.max(this.image.width, this.image.height);
        this.imgW = this.image.width * scale;
        this.imgH = this.image.height * scale;

        this.pieceWidth = this.imgW / this.cols;
        this.pieceHeight = this.imgH / this.rows;
        this.tabSize = Math.min(this.pieceWidth, this.pieceHeight) * 0.22;
        this.snapDistance = Math.min(this.pieceWidth, this.pieceHeight) * 0.35;
    }

    _createPieces() {
        this.pieces = [];
        this.groups = [];

        // Generate tab configuration (edges between pieces)
        // tabs[row][col] = { right: 1/-1/0, bottom: 1/-1/0 }
        // 1 = tab out, -1 = tab in, 0 = flat edge
        this.tabs = [];
        for (let r = 0; r < this.rows; r++) {
            this.tabs[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.tabs[r][c] = {
                    top: r === 0 ? 0 : -this.tabs[r - 1][c].bottom,
                    left: c === 0 ? 0 : -this.tabs[r][c - 1].right,
                    right: c === this.cols - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
                    bottom: r === this.rows - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1)
                };
            }
        }

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const id = r * this.cols + c;
                const piece = {
                    id,
                    row: r,
                    col: c,
                    // correct position
                    correctX: c * this.pieceWidth,
                    correctY: r * this.pieceHeight,
                    // current position
                    x: 0,
                    y: 0,
                    tabs: this.tabs[r][c],
                    groupId: id,
                    isPlaced: false,
                    isEdge: r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1
                };
                this.pieces.push(piece);
                this.groups.push({
                    id,
                    pieces: [id],
                    x: 0, y: 0
                });
            }
        }
    }

    _shufflePieces() {
        const areaW = this.imgW * 3;
        const areaH = this.imgH * 3;
        const offsetX = -this.imgW;
        const offsetY = -this.imgH * 0.5;

        this.pieces.forEach(p => {
            p.x = offsetX + Math.random() * areaW;
            p.y = offsetY + Math.random() * areaH;
        });

        // Center pan
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            this.pan.x = gameArea.clientWidth / 2 - this.imgW / 2;
            this.pan.y = gameArea.clientHeight / 2 - this.imgH / 2;
        }
    }

    _resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this._render();
    }

    _startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.completed) {
                this.elapsed = Date.now() - this.startTime;
                const el = document.getElementById('timer');
                if (el) el.textContent = this._formatTime(this.elapsed);
            }
        }, 1000);
    }

    _formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // ========== RENDERING ==========
    _render() {
        if (this.completed && !this._finalRender) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(this.pan.x, this.pan.y);
        ctx.scale(this.zoom, this.zoom);

        // Draw target area (ghost)
        ctx.save();
        ctx.strokeStyle = 'rgba(108,92,231,0.2)';
        ctx.lineWidth = 2 / this.zoom;
        ctx.setLineDash([8 / this.zoom, 8 / this.zoom]);
        ctx.strokeRect(0, 0, this.imgW, this.imgH);
        ctx.setLineDash([]);

        // Grid lines
        ctx.strokeStyle = 'rgba(108,92,231,0.06)';
        ctx.lineWidth = 1 / this.zoom;
        for (let c = 1; c < this.cols; c++) {
            ctx.beginPath();
            ctx.moveTo(c * this.pieceWidth, 0);
            ctx.lineTo(c * this.pieceWidth, this.imgH);
            ctx.stroke();
        }
        for (let r = 1; r < this.rows; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * this.pieceHeight);
            ctx.lineTo(this.imgW, r * this.pieceHeight);
            ctx.stroke();
        }
        ctx.restore();

        // Sort pieces: placed first, then by group, dragging last
        const sortedPieces = [...this.pieces].sort((a, b) => {
            if (a.isPlaced && !b.isPlaced) return -1;
            if (!a.isPlaced && b.isPlaced) return 1;
            if (this.dragging) {
                const aGroup = this._getGroup(a.id);
                const bGroup = this._getGroup(b.id);
                const dragGroup = this._getGroup(this.dragging.id);
                if (aGroup === dragGroup && bGroup !== dragGroup) return 1;
                if (bGroup === dragGroup && aGroup !== dragGroup) return -1;
            }
            return 0;
        });

        // Draw pieces
        sortedPieces.forEach(piece => {
            if (this.showEdgesOnly && !piece.isEdge && !piece.isPlaced) return;
            this._drawPiece(piece);
        });

        ctx.restore();
        requestAnimationFrame(() => this._render());
    }

    _drawPiece(piece) {
        const ctx = this.ctx;
        const pw = this.pieceWidth;
        const ph = this.pieceHeight;
        const tab = this.tabSize;

        ctx.save();
        ctx.translate(piece.x, piece.y);

        // Create clipping path with tabs
        ctx.beginPath();
        this._drawPiecePath(ctx, piece, pw, ph, tab);
        ctx.closePath();

        ctx.save();
        ctx.clip();

        // Draw image portion
        const sx = piece.col * (this.image.width / this.cols);
        const sy = piece.row * (this.image.height / this.rows);
        const sw = this.image.width / this.cols;
        const sh = this.image.height / this.rows;

        ctx.drawImage(
            this.image,
            sx - (tab * (this.image.width / this.imgW)),
            sy - (tab * (this.image.height / this.imgH)),
            sw + (2 * tab * (this.image.width / this.imgW)),
            sh + (2 * tab * (this.image.height / this.imgH)),
            -tab, -tab,
            pw + 2 * tab,
            ph + 2 * tab
        );

        ctx.restore();

        // Stroke outline
        ctx.beginPath();
        this._drawPiecePath(ctx, piece, pw, ph, tab);
        ctx.closePath();

        if (piece.isPlaced) {
            ctx.strokeStyle = 'rgba(0,184,148,0.4)';
            ctx.lineWidth = 1.5 / this.zoom;
        } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1.5 / this.zoom;
            // Shadow for unplaced
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 6 / this.zoom;
            ctx.shadowOffsetX = 2 / this.zoom;
            ctx.shadowOffsetY = 2 / this.zoom;
        }
        ctx.stroke();

        ctx.restore();
    }

    _drawPiecePath(ctx, piece, pw, ph, tab) {
        const t = piece.tabs;

        // Start top-left
        ctx.moveTo(0, 0);

        // Top edge
        if (t.top === 0) {
            ctx.lineTo(pw, 0);
        } else {
            ctx.lineTo(pw * 0.35, 0);
            ctx.bezierCurveTo(
                pw * 0.35, t.top * -tab * 0.4,
                pw * 0.4, t.top * -tab,
                pw * 0.5, t.top * -tab
            );
            ctx.bezierCurveTo(
                pw * 0.6, t.top * -tab,
                pw * 0.65, t.top * -tab * 0.4,
                pw * 0.65, 0
            );
            ctx.lineTo(pw, 0);
        }

        // Right edge
        if (t.right === 0) {
            ctx.lineTo(pw, ph);
        } else {
            ctx.lineTo(pw, ph * 0.35);
            ctx.bezierCurveTo(
                pw + t.right * tab * 0.4, ph * 0.35,
                pw + t.right * tab, ph * 0.4,
                pw + t.right * tab, ph * 0.5
            );
            ctx.bezierCurveTo(
                pw + t.right * tab, ph * 0.6,
                pw + t.right * tab * 0.4, ph * 0.65,
                pw, ph * 0.65
            );
            ctx.lineTo(pw, ph);
        }

        // Bottom edge
        if (t.bottom === 0) {
            ctx.lineTo(0, ph);
        } else {
            ctx.lineTo(pw * 0.65, ph);
            ctx.bezierCurveTo(
                pw * 0.65, ph + t.bottom * tab * 0.4,
                pw * 0.6, ph + t.bottom * tab,
                pw * 0.5, ph + t.bottom * tab
            );
            ctx.bezierCurveTo(
                pw * 0.4, ph + t.bottom * tab,
                pw * 0.35, ph + t.bottom * tab * 0.4,
                pw * 0.35, ph
            );
            ctx.lineTo(0, ph);
        }

        // Left edge
        if (t.left === 0) {
            ctx.lineTo(0, 0);
        } else {
            ctx.lineTo(0, ph * 0.65);
            ctx.bezierCurveTo(
                t.left * -tab * 0.4, ph * 0.65,
                t.left * -tab, ph * 0.6,
                t.left * -tab, ph * 0.5
            );
            ctx.bezierCurveTo(
                t.left * -tab, ph * 0.4,
                t.left * -tab * 0.4, ph * 0.35,
                0, ph * 0.35
            );
            ctx.lineTo(0, 0);
        }
    }

    // ========== INTERACTION ==========
    _bindEvents() {
        // Mouse
        this.canvas.addEventListener('mousedown', e => this._onPointerDown(e.offsetX, e.offsetY, e.button));
        this.canvas.addEventListener('mousemove', e => this._onPointerMove(e.offsetX, e.offsetY));
        this.canvas.addEventListener('mouseup', e => this._onPointerUp());
        this.canvas.addEventListener('wheel', e => this._onWheel(e));

        // Touch
        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this._onPointerDown(t.clientX - rect.left, t.clientY - rect.top, 0);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            const t = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this._onPointerMove(t.clientX - rect.left, t.clientY - rect.top);
        }, { passive: false });

        this.canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this._onPointerUp();
        });

        // Resize
        window.addEventListener('resize', () => this._resizeCanvas());
    }

    _screenToWorld(sx, sy) {
        return {
            x: (sx - this.pan.x) / this.zoom,
            y: (sy - this.pan.y) / this.zoom
        };
    }

    _hitTest(wx, wy) {
        // Test from top (last drawn = visually on top)
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const p = this.pieces[i];
            if (this.showEdgesOnly && !p.isEdge && !p.isPlaced) continue;
            if (p.isPlaced) continue;

            const margin = this.tabSize;
            if (wx >= p.x - margin && wx <= p.x + this.pieceWidth + margin &&
                wy >= p.y - margin && wy <= p.y + this.pieceHeight + margin) {
                return p;
            }
        }
        return null;
    }

    _onPointerDown(sx, sy, button) {
        const world = this._screenToWorld(sx, sy);

        if (button === 1 || button === 2) {
            // Middle/right click = pan
            this.isPanning = true;
            this.panStart.x = sx - this.pan.x;
            this.panStart.y = sy - this.pan.y;
            return;
        }

        const hit = this._hitTest(world.x, world.y);
        if (hit) {
            this.dragging = hit;
            this.dragOffset.x = world.x - hit.x;
            this.dragOffset.y = world.y - hit.y;

            // Bring entire group to top
            const group = this._getGroup(hit.id);
            if (group) {
                group.pieces.forEach(pid => {
                    const idx = this.pieces.findIndex(p => p.id === pid);
                    if (idx !== -1) {
                        const [piece] = this.pieces.splice(idx, 1);
                        this.pieces.push(piece);
                    }
                });
            }
        } else {
            // Pan
            this.isPanning = true;
            this.panStart.x = sx - this.pan.x;
            this.panStart.y = sy - this.pan.y;
        }

        this.lastMouse = { x: sx, y: sy };
    }

    _onPointerMove(sx, sy) {
        if (this.isPanning) {
            this.pan.x = sx - this.panStart.x;
            this.pan.y = sy - this.panStart.y;
            return;
        }

        if (this.dragging) {
            const world = this._screenToWorld(sx, sy);
            const dx = world.x - this.dragOffset.x - this.dragging.x;
            const dy = world.y - this.dragOffset.y - this.dragging.y;

            // Move entire group
            const group = this._getGroup(this.dragging.id);
            if (group) {
                group.pieces.forEach(pid => {
                    const p = this.pieces.find(pp => pp.id === pid);
                    if (p) {
                        p.x += dx;
                        p.y += dy;
                    }
                });
            }
        }

        this.lastMouse = { x: sx, y: sy };
    }

    _onPointerUp() {
        if (this.dragging) {
            this._trySnap(this.dragging);
            this.dragging = null;
            this._updateProgress();
            this._autoSave();
        }
        this.isPanning = false;
    }

    _onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.15, Math.min(4, this.zoom * delta));

        // Zoom toward mouse position
        const wx = (e.offsetX - this.pan.x) / this.zoom;
        const wy = (e.offsetY - this.pan.y) / this.zoom;

        this.zoom = newZoom;
        this.pan.x = e.offsetX - wx * this.zoom;
        this.pan.y = e.offsetY - wy * this.zoom;
    }

    // ========== SNAPPING ==========
    _trySnap(piece) {
        const group = this._getGroup(piece.id);
        if (!group) return;

        // Try snapping to correct position
        for (const pid of group.pieces) {
            const p = this.pieces.find(pp => pp.id === pid);
            if (!p) continue;

            const dx = p.correctX - p.x;
            const dy = p.correctY - p.y;

            if (Math.abs(dx) < this.snapDistance && Math.abs(dy) < this.snapDistance) {
                // Snap entire group to correct position
                group.pieces.forEach(gpid => {
                    const gp = this.pieces.find(pp => pp.id === gpid);
                    if (gp) {
                        gp.x = gp.correctX;
                        gp.y = gp.correctY;
                        gp.isPlaced = true;
                    }
                });
                return;
            }
        }

        // Try snapping to adjacent pieces
        for (const pid of [...group.pieces]) {
            const p = this.pieces.find(pp => pp.id === pid);
            if (!p) continue;

            const neighbors = this._getNeighborIds(p);
            for (const nid of neighbors) {
                const neighbor = this.pieces.find(pp => pp.id === nid);
                if (!neighbor) continue;

                const nGroup = this._getGroup(nid);
                if (nGroup && nGroup.id === group.id) continue; // same group

                const expectedDx = (neighbor.col - p.col) * this.pieceWidth;
                const expectedDy = (neighbor.row - p.row) * this.pieceHeight;

                const actualDx = neighbor.x - p.x;
                const actualDy = neighbor.y - p.y;

                if (Math.abs(actualDx - expectedDx) < this.snapDistance &&
                    Math.abs(actualDy - expectedDy) < this.snapDistance) {
                    // Snap group to neighbor group
                    this._mergeGroups(group, nGroup, p, neighbor);
                    return;
                }
            }
        }
    }

    _getNeighborIds(piece) {
        const ids = [];
        if (piece.row > 0) ids.push((piece.row - 1) * this.cols + piece.col);
        if (piece.row < this.rows - 1) ids.push((piece.row + 1) * this.cols + piece.col);
        if (piece.col > 0) ids.push(piece.row * this.cols + (piece.col - 1));
        if (piece.col < this.cols - 1) ids.push(piece.row * this.cols + (piece.col + 1));
        return ids;
    }

    _getGroup(pieceId) {
        const piece = this.pieces.find(p => p.id === pieceId);
        if (!piece) return null;
        return this.groups.find(g => g.id === piece.groupId);
    }

    _mergeGroups(groupA, groupB, pieceA, neighborB) {
        // Move groupA to align with groupB
        const expectedDx = (neighborB.col - pieceA.col) * this.pieceWidth;
        const expectedDy = (neighborB.row - pieceA.row) * this.pieceHeight;

        const shiftX = neighborB.x - expectedDx - pieceA.x;
        const shiftY = neighborB.y - expectedDy - pieceA.y;

        groupA.pieces.forEach(pid => {
            const p = this.pieces.find(pp => pp.id === pid);
            if (p) {
                p.x += shiftX;
                p.y += shiftY;
                p.groupId = groupB.id;
                // If neighbor is placed, this becomes placed too
                if (neighborB.isPlaced) {
                    p.x = p.correctX;
                    p.y = p.correctY;
                    p.isPlaced = true;
                }
            }
        });

        groupB.pieces.push(...groupA.pieces);
        this.groups = this.groups.filter(g => g.id !== groupA.id);

        // Check if placed
        if (groupB.pieces.some(pid => {
            const p = this.pieces.find(pp => pp.id === pid);
            return p && p.isPlaced;
        })) {
            groupB.pieces.forEach(pid => {
                const p = this.pieces.find(pp => pp.id === pid);
                if (p) {
                    p.x = p.correctX;
                    p.y = p.correctY;
                    p.isPlaced = true;
                }
            });
        }

        // After merge, try to snap new group with other neighbors
        this._tryAdditionalSnaps(groupB);
    }

    _tryAdditionalSnaps(group) {
        let merged = true;
        while (merged) {
            merged = false;
            for (const pid of [...group.pieces]) {
                const p = this.pieces.find(pp => pp.id === pid);
                if (!p) continue;

                const neighbors = this._getNeighborIds(p);
                for (const nid of neighbors) {
                    const neighbor = this.pieces.find(pp => pp.id === nid);
                    if (!neighbor) continue;

                    const nGroup = this._getGroup(nid);
                    if (nGroup && nGroup.id === group.id) continue;

                    const expectedDx = (neighbor.col - p.col) * this.pieceWidth;
                    const expectedDy = (neighbor.row - p.row) * this.pieceHeight;

                    const actualDx = neighbor.x - p.x;
                    const actualDy = neighbor.y - p.y;

                    if (Math.abs(actualDx - expectedDx) < 2 && Math.abs(actualDy - expectedDy) < 2) {
                        // They align perfectly, merge
                        nGroup.pieces.forEach(npid => {
                            const np = this.pieces.find(pp => pp.id === npid);
                            if (np) {
                                np.groupId = group.id;
                                if (p.isPlaced) {
                                    np.x = np.correctX;
                                    np.y = np.correctY;
                                    np.isPlaced = true;
                                }
                            }
                        });
                        group.pieces.push(...nGroup.pieces);
                        this.groups = this.groups.filter(g => g.id !== nGroup.id);
                        merged = true;
                    }
                }
            }
        }
    }

    // ========== PROGRESS ==========
    _updateProgress() {
        this.placedCount = this.pieces.filter(p => p.isPlaced).length;
        const pct = Math.round((this.placedCount / this.totalPieces) * 100);

        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');
        const info = document.getElementById('pieces-info');

        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = pct + '%';
        if (info) info.textContent = `${this.placedCount}/${this.totalPieces}`;

        if (this.onProgress) this.onProgress(pct);

        // Check completion - all pieces in one group and placed
        if (this.placedCount === this.totalPieces && !this.completed) {
            this.completed = true;
            this._finalRender = true;
            clearInterval(this.timerInterval);
            Storage.deleteSave(this.puzzleId);
            if (this.onComplete) {
                setTimeout(() => this.onComplete(this._formatTime(this.elapsed), this.totalPieces), 500);
            }
        }
    }

    // ========== SAVE / RESTORE ==========
    _autoSave() {
        if (this.completed) return;
        const state = {
            pieces: this.pieces.map(p => ({
                id: p.id, x: p.x, y: p.y,
                groupId: p.groupId, isPlaced: p.isPlaced
            })),
            groups: this.groups.map(g => ({
                id: g.id, pieces: [...g.pieces]
            })),
            tabs: this.tabs,
            elapsed: this.elapsed,
            zoom: this.zoom,
            pan: { ...this.pan },
            cols: this.cols,
            rows: this.rows,
            totalPieces: this.totalPieces,
            placedCount: this.placedCount,
            progress: Math.round((this.placedCount / this.totalPieces) * 100)
        };
        Storage.savePuzzle(this.puzzleId, state);
    }

    _restoreState(saved) {
        this.cols = saved.cols;
        this.rows = saved.rows;
        this.totalPieces = saved.totalPieces;
        this.tabs = saved.tabs;
        this.elapsed = saved.elapsed || 0;
        this.startTime = Date.now() - this.elapsed;

        if (saved.zoom) this.zoom = saved.zoom;
        if (saved.pan) this.pan = { ...saved.pan };

        // Recreate pieces with tabs
        this._createPieces();

        // Restore positions and groups
        saved.pieces.forEach(sp => {
            const piece = this.pieces.find(p => p.id === sp.id);
            if (piece) {
                piece.x = sp.x;
                piece.y = sp.y;
                piece.groupId = sp.groupId;
                piece.isPlaced = sp.isPlaced;
            }
        });

        // Restore tabs from saved
        this.pieces.forEach(p => {
            if (this.tabs[p.row] && this.tabs[p.row][p.col]) {
                p.tabs = this.tabs[p.row][p.col];
            }
        });

        this.groups = saved.groups.map(g => ({
            id: g.id,
            pieces: [...g.pieces]
        }));

        this._updateProgress();
    }

    // ========== CONTROLS ==========
    zoomIn() {
        this.zoom = Math.min(4, this.zoom * 1.3);
    }

    zoomOut() {
        this.zoom = Math.max(0.15, this.zoom * 0.7);
    }

    resetZoom() {
        this.zoom = 1;
        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            this.pan.x = gameArea.clientWidth / 2 - this.imgW / 2;
            this.pan.y = gameArea.clientHeight / 2 - this.imgH / 2;
        }
    }

    toggleEdges() {
        this.showEdgesOnly = !this.showEdgesOnly;
        return this.showEdgesOnly;
    }

    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this._finalRender = false;
        this.completed = true; // stop render loop
    }
}
