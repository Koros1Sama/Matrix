/**
 * Drag and Drop System - نظام السحب والإفلات
 */

class DragDropManager {
    constructor(game) {
        this.game = game;
        this.draggingRow = null;
        this.dragStartY = 0;
        this.rowElements = [];
        this.enabled = true;
    }
    
    init(container) {
        this.container = container;
        this.bindEvents();
    }
    
    bindEvents() {
        // سنربط الأحداث عند إنشاء الصفوف
    }
    
    setupRow(rowElement, rowIndex) {
        // أحداث الماوس
        rowElement.addEventListener('mousedown', (e) => this.startDrag(e, rowIndex));
        rowElement.addEventListener('touchstart', (e) => this.startDrag(e, rowIndex), { passive: false });
        
        // أحداث السحب فوق
        rowElement.addEventListener('dragover', (e) => this.onDragOver(e, rowIndex));
        rowElement.addEventListener('dragenter', (e) => this.onDragEnter(e, rowIndex));
        rowElement.addEventListener('dragleave', (e) => this.onDragLeave(e, rowIndex));
        rowElement.addEventListener('drop', (e) => this.onDrop(e, rowIndex));
        
        this.rowElements[rowIndex] = rowElement;
    }
    
    startDrag(e, rowIndex) {
        if (!this.enabled) return;
        
        // تجاهل إذا كان النقر على الخلية
        if (e.target.classList.contains('matrix-cell')) return;
        
        e.preventDefault();
        
        const rowElement = this.rowElements[rowIndex];
        this.draggingRow = rowIndex;
        this.dragStartY = e.clientY || e.touches[0].clientY;
        
        rowElement.classList.add('dragging');
        
        // إضافة مستمعين للحركة والإفلات
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.onDragEnd);
        document.addEventListener('touchmove', this.onDragMove, { passive: false });
        document.addEventListener('touchend', this.onDragEnd);
        
        // إظهار مناطق الإفلات
        this.rowElements.forEach((el, idx) => {
            if (idx !== rowIndex) {
                el.classList.add('drop-target');
            }
        });
    }
    
    onDragMove = (e) => {
        if (this.draggingRow === null) return;
        
        e.preventDefault();
        
        const currentY = e.clientY || e.touches[0].clientY;
        const rowElement = this.rowElements[this.draggingRow];
        
        // تحريك الصف مع المؤشر
        const deltaY = currentY - this.dragStartY;
        rowElement.style.transform = `translateY(${deltaY}px)`;
        
        // تحديد الصف المستهدف
        const targetRow = this.findTargetRow(currentY);
        
        this.rowElements.forEach((el, idx) => {
            if (idx !== this.draggingRow) {
                el.classList.remove('drag-over');
                if (idx === targetRow) {
                    el.classList.add('drag-over');
                }
            }
        });
    }
    
    onDragEnd = (e) => {
        if (this.draggingRow === null) return;
        
        const currentY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || this.dragStartY;
        const targetRow = this.findTargetRow(currentY);
        
        // إزالة الأنماط
        const rowElement = this.rowElements[this.draggingRow];
        rowElement.classList.remove('dragging');
        rowElement.style.transform = '';
        
        this.rowElements.forEach(el => {
            el.classList.remove('drop-target', 'drag-over');
        });
        
        // تنفيذ التبديل إذا كان هناك صف مستهدف مختلف
        if (targetRow !== null && targetRow !== this.draggingRow) {
            this.game.swapRows(this.draggingRow, targetRow);
        }
        
        // تنظيف
        this.draggingRow = null;
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('touchmove', this.onDragMove);
        document.removeEventListener('touchend', this.onDragEnd);
    }
    
    findTargetRow(currentY) {
        for (let i = 0; i < this.rowElements.length; i++) {
            if (i === this.draggingRow) continue;
            
            const rect = this.rowElements[i].getBoundingClientRect();
            if (currentY >= rect.top && currentY <= rect.bottom) {
                return i;
            }
        }
        return null;
    }
    
    onDragOver(e, rowIndex) {
        if (this.draggingRow === null || this.draggingRow === rowIndex) return;
        e.preventDefault();
    }
    
    onDragEnter(e, rowIndex) {
        if (this.draggingRow === null || this.draggingRow === rowIndex) return;
        e.target.closest('.matrix-row').classList.add('drag-over');
    }
    
    onDragLeave(e, rowIndex) {
        e.target.closest('.matrix-row').classList.remove('drag-over');
    }
    
    onDrop(e, rowIndex) {
        e.preventDefault();
        if (this.draggingRow === null || this.draggingRow === rowIndex) return;
        
        this.game.swapRows(this.draggingRow, rowIndex);
        this.draggingRow = null;
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    reset() {
        this.draggingRow = null;
        this.rowElements = [];
    }
}

// التصدير
window.DragDropManager = DragDropManager;
