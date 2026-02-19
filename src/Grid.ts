import GridMap from "./GridMap";
import { drawBelt, drawMachineLinesFill, drawMachine, drawGridLines, drawMachinesIcon, drawBeltItems } from "./utils/drawUtil";
import Vector2 from "./utils/Vector2";
import { COLORS } from './utils/colors';
import { MachinesIconsManager } from "./MacineIconManager";
import { InstanceAttention } from "./AttentionManager";
import type { BeltInstance } from "./instance/BeltInstance";

/**
 * 优化后的事件管理器类
 * 集中处理所有canvas事件，提供统一的事件处理机制
 */
class GridCanvasEventManager {
    private overlayCanvas: HTMLCanvasElement;
    private gridCanvas: GridCanvas;
    private isDragging: boolean = false;
    private isMouseDown: boolean = false;
    private mouseDownButton: number = -1;
    private lastX: number = 0;
    private lastY: number = 0;
    private startX: number = 0;
    private startY: number = 0;
    private dragThreshold: number = 5;
    private isMouseOver: boolean = false;

    private readonly HOVER_DELAY: number = 10;

    constructor(overlayCanvas: HTMLCanvasElement, gridCanvas: GridCanvas) {
        this.overlayCanvas = overlayCanvas;
        this.gridCanvas = gridCanvas;
        this.bindEvents();
    }

    /**
     * 统一绑定所有事件监听器
     */
    private bindEvents(): void {
        // 鼠标事件
        this.overlayCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        // 使用通用节流函数处理mousemove事件
        this.overlayCanvas.addEventListener('mousemove', this.throttle(this.handleMouseMove.bind(this), this.HOVER_DELAY));
        this.overlayCanvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.overlayCanvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.overlayCanvas.addEventListener('mouseenter', this.handleMouseEnter.bind(this));

        // 右键菜单事件
        this.overlayCanvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));

        // 滚轮事件
        this.overlayCanvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    }

    private handleMouseDown(e: MouseEvent): void {
        e.preventDefault();

        this.isMouseDown = true;
        this.mouseDownButton = e.button;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;

        if (e.button === 0) { // 左键
            this.overlayCanvas.style.cursor = 'grabbing';
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        e.preventDefault();

        if (this.isMouseDown && this.mouseDownButton === 0) {
            // 检查是否达到拖动阈值
            const distance = Math.sqrt(
                Math.pow(e.clientX - this.startX, 2) +
                Math.pow(e.clientY - this.startY, 2)
            );

            if (distance > this.dragThreshold) {
                this.isDragging = true;
            }

            if (this.isDragging) {
                // 处理拖拽逻辑
                this.gridCanvas.handleDrag(e.clientX - this.lastX, e.clientY - this.lastY);
                this.lastX = e.clientX;
                this.lastY = e.clientY;
            }
        }

        // 直接处理悬停逻辑，由外部节流控制频率
        const mouseVec = this.gridCanvas.canvasToGridCoords(e.clientX, e.clientY);
        this.gridCanvas.handleHover(mouseVec);
    }

    private handleMouseUp(e: MouseEvent): void {
        e.preventDefault();

        if (this.mouseDownButton === 0 && this.isMouseDown) { // 左键释放
            if (!this.isDragging) {
                // 点击事件处理
                this.handleClick(e);
            }

            this.overlayCanvas.style.cursor = 'grab';
        }

        // 重置状态
        this.resetMouseState();
    }

    private handleMouseLeave(_: MouseEvent): void {
        // 如果鼠标按下状态下离开，取消操作
        if (this.isMouseDown && !this.isDragging) {
            this.resetMouseState();
        }

        this.isMouseOver = false;
        this.overlayCanvas.style.cursor = 'default';

        // 清除悬停相关状态
        this.clearHoverState();
        this.gridCanvas.handleMouseLeave();
    }

    private handleMouseEnter(_: MouseEvent): void {
        this.isMouseOver = true;
        if (!this.isMouseDown) {
            this.overlayCanvas.style.cursor = 'grab';
        }
    }

    private handleContextMenu(e: MouseEvent): void {
        e.preventDefault();
        this.gridCanvas.handleRightClick();
        this.resetMouseState();
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        this.gridCanvas.handleZoom(e.deltaY, e.clientX, e.clientY);
    }

    private handleClick(e: MouseEvent): void {
        const mouseVec = this.gridCanvas.canvasToGridCoords(e.clientX, e.clientY);
        this.gridCanvas.handleClick(mouseVec);
    }

    private clearHoverState(): void {
        // 不需要特殊处理
    }

    private resetMouseState(): void {
        this.isMouseDown = false;
        this.isDragging = false;
        this.mouseDownButton = -1;
    }

    /**
     * 节流函数，限制高频事件的触发频率
     */
    private throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
        let inThrottle: boolean;
        return function (this: any, ...args: Parameters<T>) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        } as T;
    }

    /**
     * 获取鼠标是否在canvas上
     */
    public get isMouseOverCanvas(): boolean {
        return this.isMouseOver;
    }

    /**
     * 销毁事件监听器，防止内存泄漏
     */
    public destroy(): void {
        this.overlayCanvas.removeEventListener('mousedown', this.handleMouseDown);
        this.overlayCanvas.removeEventListener('mousemove', this.handleMouseMove);
        this.overlayCanvas.removeEventListener('mouseup', this.handleMouseUp);
        this.overlayCanvas.removeEventListener('mouseleave', this.handleMouseLeave);
        this.overlayCanvas.removeEventListener('mouseenter', this.handleMouseEnter);
        this.overlayCanvas.removeEventListener('contextmenu', this.handleContextMenu);
        this.overlayCanvas.removeEventListener('wheel', this.handleWheel);

        this.clearHoverState();
        this.resetMouseState();
    }
}

