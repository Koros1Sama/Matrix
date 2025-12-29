/**
 * Matrix Operations - Gaussian Elimination
 * منطق المصفوفات والعمليات الصفية
 */

// تمثيل الكسور
class Fraction {
    constructor(numerator, denominator = 1) {
        if (denominator === 0) throw new Error('Cannot divide by zero');
        
        // التبسيط
        const g = this.gcd(Math.abs(numerator), Math.abs(denominator));
        this.num = numerator / g;
        this.den = denominator / g;
        
        // جعل المقام موجباً دائماً
        if (this.den < 0) {
            this.num = -this.num;
            this.den = -this.den;
        }
    }
    
    gcd(a, b) {
        return b === 0 ? a : this.gcd(b, a % b);
    }
    
    add(other) {
        const newNum = this.num * other.den + other.num * this.den;
        const newDen = this.den * other.den;
        return new Fraction(newNum, newDen);
    }
    
    subtract(other) {
        return this.add(new Fraction(-other.num, other.den));
    }
    
    multiply(other) {
        return new Fraction(this.num * other.num, this.den * other.den);
    }
    
    divide(other) {
        if (other.num === 0) throw new Error('Cannot divide by zero');
        return new Fraction(this.num * other.den, this.den * other.num);
    }
    
    equals(other) {
        return this.num === other.num && this.den === other.den;
    }
    
    isZero() {
        return this.num === 0;
    }
    
    isOne() {
        return this.num === 1 && this.den === 1;
    }
    
    toNumber() {
        return this.num / this.den;
    }
    
    toString() {
        if (this.den === 1) return String(this.num);
        return `${this.num}/${this.den}`;
    }
    
    toDisplayString() {
        if (this.den === 1) return String(this.num);
        // عرض الكسر بشكل عمودي (البسط فوق المقام)
        return `<span class="frac-vertical"><span class="frac-num">${this.num}</span><span class="frac-line"></span><span class="frac-den">${this.den}</span></span>`;
    }
    
    clone() {
        return new Fraction(this.num, this.den);
    }
    
    static fromNumber(n) {
        // تحويل عدد عشري إلى كسر (تقريبي)
        if (Number.isInteger(n)) return new Fraction(n, 1);
        
        const precision = 1000000;
        const g = new Fraction(1, 1).gcd(Math.round(n * precision), precision);
        return new Fraction(Math.round(n * precision) / g, precision / g);
    }
}

