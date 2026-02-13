import GridMap from "./GridMap";
import I18n from "./I18n";
import { Belt } from "./machines/Belt";
import { Machine } from "./machines/Machines";
import drawBelt from "./utils/drawUtil";
import type Rect from "./utils/Rect";
import Vector2 from "./utils/Vector2";




class IconsManager {
    private iconCollection: HTMLElement;

    public static icons: Map<string, HTMLDivElement> = new Map();
    public static selectedIcon: HTMLElement | null = null;

    private i18n: I18n = new I18n('/i18n');

    constructor(collectionId: string) {
        this.iconCollection = document.getElementById(collectionId)!;
        this.addBeltIcon(Belt.soildBelt);
        for (const [_, machine] of Machine.getAllMachines()) {
            this.addMachineIcon(machine);
        }
    }

    private buildIconElement(imgCache: HTMLImageElement): HTMLDivElement {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item';
        const img = imgCache;
        iconElement.appendChild(img);
        return iconElement;
    }

    private buildNameElement(id: string): HTMLDivElement {
        const nameElement = document.createElement('div');
        nameElement.className = 'icon-name'; // 添加CSS类名
        this.i18n.addTranslateList(() => {
            nameElement.textContent = this.i18n.t(id);
        });
        nameElement.style.fontSize = '12px';
        nameElement.style.textAlign = 'center';
        nameElement.style.marginTop = '4px';
        nameElement.style.maxWidth = '100%';
        nameElement.style.overflow = 'hidden';
        nameElement.style.textOverflow = 'ellipsis';
        return nameElement;
    }

    public addMachineIcon(machine: Machine): void {
        // 创建一个容器来包装图标和名称
        const iconWrapper = document.createElement('div');

        const iconElement = this.buildIconElement(machine.imgCache);
        const nameElement = this.buildNameElement(machine.id);

        iconWrapper.appendChild(iconElement);
        iconWrapper.appendChild(nameElement);

        // 将整个包装容器添加到iconCollection中
        this.iconCollection.appendChild(iconWrapper);

        IconsManager.icons.set(machine.id, iconElement);

        iconElement.addEventListener('click', () => {
            if (GridMap.PreviewMachine?.machine === machine) {
                IconsManager.cancel();
                return;
            }
            IconsManager.select(machine, iconElement);
        });
    }

    public addBeltIcon(belt: Belt): void {
        // 创建一个容器来包装图标和名称
        const iconWrapper = document.createElement('div');

        const iconElement = this.buildIconElement(belt.imgCache);
        const nameElement = this.buildNameElement(belt.id);

        iconWrapper.appendChild(iconElement);
        iconWrapper.appendChild(nameElement);

        // 将整个包装容器添加到iconCollection中
        this.iconCollection.appendChild(iconWrapper);

        IconsManager.icons.set(belt.id, iconElement);

        iconElement.addEventListener('click', () => {
            if (GridMap.PreviewBelt?.beltType === belt) {
                IconsManager.cancel();
                return;
            }
            IconsManager.select(belt, iconElement);
        });
    }

    public static cancel() {
        GridMap.previewCancel();
        if (IconsManager.selectedIcon)
            IconsManager.selectedIcon.classList.remove('active');
        IconsManager.selectedIcon = null;
    }

    public static select(type: Machine | Belt, icon: HTMLDivElement) {
        if (IconsManager.selectedIcon) IconsManager.selectedIcon.classList.remove('active');
        // 更新选中的图标引用
        IconsManager.selectedIcon = icon;
        if (type instanceof Machine) GridMap.PreviewMachine = type;
        if (type instanceof Belt) GridMap.PreviewBelt = type;
        // 添加active类到当前选中的图标
        IconsManager.selectedIcon.classList.add('active');
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

    // 添加变量用于判断是否为点击事件
    private startX: number = 0;
    private startY: number = 0;
    private isMouseDown: boolean = false;
    private mouseDownButton: number = 0;  // 记录按下的是哪个鼠标按键
    private dragThreshold: number = 5; // 最大移动阈值，超过此值认为是拖动

    // 使用变换矩阵替代offsetX和offsetY
    private transformMatrix: DOMMatrix = new DOMMatrix();

    private gridWidth: number = 80;
    private gridHeight: number = 80;

    private minScale: number = 0.2;
    private maxScale: number = 1;

    // 跟踪鼠标是否在canvas上
    private isMouseOverCanvas: boolean = false;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)!;

        // 创建两个canvas：一个用于网格，一个用于覆盖层（机器预览等）
        this.gridCanvas = document.createElement('canvas');
        this.overlayCanvas = document.createElement('canvas');

        this.gridCtx = null;
        this.overlayCtx = null;