/**
 * 优化后的GridCanvas类
 * 移除了分散的事件绑定代码，通过事件管理器统一处理
 */
export class GridCanvas {
    private container: HTMLElement;
    private gridCanvas: HTMLCanvasElement;
    private overlayCanvas: HTMLCanvasElement;
    private gridCtx: CanvasRenderingContext2D | null;
    private overlayCtx: CanvasRenderingContext2D | null;
    private eventManager: GridCanvasEventManager | null = null;

    private gridSize: number = 50;
    private CanvasW: number = 0;
    private CanvasH: number = 0;
    private transformMatrix: DOMMatrix = new DOMMatrix();
    private gridWidth: number = 80;
    private gridHeight: number = 80;
    private minScale: number = 0.2;
    private maxScale: number = 1;

    // 插值渲染相关属性
    private previousTransformMatrix: DOMMatrix = new DOMMatrix();
    private interpolatedTransform: DOMMatrix = new DOMMatrix();
    private interpolationFactor: number = 0;

    constructor(container: HTMLElement, gridCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement) {
        this.container = container;
        this.gridCanvas = gridCanvas;
        this.overlayCanvas = overlayCanvas;
        this.gridCtx = null;
        this.overlayCtx = null;

        this.transformMatrix = new DOMMatrix();
        this.previousTransformMatrix = new DOMMatrix();
        GridMap.init(this.gridWidth, this.gridHeight);

        this.setupCanvases();
        this.bindResizeListener();
        this.bindKeyboardEvents();
        this.initializeEventManager();
        this.drawGrid();
    }

    private setupCanvases(): void {
        // 设置canvas样式
        this.gridCanvas.style.display = 'block';
        this.gridCanvas.style.position = 'absolute';
        this.gridCanvas.style.width = '100%';
        this.gridCanvas.style.height = '100%';
        this.gridCanvas.style.zIndex = '1';

        this.overlayCanvas.style.display = 'block';
        this.overlayCanvas.style.position = 'absolute';
        this.overlayCanvas.style.width = '100%';
        this.overlayCanvas.style.height = '100%';
        this.overlayCanvas.style.zIndex = '2';

        this.container.appendChild(this.gridCanvas);
        this.container.appendChild(this.overlayCanvas);

        this.gridCtx = this.gridCanvas.getContext('2d');
        this.overlayCtx = this.overlayCanvas.getContext('2d');
        this.updateCanvasSize();
    }

    private initializeEventManager(): void {
        // 初始化事件管理器，传入overlayCanvas作为主要交互层
        this.eventManager = new GridCanvasEventManager(this.overlayCanvas, this);
    }

