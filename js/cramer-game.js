/**
 * Cramer's Rule Game - Step-by-Step Educational Version
 * Players solve systems of equations using Cramer's Rule
 * with choice between Sarrus and Cofactor methods
 */

class CramerGame {
    constructor() {
        this.currentLevel = 1;
        this.totalLevels = 10;
        this.coefficients = null;
        this.constants = null;
        this.variables = null;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.stepCount = 0; // Wrong attempts (errors)
        this.hintsUsed = 0; // Hints used
        this.isPlaying = false;
        
        // Method selection
        this.selectedMethod = null; // 'sarrus' or 'cofactor'
        
        // Step data for current game
        this.steps = [];
        this.userAnswers = [];
        
        // Extended matrix state for Sarrus method
        this.extendedMatrices = {}; // Store extended versions of matrices
        
        // Tutorial tracking
        this.tutorialCompleted = {
            1: false, // 2x2
            2: false, // 3x3
            3: false  // 4x4
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
        if (n === 3) return this.det3x3(matrix);
        return this.detNxN(matrix);
    }
    
    det2x2(matrix) {
        const [[a, b], [c, d]] = matrix;
        return a * d - b * c;
    }
    
    det3x3(matrix) {
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
    
    // Create modified matrix for Cramer's rule (replace column with constants)
    createCramerMatrix(coefficients, constants, replaceCol) {
        const n = coefficients.length;
        const matrix = [];
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                if (j === replaceCol) {
                    row.push(constants[i]);
                } else {
                    row.push(coefficients[i][j]);
                }
            }
            matrix.push(row);
        }
        return matrix;
    }
    
    // ==================== STEP GENERATION ====================
    
    generateSteps2x2(coefficients, constants, variables) {
        const steps = [];
        const n = 2;
        
        // Step 1: Calculate det(A)
        const detA = this.det2x2(coefficients);
        const [[a, b], [c, d]] = coefficients;
        
        steps.push({
            type: 'det-main',
            prompt: `احسب المحدد الأصلي |A|: (${a} × ${d}) - (${b} × ${c}) = ؟`,
            matrix: coefficients,
            answer: detA,
            explanation: `(${a} × ${d}) - (${b} × ${c}) = ${a*d} - ${b*c} = ${detA}`
        });
        
        // For each variable, calculate its determinant and value
        for (let varIdx = 0; varIdx < n; varIdx++) {
            const varName = variables[varIdx];
            const cramerMatrix = this.createCramerMatrix(coefficients, constants, varIdx);
            const detVar = this.det2x2(cramerMatrix);
            const [[e, f], [g, h]] = cramerMatrix;
            
            // Step: Show the modified matrix
            steps.push({
                type: `show-matrix-${varIdx}`,
                prompt: `لإيجاد ${varName}، نستبدل العمود ${varIdx + 1} بالثوابت. ما هو المحدد |A${varIdx + 1}|؟`,
                subPrompt: `|A${varIdx + 1}| = (${e} × ${h}) - (${f} × ${g}) = ؟`,
                matrix: cramerMatrix,
                highlightCol: varIdx,
                answer: detVar,
                explanation: `(${e} × ${h}) - (${f} × ${g}) = ${e*h} - ${f*g} = ${detVar}`
            });
            
            // Step: Calculate variable value
            const varValue = detVar / detA;
            steps.push({
                type: `calc-var-${varIdx}`,
                prompt: `${varName} = |A${varIdx + 1}| ÷ |A| = ${detVar} ÷ ${detA} = ؟`,
                answer: varValue,
                explanation: `${varName} = ${detVar} ÷ ${detA} = ${varValue}`
            });
        }
        
        return steps;
    }
    
