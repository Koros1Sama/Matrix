/**
 * Determinant Game - Step-by-Step Educational Version
 * Players solve determinants through guided steps
 */

class DeterminantGame {
    constructor() {
        this.currentLevel = 1;
        this.totalLevels = 10;
        this.matrix = null;
        this.correctAnswer = null;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.stepCount = 0; // Wrong attempts
        this.isPlaying = false;
        
        // Step data for current game
        this.steps = [];
        this.userAnswers = [];
        
        // Tutorial tracking
        this.tutorialCompleted = {
            1: false, // 2x2
            2: false, // 3x3 Sarrus
            3: false  // 4x4+ Cofactor
        };
        
        this.completedLevels = [];
        this.levelStars = {};
        
        this.loadProgress();
    }
    
    // ==================== DETERMINANT CALCULATIONS ====================
    
    calculateDeterminant(matrix) {
        const n = matrix.length;
        if (n === 1) return matrix[0][0];
        if (n === 2) return this.det2x2(matrix);
        if (n === 3) return this.det3x3Sarrus(matrix);
        return this.detNxN(matrix);
    }
    
    det2x2(matrix) {
        const [[a, b], [c, d]] = matrix;
        return a * d - b * c;
    }
    
    det3x3Sarrus(matrix) {
        const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
        const down1 = a * e * i, down2 = b * f * g, down3 = c * d * h;
        const up1 = c * e * g, up2 = a * f * h, up3 = b * d * i;
        return (down1 + down2 + down3) - (up1 + up2 + up3);
    }
    
    detNxN(matrix) {
        const n = matrix.length;
        if (n === 2) return this.det2x2(matrix);
        let det = 0;
        for (let j = 0; j < n; j++) {
            const sign = (j % 2 === 0) ? 1 : -1;
            const minor = this.getMinor(matrix, 0, j);
            det += sign * matrix[0][j] * this.detNxN(minor);
        }
        return det;
    }
    
    getMinor(matrix, row, col) {
        const n = matrix.length;
        const minor = [];
        for (let i = 0; i < n; i++) {
            if (i === row) continue;
            const newRow = [];
            for (let j = 0; j < n; j++) {
                if (j === col) continue;
                newRow.push(matrix[i][j]);
            }
            minor.push(newRow);
        }
        return minor;
    }
    
    // ==================== STEP GENERATION ====================
    
    generateSteps2x2(matrix) {
        const [[a, b], [c, d]] = matrix;
        const mainDiag = a * d;
        const antiDiag = b * c;
        const result = mainDiag - antiDiag;
        
        return [
            {
                type: 'main-diag',
                prompt: `القطر الرئيسي: ${a} × ${d} = ؟`,
                highlight: [[0, 0], [1, 1]],
                highlightClass: 'highlight-green',
                answer: mainDiag,
                explanation: `${a} × ${d} = ${mainDiag}`
            },
            {
                type: 'anti-diag',
                prompt: `القطر الثانوي: ${b} × ${c} = ؟`,
                highlight: [[0, 1], [1, 0]],
                highlightClass: 'highlight-red',
                answer: antiDiag,
                explanation: `${b} × ${c} = ${antiDiag}`
            },
            {
                type: 'final',
                prompt: `المحدد = ${mainDiag} - ${antiDiag} = ؟`,
                highlight: [],
                highlightClass: '',
                answer: result,
                explanation: `${mainDiag} - ${antiDiag} = ${result}`
            }
        ];
    }
    
