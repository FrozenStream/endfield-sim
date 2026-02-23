import { BeltInstance, BeltSec } from "./instance/BeltInstance";
import { MachineInstance, portInstance } from "./instance/MachineInstance";
import type { Item } from "./proto/Item";
import { ItemStack } from "./proto/ItemStack";
import { EnumInventoryType } from "./utils/EnumInventoryType";



export class AttentionManager {
    private selectingInstance: MachineInstance | BeltSec | null = null;

    private selectingSlot: HTMLDivElement | null = null;
    private selectingInv: ItemStack | null = null;

    private currentflash: (() => void) | null = null;
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public flash() {
        if (this.currentflash) {
            this.currentflash();
        }
    }

    set select(instance: MachineInstance | portInstance | BeltSec | null) {
        if (!instance) { this.cancel(); return; }
        if (instance instanceof portInstance && instance.owner !== this.selectingInstance) 
            this.openAny(instance.owner);
        if (instance instanceof MachineInstance && instance !== this.selectingInstance) {
            this.openAny(instance);
        }
        else if (instance instanceof BeltInstance) {
        }
    }

    private openAny(instance: MachineInstance) {
        this.clear();
        switch (instance.currentMode.inventory) {
            case EnumInventoryType.Storage_1_solid_1_solid:
                this.createLayout_1_solid_1_solid(instance);
                break;
            case EnumInventoryType.Storage_2_solid_1_solid:
                this.createLayout_2_solid_1_solid(instance);
                break;
            case EnumInventoryType.Storage_6_Solid:
                this.createLayout_6_Solid(instance);
                break;
        }
        this.selectingInstance = instance;
    }

    get select(): MachineInstance | portInstance | BeltSec | null {
        return this.selectingInstance;
    }

    cancel() {
        this.selectingInstance = null;
        this.clear();
    }

