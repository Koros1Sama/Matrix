/**
 * Inverse Game Levels
 * 10 progressive levels for learning matrix inverse method (Gauss-Jordan)
 * Levels 1-4: 2×2 systems
 * Levels 5-9: 3×3 systems
 * Level 10: 4×4 system
 */

const inverseLevels = {
    // ==================== 2×2 SYSTEMS (Levels 1-4) ====================
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
        solution: { x: 2, y: 1 },
        minSteps: 6
    },
    
    2: {
        id: 2,
        size: 2,
        description: "خطوة للأمام",
        coefficients: [
            [1, 2],
            [3, 1]
        ],
        constants: [8, 9],
        variables: ['x', 'y'],
        solution: { x: 2, y: 3 },
        minSteps: 6
    },
    
    3: {
        id: 3,
        size: 2,
        description: "أرقام سالبة",
        coefficients: [
            [2, -1],
            [1, 1]
        ],
        constants: [1, 5],
        variables: ['x', 'y'],
        solution: { x: 2, y: 3 },
        minSteps: 7
    },
    
    4: {
        id: 4,
        size: 2,
        description: "اختبار الثنائي",
        coefficients: [
            [3, 2],
            [2, 3]
        ],
        constants: [12, 13],
        variables: ['x', 'y'],
        solution: { x: 2, y: 3 },
        minSteps: 8
    },

    // ==================== حالة خاصة: مصفوفة شاذة ====================
    5: {
        id: 5,
        size: 2,
        description: "❌ لا يوجد معكوس",
        coefficients: [
            [1, 2],
            [2, 4]
        ],
        constants: [3, 6],
        variables: ['x', 'y'],
        solution: null, // مصفوفة شاذة - المحدد = 0
        minSteps: 2
    },

    // ==================== 3×3 SYSTEMS (Levels 6-10) ====================
    6: {
        id: 6,
        size: 3,
        description: "ثلاث معادلات",
        coefficients: [
            [1, 3, 3],
            [1, 4, 3],
            [1, 3, 4]
        ],
        constants: [1, 2, 3],
        variables: ['x', 'y', 'z'],
        solution: { x: -6, y: 1, z: 2 },
        minSteps: 12
    },
    
    7: {
        id: 7,
        size: 3,
        description: "خطوات أكثر",
        coefficients: [
            [1, 1, 1],
            [0, 2, 1],
            [1, 0, 1]
        ],
        constants: [6, 5, 4],
        variables: ['x', 'y', 'z'],
        solution: { x: 1, y: 2, z: 3 },
        minSteps: 10
    },
    
    8: {
        id: 8,
        size: 3,
        description: "التعقيد يزداد",
        coefficients: [
            [2, 1, 1],
            [1, 2, 1],
            [1, 1, 2]
        ],
        constants: [10, 11, 12],
        variables: ['x', 'y', 'z'],
        solution: { x: 1, y: 2, z: 3 },
        minSteps: 14
    },
    
    9: {
        id: 9,
        size: 3,
        description: "أرقام سالبة",
        coefficients: [
            [1, -1, 1],
            [2, 1, -1],
            [1, 1, 1]
        ],
        constants: [2, 3, 6],
        variables: ['x', 'y', 'z'],
        solution: { x: 1, y: 2, z: 3 },
        minSteps: 15
    },
    
    10: {
        id: 10,
        size: 3,
        description: "تحدي الثلاثي",
        coefficients: [
            [1, 2, 3],
            [2, 3, 1],
            [3, 1, 2]
        ],
        constants: [14, 11, 11],
        variables: ['x', 'y', 'z'],
        solution: { x: 1, y: 2, z: 3 },
        minSteps: 16
    },

    // ==================== 4×4 SYSTEM (Level 11) ====================
    11: {
        id: 11,
        size: 4,
        description: "التحدي الكبير",
        coefficients: [
            [1, 1, 1, 1],
            [2, 1, 0, 1],
            [1, 2, 1, 0],
            [0, 1, 2, 1]
        ],
        constants: [10, 8, 8, 10],
        variables: ['w', 'x', 'y', 'z'],
        solution: { w: 1, x: 2, y: 3, z: 4 },
        minSteps: 25
    }
};

// Export to window
window.inverseLevels = inverseLevels;
