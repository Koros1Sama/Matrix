/**
 * Inverse Matrix Game - لعبة المعكوس
 * Uses the same matrix manipulation mechanics as Gauss-Jordan
 * But with an augmented matrix [A | I] where we transform A to I
 * to get A^-1 on the right side, then multiply by B for solution
 */

class InverseGame {
    constructor() {
        this.currentLevel = 1;
        this.completedLevels = [];
        this.levelStars = {};
        this.steps = 0;
        this.phase = 1; // 1 = finding inverse, 2 = multiplication
        
        // Matrices
        this.augmentedMatrix = null; // [A | I]
        this.coefficientMatrix = null; // Original A
        this.constants = null; // B vector
        this.inverseMatrix = null; // A^-1 after phase 1
        
        this.history = [];
        this.score = 1000;
        
        // تتبع التلميحات للتقييم
        this.hintsUsed = 0;
        
        this.loadProgress();
    }
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('inverseGameProgress');
            if (saved) {
                const data = JSON.parse(saved);
                this.completedLevels = data.completedLevels || [];
                this.levelStars = data.levelStars || {};
            }
        } catch (e) {}
    }
    
    saveProgress() {
        try {
            localStorage.setItem('inverseGameProgress', JSON.stringify({
                completedLevels: this.completedLevels,
                levelStars: this.levelStars
            }));
        } catch (e) {}
    }
    
    getStars(levelNum) {
        return this.levelStars[levelNum] || 0;
    }
    
    completeTutorial(tutorialNum) {
        // Tutorial completion doesn't affect level unlocks for now
        console.log('Tutorial', tutorialNum, 'completed');
    }
    
    startLevel(levelNum) {
        const levelData = typeof inverseLevels !== 'undefined' ? inverseLevels[levelNum] : null;
        if (!levelData) {
            console.error('Level not found:', levelNum);
            return;
        }
        
        this.currentLevel = levelNum;
        this.steps = 0;
        this.score = 1000;
        this.phase = 1;
        this.history = [];
        
        // Store original data
        this.size = levelData.coefficients.length;
        this.coefficientMatrix = levelData.coefficients.map(row => [...row]);
        this.constants = [...levelData.constants];
        this.variables = levelData.variables;
        this.solution = levelData.solution;
        this.minSteps = levelData.minSteps;
        
        // Create augmented matrix [A | I]
        this.createAugmentedMatrix();
        
        // Render the game UI
        this.render();
    }
    
    createAugmentedMatrix() {
        const n = this.size;
        this.augmentedMatrix = [];
        
        for (let i = 0; i < n; i++) {
            const row = [];
            // Add coefficient matrix A
            for (let j = 0; j < n; j++) {
                row.push({ num: this.coefficientMatrix[i][j], den: 1 });
            }
            // Add identity matrix I
            for (let j = 0; j < n; j++) {
                row.push({ num: i === j ? 1 : 0, den: 1 });
            }
            this.augmentedMatrix.push(row);
        }
    }
    
    // Fraction operations
    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }
    
    simplify(num, den) {
        if (num === 0) return { num: 0, den: 1 };
        const g = this.gcd(num, den);
        num = num / g;
        den = den / g;
        if (den < 0) {
            num = -num;
            den = -den;
        }
        return { num, den };
    }
    
    add(a, b) {
        const num = a.num * b.den + b.num * a.den;
        const den = a.den * b.den;
        return this.simplify(num, den);
    }
    
    multiply(a, b) {
        const num = a.num * b.num;
        const den = a.den * b.den;
        return this.simplify(num, den);
    }
    
    // Row operations
    saveState() {
        this.history.push({
            matrix: this.augmentedMatrix.map(row => row.map(cell => ({ ...cell }))),
            score: this.score,
            steps: this.steps
        });
    }
    
    undo() {
        if (this.history.length === 0) return;
        const state = this.history.pop();
        this.augmentedMatrix = state.matrix;
        this.score = state.score;
        this.steps = state.steps;
        this.render();
    }
    
    swapRows(row1, row2) {
        if (row1 === row2) return;
        this.saveState();
        [this.augmentedMatrix[row1], this.augmentedMatrix[row2]] = 
            [this.augmentedMatrix[row2], this.augmentedMatrix[row1]];
        this.steps++;
        this.score = Math.max(0, this.score - 10);
        this.afterOperation();
    }
    
    scaleRow(row, num, den) {
        if (num === 0) return;
        this.saveState();
        const factor = { num, den };
        for (let j = 0; j < this.augmentedMatrix[row].length; j++) {
            this.augmentedMatrix[row][j] = this.multiply(this.augmentedMatrix[row][j], factor);
        }
        this.steps++;
        this.score = Math.max(0, this.score - 15);
        this.afterOperation();
    }
    
    addRows(targetRow, sourceRow, num, den) {
        if (targetRow === sourceRow) return;
        this.saveState();
        const factor = { num, den };
        for (let j = 0; j < this.augmentedMatrix[targetRow].length; j++) {
            const scaled = this.multiply(this.augmentedMatrix[sourceRow][j], factor);
            this.augmentedMatrix[targetRow][j] = this.add(this.augmentedMatrix[targetRow][j], scaled);
        }
        this.steps++;
        this.score = Math.max(0, this.score - 20);
        this.afterOperation();
    }
    
    afterOperation() {
        this.render();
        this.checkPhase1Complete();
    }
    
    // Check if left side of augmented matrix is identity
    isLeftSideIdentity() {
        const n = this.size;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const cell = this.augmentedMatrix[i][j];
                const expected = i === j ? 1 : 0;
                if (cell.num !== expected || (expected !== 0 && cell.den !== 1)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    checkPhase1Complete() {
        if (this.isLeftSideIdentity()) {
            // Extract inverse matrix from right side
            this.extractInverse();
            // Move to phase 2
            this.phase = 2;
            this.render();
        }
    }
    
    extractInverse() {
        const n = this.size;
        this.inverseMatrix = [];
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = n; j < 2 * n; j++) {
                row.push({ ...this.augmentedMatrix[i][j] });
            }
            this.inverseMatrix.push(row);
        }
    }
    
    // Calculate X = A^-1 × B
    calculateSolution() {
        const n = this.size;
        const solution = [];
        for (let i = 0; i < n; i++) {
            let sum = { num: 0, den: 1 };
            for (let j = 0; j < n; j++) {
                const product = this.multiply(this.inverseMatrix[i][j], { num: this.constants[j], den: 1 });
                sum = this.add(sum, product);
            }
            solution.push(sum);
        }
        return solution;
    }
    
    // Format fraction for display
    formatFraction(f) {
        if (f.den === 1) return f.num.toString();
        return `${f.num}/${f.den}`;
    }
    
    // Win level
    winLevel() {
        const stars = this.calculateStars();
        
        if (!this.completedLevels.includes(this.currentLevel)) {
            this.completedLevels.push(this.currentLevel);
        }
        
        if (!this.levelStars[this.currentLevel] || stars > this.levelStars[this.currentLevel]) {
            this.levelStars[this.currentLevel] = stars;
        }
        
        this.saveProgress();
        this.renderWinScreen(stars);
    }
    
    calculateStars() {
        // نظام 5 نجوم يعتمد على التلميحات والخطوات
        // 0 نجوم: 5+ تلميحات أو خطوات كثيرة جداً (مبالغ فيه)
        const hints = this.hintsUsed || 0;
        const ratio = this.steps / this.minSteps;
        
        // خصم من التلميحات
        let hintPenalty = hints;
        
        // خصم من الخطوات الزائدة
        let stepPenalty = 0;
        if (ratio > 2.0) stepPenalty = 5; // مبالغ فيه
        else if (ratio > 1.5) stepPenalty = 2;
        else if (ratio > 1.2) stepPenalty = 1;
        
        const totalPenalty = Math.max(hintPenalty, stepPenalty);
        return Math.max(0, 5 - totalPenalty);
    }
    
    // ==================== RENDERING ====================
    
    render() {
        const container = document.getElementById('inverse-game-container');
        if (!container) return;
        
        if (this.phase === 1) {
            this.renderPhase1(container);
        } else {
            this.renderPhase2(container);
        }
    }
    
    renderPhase1(container) {
        const n = this.size;
        
        container.innerHTML = `
            <div class="inverse-game">
                <div class="inv-game-header">
                    <button class="btn btn-back" onclick="inverseGame.exitToLevelSelect()">← رجوع</button>
                    <h3>المستوى ${this.currentLevel} - إيجاد المعكوس</h3>
                    <div class="inv-step-counter">الخطوات: ${this.steps}</div>
                </div>
                
                <div class="inv-goal-hint">
                    <div class="goal-title">🎯 الهدف: حوّل الجزء الأيسر إلى مصفوفة الوحدة I</div>
                </div>
                
                <div class="inv-matrix-display">
                    ${this.renderAugmentedMatrix()}
                </div>
                
                <div class="inv-controls">
                    <button class="btn btn-secondary" onclick="inverseGame.undo()" ${this.history.length === 0 ? 'disabled' : ''}>
                        ↶ تراجع
                    </button>
                    <button class="btn btn-primary" onclick="inverseGame.showScaleModal()">
                        ✕ ضرب صف
                    </button>
                    <button class="btn btn-primary" onclick="inverseGame.showAddModal()">
                        ➕ جمع صفوف
                    </button>
                </div>
                
                ${this.renderScaleModal()}
                ${this.renderAddModal()}
            </div>
        `;
    }
    
    renderAugmentedMatrix() {
        const n = this.size;
        let html = '<div class="inv-augmented-matrix">';
        
        for (let i = 0; i < n; i++) {
            html += '<div class="inv-aug-row">';
            html += `<span class="inv-row-label">R${i + 1}</span>`;
            
            // Left side (A → I)
            for (let j = 0; j < n; j++) {
                const cell = this.augmentedMatrix[i][j];
                const isPivot = i === j;
                const isCorrect = (isPivot && cell.num === 1 && cell.den === 1) || 
                                  (!isPivot && cell.num === 0);
                const className = `inv-cell ${isPivot ? 'pivot' : ''} ${isCorrect ? 'correct' : ''} ${cell.num === 0 ? 'zero' : ''}`;
                html += `<span class="${className}">${this.formatFraction(cell)}</span>`;
            }
            
            // Divider
            html += '<span class="inv-divider">|</span>';
            
            // Right side (I → A^-1)
            for (let j = n; j < 2 * n; j++) {
                const cell = this.augmentedMatrix[i][j];
                const className = `inv-cell identity ${cell.num === 0 ? 'zero' : ''}`;
                html += `<span class="${className}">${this.formatFraction(cell)}</span>`;
            }
            
            // Row action buttons
            html += `
                <div class="inv-row-actions">
                    <button class="inv-row-btn" onclick="inverseGame.quickScale(${i})" title="ضرب">✕</button>
                    <button class="inv-row-btn" onclick="inverseGame.quickAdd(${i})" title="جمع">➕</button>
                </div>
            `;
            
            html += '</div>';
        }
        
        html += '</div>';
        
        // Add labels
        html += `
            <div class="inv-matrix-labels">
                <span class="label-left">المصفوفة A → مصفوفة الوحدة I</span>
                <span class="label-right">مصفوفة الوحدة I → المعكوس A⁻¹</span>
            </div>
        `;
        
        return html;
    }
    
    renderScaleModal() {
        return `
            <div class="inv-modal" id="inv-scale-modal">
                <div class="inv-modal-content">
                    <h4>✕ ضرب صف في عدد</h4>
                    <div class="modal-field">
                        <label>الصف:</label>
                        <select id="inv-scale-row">
                            ${Array.from({length: this.size}, (_, i) => `<option value="${i}">R${i+1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="modal-field">
                        <label>المعامل k:</label>
                        <div class="fraction-input">
                            <input type="number" id="inv-scale-num" value="1">
                            <span>/</span>
                            <input type="number" id="inv-scale-den" value="1">
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn btn-secondary" onclick="inverseGame.closeModal()">إلغاء</button>
                        <button class="btn btn-primary" onclick="inverseGame.executeScale()">تنفيذ</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAddModal() {
        return `
            <div class="inv-modal" id="inv-add-modal">
                <div class="inv-modal-content">
                    <h4>➕ جمع صف بمضاعف صف آخر</h4>
                    <div class="modal-field">
                        <label>الصف الهدف:</label>
                        <select id="inv-add-target">
                            ${Array.from({length: this.size}, (_, i) => `<option value="${i}">R${i+1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="modal-field">
                        <label>+ k ×</label>
                        <select id="inv-add-source">
                            ${Array.from({length: this.size}, (_, i) => `<option value="${i}">R${i+1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="modal-field">
                        <label>المعامل k:</label>
                        <div class="fraction-input">
                            <input type="number" id="inv-add-num" value="-1">
                            <span>/</span>
                            <input type="number" id="inv-add-den" value="1">
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="btn btn-secondary" onclick="inverseGame.closeModal()">إلغاء</button>
                        <button class="btn btn-primary" onclick="inverseGame.executeAdd()">تنفيذ</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPhase2(container) {
        const solution = this.calculateSolution();
        
        container.innerHTML = `
            <div class="inverse-game">
                <div class="inv-game-header">
                    <h3>🎉 المعكوس جاهز! الآن نحسب الحل</h3>
                </div>
                
                <div class="inv-phase2-content">
                    <div class="formula-box">
                        <span class="formula-title">X = A⁻¹ × B</span>
                    </div>
                    
                    <div class="multiplication-display">
                        <div class="mult-matrix">
                            <div class="mult-label">A⁻¹</div>
                            ${this.renderInverseMatrix()}
                        </div>
                        <span class="mult-sign">×</span>
                        <div class="mult-vector">
                            <div class="mult-label">B</div>
                            ${this.renderConstantsVector()}
                        </div>
                        <span class="mult-sign">=</span>
                        <div class="mult-vector result">
                            <div class="mult-label">X</div>
                            ${this.renderSolutionVector(solution)}
                        </div>
                    </div>
                    
                    <div class="solution-display">
                        <h4>✅ الحل النهائي:</h4>
                        ${this.variables.map((v, i) => 
                            `<span class="solution-var">${v} = ${this.formatFraction(solution[i])}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="phase2-buttons">
                        <button class="btn btn-primary btn-lg" onclick="inverseGame.winLevel()">
                            تم! ✓
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderInverseMatrix() {
        const n = this.size;
        let html = '<div class="mini-matrix">';
        for (let i = 0; i < n; i++) {
            html += '<div class="mini-row">';
            for (let j = 0; j < n; j++) {
                html += `<span class="mini-cell">${this.formatFraction(this.inverseMatrix[i][j])}</span>`;
            }
            html += '</div>';
        }
        html += '</div>';
        return html;
    }
    
    renderConstantsVector() {
        let html = '<div class="mini-matrix col">';
        for (const c of this.constants) {
            html += `<div class="mini-row"><span class="mini-cell const">${c}</span></div>`;
        }
        html += '</div>';
        return html;
    }
    
    renderSolutionVector(solution) {
        let html = '<div class="mini-matrix col">';
        for (const s of solution) {
            html += `<div class="mini-row"><span class="mini-cell result-val">${this.formatFraction(s)}</span></div>`;
        }
        html += '</div>';
        return html;
    }
    
    renderWinScreen(stars) {
        const container = document.getElementById('inverse-game-container');
        if (!container) return;
        
        const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        
        container.innerHTML = `
            <div class="inverse-game">
                <div class="inv-win-screen">
                    <div class="win-icon">🎉</div>
                    <h2>أحسنت!</h2>
                    <div class="win-stars">${starsDisplay}</div>
                    <p>أكملت المستوى ${this.currentLevel} في ${this.steps} خطوة</p>
                    <div class="win-buttons">
                        <button class="btn btn-secondary" onclick="inverseGame.exitToLevelSelect()">
                            قائمة المستويات
                        </button>
                        ${this.currentLevel < 10 ? `
                            <button class="btn btn-primary" onclick="inverseGame.startLevel(${this.currentLevel + 1})">
                                المستوى التالي ▶
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // ==================== MODALS ====================
    
    showScaleModal() {
        document.getElementById('inv-scale-modal').classList.add('active');
    }
    
    showAddModal() {
        document.getElementById('inv-add-modal').classList.add('active');
    }
    
    closeModal() {
        document.querySelectorAll('.inv-modal').forEach(m => m.classList.remove('active'));
    }
    
    quickScale(row) {
        document.getElementById('inv-scale-row').value = row;
        this.showScaleModal();
    }
    
    quickAdd(row) {
        document.getElementById('inv-add-target').value = row;
        this.showAddModal();
    }
    
    executeScale() {
        const row = parseInt(document.getElementById('inv-scale-row').value);
        const num = parseInt(document.getElementById('inv-scale-num').value) || 1;
        const den = parseInt(document.getElementById('inv-scale-den').value) || 1;
        
        if (num === 0 || den === 0) {
            alert('المعامل لا يمكن أن يكون صفراً');
            return;
        }
        
        this.closeModal();
        this.scaleRow(row, num, den);
    }
    
    executeAdd() {
        const target = parseInt(document.getElementById('inv-add-target').value);
        const source = parseInt(document.getElementById('inv-add-source').value);
        const num = parseInt(document.getElementById('inv-add-num').value) || 0;
        const den = parseInt(document.getElementById('inv-add-den').value) || 1;
        
        if (target === source) {
            alert('لا يمكن جمع صف بنفسه');
            return;
        }
        
        if (den === 0) {
            alert('المقام لا يمكن أن يكون صفراً');
            return;
        }
        
        this.closeModal();
        this.addRows(target, source, num, den);
    }
    
    exitToLevelSelect() {
        if (typeof game !== 'undefined') {
            game.endInverseGame();
            game.showInverseLevelSelect();
        }
    }
}

// Create global instance
const inverseGame = new InverseGame();
