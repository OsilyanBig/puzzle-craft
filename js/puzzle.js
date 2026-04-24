class PuzzleGame {
    constructor(canvasEl, imageUrl, pieceCount, puzzleId) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
        this.imageUrl = imageUrl;
        this.requestedPieces = pieceCount;
        this.puzzleId = puzzleId;

        this.img = null;
        this.pieces = [];
        this.cols = 0;
        this.rows = 0;
        this.pw = 0;   // piece width in puzzle coords
        this.ph = 0;   // piece height in puzzle coords
        this.tab = 0;
        this.snapDist = 0;

        // view
        this.panX = 0;
        this.panY = 0;
        this.scale = 1;

        // interaction
        this.dragPiece = null;
        this.dragOffX = 0;
        this.dragOffY = 0;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.pointerDown = false;
        this.pointerX = 0;
        this.pointerY = 0;

        // state
        this.running = false;
        this.completed = false;
        this.showEdges = false;
        this.startTime = Date.now();
        this.elapsed = 0;
        this.timerInterval = null;

        this.onComplete = null;

        this._boundRender = this._renderLoop.bind(this);
        this._bindInput();
    }

    /* ───── LOAD ───── */
    load(savedState) {
        return new Promise((resolve, reject) => {
            this.img = new Image();
            this.img.crossOrigin = 'anonymous';

            this.img.onload = () => {
                this._setup();
                if (savedState && savedState.pieces) {
                    this._restore(savedState);
                } else {
                    this._generate();
                    this._scatter();
                }
                this._centerView();
                this.running = true;
                this._startTimer();
                this._boundRender();
                this._updateUI();
                resolve();
            };

            this.img.onerror = () => {
                // retry with CORS proxy
                if (!this._retried) {
                    this._retried = true;
                    this.img.src = 'https://corsproxy.io/?' + encodeURIComponent(this.imageUrl);
                } else {
                    reject(new Error('Image failed'));
                }
            };

            this.img.src = this.imageUrl;
        });
    }

    /* ───── SETUP GRID ───── */
    _setup() {
        const ratio = this.img.width / this.img.height;
        this.cols = Math.round(Math.sqrt(this.requestedPieces * ratio));
        this.rows = Math.round(this.requestedPieces / this.cols);
        if (this.cols < 2) this.cols = 2;
        if (this.rows < 2) this.rows = 2;
        this.totalPieces = this.cols * this.rows;

        // puzzle image size in world coords (cap it for performance)
        const maxDim = 1400;
        const sc = maxDim / Math.max(this.img.width, this.img.height);
        this.imgW = this.img.width * sc;
        this.imgH = this.img.height * sc;

        this.pw = this.imgW / this.cols;
        this.ph = this.imgH / this.rows;
        this.tab = Math.min(this.pw, this.ph) * 0.2;
        this.snapDist = Math.min(this.pw, this.ph) * 0.3;
    }

    /* ───── GENERATE PIECES ───── */
    _generate() {
        // build tab directions between cells
        this.edgesH = []; // horizontal edges (between row r and r+1)
        this.edgesV = []; // vertical edges (between col c and c+1)

        for (let r = 0; r < this.rows - 1; r++) {
            this.edgesH[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.edgesH[r][c] = Math.random() > 0.5 ? 1 : -1;
            }
        }
        for (let r = 0; r < this.rows; r++) {
            this.edgesV[r] = [];
            for (let c = 0; c < this.cols - 1; c++) {
                this.edgesV[r][c] = Math.random() > 0.5 ? 1 : -1;
            }
        }

        this.pieces = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.pieces.push({
                    id: r * this.cols + c,
                    r, c,
                    // current world position
                    x: c * this.pw,
                    y: r * this.ph,
                    // correct position
                    cx: c * this.pw,
                    cy: r * this.ph,
                    group: r * this.cols + c,
                    placed: false,
                    edge: r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1,
                    // tab info
                    top:    r > 0              ? -this.edgesH[r-1][c] : 0,
                    bottom: r < this.rows - 1  ?  this.edgesH[r][c]   : 0,
                    left:   c > 0              ? -this.edgesV[r][c-1] : 0,
                    right:  c < this.cols - 1  ?  this.edgesV[r][c]   : 0,
                });
            }
        }
    }

    _scatter() {
        const spread = Math.max(this.imgW, this.imgH) * 1.5;
        for (const p of this.pieces) {
            p.x = -spread / 2 + Math.random() * spread * 2;
            p.y = -spread / 4 + Math.random() * spread * 1.5;
            p.placed = false;
            p.group = p.id;
        }
    }

    _centerView() {
        const area = document.getElementById('game-area');
        if (!area) return;
        this.scale = Math.min(area.clientWidth / (this.imgW * 1.5), area.clientHeight / (this.imgH * 1.5), 1);
        this.panX = area.clientWidth / 2 - (this.imgW / 2) * this.scale;
        this.panY = area.clientHeight / 2 - (this.imgH / 2) * this.scale;
    }

    /* ───── RENDER ───── */
    _renderLoop() {
        if (!this.running) return;
        this._draw();
        requestAnimationFrame(this._boundRender);
    }

    _draw() {
        const { canvas, ctx } = this;
        const area = canvas.parentElement;
        canvas.width = area.clientWidth;
        canvas.height = area.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.scale, this.scale);

        // target outline
        ctx.save();
        ctx.strokeStyle = 'rgba(108,92,231,0.25)';
        ctx.lineWidth = 2 / this.scale;
        ctx.setLineDash([10 / this.scale, 10 / this.scale]);
        ctx.strokeRect(0, 0, this.imgW, this.imgH);
        ctx.setLineDash([]);
        // grid
        ctx.strokeStyle = 'rgba(108,92,231,0.07)';
        ctx.lineWidth = 1 / this.scale;
        for (let c = 1; c < this.cols; c++) { ctx.beginPath(); ctx.moveTo(c * this.pw, 0); ctx.lineTo(c * this.pw, this.imgH); ctx.stroke(); }
        for (let r = 1; r < this.rows; r++) { ctx.beginPath(); ctx.moveTo(0, r * this.ph); ctx.lineTo(this.imgW, r * this.ph); ctx.stroke(); }
        ctx.restore();

        // sort: placed → unplaced, dragged on top
        const sorted = [...this.pieces].sort((a, b) => {
            if (a.placed !== b.placed) return a.placed ? -1 : 1;
            if (this.dragPiece) {
                const ag = a.group === this.dragPiece.group ? 1 : 0;
                const bg = b.group === this.dragPiece.group ? 1 : 0;
                if (ag !== bg) return ag - bg;
            }
            return 0;
        });

        for (const p of sorted) {
            if (this.showEdges && !p.edge && !p.placed) continue;
            this._drawPiece(p);
        }

        ctx.restore();
    }

    _drawPiece(p) {
        const { ctx, pw, ph, tab } = this;

        ctx.save();
        ctx.translate(p.x, p.y);

        // clip path
        ctx.beginPath();
        this._piecePath(ctx, p);
        ctx.closePath();

        // shadow for unplaced
        if (!p.placed) {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 8 / this.scale;
            ctx.shadowOffsetX = 3 / this.scale;
            ctx.shadowOffsetY = 3 / this.scale;
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.shadowColor = 'transparent';
        }

        ctx.beginPath();
        this._piecePath(ctx, p);
        ctx.closePath();
        ctx.save();
        ctx.clip();

        // draw the image portion (with tab margin)
        const srcScaleX = this.img.width / this.imgW;
        const srcScaleY = this.img.height / this.imgH;

        const sx = (p.cx - tab) * srcScaleX;
        const sy = (p.cy - tab) * srcScaleY;
        const sWidth = (pw + tab * 2) * srcScaleX;
        const sHeight = (ph + tab * 2) * srcScaleY;

        ctx.drawImage(
            this.img,
            sx, sy, sWidth, sHeight,
            -tab, -tab, pw + tab * 2, ph + tab * 2
        );

        ctx.restore();

        // stroke
        ctx.beginPath();
        this._piecePath(ctx, p);
        ctx.closePath();
        ctx.strokeStyle = p.placed ? 'rgba(0,184,148,0.5)' : 'rgba(255,255,255,0.45)';
        ctx.lineWidth = (p.placed ? 1 : 1.5) / this.scale;
        ctx.stroke();

        ctx.restore();
    }

    _piecePath(ctx, p) {
        const { pw, ph, tab } = this;
        const neck = 0.5;  // how narrow the neck is (0-1)
        const tabW = 0.3;  // tab width as fraction of edge

        ctx.moveTo(0, 0);

        // TOP
        if (p.top === 0) {
            ctx.lineTo(pw, 0);
        } else {
            const d = p.top;
            ctx.lineTo(pw * (0.5 - tabW / 2), 0);
            ctx.bezierCurveTo(
                pw * (0.5 - tabW / 2), d * -tab * neck,
                pw * (0.5 - tabW / 2 - 0.04), d * -tab,
                pw * 0.5, d * -tab
            );
            ctx.bezierCurveTo(
                pw * (0.5 + tabW / 2 + 0.04), d * -tab,
                pw * (0.5 + tabW / 2), d * -tab * neck,
                pw * (0.5 + tabW / 2), 0
            );
            ctx.lineTo(pw, 0);
        }

        // RIGHT
        if (p.right === 0) {
            ctx.lineTo(pw, ph);
        } else {
            const d = p.right;
            ctx.lineTo(pw, ph * (0.5 - tabW / 2));
            ctx.bezierCurveTo(
                pw + d * tab * neck, ph * (0.5 - tabW / 2),
                pw + d * tab, ph * (0.5 - tabW / 2 - 0.04),
                pw + d * tab, ph * 0.5
            );
            ctx.bezierCurveTo(
                pw + d * tab, ph * (0.5 + tabW / 2 + 0.04),
                pw + d * tab * neck, ph * (0.5 + tabW / 2),
                pw, ph * (0.5 + tabW / 2)
            );
            ctx.lineTo(pw, ph);
        }

        // BOTTOM
        if (p.bottom === 0) {
            ctx.lineTo(0, ph);
        } else {
            const d = p.bottom;
            ctx.lineTo(pw * (0.5 + tabW / 2), ph);
            ctx.bezierCurveTo(
                pw * (0.5 + tabW / 2), ph + d * tab * neck,
                pw * (0.5 + tabW / 2 + 0.04), ph + d * tab,
                pw * 0.5, ph + d * tab
            );
            ctx.bezierCurveTo(
                pw * (0.5 - tabW / 2 - 0.04), ph + d * tab,
                pw * (0.5 - tabW / 2), ph + d * tab * neck,
                pw * (0.5 - tabW / 2), ph
            );
            ctx.lineTo(0, ph);
        }

        // LEFT
        if (p.left === 0) {
            ctx.lineTo(0, 0);
        } else {
            const d = p.left;
            ctx.lineTo(0, ph * (0.5 + tabW / 2));
            ctx.bezierCurveTo(
                d * -tab * neck, ph * (0.5 + tabW / 2),
                d * -tab, ph * (0.5 + tabW / 2 + 0.04),
                d * -tab, ph * 0.5
            );
            ctx.bezierCurveTo(
                d * -tab, ph * (0.5 - tabW / 2 - 0.04),
                d * -tab * neck, ph * (0.5 - tabW / 2),
                0, ph * (0.5 - tabW / 2)
            );
            ctx.lineTo(0, 0);
        }
    }

    /* ───── INPUT ───── */
    _bindInput() {
        const c = this.canvas;
        c.addEventListener('mousedown', e => { e.preventDefault(); this._down(e.offsetX, e.offsetY, e.button); });
        c.addEventListener('mousemove', e => this._move(e.offsetX, e.offsetY));
        c.addEventListener('mouseup', () => this._up());
        c.addEventListener('mouseleave', () => this._up());
        c.addEventListener('wheel', e => { e.preventDefault(); this._wheel(e); }, { passive: false });
        c.addEventListener('contextmenu', e => e.preventDefault());

        c.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0], r = c.getBoundingClientRect();
            this._down(t.clientX - r.left, t.clientY - r.top, 0);
        }, { passive: false });
        c.addEventListener('touchmove', e => {
            e.preventDefault();
            const t = e.touches[0], r = c.getBoundingClientRect();
            this._move(t.clientX - r.left, t.clientY - r.top);
        }, { passive: false });
        c.addEventListener('touchend', e => { e.preventDefault(); this._up(); }, { passive: false });
    }

    _screenToWorld(sx, sy) {
        return {
            x: (sx - this.panX) / this.scale,
            y: (sy - this.panY) / this.scale
        };
    }

    _hitTest(wx, wy) {
        // reverse order (top-most first)
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const p = this.pieces[i];
            if (p.placed) continue;
            if (this.showEdges && !p.edge) continue;
            const m = this.tab;
            if (wx >= p.x - m && wx <= p.x + this.pw + m &&
                wy >= p.y - m && wy <= p.y + this.ph + m) {
                return p;
            }
        }
        return null;
    }

    _down(sx, sy, btn) {
        this.pointerDown = true;
        this.pointerX = sx;
        this.pointerY = sy;

        if (btn === 2) { this.isPanning = true; this.panStartX = sx - this.panX; this.panStartY = sy - this.panY; return; }

        const w = this._screenToWorld(sx, sy);
        const hit = this._hitTest(w.x, w.y);

        if (hit) {
            this.dragPiece = hit;
            this.dragOffX = w.x - hit.x;
            this.dragOffY = w.y - hit.y;
            // bring group to top
            const gid = hit.group;
            const inGroup = this.pieces.filter(p => p.group === gid);
            const rest = this.pieces.filter(p => p.group !== gid);
            this.pieces = [...rest, ...inGroup];
        } else {
            this.isPanning = true;
            this.panStartX = sx - this.panX;
            this.panStartY = sy - this.panY;
        }
    }

    _move(sx, sy) {
        if (!this.pointerDown) return;

        if (this.isPanning) {
            this.panX = sx - this.panStartX;
            this.panY = sy - this.panStartY;
            return;
        }

        if (this.dragPiece) {
            const w = this._screenToWorld(sx, sy);
            const nx = w.x - this.dragOffX;
            const ny = w.y - this.dragOffY;
            const dx = nx - this.dragPiece.x;
            const dy = ny - this.dragPiece.y;
            const gid = this.dragPiece.group;
            for (const p of this.pieces) {
                if (p.group === gid) { p.x += dx; p.y += dy; }
            }
        }
    }

    _up() {
        if (this.dragPiece) {
            this._trySnap(this.dragPiece);
            this.dragPiece = null;
            this._updateUI();
            this._autoSave();
        }
        this.pointerDown = false;
        this.isPanning = false;
    }

    _wheel(e) {
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(5, this.scale * factor));
        const wx = (e.offsetX - this.panX) / this.scale;
        const wy = (e.offsetY - this.panY) / this.scale;
        this.scale = newScale;
        this.panX = e.offsetX - wx * this.scale;
        this.panY = e.offsetY - wy * this.scale;
    }

    /* ───── SNAPPING ───── */
    _trySnap(piece) {
        const gid = piece.group;
        const groupPieces = this.pieces.filter(p => p.group === gid);

        // 1) Try snap to board (correct position)
        for (const gp of groupPieces) {
            const dx = gp.cx - gp.x;
            const dy = gp.cy - gp.y;
            if (Math.abs(dx) < this.snapDist && Math.abs(dy) < this.snapDist) {
                // snap whole group to correct positions
                for (const gp2 of groupPieces) {
                    gp2.x = gp2.cx;
                    gp2.y = gp2.cy;
                    gp2.placed = true;
                }
                this._checkComplete();
                return;
            }
        }

        // 2) Try snap to neighbor pieces/groups
        for (const gp of groupPieces) {
            const neighbors = this._neighborIds(gp);
            for (const nid of neighbors) {
                const nb = this.pieces.find(p => p.id === nid);
                if (!nb || nb.group === gid) continue;

                const expDx = (nb.c - gp.c) * this.pw;
                const expDy = (nb.r - gp.r) * this.ph;
                const actDx = nb.x - gp.x;
                const actDy = nb.y - gp.y;

                if (Math.abs(actDx - expDx) < this.snapDist && Math.abs(actDy - expDy) < this.snapDist) {
                    this._merge(gid, nb.group, gp, nb);
                    this._checkComplete();
                    return;
                }
            }
        }
    }

    _neighborIds(p) {
        const ids = [];
        if (p.r > 0) ids.push((p.r - 1) * this.cols + p.c);
        if (p.r < this.rows - 1) ids.push((p.r + 1) * this.cols + p.c);
        if (p.c > 0) ids.push(p.r * this.cols + (p.c - 1));
        if (p.c < this.cols - 1) ids.push(p.r * this.cols + (p.c + 1));
        return ids;
    }

    _merge(gidA, gidB, pieceA, neighborB) {
        // align A group to B group
        const shiftX = (neighborB.x - (neighborB.c - pieceA.c) * this.pw) - pieceA.x;
        const shiftY = (neighborB.y - (neighborB.r - pieceA.r) * this.ph) - pieceA.y;

        const isPlaced = neighborB.placed;
        for (const p of this.pieces) {
            if (p.group === gidA) {
                p.x += shiftX;
                p.y += shiftY;
                p.group = gidB;
                if (isPlaced) {
                    p.x = p.cx;
                    p.y = p.cy;
                    p.placed = true;
                }
            }
        }

        // if any piece in merged group is placed, place all
        if (this.pieces.some(p => p.group === gidB && p.placed)) {
            for (const p of this.pieces) {
                if (p.group === gidB) {
                    p.x = p.cx;
                    p.y = p.cy;
                    p.placed = true;
                }
            }
        }

        // chain-merge: find other neighbors that now align
        this._chainMerge(gidB);
    }

    _chainMerge(gid) {
        let found = true;
        while (found) {
            found = false;
            const groupPieces = this.pieces.filter(p => p.group === gid);
            for (const gp of groupPieces) {
                for (const nid of this._neighborIds(gp)) {
                    const nb = this.pieces.find(p => p.id === nid);
                    if (!nb || nb.group === gid) continue;
                    const dx = Math.abs(nb.x - gp.x - (nb.c - gp.c) * this.pw);
                    const dy = Math.abs(nb.y - gp.y - (nb.r - gp.r) * this.ph);
                    if (dx < 2 && dy < 2) {
                        const oldGid = nb.group;
                        const isPlaced = gp.placed || nb.placed;
                        for (const p of this.pieces) {
                            if (p.group === oldGid) {
                                p.group = gid;
                                if (isPlaced) { p.x = p.cx; p.y = p.cy; p.placed = true; }
                            }
                        }
                        found = true;
                    }
                }
            }
        }
    }

    _checkComplete() {
        const placed = this.pieces.filter(p => p.placed).length;
        if (placed === this.pieces.length && !this.completed) {
            this.completed = true;
            clearInterval(this.timerInterval);
            Storage.deleteSave(this.puzzleId);
            if (this.onComplete) {
                setTimeout(() => {
                    this.onComplete(this._fmtTime(this.elapsed), this.pieces.length);
                }, 600);
            }
        }
    }

    /* ───── UI ───── */
    _updateUI() {
        const placed = this.pieces.filter(p => p.placed).length;
        const total = this.pieces.length;
        const pct = Math.round((placed / total) * 100);

        const el1 = document.getElementById('pieces-info');
        const el2 = document.getElementById('progress-fill');
        const el3 = document.getElementById('progress-text');
        if (el1) el1.textContent = `${placed}/${total}`;
        if (el2) el2.style.width = pct + '%';
        if (el3) el3.textContent = pct + '%';
    }

    _startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.completed) {
                this.elapsed = Date.now() - this.startTime;
                const el = document.getElementById('timer');
                if (el) el.textContent = this._fmtTime(this.elapsed);
            }
        }, 500);
    }

    _fmtTime(ms) {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        if (h > 0) return `${h}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    }

    /* ───── SAVE / RESTORE ───── */
    _autoSave() {
        if (this.completed) return;
        const placed = this.pieces.filter(p => p.placed).length;
        const pct = Math.round((placed / this.pieces.length) * 100);

        Storage.savePuzzle(this.puzzleId, {
            pieces: this.pieces.map(p => ({ id: p.id, x: p.x, y: p.y, group: p.group, placed: p.placed })),
            edgesH: this.edgesH,
            edgesV: this.edgesV,
            cols: this.cols,
            rows: this.rows,
            elapsed: this.elapsed,
            panX: this.panX,
            panY: this.panY,
            scale: this.scale,
            totalPieces: this.pieces.length,
            placedCount: placed,
            progress: pct
        });
    }

    _restore(saved) {
        this.cols = saved.cols;
        this.rows = saved.rows;
        this.edgesH = saved.edgesH;
        this.edgesV = saved.edgesV;
        this.elapsed = saved.elapsed || 0;
        this.startTime = Date.now() - this.elapsed;
        if (saved.scale) this.scale = saved.scale;
        if (saved.panX !== undefined) { this.panX = saved.panX; this.panY = saved.panY; }

        this.totalPieces = this.cols * this.rows;
        this.pw = this.imgW / this.cols;
        this.ph = this.imgH / this.rows;
        this.tab = Math.min(this.pw, this.ph) * 0.2;
        this.snapDist = Math.min(this.pw, this.ph) * 0.3;

        this._generate(); // rebuild piece tab info from edges

        // restore positions
        for (const sp of saved.pieces) {
            const p = this.pieces.find(pp => pp.id === sp.id);
            if (p) {
                p.x = sp.x;
                p.y = sp.y;
                p.group = sp.group;
                p.placed = sp.placed;
            }
        }
    }

    /* ───── CONTROLS ───── */
    zoomIn() { this.scale = Math.min(5, this.scale * 1.3); }
    zoomOut() { this.scale = Math.max(0.1, this.scale * 0.7); }
    resetZoom() { this._centerView(); }
    toggleEdges() { this.showEdges = !this.showEdges; return this.showEdges; }

    destroy() {
        this.running = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
}
