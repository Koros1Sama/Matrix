/**
 * Determinant Game Levels
 * 10 levels of increasing difficulty
 * With row operations simplification system
 * 
 * Operations available:
 * - Swap rows: det × (-1)
 * - Add k×row to another: det unchanged (FREE!)
 * 
 * Gradual requirements:
 * - Levels 1-2: No simplification (2x2 simple)
 * - Levels 3-5: Simplification optional, no requirements (3x3 Sarrus) 
 * - Level 6: Simplification with 1 required operation (add)
 * - Levels 7-8: Simplification with swap required
 * - Levels 9-10: Simplification with both swap and add required
 */

const determinantLevels = {
    // ========== 2x2 Matrices (Levels 1-2) - No simplification ==========
    1: {
        name: "المستوى 1",
        description: "مصفوفة 2×2 بسيطة",
        matrix: [
            [3, 2],
            [1, 4]
        ],
        answer: 10,
        minSteps: 1,
        hint: "استخدم الصيغة: ad - bc",
        requiresSimplification: false
    },
    
    2: {
        name: "المستوى 2",
        description: "مصفوفة 2×2 بأرقام سالبة",
        matrix: [
            [5, -3],
            [2, 4]
        ],
        answer: 26,
        minSteps: 1,
        hint: "انتبه للإشارات السالبة!",
        requiresSimplification: false
    },
    
    // ========== 3x3 Matrices - Sarrus (Levels 3-5) - Optional simplification ==========
    3: {
        name: "المستوى 3",
        description: "مصفوفة 3×3 بسيطة",
        matrix: [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ],
        answer: 0,
        minSteps: 2,
        hint: "استخدم طريقة ساروس (الأقطار)",
        requiresSimplification: true,
        requiredOperations: [],
        simplificationHint: "جرب التبسيط أو اضغط ابدأ الحل مباشرة"
    },
    
    4: {
        name: "المستوى 4",
        description: "مصفوفة 3×3 متوسطة",
        matrix: [
            [2, 1, 3],
            [1, 0, 2],
            [4, 1, 5]
        ],
        answer: -3,
        minSteps: 2,
        hint: "ارسم الأقطار الستة واحسب",
        requiresSimplification: true,
        requiredOperations: [],
        simplificationHint: "يمكنك التبسيط أو الحل مباشرة"
    },
    
    5: {
        name: "المستوى 5",
        description: "مصفوفة 3×3 بأرقام سالبة",
        matrix: [
            [3, -1, 2],
            [0, 2, -1],
            [1, 0, 3]
        ],
        answer: 23,
        minSteps: 2,
        hint: "احذر من الإشارات السالبة في الضرب",
        requiresSimplification: true,
        requiredOperations: [],
        simplificationHint: "التبسيط اختياري هنا"
    },
    
    // ========== Level 6: First required operation (add only - FREE!) ==========
    6: {
        name: "المستوى 6",
        description: "مصفوفة 3×3 - تدرب على الجمع",
        matrix: [
            [2, 4, 2],
            [1, 2, 1],
            [3, 1, 2]
        ],
        answer: 0,
        minSteps: 3,
        hint: "استخدم عملية الجمع لإنشاء أصفار",
        requiresSimplification: true,
        requiredOperations: ['add'],
        simplificationHint: "🎮 استخدم الجمع مرة على الأقل (مجاني!)"
    },
    
    // ========== Levels 7-8: Swap required ==========
    7: {
        name: "المستوى 7",
        description: "مصفوفة 3×3 - التبديل",
        matrix: [
            [0, 3, 2],
            [2, 1, 3],
            [4, 2, 5]
        ],
        answer: -7,
        minSteps: 4,
        hint: "العنصر الأول صفر - جرب التبديل",
        requiresSimplification: true,
        requiredOperations: ['swap'],
        simplificationHint: "🎮 استخدم التبديل (المحدد × -1)"
    },
    
    8: {
        name: "المستوى 8",
        description: "مصفوفة 4×4 بسيطة",
        matrix: [
            [1, 2, 0, 0],
            [3, 4, 0, 0],
            [0, 0, 2, 1],
            [0, 0, 1, 3]
        ],
        answer: -10,
        minSteps: 5,
        hint: "لاحظ البنية الكتلية للمصفوفة",
        requiresSimplification: true,
        requiredOperations: ['add'],
        simplificationHint: "🎮 استخدم الجمع لتبسيط"
    },
    
    // ========== Levels 9-10: Both swap and add required ==========
    9: {
        name: "المستوى 9",
        description: "مصفوفة 4×4 - التبديل والجمع",
        matrix: [
            [0, 1, 2, 1],
            [2, 1, 0, 1],
            [1, 0, 2, 1],
            [1, 1, 1, 2]
        ],
        answer: -5,
        minSteps: 5,
        hint: "ابدأ بتبديل الصف الأول ثم بسّط",
        requiresSimplification: true,
        requiredOperations: ['swap', 'add'],
        simplificationHint: "🎮 استخدم التبديل والجمع معاً"
    },
    
    10: {
        name: "المستوى 10",
        description: "التحدي النهائي! 4×4",
        matrix: [
            [2, 1, 3, 1],
            [4, 2, 1, 0],
            [1, 3, 2, 2],
            [3, 0, 4, 1]
        ],
        answer: -46,
        minSteps: 6,
        hint: "استخدم كل ما تعلمته من الخواص",
        requiresSimplification: true,
        requiredOperations: ['swap', 'add'],
        simplificationHint: "🎮 أظهر مهاراتك!"
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = determinantLevels;
}
