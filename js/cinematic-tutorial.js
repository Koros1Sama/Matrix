/**
 * Advanced Cinematic Tutorial System v2
 * - Much slower animations
 * - Speed control slider
 * - Replay button
 * - Allow next/prev during animation
 * - Auto-continue toggle
 * - localStorage persistence
 * - Full keyboard navigation (arrows work across all lesson steps)
 */

class CinematicTutorial {
    constructor() {
        this.container = null;
        this.currentPhase = 0;
        this.isPlaying = false;
        this.animationAborted = false;
        
        // Settings with localStorage persistence
        this.settings = this.loadSettings();
        
        // Tutorial phases - مثال أصعب مع شرح مفصل
        // المثال: 3x + 6y = 15 و 2x + 5y = 11
        // يحتاج ضرب في ⅓ وجمع بمعامل -2
        this.phases = [
            {
                id: 0,
                title: "المعادلات ↔ المصفوفة",
                subtitle: "كيف تتحول المعادلات لمصفوفة",
                type: "equations-to-matrix",
                equations: [
                    { x: 3, y: 6, result: 15 },
                    { x: 2, y: 5, result: 11 }
                ],
                matrix: [[3, 6, 15], [2, 5, 11]],
                explanation: "كل معادلة تصبح صف في المصفوفة. المعاملات (الأرقام) تنتقل بنفس الترتيب."
            },
            {
                id: 1,
                title: "الخطوة 1: جعل القائد = 1",
                subtitle: "لماذا نضرب في ⅓؟ لأن 3 × ⅓ = 1",
                type: "scale",
                operation: "R₁ × ⅓",
                targetRow: 0,
                scalar: "×⅓",
                scalarValue: 1/3,
                before: [[3, 6, 15], [2, 5, 11]],
                after: [[1, 2, 5], [2, 5, 11]],
                cellOperations: [
                    { before: 3, op: "×⅓", after: 1 },
                    { before: 6, op: "×⅓", after: 2 },
                    { before: 15, op: "×⅓", after: 5 }
                ],
                whyExplanation: "🎯 الهدف: جعل أول عنصر = 1\n📐 العنصر الحالي: 3\n💡 الحل: نضرب في ⅓ لأن 3 × ⅓ = 1\n⚠️ نضرب كل الصف في نفس القيمة!"
            },
            {
                id: 2,
                title: "الخطوة 2: تصفير تحت القائد",
                subtitle: "لماذا k = -2؟ لأن 2 + (-2×1) = 0",
                type: "add",
                operation: "R₂ → R₂ + (-2)×R₁",
                targetRow: 1,
                sourceRow: 0,
                scalar: -2,
                before: [[1, 2, 5], [2, 5, 11]],
                after: [[1, 2, 5], [0, 1, 1]],
                cellOperations: [
                    { target: 2, source: 1, k: -2, scaledSource: -2, result: 0 },
                    { target: 5, source: 2, k: -2, scaledSource: -4, result: 1 },
                    { target: 11, source: 5, k: -2, scaledSource: -10, result: 1 }
                ],
                whyExplanation: "🎯 الهدف: جعل العنصر تحت القائد = 0\n📐 العنصر الحالي: 2\n📐 القائد فوقه: 1\n💡 اختيار k: نريد 2 + k×1 = 0 ← إذاً k = -2\n✅ النتيجة: 2 + (-2)×1 = 2 - 2 = 0"
            },
            {
                id: 3,
                title: "🎉 النتيجة النهائية",
                subtitle: "وصلنا للشكل المدرجي!",
                type: "result",
                original: [[3, 6, 15], [2, 5, 11]],
                final: [[1, 2, 5], [0, 1, 1]],
                solution: { x: 3, y: 1 },
                solutionExplanation: "من R₂: y = 1\nمن R₁: x + 2(1) = 5 → x = 3"
            }
        ];
        
        // Bind keyboard events
        this.boundKeyHandler = this.handleKeyboard.bind(this);
    }

