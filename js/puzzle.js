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
        this.pw = 0;
        this.ph = 0;
        this.tab = 0;
        this.snapDist = 0;

        this.panX = 0;
        this.panY = 0;
        this.scale = 1;

        this.dragPiece = null;
        this.dragOffX = 0;
        this.dragOffY = 0;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.pointerDown = false;

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

    load(savedState) {
        return new Promise((resolve, reject) => {
            this.img = new Image();

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
                reject(new Error('Image failed to load: ' + this.imageUrl));
            };

            this.img.src = this.imageUrl;
        });
    }

    _setup() {
        const ratio = this.img.width / this.img.height;
        this.cols = Math.round(Math.sqrt(this.requestedPieces * ratio));
        this.rows = Math.round(this.requestedPieces / this.cols);
        if (this.cols < 2) this.cols = 2;
        if (this.rows < 2) this.rows = 2;
        this.totalPieces = this.cols * this.rows;

        const maxDim = 1400;
        const sc = maxDim / Math.max(this.img.width, this.img.height);
        this.imgW = this.img.width * sc;
        this.imgH = this.img.height * sc;

        this.pw = this.imgW / this.cols;
        this.ph = this.imgH / this.rows;
        this.tab = Math.min(this.pw, this.ph) * 0.2;
        this.snapDist = Math.min(this.pw, this.ph) * 0.3;
    }

    _generate() {
        this.edgesH = [];
        this.edgesV = [];

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
                    r: r,
                    c: c,
                    x: c * this.pw,
                    y: r * this.ph,
                    cx: c * this.pw,
                    cy: r * this.ph,
                    group: r * this.cols + c,
                    placed: false,
                    edge: r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1,
                    top: r > 0 ? -this.edgesH[r - 1][c] : 0,
                    bottom: r < this.rows - 1 ? this.edgesH[r][c] : 0,
                    left: c > 0 ? -this.edgesV[r][c - 1] : 0,
                    right: c < this.cols - 1 ? this.edgesV[r][c] : 0
                });
            }
        }
    }

    _scatter() {
        var spread = Math.max(this.imgW, this.imgH) * 1.5;
        for (var i = 0; i < this.pieces.length; i++) {
            var p = this.pieces[i];
            p.x = -spread / 2 + Math.random() * spread * 2;
            p.y = -spread / 4 + Math.random() * spread * 1.5;
            p.placed = false;
            p.group = p.id;
        }
    }

    _centerView() {
        var area = document.getElementById('game-area');
        if (!area) return;
        this.scale = Math.min(
            area.clientWidth / (this.imgW * 1.5),
            area.clientHeight / (this.imgH * 1.5),
            1
        );
        this.panX = area.clientWidth / 2 - (this.imgW / 2) * this.scale;
        this.panY = area.clientHeight / 2 - (this.imgH / 2) * this.scale;
    }

    // ─── RENDER ───
    _renderLoop() {
        if (!this.running) return;
        this._draw();
        requestAnimationFrame(this._boundRender);
    }

    _draw() {
        var canvas = this.canvas;
        var ctx = this.ctx;
        var area = canvas.parentElement;

        canvas.width = area.clientWidth;
        canvas.height = area.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.scale, this.scale);

        // target area
        ctx.save();
        ctx.strokeStyle = 'rgba(108,92,231,0.25)';
        ctx.lineWidth = 2 / this.scale;
        ctx.setLineDash([10 / this.scale, 10 / this.scale]);
        ctx.strokeRect(0, 0, this.imgW, this.imgH);
        ctx.setLineDash([]);

        // grid
        ctx.strokeStyle = 'rgba(108,92,231,0.07)';
        ctx.lineWidth = 1 / this.scale;
        for (var c = 1; c < this.cols; c++) {
            ctx.beginPath();
            ctx.moveTo(c * this.pw, 0);
            ctx.lineTo(c * this.pw, this.imgH);
            ctx.stroke();
        }
        for (var r = 1; r < this.rows; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * this.ph);
            ctx.lineTo(this.imgW, r * this.ph);
            ctx.stroke();
        }
        ctx.restore();

        // sort pieces
        var self = this;
        var sorted = this.pieces.slice().sort(function (a, b) {
            if (a.placed && !b.placed) return -1;
            if (!a.placed && b.placed) return 1;
            if (self.dragPiece) {
                var ag = a.group === self.dragPiece.group ? 1 : 0;
                var bg = b.group === self.dragPiece.group ? 1 : 0;
                if (ag !== bg) return ag - bg;
            }
            return 0;
        });

        for (var i = 0; i < sorted.length; i++) {
            var p = sorted[i];
            if (this.showEdges && !p.edge && !p.placed) continue;
            this._drawPiece(p);
        }

        ctx.restore();
    }

    _drawPiece(p) {
        var ctx = this.ctx;
        var pw = this.pw;
        var ph = this.ph;
        var tab = this.tab;

        ctx.save();
        ctx.translate(p.x, p.y);

        // shadow
        if (!p.placed) {
            ctx.beginPath();
            this._piecePath(ctx, p);
            ctx.closePath();
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 8 / this.scale;
            ctx.shadowOffsetX = 3 / this.scale;
            ctx.shadowOffsetY = 3 / this.scale;
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        // clip and draw image
        ctx.beginPath();
        this._piecePath(ctx, p);
        ctx.closePath();
        ctx.save();
        ctx.clip();

        var srcScaleX = this.img.width / this.imgW;
        var srcScaleY = this.img.height / this.imgH;

        var sx = (p.cx - tab) * srcScaleX;
        var sy = (p.cy - tab) * srcScaleY;
        var sWidth = (pw + tab * 2) * srcScaleX;
        var sHeight = (ph + tab * 2) * srcScaleY;

        // clamp source coords
        var sx2 = Math.max(0, sx);
        var sy2 = Math.max(0, sy);
        var sRight = Math.min(this.img.width, sx + sWidth);
        var sBottom = Math.min(this.img.height, sy + sHeight);

        var destX = -tab + (sx2 - sx) / srcScaleX;
        var destY = -tab + (sy2 - sy) / srcScaleY;
        var destW = (sRight - sx2) / srcScaleX;
        var destH = (sBottom - sy2) / srcScaleY;

        if (destW > 0 && destH > 0) {
            ctx.drawImage(
                this.img,
                sx2, sy2, sRight - sx2, sBottom - sy2,
                destX, destY, destW, destH
            );
        }

        ctx.restore();

        // outline
        ctx.beginPath();
        this._piecePath(ctx, p);
        ctx.closePath();
        ctx.strokeStyle = p.placed ? 'rgba(0,184,148,0.5)' : 'rgba(255,255,255,0.45)';
        ctx.lineWidth = (p.placed ? 1 : 1.5) / this.scale;
        ctx.stroke();

        ctx.restore();
    }

    _piecePath(ctx, p) {
        var pw = this.pw;
        var ph = this.ph;
        var tab = this.tab;
        var neck = 0.5;
        var tabW = 0.3;

        ctx.moveTo(0, 0);

        // TOP
        if (p.top === 0) {
            ctx.lineTo(pw, 0);
        } else {
            var d = p.top;
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
            var d = p.right;
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
            var d = p.bottom;
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
            var d = p.left;
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

    // ─── INPUT ───
    _bindInput() {
        var self = this;
        var c = this.canvas;

        c.addEventListener('mousedown', function (e) {
            e.preventDefault();
            self._down(e.offsetX, e.offsetY, e.button);
        });
        c.addEventListener('mousemove', function (e) {
            self._move(e.offsetX, e.offsetY);
        });
        c.addEventListener('mouseup', function () { self._up(); });
        c.addEventListener('mouseleave', function () { self._up(); });
        c.addEventListener('wheel', function (e) {
            e.preventDefault();
            self._wheel(e);
        }, { passive: false });
        c.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        c.addEventListener('touchstart', function (e) {
            e.preventDefault();
            var t = e.touches[0];
            var r = c.getBoundingClientRect();
            self._down(t.clientX - r.left, t.clientY - r.top, 0);
        }, { passive: false });

        c.addEventListener('touchmove', function (e) {
            e.preventDefault();
            var t = e.touches[0];
            var r = c.getBoundingClientRect();
            self._move(t.clientX - r.left, t.clientY - r.top);
        }, { passive: false });

        c.addEventListener('touchend', function (e) {
            e.preventDefault();
            self._up();
        }, { passive: false });
    }

    _screenToWorld(sx, sy) {
        return {
            x: (sx - this.panX) / this.scale,
            y: (sy - this.panY) / this.scale
        };
    }

    _hitTest(wx, wy) {
        for (var i = this.pieces.length - 1; i >= 0; i--) {
            var p = this.pieces[i];
            if (p.placed) continue;
            if (this.showEdges && !p.edge) continue;
            var m = this.tab;
            if (wx >= p.x - m && wx <= p.x + this.pw + m &&
                wy >= p.y - m && wy <= p.y + this.ph + m) {
                return p;
            }
        }
        return null;
    }

    _down(sx, sy, btn) {
        this.pointerDown = true;

        if (btn === 2) {
            this.isPanning = true;
            this.panStartX = sx - this.panX;
            this.panStartY = sy - this.panY;
            return;
        }

        var w = this._screenToWorld(sx, sy);
        var hit = this._hitTest(w.x, w.y);

        if (hit) {
            this.dragPiece = hit;
            this.dragOffX = w.x - hit.x;
            this.dragOffY = w.y - hit.y;

            var gid = hit.group;
            var inGroup = [];
            var rest = [];
            for (var i = 0; i < this.pieces.length; i++) {
                if (this.pieces[i].group === gid) {
                    inGroup.push(this.pieces[i]);
                } else {
                    rest.push(this.pieces[i]);
                }
            }
            this.pieces = rest.concat(inGroup);
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
            var w = this._screenToWorld(sx, sy);
            var nx = w.x - this.dragOffX;
            var ny = w.y - this.dragOffY;
            var dx = nx - this.dragPiece.x;
            var dy = ny - this.dragPiece.y;
            var gid = this.dragPiece.group;

            for (var i = 0; i < this.pieces.length; i++) {
                if (this.pieces[i].group === gid) {
                    this.pieces[i].x += dx;
                    this.pieces[i].y += dy;
                }
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
        var factor = e.deltaY > 0 ? 0.9 : 1.1;
        var newScale = Math.max(0.1, Math.min(5, this.scale * factor));
        var wx = (e.offsetX - this.panX) / this.scale;
        var wy = (e.offsetY - this.panY) / this.scale;
        this.scale = newScale;
        this.panX = e.offsetX - wx * this.scale;
        this.panY = e.offsetY - wy * this.scale;
    }

    // ─── SNAPPING ───
    _trySnap(piece) {
        var gid = piece.group;
        var groupPieces = [];
        var i, j;

        for (i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].group === gid) groupPieces.push(this.pieces[i]);
        }

        // snap to correct position
        for (i = 0; i < groupPieces.length; i++) {
            var gp = groupPieces[i];
            var dx = gp.cx - gp.x;
            var dy = gp.cy - gp.y;
            if (Math.abs(dx) < this.snapDist && Math.abs(dy) < this.snapDist) {
                for (j = 0; j < groupPieces.length; j++) {
                    groupPieces[j].x = groupPieces[j].cx;
                    groupPieces[j].y = groupPieces[j].cy;
                    groupPieces[j].placed = true;
                }
                this._checkComplete();
                return;
            }
        }

        // snap to neighbors
        for (i = 0; i < groupPieces.length; i++) {
            var gp = groupPieces[i];
            var neighbors = this._neighborIds(gp);

            for (j = 0; j < neighbors.length; j++) {
                var nb = this._findPiece(neighbors[j]);
                if (!nb || nb.group === gid) continue;

                var expDx = (nb.c - gp.c) * this.pw;
                var expDy = (nb.r - gp.r) * this.ph;
                var actDx = nb.x - gp.x;
                var actDy = nb.y - gp.y;

                if (Math.abs(actDx - expDx) < this.snapDist && Math.abs(actDy - expDy) < this.snapDist) {
                    this._merge(gid, nb.group, gp, nb);
                    this._checkComplete();
                    return;
                }
            }
        }
    }

    _findPiece(id) {
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].id === id) return this.pieces[i];
        }
        return null;
    }

    _neighborIds(p) {
        var ids = [];
        if (p.r > 0) ids.push((p.r - 1) * this.cols + p.c);
        if (p.r < this.rows - 1) ids.push((p.r + 1) * this.cols + p.c);
        if (p.c > 0) ids.push(p.r * this.cols + (p.c - 1));
        if (p.c < this.cols - 1) ids.push(p.r * this.cols + (p.c + 1));
        return ids;
    }

    _merge(gidA, gidB, pieceA, neighborB) {
        var shiftX = (neighborB.x - (neighborB.c - pieceA.c) * this.pw) - pieceA.x;
        var shiftY = (neighborB.y - (neighborB.r - pieceA.r) * this.ph) - pieceA.y;
        var isPlaced = neighborB.placed;

        for (var i = 0; i < this.pieces.length; i++) {
            var p = this.pieces[i];
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

        // if any in merged group is placed, place all
        var anyPlaced = false;
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].group === gidB && this.pieces[i].placed) {
                anyPlaced = true;
                break;
            }
        }
        if (anyPlaced) {
            for (var i = 0; i < this.pieces.length; i++) {
                if (this.pieces[i].group === gidB) {
                    this.pieces[i].x = this.pieces[i].cx;
                    this.pieces[i].y = this.pieces[i].cy;
                    this.pieces[i].placed = true;
                }
            }
        }

        this._chainMerge(gidB);
    }

    _chainMerge(gid) {
        var found = true;
        while (found) {
            found = false;
            var groupPieces = [];
            for (var i = 0; i < this.pieces.length; i++) {
                if (this.pieces[i].group === gid) groupPieces.push(this.pieces[i]);
            }

            for (var i = 0; i < groupPieces.length; i++) {
                var gp = groupPieces[i];
                var nids = this._neighborIds(gp);

                for (var j = 0; j < nids.length; j++) {
                    var nb = this._findPiece(nids[j]);
                    if (!nb || nb.group === gid) continue;

                    var dx = Math.abs(nb.x - gp.x - (nb.c - gp.c) * this.pw);
                    var dy = Math.abs(nb.y - gp.y - (nb.r - gp.r) * this.ph);

                    if (dx < 2 && dy < 2) {
                        var oldGid = nb.group;
                        var isPlaced = gp.placed || nb.placed;

                        for (var k = 0; k < this.pieces.length; k++) {
                            if (this.pieces[k].group === oldGid) {
                                this.pieces[k].group = gid;
                                if (isPlaced) {
                                    this.pieces[k].x = this.pieces[k].cx;
                                    this.pieces[k].y = this.pieces[k].cy;
                                    this.pieces[k].placed = true;
                                }
                            }
                        }
                        found = true;
                    }
                }
            }
        }
    }

    _checkComplete() {
        var placedCount = 0;
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].placed) placedCount++;
        }

        if (placedCount === this.pieces.length && !this.completed) {
            this.completed = true;
            clearInterval(this.timerInterval);
            Storage.deleteSave(this.puzzleId);
            var self = this;
            if (this.onComplete) {
                setTimeout(function () {
                    self.onComplete(self._fmtTime(self.elapsed), self.pieces.length);
                }, 600);
            }
        }
    }

    // ─── UI ───
    _updateUI() {
        var placed = 0;
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].placed) placed++;
        }
        var total = this.pieces.length;
        var pct = Math.round((placed / total) * 100);

        var el1 = document.getElementById('pieces-info');
        var el2 = document.getElementById('progress-fill');
        var el3 = document.getElementById('progress-text');
        if (el1) el1.textContent = placed + '/' + total;
        if (el2) el2.style.width = pct + '%';
        if (el3) el3.textContent = pct + '%';
    }

    _startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        var self = this;
        this.timerInterval = setInterval(function () {
            if (!self.completed) {
                self.elapsed = Date.now() - self.startTime;
                var el = document.getElementById('timer');
                if (el) el.textContent = self._fmtTime(self.elapsed);
            }
        }, 500);
    }

    _fmtTime(ms) {
        var s = Math.floor(ms / 1000);
        var m = Math.floor(s / 60);
        var h = Math.floor(m / 60);
        if (h > 0) {
            return h + ':' + (m % 60 < 10 ? '0' : '') + (m % 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
        }
        return (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
    }

    // ─── SAVE ───
    _autoSave() {
        if (this.completed) return;
        var placed = 0;
        for (var i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].placed) placed++;
        }
        var pct = Math.round((placed / this.pieces.length) * 100);

        var piecesData = [];
        for (var i = 0; i < this.pieces.length; i++) {
            var p = this.pieces[i];
            piecesData.push({
                id: p.id, x: p.x, y: p.y,
                group: p.group, placed: p.placed
            });
        }

        Storage.savePuzzle(this.puzzleId, {
            pieces: piecesData,
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
        if (saved.panX !== undefined) {
            this.panX = saved.panX;
            this.panY = saved.panY;
        }

        this.totalPieces = this.cols * this.rows;
        this.pw = this.imgW / this.cols;
        this.ph = this.imgH / this.rows;
        this.tab = Math.min(this.pw, this.ph) * 0.2;
        this.snapDist = Math.min(this.pw, this.ph) * 0.3;

        this._generate();

        for (var i = 0; i < saved.pieces.length; i++) {
            var sp = saved.pieces[i];
            var p = this._findPiece(sp.id);
            if (p) {
                p.x = sp.x;
                p.y = sp.y;
                p.group = sp.group;
                p.placed = sp.placed;
            }
        }
    }

    // ─── CONTROLS ───
    zoomIn() { this.scale = Math.min(5, this.scale * 1.3); }
    zoomOut() { this.scale = Math.max(0.1, this.scale * 0.7); }
    resetZoom() { this._centerView(); }
    toggleEdges() { this.showEdges = !this.showEdges; return this.showEdges; }

    destroy() {
        this.running = false;
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
}
