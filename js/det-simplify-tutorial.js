/**
 * Determinant Simplification Cinematic Tutorial
 * Animated step-by-step tutorial showing how to simplify a 3x3 matrix
 * using row operations before calculating the determinant
 */

class DetSimplifyTutorial {
    constructor() {
        this.container = null;
        this.currentPhase = 0;
        this.isPlaying = false;
        this.animationAborted = false;
        
        // Settings
        this.settings = {
            speed: 2.0,
            autoPlay: true,
            autoContinue: false
        };
        
        // المثال: مصفوفة 3×3 نريد تبسيطها
        // المصفوفة الأصلية:
        // | 2  4  6 |
        // | 1  2  5 |
        // | 3  1  2 |
        // الهدف: إنشاء أصفار في العمود الأول للتسهيل
        
        this.phases = [
            {
                id: 0,
                title: "🎯 المشكلة",
                subtitle: "مصفوفة بدون أصفار - الحساب صعب!",
                type: "problem",
                matrix: [[2, 4, 6], [1, 2, 5], [3, 1, 2]],
                explanation: "هذه المصفوفة ليس فيها أصفار. حساب المحدد بساروس أو التوسيع سيحتاج كل الحسابات!"
            },
            {
                id: 1,
                title: "💡 الفكرة",
                subtitle: "نستخدم خاصية الجمع لإنشاء أصفار",
                type: "idea",
                matrix: [[2, 4, 6], [1, 2, 5], [3, 1, 2]],
                explanation: "تذكّر: جمع صف مع مضاعف صف آخر لا يغير المحدد! سنستخدم هذا لإنشاء أصفار.",
                target: "سنجعل العمود الأول يحتوي على صفرين",
                warning: "⚠️ تحذير: ضرب صف في عدد k يضرب المحدد في k! لذلك لا نستخدم هذه العملية في التبسيط."
            },
            {
                id: 2,
                title: "الخطوة 1: R₂ ← R₂ + (-½)R₁",
                subtitle: "نريد: 1 + k×2 = 0 → k = -½",
                type: "add-operation",
                operation: "R₂ ← R₂ + (-½)×R₁",
                targetRow: 1,
                sourceRow: 0,
                scalar: -0.5,
                scalarDisplay: "-½",
                before: [[2, 4, 6], [1, 2, 5], [3, 1, 2]],
                after: [[2, 4, 6], [0, 0, 2], [3, 1, 2]],
                cellOperations: [
                    { target: 1, source: 2, k: -0.5, scaled: -1, result: 0 },
                    { target: 2, source: 4, k: -0.5, scaled: -2, result: 0 },
                    { target: 5, source: 6, k: -0.5, scaled: -3, result: 2 }
                ],
                whyExplanation: "🎯 الهدف: جعل أول عنصر في R₂ = 0\n📐 العنصر الحالي: 1\n📐 العنصر المقابل في R₁: 2\n💡 نريد: 1 + k×2 = 0\n✅ الحل: k = -½"
            },
            {
                id: 3,
                title: "الخطوة 2: R₃ ← R₃ + (-3/2)R₁",
                subtitle: "نريد: 3 + k×2 = 0 → k = -3/2",
                type: "add-operation",
                operation: "R₃ ← R₃ + (-3/2)×R₁",
                targetRow: 2,
                sourceRow: 0,
                scalar: -1.5,
                scalarDisplay: "-3/2",
                before: [[2, 4, 6], [0, 0, 2], [3, 1, 2]],
                after: [[2, 4, 6], [0, 0, 2], [0, -5, -7]],
                cellOperations: [
                    { target: 3, source: 2, k: -1.5, scaled: -3, result: 0 },
                    { target: 1, source: 4, k: -1.5, scaled: -6, result: -5 },
                    { target: 2, source: 6, k: -1.5, scaled: -9, result: -7 }
                ],
                whyExplanation: "🎯 الهدف: جعل أول عنصر في R₃ = 0\n📐 العنصر الحالي: 3\n📐 العنصر المقابل في R₁: 2\n💡 نريد: 3 + k×2 = 0\n✅ الحل: k = -3/2"
            },
            {
                id: 4,
                title: "✨ المصفوفة المبسطة",
                subtitle: "صفران في العمود الأول!",
                type: "simplified",
                original: [[2, 4, 6], [1, 2, 5], [3, 1, 2]],
                simplified: [[2, 4, 6], [0, 0, 2], [0, -5, -7]],
                explanation: "الآن لدينا صفران في العمود الأول! حساب المحدد بساروس أصبح أسهل."
            },
            {
                id: 5,
                title: "🧮 حساب المحدد بساروس",
                subtitle: "الأقطار الرئيسية - الأقطار الثانوية",
                type: "calculate-sarrus",
                matrix: [[2, 4, 6], [0, 0, 2], [0, -5, -7]],
                sarrus: {
                    // الأقطار الرئيسية (من اليسار لليمين)
                    mainDiags: [
                        { values: [2, 0, -7], product: "2 × 0 × (-7) = 0" },
                        { values: [4, 2, 0], product: "4 × 2 × 0 = 0" },
                        { values: [6, 0, -5], product: "6 × 0 × (-5) = 0" }
                    ],
                    mainSum: "0 + 0 + 0 = 0",
                    // الأقطار الثانوية (من اليمين لليسار)
                    antiDiags: [
                        { values: [6, 0, 0], product: "6 × 0 × 0 = 0" },
                        { values: [4, 0, -7], product: "4 × 0 × (-7) = 0" },
                        { values: [2, 2, -5], product: "2 × 2 × (-5) = -20" }
                    ],
                    antiSum: "0 + 0 + (-20) = -20"
                },
                finalCalc: "المحدد = 0 - (-20) = 20",
                finalResult: 20,
                explanation: "بفضل الأصفار، معظم الحسابات صارت صفر! سهل جداً."
            },
            {
                id: 6,
                title: "🎉 النتيجة",
                subtitle: "وفّرنا الكثير من الحسابات!",
                type: "result",
                original: [[2, 4, 6], [1, 2, 5], [3, 1, 2]],
                simplified: [[2, 4, 6], [0, 0, 2], [0, -5, -7]],
                determinant: 20,
                savings: "حسبنا محدداً فرعياً واحداً بدل 3!",
                tip: "💡 النصيحة: دائماً ابحث عن فرصة لإنشاء أصفار قبل الحساب!"
            }
        ];
        
        this.boundKeyHandler = this.handleKeyboard.bind(this);
    }

