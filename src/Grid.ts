import { SelectedMachine, MachineIconsManager } from "./MachineIconsManager";
import type Conveyor from "./machines/Conveyor";
import {Machine, MachineInstance} from "./machines/Machines";
import Vector2 from "./utils/Vector2";

interface GridCell {
    occupied: boolean;
}


class GridMap {
    private static grid: GridCell[][];
    private static width: number = 0;
    private static height: number = 0;

    private static onPreview: boolean = false;
    private static previewMachine: Machine | null = null;
    private static previewConveyor: Conveyor | null = null;
    private static previewPos: Vector2 | null = null;
    private static previewRotation: number = 0;

    private static Conveyors: Array<Conveyor> = [];
    private static Machines: Array<MachineInstance> = [];

    constructor(width: number, height: number) {
        GridMap.grid = Array.from(
            { length: height },
            () => Array.from({ length: width }, () => ({ occupied: false }))
        );
        GridMap.width = width;
        GridMap.height = height;
    }

    public static previewM(machine: Machine | null) {
        GridMap.onPreview = true;
        GridMap.previewMachine = machine;
    }

    public static previewC(conveyor: Conveyor | null) {
        GridMap.onPreview = true;
        GridMap.previewConveyor = conveyor;
    }

    public static previewPositon(mouseX: number, mouseY: number) {
        GridMap.previewPos = new Vector2(Math.round(mouseX * 2) / 2, Math.round(mouseY * 2) / 2);
    }

    public static previewRotate(time: number) {
        GridMap.previewRotation = (GridMap.previewRotation + time) % 4;
    }

    public static previewCancel() {
        GridMap.onPreview = false;
        GridMap.previewMachine = null;
        GridMap.previewConveyor = null;

        GridMap.previewPos = null;
        GridMap.previewRotation = 0;
    }

    public static buildMachine(): boolean {
        if (!GridMap.checkMachine()) return false;
        GridMap.Machines.push(new MachineInstance(GridMap.previewMachine!,GridMap.previewPos!, GridMap.previewRotation ))
        return true;
    }

    public static checkMachine(): boolean {
        if (GridMap.previewMachine == null || GridMap.previewPos == null) return false;
        let R: Vector2 = Vector2.RIGHT.rotateCCW(GridMap.previewRotation);
        let D: Vector2 = Vector2.DOWN.rotateCCW(GridMap.previewRotation);
        let LT: Vector2 = GridMap.previewPos
            .subtract(R.multiply(GridMap.previewMachine.width / 2))
            .subtract(D.multiply(GridMap.previewMachine.height / 2));
        for (let i = 0; i < GridMap.previewMachine.height; i++) {
            for (let j = 0; j < GridMap.previewMachine.width; j++)
                if (GridMap.isOccupied(LT.add(R.multiply(j)).add(D.multiply(i)))) return false;
        }
        return true;
    }

    public static isOccupied(pos: Vector2): boolean {
        return GridMap.grid[pos.x][pos.y].occupied;
    }


    public static buildConveyor(): boolean {
        return true;
    }
    public static checkConveyor(): boolean {
        return true;
    }

    public static build(): boolean {
        if (!GridMap.onPreview) return false;
        if (GridMap.previewMachine != null) return GridMap.buildMachine();
        if (GridMap.previewConveyor != null) return GridMap.buildConveyor();
        return false;
    }

}

class GridCanvas {
    private container: HTMLElement;
    private gridCanvas: HTMLCanvasElement;      // 用于绘制网格的canvas
    private overlayCanvas: HTMLCanvasElement;   // 用于绘制机器预览等动态内容的canvas
    private gridCtx: CanvasRenderingContext2D | null;
    private overlayCtx: CanvasRenderingContext2D | null;

    private gridSize: number = 50;
    private CanvasW: number = 0;
    private CanvasH: number = 0;
    private isDragging: boolean = false;
    private lastX: number = 0;
    private lastY: number = 0;

    // 视角左上角的绝对坐标系位置 (scale == 1)
    private cameraX: number = 0;
    private cameraY: number = 0;

    // 使用变换矩阵替代offsetX和offsetY
    private transformMatrix: DOMMatrix = new DOMMatrix();


    private gridWidth: number = 80;
    private gridHeight: number = 80;