    private updateCanvasSize(): void {
        const rect = this.container.getBoundingClientRect();
        this.CanvasW = rect.width;
        this.CanvasH = rect.height;

        this.gridCanvas.width = this.CanvasW * devicePixelRatio;
        this.gridCanvas.height = this.CanvasH * devicePixelRatio;
        this.overlayCanvas.width = this.CanvasW * devicePixelRatio;
        this.overlayCanvas.height = this.CanvasH * devicePixelRatio;

        if (this.gridCtx) {
            this.gridCtx.scale(devicePixelRatio, devicePixelRatio);
        }
        if (this.overlayCtx) {
            this.overlayCtx.scale(devicePixelRatio, devicePixelRatio);
        }
    }

    private bindResizeListener(): void {
        window.addEventListener('resize', this.handleResize);
    }

    private bindKeyboardEvents(): void {
        document.addEventListener('keydown', this.handleKeyboard);
    }

    // 核心事件处理方法（供EventManager调用）

    public handleDrag(deltaX: number, deltaY: number): void {
        this.transformMatrix = this.transformMatrix.preMultiplySelf(
            new DOMMatrix().translate(deltaX, deltaY)
        );
        this.drawGrid();
    }

    public handleClick(gridPos: Vector2): void {
        const occupyCount = GridMap.howOccupying().length;
        console.log("occupyCount:", occupyCount);

        if (GridMap.PreviewMachine) {
            if (!occupyCount && GridMap.build()) { MachinesIconsManager.cancel(); }
        } else if (GridMap.PreviewBelt) {
            if (GridMap.PreviewBelt.started) {
                if (!occupyCount && GridMap.build()) { MachinesIconsManager.cancel(); }
            } else { GridMap.PreviewBelt.lockStart(); }

        } else { InstanceAttention.select = GridMap.isOccupiedBy(gridPos.floor()); }
        this.drawGrid();
    }

    public handleRightClick(): void {
        MachinesIconsManager.cancel();
        this.clearOverlay();
    }

    public handleZoom(deltaY: number, clientX: number, clientY: number): void {
        const rect = this.gridCanvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const wheel = deltaY < 0 ? 1 : -1;
        const scaleFactor = Math.pow(1.1, wheel);

        this.transformMatrix.preMultiplySelf(
            new DOMMatrix().scaleSelf(scaleFactor, scaleFactor, 1, mouseX, mouseY)
        );

        const scaleDisplay = document.getElementById('current-scale');
        if (scaleDisplay) {
            scaleDisplay.textContent = `${this.getScale().toFixed(2)}x`;
        }

        this.drawGrid();
        this.preview();
    }

    public handleHover(gridPos: Vector2): void {
        GridMap.previewPositon(gridPos.x, gridPos.y);

        const coordDisplay = document.getElementById('coordinates');
        if (coordDisplay) {
            coordDisplay.textContent = `(${1 + Math.floor(gridPos.x)}, ${1 + Math.floor(gridPos.y)})`;
        }

        this.preview();
    }

    public handleMouseLeave(): void {
        const coordDisplay = document.getElementById('coordinates');
        if (coordDisplay) coordDisplay.textContent = '(0, 0)';
        this.clearOverlay();
    }

    public canvasToGridCoords(clientX: number, clientY: number): Vector2 {
        const rect = this.gridCanvas.getBoundingClientRect();
        const mouseVec = new Vector2(clientX - rect.left, clientY - rect.top)
            .apply(this.transformMatrix.inverse())
            .div(this.gridSize);
        return mouseVec;
    }

    // 私有事件处理方法

    private handleResize = (): void => {
        this.updateCanvasSize();
        this.drawGrid();
        this.clearOverlay();
    };