    // ================== INIT ==================
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error("Container not found:", containerId);
            return;
        }
        this.currentPhase = 0;
        this.render();
        document.addEventListener('keydown', this.boundKeyHandler);
        
        if (this.settings.autoPlay) {
            setTimeout(() => this.playCurrentPhase(), 400);
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }

    // ================== KEYBOARD ==================
    handleKeyboard(e) {
        if (!this.container || !this.container.classList.contains('active')) return;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            this.nextPhase();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.prevPhase();
        } else if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            this.replay();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
        }
    }

    close() {
        // Clean up
        this.destroy();
        
        // Hide this container
        if (this.container) {
            this.container.style.display = 'none';
            this.container.classList.remove('active');
        }
        
        // Return to determinant tutorial
        if (typeof determinantTutorial !== 'undefined') {
            determinantTutorial.closeSimplifyTutorial();
        }
    }

    // ================== RENDER ==================
    render() {
        this.container.classList.add('active');
        this.container.innerHTML = `
            <div class="det-cinema-wrapper">
                <button class="btn btn-back det-cinema-back" onclick="detSimplifyTutorial.close()">
                    <span>→</span> رجوع
                </button>
                
                <div class="det-cinema-stage" id="det-cinema-stage">
                    <div class="det-cinema-content" id="det-cinema-content"></div>
                </div>
                
                <div class="det-cinema-controls">
                    <button class="ctrl-btn" onclick="detSimplifyTutorial.replay()" title="إعادة (R)">
                        🔄 إعادة
                    </button>
                </div>
                
                <div class="det-cinema-nav">
                    <button class="nav-btn" id="det-nav-prev" onclick="detSimplifyTutorial.prevPhase()">
                        ◀ السابق
                    </button>
                    <div class="nav-progress">
                        <span id="det-nav-label">المرحلة 1 من ${this.phases.length}</span>
                        <div class="nav-dots" id="det-nav-dots"></div>
                    </div>
                    <button class="nav-btn nav-primary" id="det-nav-next" onclick="detSimplifyTutorial.nextPhase()">
                        التالي ▶
                    </button>
                </div>
                
                <div class="det-cinema-hint">
                    💡 استخدم الأسهم ← → للتنقل | R للإعادة | Esc للرجوع
                </div>
            </div>
        `;
        
        this.renderDots();
        this.showPhase(0, false);
    }

    renderDots() {
        const dotsContainer = document.getElementById('det-nav-dots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = this.phases.map((_, i) => 
            `<span class="nav-dot ${i === 0 ? 'active' : ''}" onclick="detSimplifyTutorial.goToPhase(${i})"></span>`
        ).join('');
    }

    updateNav() {
        const dots = document.querySelectorAll('#det-nav-dots .nav-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === this.currentPhase));
        const label = document.getElementById('det-nav-label');
        if (label) label.textContent = `المرحلة ${this.currentPhase + 1} من ${this.phases.length}`;
        
        const prevBtn = document.getElementById('det-nav-prev');
        const nextBtn = document.getElementById('det-nav-next');
        if (prevBtn) prevBtn.classList.toggle('disabled-look', this.currentPhase === 0);
        if (nextBtn) nextBtn.classList.toggle('disabled-look', this.currentPhase === this.phases.length - 1);
    }

    showPhase(index, autoPlay = true) {
        if (this.isPlaying) {
            this.animationAborted = true;
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
        const content = document.getElementById('det-cinema-content');
        if (!content) return;
        
        this.updateNav();
        content.innerHTML = this.renderPhaseContent(phase);
        
        this.isPlaying = false;
        this.animationAborted = false;
        
        if (autoPlay || this.settings.autoPlay) {
            setTimeout(() => this.playCurrentPhase(), 400);
        }
    }

    replay() {
        this.showPhase(this.currentPhase, true);
    }

    goToPhase(index) {
        this.showPhase(index, true);
    }

    nextPhase() {
        if (this.currentPhase < this.phases.length - 1) {
            this.showPhase(this.currentPhase + 1, true);
        }
    }

    prevPhase() {
        if (this.currentPhase > 0) {
            this.showPhase(this.currentPhase - 1, true);
        }
    }

    // ================== PHASE CONTENT ==================
    renderPhaseContent(phase) {
        let html = `
            <div class="phase-header">
                <h3 class="phase-title">${phase.title}</h3>
                <p class="phase-subtitle">${phase.subtitle}</p>
            </div>
        `;
        
        switch (phase.type) {
            case 'problem':
                html += this.renderProblemPhase(phase);
                break;
            case 'idea':
                html += this.renderIdeaPhase(phase);
                break;
            case 'add-operation':
                html += this.renderAddOperationPhase(phase);
                break;
            case 'simplified':
                html += this.renderSimplifiedPhase(phase);
                break;
            case 'calculate':
                html += this.renderCalculatePhase(phase);
                break;
            case 'calculate-sarrus':
                html += this.renderSarrusPhase(phase);
                break;
            case 'result':
                html += this.renderResultPhase(phase);
                break;
        }
        
        return html;
    }

    renderMatrix(matrix, className = '', highlightCol = -1) {
        const n = matrix.length;
        return `
            <div class="simp-matrix ${className}">
                ${matrix.map((row, ri) => `
                    <div class="simp-row">
                        ${row.map((cell, ci) => `
                            <span class="simp-cell ${ci === highlightCol ? 'highlight-col' : ''}" 
                                  data-r="${ri}" data-c="${ci}">${cell}</span>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProblemPhase(phase) {
        return `
            <div class="problem-phase">
                <div class="matrix-display" id="problem-matrix">
                    ${this.renderMatrix(phase.matrix, 'problem-matrix')}
                </div>
                <div class="problem-note">
                    <span class="note-icon">😓</span>
                    <span class="note-text">${phase.explanation}</span>
                </div>
            </div>
        `;
    }

    renderIdeaPhase(phase) {
        return `
            <div class="idea-phase">
                <div class="matrix-display">
                    ${this.renderMatrix(phase.matrix, 'idea-matrix', 0)}
                </div>
                <div class="idea-box" id="idea-box">
                    <div class="idea-icon">💡</div>
                    <div class="idea-content">
                        <p>${phase.explanation}</p>
                        <p class="idea-target"><strong>${phase.target}</strong></p>
                    </div>
                </div>
                <div class="property-reminder">
                    <span class="reminder-icon">✨</span>
                    <span>تذكّر: <span dir="ltr" class="math-formula">Rᵢ + k×Rⱼ</span> ← المحدد لا يتغير!</span>
                </div>
                ${phase.warning ? `
                <div class="property-warning" id="warning-box">
                    <span>${phase.warning}</span>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderAddOperationPhase(phase) {
        const k = phase.scalarDisplay;
        return `
            <div class="add-op-phase">
                <div class="op-label">${phase.operation}</div>
                
                <div class="why-box" id="why-box">
                    <div class="why-title">💡 لماذا k = ${k}؟</div>
                    <div class="why-content">${phase.whyExplanation.replace(/\n/g, '<br>')}</div>
                </div>
                
                <div class="matrices-comparison">
                    <div class="matrix-box before-box">
                        <div class="box-label">قبل</div>
                        <div id="before-matrix">
                            ${this.renderMatrix(phase.before, 'before', 0)}
                        </div>
                    </div>
                    <div class="transform-arrow" id="transform-arrow">→</div>
                    <div class="matrix-box after-box">
                        <div class="box-label">بعد</div>
                        <div id="after-matrix">
                            ${this.renderMatrix(phase.after, 'after', 0)}
                        </div>
                    </div>
                </div>
                
                <div class="calc-breakdown" id="calc-breakdown">
                    <div class="breakdown-title">تفاصيل الحساب (k = ${k}):</div>
                    ${phase.cellOperations.map((op, i) => `
                        <div class="calc-op" data-index="${i}">
                            <span class="op-target">${op.target}</span>
                            <span class="op-plus">+</span>
                            <span class="op-k">(${k})</span>
                            <span class="op-times">×</span>
                            <span class="op-source">${op.source}</span>
                            <span class="op-equals">=</span>
                            <span class="op-target">${op.target}</span>
                            <span class="op-plus">+</span>
                            <span class="op-scaled">(${op.scaled})</span>
                            <span class="op-equals">=</span>
                            <span class="op-result ${op.result === 0 ? 'zero-result' : ''}">${op.result}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSimplifiedPhase(phase) {
        return `
            <div class="simplified-phase">
                <div class="journey">
                    <div class="journey-item">
                        <div class="journey-label">🔴 الأصلية</div>
                        ${this.renderMatrix(phase.original, 'original-small')}
                    </div>
                    <div class="journey-arrow">→</div>
                    <div class="journey-item">
                        <div class="journey-label">🟢 المبسطة</div>
                        ${this.renderMatrix(phase.simplified, 'simplified-large', 0)}
                    </div>
                </div>
                <div class="simplified-note">
                    <span class="note-icon">✨</span>
                    <span class="note-text">${phase.explanation}</span>
                </div>
            </div>
        `;
    }

    renderCalculatePhase(phase) {
        return `
            <div class="calculate-phase">
                <div class="calc-matrix">
                    ${this.renderMatrix(phase.matrix, 'calc-matrix', 0)}
                </div>
                <div class="expansion-title">التوسيع على العمود الأول:</div>
                <div class="expansion-terms" id="expansion-terms">
                    ${phase.expansion.map((term, i) => `
                        <div class="expansion-term ${term.skip ? 'skipped' : ''}" data-index="${i}">
                            <div class="term-header">
                                <span class="term-sign ${term.sign === '+' ? 'positive' : 'negative'}">${term.sign}</span>
                                <span class="term-elem">${term.element}</span>
                                <span class="term-x">×</span>
                            </div>
                            ${term.skip ? 
                                `<div class="term-skip">= 0 ✓</div>` :
                                `<div class="term-minor">
                                    ${this.renderMatrix(term.minor, 'mini-matrix')}
                                </div>
                                <div class="term-calc">${term.minorDet}</div>
                                <div class="term-result">${term.result}</div>`
                            }
                        </div>
                    `).join('')}
                </div>
                <div class="final-det" id="final-det">
                    المحدد = <strong>${phase.finalResult}</strong>
                </div>
                <div class="calc-note">
                    <span class="note-icon">⚡</span>
                    <span>${phase.explanation}</span>
                </div>
            </div>
        `;
    }

    renderSarrusPhase(phase) {
        const s = phase.sarrus;
        return `
            <div class="sarrus-phase">
                <div class="sarrus-matrix-section">
                    <div class="sarrus-matrix-extended" id="sarrus-matrix">
                        ${this.renderSarrusMatrix(phase.matrix)}
                    </div>
                </div>
                
                <div class="sarrus-diags-section">
                    <div class="diags-group main-diags" id="main-diags">
                        <div class="diags-title">🔵 الأقطار الرئيسية (+)</div>
                        <div class="diags-list">
                            ${s.mainDiags.map((d, i) => `
                                <div class="diag-item" data-index="${i}">
                                    <span class="diag-calc">${d.product}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="diags-sum">${s.mainSum}</div>
                    </div>
                    
                    <div class="diags-group anti-diags" id="anti-diags">
                        <div class="diags-title">🔴 الأقطار الثانوية (−)</div>
                        <div class="diags-list">
                            ${s.antiDiags.map((d, i) => `
                                <div class="diag-item" data-index="${i}">
                                    <span class="diag-calc">${d.product}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="diags-sum">${s.antiSum}</div>
                    </div>
                </div>
                
                <div class="sarrus-result" id="sarrus-result">
                    <div class="result-formula">${phase.finalCalc}</div>
                    <div class="result-value">المحدد = <strong>${phase.finalResult}</strong></div>
                </div>
                
                <div class="calc-note">
                    <span class="note-icon">⚡</span>
                    <span>${phase.explanation}</span>
                </div>
            </div>
        `;
    }

    renderSarrusMatrix(matrix) {
        // عرض المصفوفة 3×3 مع العمودين الإضافيين لساروس
        const extended = matrix.map(row => [...row, row[0], row[1]]);
        return `
            <div class="sarrus-extended">
                ${extended.map((row, ri) => `
                    <div class="sarrus-row">
                        ${row.map((cell, ci) => `
                            <span class="sarrus-cell ${ci >= 3 ? 'extended-cell' : ''}" 
                                  data-r="${ri}" data-c="${ci}">${cell}</span>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderResultPhase(phase) {
        return `
            <div class="result-phase">
                <div class="result-icon">🎉</div>
                <div class="result-journey">
                    <div class="result-matrix">
                        <div class="matrix-label">الأصلية</div>
                        ${this.renderMatrix(phase.original, 'result-original')}
                    </div>
                    <div class="result-arrow">→</div>
                    <div class="result-matrix">
                        <div class="matrix-label">المبسطة</div>
                        ${this.renderMatrix(phase.simplified, 'result-simplified')}
                    </div>
                </div>
                <div class="result-det">
                    المحدد = <strong>${phase.determinant}</strong>
                </div>
                <div class="result-savings">
                    <span class="savings-icon">⚡</span>
                    <span>${phase.savings}</span>
                </div>
                <div class="result-tip">
                    ${phase.tip}
                </div>
            </div>
        `;
    }

    // ================== ANIMATIONS ==================
    async playCurrentPhase() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.animationAborted = false;
        
        const phase = this.phases[this.currentPhase];
        
        try {
            switch (phase.type) {
                case 'problem':
                    await this.animateProblem(phase);
                    break;
                case 'idea':
                    await this.animateIdea(phase);
                    break;
                case 'add-operation':
                    await this.animateAddOperation(phase);
                    break;
                case 'simplified':
                    await this.animateSimplified(phase);
                    break;
                case 'calculate':
                    await this.animateCalculate(phase);
                    break;
                case 'calculate-sarrus':
                    await this.animateSarrus(phase);
                    break;
                case 'result':
                    await this.animateResult(phase);
                    break;
            }
        } catch (e) {
            // Animation aborted
        }
        
        this.isPlaying = false;
    }

    async animateProblem(phase) {
        const matrix = document.getElementById('problem-matrix');
        if (!matrix) return;
        
        matrix.style.opacity = '0';
        matrix.style.transform = 'scale(0.8)';
        
        await this.delay(300);
        if (this.animationAborted) throw 'aborted';
        
        matrix.style.transition = 'all 0.6s ease';
        matrix.style.opacity = '1';
        matrix.style.transform = 'scale(1)';
        
        const cells = matrix.querySelectorAll('.simp-cell');
        for (let cell of cells) {
            if (this.animationAborted) throw 'aborted';
            cell.classList.add('pop');
            await this.delay(80);
        }
    }

    async animateIdea(phase) {
        const ideaBox = document.getElementById('idea-box');
        if (!ideaBox) return;
        
        ideaBox.style.opacity = '0';
        ideaBox.style.transform = 'translateY(20px)';
        
        await this.delay(500);
        if (this.animationAborted) throw 'aborted';
        
        ideaBox.style.transition = 'all 0.6s ease';
        ideaBox.style.opacity = '1';
        ideaBox.style.transform = 'translateY(0)';
    }

    async animateAddOperation(phase) {
        const whyBox = document.getElementById('why-box');
        const beforeMatrix = document.getElementById('before-matrix');
        const afterMatrix = document.getElementById('after-matrix');
        const arrow = document.getElementById('transform-arrow');
        const breakdown = document.getElementById('calc-breakdown');
        const calcOps = document.querySelectorAll('.calc-op');
        
        if (!beforeMatrix || !afterMatrix) return;
        
        // Hide elements initially
        if (whyBox) { whyBox.style.opacity = '0'; }
        afterMatrix.style.opacity = '0';
        afterMatrix.style.transform = 'translateX(-30px)';
        arrow.style.opacity = '0';
        breakdown.style.opacity = '0';
        calcOps.forEach(el => { el.style.opacity = '0'; });
        
        // Show why-box
        if (whyBox) {
            await this.delay(300);
            if (this.animationAborted) throw 'aborted';
            whyBox.style.transition = 'all 0.5s ease';
            whyBox.style.opacity = '1';
            await this.delay(600);
        }
        
        // Highlight target row in before matrix
        const targetRow = beforeMatrix.querySelectorAll('.simp-row')[phase.targetRow];
        if (targetRow) {
            await this.delay(300);
            targetRow.classList.add('pulsing');
            await this.delay(500);
        }
        
        // Show breakdown
        if (this.animationAborted) throw 'aborted';
        breakdown.style.transition = 'all 0.5s ease';
        breakdown.style.opacity = '1';
        await this.delay(300);
        
        // Animate each calculation
        for (let i = 0; i < calcOps.length; i++) {
            if (this.animationAborted) throw 'aborted';
            calcOps[i].style.transition = 'all 0.4s ease';
            calcOps[i].style.opacity = '1';
            calcOps[i].classList.add('flash');
            await this.delay(400);
            calcOps[i].classList.remove('flash');
        }
        
        // Show arrow and after matrix
        if (this.animationAborted) throw 'aborted';
        if (targetRow) targetRow.classList.remove('pulsing');
        
        await this.delay(300);
        arrow.style.transition = 'all 0.5s ease';
        arrow.style.opacity = '1';
        await this.delay(400);
        
        if (this.animationAborted) throw 'aborted';
        afterMatrix.style.transition = 'all 0.6s ease';
        afterMatrix.style.opacity = '1';
        afterMatrix.style.transform = 'translateX(0)';
        
        // Highlight new zeros
        const afterRow = afterMatrix.querySelectorAll('.simp-row')[phase.targetRow];
        if (afterRow) {
            const cells = afterRow.querySelectorAll('.simp-cell');
            for (let cell of cells) {
                if (this.animationAborted) throw 'aborted';
                cell.classList.add('morph-in');
                await this.delay(150);
            }
        }
    }

    async animateSimplified(phase) {
        const cells = document.querySelectorAll('.simplified-large .simp-cell');
        
        for (let cell of cells) {
            if (this.animationAborted) throw 'aborted';
            cell.classList.add('pop');
            await this.delay(100);
        }
    }

    async animateCalculate(phase) {
        const terms = document.querySelectorAll('.expansion-term');
        const finalDet = document.getElementById('final-det');
        
        if (finalDet) finalDet.style.opacity = '0';
        terms.forEach(t => { t.style.opacity = '0'; t.style.transform = 'translateY(20px)'; });
        
        for (let term of terms) {
            if (this.animationAborted) throw 'aborted';
            await this.delay(400);
            term.style.transition = 'all 0.5s ease';
            term.style.opacity = '1';
            term.style.transform = 'translateY(0)';
        }
        
        if (this.animationAborted) throw 'aborted';
        await this.delay(500);
        if (finalDet) {
            finalDet.style.transition = 'all 0.6s ease';
            finalDet.style.opacity = '1';
            finalDet.classList.add('pop');
        }
    }

    async animateSarrus(phase) {
        const sarrusMatrix = document.getElementById('sarrus-matrix');
        const mainDiags = document.getElementById('main-diags');
        const antiDiags = document.getElementById('anti-diags');
        const result = document.getElementById('sarrus-result');
        
        // Hide elements initially
        if (mainDiags) mainDiags.style.opacity = '0';
        if (antiDiags) antiDiags.style.opacity = '0';
        if (result) result.style.opacity = '0';
        
        // Show matrix first
        await this.delay(400);
        if (this.animationAborted) throw 'aborted';
        
        // Show main diagonals
        if (mainDiags) {
            mainDiags.style.transition = 'all 0.5s ease';
            mainDiags.style.opacity = '1';
        }
        await this.delay(600);
        if (this.animationAborted) throw 'aborted';
        
        // Show anti diagonals
        if (antiDiags) {
            antiDiags.style.transition = 'all 0.5s ease';
            antiDiags.style.opacity = '1';
        }
        await this.delay(600);
        if (this.animationAborted) throw 'aborted';
        
        // Show result
        if (result) {
            result.style.transition = 'all 0.6s ease';
            result.style.opacity = '1';
            result.classList.add('pop');
        }
    }

    async animateResult(phase) {
        // Simple fade in for result
        await this.delay(300);
    }

    delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms * this.settings.speed);
        });
    }
}

// Create global instance
let detSimplifyTutorial;
document.addEventListener('DOMContentLoaded', () => {
    detSimplifyTutorial = new DetSimplifyTutorial();
});