    generateSteps3x3(coefficients, constants, variables, method) {
        const steps = [];
        const n = 3;
        
        // Step 0: Method choice (if coming from UI)
        // This is handled separately in showMethodChoice
        
        // Step 1: Calculate det(A) using chosen method
        const detA = this.det3x3(coefficients);
        
        if (method === 'sarrus') {
            // Sarrus method steps for main determinant
            steps.push(...this.generateSarrusSteps(coefficients, 'A', detA));
        } else {
            // Cofactor method steps for main determinant
            steps.push(...this.generateCofactorSteps(coefficients, 'A', detA));
        }
        
        // For each variable
        for (let varIdx = 0; varIdx < n; varIdx++) {
            const varName = variables[varIdx];
            const cramerMatrix = this.createCramerMatrix(coefficients, constants, varIdx);
            const detVar = this.det3x3(cramerMatrix);
            
            // Show which column is replaced
            steps.push({
                type: `cramer-matrix-${varIdx}`,
                prompt: `لإيجاد ${varName}، نستبدل العمود ${varIdx + 1} بالثوابت [${constants.join(', ')}]`,
                matrix: cramerMatrix,
                highlightCol: varIdx,
                answer: 'continue',
                answerType: 'continue',
                explanation: `المصفوفة A${varIdx + 1} جاهزة للحساب`
            });
            
            // Calculate determinant of modified matrix
            if (method === 'sarrus') {
                steps.push(...this.generateSarrusSteps(cramerMatrix, `A${varIdx + 1}`, detVar));
            } else {
                steps.push(...this.generateCofactorSteps(cramerMatrix, `A${varIdx + 1}`, detVar));
            }
            
            // Calculate variable value
            const varValue = Math.round((detVar / detA) * 1000) / 1000; // Round to 3 decimals
            steps.push({
                type: `calc-var-${varIdx}`,
                prompt: `${varName} = |A${varIdx + 1}| ÷ |A| = ${detVar} ÷ ${detA} = ؟`,
                answer: varValue,
                explanation: `${varName} = ${detVar} ÷ ${detA} = ${varValue}`
            });
        }
        
        return steps;
    }
    
    generateSarrusSteps(matrix, matrixName, expectedDet) {
        const steps = [];
        const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
        
        // Extend matrix step
        steps.push({
            type: `extend-${matrixName}`,
            prompt: `وسّع المصفوفة |${matrixName}| بنسخ العمود الأول والثاني:`,
            matrix: matrix,
            answer: 'extend',
            answerType: 'extend',
            matrixName: matrixName,
            expectedCols: [[a, d, g], [b, e, h]],
            explanation: 'تم توسيع المصفوفة!',
            highlight: [],
            highlightClass: ''
        });
        
        // Down diagonals - positions on extended matrix (3x5)
        const down1 = a * e * i;
        const down2 = b * f * g;
        const down3 = c * d * h;
        
        steps.push({
            type: `down1-${matrixName}`,
            prompt: `|${matrixName}| القطر الهابط 1: ${a} × ${e} × ${i} = ؟`,
            matrix: matrix,
            useExtended: true,
            matrixName: matrixName,
            highlight: [[0, 0], [1, 1], [2, 2]],
            highlightClass: 'highlight-green',
            answer: down1,
            explanation: `${a} × ${e} × ${i} = ${down1}`
        });
        
        steps.push({
            type: `down2-${matrixName}`,
            prompt: `|${matrixName}| القطر الهابط 2: ${b} × ${f} × ${g} = ؟`,
            matrix: matrix,
            useExtended: true,
            matrixName: matrixName,
            highlight: [[0, 1], [1, 2], [2, 3]],
            highlightClass: 'highlight-green',
            answer: down2,
            explanation: `${b} × ${f} × ${g} = ${down2}`
        });
        
        steps.push({
            type: `down3-${matrixName}`,
            prompt: `|${matrixName}| القطر الهابط 3: ${c} × ${d} × ${h} = ؟`,
            matrix: matrix,
            useExtended: true,
            matrixName: matrixName,
            highlight: [[0, 2], [1, 3], [2, 4]],
            highlightClass: 'highlight-green',
            answer: down3,
            explanation: `${c} × ${d} × ${h} = ${down3}`
        });
        
        // Up diagonals
        const up1 = c * e * g;
        const up2 = a * f * h;
        const up3 = b * d * i;
        
        steps.push({
            type: `up1-${matrixName}`,
            prompt: `|${matrixName}| القطر الصاعد 1: ${c} × ${e} × ${g} = ؟`,
            matrix: matrix,
            useExtended: true,
            matrixName: matrixName,
            highlight: [[2, 0], [1, 1], [0, 2]],
            highlightClass: 'highlight-red',
            answer: up1,
            explanation: `${c} × ${e} × ${g} = ${up1}`
        });
        
        steps.push({
            type: `up2-${matrixName}`,
            prompt: `|${matrixName}| القطر الصاعد 2: ${a} × ${f} × ${h} = ؟`,
            matrix: matrix,
            useExtended: true,
            matrixName: matrixName,
            highlight: [[2, 1], [1, 2], [0, 3]],
            highlightClass: 'highlight-red',
            answer: up2,
            explanation: `${a} × ${f} × ${h} = ${up2}`
        });
        
        steps.push({
            type: `up3-${matrixName}`,
            prompt: `|${matrixName}| القطر الصاعد 3: ${b} × ${d} × ${i} = ؟`,
            matrix: matrix,
            useExtended: true,
            matrixName: matrixName,
            highlight: [[2, 2], [1, 3], [0, 4]],
            highlightClass: 'highlight-red',
            answer: up3,
            explanation: `${b} × ${d} × ${i} = ${up3}`
        });
        
        // Sum and final
        const downSum = down1 + down2 + down3;
        const upSum = up1 + up2 + up3;
        
        steps.push({
            type: `down-sum-${matrixName}`,
            prompt: `مجموع الأقطار الهابطة: ${down1} + ${down2} + ${down3} = ؟`,
            highlight: [],
            highlightClass: '',
            answer: downSum,
            explanation: `${down1} + ${down2} + ${down3} = ${downSum}`
        });
        
        steps.push({
            type: `up-sum-${matrixName}`,
            prompt: `مجموع الأقطار الصاعدة: ${up1} + ${up2} + ${up3} = ؟`,
            highlight: [],
            highlightClass: '',
            answer: upSum,
            explanation: `${up1} + ${up2} + ${up3} = ${upSum}`
        });
        
        steps.push({
            type: `det-result-${matrixName}`,
            prompt: `|${matrixName}| = ${downSum} - ${upSum} = ؟`,
            highlight: [],
            highlightClass: '',
            answer: expectedDet,
            explanation: `|${matrixName}| = ${downSum} - ${upSum} = ${expectedDet}`
        });
        
        return steps;
    }
    
