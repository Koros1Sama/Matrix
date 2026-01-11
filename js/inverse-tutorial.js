/**
 * Matrix Inverse Tutorial System
 * Interactive tutorials for learning to solve systems using Matrix Inverse (Gauss-Jordan)
 * Styled to match the cramer and determinant tutorials
 */

class InverseTutorial {
    constructor() {
        this.currentTutorial = 1;
        this.currentPhase = 0;
        this.isPlaying = false;
        
        // التعليمات الثلاثة
        this.tutorials = {
            1: this.getTutorial2x2(),
            2: this.getTutorial3x3(),
            3: this.getTutorial4x4()
        };
        
        // دعم لوحة المفاتيح
        this.setupKeyboardNavigation();
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const container = document.getElementById('inverse-tutorial-container');
            if (!container || container.style.display === 'none') return;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.nextPhase();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.prevPhase();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            }
        });
    }
    
    // ==================== TUTORIAL 1: 2x2 ====================
    getTutorial2x2() {
        return {
            title: "طريقة المعكوس 2×2",
            subtitle: "حل نظام بمتغيرين باستخدام المعكوس",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 ما هو معكوس المصفوفة؟',
                    content: `
                        <div class="tut-intro">
                            <p>معكوس المصفوفة <strong>A</strong> (نرمز له A<sup>-1</sup>) هو مصفوفة خاصة تحقق:</p>
                            
                            <div class="main-formula-box">
                                <div class="formula-title">🔑 التعريف الأساسي:</div>
                                <div class="formula-row big-formula">
                                    <span class="matrix-name">A</span>
                                    <span class="times">×</span>
                                    <span class="matrix-name inverse">A<sup>-1</sup></span>
                                    <span class="equals">=</span>
                                    <span class="matrix-name identity">I</span>
                                    <span class="note">(مصفوفة الوحدة)</span>
                                </div>
                            </div>
                            
                            <div class="tut-uses">
                                <div class="use-item">📐 <strong>مصفوفة الوحدة I</strong> = العدد 1 للمصفوفات</div>
                                <div class="use-item">🔄 <strong>المعكوس A<sup>-1</sup></strong> = يلغي تأثير A</div>
                                <div class="use-item">⚡ <strong>الشرط:</strong> |A| ≠ 0 حتى يوجد المعكوس</div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'identity-explain',
                    title: '🔢 مصفوفة الوحدة I',
                    content: `
                        <div class="cramer-formula-phase">
                            <p>مصفوفة الوحدة هي مصفوفة قطرية تحتوي على <strong>1</strong> في القطر الرئيسي و<strong>0</strong> في باقي الخلايا:</p>
                            
                            <div class="matrices-row identity-examples">
                                <div class="matrix-box">
                                    <div class="matrix-label">مصفوفة 2×2</div>
                                    <div class="visual-matrix">
                                        <span class="bracket">[</span>
                                        <div class="matrix-inner">
                                            <div class="m-row"><span class="diag">1</span> <span class="zero">0</span></div>
                                            <div class="m-row"><span class="zero">0</span> <span class="diag">1</span></div>
                                        </div>
                                        <span class="bracket">]</span>
                                    </div>
                                </div>
                                
                                <div class="matrix-box">
                                    <div class="matrix-label">مصفوفة 3×3</div>
                                    <div class="visual-matrix">
                                        <span class="bracket">[</span>
                                        <div class="matrix-inner">
                                            <div class="m-row"><span class="diag">1</span> <span class="zero">0</span> <span class="zero">0</span></div>
                                            <div class="m-row"><span class="zero">0</span> <span class="diag">1</span> <span class="zero">0</span></div>
                                            <div class="m-row"><span class="zero">0</span> <span class="zero">0</span> <span class="diag">1</span></div>
                                        </div>
                                        <span class="bracket">]</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="formula-key">
                                <div class="key-item"><span class="dot green"></span> القطر الرئيسي = 1</div>
                                <div class="key-item"><span class="dot gray"></span> باقي العناصر = 0</div>
                            </div>
                            
                            <p class="tut-note">💡 عند ضرب أي مصفوفة في I، تبقى كما هي: A × I = A</p>
                        </div>
                    `
                },
                {
                    type: 'why-inverse',
                    title: '💡 لماذا نستخدم المعكوس؟',
                    content: `
                        <div class="cramer-formula-phase">
                            <p>لحل نظام المعادلات <strong>AX = B</strong> نريد إيجاد قيم X:</p>
                            
                            <div class="solving-steps algebra-steps">
                                <div class="cramer-step">
                                    <div class="step-header">
                                        <span class="step-number">1</span>
                                        <span class="step-reason">المعادلة الأصلية</span>
                                    </div>
                                    <div class="step-body algebra">
                                        <span class="matrix-name">A</span>
                                        <span class="times">×</span>
                                        <span class="matrix-name var">X</span>
                                        <span class="equals">=</span>
                                        <span class="matrix-name const">B</span>
                                    </div>
                                </div>
                                
                                <div class="cramer-step">
                                    <div class="step-header">
                                        <span class="step-number">2</span>
                                        <span class="step-reason">نضرب الطرفين في A<sup>-1</sup> من اليسار</span>
                                    </div>
                                    <div class="step-body algebra">
                                        <span class="matrix-name inverse">A<sup>-1</sup></span>
                                        <span class="times">×</span>
                                        <span class="matrix-name">A</span>
                                        <span class="times">×</span>
                                        <span class="matrix-name var">X</span>
                                        <span class="equals">=</span>
                                        <span class="matrix-name inverse">A<sup>-1</sup></span>
                                        <span class="times">×</span>
                                        <span class="matrix-name const">B</span>
                                    </div>
                                </div>
                                
                                <div class="cramer-step highlight-step">
                                    <div class="step-header">
                                        <span class="step-number">3</span>
                                        <span class="step-reason">A<sup>-1</sup> × A = I (تتعادلان!)</span>
                                    </div>
                                    <div class="step-body algebra">
                                        <span class="matrix-name identity">I</span>
                                        <span class="times">×</span>
                                        <span class="matrix-name var">X</span>
                                        <span class="equals">=</span>
                                        <span class="matrix-name inverse">A<sup>-1</sup></span>
                                        <span class="times">×</span>
                                        <span class="matrix-name const">B</span>
                                    </div>
                                </div>
                                
                                <div class="cramer-step final-step">
                                    <div class="step-header">
                                        <span class="step-number">✓</span>
                                        <span class="step-reason">الحل النهائي!</span>
                                    </div>
                                    <div class="step-body algebra result">
                                        <span class="matrix-name var">X</span>
                                        <span class="equals">=</span>
                                        <span class="matrix-name inverse">A<sup>-1</sup></span>
                                        <span class="times">×</span>
                                        <span class="matrix-name const">B</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'method',
                    title: '🔧 كيف نجد المعكوس؟',
                    content: `
                        <div class="cramer-formula-phase">
                            <p>نستخدم طريقة <strong>غاوس-جوردان</strong> مع المصفوفة الموسعة:</p>
                            
                            <div class="visual-equation-mapping">
                                <div class="augmented-visual-box">
                                    <div class="aug-title">🎯 الخطوة الأساسية:</div>
                                    <div class="aug-transform">
                                        <div class="aug-side">
                                            <span class="aug-label">البداية</span>
                                            <div class="aug-matrix-display">
                                                <span class="bracket">[</span>
                                                <div class="aug-left">
                                                    <div class="m-row"><span>a</span><span>b</span></div>
                                                    <div class="m-row"><span>c</span><span>d</span></div>
                                                </div>
                                                <span class="aug-divider">|</span>
                                                <div class="aug-right">
                                                    <div class="m-row"><span class="diag">1</span><span class="zero">0</span></div>
                                                    <div class="m-row"><span class="zero">0</span><span class="diag">1</span></div>
                                                </div>
                                                <span class="bracket">]</span>
                                            </div>
                                            <span class="aug-desc">[ A | I ]</span>
                                        </div>
                                        
                                        <div class="transform-arrow">
                                            <span>عمليات الصفوف</span>
                                            <span class="arrow">→→→</span>
                                        </div>
                                        
                                        <div class="aug-side result-side">
                                            <span class="aug-label">النهاية</span>
                                            <div class="aug-matrix-display">
                                                <span class="bracket">[</span>
                                                <div class="aug-left identity">
                                                    <div class="m-row"><span class="diag">1</span><span class="zero">0</span></div>
                                                    <div class="m-row"><span class="zero">0</span><span class="diag">1</span></div>
                                                </div>
                                                <span class="aug-divider">|</span>
                                                <div class="aug-right result">
                                                    <div class="m-row"><span>?</span><span>?</span></div>
                                                    <div class="m-row"><span>?</span><span>?</span></div>
                                                </div>
                                                <span class="bracket">]</span>
                                            </div>
                                            <span class="aug-desc">[ I | A<sup>-1</sup> ]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="formula-key">
                                <div class="key-item"><span class="dot blue"></span> حوّل الجزء الأيسر (A) إلى مصفوفة الوحدة (I)</div>
                                <div class="key-item"><span class="dot green"></span> الجزء الأيمن يتحول تلقائياً إلى A<sup>-1</sup></div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'example-intro',
                    title: '✨ مثال عملي: البداية',
                    content: `
                        <div class="visual-with-formula">
                            <div class="example-system-box centered">
                                <div class="sys-title">📌 النظام:</div>
                                <div class="sys-eq">2x + 1y = <span class="const-glow">5</span></div>
                                <div class="sys-eq">1x + 1y = <span class="const-glow">3</span></div>
                            </div>
                            
                            <div class="matrices-row">
                                <div class="matrix-box">
                                    <div class="matrix-label">المعاملات A</div>
                                    <div class="visual-matrix">
                                        <span class="bracket">[</span>
                                        <div class="matrix-inner">
                                            <div class="m-row"><span class="coef-a">2</span> <span class="coef-b">1</span></div>
                                            <div class="m-row"><span class="coef-a">1</span> <span class="coef-b">1</span></div>
                                        </div>
                                        <span class="bracket">]</span>
                                    </div>
                                </div>
                                
                                <div class="matrix-box">
                                    <div class="matrix-label">الثوابت B</div>
                                    <div class="visual-matrix">
                                        <span class="bracket">[</span>
                                        <div class="matrix-inner">
                                            <div class="m-row"><span class="const-e">5</span></div>
                                            <div class="m-row"><span class="const-e">3</span></div>
                                        </div>
                                        <span class="bracket">]</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="solving-steps">
                                <div class="cramer-step">
                                    <div class="step-header">
                                        <span class="step-number">1</span>
                                        <span class="step-reason">نجهز المصفوفة الموسعة [A | I]</span>
                                    </div>
                                    <div class="step-body">
                                        <div class="aug-matrix-display large">
                                            <span class="bracket">[</span>
                                            <div class="aug-left">
                                                <div class="m-row"><span class="pivot">2</span><span>1</span></div>
                                                <div class="m-row"><span>1</span><span>1</span></div>
                                            </div>
                                            <span class="aug-divider">|</span>
                                            <div class="aug-right">
                                                <div class="m-row"><span class="diag">1</span><span class="zero">0</span></div>
                                                <div class="m-row"><span class="zero">0</span><span class="diag">1</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'example-step1',
                    title: '✨ الخطوة 2: تصفير تحت القائد',
                    content: `
                        <div class="visual-with-formula">
                            <div class="solving-steps">
                                <div class="cramer-step highlight-step">
                                    <div class="step-header">
                                        <span class="step-number">2</span>
                                        <span class="step-reason">R₂ ← R₂ - ½R₁ <span class="op-note">(لتصفير العنصر تحت القائد)</span></span>
                                    </div>
                                    <div class="step-body">
                                        <div class="operation-explanation">
                                            <div class="op-row">الصف الجديد R₂ = الصف القديم R₂ - (½ × R₁)</div>
                                            <div class="op-calc">[1, 1 | 0, 1] - ½×[2, 1 | 1, 0] = [0, ½ | -½, 1]</div>
                                        </div>
                                        <div class="aug-matrix-display large">
                                            <span class="bracket">[</span>
                                            <div class="aug-left">
                                                <div class="m-row"><span class="pivot">2</span><span>1</span></div>
                                                <div class="m-row changed"><span class="zero-new">0</span><span>½</span></div>
                                            </div>
                                            <span class="aug-divider">|</span>
                                            <div class="aug-right">
                                                <div class="m-row"><span>1</span><span>0</span></div>
                                                <div class="m-row changed"><span>-½</span><span>1</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="cramer-step">
                                    <div class="step-header">
                                        <span class="step-number">3</span>
                                        <span class="step-reason">R₂ ← 2×R₂ <span class="op-note">(لجعل القائد الثاني = 1)</span></span>
                                    </div>
                                    <div class="step-body">
                                        <div class="aug-matrix-display large">
                                            <span class="bracket">[</span>
                                            <div class="aug-left">
                                                <div class="m-row"><span class="pivot">2</span><span>1</span></div>
                                                <div class="m-row"><span class="zero">0</span><span class="pivot">1</span></div>
                                            </div>
                                            <span class="aug-divider">|</span>
                                            <div class="aug-right">
                                                <div class="m-row"><span>1</span><span>0</span></div>
                                                <div class="m-row changed"><span>-1</span><span>2</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'example-step2',
                    title: '✨ الخطوة 4: تصفير فوق القائد',
                    content: `
                        <div class="visual-with-formula">
                            <div class="solving-steps">
                                <div class="cramer-step highlight-step">
                                    <div class="step-header">
                                        <span class="step-number">4</span>
                                        <span class="step-reason">R₁ ← R₁ - R₂ <span class="op-note">(لتصفير فوق القائد الثاني)</span></span>
                                    </div>
                                    <div class="step-body">
                                        <div class="aug-matrix-display large">
                                            <span class="bracket">[</span>
                                            <div class="aug-left">
                                                <div class="m-row changed"><span>2</span><span class="zero-new">0</span></div>
                                                <div class="m-row"><span class="zero">0</span><span class="pivot">1</span></div>
                                            </div>
                                            <span class="aug-divider">|</span>
                                            <div class="aug-right">
                                                <div class="m-row changed"><span>2</span><span>-2</span></div>
                                                <div class="m-row"><span>-1</span><span>2</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="cramer-step final-step">
                                    <div class="step-header">
                                        <span class="step-number">5</span>
                                        <span class="step-reason">R₁ ← ½×R₁ <span class="op-note">(لجعل القائد الأول = 1)</span></span>
                                    </div>
                                    <div class="step-body">
                                        <div class="aug-matrix-display large final">
                                            <span class="bracket">[</span>
                                            <div class="aug-left identity">
                                                <div class="m-row"><span class="pivot">1</span><span class="zero">0</span></div>
                                                <div class="m-row"><span class="zero">0</span><span class="pivot">1</span></div>
                                            </div>
                                            <span class="aug-divider result">|</span>
                                            <div class="aug-right result">
                                                <div class="m-row"><span class="result-val">1</span><span class="result-val">-1</span></div>
                                                <div class="m-row"><span class="result-val">-1</span><span class="result-val">2</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                        <div class="result-callout">
                                            ✅ المعكوس A<sup>-1</sup> = الجزء الأيمن!
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'solve',
                    title: '🎯 إيجاد قيم المتغيرات',
                    content: `
                        <div class="visual-with-formula">
                            <div class="main-formula-box">
                                <div class="formula-title">📝 الآن نحسب X = A<sup>-1</sup> × B</div>
                            </div>
                            
                            <div class="matrix-multiplication-visual">
                                <div class="mult-matrices">
                                    <div class="mult-matrix inverse-m">
                                        <div class="mult-label">A<sup>-1</sup></div>
                                        <div class="visual-matrix">
                                            <span class="bracket">[</span>
                                            <div class="matrix-inner">
                                                <div class="m-row"><span>1</span> <span>-1</span></div>
                                                <div class="m-row"><span>-1</span> <span>2</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                    <span class="mult-sign">×</span>
                                    <div class="mult-matrix const-m">
                                        <div class="mult-label">B</div>
                                        <div class="visual-matrix">
                                            <span class="bracket">[</span>
                                            <div class="matrix-inner">
                                                <div class="m-row"><span>5</span></div>
                                                <div class="m-row"><span>3</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                    <span class="mult-sign">=</span>
                                    <div class="mult-matrix result-m">
                                        <div class="mult-label">X</div>
                                        <div class="visual-matrix">
                                            <span class="bracket">[</span>
                                            <div class="matrix-inner">
                                                <div class="m-row"><span class="result-val">2</span></div>
                                                <div class="m-row"><span class="result-val">1</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="solving-steps">
                                <div class="cramer-step highlight-step">
                                    <div class="step-header">
                                        <span class="step-number">x</span>
                                        <span class="step-reason">الصف الأول × عمود B</span>
                                    </div>
                                    <div class="step-body">
                                        <div class="calc">x = (1×5) + (-1×3) = 5 - 3 = <strong class="result">2</strong></div>
                                    </div>
                                </div>
                                
                                <div class="cramer-step highlight-step">
                                    <div class="step-header">
                                        <span class="step-number">y</span>
                                        <span class="step-reason">الصف الثاني × عمود B</span>
                                    </div>
                                    <div class="step-body">
                                        <div class="calc">y = (-1×5) + (2×3) = -5 + 6 = <strong class="result">1</strong></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="final-answer">
                                ✅ الحل: x = 2, y = 1
                            </div>
                        </div>
                    `
                },
                {
                    type: 'practice',
                    title: '🎮 جاهز للتطبيق!',
                    content: `
                        <div class="tut-ready">
                            <div class="ready-icon">🚀</div>
                            <p>الآن أنت تعرف كيف تحل النظام 2×2 بالمعكوس!</p>
                            
                            <div class="formula-reminder">
                                <div class="reminder-steps">
                                    <span>1️⃣ جهز [A | I]</span>
                                    <span>2️⃣ حوّل A → I</span>
                                    <span>3️⃣ اقرأ A<sup>-1</sup></span>
                                    <span>4️⃣ X = A<sup>-1</sup> × B</span>
                                </div>
                            </div>
                            
                            <button class="btn btn-primary btn-lg" onclick="inverseTutorial.complete(1)">
                                ابدأ اللعب! 🎮
                            </button>
                        </div>
                    `
                }
            ]
        };
    }
    
    // ==================== TUTORIAL 2: 3x3 ====================
    getTutorial3x3() {
        return {
            title: "طريقة المعكوس 3×3",
            subtitle: "حل نظام بثلاثة متغيرات",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 المعكوس للمصفوفة 3×3',
                    content: `
                        <div class="tut-intro">
                            <p>نفس المبدأ، لكن مع <strong>3 متغيرات</strong> و<strong>مصفوفة 3×3</strong>!</p>
                            
                            <div class="main-formula-box">
                                <div class="formula-title">🔑 القاعدة نفسها:</div>
                                <div class="formula-row big-formula">
                                    <span class="matrix-name var">X</span>
                                    <span class="equals">=</span>
                                    <span class="matrix-name inverse">A<sup>-1</sup></span>
                                    <span class="times">×</span>
                                    <span class="matrix-name const">B</span>
                                </div>
                            </div>
                            
                            <div class="tut-uses">
                                <div class="use-item">📐 المصفوفة الموسعة تصبح [A₃ₓ₃ | I₃ₓ₃]</div>
                                <div class="use-item">🧮 نحتاج عمليات أكثر للوصول للمعكوس</div>
                                <div class="use-item">⚡ تصفير فوق وتحت كل قائد</div>
                            </div>
                            
                            <p class="tut-note">💡 الصبر مطلوب! لكن الطريقة منهجية ومضمونة.</p>
                        </div>
                    `
                },
                {
                    type: 'setup-3x3',
                    title: '🔧 تجهيز المصفوفة 3×3',
                    content: `
                        <div class="cramer-formula-phase">
                            <p>نضع المصفوفة A بجانب مصفوفة الوحدة I:</p>
                            
                            <div class="augmented-visual-box large">
                                <div class="aug-matrix-display extra-large">
                                    <span class="bracket">[</span>
                                    <div class="aug-left">
                                        <div class="m-row"><span>a₁₁</span><span>a₁₂</span><span>a₁₃</span></div>
                                        <div class="m-row"><span>a₂₁</span><span>a₂₂</span><span>a₂₃</span></div>
                                        <div class="m-row"><span>a₃₁</span><span>a₃₂</span><span>a₃₃</span></div>
                                    </div>
                                    <span class="aug-divider">|</span>
                                    <div class="aug-right">
                                        <div class="m-row"><span class="diag">1</span><span class="zero">0</span><span class="zero">0</span></div>
                                        <div class="m-row"><span class="zero">0</span><span class="diag">1</span><span class="zero">0</span></div>
                                        <div class="m-row"><span class="zero">0</span><span class="zero">0</span><span class="diag">1</span></div>
                                    </div>
                                    <span class="bracket">]</span>
                                </div>
                                <div class="aug-labels">
                                    <span class="aug-label-left">A</span>
                                    <span class="aug-label-right">I</span>
                                </div>
                            </div>
                            
                            <div class="formula-key">
                                <div class="key-item"><span class="dot blue"></span> نعمل عمود بعمود من اليسار لليمين</div>
                                <div class="key-item"><span class="dot green"></span> نصفّر فوق وتحت كل قائد</div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'strategy',
                    title: '🧠 استراتيجية الحل',
                    content: `
                        <div class="cramer-formula-phase">
                            <p>نعمل على كل عمود بالترتيب:</p>
                            
                            <div class="solving-steps strategy-steps">
                                <div class="cramer-step">
                                    <div class="step-header">
                                        <span class="step-number">1</span>
                                        <span class="step-reason"><strong>العمود الأول</strong></span>
                                    </div>
                                    <div class="step-body">
                                        <div class="op-list">
                                            <div>• اجعل a₁₁ = 1 (بالضرب)</div>
                                            <div>• صفّر a₂₁ و a₃₁ (بالجمع)</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="cramer-step">
                                    <div class="step-header">
                                        <span class="step-number">2</span>
                                        <span class="step-reason"><strong>العمود الثاني</strong></span>
                                    </div>
                                    <div class="step-body">
                                        <div class="op-list">
                                            <div>• اجعل a₂₂ = 1</div>
                                            <div>• صفّر a₁₂ <strong class="above">(فوق)</strong> و a₃₂ <strong class="below">(تحت)</strong></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="cramer-step">
                                    <div class="step-header">
                                        <span class="step-number">3</span>
                                        <span class="step-reason"><strong>العمود الثالث</strong></span>
                                    </div>
                                    <div class="step-body">
                                        <div class="op-list">
                                            <div>• اجعل a₃₃ = 1</div>
                                            <div>• صفّر a₁₃ <strong class="above">(فوق)</strong> و a₂₃ <strong class="above">(فوق)</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <p class="tut-note">
                                💡 <strong>الفرق عن جاوس العادي:</strong> نصفّر فوق وتحت كل قائد (غاوس-جوردان)
                            </p>
                        </div>
                    `
                },
                {
                    type: 'example-3x3',
                    title: '✨ مثال: نظام 3×3',
                    content: `
                        <div class="visual-with-formula">
                            <div class="example-system-box centered">
                                <div class="sys-title">📌 النظام:</div>
                                <div class="sys-eq">1x + 3y + 3z = <span class="const-glow">1</span></div>
                                <div class="sys-eq">1x + 4y + 3z = <span class="const-glow">2</span></div>
                                <div class="sys-eq">1x + 3y + 4z = <span class="const-glow">3</span></div>
                            </div>
                            
                            <div class="solving-steps">
                                <div class="cramer-step">
                                    <div class="step-header">
                                        <span class="step-number">1</span>
                                        <span class="step-reason">المصفوفة الموسعة [A | I]</span>
                                    </div>
                                    <div class="step-body">
                                        <div class="aug-matrix-display large">
                                            <span class="bracket">[</span>
                                            <div class="aug-left">
                                                <div class="m-row"><span class="pivot">1</span><span>3</span><span>3</span></div>
                                                <div class="m-row"><span>1</span><span>4</span><span>3</span></div>
                                                <div class="m-row"><span>1</span><span>3</span><span>4</span></div>
                                            </div>
                                            <span class="aug-divider">|</span>
                                            <div class="aug-right">
                                                <div class="m-row"><span class="diag">1</span><span class="zero">0</span><span class="zero">0</span></div>
                                                <div class="m-row"><span class="zero">0</span><span class="diag">1</span><span class="zero">0</span></div>
                                                <div class="m-row"><span class="zero">0</span><span class="zero">0</span><span class="diag">1</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="cramer-step highlight-step">
                                    <div class="step-header">
                                        <span class="step-number">2</span>
                                        <span class="step-reason">R₂ ← R₂ - R₁ و R₃ ← R₃ - R₁</span>
                                    </div>
                                    <div class="step-body">
                                        <div class="aug-matrix-display large">
                                            <span class="bracket">[</span>
                                            <div class="aug-left">
                                                <div class="m-row"><span class="pivot">1</span><span>3</span><span>3</span></div>
                                                <div class="m-row changed"><span class="zero-new">0</span><span class="pivot">1</span><span>0</span></div>
                                                <div class="m-row changed"><span class="zero-new">0</span><span>0</span><span class="pivot">1</span></div>
                                            </div>
                                            <span class="aug-divider">|</span>
                                            <div class="aug-right">
                                                <div class="m-row"><span>1</span><span>0</span><span>0</span></div>
                                                <div class="m-row changed"><span>-1</span><span>1</span><span>0</span></div>
                                                <div class="m-row changed"><span>-1</span><span>0</span><span>1</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                        <div class="step-note">✓ العمود الأول جاهز (قائد = 1، تحته أصفار)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'example-3x3-final',
                    title: '✨ النتيجة النهائية',
                    content: `
                        <div class="visual-with-formula">
                            <div class="solving-steps">
                                <div class="cramer-step final-step">
                                    <div class="step-header">
                                        <span class="step-number">✓</span>
                                        <span class="step-reason">بعد تكملة العمليات</span>
                                    </div>
                                    <div class="step-body">
                                        <div class="aug-matrix-display large final">
                                            <span class="bracket">[</span>
                                            <div class="aug-left identity">
                                                <div class="m-row"><span class="pivot">1</span><span class="zero">0</span><span class="zero">0</span></div>
                                                <div class="m-row"><span class="zero">0</span><span class="pivot">1</span><span class="zero">0</span></div>
                                                <div class="m-row"><span class="zero">0</span><span class="zero">0</span><span class="pivot">1</span></div>
                                            </div>
                                            <span class="aug-divider result">|</span>
                                            <div class="aug-right result">
                                                <div class="m-row"><span class="result-val">7</span><span class="result-val">-3</span><span class="result-val">-3</span></div>
                                                <div class="m-row"><span class="result-val">-1</span><span class="result-val">1</span><span class="result-val">0</span></div>
                                                <div class="m-row"><span class="result-val">-1</span><span class="result-val">0</span><span class="result-val">1</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="main-formula-box result-box">
                                <div class="formula-title">✅ المعكوس A<sup>-1</sup></div>
                                <div class="visual-matrix result-matrix">
                                    <span class="bracket">[</span>
                                    <div class="matrix-inner">
                                        <div class="m-row"><span>7</span> <span>-3</span> <span>-3</span></div>
                                        <div class="m-row"><span>-1</span> <span>1</span> <span>0</span></div>
                                        <div class="m-row"><span>-1</span> <span>0</span> <span>1</span></div>
                                    </div>
                                    <span class="bracket">]</span>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'practice',
                    title: '🎮 جاهز للتحدي!',
                    content: `
                        <div class="tut-ready">
                            <div class="ready-icon">🎯</div>
                            <p>الآن يمكنك حل أنظمة 3×3 بالمعكوس!</p>
                            <p>تذكر: الصبر والدقة في العمليات هما مفتاح النجاح.</p>
                            
                            <div class="formula-reminder">
                                <div class="reminder-points">
                                    <div class="point">✓ تصفير <strong>فوق وتحت</strong> كل قائد</div>
                                    <div class="point">✓ الجانب الأيمن يتحول تلقائياً للمعكوس</div>
                                    <div class="point">✓ X = A<sup>-1</sup> × B</div>
                                </div>
                            </div>
                            
                            <button class="btn btn-primary btn-lg" onclick="inverseTutorial.complete(2)">
                                ابدأ اللعب! 🎮
                            </button>
                        </div>
                    `
                }
            ]
        };
    }
    
    // ==================== TUTORIAL 3: 4x4 ====================
    getTutorial4x4() {
        return {
            title: "طريقة المعكوس 4×4",
            subtitle: "التحدي الكبير",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 المعكوس للمصفوفة 4×4',
                    content: `
                        <div class="tut-intro">
                            <p>نفس المبدأ، لكن مع <strong>4 متغيرات</strong>!</p>
                            
                            <div class="tut-uses warning-style">
                                <div class="use-item">⚠️ العمليات أكثر وتحتاج دقة عالية!</div>
                                <div class="use-item">📝 استخدم الورقة والقلم للمساعدة</div>
                                <div class="use-item">✓ لكن الطريقة نفسها تماماً</div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'strategy',
                    title: '🧠 استراتيجية 4×4',
                    content: `
                        <div class="cramer-formula-phase">
                            <div class="solving-steps tips-list">
                                <div class="cramer-step tip-step">
                                    <div class="step-header">
                                        <span class="step-number">🔍</span>
                                        <span class="step-reason">اعمل عمود بعمود من اليسار لليمين</span>
                                    </div>
                                </div>
                                
                                <div class="cramer-step tip-step">
                                    <div class="step-header">
                                        <span class="step-number">⚡</span>
                                        <span class="step-reason">صفّر فوق وتحت كل قائد قبل الانتقال للتالي</span>
                                    </div>
                                </div>
                                
                                <div class="cramer-step tip-step">
                                    <div class="step-header">
                                        <span class="step-number">📐</span>
                                        <span class="step-reason">تحقق من حساباتك في كل خطوة</span>
                                    </div>
                                </div>
                                
                                <div class="cramer-step tip-step">
                                    <div class="step-header">
                                        <span class="step-number">✏️</span>
                                        <span class="step-reason">استخدم الورقة والقلم للمساعدة</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p class="tut-note">
                                💡 <strong>نصيحة:</strong> راجع النتيجة بضرب A × A<sup>-1</sup> = I
                            </p>
                        </div>
                    `
                },
                {
                    type: 'practice',
                    title: '🏆 التحدي الأكبر!',
                    content: `
                        <div class="tut-ready">
                            <div class="ready-icon">🏆</div>
                            <p>أنت جاهز للتحدي الأكبر!</p>
                            <p>المستوى 10 سيختبر مهاراتك في حل نظام 4×4</p>
                            
                            <div class="formula-reminder">
                                <div class="reminder-points">
                                    <div class="point">✓ خذ وقتك في الحسابات</div>
                                    <div class="point">✓ راقب الإشارات (+/−) بعناية</div>
                                    <div class="point">✓ تحقق من كل عملية</div>
                                </div>
                            </div>
                            
                            <button class="btn btn-primary btn-lg" onclick="inverseTutorial.complete(3)">
                                ابدأ التحدي! 🚀
                            </button>
                        </div>
                    `
                }
            ]
        };
    }
    
    // ==================== NAVIGATION ====================
    
    show(tutorialNum) {
        this.currentTutorial = tutorialNum;
        this.currentPhase = 0;
        this.isPlaying = true;
        
        // Switch to game screen first
        if (typeof game !== 'undefined') {
            game.showScreen('game');
            game.hideGaussUI();
        }
        
        // Hide game container if visible
        const gameContainer = document.getElementById('inverse-game-container');
        if (gameContainer) gameContainer.style.display = 'none';
        
        // Show tutorial container - create in game screen
        let container = document.getElementById('inverse-tutorial-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'inverse-tutorial-container';
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                const screenContainer = gameScreen.querySelector('.container');
                if (screenContainer) {
                    screenContainer.appendChild(container);
                } else {
                    gameScreen.appendChild(container);
                }
            }
        }
        container.style.display = 'block';
        
        this.render();
    }
    
    render() {
        const container = document.getElementById('inverse-tutorial-container');
        if (!container) return;
        
        const tutorial = this.tutorials[this.currentTutorial];
        if (!tutorial) return;
        
        const phase = tutorial.phases[this.currentPhase];
        const totalPhases = tutorial.phases.length;
        const progress = ((this.currentPhase + 1) / totalPhases) * 100;
        
        container.innerHTML = `
            <div class="cramer-tutorial professional">
                <div class="tut-header">
                    <button class="btn btn-back" onclick="inverseTutorial.close()">
                        <span>→</span> رجوع
                    </button>
                    <div class="tut-title-section">
                        <h3>${tutorial.title}</h3>
                        <span class="tut-subtitle">${tutorial.subtitle}</span>
                    </div>
                    <div class="tut-counter">
                        ${this.currentPhase + 1} / ${totalPhases}
                    </div>
                </div>
                
                <div class="tut-progress">
                    <div class="tut-progress-fill" style="width: ${progress}%"></div>
                </div>
                
                <div class="tut-content">
                    <h4 class="phase-title">${phase.title}</h4>
                    ${phase.content}
                </div>
                
                <div class="tut-navigation">
                    <button class="btn btn-nav" onclick="inverseTutorial.prevPhase()" 
                            ${this.currentPhase === 0 ? 'disabled' : ''}>
                        ◀ السابق
                    </button>
                    
                    <div class="tut-dots">
                        ${tutorial.phases.map((_, i) => 
                            `<span class="dot ${i === this.currentPhase ? 'active' : ''}" 
                                   onclick="inverseTutorial.goToPhase(${i})"></span>`
                        ).join('')}
                    </div>
                    
                    ${this.currentPhase < totalPhases - 1 ? `
                        <button class="btn btn-nav btn-primary" onclick="inverseTutorial.nextPhase()">
                            التالي ▶
                        </button>
                    ` : `
                        <button class="btn btn-nav btn-success" onclick="inverseTutorial.complete(${this.currentTutorial})">
                            ابدأ! 🎮
                        </button>
                    `}
                </div>
                
                <div class="keyboard-hint">
                    💡 استخدم ← → للتنقل | Esc للخروج
                </div>
            </div>
        `;
    }
    
    nextPhase() {
        const tutorial = this.tutorials[this.currentTutorial];
        if (!tutorial) return;
        
        if (this.currentPhase < tutorial.phases.length - 1) {
            this.currentPhase++;
            this.render();
        }
    }
    
    prevPhase() {
        if (this.currentPhase > 0) {
            this.currentPhase--;
            this.render();
        }
    }
    
    goToPhase(phase) {
        this.currentPhase = phase;
        this.render();
    }
    
    complete(tutorialNum) {
        // Mark tutorial as completed
        if (typeof inverseGame !== 'undefined') {
            inverseGame.completeTutorial(tutorialNum);
        }
        
        this.close();
        
        // Start first level of this category
        const levelMap = { 1: 1, 2: 5, 3: 10 };
        const startLevel = levelMap[tutorialNum] || 1;
        
        if (typeof inverseGame !== 'undefined') {
            inverseGame.startLevel(startLevel);
        }
    }
    
    close() {
        this.isPlaying = false;
        
        const container = document.getElementById('inverse-tutorial-container');
        if (container) {
            container.style.display = 'none';
        }
        
        // Return to level select
        if (typeof game !== 'undefined') {
            game.showInverseLevelSelect();
        }
    }
}

// Create global instance
const inverseTutorial = new InverseTutorial();
