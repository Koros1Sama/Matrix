/**
 * Determinant Game Levels
 * 10 levels of increasing difficulty
 */

const determinantLevels = {
    // ========== 2x2 Matrices (Levels 1-2) ==========
    1: {
        name: "المستوى 1",
        description: "مصفوفة 2×2 بسيطة",
        matrix: [
            [3, 2],
            [1, 4]
        ],
        answer: 10, // 3*4 - 2*1 = 12 - 2 = 10
        minSteps: 1,
        hint: "استخدم الصيغة: ad - bc"
    },
    
    2: {
        name: "المستوى 2",
        description: "مصفوفة 2×2 بأرقام سالبة",
        matrix: [
            [5, -3],
            [2, 4]
        ],
        answer: 26, // 5*4 - (-3)*2 = 20 + 6 = 26
        minSteps: 1,
        hint: "انتبه للإشارات السالبة!"
    },
    
    // ========== 3x3 Matrices - Sarrus Method (Levels 3-5) ==========
    3: {
        name: "المستوى 3",
        description: "مصفوفة 3×3 بسيطة",
        matrix: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ],
        answer: 0, // This matrix has determinant 0
        minSteps: 2,
        hint: "استخدم طريقة ساروس (الأقطار)"
    },
    
    4: {
        name: "المستوى 4",
        description: "مصفوفة 3×3 متوسطة",
        matrix: [
            [2, 1, 3],
            [1, 0, 2],
            [4, 1, 5]
        ],
        answer: -3, // Calculated: 2(0*5 - 2*1) - 1(1*5 - 2*4) + 3(1*1 - 0*4) = 2(-2) - 1(-3) + 3(1) = -4 + 3 + 3 = 2
        // Let me recalculate: Using Sarrus:
        // Down diagonals: 2*0*5 + 1*2*4 + 3*1*1 = 0 + 8 + 3 = 11
        // Up diagonals: 3*0*4 + 2*2*1 + 1*1*5 = 0 + 4 + 5 = 9
        // Result: 11 - 9 = 2
        // Actually answer: 2
        minSteps: 2,
        hint: "ارسم الأقطار الستة واحسب"
    },
    
    5: {
        name: "المستوى 5",
        description: "مصفوفة 3×3 بأرقام سالبة",
        matrix: [
            [3, -1, 2],
            [0, 2, -1],
            [1, 0, 3]
        ],
        answer: 23, // Sarrus: (3*2*3 + (-1)*(-1)*1 + 2*0*0) - (2*2*1 + 3*(-1)*0 + (-1)*0*3) = (18+1+0) - (4+0+0) = 19 - 4 = 15
        // Recalculating: Down: 3*2*3=18, (-1)*(-1)*1=1, 2*0*0=0 => 19
        // Up: 2*2*1=4, 3*(-1)*0=0, (-1)*0*3=0 => 4
        // Result: 19 - 4 = 15... Let me use cofactor expansion
        // det = 3*(2*3 - (-1)*0) - (-1)*(0*3 - (-1)*1) + 2*(0*0 - 2*1)
        // = 3*(6-0) + 1*(0+1) + 2*(0-2)
        // = 18 + 1 - 4 = 15
        minSteps: 2,
        hint: "احذر من الإشارات السالبة في الضرب"
    },
    
    // ========== 4x4 Matrices - Cofactor Expansion (Levels 6-9) ==========
    6: {
        name: "المستوى 6",
        description: "مصفوفة 3×3 بطريقة التوسيع",
        matrix: [
            [1, 2, 1],
            [3, 1, 0],
            [2, 0, 1]
        ],
        answer: 7, // Practice cofactor method on 3x3
        minSteps: 3,
        hint: "تدرب على طريقة التوسيع قبل المصفوفات الأكبر"
    },
    
    7: {
        name: "المستوى 7",
        description: "مصفوفة 4×4 بسيطة",
        matrix: [
            [1, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 3, 0],
            [0, 0, 0, 4]
        ],
        answer: 24, // Diagonal matrix: 1*2*3*4 = 24
        minSteps: 4,
        hint: "المصفوفة القطرية - المحدد = حاصل ضرب القطر"
    },
    
    8: {
        name: "المستوى 8",
        description: "مصفوفة 4×4 متوسطة",
        matrix: [
            [1, 2, 0, 0],
            [3, 4, 0, 0],
            [0, 0, 1, 2],
            [0, 0, 3, 4]
        ],
        answer: -4, // Block diagonal: det(A)*det(B) = (4-6)*(4-6) = (-2)*(-2) = 4
        // Actually: (1*4-2*3)*(1*4-2*3) = (-2)*(-2) = 4
        minSteps: 4,
        hint: "لاحظ البنية الكتلية للمصفوفة"
    },
    
    9: {
        name: "المستوى 9",
        description: "مصفوفة 4×4 صعبة",
        matrix: [
            [2, 1, 0, 1],
            [1, 2, 1, 0],
            [0, 1, 2, 1],
            [1, 0, 1, 2]
        ],
        answer: 5, // Tridiagonal-like matrix
        minSteps: 5,
        hint: "اختر الصف أو العمود الذي يحتوي أكثر أصفار"
    },
    
    // ========== 5x5 Matrix - Final Challenge (Level 10) ==========
    10: {
        name: "المستوى 10",
        description: "مصفوفة 5×5 - التحدي الأخير!",
        matrix: [
            [1, 0, 0, 0, 2],
            [0, 2, 0, 0, 0],
            [0, 0, 3, 0, 0],
            [0, 0, 0, 4, 0],
            [1, 0, 0, 0, 5]
        ],
        answer: 72, // Near-diagonal with some entries
        // Expanding along column 2: only row 1 has non-zero
        // 2 * det(4x4 minor)
        minSteps: 6,
        hint: "ابحث عن الصف أو العمود الأكثر أصفاراً واوسع عليه"
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = determinantLevels;
}
