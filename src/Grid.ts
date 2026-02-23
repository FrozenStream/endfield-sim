import { drawBelt, drawRectLinesFill, drawMachine, drawGridLines, drawMachinesIcon, drawBeltItems, drawCellLinesFill, drawCellFill, drawAttention, drawRect as drawFillRect } from "./utils/drawUtil";
import Vector2 from "./utils/Vector2";
import { COLORS } from './utils/colors';
import { MachinesIconsManager } from "./MacineIconManager";
import { AttentionManager } from "./AttentionManager";
import { BeltInstance, BeltSec } from "./instance/BeltInstance";
import type { GridMap } from "./GridMap";
import { MachineInstance, portInstance } from "./instance/MachineInstance";

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

    private minScale: number = 0.2;
    private maxScale: number = 1;
    private transformMatrix: DOMMatrix = new DOMMatrix();

    private gridMap: GridMap;
    private machinesIconsManager: MachinesIconsManager;
    private instanceAttention: AttentionManager;

    constructor(container: HTMLElement, gridCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement,
        gridMap: GridMap, machinesIconsManager: MachinesIconsManager, instanceAttention: AttentionManager) {
        this.container = container;
        this.gridCanvas = gridCanvas;
        this.overlayCanvas = overlayCanvas;
        this.gridCtx = null;
        this.overlayCtx = null;

        this.transformMatrix = new DOMMatrix();
        this.gridMap = gridMap;
        this.machinesIconsManager = machinesIconsManager;
        this.instanceAttention = instanceAttention;

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
        const occupyCount = this.gridMap.howOccupying().length;
        console.log("occupyCount:", occupyCount);

        if (this.gridMap.PreviewMachine) {
            if (!occupyCount && this.gridMap.buildInstance()) { this.machinesIconsManager.cancel(); }
        } else if (this.gridMap.PreviewBelt) {
            if (this.gridMap.PreviewBelt.started) {
                if (!occupyCount && this.gridMap.buildInstance()) { this.machinesIconsManager.cancel(); }
            } else { this.gridMap.PreviewBelt.lockStart(); }

        } else { this.instanceAttention.select = this.gridMap.isOccupiedBy(gridPos.floor()); }
        this.drawGrid();
    }

    public handleRightClick(): void {
        this.machinesIconsManager.cancel();
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
        this.gridMap.previewPositon(gridPos.x, gridPos.y);

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
                this.gridMap.previewRotate(1);
                this.preview();
            }
        }
        // 添加对'd'键的处理
        else if (e.key.toLowerCase() === 'd') {
            e.preventDefault();
            // 当instanceAttention.select有值时执行动作
            if (this.instanceAttention.select) {
                const selectedInstance = this.instanceAttention.select;
                console.log('delete:', selectedInstance);
                if (selectedInstance instanceof MachineInstance) {
                    this.gridMap.destroyInstance(selectedInstance);
                    this.instanceAttention.cancel();
                }
                else if (selectedInstance instanceof BeltInstance) {
                    this.gridMap.destroyInstance(selectedInstance);
                    this.instanceAttention.cancel();
                }
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
        this.applyTransform(this.overlayCtx);
        // 绘制机器
        this.overlayCtx.fillStyle = COLORS.PREVIEW_FILL;
        this.overlayCtx.strokeStyle = COLORS.BLUE;
        this.overlayCtx.lineWidth = Math.min(16 / this.transformMatrix.a, 4);
        this.overlayCtx.setLineDash([]);
        if (this.gridMap.PreviewMachine) {
            drawMachine(this.overlayCtx, this.gridMap.PreviewMachine, this.gridSize);
            if (this.gridMap.PreviewMachine.machine.prividePower > 0) {
                this.overlayCtx.fillStyle = COLORS.LIGHT_BLUE;
                const rect = this.gridMap.PreviewMachine.rect?.spread(this.gridMap.PreviewMachine.machine.prividePower);
                if (rect) {
                    drawFillRect(this.overlayCtx, rect, this.gridSize);
                    this.overlayCtx.fillStyle = COLORS.LIGHT_YELLOW;
                    this.gridMap.effectingMachines(rect).forEach(machine => drawRectLinesFill(this.overlayCtx!, machine.rect, this.gridSize));
                }
            }
        }
        // 绘制选中机器
        if (this.instanceAttention.select instanceof MachineInstance) drawAttention(this.overlayCtx, this.instanceAttention.select, this.gridSize);

        // 绘制传送带
        if (this.gridMap.PreviewBelt) {
            if (this.gridMap.PreviewBelt.started) {
                // 已指定起点，绘制完整传送带
                drawBelt(this.overlayCtx, this.gridMap.PreviewBelt, this.gridSize);
            } else {
                if (!this.gridMap.PreviewBelt.vaild && this.gridMap.PreviewBelt.startPos) {
                    // 起始点不在机器上，绘制警告方格
                    this.overlayCtx.fillStyle = COLORS.UNILLEGAL_COLOR;
                    this.overlayCtx.fillRect(
                        this.gridMap.PreviewBelt.startPos.x * this.gridSize,
                        this.gridMap.PreviewBelt.startPos.y * this.gridSize,
                        this.gridSize, this.gridSize
                    );
                } else if (this.gridMap.PreviewBelt.start) {
                    // 起始点在机器上，绘制选中效果
                    this.overlayCtx.fillStyle = COLORS.LIGHT_WHITE;
                    if (this.gridMap.PreviewBelt.start instanceof MachineInstance) {
                        drawRectLinesFill(this.overlayCtx, this.gridMap.PreviewBelt.start.rect, this.gridSize);
                    }
                    else if (this.gridMap.PreviewBelt.start instanceof portInstance) {
                        drawCellLinesFill(this.overlayCtx, this.gridMap.PreviewBelt.start.position.floor(), this.gridSize, COLORS.CELL_LINES_FILL);
                        drawCellFill(this.overlayCtx, this.gridMap.PreviewBelt.startPos, this.gridSize, COLORS.PREVIEW_GREEN)
                    }
                    else if (this.gridMap.PreviewBelt.start instanceof BeltSec) {
                        drawCellLinesFill(this.overlayCtx, this.gridMap.PreviewBelt.start.position, this.gridSize, COLORS.CELL_LINES_FILL);
                        drawCellFill(this.overlayCtx, this.gridMap.PreviewBelt.startPos, this.gridSize, COLORS.PREVIEW_GREEN)
                    }
                }
            }
        }
        // 绘制重叠部分提示
        this.overlayCtx.fillStyle = COLORS.OVERLAP_WARNING;
        this.gridMap.howOccupying().forEach((v: Vector2) => {
            this.overlayCtx!.fillRect(
                v.x * this.gridSize, v.y * this.gridSize,
                this.gridSize, this.gridSize
            );
        });

        this.gridMap.allBelts.forEach((belt: BeltInstance) => {
            drawBeltItems(this.overlayCtx!, belt, this.gridSize);
        });

        this.overlayCtx.restore();
    }

    public update(): void {
        this.gridMap.update();
    }

    public drawGrid(): void {
        if (!this.gridCtx) return;

        this.gridCtx.save();
        this.gridCtx.beginPath();
        this.gridCtx.rect(0, 0, this.CanvasW, this.CanvasH);
        this.gridCtx.clip();

        this.gridCtx.clearRect(0, 0, this.CanvasW, this.CanvasH);

        this.gridCtx.save();
        this.applyTransform(this.gridCtx);

        // 绘制网格线
        const lineWidth = Math.min(2 / this.getScale(), 6);
        this.gridCtx.strokeStyle = COLORS.GRID_BORDER;
        this.gridCtx.setLineDash([]);
        this.gridCtx.lineWidth = lineWidth;
        this.gridCtx.strokeRect(0, 0, this.gridMap.width * this.gridSize, this.gridMap.height * this.gridSize);

        if (this.getScale() > 0.3) {
            this.gridCtx.strokeStyle = COLORS.GRID_LINE;
            this.gridCtx.setLineDash([5, 5]);
            this.gridCtx.lineWidth = lineWidth * 0.8;
            drawGridLines(this.gridCtx, this.gridMap.width, this.gridMap.height, this.gridSize);
        }

        // 绘制机器
        this.gridCtx.setLineDash([]);
        this.gridCtx.fillStyle = COLORS.MACHINE_FILL;
        this.gridCtx.strokeStyle = COLORS.MACHINE_STROKE;
        this.gridCtx.lineWidth = 2;
        this.gridMap.allMachines.forEach((machineInstance) =>
            drawMachine(this.gridCtx!, machineInstance, this.gridSize));

        // 绘制传送带
        this.gridMap.allBelts.forEach((beltInstance) =>
            drawBelt(this.gridCtx!, beltInstance, this.gridSize));

        // 回退transform，避免图片方向错误
        this.gridCtx.restore();

        // 绘制机器图标
        this.gridMap.allMachines.forEach((instance) =>
            drawMachinesIcon(this.gridCtx!, instance, this.transformMatrix, this.gridSize));

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