    generateSteps3x3(matrix) {
        const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
        const steps = [];
        
        // Step 0: Extend matrix - player enters the two repeated columns
        steps.push({
            type: 'extend-matrix',
            prompt: 'أكمل توسيع المصفوفة بنسخ العمود الأول والثاني:',
            highlight: [],
            highlightClass: '',
            answer: 'extend', // Special type
            answerType: 'extend',
            expectedCols: [
                [a, d, g], // Column 1
                [b, e, h]  // Column 2
            ],
            explanation: 'تم توسيع المصفوفة بنجاح!'
        });
        
        // Down diagonals
        const down1 = a * e * i;
        const down2 = b * f * g;
        const down3 = c * d * h;
        
        steps.push({
            type: 'down-diag-1',
            prompt: `القطر الرئيسي 1: ${a} × ${e} × ${i} = ؟`,
            highlight: [[0, 0], [1, 1], [2, 2]],
            highlightClass: 'highlight-green',
            answer: down1,
            explanation: `${a} × ${e} × ${i} = ${down1}`
        });
        
        steps.push({
            type: 'down-diag-2',
            prompt: `القطر الرئيسي 2: ${b} × ${f} × ${g} = ؟`,
            highlight: [[0, 1], [1, 2], [2, 0]],
            highlightClass: 'highlight-green',
            answer: down2,
            explanation: `${b} × ${f} × ${g} = ${down2}`
        });
        
        steps.push({
            type: 'down-diag-3',
            prompt: `القطر الرئيسي 3: ${c} × ${d} × ${h} = ؟`,
            highlight: [[0, 2], [1, 0], [2, 1]],
            highlightClass: 'highlight-green',
            answer: down3,
            explanation: `${c} × ${d} × ${h} = ${down3}`
        });
        
        // Up diagonals
        const up1 = c * e * g;
        const up2 = a * f * h;
        const up3 = b * d * i;
        
        steps.push({
            type: 'up-diag-1',
            prompt: `القطر الثانوي 1: ${c} × ${e} × ${g} = ؟`,
            highlight: [[0, 2], [1, 1], [2, 0]],
            highlightClass: 'highlight-red',
            answer: up1,
            explanation: `${c} × ${e} × ${g} = ${up1}`
        });
        
        steps.push({
            type: 'up-diag-2',
            prompt: `القطر الثانوي 2: ${a} × ${f} × ${h} = ؟`,
            highlight: [[0, 0], [1, 2], [2, 1]],
            highlightClass: 'highlight-red',
            answer: up2,
            explanation: `${a} × ${f} × ${h} = ${up2}`
        });
        
        steps.push({
            type: 'up-diag-3',
            prompt: `القطر الثانوي 3: ${b} × ${d} × ${i} = ؟`,
            highlight: [[0, 1], [1, 0], [2, 2]],
            highlightClass: 'highlight-red',
            answer: up3,
            explanation: `${b} × ${d} × ${i} = ${up3}`
        });
        
        const downSum = down1 + down2 + down3;
        const upSum = up1 + up2 + up3;
        const result = downSum - upSum;
        
        steps.push({
            type: 'down-sum',
            prompt: `مجموع الهابطة: ${down1} + ${down2} + ${down3} = ؟`,
            highlight: [],
            highlightClass: '',
            answer: downSum,
            explanation: `${down1} + ${down2} + ${down3} = ${downSum}`
        });
        
        steps.push({
            type: 'up-sum',
            prompt: `مجموع الصاعدة: ${up1} + ${up2} + ${up3} = ؟`,
            highlight: [],
            highlightClass: '',
            answer: upSum,
            explanation: `${up1} + ${up2} + ${up3} = ${upSum}`
        });
        
        steps.push({
            type: 'final',
            prompt: `المحدد = ${downSum} - ${upSum} = ؟`,
            highlight: [],
            highlightClass: '',
            answer: result,
            explanation: `${downSum} - ${upSum} = ${result}`
        });
        
        return steps;
    }
    
