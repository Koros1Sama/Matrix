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
        this.stepCount = 0; // Wrong attempts (errors)
        this.hintsUsed = 0; // Hints used (separate from errors)
        this.isPlaying = false;
        this.isProcessingAnswer = false; // Prevent Enter spam during transition
        
        // Step data for current game
        this.steps = [];
        this.userAnswers = [];
        
        // Extended matrix state for 3x3 Sarrus method
        this.isExtended = false;
        this.extendedMatrix = null;
        
        // === NEW: Simplification Phase State ===
        this.isInSimplificationPhase = false;
        this.determinantMultiplier = 1; // Cumulative multiplier from row operations
        this.originalMatrix = null; // Store original for reference
        this.operationsUsed = { swap: 0, scale: 0, add: 0 }; // Track operations used
        this.requiredOperations = []; // Operations that must be used
        this.simplificationHistory = []; // Undo history for simplification
        
        // === NEW: Expansion Choice State ===
        this.expansionType = null; // 'row' or 'col'
        this.expansionIndex = null; // Which row/column to expand on
        
        // Tutorial tracking
        this.tutorialCompleted = {
            1: false, // 2x2
            2: false, // 3x3 Sarrus
            3: false, // 4x4+ Cofactor
            4: false  // Properties (NEW)
        };
        
        this.completedLevels = [];
        this.levelStars = {};
        
        this.loadProgress();
    }
    
    // حساب النجوم الحالية بناءً على التلميحات والأخطاء
    calculateStars() {
        const hints = this.hintsUsed || 0;
        const errors = this.stepCount || 0;
        
        let hintPenalty = hints;
        let errorPenalty = Math.floor(errors / 2);
        
        const totalPenalty = Math.max(hintPenalty, errorPenalty);
        return Math.max(0, 5 - totalPenalty);
    }
    
    // عرض النجوم الحي
    getLiveStarsDisplay() {
        const stars = this.calculateStars();
        return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
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
    
    // Format a cell value for display (supports fractions)
    formatCellValue(val) {
        if (val === null || val === undefined) return '0';
        
        // Simple number
        if (typeof val === 'number') {
            return String(val);
        }
        
        // Fraction object { n: numerator, d: denominator }
        if (typeof val === 'object' && val.n !== undefined && val.d !== undefined) {
            // Simplify the fraction
            const gcd = this.gcd(Math.abs(val.n), Math.abs(val.d));
            const num = val.n / gcd;
            const den = val.d / gcd;
            
            // Handle sign
            const sign = (num < 0) !== (den < 0) ? '-' : '';
            const absNum = Math.abs(num);
            const absDen = Math.abs(den);
            
            if (absDen === 1) {
                return String(sign === '-' ? -absNum : absNum);
            }
            
            // Return as fraction HTML
            return `<span class="frac-display">${sign}<span class="frac-num">${absNum}</span><span class="frac-den">${absDen}</span></span>`;
        }
        
        return String(val);
    }
    
    // Greatest common divisor
    gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }
    
    // تحليل قيمة الكسر من نص واحد (مثل: "-3/4" أو "2")
    parseFractionInput(value) {
        const str = String(value).trim();
        if (!str) return { num: 0, den: 1 };
        
        if (str.includes('/')) {
            const parts = str.split('/');
            const num = parseInt(parts[0]) || 0;
            const den = parseInt(parts[1]) || 1;
            return { num, den: den === 0 ? 1 : den };
        } else {
            const num = parseInt(str) || 0;
            return { num, den: 1 };
        }
    }
    
    // ==================== ROW OPERATIONS FOR SIMPLIFICATION ====================
    
    // Save state for undo
    saveSimplificationState() {
        this.simplificationHistory.push({
            matrix: JSON.parse(JSON.stringify(this.matrix)),
            multiplier: this.determinantMultiplier,
            operationsUsed: { ...this.operationsUsed }
        });
    }
    
    // Undo last simplification operation
    undoSimplification() {
        if (this.simplificationHistory.length === 0) return false;
        
        const lastState = this.simplificationHistory.pop();
        this.matrix = lastState.matrix;
        this.determinantMultiplier = lastState.multiplier;
        this.operationsUsed = lastState.operationsUsed;
        
        this.renderSimplificationPhase();
        return true;
    }
    
    // Swap two rows: det multiplied by -1
    simplifySwapRows(row1, row2) {
        if (row1 === row2) return;
        
        this.saveSimplificationState();
        
        // Swap the rows
        const temp = this.matrix[row1];
        this.matrix[row1] = this.matrix[row2];
        this.matrix[row2] = temp;
        
        // Update multiplier: multiply by -1
        this.determinantMultiplier *= -1;
        this.operationsUsed.swap++;
        
        this.animateRowOperation('swap', row1, row2, () => {
            this.renderSimplificationPhase();
        });
    }
    
    // Scale a row by k: det multiplied by k
    simplifyScaleRow(row, k) {
        if (k === 0) return;
        
        this.saveSimplificationState();
        
        // Scale the row
        for (let j = 0; j < this.matrix[row].length; j++) {
            this.matrix[row][j] *= k;
        }
        
        // Update multiplier: multiply by k
        this.determinantMultiplier *= k;
        this.operationsUsed.scale++;
        
        this.animateRowOperation('scale', row, null, () => {
            this.renderSimplificationPhase();
        });
    }
    
    // Add k times source row to target row: det unchanged
    // k is expressed as num/den fraction
    simplifyAddRows(targetRow, sourceRow, num, den = 1) {
        if (targetRow === sourceRow || num === 0) return;
        
        this.saveSimplificationState();
        
        // Add (num/den) * source to target - using fraction arithmetic
        for (let j = 0; j < this.matrix[targetRow].length; j++) {
            const sourceVal = this.matrix[sourceRow][j];
            const targetVal = this.matrix[targetRow][j];
            
            // If values are Fraction objects, use Fraction arithmetic
            if (typeof targetVal === 'object' && targetVal.n !== undefined) {
                // Fraction object
                const addVal = new Fraction(sourceVal).mul(new Fraction(num, den));
                this.matrix[targetRow][j] = new Fraction(targetVal).add(addVal);
            } else {
                // Simple numbers - convert to fractions for precision
                const result = (targetVal * den + sourceVal * num) / den;
                // Simplify if it's a whole number
                if (Number.isInteger(result)) {
                    this.matrix[targetRow][j] = result;
                } else {
                    // Store as fraction
                    this.matrix[targetRow][j] = { n: targetVal * den + sourceVal * num, d: den };
                }
            }
        }
        
        // Multiplier unchanged for add operation
        this.operationsUsed.add++;
        
        this.animateRowOperation('add', targetRow, sourceRow, () => {
            this.renderSimplificationPhase();
        });
    }
    
    // Animate row operation
    animateRowOperation(type, row1, row2, callback) {
        const container = document.getElementById('det-simplify-matrix');
        if (!container) {
            if (callback) callback();
            return;
        }
        
        const rows = container.querySelectorAll('.det-simp-row');
        
        if (type === 'swap') {
            rows[row1]?.classList.add('row-flash');
            rows[row2]?.classList.add('row-flash');
        } else {
            rows[row1]?.classList.add('row-flash');
        }
        
        setTimeout(() => {
            rows.forEach(r => r.classList.remove('row-flash'));
            if (callback) callback();
        }, 400);
    }
    
    // Check if all required operations have been used
    canProceedToSolving() {
        return this.requiredOperations.every(op => this.operationsUsed[op] > 0);
    }
    
    // Get remaining required operations
    getRemainingOperations() {
        return this.requiredOperations.filter(op => this.operationsUsed[op] === 0);
    }
    
    // Start solving phase (after simplification)
    proceedToSolving() {
        if (!this.canProceedToSolving()) {
            // Show message about required operations
            const remaining = this.getRemainingOperations();
            const opNames = { swap: 'تبديل', scale: 'ضرب', add: 'جمع' };
            const names = remaining.map(op => opNames[op]).join(' و ');
            alert(`يجب استخدام عملية ${names} على الأقل مرة واحدة!`);
            return;
        }
        
        this.isInSimplificationPhase = false;
        
        // Check if this simplification was for Cramer's Rule
        if (this.onSimplificationComplete) {
            this.onSimplificationComplete();
            return;
        }
        
        // Generate steps based on simplified matrix
        const n = this.matrix.length;
        if (this.currentLevel <= 2) {
            this.steps = this.generateSteps2x2(this.matrix);
        } else if (this.currentLevel <= 5) {
            this.steps = this.generateSteps3x3(this.matrix);
        } else {
            this.steps = this.generateSteps4x4Plus(this.matrix);
        }
        
        // Store the simplified determinant for final calculation
        this.simplifiedDeterminant = this.calculateDeterminant(this.matrix);
        
        // If we have a multiplier from row operations, add a final step
        if (this.determinantMultiplier !== 1) {
            const multiplierDisplay = this.determinantMultiplier === -1 ? '(−1)' : this.determinantMultiplier;
            const finalAnswer = this.simplifiedDeterminant * this.determinantMultiplier;
            
            this.steps.push({
                type: 'multiplier-apply',
                prompt: `🔄 تطبيق معامل التبسيط`,
                subPrompt: `المحدد المبسط = <span class="math-ltr">${this.simplifiedDeterminant}</span><br>المعامل = <span class="math-ltr">${multiplierDisplay}</span><br>ما الناتج النهائي؟`,
                answer: finalAnswer,
                answerType: 'number',
                isMultiplierStep: true,
                highlight: [],
                highlightClass: '',
                explanation: `<span class="math-ltr">${this.simplifiedDeterminant} × ${multiplierDisplay} = ${finalAnswer}</span>`
            });
        }
        
        this.totalSteps = this.steps.length;
        
        this.renderGame();
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
                prompt: `القطر الرئيسي: <span class="math-ltr">${a} × ${d} = ؟</span>`,
                highlight: [[0, 0], [1, 1]],
                highlightClass: 'highlight-green',
                answer: mainDiag,
                explanation: `<span class="math-ltr">${a} × ${d} = ${mainDiag}</span>`
            },
            {
                type: 'anti-diag',
                prompt: `القطر الثانوي: <span class="math-ltr">${b} × ${c} = ؟</span>`,
                highlight: [[0, 1], [1, 0]],
                highlightClass: 'highlight-red',
                answer: antiDiag,
                explanation: `<span class="math-ltr">${b} × ${c} = ${antiDiag}</span>`
            },
            {
                type: 'final',
                prompt: `المحدد = <span class="math-ltr">${mainDiag} − ${antiDiag} = ؟</span>`,
                highlight: [],
                highlightClass: '',
                answer: result,
                explanation: `<span class="math-ltr">${mainDiag} − ${antiDiag} = ${result}</span>`
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
        
        // الأقطار الهابطة على المصفوفة الموسعة 3×5
        // القطر 1: العمود 0 → 1 → 2
        // القطر 2: العمود 1 → 2 → 3
        // القطر 3: العمود 2 → 3 → 4
        
        steps.push({
            type: 'down-diag-1',
            prompt: `القطر الرئيسي 1: <span class="math-ltr">${a} × ${e} × ${i} = ؟</span>`,
            highlight: [[0, 0], [1, 1], [2, 2]],
            highlightClass: 'highlight-green',
            useExtendedMatrix: true,
            answer: down1,
            explanation: `<span class="math-ltr">${a} × ${e} × ${i} = ${down1}</span>`
        });
        
        steps.push({
            type: 'down-diag-2',
            prompt: `القطر الرئيسي 2: <span class="math-ltr">${b} × ${f} × ${g} = ؟</span>`,
            highlight: [[0, 1], [1, 2], [2, 3]],
            highlightClass: 'highlight-green',
            useExtendedMatrix: true,
            answer: down2,
            explanation: `<span class="math-ltr">${b} × ${f} × ${g} = ${down2}</span>`
        });
        
        steps.push({
            type: 'down-diag-3',
            prompt: `القطر الرئيسي 3: <span class="math-ltr">${c} × ${d} × ${h} = ؟</span>`,
            highlight: [[0, 2], [1, 3], [2, 4]],
            highlightClass: 'highlight-green',
            useExtendedMatrix: true,
            answer: down3,
            explanation: `<span class="math-ltr">${c} × ${d} × ${h} = ${down3}</span>`
        });
        
        // Up diagonals
        const up1 = c * e * g;
        const up2 = a * f * h;
        const up3 = b * d * i;
        
        // الأقطار الصاعدة على المصفوفة الموسعة 3×5
        // القطر 1: من [2,0] إلى [0,2]
        // القطر 2: من [2,1] إلى [0,3]
        // القطر 3: من [2,2] إلى [0,4]
        
        steps.push({
            type: 'up-diag-1',
            prompt: `القطر الثانوي 1: <span class="math-ltr">${c} × ${e} × ${g} = ؟</span>`,
            highlight: [[2, 0], [1, 1], [0, 2]],
            highlightClass: 'highlight-red',
            useExtendedMatrix: true,
            answer: up1,
            explanation: `<span class="math-ltr">${c} × ${e} × ${g} = ${up1}</span>`
        });
        
        steps.push({
            type: 'up-diag-2',
            prompt: `القطر الثانوي 2: <span class="math-ltr">${a} × ${f} × ${h} = ؟</span>`,
            highlight: [[2, 1], [1, 2], [0, 3]],
            highlightClass: 'highlight-red',
            useExtendedMatrix: true,
            answer: up2,
            explanation: `<span class="math-ltr">${a} × ${f} × ${h} = ${up2}</span>`
        });
        
        steps.push({
            type: 'up-diag-3',
            prompt: `القطر الثانوي 3: <span class="math-ltr">${b} × ${d} × ${i} = ؟</span>`,
            highlight: [[2, 2], [1, 3], [0, 4]],
            highlightClass: 'highlight-red',
            useExtendedMatrix: true,
            answer: up3,
            explanation: `<span class="math-ltr">${b} × ${d} × ${i} = ${up3}</span>`
        });
        
        const downSum = down1 + down2 + down3;
        const upSum = up1 + up2 + up3;
        const result = downSum - upSum;
        
        steps.push({
            type: 'down-sum',
            prompt: `مجموع الرئيسية: <span class="math-ltr">${down1} + ${down2} + ${down3} = ؟</span>`,
            highlight: [],
            highlightClass: '',
            answer: downSum,
            explanation: `<span class="math-ltr">${down1} + ${down2} + ${down3} = ${downSum}</span>`
        });
        
        steps.push({
            type: 'up-sum',
            prompt: `مجموع الثانوية: <span class="math-ltr">${up1} + ${up2} + ${up3} = ؟</span>`,
            highlight: [],
            highlightClass: '',
            answer: upSum,
            explanation: `<span class="math-ltr">${up1} + ${up2} + ${up3} = ${upSum}</span>`
        });
        
        steps.push({
            type: 'final',
            prompt: `المحدد = <span class="math-ltr">${downSum} − ${upSum} = ؟</span>`,
            highlight: [],
            highlightClass: '',
            answer: result,
            explanation: `<span class="math-ltr">${downSum} − ${upSum} = ${result}</span>`
        });
        
        return steps;
    }
    
    generateSteps4x4Plus(matrix, expansionType = null, expansionIndex = null) {
        // For 4x4+, we use cofactor expansion with player choice
        const n = matrix.length;
        const steps = [];
        const cofactorResults = [];
        
        // If no expansion choice made yet, add selection steps
        if (expansionType === null) {
            // Step 0: Choose expansion type (row or column)
            steps.push({
                type: 'expansion-type-choice',
                prompt: `اختر طريقة التوسيع:`,
                highlight: [],
                highlightClass: '',
                answer: 'choice',
                answerType: 'expansion-type',
                explanation: 'تم اختيار طريقة التوسيع'
            });
            return steps; // Will regenerate after choice
        }
        
        if (expansionIndex === null) {
            // Step 1: Choose which row/column
            const label = expansionType === 'row' ? 'الصف' : 'العمود';
            steps.push({
                type: 'expansion-index-choice',
                prompt: `اختر ${label} للتوسيع:`,
                highlight: [],
                highlightClass: '',
                answer: 'choice',
                answerType: 'expansion-index',
                expansionType: expansionType,
                matrixSize: n,
                explanation: `تم اختيار ${label}`
            });
            return steps; // Will regenerate after choice
        }
        
        // Get the expansion line (row or column)
        const isRow = expansionType === 'row';
        const lineLabel = isRow ? `الصف ${expansionIndex + 1}` : `العمود ${expansionIndex + 1}`;
        const line = isRow ? matrix[expansionIndex] : matrix.map(row => row[expansionIndex]);
        const nonZeroCount = line.filter(x => x !== 0).length;
        
        // Count zeros for auto-skip message
        const zeroCount = line.filter(x => x === 0).length;
        
        // Step: Show chosen expansion line info
        const lineHighlight = [];
        for (let i = 0; i < n; i++) {
            if (isRow) {
                lineHighlight.push([expansionIndex, i]);
            } else {
                lineHighlight.push([i, expansionIndex]);
            }
        }
        
        // If there are zeros, show a message about auto-skipping
        let expansionPrompt = `سنوسع على ${lineLabel}. كم عنصر غير صفري؟`;
        if (zeroCount > 0) {
            expansionPrompt = `سنوسع على ${lineLabel}. (${zeroCount} عنصر = 0 سيُتخطى تلقائياً) كم عنصر غير صفري؟`;
        }
        
        steps.push({
            type: 'expansion-intro',
            prompt: expansionPrompt,
            highlight: lineHighlight,
            highlightClass: 'highlight-yellow',
            answer: nonZeroCount,
            explanation: `عدد العناصر غير الصفرية = ${nonZeroCount}`
        });
        
        // For each element in the chosen row/column
        for (let j = 0; j < n; j++) {
            // Get element and position based on expansion type
            const row = isRow ? expansionIndex : j;
            const col = isRow ? j : expansionIndex;
            const element = matrix[row][col];
            
            // Calculate sign based on position ((-1)^(row+col))
            const signPower = row + col;
            const sign = (signPower % 2 === 0) ? '+' : '-';
            const signValue = (signPower % 2 === 0) ? 1 : -1;
            
            const minor = this.getMinor(matrix, row, col);
            const minorDet = this.calculateDeterminant(minor);
            const cofactor = signValue * element * minorDet;
            
            // Calculate which cells in main matrix form the minor
            const minorCells = [];
            for (let r = 0; r < n; r++) {
                if (r === row) continue;
                for (let c = 0; c < n; c++) {
                    if (c === col) continue;
                    minorCells.push([r, c]);
                }
            }
            cofactorResults.push({ element, sign, signValue, minorDet, cofactor, minor, row, col });
            
            // If element is zero, skip ALL steps for this element (auto-skip)
            if (element === 0) {
                // Just add a notification step that auto-completes
                steps.push({
                    type: `zero-skip-${j}`,
                    prompt: `⏭️ العنصر (${row + 1}, ${col + 1}) = 0 → تخطي تلقائي`,
                    highlight: [[row, col]],
                    highlightClass: 'highlight-gray',
                    answer: 'auto',
                    answerType: 'auto-skip',
                    explanation: `0 × أي محدد فرعي = 0 ✓`
                });
                continue;
            }
            
            // Step: What's the sign for this position?
            steps.push({
                type: `sign-${j}`,
                prompt: `ما هي إشارة الموقع (${row + 1}, ${col + 1})؟`,
                highlight: [[row, col]],
                highlightClass: sign === '+' ? 'highlight-green' : 'highlight-red',
                answer: sign,
                answerType: 'sign',
                explanation: `<span class="math-ltr">(-1)^(${row + 1}+${col + 1}) = ${sign}</span>`
            });
            
            // For 3x3 minors (from 4x4 matrix), use FULL Sarrus method with extension step
            if (minor.length === 3) {
                const [[a, b, c], [d, e, f], [g, h, i]] = minor;
                
                // Step 1: Extend the 3x3 minor matrix (add two columns)
                steps.push({
                    type: `minor-extend-${j}`,
                    prompt: `المحدد الفرعي ${j + 1}: أكمل توسيع المصفوفة بنسخ العمود الأول والثاني`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: 'extend',
                    answerType: 'minor-extend',
                    minorIndex: j,
                    subMatrix: minor,
                    expectedCols: [
                        [a, d, g], // Column 1
                        [b, e, h]  // Column 2
                    ],
                    explanation: 'تم توسيع المصفوفة الفرعية!'
                });
                
                // Down diagonals (3 separate steps)
                const down1 = a * e * i;
                const down2 = b * f * g;
                const down3 = c * d * h;
                const downSum = down1 + down2 + down3;
                
                steps.push({
                    type: `minor-down1-${j}`,
                    prompt: `القطر الرئيسي 1: <span class="math-ltr">${a} × ${e} × ${i} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: down1,
                    explanation: `<span class="math-ltr">${a} × ${e} × ${i} = ${down1}</span>`,
                    subMatrix: minor,
                    useMinorExtended: true,
                    minorIndex: j,
                    subMatrixHighlight: [
                        { cells: [[0,0], [1,1], [2,2]], class: 'diag-down-active' }
                    ]
                });
                
                steps.push({
                    type: `minor-down2-${j}`,
                    prompt: `القطر الرئيسي 2: <span class="math-ltr">${b} × ${f} × ${g} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: down2,
                    explanation: `<span class="math-ltr">${b} × ${f} × ${g} = ${down2}</span>`,
                    subMatrix: minor,
                    useMinorExtended: true,
                    minorIndex: j,
                    subMatrixHighlight: [
                        { cells: [[0,1], [1,2], [2,3]], class: 'diag-down-active' }
                    ]
                });
                
                steps.push({
                    type: `minor-down3-${j}`,
                    prompt: `القطر الرئيسي 3: <span class="math-ltr">${c} × ${d} × ${h} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: down3,
                    explanation: `<span class="math-ltr">${c} × ${d} × ${h} = ${down3}</span>`,
                    subMatrix: minor,
                    useMinorExtended: true,
                    minorIndex: j,
                    subMatrixHighlight: [
                        { cells: [[0,2], [1,3], [2,4]], class: 'diag-down-active' }
                    ]
                });
                
                // Up diagonals (3 separate steps)
                const up1 = c * e * g;
                const up2 = a * f * h;
                const up3 = b * d * i;
                const upSum = up1 + up2 + up3;
                
                steps.push({
                    type: `minor-up1-${j}`,
                    prompt: `القطر الثانوي 1: <span class="math-ltr">${c} × ${e} × ${g} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: up1,
                    explanation: `<span class="math-ltr">${c} × ${e} × ${g} = ${up1}</span>`,
                    subMatrix: minor,
                    useMinorExtended: true,
                    minorIndex: j,
                    subMatrixHighlight: [
                        { cells: [[2,0], [1,1], [0,2]], class: 'diag-up-active' }
                    ]
                });
                
                steps.push({
                    type: `minor-up2-${j}`,
                    prompt: `القطر الثانوي 2: <span class="math-ltr">${a} × ${f} × ${h} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: up2,
                    explanation: `<span class="math-ltr">${a} × ${f} × ${h} = ${up2}</span>`,
                    subMatrix: minor,
                    useMinorExtended: true,
                    minorIndex: j,
                    subMatrixHighlight: [
                        { cells: [[2,1], [1,2], [0,3]], class: 'diag-up-active' }
                    ]
                });
                
                steps.push({
                    type: `minor-up3-${j}`,
                    prompt: `القطر الثانوي 3: <span class="math-ltr">${b} × ${d} × ${i} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: up3,
                    explanation: `<span class="math-ltr">${b} × ${d} × ${i} = ${up3}</span>`,
                    subMatrix: minor,
                    useMinorExtended: true,
                    minorIndex: j,
                    subMatrixHighlight: [
                        { cells: [[2,2], [1,3], [0,4]], class: 'diag-up-active' }
                    ]
                });
                
                // Sum of down diagonals
                steps.push({
                    type: `minor-down-sum-${j}`,
                    prompt: `مجموع الأقطار الرئيسية: <span class="math-ltr">${down1} + ${down2} + ${down3} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: downSum,
                    explanation: `<span class="math-ltr">${down1} + ${down2} + ${down3} = ${downSum}</span>`,
                    subMatrix: minor
                });
                
                // Sum of up diagonals
                steps.push({
                    type: `minor-up-sum-${j}`,
                    prompt: `مجموع الأقطار الثانوية: <span class="math-ltr">${up1} + ${up2} + ${up3} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: upSum,
                    explanation: `<span class="math-ltr">${up1} + ${up2} + ${up3} = ${upSum}</span>`,
                    subMatrix: minor
                });
                
                // Final minor determinant
                steps.push({
                    type: `minor-det-${j}`,
                    prompt: `المحدد الفرعي ${j + 1} = <span class="math-ltr">${downSum} − ${upSum} = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: minorDet,
                    explanation: `= <span class="math-ltr">${minorDet}</span>`,
                    subMatrix: minor
                });
            } else if (minor.length === 2) {
                // 2x2 minor (from 3x3 matrix)
                const [[a, b], [c, d]] = minor;
                steps.push({
                    type: `minor-det-${j}`,
                    prompt: `المحدد الفرعي ${j + 1}: <span class="math-ltr">(${a}×${d}) − (${b}×${c}) = ؟</span>`,
                    highlight: minorCells,
                    highlightClass: 'highlight-minor',
                    answer: minorDet,
                    explanation: `<span class="math-ltr">${a * d} − ${b * c} = ${minorDet}</span>`,
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
                    explanation: `det = <span class="math-ltr">${minorDet}</span>`,
                    subMatrix: minor
                });
            }
            
            // Calculate the cofactor
            steps.push({
                type: `cofactor-result-${j}`,
                prompt: `العامل ${j + 1}: <span class="math-ltr">${sign === '-' ? '−' : ''}${element} × ${minorDet} = ؟</span>`,
                highlight: [[row, col]],
                highlightClass: sign === '+' ? 'highlight-green' : 'highlight-red',
                answer: cofactor,
                explanation: `= <span class="math-ltr">${cofactor}</span>`
            });
        }
        
        // Final sum
        const result = cofactorResults.reduce((sum, c) => sum + c.cofactor, 0);
        const nonZeroCofactors = cofactorResults.filter(c => c.element !== 0);
        const sumExpr = nonZeroCofactors.map(c => c.cofactor >= 0 ? `+ ${c.cofactor}` : `${c.cofactor}`).join(' ').replace(/^\+ /, '');
        
        steps.push({
            type: 'final',
            prompt: `المحدد = <span class="math-ltr">${sumExpr} = ؟</span>`,
            highlight: [],
            highlightClass: '',
            answer: result,
            explanation: `= <span class="math-ltr">${result}</span>`
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
        
        // Note: Properties/simplification tutorial is now part of Tutorial 2 (3x3 Sarrus)
        
        this.currentLevel = levelNum;
        this.matrix = JSON.parse(JSON.stringify(levelData.matrix));
        this.originalMatrix = JSON.parse(JSON.stringify(levelData.matrix)); // Store original
        this.correctAnswer = levelData.answer;
        this.currentStep = 0;
        this.stepCount = 0;
        this.hintsUsed = 0;
        this.userAnswers = [];
        this.isPlaying = true;
        
        // إعادة تعيين حالة التوسيع
        this.isExtended = false;
        this.extendedMatrix = null;
        this.extendedMinors = {}; // للمحددات الفرعية الموسعة
        
        // Reset simplification state
        this.determinantMultiplier = 1;
        this.operationsUsed = { swap: 0, scale: 0, add: 0 };
        this.simplificationHistory = [];
        this.requiredOperations = levelData.requiredOperations || [];
        
        // Reset expansion choice state
        this.expansionType = null;
        this.expansionIndex = null;
        
        // Check if this level requires simplification
        if (levelData.requiresSimplification) {
            this.isInSimplificationPhase = true;
            this.renderSimplificationPhase();
            return true;
        }
        
        // No simplification needed - go directly to solving
        this.isInSimplificationPhase = false;
        
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
    
    // بدء مرحلة مخصصة
    startCustomLevel(levelData) {
        this.currentLevel = 'custom';
        this.matrix = JSON.parse(JSON.stringify(levelData.matrix));
        this.originalMatrix = JSON.parse(JSON.stringify(levelData.matrix));
        this.correctAnswer = this.calculateDeterminant(levelData.matrix);
        this.currentStep = 0;
        this.stepCount = 0;
        this.hintsUsed = 0;
        this.userAnswers = [];
        this.isPlaying = true;
        
        // إعادة تعيين حالة التوسيع
        this.isExtended = false;
        this.extendedMatrix = null;
        this.extendedMinors = {};
        
        // Reset simplification state
        this.determinantMultiplier = 1;
        this.operationsUsed = { swap: 0, scale: 0, add: 0 };
        this.simplificationHistory = [];
        this.requiredOperations = [];
        
        // Reset expansion choice state
        this.expansionType = null;
        this.expansionIndex = null;
        
        // Generate steps based on matrix size
        const n = this.matrix.length;
        
        if (n === 2) {
            this.isInSimplificationPhase = false;
            this.steps = this.generateSteps2x2(this.matrix);
        } else if (n === 3) {
            this.isInSimplificationPhase = false;
            this.steps = this.generateSteps3x3(this.matrix);
        } else {
            // 4x4+ use simplification phase
            this.isInSimplificationPhase = true;
            this.renderSimplificationPhase();
            return true;
        }
        
        this.totalSteps = this.steps.length;
        this.renderGame();
        return true;
    }
    
    checkStepAnswer(userAnswer) {
        // Prevent Enter spam during transition
        if (this.isProcessingAnswer) {
            return false;
        }
        
        const step = this.steps[this.currentStep];
        
        // Reject empty or whitespace-only input
        if (userAnswer === null || userAnswer === undefined || String(userAnswer).trim() === '') {
            return false;
        }
        
        let isCorrect;
        
        if (step.answerType === 'sign') {
            // For sign questions, accept + or -
            const normalizedAnswer = userAnswer.trim();
            isCorrect = (normalizedAnswer === step.answer || 
                        (normalizedAnswer === '+' && step.answer === '+') ||
                        (normalizedAnswer === '-' && step.answer === '-'));
        } else {
            const parsed = parseInt(userAnswer);
            // Reject NaN (non-numeric input)
            if (isNaN(parsed)) {
                return false;
            }
            isCorrect = (parsed === step.answer);
        }
        
        if (isCorrect) {
            this.isProcessingAnswer = true; // Lock to prevent spam
            this.userAnswers.push(userAnswer);
            this.showCorrectFeedback(step);
            
            setTimeout(() => {
                this.currentStep++;
                this.isProcessingAnswer = false; // Unlock after transition
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
        const stars = this.calculateStars();
        
        this.saveStars(this.currentLevel, stars);
        this.markLevelComplete(this.currentLevel);
        
        this.showWinScreen(stars);
    }
    
    // ==================== SIMPLIFICATION PHASE UI ====================
    
    renderSimplificationPhase() {
        const container = document.getElementById('determinant-game-container');
        if (!container) return;
        
        const n = this.matrix.length;
        const levelData = determinantLevels[this.currentLevel] || {};
        const simplificationHint = levelData.simplificationHint || 'استخدم عمليات الصفوف لتبسيط المصفوفة';
        const opNames = { swap: 'تبديل ↔️', add: 'جمع ➕' };
        
        // Build matrix HTML - proper grid structure
        let matrixHtml = `<div id="det-simplify-matrix" class="det-simplify-matrix">`;
        for (let i = 0; i < n; i++) {
            matrixHtml += `<div class="det-simp-row" data-row="${i}">`;
            for (let j = 0; j < n; j++) {
                matrixHtml += `<div class="det-simp-cell">${this.formatCellValue(this.matrix[i][j])}</div>`;
            }
            matrixHtml += `</div>`;
        }
        matrixHtml += '</div>';
        
        // Build required operations checklist (game requirement, not math)
        let opsChecklistHtml = '';
        if (this.requiredOperations.length > 0) {
            opsChecklistHtml = `
                <div class="required-ops-list">
                    <div class="required-ops-title">🎮 شرط اللعبة (الحد الأدنى):</div>
                    <div class="required-ops-subtitle">استخدم كل عملية مرة واحدة على الأقل:</div>
                    ${this.requiredOperations.map(op => {
                        const isDone = this.operationsUsed[op] > 0;
                        return `<div class="required-op-item ${isDone ? 'done' : ''}">
                            <span class="op-check">${isDone ? '✅' : '☐'}</span>
                            <span class="op-name">${opNames[op]}</span>
                        </div>`;
                    }).join('')}
                </div>
            `;
        }
        
        // Multiplier display
        const multiplierSign = this.determinantMultiplier >= 0 ? '' : '';
        const multiplierDisplay = this.determinantMultiplier === 1 ? '×1' : 
                                  this.determinantMultiplier === -1 ? '×(−1)' : 
                                  `×${this.determinantMultiplier}`;
        
        container.innerHTML = `
            <div class="det-simplify-phase">
                <div class="det-simplify-header">
                    <h3>📐 مرحلة التبسيط</h3>
                    <p class="simplify-hint">${simplificationHint}</p>
                </div>
                
                <div class="det-simplify-content">
                    <div class="det-simplify-left">
                        <div class="matrix-wrapper">
                            <div class="det-bracket left">|</div>
                            ${matrixHtml}
                            <div class="det-bracket right">|</div>
                        </div>
                        
                        <div class="multiplier-display">
                            <span class="mult-label">المعامل:</span>
                            <span class="mult-value ${this.determinantMultiplier < 0 ? 'negative' : ''}">${multiplierDisplay}</span>
                        </div>
                    </div>
                    
                    <div class="det-simplify-right">
                        ${opsChecklistHtml}
                        
                        <div class="det-simplify-buttons">
                            <button class="btn btn-simp btn-swap" onclick="detGame.showSimplifySwapModal()">
                                🔄 تبديل صفين
                            </button>
                            <button class="btn btn-simp btn-add" onclick="detGame.showSimplifyAddModal()">
                                ➕ جمع صفين
                            </button>
                        </div>
                        
                        <div class="det-simplify-actions">
                            <button class="btn btn-secondary btn-undo" onclick="detGame.undoSimplification()" 
                                    ${this.simplificationHistory.length === 0 ? 'disabled' : ''}>
                                ↩️ تراجع
                            </button>
                            <button class="btn btn-primary btn-proceed" onclick="detGame.proceedToSolving()"
                                    ${!this.canProceedToSolving() ? 'disabled' : ''}>
                                ابدأ الحل ← 
                            </button>
                        </div>
                    </div>
                </div>
                
                <button class="btn btn-danger det-exit-btn" onclick="detGame.exitToSelect()">
                    خروج
                </button>
            </div>
        `;
        
        container.style.display = 'block';
    }
    
    // Swap modal
    showSimplifySwapModal() {
        const n = this.matrix.length;
        let rowOptions = '';
        for (let i = 0; i < n; i++) {
            rowOptions += `<option value="${i}">R${i + 1}</option>`;
        }
        
        const modalHtml = `
            <div class="det-modal-overlay" id="det-swap-modal">
                <div class="det-modal">
                    <h4>🔄 تبديل صفين</h4>
                    <p class="modal-effect">⚠️ التأثير: المحدد × (−1)</p>
                    
                    <div class="modal-form">
                        <div class="form-row">
                            <label>الصف الأول:</label>
                            <select id="swap-row1">${rowOptions}</select>
                        </div>
                        <div class="form-row">
                            <label>الصف الثاني:</label>
                            <select id="swap-row2">${rowOptions.replace('value="0"', 'value="0"').replace('option value="1"', 'option value="1" selected')}</select>
                        </div>
                    </div>
                    
                    <div class="modal-buttons">
                        <button class="btn btn-secondary" onclick="detGame.closeSimplifyModal()">إلغاء</button>
                        <button class="btn btn-primary" onclick="detGame.executeSimplifySwap()">تطبيق</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Scale modal
    showSimplifyScaleModal() {
        const n = this.matrix.length;
        let rowOptions = '';
        for (let i = 0; i < n; i++) {
            rowOptions += `<option value="${i}">R${i + 1}</option>`;
        }
        
        const modalHtml = `
            <div class="det-modal-overlay" id="det-scale-modal">
                <div class="det-modal">
                    <h4>✖️ ضرب صف بعدد</h4>
                    <p class="modal-effect">⚠️ التأثير: المحدد × k</p>
                    
                    <div class="modal-form">
                        <div class="form-row">
                            <label>الصف:</label>
                            <select id="scale-row">${rowOptions}</select>
                        </div>
                        <div class="form-row">
                            <label>المعامل k:</label>
                            <input type="number" id="scale-k" value="2" min="-10" max="10" step="1">
                        </div>
                    </div>
                    
                    <div class="modal-buttons">
                        <button class="btn btn-secondary" onclick="detGame.closeSimplifyModal()">إلغاء</button>
                        <button class="btn btn-primary" onclick="detGame.executeSimplifyScale()">تطبيق</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Add modal
    showSimplifyAddModal() {
        const n = this.matrix.length;
        let rowOptions = '';
        for (let i = 0; i < n; i++) {
            rowOptions += `<option value="${i}">R${i + 1}</option>`;
        }
        
        const modalHtml = `
            <div class="det-modal-overlay" id="det-add-modal">
                <div class="det-modal">
                    <h4>➕ جمع صفين</h4>
                    <p class="modal-effect modal-effect-free">✨ مجاني! لا يغير المحدد</p>
                    
                    <div class="modal-form">
                        <div class="form-row">
                            <label>الصف الهدف:</label>
                            <select id="simp-add-target">${rowOptions}</select>
                        </div>
                        <div class="form-row form-row-center">
                            <span class="form-arrow">← أضف إليه</span>
                        </div>
                        <div class="form-row">
                            <label>المعامل k:</label>
                            <div class="fraction-input-single">
                                <input type="text" inputmode="text" id="simp-add-k" value="" class="frac-input-single" placeholder="e.g. -3/4">
                            </div>
                        </div>
                        <div class="form-row">
                            <label>× الصف المصدر:</label>
                            <select id="simp-add-source">${rowOptions.replace('value="1"', 'value="1" selected')}</select>
                        </div>
                    </div>
                    
                    <p class="modal-formula">R<sub>هدف</sub> ← R<sub>هدف</sub> + k × R<sub>مصدر</sub></p>
                    
                    <div class="modal-buttons">
                        <button class="btn btn-secondary" onclick="detGame.closeSimplifyModal()">إلغاء</button>
                        <button class="btn btn-primary" onclick="detGame.executeSimplifyAdd()">تطبيق</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Close modal
    closeSimplifyModal() {
        document.querySelectorAll('.det-modal-overlay').forEach(m => m.remove());
    }
    
    // Execute swap
    executeSimplifySwap() {
        const row1 = parseInt(document.getElementById('swap-row1').value);
        const row2 = parseInt(document.getElementById('swap-row2').value);
        this.closeSimplifyModal();
        
        if (row1 !== row2) {
            this.simplifySwapRows(row1, row2);
        }
    }
    
    // Execute scale
    executeSimplifyScale() {
        const row = parseInt(document.getElementById('scale-row').value);
        const k = parseInt(document.getElementById('scale-k').value);
        this.closeSimplifyModal();
        
        if (k !== 0) {
            this.simplifyScaleRow(row, k);
        }
    }
    
    // Execute add
    executeSimplifyAdd() {
        const target = parseInt(document.getElementById('simp-add-target').value);
        const source = parseInt(document.getElementById('simp-add-source').value);
        const kValue = document.getElementById('simp-add-k').value;
        const { num, den } = this.parseFractionInput(kValue);
        this.closeSimplifyModal();
        
        if (target !== source && num !== 0 && den !== 0) {
            this.simplifyAddRows(target, source, num, den);
        }
    }
    
    // ==================== UI RENDERING ====================
    
    
    renderGame() {
        const container = document.getElementById('determinant-game-container');
        if (!container) return;
        
        const step = this.steps[this.currentStep];
        const n = this.matrix.length;
        
        // تحديد ما إذا كانت الخطوة تستخدم المصفوفة الموسعة
        const useExtended = step.useExtendedMatrix && this.isExtended && this.extendedMatrix;
        const displayMatrix = useExtended ? this.extendedMatrix : this.matrix;
        const cols = useExtended ? 5 : n;
        
        // Build matrix HTML with highlighting
        let matrixHtml = `<div class="det-game-matrix ${useExtended ? 'extended-matrix' : ''}" style="grid-template-columns: repeat(${cols}, 1fr);">`;
        for (let i = 0; i < displayMatrix.length; i++) {
            for (let j = 0; j < displayMatrix[i].length; j++) {
                const isHighlighted = step.highlight.some(([r, c]) => r === i && c === j);
                const highlightClass = isHighlighted ? step.highlightClass : '';
                // إضافة فئة خاصة للعواميد المضافة (4 و 5)
                const extendedColClass = (useExtended && j >= 3) ? 'extended-col' : '';
                matrixHtml += `<div class="det-game-cell ${highlightClass} ${extendedColClass}">${displayMatrix[i][j]}</div>`;
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
        } else if (step.answerType === 'minor-extend') {
            // Minor extension input (for 3x3 minors in cofactor method)
            const [[a, b, c], [d, e, f], [g, h, i]] = step.subMatrix;
            inputSection = `
                <div class="minor-extend-container">
                    <div class="minor-extend-label">وسّع المصفوفة الفرعية ${step.minorIndex + 1}:</div>
                    <div class="minor-extend-matrix">
                        <div class="extend-row">
                            <span class="extend-fixed-cell">${a}</span>
                            <span class="extend-fixed-cell">${b}</span>
                            <span class="extend-fixed-cell">${c}</span>
                            <input type="number" class="minor-extend-input" data-row="0" data-col="3" data-expected="${a}" placeholder="?">
                            <input type="number" class="minor-extend-input" data-row="0" data-col="4" data-expected="${b}" placeholder="?">
                        </div>
                        <div class="extend-row">
                            <span class="extend-fixed-cell">${d}</span>
                            <span class="extend-fixed-cell">${e}</span>
                            <span class="extend-fixed-cell">${f}</span>
                            <input type="number" class="minor-extend-input" data-row="1" data-col="3" data-expected="${d}" placeholder="?">
                            <input type="number" class="minor-extend-input" data-row="1" data-col="4" data-expected="${e}" placeholder="?">
                        </div>
                        <div class="extend-row">
                            <span class="extend-fixed-cell">${g}</span>
                            <span class="extend-fixed-cell">${h}</span>
                            <span class="extend-fixed-cell">${i}</span>
                            <input type="number" class="minor-extend-input" data-row="2" data-col="3" data-expected="${g}" placeholder="?">
                            <input type="number" class="minor-extend-input" data-row="2" data-col="4" data-expected="${h}" placeholder="?">
                        </div>
                    </div>
                    <div class="extend-hints">
                        <span class="extend-hint col1">العمود 4 = نسخة العمود 1</span>
                        <span class="extend-hint col2">العمود 5 = نسخة العمود 2</span>
                    </div>
                    <button class="btn btn-primary" onclick="detGame.checkMinorExtendAnswer(${step.minorIndex})">تحقق ✓</button>
                </div>
            `;
        } else if (step.answerType === 'expansion-type') {
            // Expansion type choice (row or column)
            inputSection = `
                <div class="expansion-choice-container">
                    <div class="expansion-choice-title">اختر طريقة التوسيع:</div>
                    <div class="expansion-choice-buttons">
                        <button class="expansion-choice-btn row-choice" onclick="detGame.selectExpansionType('row')">
                            <span class="choice-icon">↔️</span>
                            <span class="choice-label">صف</span>
                        </button>
                        <button class="expansion-choice-btn col-choice" onclick="detGame.selectExpansionType('col')">
                            <span class="choice-icon">↕️</span>
                            <span class="choice-label">عمود</span>
                        </button>
                    </div>
                    <div class="expansion-tip">💡 نصيحة: اختر الصف أو العمود الذي يحتوي أكثر أصفار لتقليل العمليات</div>
                </div>
            `;
        } else if (step.answerType === 'expansion-index') {
            // Expansion index choice (which row/column)
            const n = step.matrixSize;
            const isRow = step.expansionType === 'row';
            const label = isRow ? 'الصف' : 'العمود';
            
            // Calculate zero counts for each row/column to show as hints
            let buttons = '';
            for (let i = 0; i < n; i++) {
                const line = isRow ? this.matrix[i] : this.matrix.map(row => row[i]);
                const zeroCount = line.filter(x => x === 0).length;
                const hint = zeroCount > 0 ? `(${zeroCount} صفر)` : '';
                const highlightClass = zeroCount > 0 ? 'has-zeros' : '';
                buttons += `
                    <button class="expansion-index-btn ${highlightClass}" onclick="detGame.selectExpansionIndex(${i})">
                        ${label} ${i + 1} ${hint}
                    </button>
                `;
            }
            
            inputSection = `
                <div class="expansion-choice-container">
                    <div class="expansion-choice-title">اختر ${label} للتوسيع:</div>
                    <div class="expansion-index-buttons">
                        ${buttons}
                    </div>
                </div>
            `;
        } else if (step.answerType === 'auto-skip') {
            // Auto-skip for zero elements - shows briefly then auto-advances
            inputSection = `
                <div class="auto-skip-container">
                    <div class="auto-skip-message">
                        <span class="skip-icon">⏭️</span>
                        <span class="skip-text">العنصر = 0 → تخطي تلقائي</span>
                    </div>
                    <div class="skip-explanation">${step.explanation}</div>
                </div>
            `;
            // Auto-advance after brief display
            setTimeout(() => {
                if (this.steps[this.currentStep]?.answerType === 'auto-skip') {
                    this.userAnswers.push('0');
                    this.currentStep++;
                    if (this.currentStep >= this.totalSteps) {
                        this.winLevel();
                    } else {
                        this.renderGame();
                    }
                }
            }, 800);
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
                <div class="det-live-stats">
                    <span class="det-live-stars" id="det-live-stars">${this.getLiveStarsDisplay()}</span>
                    <span class="det-stats-info">💡${this.hintsUsed} ✖${this.stepCount}</span>
                </div>
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
                
                ${step.subMatrix && !step.useMinorExtended && step.answerType !== 'minor-extend' ? `
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
                
                ${step.useMinorExtended && this.extendedMinors && this.extendedMinors[step.minorIndex] ? `
                    <div class="step-sub-matrix extended-minor">
                        <div class="sub-matrix-label">المحدد الفرعي الموسّع:</div>
                        <div class="sub-matrix-grid" style="grid-template-columns: repeat(5, 1fr);">
                            ${this.extendedMinors[step.minorIndex].map((row, ri) => 
                                row.map((val, ci) => {
                                    let cellClass = 'sub-matrix-cell';
                                    if (ci >= 3) cellClass += ' extended-col';
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
                ${this.userAnswers.slice(0, this.currentStep).map((ans, i) => {
                    // تجاوز إذا كانت الخطوة غير موجودة
                    if (!this.steps[i]) return '';
                    
                    const stepType = this.steps[i].type;
                    let extraClass = '';
                    if (stepType === 'final') {
                        extraClass = 'final-step';
                    } else if (stepType.includes('minor-det') || stepType.includes('cofactor-result')) {
                        extraClass = 'important-step';
                    } else if (stepType === 'extend-matrix' || stepType.includes('minor-extend')) {
                        extraClass = 'extend-step';
                    } else if (stepType.includes('zero-skip')) {
                        extraClass = 'skip-step';
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
        
        // Setup minor-extend inputs navigation with Enter key
        if (step.answerType === 'minor-extend') {
            this.setupMinorExtendInputNavigation(step.minorIndex);
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
    
    setupMinorExtendInputNavigation(minorIndex) {
        const inputs = document.querySelectorAll('.minor-extend-input');
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
                        this.checkMinorExtendAnswer(minorIndex);
                    }
                }
            });
        });
        
        // Focus first input
        if (inputArray.length > 0) inputArray[0].focus();
    }
    
    checkExtendAnswer() {
        // Prevent Enter spam during transition
        if (this.isProcessingAnswer) {
            return;
        }
        
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
            this.isProcessingAnswer = true; // Lock to prevent spam
            this.userAnswers.push('✓');
            feedback.className = 'step-feedback correct';
            feedback.innerHTML = '✅ ممتاز! تم توسيع المصفوفة بشكل صحيح!';
            feedback.style.display = 'block';
            
            // حفظ المصفوفة الموسعة 3×5
            const [[a, b, c], [d, e, f], [g, h, i]] = this.matrix;
            this.extendedMatrix = [
                [a, b, c, a, b],
                [d, e, f, d, e],
                [g, h, i, g, h]
            ];
            this.isExtended = true;
            
            setTimeout(() => {
                this.currentStep++;
                this.isProcessingAnswer = false; // Unlock after transition
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
    
    checkMinorExtendAnswer(minorIndex) {
        // Prevent Enter spam during transition
        if (this.isProcessingAnswer) {
            return;
        }
        
        const inputs = document.querySelectorAll('.minor-extend-input');
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
            this.isProcessingAnswer = true; // Lock to prevent spam
            this.userAnswers.push('✓');
            feedback.className = 'step-feedback correct';
            feedback.innerHTML = '✅ ممتاز! تم توسيع المصفوفة الفرعية بشكل صحيح!';
            feedback.style.display = 'block';
            
            // حفظ المصفوفة الفرعية الموسعة
            const step = this.steps[this.currentStep];
            const [[a, b, c], [d, e, f], [g, h, i]] = step.subMatrix;
            if (!this.extendedMinors) this.extendedMinors = {};
            this.extendedMinors[minorIndex] = [
                [a, b, c, a, b],
                [d, e, f, d, e],
                [g, h, i, g, h]
            ];
            
            setTimeout(() => {
                this.currentStep++;
                this.isProcessingAnswer = false; // Unlock after transition
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
    
    // === NEW: Expansion Choice Methods ===
    selectExpansionType(type) {
        this.expansionType = type;
        this.userAnswers.push(`اختيار: ${type === 'row' ? 'صف' : 'عمود'}`);
        
        // Regenerate steps with the chosen type (will show index selection)
        this.steps = this.generateSteps4x4Plus(this.matrix, this.expansionType, null);
        this.totalSteps = this.steps.length;
        this.currentStep = 0;
        
        this.renderGame();
    }
    
    selectExpansionIndex(index) {
        this.expansionIndex = index;
        const label = this.expansionType === 'row' ? 'الصف' : 'العمود';
        this.userAnswers.push(`اختيار: ${label} ${index + 1}`);
        
        // Regenerate steps with both type and index (full expansion steps)
        this.steps = this.generateSteps4x4Plus(this.matrix, this.expansionType, this.expansionIndex);
        this.totalSteps = this.steps.length;
        this.currentStep = 0;
        
        this.renderGame();
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
        
        // تتبع استخدام التلميح (منفصل عن الأخطاء)
        this.hintsUsed++;
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
        
        const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        
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
