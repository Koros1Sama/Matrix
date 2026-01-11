/**
 * Cramer's Rule Game Levels
 * 10 levels of increasing difficulty
 */

const cramerLevels = {
    // ========== 2x2 Systems (Levels 1-2) ==========
    1: {
        name: "المستوى 1",
        description: "نظام 2×2 بسيط",
        tutorial: 1, // Tutorial needed before this level
        // System: 2x + y = 5, x - y = 1
        coefficients: [
            [2, 1],
            [1, -1]
        ],
        constants: [5, 1],
        variables: ['x', 'y'],
        answers: { x: 2, y: 1 }, // Solution: x=2, y=1
        detA: -3, // 2*(-1) - 1*1 = -3
        minSteps: 3,
        hint: "احسب المحدد الأصلي أولاً"
    },
    
    2: {
        name: "المستوى 2",
        description: "نظام 2×2 بأرقام أكبر",
        // System: 3x + 2y = 12, x + 4y = 10
        coefficients: [
            [3, 2],
            [1, 4]
        ],
        constants: [12, 10],
        variables: ['x', 'y'],
        answers: { x: 2.8, y: 1.8 }, // Approximate
        detA: 10, // 3*4 - 2*1 = 10
        minSteps: 3,
        hint: "المحدد الأصلي = 10"
    },
    
    // ========== 3x3 Systems - Simple (Levels 3-5) ==========
    3: {
        name: "المستوى 3",
        description: "نظام 3×3 بسيط",
        tutorial: 2, // Tutorial needed before this level
        // System with nice integer solutions
        coefficients: [
            [1, 1, 1],
            [2, -1, 0],
            [0, 1, 2]
        ],
        constants: [6, 1, 5],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 },
        detA: -5,
        minSteps: 5,
        hint: "اختر طريقة ساروس أو التوسيع"
    },
    
    4: {
        name: "المستوى 4",
        description: "نظام 3×3 متوسط",
        coefficients: [
            [2, 1, -1],
            [1, 3, 2],
            [1, -1, 1]
        ],
        constants: [3, 13, 2],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 },
        detA: 11,
        minSteps: 5,
        hint: "ابحث عن الأصفار لتسهيل الحساب"
    },
    
    5: {
        name: "المستوى 5",
        description: "نظام 3×3 بأرقام سالبة",
        coefficients: [
            [1, 2, 3],
            [2, -1, 1],
            [3, 1, -1]
        ],
        constants: [14, 5, 2],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 },
        detA: 19,
        minSteps: 5,
        hint: "انتبه للإشارات!"
    },
    
    // ========== 3x3 Systems - Harder (Levels 6-8) ==========
    6: {
        name: "المستوى 6",
        description: "نظام 3×3 صعب",
        coefficients: [
            [3, -2, 1],
            [1, 1, 1],
            [2, 1, -1]
        ],
        constants: [4, 6, 1],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 },
        detA: -9,
        minSteps: 6,
        hint: "استخدم طريقة التوسيع للدقة"
    },
    
    7: {
        name: "المستوى 7",
        description: "نظام 3×3 بكسور",
        coefficients: [
            [1, 1, 2],
            [2, 3, 1],
            [1, 2, 1]
        ],
        constants: [8, 13, 7],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 2.5 },
        detA: -2,
        minSteps: 6,
        hint: "النتيجة قد تكون كسر"
    },
    
    8: {
        name: "المستوى 8",
        description: "تحدي 3×3",
        coefficients: [
            [2, -1, 3],
            [1, 2, -1],
            [3, 1, 2]
        ],
        constants: [9, 3, 12],
        variables: ['x', 'y', 'z'],
        answers: { x: 2, y: 1, z: 2 },
        detA: 16,
        minSteps: 6,
        hint: "تأكد من حساباتك!"
    },
    
    // ========== 4x4 System (Levels 9-10) ==========
    9: {
        name: "المستوى 9",
        description: "نظام 4×4 - مصفوفة قطرية",
        tutorial: 3,
        // Diagonal matrix for easier calculation
        coefficients: [
            [2, 0, 0, 0],
            [0, 3, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 2]
        ],
        constants: [4, 9, 2, 6],
        variables: ['x', 'y', 'z', 'w'],
        answers: { x: 2, y: 3, z: 2, w: 3 },
        detA: 12, // 2*3*1*2 = 12
        minSteps: 8,
        hint: "المصفوفة القطرية - المحدد = حاصل ضرب القطر"
    },
    
    10: {
        name: "المستوى 10",
        description: "التحدي الأخير! 4×4",
        coefficients: [
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 1],
            [1, 0, 0, 1]
        ],
        constants: [3, 5, 5, 4],
        variables: ['x', 'y', 'z', 'w'],
        answers: { x: 1, y: 2, z: 3, w: 2 },
        detA: 2,
        minSteps: 10,
        hint: "ابحث عن الصف أو العمود الأكثر أصفاراً"
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cramerLevels;
}
