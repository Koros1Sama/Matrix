/**
 * Lesson Step Animator
 * Provides smooth animations for all lesson steps (1-5, 7-8)
 * Similar style to the cinematic tutorial in step 6
 */

class LessonAnimator {
    constructor() {
        this.currentStep = 0;
        this.isAnimating = false;
        this.animationDelay = 150; // Base delay in ms
        this.observers = [];
    }
    
    init() {
        // Setup observers for each lesson step
        for (let i = 1; i <= 8; i++) {
            if (i === 6) continue; // Step 6 has its own cinematic tutorial
            
            const step = document.getElementById(`lesson-step-${i}`);
            if (step) {
                this.setupStepObserver(step, i);
            }
        }
    }
    
    setupStepObserver(step, stepNum) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    this.animateStep(stepNum);
                }
            });
        });
        
        observer.observe(step, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        this.observers.push(observer);
        
        // If already active on load
        if (step.classList.contains('active')) {
            setTimeout(() => this.animateStep(stepNum), 300);
        }
    }
    
    async animateStep(stepNum) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentStep = stepNum;
        
        const step = document.getElementById(`lesson-step-${stepNum}`);
        if (!step) {
            this.isAnimating = false;
            return;
        }
        
        try {
            // Reset all animations
            this.resetAnimations(step);
            
            // Animate title
            await this.animateElement(step.querySelector('.lesson-title'), 'fade-in-up');
            
            // Animate description
            await this.animateElement(step.querySelector('.lesson-desc'), 'fade-in-up', 100);
            
            // Animate matrix demo
            await this.animateMatrix(step);
            
            // Animate points/annotations
            await this.animatePoints(step);
            
            // Animate solution boxes
            await this.animateSolutionBox(step);
            
            // Animate tips
            await this.animateElement(step.querySelector('.lesson-tip'), 'fade-in-up', 100);
            
            // Animate comparisons (for step 8)
            await this.animateComparison(step);
            
        } catch (e) {
            // Animation interrupted
        }
        
        this.isAnimating = false;
    }
    
    resetAnimations(step) {
        const animatedElements = step.querySelectorAll('.animated');
        animatedElements.forEach(el => {
            el.classList.remove('animated', 'fade-in-up', 'pop-in', 'glow-pulse');
        });
        
        // Reset cells
        const cells = step.querySelectorAll('.demo-cell');
        cells.forEach(cell => {
            cell.style.opacity = '0';
            cell.style.transform = 'scale(0.8)';
        });
        
        // Reset points
        const points = step.querySelectorAll('.point, .annotation');
        points.forEach(p => {
            p.style.opacity = '0';
            p.style.transform = 'translateX(-20px)';
        });
        
        // Reset solution boxes
        const boxes = step.querySelectorAll('.solution-box');
        boxes.forEach(box => {
            box.style.opacity = '0';
            box.style.transform = 'scale(0.95)';
        });
    }
    
    async animateElement(element, animClass, delay = 0) {
        if (!element) return;
        
        await this.delay(delay);
        element.classList.add('animated', animClass);
        element.style.opacity = '1';
    }
    
    async animateMatrix(step) {
        const matrices = step.querySelectorAll('.demo-matrix');
        
        for (const matrix of matrices) {
            const rows = matrix.querySelectorAll('.demo-row');
            
            for (const row of rows) {
                const cells = row.querySelectorAll('.demo-cell');
                const divider = row.querySelector('.demo-divider');
                
                for (const cell of cells) {
                    if (this.currentStep !== parseInt(step.id.split('-')[2])) throw 'interrupted';
                    
                    await this.delay(this.animationDelay);
                    
                    cell.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    cell.style.opacity = '1';
                    cell.style.transform = 'scale(1)';
                    
                    // Add glow for pivots
                    if (cell.classList.contains('pivot')) {
                        cell.classList.add('glow-pulse');
                    }
                }
                
                // Animate divider
                if (divider) {
                    divider.style.transition = 'all 0.2s ease';
                    divider.style.opacity = '1';
                }
            }
        }
    }
    
    async animatePoints(step) {
        const points = step.querySelectorAll('.point, .annotation');
        
        for (const point of points) {
            if (this.currentStep !== parseInt(step.id.split('-')[2])) throw 'interrupted';
            
            await this.delay(200);
            point.style.transition = 'all 0.4s ease';
            point.style.opacity = '1';
            point.style.transform = 'translateX(0)';
        }
    }
    
    async animateSolutionBox(step) {
        const boxes = step.querySelectorAll('.solution-box');
        
        for (const box of boxes) {
            if (this.currentStep !== parseInt(step.id.split('-')[2])) throw 'interrupted';
            
            await this.delay(300);
            box.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            box.style.opacity = '1';
            box.style.transform = 'scale(1)';
            
            // Animate solution variables
            const vars = box.querySelectorAll('.solution-vars span');
            for (const v of vars) {
                await this.delay(150);
                v.classList.add('pop-in');
            }
        }
    }
    
    async animateComparison(step) {
        const comparisons = step.querySelectorAll('.comparison-item');
        const arrow = step.querySelector('.comparison-arrow');
        
        for (let i = 0; i < comparisons.length; i++) {
            const item = comparisons[i];
            if (this.currentStep !== parseInt(step.id.split('-')[2])) throw 'interrupted';
            
            await this.delay(300);
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            
            // Show arrow between items
            if (i === 0 && arrow) {
                await this.delay(200);
                arrow.style.transition = 'all 0.3s ease';
                arrow.style.opacity = '1';
            }
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    destroy() {
        this.observers.forEach(obs => obs.disconnect());
        this.observers = [];
    }
}

// Initialize on DOM load
let lessonAnimator;
document.addEventListener('DOMContentLoaded', () => {
    lessonAnimator = new LessonAnimator();
    lessonAnimator.init();
});
