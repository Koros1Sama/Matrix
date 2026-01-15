/**
 * Drag and Drop System - نظام السحب والإفلات
 * محسّن للأداء على الموبايل
 */

class DragDropManager {
    constructor(game) {
        this.game = game;
        this.draggingRow = null;
        this.dragStartY = 0;
        this.rowElements = [];
        this.rowRects = []; // تخزين مؤقت لمواقع الصفوف
        this.enabled = true;
        this.rafId = null; // معرف requestAnimationFrame
        this.pendingY = null; // الموقع المنتظر للتحديث
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
    
    // تخزين مواقع الصفوف مرة واحدة عند بدء السحب
    cacheRowRects() {
        this.rowRects = this.rowElements.map(el => {
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return {
                top: rect.top,
                bottom: rect.bottom,
                height: rect.height
            };
        });
    }
    
    startDrag(e, rowIndex) {
        if (!this.enabled) return;
        
        // تجاهل إذا كان النقر على الخلية أو الأزرار
        if (e.target.classList.contains('matrix-cell') || 
            e.target.classList.contains('row-quick-btn')) return;
        
        e.preventDefault();
        
        // تخزين مواقع الصفوف مرة واحدة
        this.cacheRowRects();
        
        const rowElement = this.rowElements[rowIndex];
        this.draggingRow = rowIndex;
        this.dragStartY = e.clientY || e.touches[0].clientY;
        
        // تفعيل will-change للأداء
        rowElement.style.willChange = 'transform';
        rowElement.classList.add('dragging');
        
        // إضافة مستمعين للحركة والإفلات
        document.addEventListener('mousemove', this.onDragMove, { passive: false });
        document.addEventListener('mouseup', this.onDragEnd);
        document.addEventListener('touchmove', this.onDragMove, { passive: false });
        document.addEventListener('touchend', this.onDragEnd);
        
        // إظهار مناطق الإفلات
        this.rowElements.forEach((el, idx) => {
            if (idx !== rowIndex && el) {
                el.classList.add('drop-target');
            }
        });
    }
    
    onDragMove = (e) => {
        if (this.draggingRow === null) return;
        
        e.preventDefault();
        
        // تخزين الموقع الجديد
        this.pendingY = e.clientY || (e.touches && e.touches[0].clientY);
        
        // استخدام requestAnimationFrame لتحسين الأداء
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(this.updateDragPosition);
        }
    }
    
    // تحديث الموقع باستخدام RAF
    updateDragPosition = () => {
        this.rafId = null;
        
        if (this.draggingRow === null || this.pendingY === null) return;
        
        const currentY = this.pendingY;
        const rowElement = this.rowElements[this.draggingRow];
        
        if (!rowElement) return;
        
        // تحريك الصف مع المؤشر
        const deltaY = currentY - this.dragStartY;
        rowElement.style.transform = `translateY(${deltaY}px)`;
        
        // تحديد الصف المستهدف باستخدام المواقع المخزنة
        const targetRow = this.findTargetRowCached(currentY);
        
        // تحديث تمييز الصف المستهدف
        this.rowElements.forEach((el, idx) => {
            if (el && idx !== this.draggingRow) {
                if (idx === targetRow) {
                    el.classList.add('drag-over');
                } else {
                    el.classList.remove('drag-over');
                }
            }
        });
    }
    
    onDragEnd = (e) => {
        if (this.draggingRow === null) return;
        
        // إلغاء أي RAF معلق
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        const currentY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || this.dragStartY;
        const targetRow = this.findTargetRowCached(currentY);
        
        // إزالة الأنماط
        const rowElement = this.rowElements[this.draggingRow];
        if (rowElement) {
            rowElement.classList.remove('dragging');
            rowElement.style.transform = '';
            rowElement.style.willChange = '';
        }
        
        this.rowElements.forEach(el => {
            if (el) {
                el.classList.remove('drop-target', 'drag-over');
            }
        });
        
        // تنفيذ التبديل إذا كان هناك صف مستهدف مختلف
        if (targetRow !== null && targetRow !== this.draggingRow) {
            this.game.swapRows(this.draggingRow, targetRow);
        }
        
        // تنظيف
        this.draggingRow = null;
        this.pendingY = null;
        this.rowRects = [];
        
        document.removeEventListener('mousemove', this.onDragMove);
        document.removeEventListener('mouseup', this.onDragEnd);
        document.removeEventListener('touchmove', this.onDragMove);
        document.removeEventListener('touchend', this.onDragEnd);
    }
    
    // بحث باستخدام المواقع المخزنة (أسرع)
    findTargetRowCached(currentY) {
        for (let i = 0; i < this.rowRects.length; i++) {
            if (i === this.draggingRow) continue;
            
            const rect = this.rowRects[i];
            if (rect && currentY >= rect.top && currentY <= rect.bottom) {
                return i;
            }
        }
        return null;
    }
    
    // الدالة القديمة للتوافق
    findTargetRow(currentY) {
        for (let i = 0; i < this.rowElements.length; i++) {
            if (i === this.draggingRow) continue;
            
            const el = this.rowElements[i];
            if (!el) continue;
            
            const rect = el.getBoundingClientRect();
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
        const row = e.target.closest('.matrix-row');
        if (row) row.classList.add('drag-over');
    }
    
    onDragLeave(e, rowIndex) {
        const row = e.target.closest('.matrix-row');
        if (row) row.classList.remove('drag-over');
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
        // إلغاء أي RAF معلق
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.draggingRow = null;
        this.rowElements = [];
        this.rowRects = [];
        this.pendingY = null;
    }
}

// التصدير
window.DragDropManager = DragDropManager;
