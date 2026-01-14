/**
 * Main Game Application - التطبيق الرئيسي
 */

class GaussianGame {
    constructor() {
        this.currentLevel = null;
        this.matrix = null;
        this.originalMatrix = null;
        this.history = [];
        this.score = 0;
        this.steps = 0;
        this.phase = 1;
        
        // نظام الأجزاء
        this.currentPart = 1; // 1=جاوس, 2=جاوس-جوردن, 3=المحددات, 4=كرامر, 5=المعكوس
        this.partsInfo = {
            1: { name: 'طريقة جاوس', icon: '📐', unlockLevel: 0 },
            2: { name: 'جاوس-جوردن', icon: '🎯', unlockLevel: 5 },
            3: { name: 'المحددات', icon: '🧮', unlockLevel: 5, isDeterminant: true },
            4: { name: 'كرامر', icon: '📊', unlockLevel: 5, isCramer: true },
            5: { name: 'المعكوس', icon: '🔄', unlockLevel: 5, isInverse: true }
        };
        
        // تحميل التقدم المحفوظ
        this.loadAllProgress();
        
        this.dragDrop = new DragDropManager(this);
        this.devMode = false; // وضع فتح جميع المراحل بدون حفظ
        
        // نظام المعلم المساعد
        this.tutorVisible = false;
        this.currentHint = null;
        this.tutorEnabledLevels = null; // null = جميع المستويات تدعم التلميحات
        
        // تتبع التلميحات والأخطاء للتقييم
        this.hintsUsed = 0;
        this.errorsCount = 0;
        
        // نظام الدروس التعليمية
        this.currentLessonStep = 1;
        this.totalLessonSteps = 8;
        
        // نظام المثال المتحرك
        this.currentExampleStep = 0;
        this.totalExampleSteps = 4;
        this.exampleAutoPlayInterval = null;
        
        // وضع المعكوس
        this.isInverseMode = false;
        this.inverseOriginalSize = 0;
        this.inverseConstants = [];
        
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.populateLevelGrid();
    }
    
    cacheElements() {
        this.screens = {
            home: document.getElementById('home-screen'),
            partsSelect: document.getElementById('parts-select-screen'),
            levelSelect: document.getElementById('level-select-screen'),
            tutorial: document.getElementById('tutorial-screen'),
            lesson: document.getElementById('lesson-screen'),
            game: document.getElementById('game-screen'),
            win: document.getElementById('win-screen'),
            about: document.getElementById('about-screen')
        };
        
        this.elements = {
            levelsGrid: document.getElementById('levels-grid'),
            matrixContainer: document.getElementById('matrix-container'),
            equationsDisplay: document.getElementById('equations-display'),
            currentLevel: document.getElementById('current-level'),
            currentScore: document.getElementById('current-score'),
            currentSteps: document.getElementById('current-steps'),
            hintText: document.getElementById('hint-text'),
            btnUndo: document.getElementById('btn-undo'),
            phase1: document.getElementById('phase-1'),
            phase2: document.getElementById('phase-2'),
            phase1Indicator: document.getElementById('phase-1-indicator'),
            phase2Indicator: document.getElementById('phase-2-indicator'),
            finalMatrix: document.getElementById('final-matrix'),
            variablesForm: document.getElementById('variables-form'),
            finalScore: document.getElementById('final-score'),
            finalSteps: document.getElementById('final-steps'),
            winStars: document.getElementById('win-stars'),
            // عناصر المعلم المساعد
            tutorSection: document.getElementById('tutor-section'),
            tutorHintText: document.getElementById('tutor-hint-text'),
            btnShowHint: document.getElementById('btn-show-hint'),
            btnApplyHint: document.getElementById('btn-apply-hint')
        };
        
        this.modals = {
            scale: document.getElementById('scale-modal'),
            add: document.getElementById('add-modal'),
            confirm: document.getElementById('confirm-modal')
        };
    }
    