// تمثيل المصفوفة
class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        
        for (let i = 0; i < rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < cols; j++) {
                this.data[i][j] = new Fraction(0);
            }
        }
    }
    
    // إنشاء مصفوفة من الأرقام
    static fromArray(arr) {
        const rows = arr.length;
        const cols = arr[0].length;
        const matrix = new Matrix(rows, cols);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (arr[i][j] instanceof Fraction) {
                    matrix.data[i][j] = arr[i][j].clone();
                } else {
                    matrix.data[i][j] = new Fraction(arr[i][j]);
                }
            }
        }
        
        return matrix;
    }
    
    // نسخ المصفوفة
    clone() {
        const copy = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                copy.data[i][j] = this.data[i][j].clone();
            }
        }
        return copy;
    }
    
    // الحصول على عنصر
    get(row, col) {
        return this.data[row][col];
    }
    
    // تعيين عنصر
    set(row, col, value) {
        if (value instanceof Fraction) {
            this.data[row][col] = value;
        } else {
            this.data[row][col] = new Fraction(value);
        }
    }
    
    // تبديل صفين
    swapRows(row1, row2) {
        if (row1 === row2) return;
        const temp = this.data[row1];
        this.data[row1] = this.data[row2];
        this.data[row2] = temp;
    }
    
    // ضرب صف بعدد
    scaleRow(row, factor) {
        for (let j = 0; j < this.cols; j++) {
            this.data[row][j] = this.data[row][j].multiply(factor);
        }
    }
    
    // جمع صف مع مضاعف صف آخر
    addScaledRow(targetRow, sourceRow, factor) {
        for (let j = 0; j < this.cols; j++) {
            const scaled = this.data[sourceRow][j].multiply(factor);
            this.data[targetRow][j] = this.data[targetRow][j].add(scaled);
        }
    }
    
    // التحقق من الشكل المدرجي الصفي (مع المحاور = 1)
    isRowEchelon() {
        let lastPivotCol = -1;
        
        for (let i = 0; i < this.rows; i++) {
            // إيجاد أول عنصر غير صفري في الصف
            let pivotCol = -1;
            for (let j = 0; j < this.cols - 1; j++) { // لا نتحقق من العمود الأخير (النتائج)
                if (!this.data[i][j].isZero()) {
                    pivotCol = j;
                    break;
                }
            }
            
            // إذا كان الصف كله أصفار، نتخطاه
            if (pivotCol === -1) continue;
            
            // يجب أن يكون المحور بعد المحور السابق
            if (pivotCol <= lastPivotCol) return false;
            
            // يجب أن يكون المحور = 1
            if (!this.data[i][pivotCol].isOne()) return false;
            
            // يجب أن تكون جميع العناصر تحت المحور = 0
            for (let k = i + 1; k < this.rows; k++) {
                if (!this.data[k][pivotCol].isZero()) return false;
            }
            
            lastPivotCol = pivotCol;
        }
        
        return true;
    }
    
    // التحقق من الشكل المدرجي الصفي المختصر (جاوس-جوردن)
    // الفرق: يجب أن تكون جميع العناصر فوق المحاور = 0 أيضاً
    isReducedRowEchelon() {
        let lastPivotCol = -1;
        const pivotPositions = []; // لتخزين مواقع المحاور
        
        for (let i = 0; i < this.rows; i++) {
            // إيجاد أول عنصر غير صفري في الصف
            let pivotCol = -1;
            for (let j = 0; j < this.cols - 1; j++) {
                if (!this.data[i][j].isZero()) {
                    pivotCol = j;
                    break;
                }
            }
            
            // إذا كان الصف كله أصفار، نتخطاه
            if (pivotCol === -1) continue;
            
            // يجب أن يكون المحور بعد المحور السابق
            if (pivotCol <= lastPivotCol) return false;
            
            // يجب أن يكون المحور = 1
            if (!this.data[i][pivotCol].isOne()) return false;
            
            // يجب أن تكون جميع العناصر تحت المحور = 0
            for (let k = i + 1; k < this.rows; k++) {
                if (!this.data[k][pivotCol].isZero()) return false;
            }
            
            // جاوس-جوردن: يجب أن تكون جميع العناصر فوق المحور = 0 أيضاً
            for (let k = 0; k < i; k++) {
                if (!this.data[k][pivotCol].isZero()) return false;
            }
            
            lastPivotCol = pivotCol;
            pivotPositions.push({ row: i, col: pivotCol });
        }
        
        return true;
    }
    
    // التحقق من عدم وجود حل (صف متناقض: كل المعاملات = 0 لكن النتيجة ≠ 0)
    hasNoSolution() {
        for (let i = 0; i < this.rows; i++) {
            let allZeros = true;
            // فحص كل المعاملات (بدون عمود النتيجة)
            for (let j = 0; j < this.cols - 1; j++) {
                if (!this.data[i][j].isZero()) {
                    allZeros = false;
                    break;
                }
            }
            // إذا كانت كل المعاملات = 0 والنتيجة ≠ 0
            if (allZeros && !this.data[i][this.cols - 1].isZero()) {
                return true;
            }
        }
        return false;
    }
    
    // التحقق من وجود عدد لا نهائي من الحلول (صف صفري بالكامل)
    hasInfiniteSolutions() {
        // أولاً: يجب ألا يكون هناك تناقض
        if (this.hasNoSolution()) return false;
        
        let zeroRowCount = 0;
        for (let i = 0; i < this.rows; i++) {
            let allZeros = true;
            // فحص كل الصف بما فيه النتيجة
            for (let j = 0; j < this.cols; j++) {
                if (!this.data[i][j].isZero()) {
                    allZeros = false;
                    break;
                }
            }
            if (allZeros) zeroRowCount++;
        }
        // إذا كان عدد الصفوف الصفرية > 0 أو عدد المتغيرات > عدد المحاور
        return zeroRowCount > 0;
    }
    
    // الحصول على موقع المحاور الصحيحة للشكل المدرجي
    getTargetPivots() {
        const pivots = [];
        for (let i = 0; i < this.rows && i < this.cols - 1; i++) {
            pivots.push({ row: i, col: i });
        }
        return pivots;
    }
    
    // التحقق من أن عنصراً معيناً في مكانه الصحيح
    isCellCorrect(row, col) {
        // العناصر على القطر والتي يجب أن تكون 1
        if (row === col && row < this.rows) {
            // يجب أن يكون المحور 1
            // لكننا نقبل أي قيمة غير صفرية للمحور في الشكل المدرجي العام
            // والعناصر تحته يجب أن تكون 0
        }
        
        // العناصر تحت القطر يجب أن تكون 0
        if (col < row && col < this.cols - 1) {
            return this.data[row][col].isZero();
        }
        
        return false; // لا نحدد الصحة للعناصر الأخرى
    }
    
    // الحصول على حالة كل خلية
    getCellStates() {
        const states = [];
        
        // أولاً: إيجاد مواقع القادة الفعلية في كل صف
        const pivots = this.findPivotPositions();
        
        for (let i = 0; i < this.rows; i++) {
            states[i] = [];
            const pivotCol = pivots[i]; // عمود القائد لهذا الصف (-1 إذا صف صفري)
            
            for (let j = 0; j < this.cols; j++) {
                if (j === this.cols - 1) {
                    // العمود الأخير (النتائج)
                    states[i][j] = 'result';
                } else if (pivotCol !== -1 && j === pivotCol) {
                    // هذا هو القائد (أول عنصر غير صفري في الصف)
                    const belowAreZero = this.areAllBelowZeroInColumn(i, j);
                    if (this.data[i][j].isOne() && belowAreZero) {
                        states[i][j] = 'correct';
                    } else if (!this.data[i][j].isZero()) {
                        states[i][j] = 'pivot';
                    } else {
                        states[i][j] = 'default';
                    }
                } else if (pivotCol !== -1 && j < pivotCol) {
                    // قبل القائد - يجب أن تكون 0
                    states[i][j] = this.data[i][j].isZero() ? 'correct' : 'default';
                } else if (this.shouldBeZero(i, j, pivots)) {
                    // تحت قائد سابق - يجب أن تكون 0
                    states[i][j] = this.data[i][j].isZero() ? 'correct' : 'default';
                } else {
                    states[i][j] = 'default';
                }
            }
        }
        
        return states;
    }
    
    // إيجاد مواقع القادة في كل صف
    findPivotPositions() {
        const pivots = [];
        for (let i = 0; i < this.rows; i++) {
            let pivotCol = -1;
            for (let j = 0; j < this.cols - 1; j++) {
                if (!this.data[i][j].isZero()) {
                    pivotCol = j;
                    break;
                }
            }
            pivots.push(pivotCol);
        }
        return pivots;
    }
    
    // التحقق من أن العنصر يجب أن يكون صفراً (تحت قائد سابق)
    shouldBeZero(row, col, pivots) {
        for (let i = 0; i < row; i++) {
            if (pivots[i] === col) {
                return true; // هذا العمود يحتوي قائد في صف سابق
            }
        }
        return false;
    }
    
    // التحقق من أن جميع العناصر تحت عمود معين أصفار (بدءاً من صف معين)
    areAllBelowZeroInColumn(startRow, col) {
        for (let i = startRow + 1; i < this.rows; i++) {
            if (!this.data[i][col].isZero()) return false;
        }
        return true;
    }
    
    // التحقق من أن جميع العناصر تحت عمود معين أصفار
    areAllBelowZero(col) {
        for (let i = col + 1; i < this.rows; i++) {
            if (!this.data[i][col].isZero()) return false;
        }
        return true;
    }
    
    // تحويل إلى سلسلة للعرض
    toString() {
        let str = '';
        for (let i = 0; i < this.rows; i++) {
            str += '[ ';
            for (let j = 0; j < this.cols; j++) {
                if (j === this.cols - 1) str += '| ';
                str += this.data[i][j].toString().padStart(4) + ' ';
            }
            str += ']\n';
        }
        return str;
    }
}