    generateSteps4x4Plus(matrix) {
        // For 4x4+, we use cofactor expansion along first row with detailed steps
        const n = matrix.length;
        const steps = [];
        const cofactorResults = [];
        
        // Step 0: Inform about expansion row
        steps.push({
            type: 'expansion-intro',
            prompt: `سنوسع على الصف الأول. كم عنصر غير صفري في الصف الأول؟`,
            highlight: [[0, 0], [0, 1], [0, 2], n > 3 ? [0, 3] : null].filter(x => x),
            highlightClass: 'highlight-yellow',
            answer: matrix[0].filter(x => x !== 0).length,
            explanation: `عدد العناصر غير الصفرية = ${matrix[0].filter(x => x !== 0).length}`
        });
        
        // For each element in first row (non-zero only need calculation)
        for (let j = 0; j < n; j++) {
            const sign = (j % 2 === 0) ? '+' : '-';
            const signValue = (j % 2 === 0) ? 1 : -1;
            const element = matrix[0][j];
            const minor = this.getMinor(matrix, 0, j);
            const minorDet = this.calculateDeterminant(minor);
            const cofactor = signValue * element * minorDet;
            
            // Calculate which cells in main matrix form the minor
            const minorCells = [];
            for (let r = 1; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    if (c !== j) {
                        minorCells.push([r, c]);
                    }
                }
            }
            cofactorResults.push({ element, sign, signValue, minorDet, cofactor, minor });
            
            // Step: What's the sign for this position?
            steps.push({
                type: `sign-${j}`,
                prompt: `ما هي إشارة الموقع (1, ${j + 1})؟`,
                highlight: [[0, j]],
                highlightClass: sign === '+' ? 'highlight-green' : 'highlight-red',
                answer: sign,
                answerType: 'sign',
                explanation: `(-1)^(1+${j + 1}) = ${sign}`
            });
            
            // If element is zero, skip minor calculation
            if (element === 0) {
                steps.push({
                    type: `cofactor-result-${j}`,
                    prompt: `العنصر = 0، إذاً الناتج = ؟`,
                    highlight: [[0, j]],
                    highlightClass: 'highlight-gray',
                    answer: 0,
                    explanation: `0 × أي شيء = 0 ✓`
                });
                continue;
            }
            
            // For 3x3 minors (from 4x4 matrix), calculate using Sarrus with detailed steps
            if (minor.length === 3) {
                const [[a, b, c], [d, e, f], [g, h, i]] = minor;
                
                // Down diagonals
                const down1 = a * e * i;
                const down2 = b * f * g;
                const down3 = c * d * h;
                const downSum = down1 + down2 + down3;
                
                // Up diagonals
                const up1 = c * e * g;
                const up2 = a * f * h;
                const up3 = b * d * i;
                const upSum = up1 + up2 + up3;
                
                steps.push({
                    type: `minor-down-${j}`,
                    prompt: `المحدد الفرعي ${j + 1} - الأقطار الرئيسية: (${a}×${e}×${i}) + (${b}×${f}×${g}) + (${c}×${d}×${h}) = ؟`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: downSum,
                    explanation: `${down1} + ${down2} + ${down3} = ${downSum}`,
                    subMatrix: minor,
                    subMatrixHighlight: [
                        { cells: [[0,0], [1,1], [2,2]], class: 'diag-down-1' },
                        { cells: [[0,1], [1,2], [2,0]], class: 'diag-down-2' },
                        { cells: [[0,2], [1,0], [2,1]], class: 'diag-down-3' }
                    ]
                });
                
                steps.push({
                    type: `minor-up-${j}`,
                    prompt: `المحدد الفرعي ${j + 1} - الأقطار الثانوية: (${c}×${e}×${g}) + (${a}×${f}×${h}) + (${b}×${d}×${i}) = ؟`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: upSum,
                    explanation: `${up1} + ${up2} + ${up3} = ${upSum}`,
                    subMatrix: minor,
                    subMatrixHighlight: [
                        { cells: [[0,2], [1,1], [2,0]], class: 'diag-up-1' },
                        { cells: [[0,0], [1,2], [2,1]], class: 'diag-up-2' },
                        { cells: [[0,1], [1,0], [2,2]], class: 'diag-up-3' }
                    ]
                });
                
                steps.push({
                    type: `minor-det-${j}`,
                    prompt: `المحدد الفرعي ${j + 1} = ${downSum} − ${upSum} = ؟`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: minorDet,
                    explanation: `= ${minorDet}`,
                    subMatrix: minor
                });
            } else if (minor.length === 2) {
                // 2x2 minor (from 3x3 matrix)
                const [[a, b], [c, d]] = minor;
                steps.push({
                    type: `minor-det-${j}`,
                    prompt: `المحدد الفرعي ${j + 1}: (${a}×${d}) − (${b}×${c}) = ؟`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: minorDet,
                    explanation: `${a * d} − ${b * c} = ${minorDet}`,
                    subMatrix: minor,
                    subMatrixHighlight: [
                        { cells: [[0,0], [1,1]], class: 'diag-main' },
                        { cells: [[0,1], [1,0]], class: 'diag-anti' }
                    ]
                });
            } else {
                // Larger minors - just ask for the result
                steps.push({
                    type: `minor-det-${j}`,
                    prompt: `احسب المحدد الفرعي ${j + 1} (${minor.length}×${minor.length}):`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: minorDet,
                    explanation: `det = ${minorDet}`,
                    subMatrix: minor
                });
            }
            
            // Calculate the cofactor
            steps.push({
                type: `cofactor-result-${j}`,
                prompt: `العامل ${j + 1}: ${sign === '-' ? '−' : ''}${element} × ${minorDet} = ؟`,
                highlight: [[0, j]],
                highlightClass: sign === '+' ? 'highlight-green' : 'highlight-red',
                answer: cofactor,
                explanation: `= ${cofactor}`
            });
        }
        