    bindEvents() {
        // أحداث نوافذ الحوار
        document.getElementById('scale-k').addEventListener('input', () => this.updateScalePreview());
        document.getElementById('scale-row').addEventListener('change', () => this.updateScalePreview());
        
        document.getElementById('add-k').addEventListener('input', () => this.updateAddPreview());
        document.getElementById('add-target').addEventListener('change', () => this.updateAddPreview());
        document.getElementById('add-source').addEventListener('change', () => this.updateAddPreview());
        
        // إغلاق النوافذ عند النقر على الخلفية
        Object.values(this.modals).forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModals();
            });
        });
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            // Escape لإغلاق النوافذ
            if (e.key === 'Escape') {
                this.closeModals();
                return;
            }
            
            // التحقق إذا كنا في شاشة الدرس
            const lessonScreen = document.getElementById('lesson-screen');
            if (!lessonScreen || !lessonScreen.classList.contains('active')) return;
            
            // التحقق من أن التركيز ليس على عنصر إدخال
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') return;
            
            // الخطوة 6 تحتوي على الشرح السينمائي
            const lessonStep6 = document.getElementById('lesson-step-6');
            const isInCinematicStep = lessonStep6 && lessonStep6.classList.contains('active');
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                
                if (isInCinematicStep && typeof cinematicTutorial !== 'undefined') {
                    // في الخطوة السينمائية
                    if (cinematicTutorial.isAtLastPhase()) {
                        // إذا في آخر مرحلة سينمائية، انتقل للخطوة 7
                        this.nextLesson();
                    } else {
                        // انتقل للمرحلة السينمائية التالية
                        cinematicTutorial.nextPhase();
                    }
                } else {
                    this.nextLesson();
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                
                if (isInCinematicStep && typeof cinematicTutorial !== 'undefined') {
                    // في الخطوة السينمائية
                    if (cinematicTutorial.isAtFirstPhase()) {
                        // إذا في أول مرحلة سينمائية، انتقل للخطوة 5
                        this.prevLesson();
                    } else {
                        // انتقل للمرحلة السينمائية السابقة
                        cinematicTutorial.prevPhase();
                    }
                } else {
                    this.prevLesson();
                }
            }
        });
    }
    
    // ==================== التنقل ====================
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }
    
    showHome() {
        this.showScreen('home');
    }

    showAbout() {
        this.showScreen('about');
    }
    
    showPartsSelect() {
        this.updatePartsUI();
        this.showScreen('partsSelect');
    }
    
    selectPart(partNumber) {
        const partInfo = this.partsInfo[partNumber];
        
        if (!this.isPartUnlocked(partNumber) && !this.devMode) {
            // الجزء مقفل
            return;
        }
        
        // التحقق من الأجزاء القادمة قريباً
        if (partInfo.comingSoon) {
            alert(`${partInfo.name} - قريباً! 🚀`);
            return;
        }
        
        this.currentPart = partNumber;
        
        // التحقق من نوع اللعبة
        if (partInfo.isDeterminant) {
            this.showDeterminantLevelSelect();
        } else if (partInfo.isCramer) {
            this.showCramerLevelSelect();
        } else if (partInfo.isInverse) {
            this.showInverseLevelSelect();
        } else {
            this.showLevelSelect();
        }
    }
    
    showDeterminantLevelSelect() {
        // عرض شاشة اختيار مستويات المحددات
        const titleEl = document.getElementById('level-select-title');
        if (titleEl) {
            titleEl.textContent = `${this.partsInfo[this.currentPart].name} - اختر المستوى`;
        }
        this.populateDeterminantLevelGrid();
        this.showScreen('levelSelect');
    }
    
    populateDeterminantLevelGrid() {
        const grid = document.getElementById('levels-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // إضافة بطاقة التعلم الأولى (2x2)
        const learnCard1 = document.createElement('div');
        learnCard1.className = 'level-card learn-card';
        learnCard1.innerHTML = `
            <span class="level-number">📐</span>
            <span class="level-stars">تعلم 2×2</span>
        `;
        learnCard1.addEventListener('click', () => {
            if (typeof determinantTutorial !== 'undefined') {
                determinantTutorial.show(1);
            }
        });
        grid.appendChild(learnCard1);
        
        // المستويات 1-2 (2x2)
        for (let i = 1; i <= 2; i++) {
            grid.appendChild(this.createDeterminantLevelCard(i));
        }
        
        // إضافة بطاقة التعلم الثانية (3x3 Sarrus)
        const learnCard2 = document.createElement('div');
        learnCard2.className = 'level-card learn-card';
        learnCard2.innerHTML = `
            <span class="level-number">📊</span>
            <span class="level-stars">تعلم 3×3</span>
        `;
        learnCard2.addEventListener('click', () => {
            if (typeof determinantTutorial !== 'undefined') {
                determinantTutorial.show(2);
            }
        });
        grid.appendChild(learnCard2);
        
        // المستويات 3-5 (3x3)
        for (let i = 3; i <= 5; i++) {
            grid.appendChild(this.createDeterminantLevelCard(i));
        }
        
        // إضافة بطاقة التعلم الثالثة (4x4+ Cofactor)
        const learnCard3 = document.createElement('div');
        learnCard3.className = 'level-card learn-card';
        learnCard3.innerHTML = `
            <span class="level-number">🧮</span>
            <span class="level-stars">تعلم 4×4+</span>
        `;
        learnCard3.addEventListener('click', () => {
            if (typeof determinantTutorial !== 'undefined') {
                determinantTutorial.show(3);
            }
        });
        grid.appendChild(learnCard3);
        
        // المستويات 6-10 (4x4+)
        for (let i = 6; i <= 10; i++) {
            grid.appendChild(this.createDeterminantLevelCard(i));
        }
        
        // إضافة زر المرحلة المخصصة
        if (typeof CustomLevelManager !== 'undefined') {
            grid.appendChild(CustomLevelManager.createCustomLevelButton('determinant'));
        }
    }
    
    createDeterminantLevelCard(levelNum) {
        const levelData = determinantLevels[levelNum];
        const stars = detGame ? detGame.getStars(levelNum) : 0;
        const isComplete = detGame ? detGame.completedLevels.includes(levelNum) : false;
        
        // فك القفل: المستوى الأول مفتوح دائماً، أو المستوى السابق مكتمل، أو وضع المطور
        const prevLevel = levelNum > 1 ? levelNum - 1 : 0;
        const isUnlocked = this.devMode || levelNum === 1 || (detGame && detGame.completedLevels.includes(prevLevel));
        
        const card = document.createElement('div');
        card.className = 'level-card';
        
        if (!isUnlocked) card.classList.add('locked');
        if (isComplete) card.classList.add('completed');
        if (this.devMode && !isComplete) card.classList.add('dev-unlocked');
        
        const starsDisplay = isComplete ? '⭐'.repeat(stars) + '☆'.repeat(5 - stars) : '☆☆☆☆☆';
        
        card.innerHTML = `
            <span class="level-num">${levelNum}</span>
            <span class="level-stars">${starsDisplay}</span>
        `;
        
        if (isUnlocked) {
            card.addEventListener('click', () => this.startDeterminantLevel(levelNum));
        }
        
        return card;
    }
    
    startDeterminantLevel(levelNum) {
        if (typeof detGame !== 'undefined') {
            // إخفاء جميع عناصر جاوس
            this.hideGaussUI();
            
            // إظهار حاوية المحددات
            const gameContainer = document.getElementById('determinant-game-container');
            if (gameContainer) {
                gameContainer.style.display = 'block';
            }
            
            detGame.startLevel(levelNum);
            this.showScreen('game');
        }
    }
    
    // بدء مرحلة مخصصة للمحددات
    startCustomDeterminantLevel(levelData) {
        if (typeof detGame !== 'undefined') {
            this.hideGaussUI();
            
            const gameContainer = document.getElementById('determinant-game-container');
            if (gameContainer) {
                gameContainer.style.display = 'block';
            }
            
            detGame.startCustomLevel(levelData);
            this.showScreen('game');
        }
    }
    
    hideGaussUI() {
        // إخفاء عناصر جاوس عند لعب المحددات
        const elementsToHide = [
            'goal-hint-container',
            'phase-1',
            'phase-2',
            'equations-section'
        ];
        
        elementsToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        // إخفاء عناصر بالكلاس
        document.querySelectorAll('.game-phase, .phase-indicator, .game-header').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    showGaussUI() {
        // إعادة عرض عناصر جاوس
        const elementsToShow = [
            { id: 'goal-hint-container', display: 'block' },
            { id: 'phase-1', display: 'block' },
            { id: 'equations-section', display: 'block' }
        ];
        
        elementsToShow.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) el.style.display = item.display;
        });
        
        // إظهار عناصر بالكلاس
        document.querySelectorAll('.phase-indicator').forEach(el => {
            el.style.display = 'flex';
        });
        document.querySelectorAll('.game-header').forEach(el => {
            el.style.display = 'flex';
        });
    }
    
    endDeterminantGame() {
        // إخفاء المحددات
        const gameContainer = document.getElementById('determinant-game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
            gameContainer.innerHTML = '';
        }
        
        // إعادة عرض عناصر جاوس
        this.showGaussUI();
    }
    
    // ==================== CRAMER'S RULE ====================
    
    showCramerLevelSelect() {
        // عرض شاشة اختيار مستويات كرامر
        const titleEl = document.getElementById('level-select-title');
        if (titleEl) {
            titleEl.textContent = `${this.partsInfo[this.currentPart].name} - اختر المستوى`;
        }
        this.populateCramerLevelGrid();
        this.showScreen('levelSelect');
    }
    
    populateCramerLevelGrid() {
        const grid = document.getElementById('levels-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // إضافة بطاقة التعلم الأولى (2x2)
        const learnCard1 = document.createElement('div');
        learnCard1.className = 'level-card learn-card';
        learnCard1.innerHTML = `
            <span class="level-number">📐</span>
            <span class="level-stars">تعلم 2×2</span>
        `;
        learnCard1.addEventListener('click', () => {
            if (typeof cramerTutorial !== 'undefined') {
                cramerTutorial.show(1);
            }
        });
        grid.appendChild(learnCard1);
        
        // المستويات 1-3 (2x2 بما فيها الحالة الخاصة)
        for (let i = 1; i <= 3; i++) {
            grid.appendChild(this.createCramerLevelCard(i));
        }
        
        // إضافة بطاقة التعلم الثانية (3x3)
        const learnCard2 = document.createElement('div');
        learnCard2.className = 'level-card learn-card';
        learnCard2.innerHTML = `
            <span class="level-number">📊</span>
            <span class="level-stars">تعلم 3×3</span>
        `;
        learnCard2.addEventListener('click', () => {
            if (typeof cramerTutorial !== 'undefined') {
                cramerTutorial.show(2);
            }
        });
        grid.appendChild(learnCard2);
        
        // المستويات 4-9 (3x3)
        for (let i = 4; i <= 9; i++) {
            grid.appendChild(this.createCramerLevelCard(i));
        }
        
        // إضافة بطاقة التعلم الثالثة (4x4)
        const learnCard3 = document.createElement('div');
        learnCard3.className = 'level-card learn-card';
        learnCard3.innerHTML = `
            <span class="level-number">🧮</span>
            <span class="level-stars">تعلم 4×4</span>
        `;
        learnCard3.addEventListener('click', () => {
            if (typeof cramerTutorial !== 'undefined') {
                cramerTutorial.show(3);
            }
        });
        grid.appendChild(learnCard3);
        
        // المستويات 10-11 (4x4)
        for (let i = 10; i <= 11; i++) {
            grid.appendChild(this.createCramerLevelCard(i));
        }
        
        // إضافة زر المرحلة المخصصة
        if (typeof CustomLevelManager !== 'undefined') {
            grid.appendChild(CustomLevelManager.createCustomLevelButton('cramer'));
        }
    }
    
    createCramerLevelCard(levelNum) {
        const levelData = cramerLevels[levelNum];
        const stars = typeof cramerGame !== 'undefined' ? cramerGame.getStars(levelNum) : 0;
        const isComplete = typeof cramerGame !== 'undefined' ? cramerGame.completedLevels.includes(levelNum) : false;
        
        // فك القفل: المستوى الأول مفتوح دائماً، أو المستوى السابق مكتمل، أو وضع المطور
        const prevLevel = levelNum > 1 ? levelNum - 1 : 0;
        const isUnlocked = this.devMode || levelNum === 1 || 
            (typeof cramerGame !== 'undefined' && cramerGame.completedLevels.includes(prevLevel));
        
        const card = document.createElement('div');
        card.className = 'level-card';
        
        if (!isUnlocked) card.classList.add('locked');
        if (isComplete) card.classList.add('completed');
        if (this.devMode && !isComplete) card.classList.add('dev-unlocked');
        
        const starsDisplay = isComplete ? '⭐'.repeat(stars) + '☆'.repeat(5 - stars) : '☆☆☆☆☆';
        
        card.innerHTML = `
            <span class="level-num">${levelNum}</span>
            <span class="level-stars">${starsDisplay}</span>
        `;
        
        if (isUnlocked) {
            card.addEventListener('click', () => this.startCramerLevel(levelNum));
        }
        
        return card;
    }
    
    startCramerLevel(levelNum) {
        if (typeof cramerGame !== 'undefined') {
            // إخفاء جميع عناصر جاوس
            this.hideGaussUI();
            
            // إظهار حاوية كرامر
            let gameContainer = document.getElementById('cramer-game-container');
            if (!gameContainer) {
                gameContainer = document.createElement('div');
                gameContainer.id = 'cramer-game-container';
                document.getElementById('game-screen')?.querySelector('.container')?.appendChild(gameContainer);
            }
            gameContainer.style.display = 'block';
            
            cramerGame.startLevel(levelNum);
            this.showScreen('game');
        }
    }
    
    // بدء مرحلة مخصصة لكرامر
    startCustomCramerLevel(levelData) {
        if (typeof cramerGame !== 'undefined') {
            this.hideGaussUI();
            
            let gameContainer = document.getElementById('cramer-game-container');
            if (!gameContainer) {
                gameContainer = document.createElement('div');
                gameContainer.id = 'cramer-game-container';
                document.getElementById('game-screen')?.querySelector('.container')?.appendChild(gameContainer);
            }
            gameContainer.style.display = 'block';
            
            cramerGame.startCustomLevel(levelData);
            this.showScreen('game');
        }
    }
    
    endCramerGame() {
        // إخفاء كرامر
        const gameContainer = document.getElementById('cramer-game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
            gameContainer.innerHTML = '';
        }
        
        // إعادة عرض عناصر جاوس
        this.showGaussUI();
    }
    
    // ==================== INVERSE MATRIX ====================
    
    showInverseLevelSelect() {
        // عرض شاشة اختيار مستويات المعكوس
        const titleEl = document.getElementById('level-select-title');
        if (titleEl) {
            titleEl.textContent = `${this.partsInfo[this.currentPart].name} - اختر المستوى`;
        }
        this.populateInverseLevelGrid();
        this.showScreen('levelSelect');
    }
    
    populateInverseLevelGrid() {
        const grid = document.getElementById('levels-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // إضافة بطاقة التعلم الأولى (2x2)
        const learnCard1 = document.createElement('div');
        learnCard1.className = 'level-card learn-card';
        learnCard1.innerHTML = `
            <span class="level-number">📐</span>
            <span class="level-stars">تعلم 2×2</span>
        `;
        learnCard1.addEventListener('click', () => {
            if (typeof inverseTutorial !== 'undefined') {
                inverseTutorial.show(1);
            }
        });
        grid.appendChild(learnCard1);
        
        // المستويات 1-5 (2x2 بما فيها الحالة الشاذة)
        for (let i = 1; i <= 5; i++) {
            grid.appendChild(this.createInverseLevelCard(i));
        }
        
        // إضافة بطاقة التعلم الثانية (3x3)
        const learnCard2 = document.createElement('div');
        learnCard2.className = 'level-card learn-card';
        learnCard2.innerHTML = `
            <span class="level-number">📊</span>
            <span class="level-stars">تعلم 3×3</span>
        `;
        learnCard2.addEventListener('click', () => {
            if (typeof inverseTutorial !== 'undefined') {
                inverseTutorial.show(2);
            }
        });
        grid.appendChild(learnCard2);
        
        // المستويات 6-10 (3x3)
        for (let i = 6; i <= 10; i++) {
            grid.appendChild(this.createInverseLevelCard(i));
        }
        
        // إضافة بطاقة التعلم الثالثة (4x4)
        const learnCard3 = document.createElement('div');
        learnCard3.className = 'level-card learn-card';
        learnCard3.innerHTML = `
            <span class="level-number">🧮</span>
            <span class="level-stars">تعلم 4×4</span>
        `;
        learnCard3.addEventListener('click', () => {
            if (typeof inverseTutorial !== 'undefined') {
                inverseTutorial.show(3);
            }
        });
        grid.appendChild(learnCard3);
        
        // المستوى 11 (4x4)
        grid.appendChild(this.createInverseLevelCard(11));
        
        // إضافة زر المرحلة المخصصة
        if (typeof CustomLevelManager !== 'undefined') {
            grid.appendChild(CustomLevelManager.createCustomLevelButton('inverse'));
        }
    }
    
    createInverseLevelCard(levelNum) {
        const levelData = typeof inverseLevels !== 'undefined' ? inverseLevels[levelNum] : null;
        const stars = typeof inverseGame !== 'undefined' ? inverseGame.getStars(levelNum) : 0;
        const isComplete = typeof inverseGame !== 'undefined' ? inverseGame.completedLevels.includes(levelNum) : false;
        
        // فك القفل: المستوى الأول مفتوح دائماً، أو المستوى السابق مكتمل، أو وضع المطور
        const prevLevel = levelNum > 1 ? levelNum - 1 : 0;
        const isUnlocked = this.devMode || levelNum === 1 || 
            (typeof inverseGame !== 'undefined' && inverseGame.completedLevels.includes(prevLevel));
        
        const card = document.createElement('div');
        card.className = 'level-card';
        
        if (!isUnlocked) card.classList.add('locked');
        if (isComplete) card.classList.add('completed');
        if (this.devMode && !isComplete) card.classList.add('dev-unlocked');
        
        const starsDisplay = isComplete ? '⭐'.repeat(stars) + '☆'.repeat(5 - stars) : '☆☆☆☆☆';
        
        card.innerHTML = `
            <span class="level-num">${levelNum}</span>
            <span class="level-stars">${starsDisplay}</span>
        `;
        
        if (isUnlocked) {
            card.addEventListener('click', () => this.startInverseLevel(levelNum));
        }
        
        return card;
    }
    
    startInverseLevel(levelNum) {
        const levelData = typeof inverseLevels !== 'undefined' ? inverseLevels[levelNum] : null;
        if (!levelData) {
            console.error('Inverse level not found:', levelNum);
            return;
        }
        
        // إنشاء المصفوفة الموسعة [A | I]
        const n = levelData.size;
        const augmentedMatrix = [];
        
        for (let i = 0; i < n; i++) {
            const row = [];
            // إضافة معاملات A
            for (let j = 0; j < n; j++) {
                row.push(levelData.coefficients[i][j]);
            }
            // إضافة مصفوفة الوحدة I
            for (let j = 0; j < n; j++) {
                row.push(i === j ? 1 : 0);
            }
            augmentedMatrix.push(row);
        }
        
        // إنشاء كائن المستوى بنفس بنية مستويات جاوس
        const inverseAsLevel = {
            id: levelNum,
            name: levelData.description,
            size: [n, n * 2],
            variables: levelData.variables,
            matrix: augmentedMatrix,
            solution: levelData.solution,
            minSteps: levelData.minSteps,
            // بيانات إضافية للمعكوس
            isInverseLevel: true,
            originalSize: n,
            constants: levelData.constants
        };
        
        this.currentLevel = inverseAsLevel;
        this.matrix = Matrix.fromArray(augmentedMatrix);
        this.originalMatrix = Matrix.fromArray(augmentedMatrix);
        this.history = [];
        this.score = 1000;
        this.steps = 0;
        this.phase = 1;
        this.userSolvedAnswers = {};
        
        // تعيين علامة وضع المعكوس
        this.isInverseMode = true;
        this.inverseOriginalSize = n;
        this.inverseConstants = levelData.constants;
        
        // إعادة تعيين المعلم المساعد
        this.tutorVisible = false;
        this.currentHint = null;
        
        this.updateUI();
        this.renderMatrix();
        this.renderInverseEquations(levelData);
        this.showScreen('game');
        
        this.elements.phase1.classList.add('active');
        this.elements.phase2.classList.remove('active');
        this.elements.phase1Indicator.classList.add('active');
        this.elements.phase2Indicator.classList.remove('active');
        
        // إظهار زر التلميح للمعكوس - نفس جاوس-جوردن
        this.elements.btnShowHint.style.display = 'inline-flex';
        // إظهار التلميح تلقائياً في المستوى الأول
        if (levelNum === 1) {
            setTimeout(() => this.showTutor(), 500);
        }
    }
    
    // بدء مرحلة مخصصة للمعكوس
    startCustomInverseLevel(levelData) {
        // إنشاء المصفوفة الموسعة [A | I]
        const n = levelData.size;
        const augmentedMatrix = [];
        
        for (let i = 0; i < n; i++) {
            const row = [];
            // إضافة معاملات A
            for (let j = 0; j < n; j++) {
                row.push(levelData.coefficients[i][j]);
            }
            // إضافة مصفوفة الوحدة I
            for (let j = 0; j < n; j++) {
                row.push(i === j ? 1 : 0);
            }
            augmentedMatrix.push(row);
        }
        
        // إنشاء كائن المستوى بنفس بنية مستويات جاوس
        const inverseAsLevel = {
            id: 'custom',
            name: 'مرحلة مخصصة',
            size: [n, n * 2],
            variables: levelData.variables,
            matrix: augmentedMatrix,
            solution: null,
            minSteps: levelData.minSteps || n * 4,
            isInverseLevel: true,
            originalSize: n,
            constants: levelData.constants,
            isCustom: true
        };
        
        this.currentLevel = inverseAsLevel;
        this.matrix = Matrix.fromArray(augmentedMatrix);
        this.originalMatrix = Matrix.fromArray(augmentedMatrix);
        this.history = [];
        this.score = 1000;
        this.steps = 0;
        this.phase = 1;
        this.userSolvedAnswers = {};
        
        // تعيين علامة وضع المعكوس
        this.isInverseMode = true;
        this.inverseOriginalSize = n;
        this.inverseConstants = levelData.constants;
        
        // إعادة تعيين المعلم المساعد
        this.tutorVisible = false;
        this.currentHint = null;
        
        this.updateUI();
        this.renderMatrix();
        
        // عرض المعادلات
        const display = this.elements.equationsDisplay;
        let html = '<div class="inverse-system-title">النظام المخصص:</div>';
        for (let i = 0; i < n; i++) {
            let eq = '';
            for (let j = 0; j < n; j++) {
                const coef = levelData.coefficients[i][j];
                if (j > 0) {
                    eq += coef >= 0 ? ' + ' : ' - ';
                    eq += `${Math.abs(coef)}${levelData.variables[j]}`;
                } else {
                    eq += `${coef}${levelData.variables[j]}`;
                }
            }
            eq += ` = ${levelData.constants[i]}`;
            html += `<div class="equation-line">${eq}</div>`;
        }
        display.innerHTML = html;
        
        this.showScreen('game');
        
        this.elements.phase1.classList.add('active');
        this.elements.phase2.classList.remove('active');
        this.elements.phase1Indicator.classList.add('active');
        this.elements.phase2Indicator.classList.remove('active');
        
        this.elements.btnShowHint.style.display = 'inline-flex';
    }
    
    renderInverseEquations(levelData) {
        const display = this.elements.equationsDisplay;
        let html = '<div class="inverse-system-title">النظام الأصلي:</div>';
        
        for (let i = 0; i < levelData.size; i++) {
            let eq = '';
            for (let j = 0; j < levelData.size; j++) {
                const coef = levelData.coefficients[i][j];
                if (j > 0) {
                    eq += coef >= 0 ? ' + ' : ' - ';
                    eq += `${Math.abs(coef)}${levelData.variables[j]}`;
                } else {
                    eq += `${coef}${levelData.variables[j]}`;
                }
            }
            eq += ` = ${levelData.constants[i]}`;
            html += `<div class="equation-line">${eq}</div>`;
        }
        
        display.innerHTML = html;
    }
    
    endInverseGame() {
        // إخفاء المعكوس
        const gameContainer = document.getElementById('inverse-game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
            gameContainer.innerHTML = '';
        }
        
        // إعادة عرض عناصر جاوس
        this.showGaussUI();
    }
    
    updatePartsUI() {
        const requiredStars = 20;
        
        for (let i = 2; i <= 5; i++) {
            const card = document.getElementById(`part-card-${i}`);
            if (card) {
                const isUnlocked = this.isPartUnlocked(i) || this.devMode;
                card.classList.toggle('locked', !isUnlocked);
                const statusEl = card.querySelector('.part-status');
                if (statusEl) {
                    if (isUnlocked) {
                        statusEl.textContent = 'مفتوح ✓';
                    } else {
                        // حساب النجوم المطلوبة من القسم المناسب
                        let currentStars = 0;
                        let sourcePartName = '';
                        
                        if (i === 4 || i === 5) {
                            // كرامر والمعكوس يتطلبان نجوم من المحددات
                            if (typeof detGame !== 'undefined' && detGame.levelStars) {
                                currentStars = Object.values(detGame.levelStars).reduce((sum, s) => sum + s, 0);
                            }
                            sourcePartName = this.partsInfo[3].name;
                        } else {
                            // جاوس-جوردن والمحددات يتطلبان نجوم من جاوس
                            currentStars = this.getTotalStars(1);
                            sourcePartName = this.partsInfo[1].name;
                        }
                        
                        statusEl.innerHTML = `🔒 <span class="unlock-progress">${currentStars}/${requiredStars}</span> ⭐ من ${sourcePartName}`;
                    }
                }
            }
        }
    }
    
    showLevelSelect() {
        // التحقق من وضع المعكوس والتوجيه المناسب
        if (this.isInverseMode || this.currentPart === 5) {
            this.isInverseMode = false;
            // إعادة عرض phase2 للاستخدام العادي
            if (this.elements.phase2) {
                this.elements.phase2.style.display = '';
            }
            this.showInverseLevelSelect();
            return;
        }
        
        // تحديث العنوان حسب الجزء الحالي
        const titleEl = document.getElementById('level-select-title');
        if (titleEl) {
            titleEl.textContent = `${this.partsInfo[this.currentPart].name} - اختر المستوى`;
        }
        this.populateLevelGrid();
        this.showScreen('levelSelect');
    }
    
    showTutorial() {
        this.showScreen('tutorial');
    }
    
    // ==================== المستويات ====================
    
    populateLevelGrid() {
        const grid = this.elements.levelsGrid;
        grid.innerHTML = '';
        
        // الحصول على المستويات المكتملة للجزء الحالي
        const partCompletedLevels = this.completedLevels[this.currentPart] || [];
        
        // إضافة بطاقة التعلم (Level 0) - في الجزء الأول والثاني
        if (this.currentPart === 1 || this.currentPart === 2) {
            const learnCard = document.createElement('div');
            learnCard.className = 'level-card learn-card';
            learnCard.innerHTML = `
                <span class="level-number">📚</span>
                <span class="level-stars">تعلم</span>
            `;
            learnCard.addEventListener('click', () => this.showLesson());
            grid.appendChild(learnCard);
        }
        
        LEVELS.forEach((level, index) => {
            const card = document.createElement('div');
            card.className = 'level-card';
            
            // في وضع المطور جميع المراحل مفتوحة
            const isUnlocked = this.devMode || index === 0 || partCompletedLevels.includes(index);
            const isCompleted = partCompletedLevels.includes(level.id);
            
            if (!isUnlocked) card.classList.add('locked');
            if (isCompleted) card.classList.add('completed');
            if (this.devMode && !isCompleted) card.classList.add('dev-unlocked');
            
            const stars = isCompleted ? this.getStars(level.id) : '☆☆☆☆☆';
            
            card.innerHTML = `
                <span class="level-num">${level.id}</span>
                <span class="level-stars">${stars}</span>
            `;
            
            if (isUnlocked) {
                card.addEventListener('click', () => this.startLevel(level.id));
            }
            
            grid.appendChild(card);
        });
        
        // إضافة زر المرحلة المخصصة
        if (typeof CustomLevelManager !== 'undefined') {
            grid.appendChild(CustomLevelManager.createCustomLevelButton('gauss'));
        }
    }
    
    // التحقق من كود الفتح السري
    checkCheatCode(event) {
        const input = document.getElementById('cheat-code-input');
        const code = input.value;
        
        if (code === '555') {
            this.devMode = true;
            input.value = '';
            input.placeholder = '🔓✓';
            input.classList.add('activated');
            
            // إظهار رسالة
            setTimeout(() => {
                alert('تم فتح جميع المراحل مؤقتاً! 🎮');
            }, 100);
        }
    }
    
    startLevel(levelId) {
        const level = getLevel(levelId);
        if (!level) return;
        
        // إعادة تعيين وضع المعكوس
        this.isInverseMode = false;
        this.inverseOriginalSize = 0;
        this.inverseConstants = [];
        
        this.currentLevel = level;
        this.matrix = Matrix.fromArray(level.matrix);
        this.originalMatrix = Matrix.fromArray(level.matrix);
        this.history = [];
        this.score = 1000;
        this.steps = 0;
        this.phase = 1;
        this.userSolvedAnswers = {}; // مسح إجابات اللاعب السابقة
        
        // إعادة تعيين تتبع التلميحات والأخطاء للتقييم
        this.hintsUsed = 0;
        this.errorsCount = 0;
        
        // إعادة تعيين المعلم المساعد
        this.tutorVisible = false;
        this.currentHint = null;
        
        this.updateUI();
        this.renderMatrix();
        this.renderEquations();
        this.showScreen('game');
        
        this.elements.phase1.classList.add('active');
        this.elements.phase2.classList.remove('active');
        this.elements.phase2.style.display = ''; // إعادة العرض بعد وضع المعكوس
        this.elements.phase1Indicator.classList.add('active');
        this.elements.phase2Indicator.classList.remove('active');
        
        // إظهار زر التلميح لجميع المستويات (نظام جديد)
        if (this.tutorEnabledLevels === null || this.tutorEnabledLevels.includes(levelId)) {
            this.elements.btnShowHint.style.display = 'inline-flex';
            // إظهار التلميح تلقائياً في المستوى الأول
            if (levelId === 1) {
                setTimeout(() => this.showTutor(), 500);
            }
        } else {
            this.elements.btnShowHint.style.display = 'none';
            this.hideTutor();
        }
    }
    
    // ==================== المرحلة المخصصة ====================
    
    startCustomLevel(levelData) {
        // إعادة تعيين وضع المعكوس
        this.isInverseMode = false;
        this.inverseOriginalSize = 0;
        this.inverseConstants = [];
        
        this.currentLevel = levelData;
        this.matrix = Matrix.fromArray(levelData.matrix);
        this.originalMatrix = Matrix.fromArray(levelData.matrix);
        this.history = [];
        this.score = 1000;
        this.steps = 0;
        this.phase = 1;
        this.userSolvedAnswers = {};
        
        // إعادة تعيين تتبع التلميحات والأخطاء للتقييم
        this.hintsUsed = 0;
        this.errorsCount = 0;
        
        // إعادة تعيين المعلم المساعد
        this.tutorVisible = false;
        this.currentHint = null;
        
        this.updateUI();
        this.renderMatrix();
        this.renderEquations();
        this.showScreen('game');
        
        this.elements.phase1.classList.add('active');
        this.elements.phase2.classList.remove('active');
        this.elements.phase2.style.display = '';
        this.elements.phase1Indicator.classList.add('active');
        this.elements.phase2Indicator.classList.remove('active');
        
        // إظهار زر التلميح
        this.elements.btnShowHint.style.display = 'inline-flex';
    }
    
    // ==================== العرض ====================
    
    updateUI() {
        this.elements.currentLevel.textContent = this.currentLevel.id;
        this.elements.currentScore.textContent = this.score;
        this.elements.currentSteps.textContent = this.steps;
        this.elements.btnUndo.disabled = this.history.length === 0;
        
        // تحديث عرض النجوم الفوري
        this.updateLiveStars();
    }
    
    // عرض النجوم المتوقعة أثناء اللعب
    updateLiveStars() {
        const liveStarsEl = document.getElementById('live-stars');
        if (liveStarsEl) {
            const stars = this.calculateStars();
            liveStarsEl.innerHTML = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
            
            // إضافة تأثير عند التغيير
            liveStarsEl.classList.add('pulse');
            setTimeout(() => liveStarsEl.classList.remove('pulse'), 300);
        }
    }
    
    renderMatrix() {
        const container = this.elements.matrixContainer;
        container.innerHTML = '';
        
        this.dragDrop.reset();
        this.dragDrop.init(container);
        
        const states = this.matrix.getCellStates();
        
        for (let i = 0; i < this.matrix.rows; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            row.dataset.rowIndex = i;
            
            // مقبض السحب
            const handle = document.createElement('span');
            handle.className = 'row-handle';
            handle.innerHTML = '≡';
            row.appendChild(handle);
            
            // تسمية الصف
            const label = document.createElement('span');
            label.className = 'row-label';
            label.textContent = `R${i + 1}`;
            row.appendChild(label);
            
            // الخلايا
            for (let j = 0; j < this.matrix.cols; j++) {
                // الفاصل - موضعه يختلف بين وضع المعكوس والوضع العادي
                const dividerPosition = this.isInverseMode ? this.inverseOriginalSize : this.matrix.cols - 1;
                if (j === dividerPosition) {
                    const divider = document.createElement('span');
                    divider.className = 'matrix-divider';
                    row.appendChild(divider);
                }
                
                const cell = document.createElement('span');
                cell.className = 'matrix-cell';
                
                // تحديد الحالة
                const state = states[i][j];
                if (state !== 'default' && state !== 'result') {
                    cell.classList.add(state);
                }
                
                // عرض القيمة
                const value = this.matrix.get(i, j);
                if (value.den === 1) {
                    cell.textContent = value.num;
                } else {
                    cell.innerHTML = `<small>${value.num}/${value.den}</small>`;
                }
                
                row.appendChild(cell);
            }
            
            // أزرار العمليات السريعة
            const quickActions = document.createElement('div');
            quickActions.className = 'row-quick-actions';
            
            // زر الضرب (قابل للسحب)
            const scaleBtn = document.createElement('button');
            scaleBtn.className = 'row-quick-btn btn-scale';
            scaleBtn.innerHTML = '✕';
            scaleBtn.dataset.tooltip = 'اضرب هذا الصف';
            scaleBtn.dataset.rowIndex = i;
            scaleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.quickScale(i);
            });
            // دعم السحب لزر الضرب
            this.setupScaleButtonDrag(scaleBtn, i);
            quickActions.appendChild(scaleBtn);
            
            // زر الجمع
            const addBtn = document.createElement('button');
            addBtn.className = 'row-quick-btn btn-add';
            addBtn.innerHTML = '➕';
            addBtn.dataset.tooltip = 'اجمع من هذا الصف';
            addBtn.dataset.rowIndex = i;
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.quickAdd(i);
            });
            // دعم السحب لزر الجمع
            this.setupAddButtonDrag(addBtn, i);
            quickActions.appendChild(addBtn);
            
            row.appendChild(quickActions);
            
            container.appendChild(row);
            this.dragDrop.setupRow(row, i);
        }
        
        // تحديث التلميح إذا كان المعلم ظاهراً
        if (this.tutorVisible) {
            this.updateTutorHint();
        }

        // تحديث تلميح الهدف
        this.renderGoalHint();
    }

    renderGoalHint() {
        if (!this.matrix || this.phase !== 1) return;
        
        const container = document.getElementById('goal-hint-container');
        if (!container) return;

        // إزالة class الاختفاء إذا كان موجوداً (عند العودة للمستوى)
        container.classList.remove('fade-out');
        
        // تحديد نوع الهدف حسب الجزء الحالي
        const isGaussJordan = (this.currentPart === 2);
        const isInverse = this.isInverseMode;
        
        let goalTitle;
        if (isInverse) {
            goalTitle = 'الهدف: حوّل الجزء الأيسر إلى مصفوفة الوحدة (I)';
        } else if (isGaussJordan) {
            goalTitle = 'الهدف: الشكل المختصر (جاوس-جوردن)';
        } else {
            goalTitle = 'الهدف: الشكل المدرجي';
        }
        
        // في وضع المعكوس، نعرض فقط الأعمدة اليسرى
        const displayCols = isInverse ? this.inverseOriginalSize : this.matrix.cols;
        
        let html = '<div class="goal-title">' + goalTitle + '</div><div class="goal-grid" style="grid-template-columns: repeat(' + displayCols + ', 1fr);">';
        
        for (let i = 0; i < this.matrix.rows; i++) {
            for (let j = 0; j < displayCols; j++) {
                // في وضع المعكوس والوضع العادي: آخر عمود معروض هو الناتج (?)
                if (!isInverse && j === this.matrix.cols - 1) {
                     html += `<div class="goal-cell ignore">?</div>`;
                     continue;
                }
                
                // المنطق:
                // - القائد في (i, i) يجب أن يكون 1
                // - في جاوس: ما تحته (j < i) يجب أن يكون 0
                // - في جاوس-جوردن والمعكوس: ما تحته وما فوقه (i !== j) يجب أن يكون 0
                const isPivot = (i === j);
                const isBelowPivot = (j < i);
                const isAbovePivot = (j > i && j < this.matrix.rows);
                
                let classes = 'goal-cell';
                let content = '•';
                
                if (isPivot) {
                     classes += ' pivot-target';
                     content = '1';
                     const val = this.matrix.get(i, j);
                     if (val.num === 1 && val.den === 1) classes += ' done';
                } else if (isBelowPivot) {
                    // جاوس وجاوس-جوردن والمعكوس: صفر تحت القائد
                    classes += ' zero-target';
                    content = '0';
                    const val = this.matrix.get(i, j);
                    if (val.num === 0) classes += ' done';
                } else if ((isGaussJordan || isInverse) && isAbovePivot) {
                    // جاوس-جوردن والمعكوس: صفر فوق القائد أيضاً
                    classes += ' zero-target-above';
                    content = '0';
                    const val = this.matrix.get(i, j);
                    if (val.num === 0) classes += ' done';
                } else {
                    classes += ' ignore';
                }
                
                html += `<div class="${classes}">${content}</div>`;
            }
        }
        
        html += '</div>';
        if (isGaussJordan) {
            html += '<div class="goal-note">📌 جاوس-جوردن: صفّر <strong>فوق</strong> وتحت كل قائد!</div>';
        } else if (isInverse) {
            html += '<div class="goal-note">📌 المعكوس: حوّل الجزء الأيسر إلى مصفوفة الوحدة، ثم اضرب المعكوس في B</div>';
        }
        
        container.innerHTML = html;
        
        // إضافة الضغط للإخفاء
        container.onclick = () => {
            container.classList.add('fade-out');
        };
        
        // إلغاء المؤقت السابق إن وجد
        if (this.goalHintTimer) {
            clearTimeout(this.goalHintTimer);
        }
        
        // إخفاء تلقائي بعد 10 ثواني
        this.goalHintTimer = setTimeout(() => {
            container.classList.add('fade-out');
        }, 10000);
    }
    
    renderEquations() {
        const equations = generateEquations(this.originalMatrix, this.currentLevel.variables);
        const display = this.elements.equationsDisplay;
        
        display.innerHTML = equations.map(eq => 
            `<div class="equation-line">${eq}</div>`
        ).join('');
    }
    
    // ==================== العمليات ====================
    
    saveState() {
        this.history.push({
            matrix: this.matrix.clone(),
            score: this.score,
            steps: this.steps
        });
        this.elements.btnUndo.disabled = false;
    }
    
    undo() {
        if (this.history.length === 0) return;
        
        const state = this.history.pop();
        this.matrix = state.matrix;
        this.score = state.score;
        this.steps = state.steps;
        
        this.updateUI();
        this.renderMatrix();
        
        this.elements.btnUndo.disabled = this.history.length === 0;
    }
    
    swapRows(row1, row2) {
        if (row1 === row2) return;
        
        this.saveState();
        this.matrix.swapRows(row1, row2);
        this.steps++;
        this.score = Math.max(0, this.score - 10);
        
        this.animateOperation(() => {
            this.updateUI();
            this.renderMatrix();
            this.checkPhase1Complete();
        });
    }
    
    // تحليل قيمة الكسر من نص واحد (مثل: "-3/4" أو "2")
    parseFractionInput(value) {
        const str = String(value).trim();
        if (!str) return { num: 0, den: 1 };
        
        // التحقق من وجود سلاش
        if (str.includes('/')) {
            const parts = str.split('/');
            const num = parseInt(parts[0]) || 0;
            const den = parseInt(parts[1]) || 1;
            return { num, den: den === 0 ? 1 : den };
        } else {
            // رقم بدون سلاش
            const num = parseInt(str) || 0;
            return { num, den: 1 };
        }
    }
    
    showScaleModal() {
        const select = document.getElementById('scale-row');
        select.innerHTML = '';
        
        for (let i = 0; i < this.matrix.rows; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `R${i + 1}`;
            select.appendChild(option);
        }
        
        document.getElementById('scale-k').value = '';
        
        this.updateScalePreview();
        this.modals.scale.classList.add('active');
    }
    
    updateScalePreview() {
        const kValue = document.getElementById('scale-k').value;
        const { num, den } = this.parseFractionInput(kValue);
        const row = parseInt(document.getElementById('scale-row').value);
        
        if (!this.matrix || isNaN(row)) return;
        
        // تحديث قيمة k
        const preview = document.getElementById('scale-preview');
        if (den === 1) {
            preview.textContent = `k = ${num}`;
        } else {
            preview.textContent = `k = ${num}/${den}`;
        }
        
        // عرض الصف الحالي
        const currentRow = document.getElementById('scale-current-row');
        if (currentRow) {
            currentRow.textContent = this.formatRowValues(row);
        }
        
        // معاينة النتيجة
        const opPreview = document.getElementById('scale-operation-preview');
        if (den !== 0 && num !== 0 && opPreview) {
            const factor = new Fraction(num, den);
            let result = '[ ';
            
            for (let j = 0; j < this.matrix.cols; j++) {
                const newVal = this.matrix.get(row, j).multiply(factor);
                result += newVal.toString() + (j < this.matrix.cols - 1 ? ', ' : '');
            }
            result += ' ]';
            
            opPreview.textContent = result;
        }
        
        // تحديث المعاينة في المصفوفة مباشرة
        this.showLivePreview('scale', row, num, den);
    }
    
    // عرض المعاينة الحية في المصفوفة
    // عرض المعاينة الحية في المصفوفة
    showLivePreview(type, targetRow, num, den) {
        const container = this.elements.matrixContainer;
        const rows = container.querySelectorAll('.matrix-row');
        
        // التحقق من القيم
        if (!this.matrix || den === 0 || (num === 0 && type === 'scale')) return;
        
        const factor = new Fraction(num, den);
        const sourceRow = type === 'add' ? parseInt(document.getElementById('add-source').value) : null;
        
        rows.forEach((row, i) => {
            const cells = row.querySelectorAll('.matrix-cell');
            
            if (i === targetRow) {
                row.classList.add('preview-row');
                
                cells.forEach((cell, j) => {
                    let htmlContent = '';
                    
                    if (type === 'scale') {
                        const newVal = this.matrix.get(i, j).multiply(factor);
                        if (newVal.den === 1) {
                            htmlContent = `<span class="preview-value">${newVal.num}</span>`;
                        } else {
                            htmlContent = `<span class="preview-value"><small>${newVal.num}/${newVal.den}</small></span>`;
                        }
                    } else if (type === 'add') {
                        const originalVal = this.matrix.get(i, j);
                        const sourceVal = this.matrix.get(sourceRow, j);
                        const scaled = sourceVal.multiply(factor); // القيمة المضافة (k * source)
                        const finalVal = originalVal.add(scaled);
                        
                        const originStr = originalVal.den === 1 ? originalVal.num : `${originalVal.num}/${originalVal.den}`;
                        const scaledStr = scaled.den === 1 ? scaled.num : `${scaled.num}/${scaled.den}`;
                        const finalStr = finalVal.den === 1 ? finalVal.num : `${finalVal.num}/${finalVal.den}`;
                        
                        // عرض تفصيلي: الأصل + المضاف = النتيجة
                        // نستخدم scaledStr مباشرة لأنها تمثل (k * source) بما في ذلك الإشارة
                         htmlContent = `
                            <div class="preview-detailed">
                                <span class="preview-original">${originStr}</span>
                                <span class="preview-operator">+</span>
                                <span class="preview-ghost">${scaledStr}</span>
                                <span class="preview-equals">=</span>
                                <span class="preview-result">${finalStr}</span>
                            </div>
                        `;
                    }
                    
                    cell.innerHTML = htmlContent;
                });
            } else {
                // استعادة الحالة الأصلية
                row.classList.remove('preview-row');
                
                cells.forEach((cell, j) => {
                    const value = this.matrix.get(i, j);
                    if (value.den === 1) {
                        cell.textContent = value.num;
                    } else {
                        cell.innerHTML = `<small>${value.num}/${value.den}</small>`;
                    }
                });
            }
        });
    }
    
    // إخفاء المعاينة واستعادة القيم الأصلية
    hideLivePreview() {
        const container = this.elements.matrixContainer;
        const rows = container.querySelectorAll('.matrix-row');
        
        rows.forEach(row => row.classList.remove('preview-row'));
        
        // إعادة رسم المصفوفة
        this.renderMatrix();
    }
    
    executeScale() {
        const kValue = document.getElementById('scale-k').value;
        const { num, den } = this.parseFractionInput(kValue);
        const row = parseInt(document.getElementById('scale-row').value);
        
        if (den === 0 || num === 0) {
            alert('القيمة غير صالحة');
            return;
        }
        
        this.saveState();
        const factor = new Fraction(num, den);
        this.matrix.scaleRow(row, factor);
        this.steps++;
        this.score = Math.max(0, this.score - 15);
        
        this.closeModals();
        this.animateOperation(() => {
            this.updateUI();
            this.renderMatrix();
            this.checkPhase1Complete();
        });
    }
    
    showAddModal() {
        const targetSelect = document.getElementById('add-target');
        const sourceSelect = document.getElementById('add-source');
        
        targetSelect.innerHTML = '';
        sourceSelect.innerHTML = '';
        
        for (let i = 0; i < this.matrix.rows; i++) {
            const opt1 = document.createElement('option');
            opt1.value = i;
            opt1.textContent = `R${i + 1}`;
            targetSelect.appendChild(opt1);
            
            const opt2 = document.createElement('option');
            opt2.value = i;
            opt2.textContent = `R${i + 1}`;
            sourceSelect.appendChild(opt2);
        }
        
        // تعيين القيم الافتراضية (مختلفة)
        targetSelect.value = 0;
        if (this.matrix.rows > 1) {
            sourceSelect.value = 1;
        }
        
        // منع اختيار نفس الصف - تغيير تلقائي
        targetSelect.onchange = () => {
            if (targetSelect.value === sourceSelect.value) {
                // اختر الصف التالي للمصدر
                const nextRow = (parseInt(targetSelect.value) + 1) % this.matrix.rows;
                sourceSelect.value = nextRow;
            }
            this.updateAddPreview();
        };
        
        sourceSelect.onchange = () => {
            if (targetSelect.value === sourceSelect.value) {
                // اختر الصف التالي للهدف
                const nextRow = (parseInt(sourceSelect.value) + 1) % this.matrix.rows;
                targetSelect.value = nextRow;
            }
            this.updateAddPreview();
        };
        
        document.getElementById('add-k').value = '';
        
        this.updateAddPreview();
        this.modals.add.classList.add('active');
    }
    
    updateAddPreview() {
        const kValue = document.getElementById('add-k').value;
        const { num, den } = this.parseFractionInput(kValue);
        const target = parseInt(document.getElementById('add-target').value);
        const source = parseInt(document.getElementById('add-source').value);
        
        if (!this.matrix || isNaN(target) || isNaN(source)) return;
        
        // تحديث عرض قيم الصفوف
        const targetRowPreview = document.getElementById('target-row-preview');
        const sourceRowPreview = document.getElementById('source-row-preview');
        const targetRowValues = document.getElementById('target-row-values');
        const sourceRowValues = document.getElementById('source-row-values');
        const targetRowLabel = targetRowPreview?.querySelector('.row-preview-label');
        const sourceRowLabel = sourceRowPreview?.querySelector('.row-preview-label');
        
        if (targetRowValues && sourceRowValues) {
            // تحديث labels
            if (targetRowLabel) targetRowLabel.textContent = `R${target + 1}:`;
            if (sourceRowLabel) sourceRowLabel.textContent = `R${source + 1}:`;
            
            // تحديث القيم
            targetRowValues.textContent = this.formatRowValues(target);
            sourceRowValues.textContent = this.formatRowValues(source);
            
            // تحديث الألوان
            targetRowPreview.className = 'row-preview-item target-row';
            sourceRowPreview.className = 'row-preview-item source-row';
        }
        
        // تحديث النص التوضيحي في الصيغة
        const formulaTargetText = document.getElementById('formula-target-text');
        if (formulaTargetText) {
            formulaTargetText.textContent = `R${target + 1}`;
        }
        
        // تحديث الشرح المبسط
        const explainText = document.getElementById('operation-explain-text');
        if (explainText) {
            const kValue = den === 1 ? num : `${num}/${den}`;
            explainText.innerHTML = `سيتم إضافة <strong>${kValue}</strong> مضروب في <strong>R${source + 1}</strong> إلى <strong>R${target + 1}</strong>`;
        }
        
        // معاينة العملية
        const opPreview = document.getElementById('add-operation-preview');
        if (den !== 0 && num !== 0) {
            const factor = new Fraction(num, den);
            let result = '[ ';
            
            for (let j = 0; j < this.matrix.cols; j++) {
                const scaled = this.matrix.get(source, j).multiply(factor);
                const newVal = this.matrix.get(target, j).add(scaled);
                result += newVal.toString() + (j < this.matrix.cols - 1 ? ',  ' : '');
            }
            result += ' ]';
            
            opPreview.textContent = result;
        }
        
        // تحديث المعاينة في المصفوفة مباشرة
        this.showLivePreview('add', target, num, den);
    }
    
    // دالة مساعدة لتنسيق قيم الصف
    formatRowValues(rowIndex) {
        if (!this.matrix) return '';
        
        let values = '[ ';
        for (let j = 0; j < this.matrix.cols; j++) {
            if (j === this.matrix.cols - 1) values += '| ';
            values += this.matrix.get(rowIndex, j).toString();
            if (j < this.matrix.cols - 1) values += ', ';
        }
        values += ' ]';
        return values;
    }
    
    executeAdd() {
        const kValue = document.getElementById('add-k').value;
        const { num, den } = this.parseFractionInput(kValue);
        const target = parseInt(document.getElementById('add-target').value);
        const source = parseInt(document.getElementById('add-source').value);
        
        if (den === 0) {
            alert('القيمة غير صالحة');
            return;
        }
        
        if (target === source) {
            alert('لا يمكن جمع صف مع نفسه');
            return;
        }
        
        this.saveState();
        const factor = new Fraction(num, den);
        this.matrix.addScaledRow(target, source, factor);
        this.steps++;
        this.score = Math.max(0, this.score - 20);
        
        this.closeModals();
        this.animateOperation(() => {
            this.updateUI();
            this.renderMatrix();
            this.checkPhase1Complete();
        });
    }
    
    startSwapOperation() {
        this.elements.hintText.textContent = 'اسحب صفاً وأفلته فوق صف آخر لتبديلهما';
    }
    
    // ==================== التحقق ====================
    
    checkPhase1Complete() {
        // استخدام الفحص المناسب حسب الجزء الحالي
        let isComplete = false;
        
        console.log('checkPhase1Complete called');
        console.log('isInverseMode:', this.isInverseMode);
        console.log('inverseOriginalSize:', this.inverseOriginalSize);
        console.log('currentPart:', this.currentPart);
        
        // ==================== فحص الحالات الخاصة ====================
        if (this.isInverseMode) {
            // وضع المعكوس: فحص الصف الصفري في الجزء الأيسر
            const n = this.inverseOriginalSize;
            for (let i = 0; i < n; i++) {
                let rowIsZero = true;
                for (let j = 0; j < n; j++) {
                    if (!this.matrix.get(i, j).isZero()) {
                        rowIsZero = false;
                        break;
                    }
                }
                if (rowIsZero) {
                    console.log('Singular matrix detected! Row', i, 'is all zeros on left side');
                    setTimeout(() => {
                        this.showInverseNoInverseScreen(i);
                    }, 500);
                    return;
                }
            }
        } else {
            // فحص عدم وجود حل (صف متناقض: 0 = k حيث k ≠ 0)
            if (this.matrix.hasNoSolution()) {
                console.log('No solution detected!');
                setTimeout(() => {
                    this.showNoSolutionScreen();
                }, 500);
                return;
            }
            
            // فحص عدد لا نهائي من الحلول (صف صفري بالكامل)
            if (this.matrix.hasInfiniteSolutions()) {
                // نتحقق أولاً أن المصفوفة في الشكل المدرجي
                const isEchelon = this.currentPart === 2 
                    ? this.matrix.isReducedRowEchelon() 
                    : this.matrix.isRowEchelon();
                    
                if (isEchelon) {
                    console.log('Infinite solutions detected!');
                    setTimeout(() => {
                        this.showInfiniteSolutionsScreen();
                    }, 500);
                    return;
                }
            }
        }
        // ==================== نهاية فحص الحالات الخاصة ====================
        
        if (this.isInverseMode) {
            // وضع المعكوس: التحقق من أن الجزء الأيسر هو مصفوفة الوحدة
            isComplete = this.isLeftSideIdentity();
            console.log('Inverse mode - isLeftSideIdentity:', isComplete);
        } else if (this.currentPart === 2) {
            // جاوس-جوردن: الشكل المدرجي المختصر
            isComplete = this.matrix.isReducedRowEchelon();
        } else {
            // جاوس (والباقي حالياً): الشكل المدرجي العادي
            isComplete = this.matrix.isRowEchelon();
        }
        
        if (isComplete) {
            console.log('Phase 1 complete! isInverseMode:', this.isInverseMode);
            setTimeout(() => {
                console.log('Timeout executing, isInverseMode:', this.isInverseMode);
                if (this.isInverseMode) {
                    console.log('Calling startInversePhase2');
                    this.startInversePhase2();
                } else {
                    console.log('Calling startPhase2');
                    this.startPhase2();
                }
            }, 500);
        }
    }
    
    // التحقق من أن الجزء الأيسر من المصفوفة هو مصفوفة الوحدة
    isLeftSideIdentity() {
        const n = this.inverseOriginalSize;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const cell = this.matrix.get(i, j);
                const expected = (i === j) ? 1 : 0;
                if (i === j) {
                    // القطر يجب أن يكون 1
                    if (cell.num !== 1 || cell.den !== 1) return false;
                } else {
                    // باقي العناصر يجب أن تكون 0
                    if (cell.num !== 0) return false;
                }
            }
        }
        return true;
    }
    
    // المرحلة الثانية للمعكوس - عرض X = A⁻¹ × B
    startInversePhase2() {
        console.log('startInversePhase2 executing...');
        try {
            this.phase = 2;
            
            // إخفاء المعلم المساعد
            this.hideTutor();
            
            // استخراج المعكوس من الجزء الأيمن
            const n = this.inverseOriginalSize;
            console.log('n =', n);
            
            const inverseMatrix = [];
            for (let i = 0; i < n; i++) {
                const row = [];
                for (let j = n; j < 2 * n; j++) {
                    row.push(this.matrix.get(i, j));
                }
                inverseMatrix.push(row);
            }
            console.log('inverseMatrix:', inverseMatrix);
            
            // حساب الحل X = A⁻¹ × B
            const solution = [];
            for (let i = 0; i < n; i++) {
                let sum = new Fraction(0, 1);
                for (let j = 0; j < n; j++) {
                    const invCell = inverseMatrix[i][j];
                    const constant = new Fraction(this.inverseConstants[j], 1);
                    sum = sum.add(invCell.multiply(constant));
                }
                solution.push(sum);
            }
            console.log('solution:', solution);
            
            // حفظ الحل
            this.inverseSolution = solution;
            
            // عرض واجهة المرحلة الثانية للمعكوس
            console.log('Calling renderInversePhase2');
            this.renderInversePhase2(inverseMatrix, solution);
            console.log('renderInversePhase2 done');
            
            // في وضع المعكوس: نُبقي phase1 مرئياً لأن المحتوى فيه
            // لكن نُحدث مؤشرات المرحلة
            this.elements.phase1Indicator.classList.remove('active');
            this.elements.phase2Indicator.classList.add('active');
            
            // إخفاء phase2 العادية تماماً
            this.elements.phase2.classList.remove('active');
            this.elements.phase2.style.display = 'none';
            
            this.score += 200;
            this.updateUI();
            console.log('startInversePhase2 completed successfully');
        } catch (error) {
            console.error('Error in startInversePhase2:', error);
        }
    }
    
    renderInversePhase2(inverseMatrix, solution) {
        const n = this.inverseOriginalSize;
        const vars = this.currentLevel.variables;
        const constants = this.inverseConstants;
        
        // إنشاء HTML لخطوات الضرب التفصيلية
        let multiplicationSteps = '';
        for (let i = 0; i < n; i++) {
            let stepParts = [];
            for (let j = 0; j < n; j++) {
                const invVal = inverseMatrix[i][j].toString();
                const constVal = constants[j];
                stepParts.push(`(${invVal} × ${constVal})`);
            }
            multiplicationSteps += `
                <div class="mult-step-row">
                    <span class="mult-var">${vars[i]} = </span>
                    <span class="mult-calc">${stepParts.join(' + ')}</span>
                    <span class="mult-result">= ${solution[i].toString()}</span>
                </div>
            `;
        }
        
        // إنشاء واجهة المرحلة الثانية للمعكوس بشرح مفصل
        let html = `
            <div class="inverse-phase2">
                <div class="inverse-found-title">🎉 تم إيجاد المعكوس A⁻¹</div>
                
                <!-- الخطوة 1: من أين جاء المعكوس -->
                <div class="inverse-step-section">
                    <div class="step-header">
                        <span class="step-number">1</span>
                        <span class="step-title">استخراج المعكوس من الجزء الأيمن</span>
                    </div>
                    <div class="step-content">
                        <p class="step-explanation">
                            عند تحويل الجزء الأيسر من المصفوفة الموسعة [A|I] إلى مصفوفة الوحدة I،
                            <br>يصبح الجزء الأيمن هو <strong>المعكوس A⁻¹</strong>
                        </p>
                        <div class="transform-visual">
                            <div class="transform-box">
                                <div class="transform-label">كان: [A | I]</div>
                            </div>
                            <span class="transform-arrow">➜</span>
                            <div class="transform-box highlight">
                                <div class="transform-label">أصبح: [I | A⁻¹]</div>
                            </div>
                        </div>
                        <div class="extracted-inverse">
                            <div class="extracted-label">المعكوس A⁻¹:</div>
                            ${this.renderInverseMatrixMini(inverseMatrix)}
                        </div>
                    </div>
                </div>
                
                <!-- الخطوة 2: ضرب المعكوس في B -->
                <div class="inverse-step-section">
                    <div class="step-header">
                        <span class="step-number">2</span>
                        <span class="step-title">حساب X = A⁻¹ × B</span>
                    </div>
                    <div class="step-content">
                        <div class="formula-box-large">X = A⁻¹ × B</div>
                        
                        <div class="multiplication-visual">
                            <div class="mult-matrix-box">
                                <div class="mult-label">A⁻¹</div>
                                <div class="mult-matrix-content">
                                    ${this.renderInverseMatrixMini(inverseMatrix)}
                                </div>
                            </div>
                            <span class="mult-operator">×</span>
                            <div class="mult-vector-box">
                                <div class="mult-label">B</div>
                                <div class="mult-vector-content">
                                    ${constants.map(c => `<div class="mult-cell const">${c}</div>`).join('')}
                                </div>
                            </div>
                            <span class="mult-operator">=</span>
                            <div class="mult-vector-box result">
                                <div class="mult-label">X</div>
                                <div class="mult-vector-content">
                                    ${solution.map(s => `<div class="mult-cell result-val">${s.toString()}</div>`).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="multiplication-breakdown">
                            <div class="breakdown-title">📝 تفاصيل الحساب:</div>
                            ${multiplicationSteps}
                        </div>
                    </div>
                </div>
                
                <!-- الخطوة 3: الحل النهائي -->
                <div class="inverse-step-section final">
                    <div class="step-header">
                        <span class="step-number">✓</span>
                        <span class="step-title">الحل النهائي</span>
                    </div>
                    <div class="step-content">
                        <div class="solution-values">
                            ${vars.map((v, i) => `
                                <span class="solution-item">${v} = ${solution[i].toString()}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="inverse-complete-btn">
                    <button class="btn btn-primary btn-lg" onclick="game.completeInverseLevel()">
                        إنهاء المستوى ✓
                    </button>
                </div>
            </div>
        `;
        
        this.elements.matrixContainer.innerHTML = html;
        
        // إخفاء عناصر المرحلة الثانية العادية
        const phase2Content = document.getElementById('phase2-content');
        if (phase2Content) phase2Content.style.display = 'none';
    }
    
    renderInverseMatrixMini(matrix) {
        const cols = matrix[0] ? matrix[0].length : 2;
        let html = `<div class="mini-matrix-grid" style="grid-template-columns: repeat(${cols}, 1fr);">`;
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                html += `<div class="mult-cell">${matrix[i][j].toString()}</div>`;
            }
        }
        html += '</div>';
        return html;
    }
    
    completeInverseLevel() {
        // حساب النجوم
        const stars = this.calculateStars();
        
        // حفظ التقدم لمستويات المعكوس
        if (typeof inverseGame !== 'undefined') {
            const levelNum = this.currentLevel.id;
            if (!inverseGame.completedLevels.includes(levelNum)) {
                inverseGame.completedLevels.push(levelNum);
            }
            if (!inverseGame.levelStars[levelNum] || stars > inverseGame.levelStars[levelNum]) {
                inverseGame.levelStars[levelNum] = stars;
            }
            inverseGame.saveProgress();
        }
        
        // عرض شاشة الفوز
        this.showInverseWinScreen(stars);
    }
    
    showInverseWinScreen(stars) {
        const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        const levelNum = this.currentLevel.id;
        
        this.elements.matrixContainer.innerHTML = `
            <div class="inverse-win-screen">
                <div class="win-icon">🎉</div>
                <h2>أحسنت!</h2>
                <div class="win-stars">${starsDisplay}</div>
                <p>أكملت المستوى ${levelNum} في ${this.steps} خطوة</p>
                <div class="win-buttons">
                    <button class="btn btn-secondary" onclick="game.backToInverseLevels()">
                        قائمة المستويات
                    </button>
                    ${levelNum < 10 ? `
                        <button class="btn btn-primary" onclick="game.startInverseLevel(${levelNum + 1})">
                            المستوى التالي ▶
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    backToInverseLevels() {
        this.isInverseMode = false;
        // إعادة عرض phase2 للاستخدام العادي
        if (this.elements.phase2) {
            this.elements.phase2.style.display = '';
        }
        this.showInverseLevelSelect();
    }
    
    calculateStars() {
        // نظام 5 نجوم يعتمد على التلميحات والأخطاء
        // 5 نجوم: 0 تلميحات + 0 أخطاء
        // 4 نجوم: 1 تلميح أو 1-2 أخطاء
        // 3 نجوم: 2 تلميحات أو 3-4 أخطاء
        // 2 نجوم: 3 تلميحات أو 5-6 أخطاء
        // 1 نجمة: 4 تلميحات أو 7-8 أخطاء
        // 0 نجوم: 5+ تلميحات أو 10+ أخطاء (مبالغ فيه)
        
        const hints = this.hintsUsed || 0;
        const errors = this.errorsCount || 0;
        
        // حساب خصم النجوم من التلميحات
        let hintPenalty = hints; // كل تلميح ينقص نجمة
        
        // حساب خصم النجوم من الأخطاء
        let errorPenalty = Math.floor(errors / 2); // كل خطأين ينقصان نجمة
        
        // أخذ الأسوأ بين العقوبتين
        const totalPenalty = Math.max(hintPenalty, errorPenalty);
        
        // النجوم = 5 - العقوبة (الحد الأدنى 0)
        return Math.max(0, 5 - totalPenalty);
    }
    
    // ==================== شاشات الحالات الخاصة ====================
    
    // شاشة لا يوجد حل (معادلات متناقضة)
    showNoSolutionScreen() {
        this.phase = 2;
        this.hideTutor();
        
        // إيجاد الصف المتناقض
        let contradictoryRowIndex = -1;
        for (let i = 0; i < this.matrix.rows; i++) {
            let allZeros = true;
            for (let j = 0; j < this.matrix.cols - 1; j++) {
                if (!this.matrix.get(i, j).isZero()) {
                    allZeros = false;
                    break;
                }
            }
            if (allZeros && !this.matrix.get(i, this.matrix.cols - 1).isZero()) {
                contradictoryRowIndex = i;
                break;
            }
        }
        
        const contradictoryValue = contradictoryRowIndex >= 0 
            ? this.matrix.get(contradictoryRowIndex, this.matrix.cols - 1).toString()
            : '?';
        
        // عرض المصفوفة مع تحديد الصف المتناقض
        let matrixHtml = '<div class="special-case-matrix">';
        for (let i = 0; i < this.matrix.rows; i++) {
            const isContradictory = i === contradictoryRowIndex;
            matrixHtml += `<div class="matrix-row ${isContradictory ? 'contradiction-row' : ''}" style="cursor: default;">`;
            
            for (let j = 0; j < this.matrix.cols; j++) {
                if (j === this.matrix.cols - 1) {
                    matrixHtml += '<span class="matrix-divider"></span>';
                }
                
                const value = this.matrix.get(i, j);
                const displayValue = value.den === 1 ? value.num : `<small>${value.num}/${value.den}</small>`;
                
                let cellClass = 'matrix-cell';
                if (isContradictory && j === this.matrix.cols - 1) {
                    cellClass += ' error';
                } else if (isContradictory) {
                    cellClass += ' zero';
                }
                
                matrixHtml += `<span class="${cellClass}">${displayValue}</span>`;
            }
            matrixHtml += '</div>';
        }
        matrixHtml += '</div>';
        
        const stars = this.calculateStars();
        const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        
        this.elements.matrixContainer.innerHTML = `
            <div class="special-case-screen no-solution-screen">
                <div class="special-case-icon">❌</div>
                <h2 class="special-case-title">لا يوجد حل!</h2>
                
                <div class="special-case-matrix-container">
                    ${matrixHtml}
                </div>
                
                <div class="special-case-explanation">
                    <div class="explanation-box error">
                        <div class="explanation-icon">⚠️</div>
                        <div class="explanation-content">
                            <p><strong>الصف الأخير يقول:</strong></p>
                            <div class="math-expression">0 = ${contradictoryValue}</div>
                            <p>وهذا <strong>مستحيل!</strong></p>
                        </div>
                    </div>
                    
                    <div class="explanation-details">
                        <p>📚 <strong>معنى ذلك:</strong></p>
                        <p>المعادلات الأصلية <strong>متناقضة</strong> - لا يوجد قيم للمتغيرات تحقق جميع المعادلات معاً.</p>
                    </div>
                </div>
                
                <div class="special-case-result">
                    <div class="result-stars">${starsDisplay}</div>
                    <p>اكتشفت التناقض في ${this.steps} خطوة</p>
                </div>
                
                <div class="special-case-buttons">
                    <button class="btn btn-secondary" onclick="game.backToLevels()">
                        قائمة المستويات
                    </button>
                    <button class="btn btn-primary" onclick="game.nextLevel()">
                        المستوى التالي ▶
                    </button>
                </div>
            </div>
        `;
        
        // حفظ التقدم
        this.saveLevelCompletion(stars);
    }
    
    // شاشة عدد لا نهائي من الحلول
    showInfiniteSolutionsScreen() {
        this.phase = 2;
        this.hideTutor();
        
        // إيجاد الصف الصفري
        let zeroRowIndex = -1;
        for (let i = 0; i < this.matrix.rows; i++) {
            let allZeros = true;
            for (let j = 0; j < this.matrix.cols; j++) {
                if (!this.matrix.get(i, j).isZero()) {
                    allZeros = false;
                    break;
                }
            }
            if (allZeros) {
                zeroRowIndex = i;
                break;
            }
        }
        
        // عرض المصفوفة مع تحديد الصف الصفري
        let matrixHtml = '<div class="special-case-matrix">';
        for (let i = 0; i < this.matrix.rows; i++) {
            const isZeroRow = i === zeroRowIndex;
            matrixHtml += `<div class="matrix-row ${isZeroRow ? 'zero-row-highlight' : ''}" style="cursor: default;">`;
            
            for (let j = 0; j < this.matrix.cols; j++) {
                if (j === this.matrix.cols - 1) {
                    matrixHtml += '<span class="matrix-divider"></span>';
                }
                
                const value = this.matrix.get(i, j);
                const displayValue = value.den === 1 ? value.num : `<small>${value.num}/${value.den}</small>`;
                
                let cellClass = 'matrix-cell';
                if (isZeroRow) {
                    cellClass += ' zero';
                }
                
                matrixHtml += `<span class="${cellClass}">${displayValue}</span>`;
            }
            matrixHtml += '</div>';
        }
        matrixHtml += '</div>';
        
        const stars = this.calculateStars();
        const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        
        this.elements.matrixContainer.innerHTML = `
            <div class="special-case-screen infinite-solutions-screen">
                <div class="special-case-icon">♾️</div>
                <h2 class="special-case-title">عدد لا نهائي من الحلول!</h2>
                
                <div class="special-case-matrix-container">
                    ${matrixHtml}
                </div>
                
                <div class="special-case-explanation">
                    <div class="explanation-box warning">
                        <div class="explanation-icon">💡</div>
                        <div class="explanation-content">
                            <p><strong>الصف المحدد:</strong></p>
                            <div class="math-expression">0 = 0</div>
                            <p>وهذا صحيح <strong>دائماً!</strong></p>
                        </div>
                    </div>
                    
                    <div class="explanation-details">
                        <p>📚 <strong>معنى ذلك:</strong></p>
                        <p>أحد المعادلات <strong>تابع</strong> للمعادلات الأخرى. يوجد متغير <strong>حر</strong> يمكن أن يأخذ أي قيمة!</p>
                    </div>
                </div>
                
                <div class="special-case-result">
                    <div class="result-stars">${starsDisplay}</div>
                    <p>اكتشفت الحلول اللانهائية في ${this.steps} خطوة</p>
                </div>
                
                <div class="special-case-buttons">
                    <button class="btn btn-secondary" onclick="game.backToLevels()">
                        قائمة المستويات
                    </button>
                    <button class="btn btn-primary" onclick="game.nextLevel()">
                        المستوى التالي ▶
                    </button>
                </div>
            </div>
        `;
        
        // حفظ التقدم
        this.saveLevelCompletion(stars);
    }
    
    // شاشة لا يوجد معكوس (مصفوفة شاذة في وضع المعكوس)
    showInverseNoInverseScreen(zeroRowIndex) {
        this.phase = 2;
        this.hideTutor();
        
        const n = this.inverseOriginalSize;
        
        // عرض المصفوفة الموسعة مع تحديد الصف الصفري
        let matrixHtml = '<div class="special-case-matrix inverse-matrix">';
        for (let i = 0; i < n; i++) {
            const isZeroRow = i === zeroRowIndex;
            matrixHtml += `<div class="matrix-row ${isZeroRow ? 'zero-row-highlight' : ''}" style="cursor: default;">`;
            
            // الجزء الأيسر (A)
            for (let j = 0; j < n; j++) {
                const value = this.matrix.get(i, j);
                const displayValue = value.den === 1 ? value.num : `<small>${value.num}/${value.den}</small>`;
                let cellClass = 'matrix-cell';
                if (isZeroRow) cellClass += ' zero';
                matrixHtml += `<span class="${cellClass}">${displayValue}</span>`;
            }
            
            matrixHtml += '<span class="matrix-divider"></span>';
            
            // الجزء الأيمن (I المتحولة)
            for (let j = n; j < 2 * n; j++) {
                const value = this.matrix.get(i, j);
                const displayValue = value.den === 1 ? value.num : `<small>${value.num}/${value.den}</small>`;
                matrixHtml += `<span class="matrix-cell">${displayValue}</span>`;
            }
            matrixHtml += '</div>';
        }
        matrixHtml += '</div>';
        
        const stars = this.calculateStars();
        const starsDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        const levelNum = this.currentLevel.id;
        
        this.elements.matrixContainer.innerHTML = `
            <div class="special-case-screen no-inverse-screen">
                <div class="special-case-icon">❌</div>
                <h2 class="special-case-title">لا يوجد معكوس!</h2>
                
                <div class="special-case-matrix-container">
                    ${matrixHtml}
                </div>
                
                <div class="special-case-explanation">
                    <div class="explanation-box error">
                        <div class="explanation-icon">⚠️</div>
                        <div class="explanation-content">
                            <p><strong>الصف ${zeroRowIndex + 1} في الجزء الأيسر:</strong></p>
                            <div class="math-expression">[ ${'0 '.repeat(n).trim().replace(/ /g, ', ')} ]</div>
                            <p>صف صفري بالكامل!</p>
                        </div>
                    </div>
                    
                    <div class="explanation-details">
                        <p>📚 <strong>معنى ذلك:</strong></p>
                        <p>المصفوفة <strong>شاذة</strong> (Singular) - محددها = 0</p>
                        <p>لا يمكن تحويل الجزء الأيسر إلى مصفوفة الوحدة، وبالتالي <strong>لا يوجد معكوس</strong>!</p>
                    </div>
                </div>
                
                <div class="special-case-result">
                    <div class="result-stars">${starsDisplay}</div>
                    <p>اكتشفت أن المصفوفة شاذة في ${this.steps} خطوة</p>
                </div>
                
                <div class="special-case-buttons">
                    <button class="btn btn-secondary" onclick="game.backToInverseLevels()">
                        قائمة المستويات
                    </button>
                    ${levelNum < 11 ? `
                        <button class="btn btn-primary" onclick="game.startInverseLevel(${levelNum + 1})">
                            المستوى التالي ▶
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // حفظ التقدم
        if (typeof inverseGame !== 'undefined') {
            if (!inverseGame.completedLevels.includes(levelNum)) {
                inverseGame.completedLevels.push(levelNum);
            }
            if (!inverseGame.levelStars[levelNum] || stars > inverseGame.levelStars[levelNum]) {
                inverseGame.levelStars[levelNum] = stars;
            }
            inverseGame.saveProgress();
        }
    }
    
    // دالة مساعدة لحفظ إكمال المستوى
    saveLevelCompletion(stars) {
        const levelId = this.currentLevel.id;
        
        // إضافة للمستويات المكتملة
        if (!this.completedLevels.includes(levelId)) {
            this.completedLevels.push(levelId);
        }
        
        // تحديث النجوم
        if (!this.levelStars[levelId] || stars > this.levelStars[levelId]) {
            this.levelStars[levelId] = stars;
        }
        
        this.saveProgress();
    }
    
    // دالة للعودة للمستويات
    backToLevels() {
        this.showLevelSelect();
    }
    
    // دالة للانتقال للمستوى التالي
    nextLevel() {
        const nextLevelId = this.currentLevel.id + 1;
        const nextLevel = getLevel(nextLevelId);
        
        if (nextLevel) {
            this.startLevel(nextLevelId);
        } else {
            this.showLevelSelect();
        }
    }
    
    // ==================== نهاية شاشات الحالات الخاصة ====================
    
    startPhase2() {
        this.phase = 2;
        
        // إخفاء المعلم المساعد
        this.hideTutor();
        
        this.elements.phase1.classList.remove('active');
        this.elements.phase2.classList.add('active');
        this.elements.phase1Indicator.classList.remove('active');
        this.elements.phase2Indicator.classList.add('active');
        
        // عرض المصفوفة النهائية
        this.renderFinalMatrix();
        
        // عرض المعادلات الناتجة
        this.renderFinalEquations();
        
        // إنشاء نموذج المتغيرات
        this.renderVariablesForm();
        
        this.score += 200; // مكافأة إكمال المرحلة الأولى
        this.updateUI();
        
        // التركيز التلقائي على أول حقل إدخال متاح
        setTimeout(() => {
            const firstInput = this.elements.variablesForm.querySelector('.variable-input:not([readonly])');
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }, 300);
    }
    
    renderFinalMatrix() {
        const container = this.elements.finalMatrix;
        container.innerHTML = '';
        
        for (let i = 0; i < this.matrix.rows; i++) {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            row.style.cursor = 'default';
            
            for (let j = 0; j < this.matrix.cols; j++) {
                if (j === this.matrix.cols - 1) {
                    const divider = document.createElement('span');
                    divider.className = 'matrix-divider';
                    row.appendChild(divider);
                }
                
                const cell = document.createElement('span');
                cell.className = 'matrix-cell';
                
                const value = this.matrix.get(i, j);
                if (value.den === 1) {
                    cell.textContent = value.num;
                } else {
                    cell.innerHTML = `<small>${value.num}/${value.den}</small>`;
                }
                
                // تلوين
                if (j < i) {
                    cell.classList.add('correct');
                } else if (i === j) {
                    cell.classList.add('pivot');
                }
                
            row.appendChild(cell);
            }
            
            container.appendChild(row);
        }
    }
    
    renderFinalEquations() {
        const display = document.getElementById('final-equations-display');
        if (!display) return;
        
        const equations = generateEquations(this.matrix, this.currentLevel.variables);
        display.innerHTML = equations.map(eq => 
            `<div class="equation-line">${eq}</div>`
        ).join('');
    }
    
    renderVariablesForm() {
        const form = this.elements.variablesForm;
        form.innerHTML = '';
        
        const solutions = solveByBackSubstitution(this.matrix);
        const variables = this.currentLevel.variables;
        
        // تخزين إجابات اللاعب المحلولة
        this.userSolvedAnswers = this.userSolvedAnswers || {};
        
        // المتغير الأخير معروف مباشرة (من المصفوفة)
        const lastVarIndex = variables.length - 1;
        if (solutions[lastVarIndex]) {
            this.userSolvedAnswers[lastVarIndex] = solutions[lastVarIndex];
        }
        
        // نعرض من الأخير للأول (التعويض العكسي)
        for (let i = variables.length - 1; i >= 0; i--) {
            const varRow = document.createElement('div');
            varRow.className = 'variable-row';
            varRow.id = `var-row-${i}`;
            
            const solution = solutions[i];
            const isLastVar = i === lastVarIndex;
            
            // بناء المعادلة من الصف - نستخدم إجابات اللاعب وليس الحل الصحيح
            const equation = this.buildEquationFromRow(i, variables, this.userSolvedAnswers);
            
            if (isLastVar && solution) {
                // المتغير الأخير - الحل مباشر من المصفوفة
                varRow.classList.add('solved');
                varRow.innerHTML = `
                    <div class="equation-display">${equation}</div>
                    <div class="variable-answer">
                        <span class="variable-name">${variables[i]} =</span>
                        <input type="text" class="variable-input correct" value="${solution.toString()}" readonly data-var="${i}">
                    </div>
                `;
            } else if (this.userSolvedAnswers[i]) {
                // متغير أجاب عليه اللاعب صحيحاً
                varRow.classList.add('solved');
                varRow.innerHTML = `
                    <div class="equation-display">${equation}</div>
                    <div class="variable-answer">
                        <span class="variable-name">${variables[i]} =</span>
                        <input type="text" class="variable-input correct" value="${this.userSolvedAnswers[i].toString()}" readonly data-var="${i}">
                    </div>
                `;
            } else {
                // المتغيرات الأخرى - تحتاج إدخال من المستخدم
                varRow.innerHTML = `
                    <div class="equation-display">${equation}</div>
                    <div class="variable-answer">
                        <span class="variable-name">${variables[i]} =</span>
                        <input type="text" class="variable-input" placeholder="?" data-var="${i}">
                    </div>
                `;
            }
            
            form.appendChild(varRow);
        }
        
        // إضافة معالج Enter لحقول المتغيرات
        this.setupVariableInputHandlers();
    }
    
    setupVariableInputHandlers() {
        const inputs = this.elements.variablesForm.querySelectorAll('.variable-input:not([readonly])');
        inputs.forEach((input, index) => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (index < inputs.length - 1) {
                        // الانتقال للحقل التالي
                        inputs[index + 1].focus();
                    } else {
                        // آخر حقل - تنفيذ التحقق
                        this.checkVariables();
                    }
                }
            });
        });
    }
    
    // بناء المعادلة من صف المصفوفة مع تعويض القيم التي أجاب عليها اللاعب فقط
    buildEquationFromRow(rowIndex, variables, userAnswers) {
        let equation = '';
        let firstTerm = true;
        
        for (let j = 0; j < this.matrix.cols - 1; j++) {
            const coef = this.matrix.get(rowIndex, j);
            if (coef.isZero()) continue;
            
            // نعرض القيمة فقط إذا أجاب اللاعب عليها
            const userAnswer = userAnswers ? userAnswers[j] : null;
            const isAnswered = userAnswer !== null && userAnswer !== undefined && j > rowIndex;
            
            let term = '';
            
            // إضافة العلامة
            if (!firstTerm) {
                term += coef.num > 0 ? ' + ' : ' - ';
            } else if (coef.num < 0) {
                term += '-';
            }
            
            const absCoef = new Fraction(Math.abs(coef.num), coef.den);
            
            if (isAnswered) {
                // المتغير أجاب عليه اللاعب - نعرض القيمة
                if (!absCoef.isOne()) {
                    term += absCoef.toString();
                }
                term += `<span class="known-value">(${userAnswer.toString()})</span>`;
            } else {
                // المتغير غير معروف بعد - نعرض اسم المتغير
                if (!absCoef.isOne()) {
                    term += absCoef.toString();
                }
                term += `<span class="unknown-var">${variables[j]}</span>`;
            }
            
            equation += term;
            firstTerm = false;
        }
        
        // الطرف الأيمن
        const rhs = this.matrix.get(rowIndex, this.matrix.cols - 1);
        equation += ` = <span class="rhs-value">${rhs.toString()}</span>`;
        
        return equation;
    }
    
    checkVariables() {
        const inputs = this.elements.variablesForm.querySelectorAll('.variable-input:not([readonly])');
        const solutions = solveByBackSubstitution(this.matrix);
        let allCorrect = true;
        let anyNewCorrect = false;
        
        inputs.forEach(input => {
            const varIndex = parseInt(input.dataset.var);
            const userAnswer = input.value.trim();
            const correctSolution = solutions[varIndex];
            
            if (!correctSolution) return;
            
            // تحليل إجابة المستخدم (كسر أو عدد عشري أو صحيح)
            let userFraction;
            try {
                if (userAnswer.includes('/')) {
                    // كسر
                    const parts = userAnswer.split('/');
                    userFraction = new Fraction(parseInt(parts[0]), parseInt(parts[1]));
                } else if (userAnswer.includes('.')) {
                    // عدد عشري - تحويل إلى كسر
                    const decimalPlaces = userAnswer.split('.')[1]?.length || 0;
                    const multiplier = Math.pow(10, decimalPlaces);
                    const numerator = Math.round(parseFloat(userAnswer) * multiplier);
                    userFraction = new Fraction(numerator, multiplier);
                } else {
                    // عدد صحيح
                    userFraction = new Fraction(parseInt(userAnswer) || 0);
                }
            } catch (e) {
                userFraction = new Fraction(0);
            }
            
            if (userFraction.equals(correctSolution)) {
                // حفظ الإجابة الصحيحة
                if (!this.userSolvedAnswers[varIndex]) {
                    this.userSolvedAnswers[varIndex] = userFraction;
                    anyNewCorrect = true;
                }
            } else {
                input.classList.remove('correct');
                input.classList.add('incorrect');
                allCorrect = false;
            }
        });
        
        // إذا أجاب على متغير جديد صحيحاً، نعيد رسم النموذج لإظهار القيم
        if (anyNewCorrect && !allCorrect) {
            this.renderVariablesForm();
        }
        
        if (allCorrect) {
            this.score += 300; // مكافأة إكمال المرحلة الثانية
            this.winLevel();
        }
    }
    
    // تلميحات المرحلة الثانية
    showPhase2Hint() {
        this.hintsUsed++;
        this.updateLiveStars();
        
        const solutions = solveByBackSubstitution(this.matrix);
        const inputs = this.elements.variablesForm.querySelectorAll('.variable-input:not([readonly])');
        const variables = this.currentLevel.variables;
        
        // البحث عن أول متغير فارغ
        for (let input of inputs) {
            if (!input.value.trim()) {
                const varIndex = parseInt(input.dataset.var);
                const solution = solutions[varIndex];
                if (solution) {
                    // عرض التلميح
                    const varName = variables[varIndex];
                    const hintBox = document.createElement('div');
                    hintBox.className = 'phase2-hint-popup';
                    hintBox.innerHTML = `💡 ${varName} = ${solution.toString()}`;
                    hintBox.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#F59E0B,#D97706);color:#1a1a1a;padding:20px 40px;border-radius:15px;font-size:1.5rem;font-weight:bold;z-index:9999;animation:fadeIn 0.3s ease;';
                    document.body.appendChild(hintBox);
                    
                    // ملء الحقل
                    input.value = solution.toString();
                    input.classList.add('hint-filled');
                    
                    // إزالة التلميح بعد 2 ثانية
                    setTimeout(() => {
                        hintBox.remove();
                    }, 2000);
                    
                    return;
                }
            }
        }
        
        // إذا كل الحقول ممتلئة
        alert('💡 جميع الحقول ممتلئة! اضغط "تحقق من الإجابة"');
    }
    
    // ==================== الفوز والإنهاء ====================
    
    winLevel() {
        // حساب النجوم بالنظام الجديد (5 نجوم)
        const stars = this.calculateStars();
        
        this.score += 500; // مكافأة إكمال المستوى
        
        // حفظ التقدم (فقط إذا لم يكن في وضع المطور)
        if (!this.devMode) {
            if (!this.completedLevels[this.currentPart]) {
                this.completedLevels[this.currentPart] = [];
            }
            if (!this.completedLevels[this.currentPart].includes(this.currentLevel.id)) {
                this.completedLevels[this.currentPart].push(this.currentLevel.id);
            }
            this.saveProgress();
            this.saveStars(this.currentLevel.id, stars);
        }
        
        // عرض شاشة الفوز
        this.elements.finalScore.textContent = this.score;
        this.elements.finalSteps.textContent = this.steps;
        this.elements.winStars.textContent = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
        
        // عرض قواعد التقييم الجديدة
        const hintsInfo = this.hintsUsed === 0 ? 'بدون تلميحات 🌟' : `${this.hintsUsed} تلميحات`;
        const errorsInfo = this.errorsCount === 0 ? 'بدون أخطاء 💯' : `${this.errorsCount} أخطاء`;
        
        // تحديث عناصر القواعد
        const rule5 = document.getElementById('rule-3-stars'); // نعيد استخدام العناصر الموجودة
        const rule2 = document.getElementById('rule-2-stars');
        const rule1 = document.getElementById('rule-1-star');
        
        if (rule5) rule5.textContent = hintsInfo;
        if (rule2) rule2.textContent = errorsInfo;
        if (rule1) rule1.textContent = `${this.steps} خطوات`;
        
        // عرض الشارات
        this.showBadges();
        
        setTimeout(() => {
            this.showScreen('win');
        }, 500);
    }
    
    // عرض شارات الإنجاز
    showBadges() {
        const badges = this.getBadges();
        const badgesContainer = document.getElementById('win-badges');
        
        if (badgesContainer) {
            if (badges.length > 0) {
                badgesContainer.innerHTML = badges.map(b => 
                    `<span class="badge ${b.class}">${b.icon} ${b.name}</span>`
                ).join('');
                badgesContainer.style.display = 'flex';
            } else {
                badgesContainer.style.display = 'none';
            }
        }
    }
    
    // حساب الشارات المستحقة
    getBadges() {
        const badges = [];
        
        if (this.hintsUsed === 0 && this.errorsCount === 0) {
            badges.push({ icon: '👑', name: 'مثالي', class: 'badge-perfect' });
        } else {
            if (this.hintsUsed === 0) {
                badges.push({ icon: '🏅', name: 'بدون تلميحات', class: 'badge-no-hints' });
            }
            if (this.errorsCount === 0) {
                badges.push({ icon: '💎', name: 'بلا أخطاء', class: 'badge-no-errors' });
            }
        }
        
        return badges;
    }
    
    nextLevel() {
        const nextId = this.currentLevel.id + 1;
        if (nextId <= LEVELS.length) {
            this.startLevel(nextId);
        } else {
            this.showLevelSelect();
        }
    }
    
    confirmExit() {
        this.modals.confirm.classList.add('active');
    }
    
    exitToLevelSelect() {
        this.closeModals();
        this.showLevelSelect();
    }
    
    closeModals() {
        Object.values(this.modals).forEach(modal => modal.classList.remove('active'));
        this.hideLivePreview();
    }
    
    // ==================== التخزين ====================
    
    // إصدار بيانات اللعبة - يزيد عند تغيير بنية البيانات
    static SAVE_VERSION = 2;
    
    loadAllProgress() {
        try {
            const saved = localStorage.getItem('gaussian-game-progress');
            if (saved) {
                const data = JSON.parse(saved);
                
                // التحقق من الإصدار والترقية إذا لزم الأمر
                const version = data.version || 1;
                
                if (version < 2) {
                    // ترقية من الإصدار 1 إلى 2
                    this.migrateFromV1(data);
                } else {
                    this.completedLevels = data.completedLevels || { 1: [], 2: [], 3: [], 4: [] };
                    this.levelScores = data.levelScores || { 1: {}, 2: {}, 3: {}, 4: {} };
                    this.settings = data.settings || {};
                }
            } else {
                this.initEmptyProgress();
            }
        } catch (e) {
            console.error('خطأ في تحميل التقدم:', e);
            // محاولة استعادة من النسخة الاحتياطية
            this.loadFromBackup();
        }
    }
    
    migrateFromV1(data) {
        console.log('ترقية بيانات اللعبة من الإصدار 1 إلى 2...');
        this.completedLevels = data.completedLevels || { 1: [], 2: [], 3: [], 4: [] };
        this.levelScores = data.levelScores || { 1: {}, 2: {}, 3: {}, 4: {} };
        this.settings = {};
        // حفظ بالإصدار الجديد
        this.saveAllProgress();
    }
    
    initEmptyProgress() {
        this.completedLevels = { 1: [], 2: [], 3: [], 4: [] };
        this.levelScores = { 1: {}, 2: {}, 3: {}, 4: {} };
        this.settings = {};
    }
    
    loadFromBackup() {
        try {
            const backup = localStorage.getItem('gaussian-game-progress-backup');
            if (backup) {
                const data = JSON.parse(backup);
                this.completedLevels = data.completedLevels || { 1: [], 2: [], 3: [], 4: [] };
                this.levelScores = data.levelScores || { 1: {}, 2: {}, 3: {}, 4: {} };
                this.settings = data.settings || {};
                console.log('تم استعادة البيانات من النسخة الاحتياطية');
            } else {
                this.initEmptyProgress();
            }
        } catch (e) {
            console.error('فشل استعادة النسخة الاحتياطية:', e);
            this.initEmptyProgress();
        }
    }
    
    saveAllProgress() {
        try {
            // إنشاء نسخة احتياطية أولاً
            const current = localStorage.getItem('gaussian-game-progress');
            if (current) {
                localStorage.setItem('gaussian-game-progress-backup', current);
            }
            
            // حفظ البيانات الجديدة
            const data = {
                version: GaussianGame.SAVE_VERSION,
                completedLevels: this.completedLevels,
                levelScores: this.levelScores,
                settings: this.settings || {},
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('gaussian-game-progress', JSON.stringify(data));
        } catch (e) {
            console.error('خطأ في حفظ التقدم:', e);
            // محاولة حفظ مضغوط في حالة امتلاء التخزين
            this.saveCompactProgress();
        }
    }
    
    saveCompactProgress() {
        try {
            // حفظ الحد الأدنى من البيانات
            const compact = {
                v: GaussianGame.SAVE_VERSION,
                c: this.completedLevels,
                s: this.levelScores
            };
            localStorage.setItem('gaussian-game-progress', JSON.stringify(compact));
        } catch (e) {
            console.error('فشل الحفظ المضغوط:', e);
        }
    }
    
    // للتوافق مع الكود القديم
    loadProgress() {
        return this.completedLevels[this.currentPart] || [];
    }
    
    saveProgress() {
        this.saveAllProgress();
    }
    
    isPartUnlocked(partNumber) {
        if (partNumber === 1) return true;
        
        // نظام جديد: فتح الأقسام بـ 20 نجمة
        const requiredStars = 20;
        
        if (partNumber === 2 || partNumber === 3) {
            // جاوس-جوردن والمحددات يفتحان بعد 20 نجمة من جاوس
            return this.getTotalStars(1) >= requiredStars;
        }
        
        if (partNumber === 4 || partNumber === 5) {
            // كرامر والمعكوس يفتحان بعد 20 نجمة من المحددات
            if (typeof detGame !== 'undefined' && detGame.levelStars) {
                const detStars = Object.values(detGame.levelStars).reduce((sum, s) => sum + s, 0);
                return detStars >= requiredStars;
            }
            return false;
        }
        
        return false;
    }
    
    // حساب إجمالي النجوم لقسم معين
    getTotalStars(partNumber) {
        const scores = this.levelScores[partNumber] || {};
        return Object.values(scores).reduce((sum, s) => sum + s, 0);
    }
    
    getStars(levelId) {
        const scores = this.levelScores[this.currentPart] || {};
        const stars = scores[levelId] || 0;
        return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
    }
    
    saveStars(levelId, stars) {
        if (!this.levelScores[this.currentPart]) {
            this.levelScores[this.currentPart] = {};
        }
        const current = this.levelScores[this.currentPart][levelId] || 0;
        if (stars > current) {
            this.levelScores[this.currentPart][levelId] = stars;
            this.saveAllProgress();
        }
    }
    
    // ==================== التأثيرات ====================
    
    animateOperation(callback) {
        // تأثير بسيط
        setTimeout(callback, 100);
    }
    
    // ==================== نظام المعلم المساعد ====================
    
    showTutor() {
        if (!this.elements.tutorSection) return;
        this.tutorVisible = true;
        this.elements.tutorSection.style.display = 'block';
        this.elements.btnShowHint.classList.add('active');
        this.updateTutorHint();
    }
    
    hideTutor() {
        if (!this.elements.tutorSection) return;
        this.tutorVisible = false;
        this.elements.tutorSection.style.display = 'none';
        this.elements.btnShowHint.classList.remove('active');
    }
    
    toggleTutor() {
        if (this.tutorVisible) {
            this.hideTutor();
        } else {
            this.showTutor();
        }
    }
    
    updateTutorHint() {
        if (!this.matrix || !this.elements.tutorHintText) return;
        
        const hint = this.getTutorHint();
        this.currentHint = hint;
        
        this.elements.tutorHintText.innerHTML = hint.message;
        
        // إظهار/إخفاء زر تطبيق التلميح
        if (hint.action && this.elements.btnApplyHint) {
            this.elements.btnApplyHint.style.display = 'inline-flex';
        } else if (this.elements.btnApplyHint) {
            this.elements.btnApplyHint.style.display = 'none';
        }
    }
    
    getTutorHint() {
        // تحليل المصفوفة وتقديم التلميح المناسب
        const n = this.matrix.rows;
        // المعكوس يحتاج نفس منطق جاوس-جوردن (تصفير فوق وتحت المحور)
        const isGaussJordan = this.currentPart === 2 || this.isInverseMode;
        
        // في وضع المعكوس نتحقق فقط من الأعمدة اليسرى
        const maxCol = this.isInverseMode ? this.inverseOriginalSize : this.matrix.cols - 1;
        
        for (let col = 0; col < n && col < maxCol; col++) {
            // التحقق من العمود الحالي
            const pivot = this.matrix.get(col, col);
            
            // هل المحور = 1؟
            if (!pivot.isOne()) {
                if (pivot.isZero()) {
                    // البحث عن صف للتبديل
                    for (let i = col + 1; i < n; i++) {
                        if (!this.matrix.get(i, col).isZero()) {
                            return {
                                message: `المحور في <strong>R${col + 1}</strong> يساوي صفر! 😮<br>بدّل <strong>R${col + 1}</strong> مع <strong>R${i + 1}</strong> للحصول على قيمة غير صفرية.`,
                                action: { type: 'swap', row1: col, row2: i }
                            };
                        }
                    }
                } else {
                    // اضرب الصف لجعل المحور = 1
                    const factor = `${pivot.den}/${pivot.num}`;
                    return {
                        message: `اجعل المحور في <strong>R${col + 1}</strong> يساوي 1.<br>اضرب <strong>R${col + 1}</strong> بـ <code>${factor}</code>`,
                        action: { type: 'scale', row: col, num: pivot.den, den: pivot.num }
                    };
                }
            }
            
            // هل العناصر تحت المحور = 0؟
            for (let i = col + 1; i < n; i++) {
                const belowPivot = this.matrix.get(i, col);
                if (!belowPivot.isZero()) {
                    const factor = belowPivot.num < 0 ? 
                        `${Math.abs(belowPivot.num)}/${belowPivot.den}` : 
                        `-${belowPivot.num}/${belowPivot.den}`;
                    return {
                        message: `اجعل العنصر تحت المحور في <strong>R${i + 1}</strong> يساوي 0.<br>أضف <code>${factor}</code> × <strong>R${col + 1}</strong> إلى <strong>R${i + 1}</strong>`,
                        action: { type: 'add', target: i, source: col, num: -belowPivot.num, den: belowPivot.den }
                    };
                }
            }
            
            // جاوس-جوردن والمعكوس: هل العناصر فوق المحور = 0؟
            if (isGaussJordan) {
                for (let i = 0; i < col; i++) {
                    const abovePivot = this.matrix.get(i, col);
                    if (!abovePivot.isZero()) {
                        const factor = abovePivot.num < 0 ? 
                            `${Math.abs(abovePivot.num)}/${abovePivot.den}` : 
                            `-${abovePivot.num}/${abovePivot.den}`;
                        const methodName = this.isInverseMode ? 'المعكوس' : 'جاوس-جوردن';
                        return {
                            message: `🎯 ${methodName}: اجعل العنصر <strong>فوق</strong> المحور في <strong>R${i + 1}</strong> يساوي 0.<br>أضف <code>${factor}</code> × <strong>R${col + 1}</strong> إلى <strong>R${i + 1}</strong>`,
                            action: { type: 'add', target: i, source: col, num: -abovePivot.num, den: abovePivot.den }
                        };
                    }
                }
            }
        }
        
        // التحقق من اكتمال المصفوفة
        if (this.isInverseMode && this.isLeftSideIdentity()) {
            return {
                message: `🎉 ممتاز! وصل الجزء الأيسر لمصفوفة الوحدة!<br>الجزء الأيمن الآن هو <strong>المعكوس A⁻¹</strong>`,
                action: null
            };
        } else if (isGaussJordan && this.matrix.isReducedRowEchelon()) {
            return {
                message: `🎉 ممتاز! وصلت للشكل المدرجي المختصر.<br>الحل واضح مباشرة!`,
                action: null
            };
        } else if (this.matrix.isRowEchelon()) {
            return {
                message: `🎉 ممتازاً وصلت للشكل المدرجي الصفي.<br>الآن أوجد قيم المتغيرات!`,
                action: null
            };
        }
        
        const goalText = this.isInverseMode ? 'مصفوفة الوحدة (على اليسار)' : 'الشكل المدرجي';
        return {
            message: `استمر في العمل! 💪 حاول جعل المصفوفة في ${goalText}.`,
            action: null
        };
    }
    
    applyTutorHint() {
        if (!this.currentHint || !this.currentHint.action) return;
        
        // تتبع استخدام التلميح
        this.hintsUsed++;
        
        // تحديث عرض النجوم الفوري
        this.updateLiveStars();
        
        const action = this.currentHint.action;
        
        switch (action.type) {
            case 'swap':
                this.swapRows(action.row1, action.row2);
                break;
            case 'scale':
                this.saveState();
                const scaleFactor = new Fraction(action.num, action.den);
                this.matrix.scaleRow(action.row, scaleFactor);
                this.steps++;
                this.score = Math.max(0, this.score - 15);
                this.animateOperation(() => {
                    this.updateUI();
                    this.renderMatrix();
                    this.checkPhase1Complete();
                });
                break;
            case 'add':
                this.saveState();
                const addFactor = new Fraction(action.num, action.den);
                this.matrix.addScaledRow(action.target, action.source, addFactor);
                this.steps++;
                this.score = Math.max(0, this.score - 20);
                this.animateOperation(() => {
                    this.updateUI();
                    this.renderMatrix();
                    this.checkPhase1Complete();
                });
                break;
        }
    }
    
    // ==================== أزرار العمليات السريعة ====================
    
    quickScale(rowIndex) {
        // فتح نافذة الضرب مع تحديد الصف تلقائياً
        this.showScaleModal();
        document.getElementById('scale-row').value = rowIndex;
        this.updateScalePreview();
    }
    
    quickAdd(sourceRowIndex) {
        // فتح نافذة الجمع مع تحديد الصف المصدر
        this.showAddModal();
        document.getElementById('add-source').value = sourceRowIndex;
        // تحديد صف هدف مختلف
        const targetRow = sourceRowIndex === 0 ? 1 : 0;
        document.getElementById('add-target').value = targetRow;
        this.updateAddPreview();
    }
    
    setupScaleButtonDrag(btn, sourceRow) {
        let isDragging = false;
        let dragClone = null;
        let startX, startY;
        
        const onMouseDown = (e) => {
            e.preventDefault();
            e.stopPropagation(); // منع تفعيل سحب الصف
            isDragging = true;
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            startY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // إنشاء نسخة للسحب
            dragClone = btn.cloneNode(true);
            dragClone.classList.add('dragging');
            dragClone.style.left = `${startX - 18}px`;
            dragClone.style.top = `${startY - 18}px`;
            document.body.appendChild(dragClone);
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onMouseMove, { passive: false });
            document.addEventListener('touchend', onMouseUp);
        };
        
        const onMouseMove = (e) => {
            if (!isDragging || !dragClone) return;
            e.preventDefault();
            
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            
            dragClone.style.left = `${x - 18}px`;
            dragClone.style.top = `${y - 18}px`;
            
            // تحديد الصف المستهدف
            this.highlightTargetRow(y, 'scale', sourceRow);
        };
        
        const onMouseUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            const targetRow = this.getRowAtPosition(y);
            
            // تنظيف
            if (dragClone) {
                dragClone.remove();
                dragClone = null;
            }
            this.clearRowHighlights();
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
            
            // فتح نافذة الضرب للصف المستهدف
            if (targetRow !== null) {
                this.quickScale(targetRow);
            }
        };
        
        btn.addEventListener('mousedown', onMouseDown);
        btn.addEventListener('touchstart', onMouseDown, { passive: false });
    }
    
    setupAddButtonDrag(btn, sourceRow) {
        let isDragging = false;
        let dragClone = null;
        let startX, startY;
        
        const onMouseDown = (e) => {
            e.preventDefault();
            e.stopPropagation(); // منع تفعيل سحب الصف
            isDragging = true;
            startX = e.clientX || (e.touches && e.touches[0].clientX);
            startY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // إنشاء نسخة للسحب
            dragClone = btn.cloneNode(true);
            dragClone.classList.add('dragging');
            dragClone.style.left = `${startX - 18}px`;
            dragClone.style.top = `${startY - 18}px`;
            document.body.appendChild(dragClone);
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onMouseMove, { passive: false });
            document.addEventListener('touchend', onMouseUp);
        };
        
        const onMouseMove = (e) => {
            if (!isDragging || !dragClone) return;
            e.preventDefault();
            
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            
            dragClone.style.left = `${x - 18}px`;
            dragClone.style.top = `${y - 18}px`;
            
            // تحديد الصف المستهدف (مختلف عن المصدر)
            this.highlightTargetRow(y, 'add', sourceRow);
        };
        
        const onMouseUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            const targetRow = this.getRowAtPosition(y);
            
            // تنظيف
            if (dragClone) {
                dragClone.remove();
                dragClone = null;
            }
            this.clearRowHighlights();
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
            
            // فتح نافذة الجمع مع الهدف والمصدر محددين
            if (targetRow !== null && targetRow !== sourceRow) {
                this.showAddModal();
                document.getElementById('add-source').value = sourceRow;
                document.getElementById('add-target').value = targetRow;
                this.updateAddPreview();
            }
        };
        
        btn.addEventListener('mousedown', onMouseDown);
        btn.addEventListener('touchstart', onMouseDown, { passive: false });
    }
    
    highlightTargetRow(y, type, excludeRow) {
        const rows = this.elements.matrixContainer.querySelectorAll('.matrix-row');
        
        rows.forEach((row, i) => {
            row.classList.remove('target-highlight-scale', 'target-highlight-add');
            
            if (type === 'add' && i === excludeRow) return;
            
            const rect = row.getBoundingClientRect();
            if (y >= rect.top && y <= rect.bottom) {
                row.classList.add(`target-highlight-${type}`);
            }
        });
    }
    
    clearRowHighlights() {
        const rows = this.elements.matrixContainer.querySelectorAll('.matrix-row');
        rows.forEach(row => {
            row.classList.remove('target-highlight-scale', 'target-highlight-add');
        });
    }
    
    getRowAtPosition(y) {
        const rows = this.elements.matrixContainer.querySelectorAll('.matrix-row');
        
        for (let i = 0; i < rows.length; i++) {
            const rect = rows[i].getBoundingClientRect();
            if (y >= rect.top && y <= rect.bottom) {
                return i;
            }
        }
        return null;
    }
    
    // ==================== نظام الدروس التعليمية ====================
    
    showLesson() {
        // تحديد عدد الخطوات وبداية الدرس حسب الجزء الحالي
        if (this.currentPart === 2) {
            // الجزء 2 (جاوس-جوردن): يبدأ من الخطوة 8 مباشرة
            this.totalLessonSteps = 8;
            this.currentLessonStep = 8;
        } else {
            // الجزء 1 (جاوس): 7 خطوات من البداية
            this.totalLessonSteps = 7;
            this.currentLessonStep = 1;
        }
        
        this.updateLessonUI();
        this.showScreen('lesson');
    }
    
    nextLesson() {
        if (this.currentLessonStep < this.totalLessonSteps) {
            this.currentLessonStep++;
            this.updateLessonUI();
        }
    }
    
    prevLesson() {
        if (this.currentLessonStep > 1) {
            this.currentLessonStep--;
            this.updateLessonUI();
        }
    }
    
    goToLesson(step) {
        if (step >= 1 && step <= this.totalLessonSteps) {
            this.currentLessonStep = step;
            this.updateLessonUI();
        }
    }
    
    updateLessonUI() {
        // تحديث الخطوات - إخفاء الخطوات غير المتاحة
        for (let i = 1; i <= 8; i++) {
            const stepEl = document.getElementById(`lesson-step-${i}`);
            if (stepEl) {
                if (i <= this.totalLessonSteps) {
                    stepEl.classList.toggle('active', i === this.currentLessonStep);
                } else {
                    stepEl.classList.remove('active');
                }
            }
        }
        
        // تحديث النقاط - إخفاء النقاط غير المتاحة
        const dots = document.querySelectorAll('#lesson-dots .dot');
        dots.forEach((dot, index) => {
            const stepNum = index + 1;
            if (stepNum <= this.totalLessonSteps) {
                dot.style.display = 'inline-block';
                dot.classList.toggle('active', stepNum === this.currentLessonStep);
            } else {
                dot.style.display = 'none';
            }
        });
        
        // تحديث الأزرار
        const btnPrev = document.getElementById('btn-prev-lesson');
        const btnNext = document.getElementById('btn-next-lesson');
        const btnStart = document.getElementById('btn-start-after-lesson');
        
        if (btnPrev) {
            btnPrev.disabled = this.currentLessonStep === 1;
        }
        
        if (btnNext) {
            if (this.currentLessonStep === this.totalLessonSteps) {
                btnNext.style.display = 'none';
            } else {
                btnNext.style.display = 'inline-flex';
            }
        }
        
        if (btnStart) {
            if (this.currentLessonStep === this.totalLessonSteps) {
                btnStart.style.display = 'block';
            } else {
                btnStart.style.display = 'none';
            }
        }
    }
    
    // ==================== المثال المتحرك ====================
    
    nextExampleStep() {
        if (this.currentExampleStep < this.totalExampleSteps - 1) {
            this.currentExampleStep++;
            this.updateExampleUI();
        }
    }
    
    prevExampleStep() {
        if (this.currentExampleStep > 0) {
            this.currentExampleStep--;
            this.updateExampleUI();
        }
    }
    
    updateExampleUI() {
        // تحديث خطوات المصفوفة
        for (let i = 0; i < this.totalExampleSteps; i++) {
            const stepEl = document.getElementById(`example-step-${i}`);
            if (stepEl) {
                stepEl.classList.toggle('active', i === this.currentExampleStep);
            }
            // تحديث خطوات الشرح
            const explainEl = document.getElementById(`explanation-step-${i}`);
            if (explainEl) {
                explainEl.classList.toggle('active', i === this.currentExampleStep);
            }
        }
        
        // تحديث حالة الأزرار
        const btnPrev = document.getElementById('btn-prev-example');
        const btnNext = document.getElementById('btn-next-example');
        
        if (btnPrev) {
            btnPrev.disabled = this.currentExampleStep === 0;
        }
        
        if (btnNext) {
            btnNext.disabled = this.currentExampleStep === this.totalExampleSteps - 1;
        }
        
        // تحديث العداد
        const counter = document.getElementById('example-counter');
        if (counter) {
            counter.textContent = `خطوة ${this.currentExampleStep + 1} من ${this.totalExampleSteps}`;
        }
    }
}

// بدء اللعبة
const game = new GaussianGame();