// توليد المعادلات من المصفوفة
function generateEquations(matrix, variables) {
    const equations = [];
    
    for (let i = 0; i < matrix.rows; i++) {
        let eq = '';
        let firstTerm = true;
        
        for (let j = 0; j < matrix.cols - 1; j++) {
            const coef = matrix.data[i][j];
            
            if (coef.isZero()) continue;
            
            let term = '';
            
            if (!firstTerm) {
                if (coef.num > 0) {
                    term += ' + ';
                } else {
                    term += ' - ';
                }
            } else if (coef.num < 0) {
                term += '-';
            }
            
            const absCoef = new Fraction(Math.abs(coef.num), coef.den);
            
            if (!absCoef.isOne()) {
                term += absCoef.toString();
            }
            
            term += variables[j];
            eq += term;
            firstTerm = false;
        }
        
        eq += ' = ' + matrix.data[i][matrix.cols - 1].toString();
        equations.push(eq);
    }
    
    return equations;
}

// حل المتغيرات بالتعويض العكسي
function solveByBackSubstitution(matrix) {
    const n = matrix.rows;
    const solutions = new Array(n).fill(null);
    
    // نبدأ من الصف الأخير
    for (let i = n - 1; i >= 0; i--) {
        // نجد المحور في هذا الصف
        let pivotCol = -1;
        for (let j = 0; j < matrix.cols - 1; j++) {
            if (!matrix.data[i][j].isZero()) {
                pivotCol = j;
                break;
            }
        }
        
        if (pivotCol === -1) continue; // صف أصفار
        
        // نحسب قيمة المتغير
        let rhs = matrix.data[i][matrix.cols - 1].clone();
        
        for (let j = pivotCol + 1; j < matrix.cols - 1; j++) {
            if (solutions[j] !== null && !matrix.data[i][j].isZero()) {
                const term = matrix.data[i][j].multiply(solutions[j]);
                rhs = rhs.subtract(term);
            }
        }
        
        const pivot = matrix.data[i][pivotCol];
        solutions[pivotCol] = rhs.divide(pivot);
    }
    
    return solutions;
}

// التصدير للاستخدام في ملفات أخرى
window.Fraction = Fraction;
window.Matrix = Matrix;
window.generateEquations = generateEquations;
window.solveByBackSubstitution = solveByBackSubstitution;