    // ================== SETTINGS ==================
    loadSettings() {
        const defaults = {
            speed: 2.5,        // Much slower (higher = slower)
            autoPlay: true,
            autoContinue: false
        };
        try {
            const saved = localStorage.getItem('cinematicTutorialSettings');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch {
            return defaults;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('cinematicTutorialSettings', JSON.stringify(this.settings));
        } catch {}
    }

    // ================== INIT ==================
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error("Container not found:", containerId);
            return;
        }
        this.render();
        document.addEventListener('keydown', this.boundKeyHandler);
        
        // Auto-play first phase
        if (this.settings.autoPlay) {
            setTimeout(() => this.playCurrentPhase(), 400);
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }

    // ================== KEYBOARD ==================
    handleKeyboard(e) {
        // Only handle if cinematic tutorial is visible
        const lessonStep6 = document.getElementById('lesson-step-6');
        if (!lessonStep6 || !lessonStep6.classList.contains('active')) return;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            this.nextPhase();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.prevPhase();
        } else if (e.key === 'r' || e.key === 'R' || e.key === 'ر') {
            e.preventDefault();
            this.replay();
        } else if (e.key === ' ') {
            e.preventDefault();
            this.toggleAutoContinue();
        }
    }

    // ================== RENDER ==================
    render() {
        this.container.innerHTML = `
            <div class="cinema-wrapper">
                <div class="cinema-stage" id="cinema-stage">
                    <div class="cinema-content" id="cinema-content"></div>
                </div>
                
                <div class="cinema-controls">
                    <div class="ctrl-row">
                        <div class="ctrl-group">
                            <label>السرعة:</label>
                            <input type="range" id="speed-slider" min="0.5" max="5" step="0.5" 
                                   value="${this.settings.speed}" onchange="cinematicTutorial.setSpeed(this.value)">
                            <span id="speed-label">${this.getSpeedLabel()}</span>
                        </div>
                        <div class="ctrl-group">
                            <button class="ctrl-btn" onclick="cinematicTutorial.replay()" title="إعادة (R)">
                                🔄 إعادة
                            </button>
                            <button class="ctrl-btn ${this.settings.autoContinue ? 'active' : ''}" 
                                    id="auto-continue-btn"
                                    onclick="cinematicTutorial.toggleAutoContinue()" title="متابعة تلقائية (Space)">
                                ▶▶ ${this.settings.autoContinue ? 'تلقائي ✓' : 'تلقائي'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="cinema-nav">
                    <button class="nav-btn" id="nav-prev" onclick="cinematicTutorial.prevPhase()">
                        ◀ السابق
                    </button>
                    <div class="nav-progress">
                        <span id="nav-label">المرحلة 1 من ${this.phases.length}</span>
                        <div class="nav-dots" id="nav-dots"></div>
                    </div>
                    <button class="nav-btn nav-primary" id="nav-next" onclick="cinematicTutorial.nextPhase()">
                        التالي ▶
                    </button>
                </div>
                
                <div class="cinema-hint">
                    💡 استخدم الأسهم ← → للتنقل | R للإعادة | Space للتلقائي
                </div>
            </div>
        `;
        
        this.renderDots();
        this.showPhase(0, false);
    }

    getSpeedLabel() {
        if (this.settings.speed <= 1) return 'سريع';
        if (this.settings.speed <= 2) return 'عادي';
        if (this.settings.speed <= 3) return 'بطيء';
        return 'بطيء جداً';
    }

    setSpeed(value) {
        this.settings.speed = parseFloat(value);
        this.saveSettings();
        document.getElementById('speed-label').textContent = this.getSpeedLabel();
    }

    toggleAutoContinue() {
        this.settings.autoContinue = !this.settings.autoContinue;
        this.saveSettings();
        const btn = document.getElementById('auto-continue-btn');
        if (btn) {
            btn.classList.toggle('active', this.settings.autoContinue);
            btn.innerHTML = `▶▶ ${this.settings.autoContinue ? 'تلقائي ✓' : 'تلقائي'}`;
        }
    }

    renderDots() {
        const dotsContainer = document.getElementById('nav-dots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = this.phases.map((_, i) => 
            `<span class="nav-dot ${i === 0 ? 'active' : ''}" onclick="cinematicTutorial.goToPhase(${i})"></span>`
        ).join('');
    }

    updateNav() {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === this.currentPhase));
        const label = document.getElementById('nav-label');
        if (label) label.textContent = `المرحلة ${this.currentPhase + 1} من ${this.phases.length}`;
        
        // Navigation buttons - never disable, allow click anytime
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');
        if (prevBtn) prevBtn.classList.toggle('disabled-look', this.currentPhase === 0);
        if (nextBtn) nextBtn.classList.toggle('disabled-look', this.currentPhase === this.phases.length - 1);
    }

    showPhase(index, autoPlay = true) {
        // Abort current animation if running
        if (this.isPlaying) {
            this.animationAborted = true;
            // Wait a bit for the animation to actually stop before proceeding
            setTimeout(() => {
                this.isPlaying = false;
                this.animationAborted = false;
                this._showPhaseInternal(index, autoPlay);
            }, 100);
        } else {
            this._showPhaseInternal(index, autoPlay);
        }
    }
    
    _showPhaseInternal(index, autoPlay) {
        this.currentPhase = index;
        const phase = this.phases[index];
        const content = document.getElementById('cinema-content');
        if (!content) return;
        
        this.updateNav();
        content.innerHTML = this.renderPhaseContent(phase);
        
        // Reset animation state
        this.isPlaying = false;
        this.animationAborted = false;
        
        if (autoPlay || this.settings.autoPlay) {
            setTimeout(() => this.playCurrentPhase(), 400);
        }
    }

    replay() {
        this.showPhase(this.currentPhase, true);
    }

    renderPhaseContent(phase) {
        let html = `
            <div class="phase-header">
                <h3 class="phase-title">${phase.title}</h3>
                <p class="phase-subtitle">${phase.subtitle}</p>
            </div>
        `;
        
        switch (phase.type) {
            case 'equations-to-matrix':
                html += this.renderEquationsPhase(phase);
                break;
            case 'scale':
                html += this.renderScalePhase(phase);
                break;
            case 'add':
                html += this.renderAddPhase(phase);
                break;
            case 'result':
                html += this.renderResultPhase(phase);
                break;
        }
        
        return html;
    }

    // ================== EQUATIONS TO MATRIX ==================
    renderEquationsPhase(phase) {
        return `
            <div class="eq-phase">
                <div class="eq-display" id="eq-display">
                    ${phase.equations.map((eq, i) => `
                        <div class="eq-line" data-row="${i}">
                            <span class="eq-num x">${eq.x}</span><span class="eq-var">x</span> + 
                            <span class="eq-num y">${eq.y}</span><span class="eq-var">y</span> = 
                            <span class="eq-num r">${eq.result}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="eq-arrow" id="eq-arrow">⬇</div>
                <div class="matrix-display" id="matrix-display">
                    ${this.renderMatrix(phase.matrix, 'colored')}
                </div>
                <div class="color-legend">
                    <span><b class="leg-x">●</b> معامل x</span>
                    <span><b class="leg-y">●</b> معامل y</span>
                    <span><b class="leg-r">●</b> الناتج</span>
                </div>
            </div>
        `;
    }

    // ================== SCALE OPERATION ==================
    renderScalePhase(phase) {
        return `
            <div class="op-phase">
                <div class="op-label">${phase.operation}</div>
                
                ${phase.whyExplanation ? `
                <div class="why-box" id="why-box">
                    <div class="why-title">💡 لماذا هذه القيمة؟</div>
                    <div class="why-content">${phase.whyExplanation.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}
                
                <div class="matrices-side">
                    <div class="matrix-box before-box">
                        <div class="box-label">قبل</div>
                        <div id="before-matrix">
                            ${this.renderMatrix(phase.before, 'before', phase.targetRow)}
                        </div>
                    </div>
                    <div class="transform-arrow" id="transform-arrow">→</div>
                    <div class="matrix-box after-box">
                        <div class="box-label">بعد</div>
                        <div id="after-matrix">
                            ${this.renderMatrix(phase.after, 'after', phase.targetRow)}
                        </div>
                    </div>
                </div>
                <div class="cell-ops" id="cell-ops">
                    ${phase.cellOperations.map((op, i) => `
                        <div class="cell-op" data-index="${i}">
                            <span class="cop-before">${op.before}</span>
                            <span class="cop-operator">${op.op}</span>
                            <span class="cop-equals">=</span>
                            <span class="cop-after">${op.after}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ================== ADD OPERATION ==================
    renderAddPhase(phase) {
        const k = phase.scalar;
        return `
            <div class="op-phase">
                <div class="op-label">${phase.operation}</div>
                
                ${phase.whyExplanation ? `
                <div class="why-box" id="why-box">
                    <div class="why-title">💡 لماذا k = ${k}؟</div>
                    <div class="why-content">${phase.whyExplanation.replace(/\n/g, '<br>')}</div>
                </div>
                ` : ''}
                
                <div class="matrices-side">
                    <div class="matrix-box before-box">
                        <div class="box-label">قبل</div>
                        <div id="before-matrix">
                            ${this.renderMatrix(phase.before, 'before', phase.targetRow)}
                        </div>
                    </div>
                    <div class="transform-arrow" id="transform-arrow">→</div>
                    <div class="matrix-box after-box">
                        <div class="box-label">بعد</div>
                        <div id="after-matrix">
                            ${this.renderMatrix(phase.after, 'after', phase.targetRow)}
                        </div>
                    </div>
                </div>
                <div class="add-breakdown" id="add-breakdown">
                    <div class="breakdown-title">تفاصيل الحساب (k = ${k}):</div>
                    ${phase.cellOperations.map((op, i) => `
                        <div class="add-op" data-index="${i}">
                            <span class="add-target">${op.target}</span>
                            <span class="add-plus">+</span>
                            <span class="add-k">(${k})</span>
                            <span class="add-times">×</span>
                            <span class="add-source">${op.source}</span>
                            <span class="add-equals">=</span>
                            <span class="add-target">${op.target}</span>
                            <span class="add-plus">+</span>
                            <span class="add-scaled">(${op.scaledSource})</span>
                            <span class="add-equals">=</span>
                            <span class="add-result">${op.result}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ================== RESULT ==================
    renderResultPhase(phase) {
        return `
            <div class="result-phase">
                <div class="journey">
                    <div class="journey-matrix">
                        <div class="journey-label original">🔴 البداية</div>
                        ${this.renderMatrix(phase.original, 'original')}
                    </div>
                    <div class="journey-steps" id="journey-steps">
                        <div class="jstep">R₁ × ½</div>
                        <div class="jarrow">↓</div>
                        <div class="jstep">R₂ - R₁</div>
                        <div class="jarrow">↓</div>
                    </div>
                    <div class="journey-matrix">
                        <div class="journey-label final">🟢 النهاية</div>
                        ${this.renderMatrix(phase.final, 'final')}
                    </div>
                </div>
                
                <!-- استخراج الحل من المصفوفة -->
                <div class="extraction-stage" id="extraction-stage">
                    <div class="extraction-title" id="extraction-title">📖 قراءة الحل من المصفوفة</div>
                    
                    <div class="final-matrix-display" id="final-matrix-display">
                        ${this.renderMatrix(phase.final, 'extraction')}
                    </div>
                    
                    <div class="extraction-steps" id="extraction-steps">
                        <div class="extract-row" id="extract-row-2">
                            <span class="extract-label">من R₂:</span>
                            <span class="extract-eq">0·x + 1·y = ${phase.final[1][2]}</span>
                            <span class="extract-arrow">→</span>
                            <span class="extract-result">y = ${phase.solution.y}</span>
                        </div>
                        <div class="extract-row" id="extract-row-1">
                            <span class="extract-label">من R₁:</span>
                            <span class="extract-eq">1·x + 2·(${phase.solution.y}) = ${phase.final[0][2]}</span>
                            <span class="extract-arrow">→</span>
                            <span class="extract-result">x = ${phase.solution.x}</span>
                        </div>
                    </div>
                </div>
                
                <div class="solution-panel" id="solution-panel">
                    <div class="sol-title">🎉 الحل النهائي</div>
                    <div class="sol-vars">
                        <span class="sol-var" data-var="x">x = ${phase.solution.x}</span>
                        <span class="sol-var" data-var="y">y = ${phase.solution.y}</span>
                    </div>
                    ${phase.solutionExplanation ? `<div class="sol-check">${phase.solutionExplanation.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
            </div>
        `;
    }

    // ================== MATRIX RENDERER ==================
    renderMatrix(matrix, style = 'default', highlightRow = -1) {
        const getCellClass = (ri, ci, val, style) => {
            let cls = 'mcell';
            if (style === 'colored' || style === 'original') {
                if (ci === 0) cls += ' cell-x';
                else if (ci === 1) cls += ' cell-y';
                else cls += ' cell-r';
            }
            if (style === 'final') {
                if (val === 1 && (ci === 0 || ci === 1)) cls += ' cell-pivot';
                else if (val === 0) cls += ' cell-zero';
                else cls += ' cell-changed';
            }
            if (style === 'after' && ri === highlightRow) cls += ' cell-new';
            if (style === 'before' && ri === highlightRow) cls += ' cell-target';
            return cls;
        };
        
        return `
            <div class="mmatrix ${style}">
                ${matrix.map((row, ri) => `
                    <div class="mrow ${ri === highlightRow ? 'row-highlight' : ''}">
                        ${row.slice(0, 2).map((cell, ci) => `
                            <span class="${getCellClass(ri, ci, cell, style)}" data-r="${ri}" data-c="${ci}">${cell}</span>
                        `).join('')}
                        <span class="mdivider"></span>
                        <span class="${getCellClass(ri, 2, row[2], style)}" data-r="${ri}" data-c="2">${row[2]}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ================== ANIMATION PLAYBACK ==================
    async playCurrentPhase() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.animationAborted = false;
        
        const phase = this.phases[this.currentPhase];
        
        try {
            switch (phase.type) {
                case 'equations-to-matrix':
                    await this.animateEquations(phase);
                    break;
                case 'scale':
                    await this.animateScale(phase);
                    break;
                case 'add':
                    await this.animateAdd(phase);
                    break;
                case 'result':
                    await this.animateResult(phase);
                    break;
            }
        } catch (e) {
            // Animation was aborted
        }
        
        this.isPlaying = false;
        
        // Auto-continue to next phase
        if (!this.animationAborted && this.settings.autoContinue && 
            this.currentPhase < this.phases.length - 1) {
            setTimeout(() => this.nextPhase(), 800);
        }
    }

    // ================== EQUATIONS ANIMATION ==================
    async animateEquations(phase) {
        const eqLines = document.querySelectorAll('.eq-line');
        const arrow = document.getElementById('eq-arrow');
        const matrix = document.getElementById('matrix-display');
        
        if (!arrow || !matrix) return;
        
        eqLines.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(-20px)'; });
        arrow.style.opacity = '0';
        matrix.style.opacity = '0';
        matrix.style.transform = 'scale(0.8)';
        
        for (let eq of eqLines) {
            if (this.animationAborted) throw 'aborted';
            await this.delay(300);
            eq.style.transition = 'all 0.6s ease';
            eq.style.opacity = '1';
            eq.style.transform = 'translateY(0)';
            await this.delay(500);
        }
        
        if (this.animationAborted) throw 'aborted';
        await this.delay(400);
        arrow.style.transition = 'all 0.5s ease';
        arrow.style.opacity = '1';
        arrow.classList.add('bouncing');
        await this.delay(700);
        
        if (this.animationAborted) throw 'aborted';
        matrix.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        matrix.style.opacity = '1';
        matrix.style.transform = 'scale(1)';
        
        const cells = matrix.querySelectorAll('.mcell');
        for (let cell of cells) {
            if (this.animationAborted) throw 'aborted';
            cell.classList.add('pop');
            await this.delay(120);
        }
    }

    // ================== SCALE ANIMATION ==================
    async animateScale(phase) {
        const beforeMatrix = document.getElementById('before-matrix');
        const afterMatrix = document.getElementById('after-matrix');
        const arrow = document.getElementById('transform-arrow');
        const cellOps = document.querySelectorAll('.cell-op');
        const whyBox = document.getElementById('why-box');
        
        if (!beforeMatrix || !afterMatrix || !arrow) return;
        
        afterMatrix.style.opacity = '0';
        afterMatrix.style.transform = 'translateX(-30px)';
        arrow.style.opacity = '0';
        cellOps.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(10px)'; });
        
        // Show why-box first
        if (whyBox) {
            await this.delay(300);
            whyBox.classList.add('visible');
            await this.delay(800);
        }
        
        const targetRow = beforeMatrix.querySelectorAll('.mrow')[phase.targetRow];
        if (!targetRow) return;
        
        await this.delay(400);
        targetRow.classList.add('pulsing');
        await this.delay(800);
        
        const targetCells = targetRow.querySelectorAll('.mcell');
        for (let i = 0; i < cellOps.length && i < targetCells.length; i++) {
            if (this.animationAborted) throw 'aborted';
            
            targetCells[i].classList.add('operating');
            
            const floater = document.createElement('div');
            floater.className = 'float-op';
            floater.textContent = phase.scalar;
            targetCells[i].appendChild(floater);
            
            await this.delay(150);
            floater.classList.add('float-show');
            await this.delay(600);
            
            cellOps[i].style.transition = 'all 0.5s ease';
            cellOps[i].style.opacity = '1';
            cellOps[i].style.transform = 'translateY(0)';
            cellOps[i].classList.add('highlight');
            await this.delay(200);
            cellOps[i].classList.remove('highlight');
            
            await this.delay(300);
            floater.classList.add('float-hide');
            targetCells[i].classList.remove('operating');
        }
        
        if (this.animationAborted) throw 'aborted';
        await this.delay(400);
        targetRow.classList.remove('pulsing');
        
        arrow.style.transition = 'all 0.5s ease';
        arrow.style.opacity = '1';
        arrow.classList.add('pulse-arrow');
        await this.delay(600);
        
        if (this.animationAborted) throw 'aborted';
        afterMatrix.style.transition = 'all 0.6s ease';
        afterMatrix.style.opacity = '1';
        afterMatrix.style.transform = 'translateX(0)';
        
        const afterRow = afterMatrix.querySelectorAll('.mrow')[phase.targetRow];
        if (afterRow) {
            const afterCells = afterRow.querySelectorAll('.mcell');
            for (let cell of afterCells) {
                if (this.animationAborted) throw 'aborted';
                cell.classList.add('morph-in');
                await this.delay(200);
            }
        }
    }

    // ================== ADD ANIMATION ==================
    async animateAdd(phase) {
        const beforeMatrix = document.getElementById('before-matrix');
        const afterMatrix = document.getElementById('after-matrix');
        const arrow = document.getElementById('transform-arrow');
        const breakdown = document.getElementById('add-breakdown');
        const addOps = document.querySelectorAll('.add-op');
        const whyBox = document.getElementById('why-box');
        
        if (!beforeMatrix || !afterMatrix || !arrow || !breakdown) return;
        
        afterMatrix.style.opacity = '0';
        afterMatrix.style.transform = 'translateX(-30px)';
        arrow.style.opacity = '0';
        breakdown.style.opacity = '0';
        addOps.forEach(el => { el.style.opacity = '0'; });
        
        // Show why-box first
        if (whyBox) {
            await this.delay(300);
            whyBox.classList.add('visible');
            await this.delay(800);
        }
        
        const rows = beforeMatrix.querySelectorAll('.mrow');
        const targetRow = rows[phase.targetRow];
        const sourceRow = rows[phase.sourceRow];
        
        if (!targetRow || !sourceRow) return;
        
        await this.delay(400);
        targetRow.classList.add('target-row');
        await this.delay(400);
        sourceRow.classList.add('source-row');
        await this.delay(600);
        
        if (this.animationAborted) throw 'aborted';
        breakdown.style.transition = 'all 0.5s ease';
        breakdown.style.opacity = '1';
        await this.delay(400);
        
        const targetCells = targetRow.querySelectorAll('.mcell');
        const sourceCells = sourceRow.querySelectorAll('.mcell');
        const k = phase.scalar;
        
        for (let i = 0; i < addOps.length && i < targetCells.length; i++) {
            if (this.animationAborted) throw 'aborted';
            
            targetCells[i].classList.add('computing');
            sourceCells[i].classList.add('computing');
            
            // Show floating operation with k value
            const floater = document.createElement('div');
            floater.className = 'float-sub';
            const scaledVal = phase.cellOperations[i]?.scaledSource || (k * parseInt(sourceCells[i].textContent));
            floater.innerHTML = `+ (${scaledVal})`;
            targetCells[i].appendChild(floater);
            
            await this.delay(150);
            floater.classList.add('float-show');
            await this.delay(600);
            
            addOps[i].style.transition = 'all 0.4s ease';
            addOps[i].style.opacity = '1';
            addOps[i].classList.add('flash');
            await this.delay(300);
            addOps[i].classList.remove('flash');
            
            floater.classList.add('float-hide');
            targetCells[i].classList.remove('computing');
            sourceCells[i].classList.remove('computing');
            await this.delay(300);
        }
        
        if (this.animationAborted) throw 'aborted';
        targetRow.classList.remove('target-row');
        sourceRow.classList.remove('source-row');
        
        await this.delay(300);
        arrow.style.transition = 'all 0.5s ease';
        arrow.style.opacity = '1';
        arrow.classList.add('pulse-arrow');
        await this.delay(600);
        
        if (this.animationAborted) throw 'aborted';
        afterMatrix.style.transition = 'all 0.6s ease';
        afterMatrix.style.opacity = '1';
        afterMatrix.style.transform = 'translateX(0)';
        
        const afterRow = afterMatrix.querySelectorAll('.mrow')[phase.targetRow];
        if (afterRow) {
            const afterCells = afterRow.querySelectorAll('.mcell');
            for (let cell of afterCells) {
                if (this.animationAborted) throw 'aborted';
                cell.classList.add('morph-in');
                await this.delay(200);
            }
        }
    }

    // ================== RESULT ANIMATION ==================
    async animateResult(phase) {
        const journeySteps = document.getElementById('journey-steps');
        const extractionStage = document.getElementById('extraction-stage');
        const extractTitle = document.getElementById('extraction-title');
        const finalMatrixDisplay = document.getElementById('final-matrix-display');
        const extractionSteps = document.getElementById('extraction-steps');
        const extractRow2 = document.getElementById('extract-row-2');
        const extractRow1 = document.getElementById('extract-row-1');
        const solution = document.getElementById('solution-panel');
        const solVars = document.querySelectorAll('.sol-var');
        
        if (!journeySteps || !solution) return;
        
        // Hide everything initially
        journeySteps.style.opacity = '0';
        if (extractionStage) extractionStage.style.opacity = '0';
        if (extractTitle) extractTitle.style.opacity = '0';
        if (finalMatrixDisplay) finalMatrixDisplay.style.opacity = '0';
        if (extractionSteps) extractionSteps.style.opacity = '0';
        if (extractRow2) { extractRow2.style.opacity = '0'; extractRow2.style.transform = 'translateX(-20px)'; }
        if (extractRow1) { extractRow1.style.opacity = '0'; extractRow1.style.transform = 'translateX(-20px)'; }
        solution.style.opacity = '0';
        solution.style.transform = 'scale(0.9)';
        
        // Step 1: Show journey (short version)
        await this.delay(300);
        if (this.animationAborted) throw 'aborted';
        journeySteps.style.transition = 'all 0.6s ease';
        journeySteps.style.opacity = '1';
        
        const steps = journeySteps.querySelectorAll('.jstep, .jarrow');
        for (let step of steps) {
            if (this.animationAborted) throw 'aborted';
            step.classList.add('appear');
            await this.delay(200);
        }
        
        await this.delay(400);
        if (this.animationAborted) throw 'aborted';
        
        // Step 2: Show extraction stage
        if (extractionStage) {
            extractionStage.style.transition = 'all 0.5s ease';
            extractionStage.style.opacity = '1';
            await this.delay(300);
        }
        
        // Step 3: Show extraction title
        if (extractTitle) {
            extractTitle.style.transition = 'all 0.5s ease';
            extractTitle.style.opacity = '1';
            await this.delay(400);
        }
        
        if (this.animationAborted) throw 'aborted';
        
        // Step 4: Show final matrix with glow effect
        if (finalMatrixDisplay) {
            finalMatrixDisplay.style.transition = 'all 0.6s ease';
            finalMatrixDisplay.style.opacity = '1';
            
            // Add glow to result column cells
            const resultCells = finalMatrixDisplay.querySelectorAll('.mcell[data-c="2"]');
            for (let cell of resultCells) {
                cell.classList.add('glow-result');
                await this.delay(300);
            }
            await this.delay(500);
        }
        
        if (this.animationAborted) throw 'aborted';
        
        // Step 5: Show extraction steps one by one
        if (extractionSteps) {
            extractionSteps.style.transition = 'all 0.5s ease';
            extractionSteps.style.opacity = '1';
        }
        
        // Extract y first (from R2)
        if (extractRow2) {
            if (this.animationAborted) throw 'aborted';
            await this.delay(300);
            extractRow2.style.transition = 'all 0.5s ease';
            extractRow2.style.opacity = '1';
            extractRow2.style.transform = 'translateX(0)';
            await this.delay(600);
        }
        
        // Then extract x (from R1, using y)
        if (extractRow1) {
            if (this.animationAborted) throw 'aborted';
            await this.delay(200);
            extractRow1.style.transition = 'all 0.5s ease';
            extractRow1.style.opacity = '1';
            extractRow1.style.transform = 'translateX(0)';
            await this.delay(600);
        }
        
        if (this.animationAborted) throw 'aborted';
        await this.delay(400);
        
        // Final: Celebrate solution
        solution.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        solution.style.opacity = '1';
        solution.style.transform = 'scale(1)';
        solution.classList.add('celebrate');
        
        for (let v of solVars) {
            if (this.animationAborted) throw 'aborted';
            await this.delay(400);
            v.classList.add('var-pop');
        }
    }

    // ================== NAVIGATION ==================
    nextPhase() {
        if (this.currentPhase < this.phases.length - 1) {
            this.showPhase(this.currentPhase + 1, true);
        } else {
            // At last phase, trigger lesson navigation to step 7
            if (typeof game !== 'undefined' && game.nextLesson) {
                game.nextLesson();
            }
        }
    }

    prevPhase() {
        if (this.currentPhase > 0) {
            this.showPhase(this.currentPhase - 1, true);
        } else {
            // At first phase, trigger lesson navigation to step 5
            if (typeof game !== 'undefined' && game.prevLesson) {
                game.prevLesson();
            }
        }
    }

    goToPhase(index) {
        if (index !== this.currentPhase) {
            this.showPhase(index, true);
        }
    }

    // Check if we're at the last phase
    isAtLastPhase() {
        return this.currentPhase === this.phases.length - 1;
    }

    // Check if we're at the first phase
    isAtFirstPhase() {
        return this.currentPhase === 0;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms * this.settings.speed));
    }
}

// Global instance
let cinematicTutorial = new CinematicTutorial();