    generateCofactorSteps(matrix, matrixName, expectedDet) {
        const steps = [];
        const n = matrix.length;
        
        // Expand along first row
        steps.push({
            type: `cofactor-intro-${matrixName}`,
            prompt: `سنوسع |${matrixName}| على الصف الأول. كم عنصر غير صفري؟`,
            matrix: matrix,
            answer: matrix[0].filter(x => x !== 0).length,
            explanation: `عدد العناصر غير الصفرية = ${matrix[0].filter(x => x !== 0).length}`
        });
        
        const cofactorResults = [];
        
        for (let j = 0; j < n; j++) {
            const sign = (j % 2 === 0) ? '+' : '-';
            const signValue = (j % 2 === 0) ? 1 : -1;
            const element = matrix[0][j];
            const minor = this.getMinor(matrix, 0, j);
            const minorDet = this.calculateDeterminant(minor);
            const cofactor = signValue * element * minorDet;
            
            // Sign step
            steps.push({
                type: `sign-${matrixName}-${j}`,
                prompt: `|${matrixName}|: إشارة الموقع (1, ${j + 1})؟`,
                answer: sign,
                answerType: 'sign',
                explanation: `(-1)^(1+${j + 1}) = ${sign}`
            });
            
            if (element === 0) {
                steps.push({
                    type: `skip-${matrixName}-${j}`,
                    prompt: `العنصر = 0، إذاً الناتج = ؟`,
                    answer: 0,
                    explanation: `0 × أي شيء = 0 ✓`
                });
                cofactorResults.push({ cofactor: 0, element: 0 });
                continue;
            }
            
            // Minor determinant (for 2x2 minors)
            if (minor.length === 2) {
                const [[a, b], [c, d]] = minor;
                steps.push({
                    type: `minor-${matrixName}-${j}`,
                    prompt: `المحدد الفرعي ${j + 1}: (${a}×${d}) − (${b}×${c}) = ؟`,
                    subMatrix: minor,
                    answer: minorDet,
                    explanation: `${a * d} − ${b * c} = ${minorDet}`
                });
            }
            
            // Cofactor value
            steps.push({
                type: `cofactor-${matrixName}-${j}`,
                prompt: `العامل ${j + 1}: ${sign === '-' ? '−' : ''}${element} × ${minorDet} = ؟`,
                answer: cofactor,
                explanation: `= ${cofactor}`
            });
            
            cofactorResults.push({ cofactor, element });
        }
        
        // Final sum
        const nonZero = cofactorResults.filter(c => c.element !== 0);
        const sumExpr = nonZero.map(c => c.cofactor >= 0 ? `+ ${c.cofactor}` : `${c.cofactor}`).join(' ').replace(/^\+ /, '');
        
        steps.push({
            type: `det-final-${matrixName}`,
            prompt: `|${matrixName}| = ${sumExpr} = ؟`,
            answer: expectedDet,
            explanation: `|${matrixName}| = ${expectedDet}`
        });
        
        return steps;
    }
    