        // Final sum
        const result = cofactorResults.reduce((sum, c) => sum + c.cofactor, 0);
        const nonZeroCofactors = cofactorResults.filter(c => c.element !== 0);
        const sumExpr = nonZeroCofactors.map(c => c.cofactor >= 0 ? `+ ${c.cofactor}` : `${c.cofactor}`).join(' ').replace(/^\+ /, '');
        
        steps.push({
            type: 'final',
            prompt: `المحدد = ${sumExpr} = ؟`,
            highlight: [],
            highlightClass: '',
            answer: result,
            explanation: `= ${result}`
        });
        
        return steps;
    }
    
    // ==================== GAME LOGIC ====================
    
    startLevel(levelNum) {
        const levelData = determinantLevels[levelNum];
        if (!levelData) return false;
        
        // Check if tutorial is needed
        if (levelData.tutorial && !this.tutorialCompleted[levelData.tutorial]) {
            this.showTutorial(levelData.tutorial);
            return false;
        }
        
        this.currentLevel = levelNum;
        this.matrix = JSON.parse(JSON.stringify(levelData.matrix));
        this.correctAnswer = levelData.answer;
        this.currentStep = 0;
        this.stepCount = 0;
        this.userAnswers = [];
        this.isPlaying = true;
        
        // Generate steps based on level and matrix size
        const n = this.matrix.length;
        
        // Levels 1-2: 2x2 method
        // Levels 3-5: 3x3 Sarrus method
        // Levels 6+: Cofactor expansion method
        if (levelNum <= 2) {
            this.steps = this.generateSteps2x2(this.matrix);
        } else if (levelNum <= 5) {
            this.steps = this.generateSteps3x3(this.matrix);
        } else {
            // Levels 6+ use cofactor expansion
            this.steps = this.generateSteps4x4Plus(this.matrix);
        }
        this.totalSteps = this.steps.length;
        
        this.renderGame();
        return true;
    }
    
    checkStepAnswer(userAnswer) {
        const step = this.steps[this.currentStep];
        let isCorrect;
        
        if (step.answerType === 'sign') {
            // For sign questions, accept + or -
            const normalizedAnswer = userAnswer.trim();
            isCorrect = (normalizedAnswer === step.answer || 
                        (normalizedAnswer === '+' && step.answer === '+') ||
                        (normalizedAnswer === '-' && step.answer === '-'));
        } else {
            isCorrect = (parseInt(userAnswer) === step.answer);
        }
        
        if (isCorrect) {
            this.userAnswers.push(userAnswer);
            this.showCorrectFeedback(step);
            
            setTimeout(() => {
                this.currentStep++;
                if (this.currentStep >= this.totalSteps) {
                    this.winLevel();
                } else {
                    this.renderGame();
                }
            }, 800);
        } else {
            this.stepCount++; // Count wrong attempts
            this.showWrongFeedback(userAnswer, step);
        }
        
        return isCorrect;
    }
    
    showCorrectFeedback(step) {
        const feedback = document.getElementById('step-feedback');
        if (feedback) {
            feedback.className = 'step-feedback correct';
            feedback.innerHTML = `✅ صحيح! ${step.explanation}`;
            feedback.style.display = 'block';
        }
    }
    
    showWrongFeedback(userAnswer, step) {
        const feedback = document.getElementById('step-feedback');
        if (feedback) {
            feedback.className = 'step-feedback wrong';
            feedback.innerHTML = `❌ ${userAnswer} خطأ، حاول مرة أخرى!`;
            feedback.style.display = 'block';
        }
        
        // Shake input
        const input = document.getElementById('step-answer-input');
        if (input) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            input.value = '';
            input.focus();
        }
    }
    
    winLevel() {
        const levelData = determinantLevels[this.currentLevel];
        // Stars based on wrong attempts
        const stars = this.stepCount === 0 ? 3 : (this.stepCount <= 2 ? 2 : 1);
        
        this.saveStars(this.currentLevel, stars);
        this.markLevelComplete(this.currentLevel);
        
        this.showWinScreen(stars);
    }
    
    // ==================== UI RENDERING ====================
    
    renderGame() {
        const container = document.getElementById('determinant-game-container');
        if (!container) return;
        
        const step = this.steps[this.currentStep];
        const n = this.matrix.length;
        
        // Build matrix HTML with highlighting
        let matrixHtml = `<div class="det-game-matrix" style="grid-template-columns: repeat(${n}, 1fr);">`;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const isHighlighted = step.highlight.some(([r, c]) => r === i && c === j);
                const highlightClass = isHighlighted ? step.highlightClass : '';
                matrixHtml += `<div class="det-game-cell ${highlightClass}">${this.matrix[i][j]}</div>`;
            }
        }
        matrixHtml += '</div>';
        
        // Progress bar
        const progress = ((this.currentStep) / this.totalSteps) * 100;
        
        // Determine input section based on step type
        let inputSection = '';
        
        if (step.answerType === 'extend') {
            // Special extend matrix input
            const [[a, b, c], [d, e, f], [g, h, i]] = this.matrix;
            inputSection = `
                <div class="extend-game-container">
                    <div class="extend-game-matrix">
                        <div class="extend-row">
                            <span class="extend-fixed-cell">${a}</span>
                            <span class="extend-fixed-cell">${b}</span>
                            <span class="extend-fixed-cell">${c}</span>
                            <input type="number" class="extend-game-input" data-row="0" data-col="3" data-expected="${a}" placeholder="?">
                            <input type="number" class="extend-game-input" data-row="0" data-col="4" data-expected="${b}" placeholder="?">
                        </div>
                        <div class="extend-row">
                            <span class="extend-fixed-cell">${d}</span>
                            <span class="extend-fixed-cell">${e}</span>
                            <span class="extend-fixed-cell">${f}</span>
                            <input type="number" class="extend-game-input" data-row="1" data-col="3" data-expected="${d}" placeholder="?">
                            <input type="number" class="extend-game-input" data-row="1" data-col="4" data-expected="${e}" placeholder="?">
                        </div>
                        <div class="extend-row">
                            <span class="extend-fixed-cell">${g}</span>
                            <span class="extend-fixed-cell">${h}</span>
                            <span class="extend-fixed-cell">${i}</span>
                            <input type="number" class="extend-game-input" data-row="2" data-col="3" data-expected="${g}" placeholder="?">
                            <input type="number" class="extend-game-input" data-row="2" data-col="4" data-expected="${h}" placeholder="?">
                        </div>
                    </div>
                    <div class="extend-hints">
                        <span class="extend-hint col1">العمود 4 = نسخة العمود 1</span>
                        <span class="extend-hint col2">العمود 5 = نسخة العمود 2</span>
                    </div>
                    <button class="btn btn-primary" onclick="detGame.checkExtendAnswer()">تحقق ✓</button>
                </div>
            `;
        } else if (step.answerType === 'sign') {
            inputSection = `
                <div class="step-input-row sign-input-row">
                    <button class="sign-btn positive" onclick="detGame.submitSignAnswer('+')">+</button>
                    <button class="sign-btn negative" onclick="detGame.submitSignAnswer('-')">−</button>
                    <button class="btn btn-hint" onclick="detGame.showHint()" title="تلميح">
                        💡 <span>تلميح</span>
                    </button>
                </div>
                <div id="hint-panel" class="hint-panel" style="display: none;">
                    <div class="hint-content" id="hint-content"></div>
                    <button class="btn btn-apply-hint" onclick="detGame.applyHint()">تطبيق التلميح</button>
                </div>
            `;
        } else {
            inputSection = `
                <div class="step-input-row">
                    <input type="number" id="step-answer-input" class="step-answer-input" 
                           placeholder="الإجابة" autofocus
                           onkeypress="if(event.key==='Enter') detGame.submitStep()">
                    <button class="btn btn-primary" onclick="detGame.submitStep()">تحقق</button>
                    <button class="btn btn-hint" onclick="detGame.showHint()" title="تلميح">
                        💡 <span>تلميح</span>
                    </button>
                </div>
                <div id="hint-panel" class="hint-panel" style="display: none;">
                    <div class="hint-content" id="hint-content"></div>
                    <button class="btn btn-apply-hint" onclick="detGame.applyHint()">تطبيق التلميح</button>
                </div>
            `;
        }
        
        let html = `
            <div class="det-game-header">
                <button class="btn btn-back" onclick="detGame.exitToSelect()">
                    <span>→</span> رجوع
                </button>
                <h3>المستوى ${this.currentLevel}</h3>
                <div class="det-step-counter">
                    الخطوة ${this.currentStep + 1} / ${this.totalSteps}
                </div>
            </div>
            
            <div class="det-progress-bar">
                <div class="det-progress-fill" style="width: ${progress}%"></div>
            </div>
            
            ${step.answerType !== 'extend' ? `
                <div class="det-matrix-display">
                    <div class="det-bars">|</div>
                    ${matrixHtml}
                    <div class="det-bars">|</div>
                </div>
            ` : ''}
            
            <div class="det-step-area">
                <div class="step-prompt">${step.prompt}</div>
                ${step.subPrompt ? `<div class="step-sub-prompt">${step.subPrompt}</div>` : ''}
                
                ${step.subMatrix ? `
                    <div class="step-sub-matrix">
                        <div class="sub-matrix-label">المحدد الفرعي:</div>
                        <div class="sub-matrix-grid" style="grid-template-columns: repeat(${step.subMatrix.length}, 1fr);">
                            ${step.subMatrix.map((row, ri) => 
                                row.map((val, ci) => {
                                    let cellClass = 'sub-matrix-cell';
                                    if (step.subMatrixHighlight) {
                                        for (const group of step.subMatrixHighlight) {
                                            if (group.cells.some(c => c[0] === ri && c[1] === ci)) {
                                                cellClass += ' ' + group.class;
                                            }
                                        }
                                    }
                                    return `<span class="${cellClass}">${val}</span>`;
                                }).join('')
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${inputSection}
                
                <div id="step-feedback" class="step-feedback" style="display: none;"></div>
            </div>
            
            <div class="det-completed-steps">
                ${this.userAnswers.map((ans, i) => {
                    const stepType = this.steps[i].type;
                    let extraClass = '';
                    if (stepType === 'final') {
                        extraClass = 'final-step';
                    } else if (stepType.includes('minor-det') || stepType.includes('cofactor-result')) {
                        extraClass = 'important-step';
                    } else if (stepType === 'extend-matrix') {
                        extraClass = 'extend-step';
                    }
                    return `
                        <div class="completed-step ${extraClass}">
                            <span class="step-num">${i + 1}</span>
                            <span class="step-result">${this.steps[i].explanation}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.innerHTML = html;
        
        // Setup extend inputs navigation with Enter key
        if (step.answerType === 'extend') {
            this.setupExtendInputNavigation();
        }
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById('step-answer-input');
            if (input) input.focus();
            
            // For extend, focus first input
            const extendInputs = document.querySelectorAll('.extend-game-input');
            if (extendInputs.length > 0) extendInputs[0].focus();
        }, 100);
    }
    
    setupExtendInputNavigation() {
        const inputs = document.querySelectorAll('.extend-game-input');
        const inputArray = Array.from(inputs);
        
        inputArray.forEach((input, index) => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (index < inputArray.length - 1) {
                        // Move to next input
                        inputArray[index + 1].focus();
                    } else {
                        // Last input, submit
                        this.checkExtendAnswer();
                    }
                }
            });
        });
    }
    
    checkExtendAnswer() {
        const inputs = document.querySelectorAll('.extend-game-input');
        const feedback = document.getElementById('step-feedback');
        let allCorrect = true;
        let incorrectCount = 0;
        
        inputs.forEach(input => {
            const expected = parseInt(input.dataset.expected);
            const value = parseInt(input.value);
            
            if (value === expected) {
                input.classList.remove('incorrect');
                input.classList.add('correct');
            } else {
                input.classList.remove('correct');
                input.classList.add('incorrect');
                allCorrect = false;
                incorrectCount++;
            }
        });
        
        if (allCorrect) {
            this.userAnswers.push('✓');
            feedback.className = 'step-feedback correct';
            feedback.innerHTML = '✅ ممتاز! تم توسيع المصفوفة بشكل صحيح!';
            feedback.style.display = 'block';
            
            setTimeout(() => {
                this.currentStep++;
                if (this.currentStep >= this.totalSteps) {
                    this.winLevel();
                } else {
                    this.renderGame();
                }
            }, 1000);
        } else {
            this.stepCount++; // Count wrong attempts
            feedback.className = 'step-feedback wrong';
            feedback.innerHTML = `❌ يوجد ${incorrectCount} خطأ. تذكر: نسخ العمود الأول والثاني!`;
            feedback.style.display = 'block';
        }
    }
    
    submitStep() {
        const input = document.getElementById('step-answer-input');
        if (!input) return;
        
        const userAnswer = input.value.trim();
        if (userAnswer === '' || isNaN(parseInt(userAnswer))) {
            this.showMessage('الرجاء إدخال رقم صحيح', 'error');
            return;
        }
        
        this.checkStepAnswer(parseInt(userAnswer));
    }
    
    submitSignAnswer(sign) {
        this.checkStepAnswer(sign);
    }
    
    // ==================== HINT SYSTEM ====================
    
    showHint() {
        const hintPanel = document.getElementById('hint-panel');
        const hintContent = document.getElementById('hint-content');
        
        if (!hintPanel || !hintContent) return;
        
        const hint = this.getStepHint();
        this.currentHint = hint;
        
        hintContent.innerHTML = hint.message;
        hintPanel.style.display = 'block';
        
        // Penalty for using hint
        this.stepCount++;
    }
    
    getStepHint() {
        const step = this.steps[this.currentStep];
        
        switch (step.type) {
            case 'main-diag':
            case 'anti-diag':
            case 'down-diag-1':
            case 'down-diag-2':
            case 'down-diag-3':
            case 'up-diag-1':
            case 'up-diag-2':
            case 'up-diag-3':
                return {
                    message: `💡 اضرب الأرقام المظللة: <strong>${step.explanation}</strong>`,
                    answer: step.answer
                };
            
            case 'down-sum':
            case 'up-sum':
                return {
                    message: `💡 اجمع النتائج السابقة: <strong>${step.explanation}</strong>`,
                    answer: step.answer
                };
            
            case 'final':
                return {
                    message: `💡 اطرح المجموعين: <strong>${step.explanation}</strong>`,
                    answer: step.answer
                };
            
            case 'expansion-intro':
                return {
                    message: `💡 احسب عدد العناصر غير الصفرية في الصف الأول`,
                    answer: step.answer
                };
            
            case 'sign-0':
            case 'sign-1':
            case 'sign-2':
            case 'sign-3':
                const col = parseInt(step.type.split('-')[1]);
                const signFormula = (1 + col + 1) % 2 === 0 ? '+' : '-';
                return {
                    message: `💡 القاعدة: (-1)^(صف+عمود)<br>الموقع (1, ${col+1}) → (-1)^(1+${col+1}) = <strong>${signFormula}</strong>`,
                    answer: step.answer
                };
            
            default:
                if (step.type.includes('minor-down') || step.type.includes('minor-up') || step.type.includes('minor-det')) {
                    return {
                        message: `💡 احسب باستخدام طريقة ساروس أو القطر: <strong>${step.explanation}</strong>`,
                        answer: step.answer
                    };
                }
                if (step.type.includes('cofactor-result')) {
                    return {
                        message: `💡 اضرب: إشارة × العنصر × المحدد الفرعي = <strong>${step.answer}</strong>`,
                        answer: step.answer
                    };
                }
                return {
                    message: `💡 الإجابة الصحيحة: <strong>${step.answer}</strong>`,
                    answer: step.answer
                };
        }
    }
    
    applyHint() {
        if (!this.currentHint) return;
        
        const step = this.steps[this.currentStep];
        
        if (step.answerType === 'sign') {
            // For sign questions, submit directly
            this.checkStepAnswer(this.currentHint.answer);
        } else {
            // For numeric questions, fill the input
            const input = document.getElementById('step-answer-input');
            if (input) {
                input.value = this.currentHint.answer;
                input.focus();
            }
        }
        
        // Hide hint panel
        const hintPanel = document.getElementById('hint-panel');
        if (hintPanel) hintPanel.style.display = 'none';
    }
    
    showMessage(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `det-toast ${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    showWinScreen(stars) {
        const container = document.getElementById('determinant-game-container');
        if (!container) return;
        
        const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        
        container.innerHTML = `
            <div class="det-win-screen">
                <div class="win-icon">🎉</div>
                <h2>أحسنت!</h2>
                <p>الإجابة الصحيحة: ${this.correctAnswer}</p>
                <div class="win-stars">${starsDisplay}</div>
                <div class="win-stats">الأخطاء: ${this.stepCount}</div>
                <div class="win-buttons">
                    ${this.currentLevel < this.totalLevels ? 
                        `<button class="btn btn-primary" onclick="detGame.nextLevel()">المستوى التالي</button>` : 
                        `<button class="btn btn-success" onclick="detGame.showVictory()">🏆 أكملت جميع المستويات!</button>`
                    }
                    <button class="btn btn-secondary" onclick="detGame.exitToSelect()">رجوع</button>
                </div>
            </div>
        `;
    }
    
    nextLevel() {
        if (this.currentLevel < this.totalLevels) {
            this.startLevel(this.currentLevel + 1);
        }
    }
    
    // ==================== TUTORIAL ====================
    
    showTutorial(tutorialNum) {
        if (typeof determinantTutorial !== 'undefined') {
            determinantTutorial.show(tutorialNum);
        }
    }
    
    completeTutorial(tutorialNum) {
        this.tutorialCompleted[tutorialNum] = true;
        this.saveProgress();
    }
    
    // ==================== PROGRESS SAVING ====================
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('determinant-game-progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.completedLevels = data.completedLevels || [];
                this.levelStars = data.levelStars || {};
                this.tutorialCompleted = data.tutorialCompleted || { 1: false, 2: false, 3: false };
            }
        } catch (e) {
            console.error('Error loading determinant progress:', e);
        }
    }
    
    saveProgress() {
        try {
            const data = {
                completedLevels: this.completedLevels,
                levelStars: this.levelStars,
                tutorialCompleted: this.tutorialCompleted
            };
            localStorage.setItem('determinant-game-progress', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving determinant progress:', e);
        }
    }
    
    markLevelComplete(levelNum) {
        if (!this.completedLevels.includes(levelNum)) {
            this.completedLevels.push(levelNum);
            this.saveProgress();
        }
    }
    
    saveStars(levelNum, stars) {
        const current = this.levelStars[levelNum] || 0;
        if (stars > current) {
            this.levelStars[levelNum] = stars;
            this.saveProgress();
        }
    }
    
    getStars(levelNum) {
        return this.levelStars[levelNum] || 0;
    }
    
    exitToSelect() {
        if (typeof game !== 'undefined') {
            game.endDeterminantGame();
            game.showDeterminantLevelSelect();
        }
    }
}

// Initialize global instance
let detGame;
document.addEventListener('DOMContentLoaded', () => {
    detGame = new DeterminantGame();
});
