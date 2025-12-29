/**
 * Levels Data - بيانات المستويات
 * 15 مستوى متدرج الصعوبة
 * 1-4: مصفوفات 2×3
 * 5-9: مصفوفات 3×4
 * 10-14: مصفوفات 4×5
 * 15: مصفوفة 6×7
 * 
 * minSteps = الحد الأدنى الواقعي للخطوات (مع هامش بسيط)
 */

const LEVELS = [
    // المستويات 1-4: مصفوفات 2×3
    {
        id: 1,
        name: "البداية",
        size: [2, 3],
        variables: ['x', 'y'],
        matrix: [
            [1, 2, 5],
            [2, 1, 4]
        ],
        solution: { x: 1, y: 2 },
        minSteps: 3 // R2-2R1، R2×(-1/3) + هامش
    },
    {
        id: 2,
        name: "خطوة للأمام",
        size: [2, 3],
        variables: ['x', 'y'],
        matrix: [
            [2, 1, 7],
            [1, 3, 11]
        ],
        solution: { x: 2, y: 3 },
        minSteps: 4 // تبديل/ضرب + تصفير + ضرب
    },
    {
        id: 3,
        name: "السالب والموجب",
        size: [2, 3],
        variables: ['x', 'y'],
        matrix: [
            [2, -3, 1],
            [4, 1, 13]
        ],
        solution: { x: 2, y: 1 },
        minSteps: 4
    },
    {
        id: 4,
        name: "اختبار الثنائي",
        size: [2, 3],
        variables: ['x', 'y'],
        matrix: [
            [5, 2, 19],
            [3, -4, 1]
        ],
        solution: { x: 3, y: 2 },
        minSteps: 5
    },
    
    // المستويات 5-9: مصفوفات 3×4
    {
        id: 5,
        name: "ثلاث معادلات",
        size: [3, 4],
        variables: ['x', 'y', 'z'],
        matrix: [
            [1, 1, 1, 6],
            [2, 1, 0, 5],
            [1, 0, 1, 3]
        ],
        solution: { x: 1, y: 3, z: 2 },
        minSteps: 5
    },
    {
        id: 6,
        name: "التعقيد يزداد",
        size: [3, 4],
        variables: ['x', 'y', 'z'],
        matrix: [
            [2, 1, 1, 10],
            [1, 2, 1, 11],
            [1, 1, 2, 12]
        ],
        solution: { x: 1, y: 2, z: 3 },
        minSteps: 5
    },
    {
        id: 7,
        name: "إتقان الثلاثي",
        size: [3, 4],
        variables: ['x', 'y', 'z'],
        matrix: [
            [1, 2, 3, 14],
            [2, 3, 1, 11],
            [3, 1, 2, 11]
        ],
        solution: { x: 1, y: 2, z: 3 },
        minSteps: 6
    },
    {
        id: 8,
        name: "دخول الكسور",
        size: [3, 4],
        variables: ['x', 'y', 'z'],
        matrix: [
            [2, 1, 0, 5],
            [1, 3, 1, 10],
            [0, 2, 4, 12]
        ],
        solution: { x: 1, y: 3, z: new Fraction(3, 2) },
        minSteps: 6
    },
    {
        id: 9,
        name: "تحدي الكسور",
        size: [3, 4],
        variables: ['x', 'y', 'z'],
        matrix: [
            [4, 2, 1, 15],
            [2, 3, 2, 17],
            [1, 1, 4, 14]
        ],
        solution: { x: 2, y: 2, z: 2 },
        minSteps: 8
    },
    
    // المستويات 10-14: مصفوفات 4×5
    {
        id: 10,
        name: "أربع معادلات",
        size: [4, 5],
        variables: ['w', 'x', 'y', 'z'],
        matrix: [
            [1, 1, 1, 1, 10],
            [2, 1, 0, 1, 8],
            [1, 2, 1, 0, 8],
            [0, 1, 2, 1, 10]
        ],
        solution: { w: 1, x: 2, y: 3, z: 4 },
        minSteps: 8
    },
    {
        id: 11,
        name: "التحدي الكبير",
        size: [4, 5],
        variables: ['w', 'x', 'y', 'z'],
        matrix: [
            [2, 1, 1, 0, 8],
            [1, 2, 0, 1, 7],
            [0, 1, 2, 1, 10],
            [1, 0, 1, 2, 9]
        ],
        solution: { w: 1, x: 2, y: 3, z: 2 },
        minSteps: 10
    },
    {
        id: 12,
        name: "رباعي صعب",
        size: [4, 5],
        variables: ['w', 'x', 'y', 'z'],
        matrix: [
            [1, 2, 1, 3, 20],
            [2, 1, 3, 1, 18],
            [3, 1, 2, 1, 17],
            [1, 3, 1, 2, 17]
        ],
        solution: { w: 1, x: 2, y: 3, z: 4 },
        minSteps: 12
    },
    {
        id: 13,
        name: "خبير المصفوفات",
        size: [4, 5],
        variables: ['a', 'b', 'c', 'd'],
        matrix: [
            [2, 3, 1, 2, 21],
            [1, 2, 3, 1, 20],
            [3, 1, 2, 2, 20],
            [2, 2, 2, 3, 23]
        ],
        solution: { a: 2, b: 3, c: 4, d: 1 },
        minSteps: 14
    },
    {
        id: 14,
        name: "قبل الأخير",
        size: [4, 5],
        variables: ['p', 'q', 'r', 's'],
        matrix: [
            [1, 1, 2, 1, 12],
            [2, 1, 1, 2, 13],
            [1, 2, 1, 1, 10],
            [1, 1, 1, 2, 11]
        ],
        solution: { p: 1, q: 2, r: 3, s: 4 },
        minSteps: 11
    },
    
    // المستوى 15: مصفوفة 6×7
    {
        id: 15,
        name: "الأسطورة",
        size: [6, 7],
        variables: ['a', 'b', 'c', 'd', 'e', 'f'],
        matrix: [
            [1, 1, 1, 1, 1, 1, 21],
            [2, 1, 0, 1, 1, 1, 18],
            [1, 2, 1, 0, 1, 1, 17],
            [1, 1, 2, 1, 0, 1, 16],
            [1, 1, 1, 2, 1, 0, 15],
            [0, 1, 1, 1, 2, 1, 18]
        ],
        solution: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 },
        minSteps: 20
    }
];

// الحصول على مستوى معين
function getLevel(id) {
    return LEVELS.find(level => level.id === id);
}

// الحصول على جميع المستويات
function getAllLevels() {
    return LEVELS;
}

// التصدير
window.LEVELS = LEVELS;
window.getLevel = getLevel;
window.getAllLevels = getAllLevels;