    // ==================== GAME LOGIC ====================
    
    startLevel(levelNum) {
        const levelData = cramerLevels[levelNum];
        if (!levelData) return false;
        
        // التعليم اختياري الآن - يمكن للاعب الدخول مباشرة
        
        this.currentLevel = levelNum;
        this.coefficients = JSON.parse(JSON.stringify(levelData.coefficients));
        this.constants = [...levelData.constants];
        this.variables = [...levelData.variables];
        this.currentStep = 0;
        this.stepCount = 0;
        this.hintsUsed = 0;
        this.userAnswers = [];
        this.isPlaying = true;
        this.extendedMatrices = {};
        
        const n = this.coefficients.length;
        
        // For 2x2, go straight to steps
        if (n === 2) {
            this.selectedMethod = null;
            this.steps = this.generateSteps2x2(this.coefficients, this.constants, this.variables);
            this.totalSteps = this.steps.length;
            this.renderGame();
        } else {
            // For 3x3+, show method choice
            this.showMethodChoice();
        }
        
        return true;
    }
    
    showMethodChoice() {
        const container = document.getElementById('cramer-game-container');
        if (!container) return;
        
        const levelData = cramerLevels[this.currentLevel];
        const n = this.coefficients.length;
        const is4x4 = n >= 4;
        
        // For 4x4, only cofactor is available
        const sarrusButtonHTML = is4x4 ? `
            <div class="method-btn sarrus-btn disabled" title="طريقة ساروس تعمل فقط للمصفوفات 3×3">
                <div class="method-icon">📊</div>
                <div class="method-name">طريقة ساروس</div>
                <div class="method-desc">❌ لا تعمل لـ 4×4</div>
            </div>
        ` : `
            <button class="method-btn sarrus-btn" onclick="cramerGame.selectMethod('sarrus')">
                <div class="method-icon">📊</div>
                <div class="method-name">طريقة ساروس</div>
                <div class="method-desc">الأقطار - سريعة للحساب اليدوي</div>
            </button>
        `;
        
        container.innerHTML = `
            <div class="cramer-method-choice">
                <div class="method-header">
                    <button class="btn btn-back" onclick="cramerGame.exitToSelect()">
                        <span>→</span> رجوع
                    </button>
                    <h3>المستوى ${this.currentLevel}: ${levelData.description}</h3>
                </div>
                
                <div class="system-preview">
                    <div class="system-title">نظام المعادلات:</div>
                    <div class="system-equations">
                        ${this.renderSystemEquations()}
                    </div>
                </div>
                
                <div class="method-prompt">
                    <h4>${is4x4 ? '⚠️ للمصفوفات 4×4، نستخدم طريقة التوسيع فقط:' : '🎯 اختر طريقة حساب المحددات:'}</h4>
                </div>
                
                <div class="method-options">
                    ${sarrusButtonHTML}
                    
                    <button class="method-btn cofactor-btn ${is4x4 ? 'recommended' : ''}" onclick="cramerGame.selectMethod('cofactor')">
                        <div class="method-icon">🧮</div>
                        <div class="method-name">طريقة التوسيع</div>
                        <div class="method-desc">${is4x4 ? '✅ الطريقة المطلوبة' : 'Cofactor - منهجية ودقيقة'}</div>
                    </button>
                </div>
            </div>
        `;
    }
    
    renderSystemEquations() {
        const n = this.coefficients.length;
        let html = '';
        
        for (let i = 0; i < n; i++) {
            let eq = '';
            for (let j = 0; j < n; j++) {
                const coef = this.coefficients[i][j];
                const varName = this.variables[j];
                
                if (j === 0) {
                    if (coef === 1) eq += varName;
                    else if (coef === -1) eq += `-${varName}`;
                    else eq += `${coef}${varName}`;
                } else {
                    if (coef > 0) {
                        if (coef === 1) eq += ` + ${varName}`;
                        else eq += ` + ${coef}${varName}`;
                    } else if (coef < 0) {
                        if (coef === -1) eq += ` - ${varName}`;
                        else eq += ` - ${Math.abs(coef)}${varName}`;
                    }
                }
            }
            eq += ` = ${this.constants[i]}`;
            html += `<div class="equation">${eq}</div>`;
        }
        
        return html;
    }
    
