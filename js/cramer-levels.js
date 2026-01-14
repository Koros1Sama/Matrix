/**
 * Cramer's Rule Game Levels
 * Levels 1-2: 2×2 systems
 * Level 3: Det(A) = 0 special case (2×2) - early test
 * Levels 4-9: 3×3 systems
 * Levels 10-11: 4×4 systems
 */

const cramerLevels = {
    // ==================== 2×2 SYSTEMS (Levels 1-2) ====================
    1: {
        id: 1,
        size: 2,
        description: "البداية",
        coefficients: [
            [2, 1],
            [1, 1]
        ],
        constants: [5, 3],
        variables: ['x', 'y'],
        answers: { x: 2, y: 1 }
    },
    
    2: {
        id: 2,
        size: 2,
        description: "خطوة للأمام",
        coefficients: [
            [3, 2],
            [1, 4]
        ],
        constants: [13, 11],
        variables: ['x', 'y'],
        answers: { x: 3, y: 2 }
    },
    
    // ==================== SPECIAL CASE: Det(A) = 0 (2×2) ====================
    3: {
        id: 3,
        size: 2,
        description: "❌ المحدد = 0",
        coefficients: [
            [2, 4],
            [1, 2]
        ],
        constants: [6, 3],
        variables: ['x', 'y'],
        answers: null, // لا يوجد حل وحيد - قاعدة كرامر لا تعمل
        detIsZero: true
    },
    
    // ==================== 3×3 SYSTEMS (Levels 4-9) ====================
    4: {
        id: 4,
        size: 3,
        description: "ثلاث معادلات",
        coefficients: [
            [1, 1, 1],
            [2, 1, 0],
            [1, 0, 1]
        ],
        constants: [6, 5, 4],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 }
    },
    
    5: {
        id: 5,
        size: 3,
        description: "التعقيد يزداد",
        coefficients: [
            [2, 1, 1],
            [1, 2, 1],
            [1, 1, 2]
        ],
        constants: [10, 11, 12],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 }
    },
    
    6: {
        id: 6,
        size: 3,
        description: "أرقام سالبة",
        coefficients: [
            [1, -1, 2],
            [3, 1, -1],
            [2, 2, 1]
        ],
        constants: [8, 4, 13],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 }
    },
    
    7: {
        id: 7,
        size: 3,
        description: "تحدي الثلاثي",
        coefficients: [
            [1, 2, 3],
            [2, 3, 1],
            [3, 1, 2]
        ],
        constants: [14, 11, 11],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 }
    },
    
    8: {
        id: 8,
        size: 3,
        description: "أعداد كبيرة",
        coefficients: [
            [4, 2, 1],
            [2, 5, 2],
            [1, 2, 3]
        ],
        constants: [16, 22, 14],
        variables: ['x', 'y', 'z'],
        answers: { x: 2, y: 3, z: 2 }
    },
    
    9: {
        id: 9,
        size: 3,
        description: "اختبار الثلاثي",
        coefficients: [
            [1, 3, 2],
            [2, 1, 3],
            [3, 2, 1]
        ],
        constants: [13, 14, 10],
        variables: ['x', 'y', 'z'],
        answers: { x: 1, y: 2, z: 3 }
    },
    
    // ==================== 4×4 SYSTEMS (Levels 10-11) ====================
    10: {
        id: 10,
        size: 4,
        description: "أربع معادلات",
        coefficients: [
            [1, 1, 1, 1],
            [2, 1, 0, 1],
            [1, 2, 1, 0],
            [0, 1, 2, 1]
        ],
        constants: [10, 8, 8, 10],
        variables: ['w', 'x', 'y', 'z'],
        answers: { w: 1, x: 2, y: 3, z: 4 }
    },
    
    11: {
        id: 11,
        size: 4,
        description: "التحدي الكبير",
        coefficients: [
            [2, 1, 1, 0],
            [1, 2, 0, 1],
            [0, 1, 2, 1],
            [1, 0, 1, 2]
        ],
        constants: [8, 7, 10, 9],
        variables: ['w', 'x', 'y', 'z'],
        answers: { w: 1, x: 2, y: 3, z: 2 }
    }
};

// Export to window
window.cramerLevels = cramerLevels;
