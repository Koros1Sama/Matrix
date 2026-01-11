/**
 * Cramer's Rule Tutorial System
 * Interactive tutorials for learning Cramer's Rule
 * Styled to match the determinant tutorial
 */

class CramerTutorial {
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
            const container = document.getElementById('cramer-tutorial-container');
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
            title: "قاعدة كرامر 2×2",
            subtitle: "حل نظامين بمجهولين",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 ما هي قاعدة كرامر؟',
                    content: `
                        <div class="tut-intro">
                            <p>قاعدة كرامر طريقة لحل أنظمة المعادلات الخطية باستخدام <strong>المحددات</strong>.</p>
                            <div class="tut-uses">
                                <div class="use-item">📐 تعمل عندما عدد المعادلات = عدد المجاهيل</div>
                                <div class="use-item">🧮 تستخدم نسب المحددات لإيجاد الحل</div>
                                <div class="use-item">⚡ سريعة للأنظمة الصغيرة</div>
                            </div>
                            <p class="tut-note">⚠️ شرط: يجب أن يكون A| ≠ 0|</p>
                        </div>
                    `
                },
                {
                    type: 'formula',
                    title: '📝 من المعادلات إلى المصفوفات',
                    content: `
                        <div class="cramer-formula-phase">
                            <div class="visual-equation-mapping">
                                <div class="system-with-colors">
                                    <div class="eq-row">
                                        <span class="coef-a">a</span>x + <span class="coef-b">b</span>y = <span class="const-e">e</span>
                                    </div>
                                    <div class="eq-row">
                                        <span class="coef-a">c</span>x + <span class="coef-b">d</span>y = <span class="const-e">f</span>
                                    </div>
                                </div>
                                
                                <div class="mapping-arrow">⬇️</div>
                                
                                <div class="matrices-row">
                                    <div class="matrix-box">
                                        <div class="matrix-label">المعاملات A</div>
                                        <div class="visual-matrix">
                                            <span class="bracket">[</span>
                                            <div class="matrix-inner">
                                                <div class="m-row"><span class="coef-a">a</span> <span class="coef-b">b</span></div>
                                                <div class="m-row"><span class="coef-a">c</span> <span class="coef-b">d</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                    
                                    <div class="matrix-box">
                                        <div class="matrix-label">الثوابت (أو النواتج) b</div>
                                        <div class="visual-matrix">
                                            <span class="bracket">[</span>
                                            <div class="matrix-inner">
                                                <div class="m-row"><span class="const-e">e</span></div>
                                                <div class="m-row"><span class="const-e">f</span></div>
                                            </div>
                                            <span class="bracket">]</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="formula-cards">
                                <div class="formula-card">
                                    <div class="formula-label">x =</div>
                                    <div class="formula-fraction">
                                        <span class="num">|A₁|</span>
                                        <span class="denom">|A|</span>
                                    </div>
                                </div>
                                <div class="formula-card">
                                    <div class="formula-label">y =</div>
                                    <div class="formula-fraction">
                                        <span class="num">|A₂|</span>
                                        <span class="denom">|A|</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="formula-key">
                                <div class="key-item"><span class="dot blue"></span> A₁ = استبدل العمود 1 بالثوابت</div>
                                <div class="key-item"><span class="dot green"></span> A₂ = استبدل العمود 2 بالثوابت</div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'visual',
                    title: '✨ مثال عملي مع القانون',
                    content: `
                        <div class="visual-with-formula">
                            <!-- القانون الأساسي - ثابت في الأعلى -->
                            <div class="main-formula-box">
                                <div class="formula-title">🎯 قانون كرامر:</div>
                                <div class="formula-row">
                                    <div class="formula-item">
                                        <span class="var-name">x</span>
                                        <span class="equals">=</span>
                                        <div class="fraction">
                                            <span class="numerator"><span class="det-notation">A<sub>1</sub></span></span>
                                            <span class="denominator"><span class="det-notation">A</span></span>
                                        </div>
                                    </div>
                                    <div class="formula-item">
                                        <span class="var-name">y</span>
                                        <span class="equals">=</span>
                                        <div class="fraction">
                                            <span class="numerator"><span class="det-notation">A<sub>2</sub></span></span>
                                            <span class="denominator"><span class="det-notation">A</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- المثال -->
                            <div class="example-with-steps">
                                <div class="example-system-box centered">
                                    <div class="sys-title">📌 المثال:</div>
                                    <div class="sys-eq">2x + 3y = <span class="const-glow">8</span></div>
                                    <div class="sys-eq">x − y = <span class="const-glow">1</span></div>
                                </div>
                                
                                <div class="solving-steps">
                                    <!-- الخطوة 1: حساب |A| -->
                                    <div class="cramer-step">
                                        <div class="step-header">
                                            <span class="step-number">1</span>
                                            <span class="step-reason">نحسب <strong>|A|</strong> (المقام في القانون)</span>
                                        </div>
                                        <div class="step-body">
                                            <div class="mini-matrix">
                                                <span class="br">[</span>
                                                <div class="m-inner">
                                                    <div class="r"><span>2</span><span>3</span></div>
                                                    <div class="r"><span>1</span><span>-1</span></div>
                                                </div>
                                                <span class="br">]</span>
                                            </div>
                                            <div class="calc">= (2×-1) − (3×1) = <strong class="result">-5</strong></div>
                                        </div>
                                    </div>
                                    
                                    <!-- الخطوة 2: حساب |A₁| لإيجاد x -->
                                    <div class="cramer-step highlight-step">
                                        <div class="step-header">
                                            <span class="step-number">2</span>
                                            <span class="step-reason">نحسب <strong>|A₁|</strong> لإيجاد x ← استبدل العمود 1</span>
                                        </div>
                                        <div class="step-body">
                                            <div class="mini-matrix replaced">
                                                <span class="br">[</span>
                                                <div class="m-inner">
                                                    <div class="r"><span class="new">8</span><span>3</span></div>
                                                    <div class="r"><span class="new">1</span><span>-1</span></div>
                                                </div>
                                                <span class="br">]</span>
                                            </div>
                                            <div class="calc">= (8×-1) − (3×1) = <strong class="result">-11</strong></div>
                                        </div>
                                        <div class="apply-formula-box">
                                            <span class="var-label">x</span>
                                            <span class="eq">=</span>
                                            <div class="frac">
                                                <span class="num"><span class="det-notation">A<sub>1</sub></span></span>
                                                <span class="den"><span class="det-notation">A</span></span>
                                            </div>
                                            <span class="eq">=</span>
                                            <div class="frac">
                                                <span class="num">-11</span>
                                                <span class="den">-5</span>
                                            </div>
                                            <span class="eq">=</span>
                                            <span class="final-val">2.2</span>
                                        </div>
                                    </div>
                                    
                                    <!-- الخطوة 3: حساب |A₂| لإيجاد y -->
                                    <div class="cramer-step highlight-step">
                                        <div class="step-header">
                                            <span class="step-number">3</span>
                                            <span class="step-reason">نحسب <strong>|A₂|</strong> لإيجاد y ← استبدل العمود 2</span>
                                        </div>
                                        <div class="step-body">
                                            <div class="mini-matrix replaced">
                                                <span class="br">[</span>
                                                <div class="m-inner">
                                                    <div class="r"><span>2</span><span class="new">8</span></div>
                                                    <div class="r"><span>1</span><span class="new">1</span></div>
                                                </div>
                                                <span class="br">]</span>
                                            </div>
                                            <div class="calc">= (2×1) − (8×1) = <strong class="result">-6</strong></div>
                                        </div>
                                        <div class="apply-formula-box">
                                            <span class="var-label">y</span>
                                            <span class="eq">=</span>
                                            <div class="frac">
                                                <span class="num"><span class="det-notation">A<sub>2</sub></span></span>
                                                <span class="den"><span class="det-notation">A</span></span>
                                            </div>
                                            <span class="eq">=</span>
                                            <div class="frac">
                                                <span class="num">-6</span>
                                                <span class="den">-5</span>
                                            </div>
                                            <span class="eq">=</span>
                                            <span class="final-val">1.2</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="final-answer">
                                    ✅ الحل: x = 2.2, y = 1.2
                                </div>
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
                            <p>الآن أنت تعرف كيف تحل النظام 2×2 بقاعدة كرامر!</p>
                            <div class="formula-reminder">
                                <span>x = <span class="det-notation">A<sub>1</sub></span> / <span class="det-notation">A</span></span>
                                <span>y = <span class="det-notation">A<sub>2</sub></span> / <span class="det-notation">A</span></span>
                            </div>
                            <button class="btn btn-primary btn-lg" onclick="cramerTutorial.complete(1)">
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
            title: "قاعدة كرامر 3×3",
            subtitle: "مع اختيار الطريقة",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 كرامر للنظام 3×3',
                    content: `
                        <div class="tut-intro">
                            <p>نفس المبدأ، لكن مع <strong>3 متغيرات</strong> و <strong>مصفوفة 3×3</strong>!</p>
                            <div class="tut-formulas-3var">
                                <div class="formula-item">x = <span class="det-notation">A<sub>1</sub></span> / <span class="det-notation">A</span></div>
                                <div class="formula-item">y = <span class="det-notation">A<sub>2</sub></span> / <span class="det-notation">A</span></div>
                                <div class="formula-item">z = <span class="det-notation">A<sub>3</sub></span> / <span class="det-notation">A</span></div>
                            </div>
                            <p class="tut-note">💡 في هذا المستوى، يمكنك اختيار طريقة حساب المحدد!</p>
                        </div>
                    `
                },
                {
                    type: 'method-choice',
                    title: '🔀 اختر طريقتك!',
                    content: `
                        <div class="method-choice-phase">
                            <p>للمصفوفات 3×3، يمكنك اختيار طريقة حساب المحدد:</p>
                            
                            <div class="method-cards">
                                <div class="method-card sarrus">
                                    <div class="method-icon">📊</div>
                                    <div class="method-title">طريقة ساروس</div>
                                    <ul class="method-features">
                                        <li>توسيع المصفوفة بنسخ عمودين</li>
                                        <li>6 أقطار (3 هابطة + 3 صاعدة)</li>
                                        <li>سريعة للحساب اليدوي</li>
                                        <li>تعمل فقط للـ 3×3</li>
                                    </ul>
                                </div>
                                
                                <div class="method-card cofactor">
                                    <div class="method-icon">🧮</div>
                                    <div class="method-title">طريقة التوسيع</div>
                                    <ul class="method-features">
                                        <li>Cofactor Expansion</li>
                                        <li>تفكيك لمحددات أصغر</li>
                                        <li>منهجية ودقيقة</li>
                                        <li>تعمل لأي حجم</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'sarrus-demo',
                    title: '📊 طريقة ساروس',
                    content: `
                        <div class="sarrus-demo-phase">
                            <div class="demo-title">توسيع المصفوفة:</div>
                            <div class="extended-matrix-demo">
                                <div class="matrix-wrapper">
                                    <div class="m-row">
                                        <span class="cell">1</span>
                                        <span class="cell">2</span>
                                        <span class="cell">3</span>
                                        <span class="cell ext">1</span>
                                        <span class="cell ext">2</span>
                                    </div>
                                    <div class="m-row">
                                        <span class="cell">4</span>
                                        <span class="cell">5</span>
                                        <span class="cell">6</span>
                                        <span class="cell ext">4</span>
                                        <span class="cell ext">5</span>
                                    </div>
                                    <div class="m-row">
                                        <span class="cell">7</span>
                                        <span class="cell">8</span>
                                        <span class="cell">9</span>
                                        <span class="cell ext">7</span>
                                        <span class="cell ext">8</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="diagonals-demo">
                                <div class="diag-group down">
                                    <div class="group-title">الأقطار الهابطة (+)</div>
                                    <div class="diag-calc">1×5×9 + 2×6×7 + 3×4×8</div>
                                    <div class="diag-result">= 45 + 84 + 96 = 225</div>
                                </div>
                                <div class="diag-group up">
                                    <div class="group-title">الأقطار الصاعدة (−)</div>
                                    <div class="diag-calc">3×5×7 + 1×6×8 + 2×4×9</div>
                                    <div class="diag-result">= 105 + 48 + 72 = 225</div>
                                </div>
                            </div>
                            
                            <div class="final-result">|A| = 225 - 225 = <strong>0</strong></div>
                        </div>
                    `
                },
                {
                    type: 'cofactor-demo',
                    title: '🧮 طريقة التوسيع',
                    content: `
                        <div class="cofactor-demo-phase">
                            <div class="demo-title">التوسيع على الصف الأول:</div>
                            
                            <div class="cofactor-terms">
                                <div class="term positive">
                                    <span class="sign">+</span>
                                    <span class="element">a₁₁</span>
                                    <span class="times">×</span>
                                    <span class="minor">|M₁₁|</span>
                                </div>
                                <div class="term negative">
                                    <span class="sign">−</span>
                                    <span class="element">a₁₂</span>
                                    <span class="times">×</span>
                                    <span class="minor">|M₁₂|</span>
                                </div>
                                <div class="term positive">
                                    <span class="sign">+</span>
                                    <span class="element">a₁₃</span>
                                    <span class="times">×</span>
                                    <span class="minor">|M₁₃|</span>
                                </div>
                            </div>
                            
                            <div class="sign-pattern">
                                <div class="pattern-title">نمط الإشارات:</div>
                                <div class="pattern-grid">
                                    <span class="ps">+</span><span class="ns">−</span><span class="ps">+</span>
                                    <span class="ns">−</span><span class="ps">+</span><span class="ns">−</span>
                                    <span class="ps">+</span><span class="ns">−</span><span class="ps">+</span>
                                </div>
                            </div>
                            
                            <div class="cofactor-tip">
                                💡 <strong>نصيحة:</strong> ابحث عن الصف أو العمود الأكثر أصفاراً!
                            </div>
                        </div>
                    `
                },
                {
                    type: 'cramer-steps',
                    title: '🔄 خطوات الحل',
                    content: `
                        <div class="cramer-steps-phase">
                            <div class="steps-list">
                                <div class="step-item">
                                    <span class="step-num">1</span>
                                    <span class="step-text">احسب |A| المحدد الأصلي</span>
                                </div>
                                <div class="step-item">
                                    <span class="step-num">2</span>
                                    <span class="step-text">لـ x: استبدل العمود 1 بالثوابت، احسب |A₁|</span>
                                </div>
                                <div class="step-item">
                                    <span class="step-num">3</span>
                                    <span class="step-text">لـ y: استبدل العمود 2 بالثوابت، احسب |A₂|</span>
                                </div>
                                <div class="step-item">
                                    <span class="step-num">4</span>
                                    <span class="step-text">لـ z: استبدل العمود 3 بالثوابت، احسب |A₃|</span>
                                </div>
                                <div class="step-item result">
                                    <span class="step-num">✓</span>
                                    <span class="step-text">اقسم كل محدد على |A| للحصول على الحل</span>
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
                            <p>الآن يمكنك حل أنظمة 3×3 بقاعدة كرامر!</p>
                            <p>اختر الطريقة التي تفضلها:</p>
                            <div class="method-preview">
                                <span class="preview-item">📊 ساروس - سريع</span>
                                <span class="preview-item">🧮 التوسيع - دقيق</span>
                            </div>
                            <button class="btn btn-primary btn-lg" onclick="cramerTutorial.complete(2)">
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
            title: "قاعدة كرامر 4×4",
            subtitle: "التحدي الكبير",
            phases: [
                {
                    type: 'intro',
                    title: '🎯 كرامر للنظام 4×4',
                    content: `
                        <div class="tut-intro">
                            <p>نفس المبدأ، لكن مع <strong>4 متغيرات</strong>!</p>
                            <div class="tut-warning">
                                ⚠️ <strong>مهم:</strong> طريقة ساروس لا تعمل للمصفوفات 4×4!
                                <br>يجب استخدام <strong>طريقة التوسيع</strong> فقط.
                            </div>
                        </div>
                    `
                },
                {
                    type: 'strategy',
                    title: '🧠 استراتيجية الحل',
                    content: `
                        <div class="strategy-phase">
                            <div class="strategy-tips">
                                <div class="tip-item">
                                    <span class="tip-icon">🔍</span>
                                    <span class="tip-text">ابحث عن الصف أو العمود الأكثر أصفاراً</span>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">⚡</span>
                                    <span class="tip-text">كل صفر = محدد فرعي لا نحسبه!</span>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">📐</span>
                                    <span class="tip-text">المحددات الفرعية ستكون 3×3</span>
                                </div>
                                <div class="tip-item">
                                    <span class="tip-icon">✏️</span>
                                    <span class="tip-text">تحقق من الإشارات (+/−) بعناية</span>
                                </div>
                            </div>
                        </div>
                    `
                },
                {
                    type: 'diagonal-example',
                    title: '💎 مصفوفة قطرية',
                    content: `
                        <div class="diagonal-example-phase">
                            <p>أسهل حالة: المصفوفة القطرية</p>
                            <div class="diagonal-matrix">
                                <div class="m-row">
                                    <span class="cell pivot">2</span>
                                    <span class="cell zero">0</span>
                                    <span class="cell zero">0</span>
                                    <span class="cell zero">0</span>
                                </div>
                                <div class="m-row">
                                    <span class="cell zero">0</span>
                                    <span class="cell pivot">3</span>
                                    <span class="cell zero">0</span>
                                    <span class="cell zero">0</span>
                                </div>
                                <div class="m-row">
                                    <span class="cell zero">0</span>
                                    <span class="cell zero">0</span>
                                    <span class="cell pivot">1</span>
                                    <span class="cell zero">0</span>
                                </div>
                                <div class="m-row">
                                    <span class="cell zero">0</span>
                                    <span class="cell zero">0</span>
                                    <span class="cell zero">0</span>
                                    <span class="cell pivot">2</span>
                                </div>
                            </div>
                            <div class="diag-formula">
                                |A| = 2 × 3 × 1 × 2 = <strong>12</strong>
                            </div>
                            <p class="diag-note">المصفوفة القطرية: المحدد = حاصل ضرب عناصر القطر!</p>
                        </div>
                    `
                },
                {
                    type: 'tips',
                    title: '💡 نصائح للنجاح',
                    content: `
                        <div class="tips-phase">
                            <div class="success-tips">
                                <div class="tip success">✓ خذ وقتك في الحسابات</div>
                                <div class="tip success">✓ تحقق من الإشارات (+/−)</div>
                                <div class="tip success">✓ استغل الأصفار!</div>
                                <div class="tip success">✓ راجع حساباتك</div>
                            </div>
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
                            <p>المستويات 9-10 ستختبر مهاراتك في حل أنظمة 4×4</p>
                            <button class="btn btn-primary btn-lg" onclick="cramerTutorial.complete(3)">
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
        const gameContainer = document.getElementById('cramer-game-container');
        if (gameContainer) gameContainer.style.display = 'none';
        
        // Show tutorial container - create in game screen
        let container = document.getElementById('cramer-tutorial-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cramer-tutorial-container';
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
        const container = document.getElementById('cramer-tutorial-container');
        if (!container) return;
        
        const tutorial = this.tutorials[this.currentTutorial];
        if (!tutorial) return;
        
        const phase = tutorial.phases[this.currentPhase];
        const totalPhases = tutorial.phases.length;
        const progress = ((this.currentPhase + 1) / totalPhases) * 100;
        
        container.innerHTML = `
            <div class="cramer-tutorial professional">
                <div class="tut-header">
                    <button class="btn btn-back" onclick="cramerTutorial.close()">
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
                    <button class="btn btn-nav" onclick="cramerTutorial.prevPhase()" 
                            ${this.currentPhase === 0 ? 'disabled' : ''}>
                        ◀ السابق
                    </button>
                    
                    <div class="tut-dots">
                        ${tutorial.phases.map((_, i) => 
                            `<span class="dot ${i === this.currentPhase ? 'active' : ''}" 
                                   onclick="cramerTutorial.goToPhase(${i})"></span>`
                        ).join('')}
                    </div>
                    
                    ${this.currentPhase < totalPhases - 1 ? `
                        <button class="btn btn-nav btn-primary" onclick="cramerTutorial.nextPhase()">
                            التالي ▶
                        </button>
                    ` : `
                        <button class="btn btn-nav btn-success" onclick="cramerTutorial.complete(${this.currentTutorial})">
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
        if (typeof cramerGame !== 'undefined') {
            cramerGame.completeTutorial(tutorialNum);
        }
        
        this.close();
        
        // Start first level of this category
        const levelMap = { 1: 1, 2: 3, 3: 9 };
        const startLevel = levelMap[tutorialNum] || 1;
        
        if (typeof cramerGame !== 'undefined') {
            cramerGame.startLevel(startLevel);
        }
    }
    
    close() {
        this.isPlaying = false;
        
        const container = document.getElementById('cramer-tutorial-container');
        if (container) {
            container.style.display = 'none';
        }
        
        // Return to level select
        if (typeof game !== 'undefined') {
            game.showCramerLevelSelect();
        }
    }
}

// Create global instance
const cramerTutorial = new CramerTutorial();