    selectMethod(method) {
        this.selectedMethod = method;
        
        const n = this.coefficients.length;
        if (n === 3) {
            this.steps = this.generateSteps3x3(this.coefficients, this.constants, this.variables, method);
        } else {
            // 4x4 uses cofactor only
            this.selectedMethod = 'cofactor';
            this.steps = this.generateSteps4x4Plus(this.coefficients, this.constants, this.variables);
        }
        
        this.totalSteps = this.steps.length;
        this.renderGame();
    }
    
    generateSteps4x4Plus(coefficients, constants, variables) {
        // Similar to 3x3 cofactor but for larger matrices
        const steps = [];
        const n = coefficients.length;
        const detA = this.detNxN(coefficients);
        
        // Main determinant with cofactor expansion
        steps.push(...this.generateCofactorSteps4x4(coefficients, 'A', detA));
        
        // For each variable
        for (let varIdx = 0; varIdx < n; varIdx++) {
            const varName = variables[varIdx];
            const cramerMatrix = this.createCramerMatrix(coefficients, constants, varIdx);
            const detVar = this.detNxN(cramerMatrix);
            
            steps.push({
                type: `cramer-matrix-${varIdx}`,
                prompt: `لإيجاد ${varName}، نستبدل العمود ${varIdx + 1} بالثوابت`,
                matrix: cramerMatrix,
                highlightCol: varIdx,
                answer: 'continue',
                answerType: 'continue',
                explanation: `المصفوفة A${varIdx + 1} جاهزة`
            });
            
            steps.push(...this.generateCofactorSteps4x4(cramerMatrix, `A${varIdx + 1}`, detVar));
            
            const varValue = Math.round((detVar / detA) * 1000) / 1000;
            steps.push({
                type: `calc-var-${varIdx}`,
                prompt: `${varName} = |A${varIdx + 1}| ÷ |A| = ${detVar} ÷ ${detA} = ؟`,
                answer: varValue,
                explanation: `${varName} = ${varValue}`
            });
        }
        
        return steps;
    }
    
    generateCofactorSteps4x4(matrix, matrixName, expectedDet) {
        const steps = [];
        const n = matrix.length;
        
        // Find row/column with most zeros
        let bestRow = 0;
        let maxZeros = 0;
        for (let i = 0; i < n; i++) {
            const zeros = matrix[i].filter(x => x === 0).length;
            if (zeros > maxZeros) {
                maxZeros = zeros;
                bestRow = i;
            }
        }
        
        steps.push({
            type: `expand-row-${matrixName}`,
            prompt: `|${matrixName}|: سنوسع على الصف ${bestRow + 1} (يحتوي ${maxZeros} أصفار). عدد الحسابات المطلوبة؟`,
            answer: n - maxZeros,
            explanation: `${n} - ${maxZeros} أصفار = ${n - maxZeros} حسابات`
        });
        
        // For each non-zero element in the chosen row
        let runningSum = 0;
        const terms = [];
        
        for (let j = 0; j < n; j++) {
            const sign = ((bestRow + j) % 2 === 0) ? 1 : -1;
            const element = matrix[bestRow][j];
            
            if (element === 0) continue;
            
            const minor = this.getMinor(matrix, bestRow, j);
            const minorDet = this.det3x3(minor); // 4x4 -> 3x3 minor
            const cofactor = sign * element * minorDet;
            
            // Simplified steps for 4x4
            steps.push({
                type: `minor-4x4-${matrixName}-${j}`,
                prompt: `العنصر [${bestRow + 1},${j + 1}] = ${element}. المحدد الفرعي 3×3 = ؟`,
                subMatrix: minor,
                answer: minorDet,
                explanation: `det = ${minorDet}`
            });
            
            steps.push({
                type: `term-4x4-${matrixName}-${j}`,
                prompt: `المساهمة: ${sign === -1 ? '−' : '+'}${element} × ${minorDet} = ؟`,
                answer: cofactor,
                explanation: `= ${cofactor}`
            });
            
            terms.push(cofactor);
            runningSum += cofactor;
        }
        
        steps.push({
            type: `det-4x4-${matrixName}`,
            prompt: `|${matrixName}| = ${terms.join(' + ').replace(/\+ -/g, '- ')} = ؟`,
            answer: expectedDet,
            explanation: `|${matrixName}| = ${expectedDet}`
        });
        
        return steps;
    }
    