    private minScale: number = 0.2;
    private maxScale: number = 1;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)!;

        // 创建两个canvas：一个用于网格，一个用于覆盖层（机器预览等）
        this.gridCanvas = document.createElement('canvas');
        this.overlayCanvas = document.createElement('canvas');

        this.gridCtx = null;
        this.overlayCtx = null;

        this.transformMatrix = new DOMMatrix();

        this.setupCanvases();
        this.bindResizeListener();
        this.bindDragEvents();
        this.bindHoverEvents();
        this.bindRightClickEvents();
        this.bindWheelEvents();
        this.drawGrid();
    }

    private updateTransformMatrix(): void {

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
        this.overlayCanvas.style.zIndex = '2'; // 放在网格canvas之上

        // 将canvas添加到容器中
        this.container.appendChild(this.gridCanvas);
        this.container.appendChild(this.overlayCanvas);

        this.gridCtx = this.gridCanvas.getContext('2d');
        this.overlayCtx = this.overlayCanvas.getContext('2d');

        // 根据设备像素比调整canvas的实际尺寸
        this.updateCanvasSize();
    }

    private updateCanvasSize(): void {
        const rect = this.container.getBoundingClientRect();

        this.CanvasW = rect.width;
        this.CanvasH = rect.height;

        // 设置canvas的实际尺寸
        this.gridCanvas.width = this.CanvasW * devicePixelRatio;
        this.gridCanvas.height = this.CanvasH * devicePixelRatio;
        this.overlayCanvas.width = this.CanvasW * devicePixelRatio;
        this.overlayCanvas.height = this.CanvasH * devicePixelRatio;

        // 缩放绘图上下文以匹配设备像素比
        if (this.gridCtx) {
            this.gridCtx.scale(devicePixelRatio, devicePixelRatio);
        }
        if (this.overlayCtx) {
            this.overlayCtx.scale(devicePixelRatio, devicePixelRatio);
        }

        console.log(this.gridCtx?.getTransform());
    }

    private bindResizeListener(): void {
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
            this.drawGrid();
            this.clearOverlay(); // 清空预览层
        });
    }

    private bindDragEvents(): void {
        this.overlayCanvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.overlayCanvas.style.cursor = 'grabbing';
        });

        this.overlayCanvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = (e.clientX - this.lastX) * devicePixelRatio;
                const deltaY = (e.clientY - this.lastY) * devicePixelRatio;

                this.transformMatrix = this.transformMatrix.preMultiplySelf(
                    new DOMMatrix().translate(deltaX, deltaY)
                )

                this.lastX = e.clientX;
                this.lastY = e.clientY;

                this.drawGrid();
            }
        });

        this.overlayCanvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.overlayCanvas.style.cursor = 'grab';
        });

        this.overlayCanvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.overlayCanvas.style.cursor = 'default';
        });

        // 设置初始光标样式
        this.overlayCanvas.style.cursor = 'grab';
    }

    // 添加右键事件
    private bindRightClickEvents(): void {
        this.overlayCanvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            SelectedMachine.cancel();
            this.clearOverlay();
        });
    }

    // 添加鼠标悬停事件处理
    private bindHoverEvents(): void {
        const handleMouseMove = (e: MouseEvent) => {
            // 显示坐标
            const rect = this.gridCanvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) * devicePixelRatio;
            const mouseY = (e.clientY - rect.top) * devicePixelRatio;

            // 计算相对于网格的坐标（使用变换矩阵中的平移分量）
            const gridX = (mouseX - this.transformMatrix.e) / (this.transformMatrix.a * this.gridSize);
            const gridY = (mouseY - this.transformMatrix.f) / (this.transformMatrix.d * this.gridSize);

            // 更新页面上的坐标显示
            const coordDisplay = document.getElementById('coordinates');
            if (coordDisplay) {
                coordDisplay.textContent = `(${1 + Math.floor(gridX)}, ${1 + Math.floor(gridY)})`;
            }

            this.clearOverlay();
            this.PreviewSelectedMachine(SelectedMachine.selected, gridX, gridY);
        };
        this.overlayCanvas.addEventListener('mousemove', handleMouseMove);

        this.overlayCanvas.addEventListener('mouseleave', () => {
            // 当鼠标离开画布时清除坐标显示
            const coordDisplay = document.getElementById('coordinates');
            if (coordDisplay) coordDisplay.textContent = '(0, 0)';
            this.clearOverlay();
        });
    }

    // 清除覆盖层
    private clearOverlay(): void {
        if (this.overlayCtx) {
            this.overlayCtx.clearRect(0, 0, this.CanvasW, this.CanvasH);
        }
    }

    // 预览选中机器的虚影
    private PreviewSelectedMachine(machine: Machine | null, gridX: number, gridY: number): void {
        if (!SelectedMachine.selected) return;

        const startX = Math.round(gridX - 1.5);
        const startY = Math.round(gridY - 1.5);

        if (!this.overlayCtx) return;

        // 绘制矩形预览
        this.overlayCtx.save();

        // 应用变换矩阵
        this.applyTransform(this.overlayCtx);

        // 绘制半透明填充
        this.overlayCtx.fillStyle = 'rgba(100, 100, 255, 0.2)'; // 半透明蓝色填充

        // 计算起始点和尺寸（现在可以直接使用网格坐标）
        const startCellX = startX;
        const startCellY = startY;
        const rectWidth = 3; // 5个网格单位宽
        const rectHeight = 3; // 5个网格单位高

        // 绘制填充矩形（注意：由于已应用了变换，这里直接使用网格坐标）
        this.overlayCtx.fillRect(startCellX * this.gridSize, startCellY * this.gridSize,
            rectWidth * this.gridSize, rectHeight * this.gridSize);

        this.overlayCtx.setLineDash([]);
        this.overlayCtx.strokeStyle = 'rgba(100, 100, 255, 0.7)'; // 半透明蓝色边框
        this.overlayCtx.lineWidth = Math.min(16 / this.transformMatrix.a, 4);

        // 绘制矩形边框
        this.overlayCtx.strokeRect(startCellX * this.gridSize, startCellY * this.gridSize,
            rectWidth * this.gridSize, rectHeight * this.gridSize);

        this.overlayCtx.restore(); // 恢复绘图状态，确保不影响其他绘制
    }

    private bindWheelEvents(): void {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); // 阻止页面滚动

            // 获取鼠标在canvas上的坐标
            const rect = this.gridCanvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) * devicePixelRatio;
            const mouseY = (e.clientY - rect.top) * devicePixelRatio;


            // 计算新的缩放级别
            const wheel = e.deltaY < 0 ? 1 : -1;
            const scaleFactor = Math.pow(1.1, wheel);

            this.transformMatrix = this.transformMatrix.preMultiplySelf(new DOMMatrix().scaleSelf(scaleFactor, scaleFactor, 1, mouseX, mouseY));

            console.log(this.cameraX, this.cameraY, 'Scale:', this.transformMatrix.a);

            // 更新缩放显示
            const scaleDisplay = document.getElementById('current-scale');
            if (scaleDisplay) {
                scaleDisplay.textContent = `${this.transformMatrix.a.toFixed(2)}x`;
            }

            this.drawGrid();
            this.clearOverlay();

            // 重新绘制预览
            this.PreviewSelectedMachine(SelectedMachine.selected, mouseX, mouseY);
        };

        this.overlayCanvas.addEventListener('wheel', handleWheel);
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    // 应用当前变换矩阵到Canvas上下文
    private applyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.setTransform(ctx.getTransform().preMultiplySelf(this.transformMatrix));
    }

    public drawGrid(): void {
        if (!this.gridCtx) return;

        // 使用裁剪路径限制绘制区域，只显示可视区域
        this.gridCtx.save();
        this.gridCtx.beginPath();
        this.gridCtx.rect(0, 0, this.CanvasW, this.CanvasH);
        this.gridCtx.clip();

        // 清除画布
        this.gridCtx.clearRect(0, 0, this.CanvasW, this.CanvasH);

        // 应用变换矩阵
        this.gridCtx.save();
        this.applyTransform(this.gridCtx);

        // 绘制网格线 - 绘制覆盖可视区域的网格
        this.drawGridLines();

        // 恢复变换
        this.gridCtx.restore();

        // 恢复绘图状态
        this.gridCtx.restore();
    }


    private drawGridLines(): void {
        if (!this.gridCtx) return;
        const edgeT = 0.03;
        const lineWidth = Math.min(8 / this.transformMatrix.a, 2);

        // 绘制四周边界线 - 使用粗实线
        this.gridCtx.strokeStyle = '#999999';
        this.gridCtx.setLineDash([]);
        this.gridCtx.lineWidth = lineWidth;

        // 左边界 (x=0)
        this.gridCtx.beginPath();
        this.gridCtx.moveTo(0, -this.gridSize * edgeT);
        this.gridCtx.lineTo(0, this.gridHeight * this.gridSize + this.gridSize * edgeT);
        this.gridCtx.stroke();

        // 右边界 (x=gridWidth)
        this.gridCtx.beginPath();
        this.gridCtx.moveTo(this.gridWidth * this.gridSize, -this.gridSize * edgeT);
        this.gridCtx.lineTo(this.gridWidth * this.gridSize, this.gridHeight * this.gridSize + this.gridSize * edgeT);
        this.gridCtx.stroke();

        // 上边界 (y=0)
        this.gridCtx.beginPath();
        this.gridCtx.moveTo(-this.gridSize * edgeT, 0);
        this.gridCtx.lineTo(this.gridWidth * this.gridSize + this.gridSize * edgeT, 0);
        this.gridCtx.stroke();

        // 下边界 (y=gridHeight)
        this.gridCtx.beginPath();
        this.gridCtx.moveTo(-this.gridSize * edgeT, this.gridHeight * this.gridSize);
        this.gridCtx.lineTo(this.gridWidth * this.gridSize + this.gridSize * edgeT, this.gridHeight * this.gridSize);
        this.gridCtx.stroke();

        // 当缩放级别足够高时，绘制内部网格线
        if (this.transformMatrix.a > 0.32) {
            this.gridCtx.strokeStyle = '#999999';
            this.gridCtx.setLineDash([5, 5]);
            this.gridCtx.lineWidth = lineWidth * 0.8;

            // 绘制垂直线
            for (let x = 1; x < this.gridWidth; x++) {
                const screenX = x * this.gridSize;
                this.gridCtx.beginPath();
                this.gridCtx.moveTo(screenX, 0);
                this.gridCtx.lineTo(screenX, this.gridHeight * this.gridSize);
                this.gridCtx.stroke();
            }

            // 绘制水平线
            for (let y = 1; y < this.gridHeight; y++) {
                const screenY = y * this.gridSize;
                this.gridCtx.beginPath();
                this.gridCtx.moveTo(0, screenY);
                this.gridCtx.lineTo(this.gridWidth * this.gridSize, screenY);
                this.gridCtx.stroke();
            }
        }

        // 恢复默认状态
        this.gridCtx.setLineDash([]);
    }

    // 添加公共方法来重置网格视图
    public resetView(): void {
        this.transformMatrix = new DOMMatrix();
        this.updateTransformMatrix();

        // 更新缩放显示
        const scaleDisplay = document.getElementById('current-scale');
        if (scaleDisplay) {
            scaleDisplay.textContent = `${this.transformMatrix.a.toFixed(1)}x`;
        }

        this.drawGrid();
        this.clearOverlay(); // 清除预览层
    }
}