        this.transformMatrix = new DOMMatrix();
        GridMap.init(this.gridWidth, this.gridHeight);

        this.setupCanvases();
        this.bindResizeListener();
        this.bindDragEvents();
        this.bindHoverEvents();
        this.bindRightClickEvents();
        this.bindWheelEvents();
        this.bindRotateEvents(); // 添加键盘事件绑定
        this.bindMouseEnterLeaveEvents(); // 添加鼠标进入/离开事件绑定
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
            this.mouseDownButton = e.button;  // 记录按下的是哪个按键

            // 只处理左键点击
            if (e.button !== 0) return;

            this.isDragging = false; // 开始时设为false
            this.isMouseDown = true; // 记录鼠标按下状态
            this.startX = e.clientX; // 记录开始位置
            this.startY = e.clientY;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.overlayCanvas.style.cursor = 'grabbing';
        });

        this.overlayCanvas.addEventListener('mousemove', (e) => {
            if (this.isMouseDown && this.mouseDownButton === 0) {  // 只处理左键的情况
                // 判断是否超过拖动阈值
                const distance = Math.pow(e.clientX - this.startX, 2) + Math.pow(e.clientY - this.startY, 2);
                if (distance > this.dragThreshold * this.dragThreshold) this.isDragging = true;
            }

            if (this.isDragging) {
                const deltaX = e.clientX - this.lastX;
                const deltaY = e.clientY - this.lastY;

                this.transformMatrix = this.transformMatrix.preMultiplySelf(
                    new DOMMatrix().translate(deltaX, deltaY)
                )

                this.lastX = e.clientX;
                this.lastY = e.clientY;

                this.drawGrid();
            }
        });

        this.overlayCanvas.addEventListener('mouseup', (e) => {
            // 只在按下和释放的是同一个按键时才处理
            if (this.mouseDownButton === e.button && this.isMouseDown && !this.isDragging) {
                // 如果是左键，没有拖动且鼠标曾经按下过，则认为是点击事件
                if (GridMap.PreviewMachine) {
                    if (GridMap.howOccupying().length) return;
                    if (!GridMap.build()) return;
                    IconsManager.cancel();
                    this.drawGrid();

                }
                else if (GridMap.PreviewBelt) {
                    if (GridMap.PreviewBelt.startFIXED) {
                        if (GridMap.build()) {
                            IconsManager.cancel();
                            this.drawGrid();
                        }
                    }
                    else {
                        GridMap.PreviewBelt.fixStart();
                    }
                }
            }

            this.isDragging = false;
            this.isMouseDown = false; // 重置鼠标按下状态
            this.mouseDownButton = -1;  // 重置鼠标按键记录
            this.overlayCanvas.style.cursor = 'grab';
        });

        this.overlayCanvas.addEventListener('mouseleave', () => {
            if (!this.isDragging && this.isMouseDown) {
                // 鼠标离开时如果之前处于按下的状态，但未拖动，则取消此次操作
                this.isMouseDown = false;
            }

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
            IconsManager.cancel();
            this.clearOverlay();
        });
    }

    // 添加鼠标悬停事件处理
    private bindHoverEvents(): void {
        this.overlayCanvas.addEventListener('mousemove', (e: MouseEvent) => {
            // 显示坐标
            const rect = this.gridCanvas.getBoundingClientRect();
            const mouseVec = new Vector2(e.clientX - rect.left, e.clientY - rect.top)
                .applyMatrix(this.transformMatrix.inverse())
                .divide(this.gridSize);
            GridMap.previewPositon(mouseVec.x, mouseVec.y);

            // 更新页面上的坐标显示
            const coordDisplay = document.getElementById('coordinates');
            if (coordDisplay) {
                coordDisplay.textContent = `(${1 + Math.floor(mouseVec.x)}, ${1 + Math.floor(mouseVec.y)})`;
            }

            this.clearOverlay();
            this.preview();
        });

        this.overlayCanvas.addEventListener('mouseleave', () => {
            // 当鼠标离开画布时清除坐标显示
            const coordDisplay = document.getElementById('coordinates');
            if (coordDisplay) coordDisplay.textContent = '(0, 0)';
            this.clearOverlay();
        });
    }

    // 清除覆盖层
    private clearOverlay(): void {
        if (this.overlayCtx) this.overlayCtx.clearRect(0, 0, this.CanvasW, this.CanvasH);
    }

    // 预览选中机器的虚影
    private preview(): void {
        if (!this.overlayCtx) return;
        if (!GridMap.onPreview()) return;
        this.overlayCtx.save();
        this.applyTransform(this.overlayCtx);
        this.overlayCtx.fillStyle = 'rgba(100, 100, 255, 0.25)'; // 半透明蓝色填充
        this.overlayCtx.strokeStyle = 'rgba(100, 100, 255, 0.75)'; // 半透明蓝色边框
        this.overlayCtx.lineWidth = Math.min(16 / this.transformMatrix.a, 4);
        this.overlayCtx.setLineDash([]);
        if (GridMap.PreviewMachine) {
            const rect: Rect | null = GridMap.PreviewMachine.shape();
            if (rect === null) return;
            const [startX, startY, width, height] = rect.toTuple();

            // 绘制填充矩形（注意：由于已应用了变换，这里直接使用网格坐标）
            this.overlayCtx.fillRect(
                startX * this.gridSize, startY * this.gridSize,
                width * this.gridSize, height * this.gridSize
            );

            // 绘制矩形边框
            this.overlayCtx.strokeRect(
                startX * this.gridSize, startY * this.gridSize,
                width * this.gridSize, height * this.gridSize);
        }
        if (GridMap.PreviewBelt) {
            if (GridMap.PreviewBelt.startFIXED) {
                const list = GridMap.PreviewBelt.shape();
                for (let i = 0; i < list.length; i++) {
                    const pos: Vector2 = list[i];
                    drawBelt(this.overlayCtx,
                        GridMap.PreviewBelt.shapeAt(i),
                        pos.x * this.gridSize,
                        pos.y * this.gridSize,
                        this.gridSize
                    );
                }
            }
            else {
                if (GridMap.PreviewBelt.start) {
                    this.overlayCtx.fillRect(
                        GridMap.PreviewBelt.start.x * this.gridSize, GridMap.PreviewBelt.start.y * this.gridSize,
                        this.gridSize, this.gridSize
                    );
                }
            }

        }

        this.overlayCtx.restore(); // 恢复绘图状态，确保不影响其他绘制
    }

    private getScale(): number {
        return Math.max(Math.abs(this.transformMatrix.a), Math.abs(this.transformMatrix.b));
    }

    private bindWheelEvents(): void {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault(); // 阻止页面滚动

            // 获取鼠标在canvas上的坐标
            const rect = this.gridCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;


            // 计算新的缩放级别
            const wheel = e.deltaY < 0 ? 1 : -1;
            const scaleFactor = Math.pow(1.1, wheel);

            this.transformMatrix.preMultiplySelf(new DOMMatrix().scaleSelf(scaleFactor, scaleFactor, 1, mouseX, mouseY));

            console.log('Scale:', this.getScale());

            // 更新缩放显示
            const scaleDisplay = document.getElementById('current-scale');
            if (scaleDisplay) {
                scaleDisplay.textContent = `${this.getScale().toFixed(2)}x`;
            }

            this.drawGrid();
            this.clearOverlay();
            this.preview();
        };

        this.overlayCanvas.addEventListener('wheel', handleWheel);
    }

    // 应用当前变换矩阵到Canvas上下文
    private applyTransform(ctx: CanvasRenderingContext2D): void {
        ctx.setTransform(ctx.getTransform().multiplySelf(this.transformMatrix));
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
        this.drawMachinesIcon(this.transformMatrix);

        // 恢复绘图状态
        this.gridCtx.restore();
    }

    public drawMachinesIcon(transform: DOMMatrix): void {
        if (!this.gridCtx) return;
        GridMap.allMachines.forEach((machineInstance) => {
            // 清空区域内容，绘制新背景色和边框
            const rect = machineInstance.shape();
            if (!rect) return;
            const [startX, startY, width, height] = rect.toTuple();
            const LT = new Vector2(startX, startY)
                .multiply(this.gridSize)
                .applyMatrix(transform);
            const RB = new Vector2(startX + width, startY + height)
                .multiply(this.gridSize)
                .applyMatrix(transform);

            const min_x = Math.min(LT.x, RB.x);
            const min_y = Math.min(LT.y, RB.y);
            const max_x = Math.max(LT.x, RB.x);
            const max_y = Math.max(LT.y, RB.y);

            // 绘制图标
            const img = machineInstance.machine.imgCache;
            if (!img.complete) return;

            // 保持原始宽高比
            const imgAspectRatio = img.naturalWidth / img.naturalHeight;

            const drawHeight = 0.8 * this.gridSize;
            const drawWidth = 0.8 * imgAspectRatio * this.gridSize;

            // 计算居中位置
            const drawX = min_x + (max_x - min_x - drawWidth) / 2;
            const drawY = min_y + (max_y - min_y - drawHeight) / 2;

            // 绘制机器图片
            this.gridCtx!.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        });
    }

    private drawGridLines(): void {
        if (!this.gridCtx) return;
        const lineWidth = Math.min(2 / this.getScale(), 6);

        // 绘制四周边界线 - 使用粗实线
        this.gridCtx.strokeStyle = '#999999';
        this.gridCtx.setLineDash([]);
        this.gridCtx.lineWidth = lineWidth;

        this.gridCtx.strokeRect(0, 0, this.gridWidth * this.gridSize, this.gridHeight * this.gridSize)

        // 当缩放级别足够高时，绘制内部网格线
        if (this.getScale() > 0.3) {
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

        // 绘制机器
        this.gridCtx.setLineDash([]);
        this.gridCtx.fillStyle = '#9f9f9f';
        this.gridCtx.strokeStyle = '#333333';
        this.gridCtx.lineWidth = 2;
        GridMap.allMachines.forEach((machineInstance) => {
            // 清空区域内容，绘制新背景色和边框
            const rect = machineInstance.shape();
            if (!rect) return;
            const [startX, startY, width, height] = rect.toTuple();
            const LT = new Vector2(startX, startY).multiply(this.gridSize)
            const RB = new Vector2(startX + width, startY + height).multiply(this.gridSize)

            const min_x = Math.min(LT.x, RB.x);
            const min_y = Math.min(LT.y, RB.y);
            const max_x = Math.max(LT.x, RB.x);
            const max_y = Math.max(LT.y, RB.y);
            this.gridCtx!.fillRect(min_x, min_y, max_x - min_x, max_y - min_y);
            this.gridCtx!.strokeRect(min_x, min_y, max_x - min_x, max_y - min_y);

            machineInstance.portShape().forEach(({ v1, v2, v3 }) => {
                v1 = v1.multiply(this.gridSize);
                v2 = v2.multiply(this.gridSize);
                v3 = v3.multiply(this.gridSize);
                this.gridCtx!.beginPath();
                this.gridCtx!.moveTo(v1.x, v1.y);
                this.gridCtx!.lineTo(v2.x, v2.y);
                this.gridCtx!.stroke();
                this.gridCtx!.beginPath();
                this.gridCtx!.moveTo(v3.x, v3.y);
                this.gridCtx!.lineTo(v2.x, v2.y);
                this.gridCtx!.stroke();
            });
        });
    }

    // 添加公共方法来重置网格视图
    public resetView(): void {
        this.transformMatrix = new DOMMatrix();

        // 更新缩放显示
        const scaleDisplay = document.getElementById('current-scale');
        if (scaleDisplay) {
            scaleDisplay.textContent = `${this.transformMatrix.a.toFixed(1)}x`;
        }

        this.drawGrid();
        this.clearOverlay(); // 清除预览层
    }

    // 添加围绕指定点的旋转方法
    private rotateAroundPoint(): void {
        // 获取鼠标在canvas上的坐标
        const rect = this.gridCanvas.getBoundingClientRect();
        const centerX = (rect.left + rect.right) / 2;
        const centerY = (rect.top + rect.bottom) / 2;
        // 创建旋转变换矩阵
        const rotationMatrix = new DOMMatrix()
            .translateSelf(centerX, centerY)  // 平移到中心点
            .rotateSelf(90)               // 旋转指定角度
            .translateSelf(-centerX, -centerY); // 平移回原位置

        // 将旋转变换应用到视角旋转矩阵
        this.transformMatrix.preMultiplySelf(rotationMatrix);
    }

    // 添加键盘事件绑定
    private bindRotateEvents(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r' && this.isMouseOverCanvas && e.ctrlKey) {
                e.preventDefault();
                // 执行围绕画布中心的旋转
                this.rotateAroundPoint();
                this.drawGrid();
                this.clearOverlay();
                this.preview();
            } else if (e.key.toLowerCase() === 'r' && this.isMouseOverCanvas && !e.ctrlKey) {
                // 单独按R键执行机器预览旋转功能
                GridMap.previewRotate(1);
                this.clearOverlay();
                this.preview();
            }
        });
    }

    // 绑定鼠标进入/离开canvas事件
    private bindMouseEnterLeaveEvents(): void {
        this.overlayCanvas.addEventListener('mouseenter', () => {
            this.isMouseOverCanvas = true;
        });
        this.overlayCanvas.addEventListener('mouseleave', () => {
            this.isMouseOverCanvas = false;
        });
    }
}

// 初始化网格
document.addEventListener('DOMContentLoaded', () => {
    const grid = new GridCanvas('grid-wrapper');

    // 初始化图标管理器
    const iconManager = new IconsManager('icon-collection');


    // 绑定缩放滑块事件 - 现在通过图标操作
    const zoomSlider = document.getElementById('zoom-slider') as HTMLInputElement;
    const zoomValue = document.getElementById('zoom-value');

    if (zoomSlider && zoomValue) {
        zoomSlider.addEventListener('input', () => {
            const scale = parseFloat(zoomSlider.value);
            zoomValue.textContent = scale.toFixed(1);
        });
    }
});