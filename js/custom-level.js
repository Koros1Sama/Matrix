/**
 * Custom Level Manager - مدير المرحلة المخصصة
 * يتيح للاعب إنشاء مرحلة بإعداداته الخاصة
 */

const CustomLevelManager = {
    currentGameType: null,
    selectedSize: null,
    modal: null,
    
    // الأحجام المتاحة لكل نوع لعبة
    sizeConfigs: {
        gauss: {
            sizes: [[2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
            labels: ['2×2', '3×3', '4×4', '5×5', '6×6'],  // عرض حسب عدد المتغيرات
            hasAugmented: true,
            hasConstants: true
        },
        determinant: {
            sizes: [[2, 2], [3, 3], [4, 4], [5, 5]],
            labels: ['2×2', '3×3', '4×4', '5×5'],
            hasAugmented: false,
            hasConstants: false
        },
        cramer: {
            sizes: [[2, 2], [3, 3], [4, 4]],
            labels: ['2×2', '3×3', '4×4'],
            hasAugmented: false,
            hasConstants: true  // عمود الثوابت منفصل
        },
        inverse: {
            sizes: [[2, 2], [3, 3], [4, 4]],
            labels: ['2×2', '3×3', '4×4'],
            hasAugmented: false,
            hasConstants: true  // عمود الثوابت منفصل
        }
    },
    
    // أسماء المتغيرات
    variableNames: ['x', 'y', 'z', 'w', 'a', 'b', 'c', 'd', 'e', 'f'],
    
    /**
     * تهيئة المدير
     */
    init() {
        this.createModal();
        this.bindEvents();
    },
    
    // وضع الإدخال الحالي: 'matrix' أو 'equations'
    inputMode: 'matrix',
    
    /**
     * إنشاء نافذة الإعدادات
     */
    createModal() {
        const modalHTML = `
            <div id="custom-level-modal" class="custom-level-modal">
                <div class="custom-level-content">
                    <div class="custom-level-header">
                        <h3><span>⚙️</span> <span id="custom-modal-title">إنشاء مرحلة مخصصة</span></h3>
                        <button class="custom-close-btn" onclick="CustomLevelManager.closeModal()">&times;</button>
                    </div>
                    
                    <div class="size-selector">
                        <label>📐 اختر حجم المصفوفة:</label>
                        <div class="size-options" id="size-options"></div>
                    </div>
                    
                    <!-- تبويبات وضع الإدخال -->
                    <div class="input-mode-tabs" id="input-mode-tabs">
                        <button class="input-tab active" data-mode="matrix" onclick="CustomLevelManager.switchInputMode('matrix')">
                            🔢 المصفوفة
                        </button>
                        <button class="input-tab" data-mode="equations" onclick="CustomLevelManager.switchInputMode('equations')">
                            📝 المعادلات
                        </button>
                    </div>
                    
                    <div class="matrix-input-section">
                        <div class="custom-hint" id="custom-hint">أدخل أرقاماً صحيحة أو كسور (مثال: 3، -2، 1/2)</div>
                        
                        <!-- وضع المصفوفة -->
                        <div class="input-view matrix-view" id="matrix-view">
                            <div class="matrix-inputs-container" id="matrix-inputs"></div>
                            <div class="variables-display" id="variables-display"></div>
                        </div>
                        
                        <!-- وضع المعادلات -->
                        <div class="input-view equations-view" id="equations-view" style="display: none;">
                            <div class="equations-inputs-container" id="equations-inputs"></div>
                        </div>
                    </div>
                    
                    <div class="custom-error-message" id="custom-error"></div>
                    
                    <div class="custom-level-actions">
                        <button class="btn-cancel-custom" onclick="CustomLevelManager.closeModal()">إلغاء</button>
                        <button class="btn-start-custom" id="btn-start-custom" onclick="CustomLevelManager.startLevel()">
                            🎮 ابدأ اللعب!
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('custom-level-modal');
    },
    
    /**
     * ربط الأحداث
     */
    bindEvents() {
        // إغلاق النافذة عند النقر خارجها
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // إغلاق بمفتاح Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    },
    
    /**
     * فتح النافذة لنوع لعبة معين
     */
    openModal(gameType) {
        this.currentGameType = gameType;
        const config = this.sizeConfigs[gameType];
        
        // تحديث العنوان حسب نوع اللعبة
        const titles = {
            gauss: 'مرحلة مخصصة - جاوس',
            determinant: 'مرحلة مخصصة - المحددات',
            cramer: 'مرحلة مخصصة - كرامر',
            inverse: 'مرحلة مخصصة - المعكوس'
        };
        document.getElementById('custom-modal-title').textContent = titles[gameType] || 'مرحلة مخصصة';
        
        // إنشاء خيارات الحجم
        this.createSizeOptions(config);
        
        // اختيار الحجم الافتراضي
        this.selectSize(0);
        
        // إظهار/إخفاء تبويبات المعادلات (غير متوفرة للمحددات)
        const tabsContainer = document.getElementById('input-mode-tabs');
        if (gameType === 'determinant') {
            tabsContainer.style.display = 'none';
            this.inputMode = 'matrix';
        } else {
            tabsContainer.style.display = 'flex';
            this.switchInputMode('matrix');
        }
        
        // إظهار النافذة
        this.modal.classList.add('active');
    },
    
    /**
     * إغلاق النافذة
     */
    closeModal() {
        this.modal.classList.remove('active');
        this.currentGameType = null;
        this.selectedSize = null;
        document.getElementById('custom-error').classList.remove('show');
    },
    
    /**
     * إنشاء خيارات الحجم
     */
    createSizeOptions(config) {
        const container = document.getElementById('size-options');
        container.innerHTML = '';
        
        config.labels.forEach((label, index) => {
            const btn = document.createElement('button');
            btn.className = 'size-option';
            btn.textContent = label;
            btn.onclick = () => this.selectSize(index);
            container.appendChild(btn);
        });
    },
    
    /**
     * اختيار حجم معين
     */
    selectSize(index) {
        const config = this.sizeConfigs[this.currentGameType];
        this.selectedSize = config.sizes[index];
        
        // تحديث حالة الأزرار
        document.querySelectorAll('.size-option').forEach((btn, i) => {
            btn.classList.toggle('selected', i === index);
        });
        
        // إنشاء حقول الإدخال
        this.createMatrixInputs();
    },
    
    /**
     * إنشاء حقول إدخال المصفوفة
     */
    createMatrixInputs() {
        const container = document.getElementById('matrix-inputs');
        const varsContainer = document.getElementById('variables-display');
        container.innerHTML = '';
        varsContainer.innerHTML = '';
        
        const config = this.sizeConfigs[this.currentGameType];
        const [rows, cols] = this.selectedSize;
        
        // جاوس: مصفوفة موسعة (N × N+1)
        // كرامر/المعكوس: مصفوفة معاملات (N × N) + عمود ثوابت منفصل
        // المحددات: مصفوفة فقط (N × N)
        
        const isGauss = this.currentGameType === 'gauss';
        const hasConstants = config.hasConstants;
        const coeffCols = isGauss ? cols - 1 : rows;  // عدد أعمدة المعاملات
        
        // إنشاء صفوف المصفوفة
        for (let i = 0; i < rows; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'matrix-input-row';
            
            // أعمدة المعاملات
            for (let j = 0; j < coeffCols; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'matrix-input-cell coeff-cell';
                input.dataset.row = i;
                input.dataset.col = j;
                input.dataset.type = 'coeff';
                input.placeholder = '0';
                input.addEventListener('input', () => this.validateInput(input));
                input.addEventListener('keydown', (e) => this.handleInputKeydown(e, i, j, rows, coeffCols + (hasConstants ? 1 : 0)));
                rowDiv.appendChild(input);
            }
            
            // إضافة الخط الفاصل وعمود الثوابت
            if (hasConstants) {
                const divider = document.createElement('div');
                divider.className = 'matrix-input-divider';
                rowDiv.appendChild(divider);
                
                const constInput = document.createElement('input');
                constInput.type = 'text';
                constInput.className = 'matrix-input-cell const-cell';
                constInput.dataset.row = i;
                constInput.dataset.col = coeffCols;
                constInput.dataset.type = 'const';
                constInput.placeholder = '0';
                constInput.addEventListener('input', () => this.validateInput(constInput));
                constInput.addEventListener('keydown', (e) => this.handleInputKeydown(e, i, coeffCols, rows, coeffCols + 1));
                rowDiv.appendChild(constInput);
            }
            
            container.appendChild(rowDiv);
        }
        
        // عرض المتغيرات
        if (hasConstants) {
            for (let i = 0; i < coeffCols; i++) {
                const varLabel = document.createElement('span');
                varLabel.className = 'variable-label';
                varLabel.textContent = this.variableNames[i];
                varsContainer.appendChild(varLabel);
            }
        }
        
        // إنشاء المعادلات أيضاً (إذا لم تكن محددات)
        if (hasConstants) {
            this.createEquationsInputs();
        }
    },
    
    /**
     * تبديل وضع الإدخال
     */
    switchInputMode(mode) {
        this.inputMode = mode;
        
        // تحديث التبويبات
        document.querySelectorAll('.input-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        
        // تحديث العرض
        const matrixView = document.getElementById('matrix-view');
        const equationsView = document.getElementById('equations-view');
        
        if (mode === 'matrix') {
            matrixView.style.display = 'block';
            equationsView.style.display = 'none';
            // تزامن من المعادلات إلى المصفوفة
            this.syncEquationsToMatrix();
        } else {
            matrixView.style.display = 'none';
            equationsView.style.display = 'block';
            // تزامن من المصفوفة إلى المعادلات
            this.syncMatrixToEquations();
        }
    },
    
    /**
     * إنشاء حقول المعادلات
     */
    createEquationsInputs() {
        const container = document.getElementById('equations-inputs');
        if (!container) return;
        
        container.innerHTML = '';
        
        const config = this.sizeConfigs[this.currentGameType];
        const [rows, cols] = this.selectedSize;
        const isGauss = this.currentGameType === 'gauss';
        const coeffCols = isGauss ? cols - 1 : rows;
        
        for (let i = 0; i < rows; i++) {
            const eqDiv = document.createElement('div');
            eqDiv.className = 'equation-input-row';
            
            for (let j = 0; j < coeffCols; j++) {
                // إشارة + أو -
                if (j > 0) {
                    const sign = document.createElement('span');
                    sign.className = 'eq-operator';
                    sign.textContent = '+';
                    eqDiv.appendChild(sign);
                }
                
                // المعامل
                const coefInput = document.createElement('input');
                coefInput.type = 'text';
                coefInput.className = 'eq-coef-input';
                coefInput.dataset.row = i;
                coefInput.dataset.col = j;
                coefInput.placeholder = '0';
                coefInput.addEventListener('input', () => this.onEquationInputChange(coefInput));
                eqDiv.appendChild(coefInput);
                
                // اسم المتغير
                const varLabel = document.createElement('span');
                varLabel.className = 'eq-var-label';
                varLabel.textContent = this.variableNames[j];
                eqDiv.appendChild(varLabel);
            }
            
            // علامة =
            const equals = document.createElement('span');
            equals.className = 'eq-equals';
            equals.textContent = '=';
            eqDiv.appendChild(equals);
            
            // الثابت
            const constInput = document.createElement('input');
            constInput.type = 'text';
            constInput.className = 'eq-const-input';
            constInput.dataset.row = i;
            constInput.dataset.isConst = 'true';
            constInput.placeholder = '0';
            constInput.addEventListener('input', () => this.onEquationInputChange(constInput));
            eqDiv.appendChild(constInput);
            
            container.appendChild(eqDiv);
        }
    },
    
    /**
     * عند تغيير قيمة في المعادلة - تزامن مباشر
     */
    onEquationInputChange(input) {
        const row = parseInt(input.dataset.row);
        const isConst = input.dataset.isConst === 'true';
        const col = isConst ? null : parseInt(input.dataset.col);
        
        // البحث عن الخلية المقابلة في المصفوفة
        const config = this.sizeConfigs[this.currentGameType];
        const [rows, cols] = this.selectedSize;
        const isGauss = this.currentGameType === 'gauss';
        const coeffCols = isGauss ? cols - 1 : rows;
        
        let targetCol = isConst ? coeffCols : col;
        const matrixInput = document.querySelector(`.matrix-input-cell[data-row="${row}"][data-col="${targetCol}"]`);
        
        if (matrixInput) {
            matrixInput.value = input.value;
            this.validateInput(matrixInput);
        }
        
        this.validateInput(input);
    },
    
    /**
     * تزامن من المصفوفة إلى المعادلات
     */
    syncMatrixToEquations() {
        const config = this.sizeConfigs[this.currentGameType];
        const [rows, cols] = this.selectedSize;
        const isGauss = this.currentGameType === 'gauss';
        const coeffCols = isGauss ? cols - 1 : rows;
        
        for (let i = 0; i < rows; i++) {
            // المعاملات
            for (let j = 0; j < coeffCols; j++) {
                const matrixInput = document.querySelector(`.matrix-input-cell[data-row="${i}"][data-col="${j}"]`);
                const eqInput = document.querySelector(`.eq-coef-input[data-row="${i}"][data-col="${j}"]`);
                if (matrixInput && eqInput) {
                    eqInput.value = matrixInput.value;
                }
            }
            
            // الثوابت
            const constMatrixInput = document.querySelector(`.matrix-input-cell[data-row="${i}"][data-col="${coeffCols}"]`);
            const constEqInput = document.querySelector(`.eq-const-input[data-row="${i}"]`);
            if (constMatrixInput && constEqInput) {
                constEqInput.value = constMatrixInput.value;
            }
        }
    },
    
    /**
     * تزامن من المعادلات إلى المصفوفة
     */
    syncEquationsToMatrix() {
        const config = this.sizeConfigs[this.currentGameType];
        const [rows, cols] = this.selectedSize;
        const isGauss = this.currentGameType === 'gauss';
        const coeffCols = isGauss ? cols - 1 : rows;
        
        for (let i = 0; i < rows; i++) {
            // المعاملات
            for (let j = 0; j < coeffCols; j++) {
                const eqInput = document.querySelector(`.eq-coef-input[data-row="${i}"][data-col="${j}"]`);
                const matrixInput = document.querySelector(`.matrix-input-cell[data-row="${i}"][data-col="${j}"]`);
                if (eqInput && matrixInput) {
                    matrixInput.value = eqInput.value;
                    this.validateInput(matrixInput);
                }
            }
            
            // الثوابت
            const constEqInput = document.querySelector(`.eq-const-input[data-row="${i}"]`);
            const constMatrixInput = document.querySelector(`.matrix-input-cell[data-row="${i}"][data-col="${coeffCols}"]`);
            if (constEqInput && constMatrixInput) {
                constMatrixInput.value = constEqInput.value;
                this.validateInput(constMatrixInput);
            }
        }
    },
    
    /**
     * التعامل مع مفاتيح الإدخال
     */
    handleInputKeydown(e, row, col, maxRows, maxCols) {
        const inputs = document.querySelectorAll('.matrix-input-cell');
        const currentIndex = row * maxCols + col;
        
        switch (e.key) {
            case 'ArrowRight':
                if (col > 0) inputs[currentIndex - 1]?.focus();
                break;
            case 'ArrowLeft':
                if (col < maxCols - 1) inputs[currentIndex + 1]?.focus();
                break;
            case 'ArrowUp':
                if (row > 0) inputs[currentIndex - maxCols]?.focus();
                break;
            case 'ArrowDown':
                if (row < maxRows - 1) inputs[currentIndex + maxCols]?.focus();
                break;
            case 'Enter':
                e.preventDefault();
                if (col < maxCols - 1) {
                    inputs[currentIndex + 1]?.focus();
                } else if (row < maxRows - 1) {
                    inputs[(row + 1) * maxCols]?.focus();
                }
                break;
        }
    },
    
    /**
     * التحقق من صحة الإدخال
     */
    validateInput(input) {
        const value = input.value.trim();
        
        // السماح بالفارغ
        if (value === '' || value === '-') {
            input.classList.remove('invalid');
            return true;
        }
        
        // التحقق من الأرقام والكسور
        const isValid = /^-?\d+$/.test(value) || /^-?\d+\/\d+$/.test(value);
        input.classList.toggle('invalid', !isValid);
        return isValid;
    },
    
    /**
     * تحليل القيمة (عدد أو كسر)
     */
    parseValue(valueStr) {
        const value = valueStr.trim();
        if (value === '' || value === '-') return 0;
        
        // كسر
        if (value.includes('/')) {
            const [num, den] = value.split('/').map(Number);
            if (den === 0) return NaN;
            return num / den;
        }
        
        return parseInt(value, 10);
    },
    
    /**
     * الحصول على بيانات المصفوفة
     */
    getMatrixData() {
        const config = this.sizeConfigs[this.currentGameType];
        const [rows, cols] = this.selectedSize;
        
        const isGauss = this.currentGameType === 'gauss';
        const hasConstants = config.hasConstants;
        const coeffCols = isGauss ? cols - 1 : rows;
        
        const coefficients = [];
        const constants = [];
        let hasError = false;
        
        for (let i = 0; i < rows; i++) {
            const coeffRow = [];
            
            // جمع المعاملات
            for (let j = 0; j < coeffCols; j++) {
                const input = document.querySelector(`.matrix-input-cell[data-row="${i}"][data-col="${j}"]`);
                if (!input) continue;
                
                const value = this.parseValue(input.value);
                if (isNaN(value)) {
                    input.classList.add('invalid');
                    hasError = true;
                }
                coeffRow.push(value);
            }
            coefficients.push(coeffRow);
            
            // جمع الثوابت
            if (hasConstants) {
                const constInput = document.querySelector(`.matrix-input-cell[data-row="${i}"][data-col="${coeffCols}"]`);
                if (constInput) {
                    const constValue = this.parseValue(constInput.value);
                    if (isNaN(constValue)) {
                        constInput.classList.add('invalid');
                        hasError = true;
                    }
                    constants.push(constValue);
                }
            }
        }
        
        if (hasError) return null;
        
        // لجاوس: إرجاع مصفوفة موسعة
        if (isGauss) {
            const augmented = coefficients.map((row, i) => [...row, constants[i]]);
            return { matrix: augmented, coefficients, constants };
        }
        
        // للباقي: إرجاع المعاملات والثوابت منفصلة
        return { matrix: coefficients, coefficients, constants };
    },
    
    /**
     * بدء المرحلة المخصصة
     */
    startLevel() {
        const data = this.getMatrixData();
        
        if (!data) {
            this.showError('يرجى التحقق من الأرقام المدخلة');
            return;
        }
        
        const config = this.sizeConfigs[this.currentGameType];
        const [rows] = this.selectedSize;
        
        // إنشاء بيانات المرحلة
        let levelData;
        
        switch (this.currentGameType) {
            case 'gauss':
                levelData = {
                    id: 'custom',
                    name: 'مرحلة مخصصة',
                    size: this.selectedSize,
                    variables: this.variableNames.slice(0, this.selectedSize[1] - 1),
                    matrix: data.matrix,
                    solution: null,
                    minSteps: rows * 2,
                    isCustom: true
                };
                break;
                
            case 'determinant':
                levelData = {
                    name: 'مرحلة مخصصة',
                    description: `مصفوفة ${rows}×${rows} مخصصة`,
                    matrix: data.matrix,
                    answer: null,
                    minSteps: rows,
                    requiresSimplification: rows > 3,
                    requiredOperations: [],
                    isCustom: true
                };
                break;
                
            case 'cramer':
                levelData = {
                    id: 'custom',
                    size: rows,
                    description: 'مرحلة مخصصة',
                    coefficients: data.coefficients,
                    constants: data.constants,
                    variables: this.variableNames.slice(0, rows),
                    answers: null,
                    isCustom: true
                };
                break;
                
            case 'inverse':
                levelData = {
                    id: 'custom',
                    size: rows,
                    description: 'مرحلة مخصصة',
                    coefficients: data.coefficients,
                    constants: data.constants,
                    variables: this.variableNames.slice(0, rows),
                    solution: null,
                    minSteps: rows * 4,
                    isCustom: true
                };
                break;
        }
        
        // حفظ نوع اللعبة قبل إغلاق النافذة (لأن closeModal تعيد تعيينه)
        const gameType = this.currentGameType;
        
        // إغلاق النافذة وبدء اللعبة
        this.closeModal();
        this.launchGame(levelData, gameType);
    },
    
    /**
     * إطلاق اللعبة
     */
    launchGame(levelData, gameType) {
        switch (gameType) {
            case 'gauss':
                if (typeof game !== 'undefined') {
                    game.startCustomLevel(levelData);
                }
                break;
                
            case 'determinant':
                if (typeof game !== 'undefined') {
                    game.startCustomDeterminantLevel(levelData);
                }
                break;
                
            case 'cramer':
                if (typeof game !== 'undefined') {
                    game.startCustomCramerLevel(levelData);
                }
                break;
                
            case 'inverse':
                if (typeof game !== 'undefined') {
                    game.startCustomInverseLevel(levelData);
                }
                break;
        }
    },
    
    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        const errorEl = document.getElementById('custom-error');
        errorEl.textContent = message;
        errorEl.classList.add('show');
        
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 3000);
    },
    
    /**
     * إنشاء زر المرحلة المخصصة
     */
    createCustomLevelButton(gameType) {
        const container = document.createElement('div');
        container.className = 'custom-level-button-container';
        container.innerHTML = `
            <button class="btn-custom-level" onclick="CustomLevelManager.openModal('${gameType}')">
                <span class="custom-icon">⚙️</span>
                <span class="custom-text">مرحلة مخصصة</span>
                <span class="custom-subtext">اختر إعداداتك!</span>
            </button>
        `;
        return container;
    }
};

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    CustomLevelManager.init();
});