// 初始化网格
document.addEventListener('DOMContentLoaded', () => {
    const grid = new GridCanvas('grid-wrapper');

    // 将网格实例存储到全局变量，以便图标管理器可以访问
    (window as any).gridInstance = grid;

    // 初始化图标管理器
    const iconManager = new MachineIconsManager('icon-collection');

    // 绑定控制按钮事件 - 现在这些功能由图标管理器处理
    // 移除了原来的按钮事件绑定

    // 绑定缩放滑块事件 - 现在通过图标操作
    const zoomSlider = document.getElementById('zoom-slider') as HTMLInputElement;
    const zoomValue = document.getElementById('zoom-value');

    if (zoomSlider && zoomValue) {
        zoomSlider.addEventListener('input', () => {
            const scale = parseFloat(zoomSlider.value);
            zoomValue.textContent = scale.toFixed(1);

            // 在这里可以根据缩放值调整网格大小
            // 目前我们只更新数值显示
        });
    }

    // 绑定工具栏按钮事件 - 保留原有的工具栏功能
    document.getElementById('add-element')?.addEventListener('click', () => {
        alert('添加元素功能待实现');
    });

    document.getElementById('remove-element')?.addEventListener('click', () => {
        alert('删除元素功能待实现');
    });

    document.getElementById('save-grid')?.addEventListener('click', () => {
        alert('保存网格功能待实现');
    });

    document.getElementById('load-grid')?.addEventListener('click', () => {
        alert('加载网格功能待实现');
    });
});