    checkStepAnswer(userAnswer) {
        const step = this.steps[this.currentStep];
        let isCorrect = false;
        
        if (step.answerType === 'sign') {
            const normalized = userAnswer.trim();
            isCorrect = normalized === step.answer;
        } else if (step.answerType === 'continue') {
            isCorrect = true;
        } else {
            const numAnswer = parseFloat(userAnswer);
            isCorrect = Math.abs(numAnswer - step.answer) < 0.01;
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
            this.stepCount++;
            this.showWrongFeedback(userAnswer, step);
        }
        
        return isCorrect;
    }
    
    showCorrectFeedback(step) {
        const feedback = document.getElementById('cramer-step-feedback');
        if (feedback) {
            feedback.className = 'step-feedback correct';
            feedback.innerHTML = `✅ صحيح! ${step.explanation}`;
            feedback.style.display = 'block';
        }
    }
    
    showWrongFeedback(userAnswer, step) {
        const feedback = document.getElementById('cramer-step-feedback');
        if (feedback) {
            feedback.className = 'step-feedback wrong';
            feedback.innerHTML = `❌ ${userAnswer} خطأ، حاول مرة أخرى!`;
            feedback.style.display = 'block';
        }
        
        const input = document.getElementById('cramer-answer-input');
        if (input) {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
            input.value = '';
            input.focus();
        }
    }
    
    winLevel() {
        // نظام 5 نجوم يعتمد على التلميحات والأخطاء
        // 0 نجوم: 5+ تلميحات أو 10+ أخطاء (مبالغ فيه)
        const hints = this.hintsUsed || 0;
        const errors = this.stepCount || 0;
        
        let hintPenalty = hints;
        let errorPenalty = Math.floor(errors / 2);
        
        const totalPenalty = Math.max(hintPenalty, errorPenalty);
        const stars = Math.max(0, 5 - totalPenalty);
        
        this.saveStars(this.currentLevel, stars);
        this.markLevelComplete(this.currentLevel);
        this.showWinScreen(stars);
    }
    
    // نظام التلميحات
    showHint() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        this.hintsUsed++;
        