    private handleKeyboard = (e: KeyboardEvent): void => {
        if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            if (e.ctrlKey && this.eventManager?.isMouseOverCanvas) {
                // Ctrl+R: 围绕画布中心旋转
                this.rotateAroundCenter();
            } else if (this.eventManager?.isMouseOverCanvas) {
                // R: 机器预览旋转
                GridMap.previewRotate(1);
                this.preview();
            }
        }
    };

    private rotateAroundCenter(): void {
        const rect = this.gridCanvas.getBoundingClientRect();
        const centerX = (rect.left + rect.right) / 2;
        const centerY = (rect.top + rect.bottom) / 2;

        const rotationMatrix = new DOMMatrix()
            .translateSelf(centerX, centerY)
            .rotateSelf(90)
            .translateSelf(-centerX, -centerY);

        this.transformMatrix.preMultiplySelf(rotationMatrix);
        this.drawGrid();
        this.preview();
    }

    private getScale(): number {
        return Math.max(Math.abs(this.transformMatrix.a), Math.abs(this.transformMatrix.b));
    }

    private applyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.setTransform(ctx.getTransform().multiplySelf(this.transformMatrix));
    }

    private clearOverlay(): void {
        if (this.overlayCtx) this.overlayCtx.clearRect(0, 0, this.CanvasW, this.CanvasH);
    }

    public preview(): void {
        if (!this.overlayCtx) return;
        this.clearOverlay();
        this.overlayCtx.save();
        this.applyInterpolatedTransform(this.overlayCtx);
        // 绘制机器
        this.overlayCtx.fillStyle = COLORS.PREVIEW_FILL;
        this.overlayCtx.strokeStyle = COLORS.PREVIEW_STROKE;
        this.overlayCtx.lineWidth = Math.min(16 / this.transformMatrix.a, 4);
        this.overlayCtx.setLineDash([]);
        if (GridMap.PreviewMachine) {
            drawMachine(this.overlayCtx, GridMap.PreviewMachine, this.gridSize);
        }
        // 绘制传送带
        if (GridMap.PreviewBelt) {
            if (GridMap.PreviewBelt.started) {
                // 已指定起点，绘制完整传送带
                const list = GridMap.PreviewBelt.shape();
                for (let i = 0; i < list.length; i++) {
                    const pos: Vector2 = list[i];
                    drawBelt(this.overlayCtx, GridMap.PreviewBelt.shapeAt(i), pos.x * this.gridSize, pos.y * this.gridSize, this.gridSize);
                }
            } else {
                if (GridMap.PreviewBelt.startPoint) {
                    // 起始点不在机器上，绘制警告方格
                    this.overlayCtx.fillStyle = COLORS.UNILLEGAL_COLOR;
                    this.overlayCtx.fillRect(
                        GridMap.PreviewBelt.startPoint.x * this.gridSize,
                        GridMap.PreviewBelt.startPoint.y * this.gridSize,
                        this.gridSize, this.gridSize
                    );
                } else if (GridMap.PreviewBelt.start) {
                    // 起始点在机器上，绘制选中效果
                    this.overlayCtx.fillStyle = COLORS.LIGHT_WHITE;
                    drawMachineLinesFill(this.overlayCtx, GridMap.PreviewBelt.start, this.gridSize);
                }
            }
        }
        // 绘制重叠部分提示
        this.overlayCtx.fillStyle = COLORS.OVERLAP_WARNING;
        GridMap.howOccupying().forEach((v: Vector2) => {
            this.overlayCtx!.fillRect(
                v.x * this.gridSize, v.y * this.gridSize,
                this.gridSize, this.gridSize
            );
        });

        GridMap.allBelts.forEach((belt: BeltInstance) => {
            drawBeltItems(this.overlayCtx!, belt, this.gridSize);
        });

        this.overlayCtx.restore();
    }

    public update(): void {
        // 保存当前变换矩阵作为下一帧的前一状态
        this.previousTransformMatrix.setMatrixValue(this.transformMatrix.toString());
        
        GridMap.update();
    }

    public setInterpolation(factor: number): void {
        this.interpolationFactor = Math.max(0, Math.min(1, factor));
        this.interpolatedTransform = this.getInterpolatedTransform()
    }

    private getInterpolatedTransform(): DOMMatrix {
        if (this.interpolationFactor <= 0) {
            return this.previousTransformMatrix;
        } else if (this.interpolationFactor >= 1) {
            return this.transformMatrix;
        } else {
            // 简单的线性插值
            const a = this.previousTransformMatrix.a + (this.transformMatrix.a - this.previousTransformMatrix.a) * this.interpolationFactor;
            const b = this.previousTransformMatrix.b + (this.transformMatrix.b - this.previousTransformMatrix.b) * this.interpolationFactor;
            const c = this.previousTransformMatrix.c + (this.transformMatrix.c - this.previousTransformMatrix.c) * this.interpolationFactor;
            const d = this.previousTransformMatrix.d + (this.transformMatrix.d - this.previousTransformMatrix.d) * this.interpolationFactor;
            const e = this.previousTransformMatrix.e + (this.transformMatrix.e - this.previousTransformMatrix.e) * this.interpolationFactor;
            const f = this.previousTransformMatrix.f + (this.transformMatrix.f - this.previousTransformMatrix.f) * this.interpolationFactor;
            
            return new DOMMatrix([a, b, c, d, e, f]);
        }
    }

    private getInterpolatedScale(): number {
        return Math.max(Math.abs(this.interpolatedTransform.a), Math.abs(this.interpolatedTransform.b));
    }

    private applyInterpolatedTransform(ctx: CanvasRenderingContext2D): void {
        ctx.setTransform(ctx.getTransform().multiplySelf(this.interpolatedTransform));
    }

    public drawGrid(): void {
        if (!this.gridCtx) return;

        this.gridCtx.save();
        this.gridCtx.beginPath();
        this.gridCtx.rect(0, 0, this.CanvasW, this.CanvasH);
        this.gridCtx.clip();

        this.gridCtx.clearRect(0, 0, this.CanvasW, this.CanvasH);

        this.gridCtx.save();
        this.applyInterpolatedTransform(this.gridCtx);

        // 绘制网格线
        const lineWidth = Math.min(2 / this.getInterpolatedScale(), 6);
        this.gridCtx.strokeStyle = COLORS.GRID_BORDER;
        this.gridCtx.setLineDash([]);
        this.gridCtx.lineWidth = lineWidth;
        this.gridCtx.strokeRect(0, 0, this.gridWidth * this.gridSize, this.gridHeight * this.gridSize);

        if (this.getInterpolatedScale() > 0.3) {
            this.gridCtx.strokeStyle = COLORS.GRID_LINE;
            this.gridCtx.setLineDash([5, 5]);
            this.gridCtx.lineWidth = lineWidth * 0.8;
            drawGridLines(this.gridCtx, this.gridWidth, this.gridHeight, this.gridSize);
        }

        // 绘制机器
        this.gridCtx.setLineDash([]);
        this.gridCtx.fillStyle = COLORS.MACHINE_FILL;
        this.gridCtx.strokeStyle = COLORS.MACHINE_STROKE;
        this.gridCtx.lineWidth = 2;
        GridMap.allMachines.forEach((machineInstance) => {
            drawMachine(this.gridCtx!, machineInstance, this.gridSize);
        });

        // 绘制传送带
        GridMap.allBelts.forEach((beltInstance) => {
            const list = beltInstance.shape();
            for (let i = 0; i < list.length; i++) {
                const pos: Vector2 = list[i];
                drawBelt(this.gridCtx!, beltInstance.shapeAt(i),
                    pos.x * this.gridSize, pos.y * this.gridSize, this.gridSize);
            }
        });

        // 回退transform，避免图片方向错误
        this.gridCtx.restore();

        // 绘制机器图标
        GridMap.allMachines.forEach((instance) => {
            // 图标绘制也使用插值变换
            drawMachinesIcon(this.gridCtx!, instance, this.interpolatedTransform, this.gridSize);
        });

        this.gridCtx.restore();
    }





    public resetView(): void {
        this.transformMatrix = new DOMMatrix();
        const scaleDisplay = document.getElementById('current-scale');
        if (scaleDisplay) {
            scaleDisplay.textContent = `${this.transformMatrix.a.toFixed(1)}x`;
        }
        this.drawGrid();
        this.clearOverlay();
    }

    /**
     * 销毁GridCanvas实例，清理所有资源
     */
    public destroy(): void {
        if (this.eventManager) {
            this.eventManager.destroy();
            this.eventManager = null;
        }

        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyboard);

        this.gridCtx = null;
        this.overlayCtx = null;
    }
}