    private clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.selectingSlot = null;
        this.selectingInv = null;
    }


    addItemto(item: Item): void {
        if (!this.selectingInv) return;
        if (this.selectingInv.item !== item) this.selectingInv.clear();
        const newStack = new ItemStack(item, item.type, 1);
        this.selectingInv.merge(newStack);

        // 添加物品后立即刷新显示
        if (this.currentflash) {
            this.currentflash();
        }
    }


    delItemto(item: Item) {
        if (!this.selectingInv) return;
        if (this.selectingInv.item !== item) this.selectingInv.clear();
        this.selectingInv.count = Math.max(0, this.selectingInv.count - 1);

        // 添加物品后立即刷新显示
        if (this.currentflash) {
            this.currentflash();
        }
    }

    buildInSlot_Solid(): [HTMLDivElement, HTMLImageElement, HTMLSpanElement] {
        const inputSlot = document.createElement('div');
        inputSlot.className = 'slot input-slot';
        const plusSign = document.createElement('span');
        plusSign.className = 'plus-sign';
        plusSign.textContent = '+';
        inputSlot.appendChild(plusSign);

        // 添加覆盖整个方格的 img 元素，初始 src 为空
        const img = document.createElement('img');
        img.className = 'slot-overlay-image';
        img.src = ''; // 初始为空
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.pointerEvents = 'none'; // 确保不会干扰点击事件
        inputSlot.appendChild(img);

        // 添加右下角数字显示元素
        const numberDisplay = document.createElement('span');
        numberDisplay.className = 'slot-number-display';
        numberDisplay.textContent = '0';
        numberDisplay.style.position = 'absolute';
        numberDisplay.style.bottom = '2px';
        numberDisplay.style.right = '2px';
        numberDisplay.style.fontSize = '12px';
        numberDisplay.style.fontWeight = 'bold';
        numberDisplay.style.color = '#ffffff';
        numberDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        numberDisplay.style.padding = '1px 4px';
        numberDisplay.style.borderRadius = '3px';
        numberDisplay.style.pointerEvents = 'none';
        numberDisplay.style.zIndex = '10';
        inputSlot.appendChild(numberDisplay);

        return [inputSlot, img, numberDisplay];
    }

    buildArrayMark(): HTMLDivElement {
        const arrowContainer = document.createElement('div');
        arrowContainer.className = 'arrow-container';
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.textContent = '→';
        arrowContainer.appendChild(arrow);
        return arrowContainer;
    }

    buildOutSlot_Solid(): [HTMLDivElement, HTMLImageElement, HTMLSpanElement] {
        const outputSlot = document.createElement('div');
        outputSlot.className = 'slot output-slot';
        const outputPlusSign = document.createElement('span');
        outputPlusSign.className = 'plus-sign';
        outputPlusSign.textContent = '+';
        outputSlot.appendChild(outputPlusSign);

        // 添加覆盖整个方格的 img 元素，初始 src 为空
        const img = document.createElement('img');
        img.className = 'slot-overlay-image';
        img.src = ''; // 初始为空
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.pointerEvents = 'none'; // 确保不会干扰点击事件
        outputSlot.appendChild(img);

        // 添加右下角数字显示元素
        const numberDisplay = document.createElement('span');
        numberDisplay.className = 'slot-number-display';
        numberDisplay.textContent = '0';
        numberDisplay.style.position = 'absolute';
        numberDisplay.style.bottom = '2px';
        numberDisplay.style.right = '2px';
        numberDisplay.style.fontSize = '12px';
        numberDisplay.style.fontWeight = 'bold';
        numberDisplay.style.color = '#ffffff';
        numberDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        numberDisplay.style.padding = '1px 4px';
        numberDisplay.style.borderRadius = '3px';
        numberDisplay.style.pointerEvents = 'none';
        numberDisplay.style.zIndex = '10';
        numberDisplay.style.display = 'none'; // 初始隐藏
        outputSlot.appendChild(numberDisplay);

        return [outputSlot, img, numberDisplay];
    }

    // 构建进度条元素
    buildProgressBar(): HTMLDivElement {
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress-bar-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = '0%';
        progressBar.style.height = '6px';
        progressBar.style.backgroundColor = '#4CAF50';
        progressBar.style.borderRadius = '3px';
        // 移除了 transition 属性
        progressBar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        progressBarContainer.appendChild(progressBar);
        return progressBarContainer;
    }

    // 动态创建槽位布局
    createLayout_2_solid_1_solid(instance: MachineInstance): void {
        const layout = document.createElement('div');
        layout.className = 'belt-slots-layout';

        // 创建包含槽位和箭头的行
        const slotsRow = document.createElement('div');
        slotsRow.className = 'slots-row';

        // 创建输入槽位容器
        const inputSlots = document.createElement('div');
        inputSlots.className = 'input-slots';

        const [inputSlot1, img1, num1] = this.buildInSlot_Solid();
        const [inputSlot2, img2, num2] = this.buildInSlot_Solid();
        inputSlots.appendChild(inputSlot1);
        inputSlots.appendChild(inputSlot2);

        // 创建箭头容器
        const arrowContainer = this.buildArrayMark();

        // 创建输出槽位容器
        const outputSlots = document.createElement('div');
        outputSlots.className = 'output-slots';

        const [outputSlot, img3, num3] = this.buildOutSlot_Solid();
        outputSlots.appendChild(outputSlot);

        // 组装槽位行
        slotsRow.appendChild(inputSlots);
        slotsRow.appendChild(arrowContainer);
        slotsRow.appendChild(outputSlots);

        // 创建进度条
        const progressBar = this.buildProgressBar();

        // 组装所有元素
        layout.appendChild(slotsRow);
        layout.appendChild(progressBar);

        if (this.container) this.container.appendChild(layout);

        // 添加点击事件监听器
        inputSlot1.addEventListener('click', () => this.selectSlot(inputSlot1, instance.inventory[0]));
        inputSlot2.addEventListener('click', () => this.selectSlot(inputSlot2, instance.inventory[1]));
        outputSlot.addEventListener('click', () => this.selectSlot(outputSlot, instance.inventory[2]));

        // 设置刷新函数
        this.currentflash = () => {
            this.updateImgAndNumber(instance.inventory[0], img1, num1);
            this.updateImgAndNumber(instance.inventory[1], img2, num2);
            this.updateImgAndNumber(instance.inventory[2], img3, num3);
            this.updateProgressBar(progressBar, instance.timer);
        }

        // 初始化显示
        this.currentflash();
    }

    createLayout_1_solid_1_solid(instance: MachineInstance): void {
        const layout = document.createElement('div');
        layout.className = 'belt-slots-layout';

        // 创建包含槽位和箭头的行
        const slotsRow = document.createElement('div');
        slotsRow.className = 'slots-row';

        // 创建输入槽位容器
        const inputSlots = document.createElement('div');
        inputSlots.className = 'input-slots';
        const [inputSlot, img1, num1] = this.buildInSlot_Solid();
        inputSlots.appendChild(inputSlot);

        const arrowContainer = this.buildArrayMark();

        const outputSlots = document.createElement('div');
        outputSlots.className = 'output-slots';
        const [outputSlot, img2, num2] = this.buildOutSlot_Solid();
        outputSlots.appendChild(outputSlot);

        // 组装槽位行
        slotsRow.appendChild(inputSlots);
        slotsRow.appendChild(arrowContainer);
        slotsRow.appendChild(outputSlots);

        // 创建进度条
        const progressBar = this.buildProgressBar();

        // 组装所有元素
        layout.appendChild(slotsRow);
        layout.appendChild(progressBar);
        if (this.container) this.container.appendChild(layout);

        inputSlot.addEventListener('click', () => this.selectSlot(inputSlot, instance.inventory[0]));

        this.currentflash = () => {
            this.updateImgAndNumber(instance.inventory[0], img1, num1);
            this.updateImgAndNumber(instance.inventory[1], img2, num2);
            this.updateProgressBar(progressBar, instance.timer);
        }
        this.currentflash();
    }

    // 动态创建6槽位布局（2列3行排列）
    createLayout_6_Solid(instance: MachineInstance): void {
        const layout = document.createElement('div');
        layout.className = 'belt-slots-layout';
        layout.id = 'belt-slots-layout-six';

        // 创建2列3行的槽位容器
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'six-slots-grid';
        slotsContainer.style.display = 'grid';
        slotsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        slotsContainer.style.gridTemplateRows = 'repeat(3, 1fr)';
        slotsContainer.style.gap = '8px';
        slotsContainer.style.width = '100%';
        slotsContainer.style.height = '100%';

        // 创建6个槽位（按2列3行顺序排列）
        const slots: [HTMLDivElement, HTMLImageElement, HTMLSpanElement][] = [];
        for (let i = 0; i < 6; i++) {
            const [slot, img, num] = this.buildInSlot_Solid();
            slot.dataset.slotIndex = i.toString();
            slots.push([slot, img, num]);
            slotsContainer.appendChild(slot);

            // 为每个槽位添加点击事件
            slot.addEventListener('click', () => {
                this.selectSlot(slot, instance.inventory[i]);
            });
        }

        // 创建进度条
        const progressBar = this.buildProgressBar();

        // 组装所有元素
        layout.appendChild(slotsContainer);
        layout.appendChild(progressBar); // 添加进度条
        if (this.container) this.container.appendChild(layout);

        // 设置刷新函数
        this.currentflash = () => {
            for (let i = 0; i < 6; i++) {
                this.updateImgAndNumber(instance.inventory[i], slots[i][1], slots[i][2]);
            }
            this.updateProgressBar(progressBar, instance.timer);
        };
        this.currentflash();
    }

    private selectSlot(slot: HTMLDivElement, inventory: ItemStack) {
        if (this.selectingSlot) {
            this.selectingSlot.classList.remove('selected');
        }
        this.selectingSlot = slot;
        this.selectingSlot.classList.add('selected');
        this.selectingInv = inventory;
    }

    updateImgAndNumber(itemStack: ItemStack, img: HTMLImageElement, numberElement: HTMLSpanElement) {
        if (itemStack.MaxCount === 0) {
            if (numberElement.style.display !== 'none') numberElement.style.display = 'none';
            if (!itemStack.item) {
                if (img.src !== '') img.src = '';
                if (img.style.display !== 'none') img.style.display = 'none';
            }
            else {
                if (img.src !== itemStack.item.imgCache.src) img.src = itemStack.item.imgCache.src;
                if (img.style.display !== 'block') img.style.display = 'block';
            }
        }
        else {
            if (itemStack.isEmpty()) {
                if (img.src !== '') img.src = '';
                if (img.style.display !== 'none') img.style.display = 'none';
                if (numberElement.style.display !== 'none') numberElement.style.display = 'none';
            }
            else {
                if (img.src !== itemStack.item!.imgCache.src) img.src = itemStack.item!.imgCache.src;
                if (img.style.display !== 'block') img.style.display = 'block';
                numberElement.textContent = itemStack.count.toString();
                numberElement.style.display = 'block';
            }
        }
    }

    // 更新进度条显示
    private updateProgressBar(progressBarContainer: HTMLDivElement, timer: any) {
        const progressBar = progressBarContainer.querySelector('.progress-bar') as HTMLDivElement;
        if (!progressBar) return;

        if (timer._isWorking && timer.maxTime > 0) {
            const progress = Math.min(100, (timer.cur / timer.maxTime) * 100);
            progressBar.style.width = `${progress}%`;
            
            console.log(progress);
        } else {
            progressBar.style.width = '0%';
            progressBar.style.backgroundColor = '#4CAF50';
        }
    }
}