        const feedback = document.getElementById('cramer-step-feedback');
        if (feedback) {
            feedback.className = 'step-feedback hint';
            feedback.innerHTML = `💡 التلميح: الإجابة = <strong>${step.answer}</strong>`;
            feedback.style.display = 'block';
        }
    }
    
    exitToSelect() {
        this.isPlaying = false;
        const container = document.getElementById('cramer-game-container');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
        
        if (typeof game !== 'undefined') {
            game.endCramerGame();
            game.showCramerLevelSelect();
        }
    }
    
    // ==================== UI RENDERING ====================
    
    renderGame() {
        const container = document.getElementById('cramer-game-container');
        if (!container) return;
        
        const step = this.steps[this.currentStep];
        const progress = (this.currentStep / this.totalSteps) * 100;
        
        // Build matrix display if present
        let matrixHtml = '';
        if (step.matrix) {
            matrixHtml = this.renderMatrix(step.matrix, step.highlightCol, step.useExtended, step.matrixName, step);
        }
        
        // Build sub-matrix display if present
        let subMatrixHtml = '';
        if (step.subMatrix) {
            subMatrixHtml = `
                <div class="cramer-sub-matrix">
                    <div class="sub-matrix-label">المحدد الفرعي:</div>
                    ${this.renderMatrix(step.subMatrix)}
                </div>
            `;
        }
        
        // Input section
        let inputSection = '';
        if (step.answerType === 'extend') {
            inputSection = this.renderExtendInput(step);
        } else if (step.answerType === 'sign') {
            inputSection = `
                <div class="step-input-row sign-input-row">
                    <button class="sign-btn positive" onclick="cramerGame.submitSignAnswer('+')">+</button>
                    <button class="sign-btn negative" onclick="cramerGame.submitSignAnswer('-')">−</button>
                </div>
            `;
        } else if (step.answerType === 'continue') {
            inputSection = `
                <button class="btn btn-primary" onclick="cramerGame.checkStepAnswer('continue')">
                    متابعة ←
                </button>
            `;
        } else {
            inputSection = `
                <div class="step-input-row">
                    <input type="number" id="cramer-answer-input" class="step-answer-input" 
                           placeholder="الإجابة" step="any" autofocus
                           onkeypress="if(event.key==='Enter') cramerGame.submitStep()">
                    <button class="btn btn-primary" onclick="cramerGame.submitStep()">تحقق</button>
                    <button class="btn btn-hint" onclick="cramerGame.showHint()" title="تلميح">💡</button>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="cramer-game-header">
                <button class="btn btn-back" onclick="cramerGame.exitToSelect()">
                    <span>→</span> رجوع
                </button>
                <h3>المستوى ${this.currentLevel} ${this.selectedMethod ? `(${this.selectedMethod === 'sarrus' ? 'ساروس' : 'التوسيع'})` : ''}</h3>
                <div class="cramer-step-counter">
                    الخطوة ${this.currentStep + 1} / ${this.totalSteps}
                </div>
            </div>
            
            <div class="cramer-progress-bar">
                <div class="cramer-progress-fill" style="width: ${progress}%"></div>
            </div>
            
            <div class="cramer-system-display">
                <div class="system-mini">${this.renderSystemEquations()}</div>
            </div>
            
            ${matrixHtml}
            
            <div class="cramer-step-area">
                <div class="step-prompt">${step.prompt}</div>
                ${step.subPrompt ? `<div class="step-sub-prompt">${step.subPrompt}</div>` : ''}
                
                ${subMatrixHtml}
                
                ${inputSection}
                
                <div id="cramer-step-feedback" class="step-feedback" style="display: none;"></div>
            </div>
            
            <div class="cramer-completed-steps">
                ${this.userAnswers.slice(-5).map((ans, i) => {
                    const stepIdx = this.currentStep - (this.userAnswers.length - i);
                    if (stepIdx < 0) return '';
                    return `
                        <div class="completed-step">
                            <span class="step-num">${stepIdx + 1}</span>
                            <span class="step-result">${this.steps[stepIdx].explanation}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Focus input and setup navigation
        setTimeout(() => {
            const input = document.getElementById('cramer-answer-input');
            if (input) {
                input.focus();
            } else {
                // For extend inputs, setup navigation and focus first
                const extendInputs = document.querySelectorAll('.extend-game-input');
                if (extendInputs.length > 0) {
                    this.setupExtendInputNavigation();
                    extendInputs[0].focus();
                }
            }
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
                        // Last input, find and click the submit button
                        const submitBtn = document.querySelector('.extend-game-container .btn-primary');
                        if (submitBtn) submitBtn.click();
                    }
                }
            });
        });
    }
    
    renderMatrix(matrix, highlightCol = -1, useExtended = false, matrixName = '', step = null) {
        const n = matrix.length;
        const cols = useExtended && n === 3 ? 5 : n;
        let displayMatrix = matrix;
        
        if (useExtended && n === 3 && this.extendedMatrices[matrixName]) {
            displayMatrix = this.extendedMatrices[matrixName];
        }
        
        // Get highlight info from step if available
        const highlightCells = step?.highlight || [];
        const highlightClass = step?.highlightClass || '';
        
        let html = `<div class="cramer-matrix-display ${useExtended ? 'extended-matrix' : ''}">`;
        html += `<div class="matrix-bars">|</div>`;
        html += `<div class="cramer-matrix-grid" style="grid-template-columns: repeat(${cols}, 1fr);">`;
        
        for (let i = 0; i < displayMatrix.length; i++) {
            for (let j = 0; j < displayMatrix[i].length; j++) {
                const isColHighlighted = j === highlightCol;
                const isExtendedCol = j >= n;
                const isCellHighlighted = highlightCells.some(([r, c]) => r === i && c === j);
                
                let classes = 'cramer-cell';
                if (isColHighlighted) classes += ' highlight-col';
                if (isExtendedCol) classes += ' extended-col';
                if (isCellHighlighted && highlightClass) classes += ` ${highlightClass}`;
                
                html += `<div class="${classes}">${displayMatrix[i][j]}</div>`;
            }
        }
        
        html += `</div>`;
        html += `<div class="matrix-bars">|</div>`;
        html += `</div>`;
        
        return html;
    }
    
    renderExtendInput(step) {
        const matrix = step.matrix;
        const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
        
        return `
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
                <button class="btn btn-primary" onclick="cramerGame.checkExtendAnswer('${step.matrixName}')">تحقق ✓</button>
            </div>
        `;
    }
    
    checkExtendAnswer(matrixName) {
        const inputs = document.querySelectorAll('.extend-game-input');
        const feedback = document.getElementById('cramer-step-feedback');
        let allCorrect = true;
        
        inputs.forEach(input => {
            const expected = parseInt(input.dataset.expected);
            const value = parseInt(input.value);
            
            if (value === expected) {
                input.classList.add('correct');
            } else {
                input.classList.add('incorrect');
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            // Save extended matrix
            const step = this.steps[this.currentStep];
            const [[a, b, c], [d, e, f], [g, h, i]] = step.matrix;
            this.extendedMatrices[matrixName] = [
                [a, b, c, a, b],
                [d, e, f, d, e],
                [g, h, i, g, h]
            ];
            
            this.userAnswers.push('✓');
            feedback.className = 'step-feedback correct';
            feedback.innerHTML = '✅ ممتاز! تم توسيع المصفوفة!';
            feedback.style.display = 'block';
            
            setTimeout(() => {
                this.currentStep++;
                this.renderGame();
            }, 800);
        } else {
            this.stepCount++;
            feedback.className = 'step-feedback wrong';
            feedback.innerHTML = '❌ تحقق من القيم!';
            feedback.style.display = 'block';
        }
    }
    
    submitStep() {
        const input = document.getElementById('cramer-answer-input');
        if (!input) return;
        
        const userAnswer = input.value.trim();
        if (userAnswer === '') {
            return;
        }
        
        this.checkStepAnswer(userAnswer);
    }
    
    submitSignAnswer(sign) {
        this.checkStepAnswer(sign);
    }
    
    showWinScreen(stars) {
        const container = document.getElementById('cramer-game-container');
        if (!container) return;
        
        const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        const levelData = cramerLevels[this.currentLevel];
        
        container.innerHTML = `
            <div class="cramer-win-screen">
                <div class="win-celebration">🎉</div>
                <h2>أحسنت!</h2>
                <div class="win-stars">${starsDisplay}</div>
                <div class="win-solution">
                    <h4>الحل:</h4>
                    <div class="solution-vars">
                        ${this.variables.map(v => `<span>${v} = ${levelData.answers[v]}</span>`).join('')}
                    </div>
                </div>
                <div class="win-stats">
                    <div>💡 التلميحات: ${this.hintsUsed}</div>
                    <div>✖ الأخطاء: ${this.stepCount}</div>
                </div>
                <div class="win-buttons">
                    ${this.currentLevel < 10 ? `
                        <button class="btn btn-primary" onclick="cramerGame.startLevel(${this.currentLevel + 1})">
                            المستوى التالي ←
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="cramerGame.exitToSelect()">
                        قائمة المستويات
                    </button>
                </div>
            </div>
        `;
    }
    
    exitToSelect() {
        if (typeof game !== 'undefined') {
            game.endCramerGame();
            game.showCramerLevelSelect();
        }
    }
    
    showTutorial(tutorialNum) {
        if (typeof cramerTutorial !== 'undefined') {
            cramerTutorial.show(tutorialNum);
        }
    }
    
    // ==================== PROGRESS ====================
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('cramerGameProgress');
            if (saved) {
                const data = JSON.parse(saved);
                this.completedLevels = data.completedLevels || [];
                this.levelStars = data.levelStars || {};
                this.tutorialCompleted = data.tutorialCompleted || { 1: false, 2: false, 3: false };
            }
        } catch (e) {
            console.log('Could not load Cramer progress');
        }
    }
    
    saveProgress() {
        try {
            localStorage.setItem('cramerGameProgress', JSON.stringify({
                completedLevels: this.completedLevels,
                levelStars: this.levelStars,
                tutorialCompleted: this.tutorialCompleted
            }));
        } catch (e) {
            console.log('Could not save Cramer progress');
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
    
    completeTutorial(tutorialNum) {
        this.tutorialCompleted[tutorialNum] = true;
        this.saveProgress();
    }
}

// Create global instance
const cramerGame = new CramerGame();
