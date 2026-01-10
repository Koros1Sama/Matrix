/**
 * Determinant Tutorial
 * Animated tutorials for learning determinant calculation methods
 */

class DeterminantTutorial {
    constructor() {
        this.currentTutorial = 0;
        this.currentPhase = 0;
        this.isPlaying = false;
        this.animationAborted = false;
        
        // التعليمات الثلاثة
        this.tutorials = {
            1: this.getTutorial2x2(),
            2: this.getTutorial3x3Sarrus(),
            3: this.getTutorial4x4Cofactor()
        };
    }
    
    // ==================== TUTORIAL 1: 2x2 ====================
    getTutorial2x2() {
        return {
            title: "المحدد 2×2",
            subtitle: "الطريقة البسيطة",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 ما هو المحدد؟',
                    content: `
                        <div class="tut-intro">
                            <p>المحدد (Determinant) هو <strong>رقم واحد</strong> يُحسب من المصفوفة المربعة.</p>
                            <div class="tut-uses">
                                <div class="use-item">📐 يخبرنا هل للمصفوفة معكوس</div>
                                <div class="use-item">🧮 يساعد في حل المعادلات (كرامر)</div>
                                <div class="use-item">📊 يحسب المساحات والحجوم</div>
                            </div>
                            <p class="tut-note">إذا كان المحدد = 0، فلا يوجد معكوس!</p>
                        </div>
                    `
                },
                {
                    type: 'formula',
                    title: '📝 صيغة المحدد 2×2',
                    matrix: [[' a', ' b'], [' c', ' d']],
                    formula: 'A| = ad - bc|',
                    explanation: 'نضرب القطر الرئيسي (ad) ونطرح منه القطر الثانوي (bc)'
                },
                {
                    type: 'visual',
                    title: '✨ التقاطع القطري',
                    matrix: [[3, 2], [1, 4]],
                    steps: [
                        { action: 'highlight-main-diag', text: 'القطر الرئيسي: 3 × 4 = 12', color: 'green' },
                        { action: 'highlight-anti-diag', text: 'القطر الثانوي: 2 × 1 = 2', color: 'red' },
                        { action: 'show-result', text: 'المحدد = 12 - 2 = 10', color: 'gold' }
                    ]
                },
                {
                    type: 'example',
                    title: '📖 مثال محلول',
                    matrix: [[5, -3], [2, 4]],
                    solution: {
                        step1: '5 × 4 = 20',
                        step2: '(-3) × 2 = -6',
                        step3: '20 - (-6) = 20 + 6 = 26',
                        answer: 26
                    }
                },
                {
                    type: 'practice',
                    title: '🎮 جاهز للتطبيق!',
                    content: `
                        <div class="tut-ready">
                            <p>الآن أنت تعرف كيف تحسب المحدد 2×2!</p>
                            <div class="formula-reminder">A| = ad - bc|</div>
                            <button class="btn btn-primary btn-lg" onclick="determinantTutorial.complete(1)">
                                ابدأ اللعب! 🚀
                            </button>
                        </div>
                    `
                }
            ]
        };
    }
    
    // ==================== TUTORIAL 2: 3x3 SARRUS ====================
    getTutorial3x3Sarrus() {
        return {
            title: "المحدد 3×3",
            subtitle: "طريقة ساروس (الأقطار)",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 طريقة ساروس',
                    content: `
                        <div class="tut-intro">
                            <p>لحساب محدد 3×3، نستخدم <strong>طريقة الأقطار</strong> (قاعدة ساروس).</p>
                            <p>الخطوات:</p>
                            <ol class="tut-steps">
                                <li>انسخ أول عمودين بعد المصفوفة</li>
                                <li>اضرب الأقطار الرئيسية ← <strong>موجب</strong></li>
                                <li>اضرب الأقطار الثانوية ← <strong>سالب</strong></li>
                                <li>اجمع الكل</li>
                            </ol>
                        </div>
                    `
                },
                {
                    type: 'extend-visual',
                    title: '📋 الخطوة 1: توسيع المصفوفة',
                    matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                    content: `
                        <div class="extend-visual-phase">
                            <p class="extend-instruction">نكرر <strong>العمود الأول</strong> و<strong>العمود الثاني</strong> على يمين المصفوفة:</p>
                            <div class="extend-visual-demo">
                                <div class="original-matrix-container">
                                    <div class="matrix-with-labels">
                                        <div class="column-labels">
                                            <span class="col-label col1-label">ع1</span>
                                            <span class="col-label col2-label">ع2</span>
                                            <span class="col-label col3-label">ع3</span>
                                        </div>
                                        <div class="visual-matrix-bordered">
                                            <div class="m-row">
                                                <span class="cell col1-cell">1</span>
                                                <span class="cell col2-cell">2</span>
                                                <span class="cell col3-cell">3</span>
                                            </div>
                                            <div class="m-row">
                                                <span class="cell col1-cell">4</span>
                                                <span class="cell col2-cell">5</span>
                                                <span class="cell col3-cell">6</span>
                                            </div>
                                            <div class="m-row">
                                                <span class="cell col1-cell">7</span>
                                                <span class="cell col2-cell">8</span>
                                                <span class="cell col3-cell">9</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="copy-arrows">
                                    <div class="copy-arrow arrow1">
                                        <span class="arrow-line"></span>
                                        <span class="arrow-text">نسخ ع1</span>
                                    </div>
                                    <div class="copy-arrow arrow2">
                                        <span class="arrow-line"></span>
                                        <span class="arrow-text">نسخ ع2</span>
                                    </div>
                                </div>
                                
                                <div class="extended-matrix-container">
                                    <div class="matrix-with-labels">
                                        <div class="column-labels extended">
                                            <span class="col-label col1-label">ع1</span>
                                            <span class="col-label col2-label">ع2</span>
                                            <span class="col-label col3-label">ع3</span>
                                            <span class="col-label col1-copy-label">ع1'</span>
                                            <span class="col-label col2-copy-label">ع2'</span>
                                        </div>
                                        <div class="visual-matrix-extended">
                                            <div class="m-row">
                                                <span class="cell col1-cell">1</span>
                                                <span class="cell col2-cell">2</span>
                                                <span class="cell col3-cell">3</span>
                                                <span class="cell col1-copy-cell">1</span>
                                                <span class="cell col2-copy-cell">2</span>
                                            </div>
                                            <div class="m-row">
                                                <span class="cell col1-cell">4</span>
                                                <span class="cell col2-cell">5</span>
                                                <span class="cell col3-cell">6</span>
                                                <span class="cell col1-copy-cell">4</span>
                                                <span class="cell col2-copy-cell">5</span>
                                            </div>
                                            <div class="m-row">
                                                <span class="cell col1-cell">7</span>
                                                <span class="cell col2-cell">8</span>
                                                <span class="cell col3-cell">9</span>
                                                <span class="cell col1-copy-cell">7</span>
                                                <span class="cell col2-copy-cell">8</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="extend-note-box">
                                <span class="note-icon">💡</span>
                                <span class="note-text">الأعمدة المكررة تساعدنا في رسم الأقطار بسهولة!</span>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'extend-practice',
                    title: '✍️ دورك: أكمل التوسيع',
                    matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                    content: `
                        <div class="extend-practice-phase">
                            <p class="practice-instruction">اكتب قيم العمودين المكررين:</p>
                            <div class="extend-practice-container">
                                <div class="practice-matrix">
                                    <div class="m-row">
                                        <span class="cell fixed">1</span>
                                        <span class="cell fixed">2</span>
                                        <span class="cell fixed">3</span>
                                        <input type="number" class="extend-input" data-row="0" data-col="3" data-expected="1" placeholder="?">
                                        <input type="number" class="extend-input" data-row="0" data-col="4" data-expected="2" placeholder="?">
                                    </div>
                                    <div class="m-row">
                                        <span class="cell fixed">4</span>
                                        <span class="cell fixed">5</span>
                                        <span class="cell fixed">6</span>
                                        <input type="number" class="extend-input" data-row="1" data-col="3" data-expected="4" placeholder="?">
                                        <input type="number" class="extend-input" data-row="1" data-col="4" data-expected="5" placeholder="?">
                                    </div>
                                    <div class="m-row">
                                        <span class="cell fixed">7</span>
                                        <span class="cell fixed">8</span>
                                        <span class="cell fixed">9</span>
                                        <input type="number" class="extend-input" data-row="2" data-col="3" data-expected="7" placeholder="?">
                                        <input type="number" class="extend-input" data-row="2" data-col="4" data-expected="8" placeholder="?">
                                    </div>
                                </div>
                                <div class="practice-hints">
                                    <div class="hint-box col1-hint">
                                        <span class="hint-label">العمود 4</span>
                                        <span class="hint-text">= نسخة من العمود 1</span>
                                    </div>
                                    <div class="hint-box col2-hint">
                                        <span class="hint-label">العمود 5</span>
                                        <span class="hint-text">= نسخة من العمود 2</span>
                                    </div>
                                </div>
                            </div>
                            <div class="practice-feedback" id="extend-feedback"></div>
                            <button class="btn btn-primary check-extend-btn" onclick="determinantTutorial.checkExtendPractice()">
                                تحقق من الإجابة ✓
                            </button>
                        </div>
                    `
                },
                {
                    type: 'diagonals-down',
                    title: '↘️ الأقطار الرئيسية (+)',
                    matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                    content: `
                        <div class="diagonals-animated-phase">
                            <div class="extended-matrix-visual">
                                <div class="ext-matrix-grid">
                                    <div class="ext-row">
                                        <span class="ext-cell" data-diag="d1">1</span>
                                        <span class="ext-cell" data-diag="d2">2</span>
                                        <span class="ext-cell" data-diag="d3">3</span>
                                        <span class="ext-cell copied">1</span>
                                        <span class="ext-cell copied">2</span>
                                    </div>
                                    <div class="ext-row">
                                        <span class="ext-cell">4</span>
                                        <span class="ext-cell" data-diag="d1">5</span>
                                        <span class="ext-cell" data-diag="d2">6</span>
                                        <span class="ext-cell copied" data-diag="d3">4</span>
                                        <span class="ext-cell copied">5</span>
                                    </div>
                                    <div class="ext-row">
                                        <span class="ext-cell">7</span>
                                        <span class="ext-cell">8</span>
                                        <span class="ext-cell" data-diag="d1">9</span>
                                        <span class="ext-cell copied" data-diag="d2">7</span>
                                        <span class="ext-cell copied" data-diag="d3">8</span>
                                    </div>
                                </div>
                                <div class="diagonal-lines down-lines">
                                    <svg class="diag-svg" viewBox="0 0 250 150">
                                        <line class="diag-line d1" x1="25" y1="25" x2="125" y2="125" />
                                        <line class="diag-line d2" x1="75" y1="25" x2="175" y2="125" />
                                        <line class="diag-line d3" x1="125" y1="25" x2="225" y2="125" />
                                    </svg>
                                </div>
                            </div>
                            <div class="diag-results-animated">
                                <div class="diag-result-item d1-result">
                                    <span class="diag-dot d1-dot"></span>
                                    <span class="diag-calc">1 × 5 × 9 = <strong>45</strong></span>
                                </div>
                                <div class="diag-result-item d2-result">
                                    <span class="diag-dot d2-dot"></span>
                                    <span class="diag-calc">2 × 6 × 7 = <strong>84</strong></span>
                                </div>
                                <div class="diag-result-item d3-result">
                                    <span class="diag-dot d3-dot"></span>
                                    <span class="diag-calc">3 × 4 × 8 = <strong>96</strong></span>
                                </div>
                                <div class="diag-sum-box positive">
                                    <span class="sum-label">المجموع (+)</span>
                                    <span class="sum-value">45 + 84 + 96 = <strong>225</strong></span>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'diagonals-up',
                    title: '↗️ الأقطار الثانوية (-)',
                    matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                    content: `
                        <div class="diagonals-animated-phase up-phase">
                            <div class="extended-matrix-visual">
                                <div class="ext-matrix-grid">
                                    <div class="ext-row">
                                        <span class="ext-cell">1</span>
                                        <span class="ext-cell">2</span>
                                        <span class="ext-cell" data-diag="u1">3</span>
                                        <span class="ext-cell copied" data-diag="u2">1</span>
                                        <span class="ext-cell copied" data-diag="u3">2</span>
                                    </div>
                                    <div class="ext-row">
                                        <span class="ext-cell">4</span>
                                        <span class="ext-cell" data-diag="u1">5</span>
                                        <span class="ext-cell" data-diag="u2">6</span>
                                        <span class="ext-cell copied" data-diag="u3">4</span>
                                        <span class="ext-cell copied">5</span>
                                    </div>
                                    <div class="ext-row">
                                        <span class="ext-cell" data-diag="u1">7</span>
                                        <span class="ext-cell" data-diag="u2">8</span>
                                        <span class="ext-cell" data-diag="u3">9</span>
                                        <span class="ext-cell copied">7</span>
                                        <span class="ext-cell copied">8</span>
                                    </div>
                                </div>
                                <div class="diagonal-lines up-lines">
                                    <svg class="diag-svg" viewBox="0 0 250 150">
                                        <line class="diag-line u1" x1="125" y1="25" x2="25" y2="125" />
                                        <line class="diag-line u2" x1="175" y1="25" x2="75" y2="125" />
                                        <line class="diag-line u3" x1="225" y1="25" x2="125" y2="125" />
                                    </svg>
                                </div>
                            </div>
                            <div class="diag-results-animated">
                                <div class="diag-result-item u1-result">
                                    <span class="diag-dot u1-dot"></span>
                                    <span class="diag-calc">3 × 5 × 7 = <strong>105</strong></span>
                                </div>
                                <div class="diag-result-item u2-result">
                                    <span class="diag-dot u2-dot"></span>
                                    <span class="diag-calc">1 × 6 × 8 = <strong>48</strong></span>
                                </div>
                                <div class="diag-result-item u3-result">
                                    <span class="diag-dot u3-dot"></span>
                                    <span class="diag-calc">2 × 4 × 9 = <strong>72</strong></span>
                                </div>
                                <div class="diag-sum-box negative">
                                    <span class="sum-label">المجموع (-)</span>
                                    <span class="sum-value">105 + 48 + 72 = <strong>225</strong></span>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'final-calc',
                    title: '🧮 الحساب النهائي',
                    calculation: {
                        down: 225,
                        up: 225,
                        result: '225 - 225 = 0'
                    },
                    content: `
                        <div class="final-calc-visual">
                            <div class="calc-breakdown">
                                <div class="calc-part positive-part">
                                    <div class="part-label">↘️ الأقطار الرئيسية</div>
                                    <div class="part-value">+225</div>
                                </div>
                                <div class="calc-operator">−</div>
                                <div class="calc-part negative-part">
                                    <div class="part-label">↗️ الأقطار الثانوية</div>
                                    <div class="part-value">225</div>
                                </div>
                                <div class="calc-equals">=</div>
                                <div class="calc-result-final">
                                    <div class="result-label">المحدد</div>
                                    <div class="result-value">0</div>
                                </div>
                            </div>
                            <div class="final-note">
                                <span class="note-icon">💡</span>
                                <span class="note-text">المحدد = 0 يعني المصفوفة ليس لها معكوس!</span>
                            </div>
                        </div>
                    `,
                    note: 'المحدد = 0 يعني المصفوفة ليس لها معكوس!'
                },
                {
                    type: 'practice',
                    title: '🎮 جاهز للتطبيق!',
                    content: `
                        <div class="tut-ready">
                            <p>أتقنت طريقة ساروس للمحدد 3×3!</p>
                            <div class="formula-reminder">
                                الهابطة (+) - الصاعدة (-)
                            </div>
                            <button class="btn btn-primary btn-lg" onclick="determinantTutorial.complete(2)">
                                ابدأ اللعب! 🚀
                            </button>
                        </div>
                    `
                }
            ]
        };
    }
    
    // ==================== TUTORIAL 3: 4x4+ COFACTOR ====================
    getTutorial4x4Cofactor() {
        return {
            title: "طريقة التوسيع (Cofactor)",
            subtitle: "للمصفوفات 3×3 وأكبر",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 الفكرة الأساسية',
                    content: `
                        <div class="tut-intro">
                            <p>طريقة ساروس تعمل <strong>فقط</strong> للمصفوفات 3×3</p>
                            <p>للمصفوفات الأكبر، نستخدم <strong>التوسيع بالعوامل المساعدة</strong></p>
                            <div class="tut-concept">
                                الفكرة: اختر صف أو عمود واحد<br>
                                لكل عنصر: احذف صفه وعموده → احسب محدد الباقي
                            </div>
                        </div>
                    `
                },
                {
                    type: 'row-col-choice',
                    title: '🔄 صف أو عمود؟',
                    content: `
                        <div class="row-col-choice-visual">
                            <p class="choice-intro">يمكنك التوسيع على <strong>صف</strong> أو <strong>عمود</strong>:</p>
                            <div class="dual-choice">
                                <div class="choice-option">
                                    <div class="option-label">التوسيع على <span class="row-label">الصف الأول</span></div>
                                    <div class="choice-matrix-demo">
                                        <div class="m-row row-highlight"><span>a</span><span>b</span><span>c</span></div>
                                        <div class="m-row"><span>d</span><span>e</span><span>f</span></div>
                                        <div class="m-row"><span>g</span><span>h</span><span>i</span></div>
                                    </div>
                                    <div class="expansion-result">= a×M₁₁ − b×M₁₂ + c×M₁₃</div>
                                </div>
                                <div class="choice-vs">أو</div>
                                <div class="choice-option">
                                    <div class="option-label">التوسيع على <span class="col-label">العمود الأول</span></div>
                                    <div class="choice-matrix-demo">
                                        <div class="m-row"><span class="col-highlight">a</span><span>b</span><span>c</span></div>
                                        <div class="m-row"><span class="col-highlight">d</span><span>e</span><span>f</span></div>
                                        <div class="m-row"><span class="col-highlight">g</span><span>h</span><span>i</span></div>
                                    </div>
                                    <div class="expansion-result">= a×M₁₁ − d×M₂₁ + g×M₃₁</div>
                                </div>
                            </div>
                            <div class="same-result-note">✅ كلاهما يعطي نفس النتيجة!</div>
                        </div>
                    `
                },
                {
                    type: 'smart-choice',
                    title: '💡 الاختيار الذكي',
                    content: `
                        <div class="smart-choice-demo">
                            <p class="choice-title">اختر الصف أو العمود الذي فيه <strong>أكثر أصفار</strong>:</p>
                            <div class="choice-comparison">
                                <div class="choice-bad">
                                    <div class="choice-label">❌ الصف الأول (بدون أصفار)</div>
                                    <div class="choice-matrix">
                                        <div class="m-row highlight-row"><span>3</span><span>2</span><span>1</span></div>
                                        <div class="m-row"><span class="zero">0</span><span>4</span><span class="zero">0</span></div>
                                        <div class="m-row"><span>5</span><span class="zero">0</span><span>2</span></div>
                                    </div>
                                    <p class="choice-result">= 3 حسابات محددات فرعية</p>
                                </div>
                                <div class="choice-good">
                                    <div class="choice-label">✅ الصف الثاني (صفرين!)</div>
                                    <div class="choice-matrix">
                                        <div class="m-row"><span>3</span><span>2</span><span>1</span></div>
                                        <div class="m-row highlight-row"><span class="zero">0</span><span>4</span><span class="zero">0</span></div>
                                        <div class="m-row"><span>5</span><span class="zero">0</span><span>2</span></div>
                                    </div>
                                    <p class="choice-result">= حساب واحد فقط! 🎯</p>
                                </div>
                            </div>
                            <div class="choice-tip">
                                <span class="tip-icon">💡</span>
                                0 × (أي محدد) = 0 → لا حاجة لحسابه!
                            </div>
                        </div>
                    `
                },
                {
                    type: 'expansion-3x3',
                    title: '📐 التوسيع على 3×3',
                    content: `
                        <div class="full-expansion">
                            <p class="exp-title">مثال: التوسيع على الصف الأول</p>
                            <div class="expansion-steps">
                                <div class="exp-step">
                                    <div class="step-header">
                                        <span class="step-sign positive">+</span>
                                        <span class="step-elem highlight-a">a</span>
                                        <span>×</span>
                                    </div>
                                    <div class="step-matrices">
                                        <div class="source-matrix">
                                            <div class="m-row"><span class="selected">a</span><span class="crossed-out">b</span><span class="crossed-out">c</span></div>
                                            <div class="m-row"><span class="crossed-out">d</span><span class="keep">e</span><span class="keep">f</span></div>
                                            <div class="m-row"><span class="crossed-out">g</span><span class="keep">h</span><span class="keep">i</span></div>
                                        </div>
                                        <span class="step-arrow">→</span>
                                        <div class="minor-matrix green-border">
                                            <div class="m-row"><span>e</span><span>f</span></div>
                                            <div class="m-row"><span>h</span><span>i</span></div>
                                        </div>
                                        <span class="step-calc">= ei − fh</span>
                                    </div>
                                </div>
                                <div class="exp-step">
                                    <div class="step-header">
                                        <span class="step-sign negative">−</span>
                                        <span class="step-elem highlight-b">b</span>
                                        <span>×</span>
                                    </div>
                                    <div class="step-matrices">
                                        <div class="source-matrix">
                                            <div class="m-row"><span class="crossed-out">a</span><span class="selected">b</span><span class="crossed-out">c</span></div>
                                            <div class="m-row"><span class="keep">d</span><span class="crossed-out">e</span><span class="keep">f</span></div>
                                            <div class="m-row"><span class="keep">g</span><span class="crossed-out">h</span><span class="keep">i</span></div>
                                        </div>
                                        <span class="step-arrow">→</span>
                                        <div class="minor-matrix red-border">
                                            <div class="m-row"><span>d</span><span>f</span></div>
                                            <div class="m-row"><span>g</span><span>i</span></div>
                                        </div>
                                        <span class="step-calc">= di − fg</span>
                                    </div>
                                </div>
                                <div class="exp-step">
                                    <div class="step-header">
                                        <span class="step-sign positive">+</span>
                                        <span class="step-elem highlight-c">c</span>
                                        <span>×</span>
                                    </div>
                                    <div class="step-matrices">
                                        <div class="source-matrix">
                                            <div class="m-row"><span class="crossed-out">a</span><span class="crossed-out">b</span><span class="selected">c</span></div>
                                            <div class="m-row"><span class="keep">d</span><span class="keep">e</span><span class="crossed-out">f</span></div>
                                            <div class="m-row"><span class="keep">g</span><span class="keep">h</span><span class="crossed-out">i</span></div>
                                        </div>
                                        <span class="step-arrow">→</span>
                                        <div class="minor-matrix green-border">
                                            <div class="m-row"><span>d</span><span>e</span></div>
                                            <div class="m-row"><span>g</span><span>h</span></div>
                                        </div>
                                        <span class="step-calc">= dh − eg</span>
                                    </div>
                                </div>
                            </div>
                            <div class="final-formula">
                                |A| = a(ei−fh) − b(di−fg) + c(dh−eg)
                            </div>
                        </div>
                    `
                },
                {
                    type: 'expansion-4x4',
                    title: '📊 التوسيع على 4×4',
                    content: `
                        <div class="full-expansion-4x4">
                            <p class="exp-title">مثال: التوسيع على الصف الأول</p>
                            <div class="matrix-4x4-main">
                                <div class="m-row"><span class="highlight-elem">1</span><span class="highlight-elem zero-elem">0</span><span class="highlight-elem">2</span><span class="highlight-elem zero-elem">0</span></div>
                                <div class="m-row"><span>3</span><span>1</span><span>0</span><span>2</span></div>
                                <div class="m-row"><span>0</span><span>2</span><span>1</span><span>0</span></div>
                                <div class="m-row"><span>1</span><span>0</span><span>3</span><span>4</span></div>
                            </div>
                            
                            <div class="expansion-4x4-breakdown">
                                <div class="term-4x4 active-term">
                                    <div class="term-header">
                                        <span class="term-sign positive">+1</span>
                                        <span class="term-x">×</span>
                                    </div>
                                    <div class="term-minor">
                                        <div class="m-row"><span>1</span><span>0</span><span>2</span></div>
                                        <div class="m-row"><span>2</span><span>1</span><span>0</span></div>
                                        <div class="m-row"><span>0</span><span>3</span><span>4</span></div>
                                    </div>
                                    <div class="term-note">محدد 3×3</div>
                                </div>
                                
                                <div class="term-4x4 zero-term-4x4">
                                    <div class="term-header">
                                        <span class="term-sign negative">−0</span>
                                        <span class="term-x">×</span>
                                    </div>
                                    <div class="term-minor faded">
                                        <div class="m-row"><span>3</span><span>0</span><span>2</span></div>
                                        <div class="m-row"><span>0</span><span>1</span><span>0</span></div>
                                        <div class="m-row"><span>1</span><span>3</span><span>4</span></div>
                                    </div>
                                    <div class="term-note skip-note">= 0 ✓</div>
                                </div>
                                
                                <div class="term-4x4 active-term">
                                    <div class="term-header">
                                        <span class="term-sign positive">+2</span>
                                        <span class="term-x">×</span>
                                    </div>
                                    <div class="term-minor">
                                        <div class="m-row"><span>3</span><span>1</span><span>2</span></div>
                                        <div class="m-row"><span>0</span><span>2</span><span>0</span></div>
                                        <div class="m-row"><span>1</span><span>0</span><span>4</span></div>
                                    </div>
                                    <div class="term-note">محدد 3×3</div>
                                </div>
                                
                                <div class="term-4x4 zero-term-4x4">
                                    <div class="term-header">
                                        <span class="term-sign negative">−0</span>
                                        <span class="term-x">×</span>
                                    </div>
                                    <div class="term-minor faded">
                                        <div class="m-row"><span>3</span><span>1</span><span>0</span></div>
                                        <div class="m-row"><span>0</span><span>2</span><span>1</span></div>
                                        <div class="m-row"><span>1</span><span>0</span><span>3</span></div>
                                    </div>
                                    <div class="term-note skip-note">= 0 ✓</div>
                                </div>
                            </div>
                            
                            <div class="savings-note">
                                <span class="savings-icon">⚡</span>
                                وفّرنا حساب محددين 3×3 بفضل الأصفار!
                            </div>
                        </div>
                    `
                },
                {
                    type: 'minor-calculation',
                    title: '🧮 حساب المحدد الفرعي 3×3',
                    content: `
                        <div class="minor-calc-demo">
                            <p class="calc-title">كل محدد فرعي 3×3 يُحسب بطريقة ساروس:</p>
                            <div class="minor-calc-example">
                                <div class="minor-source">
                                    <div class="minor-label">المحدد الفرعي الأول:</div>
                                    <div class="minor-matrix-calc">
                                        <div class="m-row"><span>1</span><span>0</span><span>2</span></div>
                                        <div class="m-row"><span>2</span><span>1</span><span>0</span></div>
                                        <div class="m-row"><span>0</span><span>3</span><span>4</span></div>
                                    </div>
                                </div>
                                <div class="sarrus-calc">
                                    <div class="sarrus-down">
                                        <span class="sarrus-label">↘ الأقطار الرئيسية:</span>
                                        <span class="sarrus-values">1×1×4 + 0×0×0 + 2×2×3 = 4 + 0 + 12 = <strong>16</strong></span>
                                    </div>
                                    <div class="sarrus-up">
                                        <span class="sarrus-label">↗ الأقطار الثانوية:</span>
                                        <span class="sarrus-values">2×1×0 + 1×0×3 + 0×2×4 = 0 + 0 + 0 = <strong>0</strong></span>
                                    </div>
                                    <div class="sarrus-result">
                                        = 16 − 0 = <strong class="result-value">16</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'sign-pattern',
                    title: '🔢 نمط الإشارات',
                    content: `
                        <div class="sign-explanation">
                            <p>الإشارات تتبدل + و − مثل رقعة الشطرنج:</p>
                            <div class="sign-grids-row">
                                <div class="sign-grid-labeled">
                                    <p class="grid-label">3×3</p>
                                    <div class="sign-grid chess-pattern">
                                        <div class="sign-row">
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                        </div>
                                        <div class="sign-row">
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                        </div>
                                        <div class="sign-row">
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="sign-grid-labeled">
                                    <p class="grid-label">4×4</p>
                                    <div class="sign-grid chess-pattern">
                                        <div class="sign-row">
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                        </div>
                                        <div class="sign-row">
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                        </div>
                                        <div class="sign-row">
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                        </div>
                                        <div class="sign-row">
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                            <span class="sign minus">−</span>
                                            <span class="sign plus">+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="sign-formula">القاعدة: إشارة (i,j) = (-1)<sup>i+j</sup></p>
                        </div>
                    `
                },
                {
                    type: 'practice',
                    title: '🎮 جاهز للتطبيق!',
                    content: `
                        <div class="tut-ready">
                            <p>ملخص الخطوات:</p>
                            <div class="formula-reminder">
                                1. اختر الصف/العمود بأكثر أصفار<br>
                                2. لكل عنصر ≠ 0:<br>
                                   &nbsp;&nbsp;&nbsp;• حدد الإشارة (+/−)<br>
                                   &nbsp;&nbsp;&nbsp;• احسب المحدد الفرعي<br>
                                   &nbsp;&nbsp;&nbsp;• اضرب: إشارة × عنصر × محدد<br>
                                3. اجمع كل النتائج
                            </div>
                            <button class="btn btn-primary btn-lg" onclick="determinantTutorial.complete(3)">
                                ابدأ التطبيق! 🚀
                            </button>
                        </div>
                    `
                }
            ]
        };
    }
                    
    // ==================== DISPLAY METHODS ====================
    
    show(tutorialNum) {
        const tutorial = this.tutorials[tutorialNum];
        if (!tutorial) return;
        
        this.currentTutorial = tutorialNum;
        this.currentPhase = 0;
        
        // Bind keyboard events
        this.boundKeyHandler = this.handleKeyboard.bind(this);
        document.addEventListener('keydown', this.boundKeyHandler);
        
        // Show tutorial modal/screen
        this.render();
    }
    
    // ==================== KEYBOARD NAVIGATION ====================
    
    handleKeyboard(e) {
        const container = document.getElementById('determinant-tutorial-container');
        if (!container || container.style.display === 'none') return;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            this.next();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.prev();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
        }
    }
    
    render() {
        const container = document.getElementById('determinant-tutorial-container');
        if (!container) return;
        
        const tutorial = this.tutorials[this.currentTutorial];
        const phase = tutorial.phases[this.currentPhase];
        
        let html = `
            <div class="det-tutorial-wrapper" style="position: relative">
                <button class="btn btn-back" style="position: absolute; top: 20px; left: 20px; z-index: 10" onclick="determinantTutorial.close()">
                    <span>→</span> رجوع
                </button>
                <div class="det-tut-header">
                    <h2>${tutorial.title}</h2>
                    <p class="subtitle">${tutorial.subtitle}</p>
                    <div class="det-phase-indicator">
                        ${tutorial.phases.map((_, i) => 
                            `<span class="det-phase-dot ${i === this.currentPhase ? 'active' : ''} ${i < this.currentPhase ? 'done' : ''}"></span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="det-tut-content">
                    <h3 class="phase-title">${phase.title}</h3>
                    <div class="phase-body">
                        ${this.renderPhase(phase)}
                    </div>
                </div>
                
                <div class="det-tut-nav">
                    <button class="btn btn-secondary" onclick="determinantTutorial.prev()" 
                            ${this.currentPhase === 0 ? 'disabled' : ''}>
                        ← السابق
                    </button>
                    <span class="phase-number">${this.currentPhase + 1} / ${tutorial.phases.length}</span>
                    <button class="btn btn-primary" onclick="determinantTutorial.next()"
                            ${this.currentPhase === tutorial.phases.length - 1 ? 'style="display:none"' : ''}>
                        التالي →
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        container.style.display = 'block';
        
        // Run animations for this phase
        this.animatePhase(phase);
    }
    
    renderPhase(phase) {
        switch (phase.type) {
            case 'intro':
            case 'practice':
            case 'visual-expansion':
            case 'worked-example':
            case 'row-choice':
            case 'example-4x4':
            case 'row-col-choice':
            case 'smart-choice':
            case 'expansion-3x3':
            case 'expansion-4x4':
            case 'expansion-visual-3x3':
            case 'minor-calculation':
            case 'extend-visual':
            case 'extend-practice':
                return phase.content;
            
            case 'formula':
                return this.renderFormulaPhase(phase);
            
            case 'visual':
                return this.renderVisualPhase(phase);
            
            case 'example':
                return this.renderExamplePhase(phase);
            
            case 'extend':
                return this.renderExtendPhase(phase);
            
            case 'diagonals-down':
            case 'diagonals-up':
            case 'final-calc':
                return phase.content || this.renderDiagonalsPhase(phase);
            
            case 'sign-pattern':
                return phase.content;
            
            case 'minor-example':
                return this.renderMinorPhase(phase);
            
            case 'cofactor-calc':
                return this.renderCofactorPhase(phase);
            
            case 'full-example':
                return this.renderFullExamplePhase(phase);
            
            default:
                return '<p>محتوى غير متوفر</p>';
        }
    }
    
    renderMatrix(matrix, className = '') {
        const n = matrix.length;
        let html = `<div class="tut-matrix ${className}" style="grid-template-columns: repeat(${n}, 1fr);">`;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                html += `<div class="tut-cell" data-row="${i}" data-col="${j}">${matrix[i][j]}</div>`;
            }
        }
        html += '</div>';
        return html;
    }
    
    renderFormulaPhase(phase) {
        return `
            <div class="formula-phase">
                ${this.renderMatrix(phase.matrix, 'formula-matrix')}
                <div class="formula-equals">=</div>
                <div class="formula-result">${phase.formula}</div>
            </div>
            <p class="formula-explanation">${phase.explanation}</p>
        `;
    }
    
    renderVisualPhase(phase) {
        const n = phase.matrix.length;
        // Render matrix with diagonal data for highlighting
        let matrixHtml = `<div class="tut-matrix visual-matrix" style="grid-template-columns: repeat(${n}, 1fr);">`;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                // Determine if cell is on main diagonal (i === j) or anti-diagonal (i + j === n - 1)
                const isMainDiag = (i === j);
                const isAntiDiag = (i + j === n - 1);
                const diagClass = isMainDiag ? 'main-diag-cell' : (isAntiDiag ? 'anti-diag-cell' : '');
                matrixHtml += `<div class="tut-cell ${diagClass}" data-row="${i}" data-col="${j}">${phase.matrix[i][j]}</div>`;
            }
        }
        matrixHtml += '</div>';
        
        return `
            <div class="visual-phase">
                ${matrixHtml}
                <div class="visual-steps" id="visual-steps">
                    ${phase.steps.map((s, i) => `
                        <div class="visual-step" data-step="${i}" data-action="${s.action}" style="opacity: 0">
                            <span class="step-indicator" style="background: ${s.color}">●</span>
                            <span class="step-text">${s.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderExamplePhase(phase) {
        const sol = phase.solution;
        return `
            <div class="example-phase">
                ${this.renderMatrix(phase.matrix, 'example-matrix')}
                <div class="example-solution">
                    <div class="sol-step">الخطوة 1: ${sol.step1}</div>
                    <div class="sol-step">الخطوة 2: ${sol.step2}</div>
                    <div class="sol-step final">الخطوة 3: ${sol.step3}</div>
                    <div class="sol-answer">المحدد = ${sol.answer}</div>
                </div>
            </div>
        `;
    }
    
    renderExtendPhase(phase) {
        const m = phase.matrix;
        return `
            <div class="extend-phase">
                <div class="extend-display">
                    ${this.renderMatrix(m, 'base-matrix')}
                    <div class="extend-arrow">→</div>
                    <div class="extended-matrix">
                        ${this.renderMatrix([
                            [...m[0], m[0][0], m[0][1]],
                            [...m[1], m[1][0], m[1][1]],
                            [...m[2], m[2][0], m[2][1]]
                        ], 'full-extended')}
                    </div>
                </div>
                <p class="extend-note">${phase.explanation}</p>
            </div>
        `;
    }
    
    renderDiagonalsPhase(phase) {
        const isDown = phase.type === 'diagonals-down';
        return `
            <div class="diagonals-phase ${isDown ? 'down' : 'up'}">
                ${this.renderMatrix(phase.matrix, 'diag-matrix')}
                <div class="diag-list">
                    ${phase.diagonals.map((d, i) => `
                        <div class="diag-item" data-diag="${i}">
                            <span class="diag-color" style="background: ${isDown ? ['#10b981', '#3b82f6', '#8b5cf6'][i] : ['#ef4444', '#f59e0b', '#ec4899'][i]}"></span>
                            <span class="diag-result">${d.result}</span>
                        </div>
                    `).join('')}
                    <div class="diag-sum">${phase.sum}</div>
                </div>
            </div>
        `;
    }
    
    renderFinalCalcPhase(phase) {
        const c = phase.calculation;
        return `
            <div class="final-calc-phase">
                <div class="calc-parts">
                    <div class="calc-down">الهابطة: ${c.down}</div>
                    <div class="calc-minus">-</div>
                    <div class="calc-up">الصاعدة: ${c.up}</div>
                </div>
                <div class="calc-result">${c.result}</div>
                ${phase.note ? `<p class="calc-note">💡 ${phase.note}</p>` : ''}
            </div>
        `;
    }
    
    renderMinorPhase(phase) {
        return `
            <div class="minor-phase">
                <div class="minor-display">
                    ${this.renderMatrix(phase.matrix, 'minor-base')}
                    <div class="arrow">→</div>
                    ${this.renderMatrix(phase.minor, 'minor-result')}
                </div>
                <p class="minor-note">${phase.explanation}</p>
            </div>
        `;
    }
    
    renderCofactorPhase(phase) {
        return `
            <div class="cofactor-phase">
                <div class="cofactor-steps">
                    ${phase.steps.map(s => `<div class="cof-step">${s}</div>`).join('')}
                </div>
                <div class="cofactor-formula">${phase.formula}</div>
            </div>
        `;
    }
    
    renderFullExamplePhase(phase) {
        return `
            <div class="full-example-phase">
                ${this.renderMatrix(phase.matrix, 'full-ex-matrix')}
                <div class="expansion-display">
                    ${phase.expansion.map((e, i) => `
                        <div class="expand-term">
                            <span class="term-sign">${e.sign}</span>
                            <span class="term-element">${e.element}</span>
                            <span class="term-times">×</span>
                            <span class="term-minor">det${this.renderMatrix(e.minor, 'mini-minor')}</span>
                            <span class="term-equals">=</span>
                            <span class="term-product">${e.product}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="expansion-total">المجموع: ${phase.total}</div>
            </div>
        `;
    }
    
    // ==================== ANIMATION ====================
    
    async animatePhase(phase) {
        if (phase.type === 'visual') {
            await this.animateVisualSteps(phase);
        }
    }
    
    async animateVisualSteps(phase) {
        for (let i = 0; i < phase.steps.length; i++) {
            await this.delay(800);
            
            const step = phase.steps[i];
            const stepEl = document.querySelector(`[data-step="${i}"]`);
            
            // Highlight appropriate diagonal cells
            if (step.action === 'highlight-main-diag') {
                document.querySelectorAll('.main-diag-cell').forEach(cell => {
                    cell.classList.add('highlight-green');
                });
            } else if (step.action === 'highlight-anti-diag') {
                document.querySelectorAll('.anti-diag-cell').forEach(cell => {
                    cell.classList.add('highlight-red');
                });
            }
            
            // Show the step text
            if (stepEl) {
                stepEl.style.transition = 'opacity 0.5s ease';
                stepEl.style.opacity = '1';
            }
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ==================== NAVIGATION ====================
    
    next() {
        const tutorial = this.tutorials[this.currentTutorial];
        if (this.currentPhase < tutorial.phases.length - 1) {
            this.currentPhase++;
            this.render();
        }
    }
    
    prev() {
        if (this.currentPhase > 0) {
            this.currentPhase--;
            this.render();
        }
    }
    
    complete(tutorialNum) {
        // Mark tutorial as complete
        if (typeof detGame !== 'undefined') {
            detGame.completeTutorial(tutorialNum);
        }
        
        // Hide tutorial
        const container = document.getElementById('determinant-tutorial-container');
        if (container) container.style.display = 'none';
        
        // Remove keyboard listener
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
        
        // Start the first level for this tutorial
        const firstLevel = tutorialNum === 1 ? 1 : (tutorialNum === 2 ? 3 : 6);
        if (typeof detGame !== 'undefined') {
            detGame.startLevel(firstLevel);
        }
    }
    
    close() {
        const container = document.getElementById('determinant-tutorial-container');
        if (container) container.style.display = 'none';
        
        // Remove keyboard listener
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
    }
    
    // ==================== EXTEND PRACTICE ====================
    
    checkExtendPractice() {
        const inputs = document.querySelectorAll('.extend-input');
        const feedback = document.getElementById('extend-feedback');
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
            feedback.innerHTML = `
                <div class="feedback-success">
                    <span class="feedback-icon">✅</span>
                    <span class="feedback-text">ممتاز! أكملت التوسيع بشكل صحيح!</span>
                </div>
            `;
            feedback.className = 'practice-feedback success';
            
            // Auto-advance after a short delay
            setTimeout(() => {
                this.next();
            }, 1500);
        } else {
            feedback.innerHTML = `
                <div class="feedback-error">
                    <span class="feedback-icon">❌</span>
                    <span class="feedback-text">يوجد ${incorrectCount} خطأ. تذكر: نسخ العمود الأول والثاني!</span>
                </div>
            `;
            feedback.className = 'practice-feedback error';
        }
    }
}

// Initialize
let determinantTutorial;
document.addEventListener('DOMContentLoaded', () => {
    determinantTutorial = new DeterminantTutorial();
});
