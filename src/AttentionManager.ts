import { BeltSec } from "./instance/BeltInstance";
import { MachineInstance, portInstance, WorkTimer } from "./instance/MachineInstance";
import type { Item } from "./proto/Item";
import { ItemStack } from "./proto/ItemStack";
import type { InventoryConfig } from "./proto/Machines";
import type Array2d from "./utils/Array2d";



export class AttentionManager {
    private selecting: MachineInstance | portInstance | BeltSec | null = null;
    position: Array2d | null = null;
    count: number = 0;

    private selectingSlot: HTMLDivElement | null = null;
    private selectingInv: ItemStack | null = null;

    private currentflash: (() => void)[] = [];
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    public flash() {
        this.currentflash.forEach(func => func());
    }

    set select(instance: MachineInstance | portInstance | BeltSec | null) {
        console.log('select', instance);
        if (!instance) { this.cancel(); return; }
        if (instance instanceof MachineInstance && instance !== this.selecting) {
            this.clear();
            this.createLayout(instance);
        }
        else if (instance instanceof BeltSec) {
            this.clear();
        }
        this.selecting = instance;
    }

    get select(): MachineInstance | portInstance | BeltSec | null {
        return this.selecting;
    }

    cancel() {
        this.selecting = null;
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

        this.flash();
    }


    delItemto(item: Item) {
        if (!this.selectingInv) return;
        if (this.selectingInv.item !== item) this.selectingInv.clear();
        if (this.selectingInv.count === 0) this.selectingInv.item = null;
        this.selectingInv.count = Math.max(0, this.selectingInv.count - 1);

        this.flash();
    }

    buildSlot(config: InventoryConfig): [HTMLDivElement, HTMLImageElement, HTMLSpanElement] {
        const inputSlot = document.createElement('div');
        // 根据类型和noIn/noOut设置不同的类名和颜色
        let baseClass = 'slot';
        
        // 根据类型添加类名
        switch(config.type.toString()) {
            case 'solid':
                baseClass += ' solid-slot';
                break;
            case 'liquid':
                baseClass += ' liquid-slot';
                break;
            case 'any':
                baseClass += ' any-slot';
                break;
            default:
                baseClass += ' default-slot';
                break;
        }
        
        // 根据noIn和noOut添加状态类名
        if (config.noIn && config.noOut) {
            // 既不能输入也不能输出：禁用状态
            baseClass += ' disabled-slot';
        } else if (config.noIn && !config.noOut) {
            // 不能输入但可以输出：只出
            baseClass += ' output-only-slot';
        } else if (!config.noIn && config.noOut) {
            // 可以输入但不能输出：只入
            baseClass += ' input-only-slot';
        } else {
            // 既可以输入也可以输出：普通状态
            baseClass += ' input-output-slot';
        }
        
        inputSlot.className = baseClass;
        
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

    createLayout(instance: MachineInstance): void {
        const layout = document.createElement('div');
        layout.className = 'belt-slots-layout';

        // 创建包含槽位和箭头的行
        const slotsRow = document.createElement('div');
        slotsRow.className = 'slots-row';

        const invConfigs: InventoryConfig[] = instance.currentMode.inventory;

        const functions: (() => void)[] = [];
        for (let i = 0; i < invConfigs.length; i++) {
            const [slot, img, num] = this.buildSlot(invConfigs[i]);
            slotsRow.appendChild(slot);
            if (!invConfigs[i].noIn) slot.addEventListener('click', () => this.selectSlot(slot, instance.inventory[i]));
            functions.push(() => this.updateImgAndNumber(instance.inventory[i], img, num));
        }
        layout.appendChild(slotsRow);
        if (this.container) this.container.appendChild(layout);

        this.currentflash = functions;
        this.flash();
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
    private updateProgressBar(progressBarContainer: HTMLDivElement, timer: WorkTimer) {
        const progressBar = progressBarContainer.querySelector('.progress-bar') as HTMLDivElement;
        if (!progressBar) return;

        if (timer.isWorking && timer.maxTime > 0) {
            const progress = Math.min(100, (timer.curTime / timer.maxTime) * 100);
            progressBar.style.width = `${progress}%`;

            console.log(progress);
        } else {
            progressBar.style.width = '0%';
            progressBar.style.backgroundColor = '#4CAF50';
        }
    }

    // 构建标记固体槽位（不显示数字）
    buildMarkedSolidSlot(): [HTMLDivElement, HTMLImageElement, HTMLSpanElement] {
        const slot = document.createElement('div');
        slot.className = 'slot marked-solid-slot';
        slot.style.position = 'relative';
        slot.style.width = '80px';
        slot.style.height = '80px';
        slot.style.border = '2px solid #666';
        slot.style.borderRadius = '8px';
        slot.style.display = 'flex';
        slot.style.alignItems = 'center';
        slot.style.justifyContent = 'center';
        slot.style.backgroundColor = '#2a2a2a';
        slot.style.marginBottom = '15px';

        const plusSign = document.createElement('span');
        plusSign.className = 'plus-sign';
        plusSign.textContent = '+';
        plusSign.style.position = 'absolute';
        plusSign.style.top = '50%';
        plusSign.style.left = '50%';
        plusSign.style.transform = 'translate(-50%, -50%)';
        plusSign.style.fontSize = '24px';
        plusSign.style.color = '#888';
        plusSign.style.pointerEvents = 'none';
        slot.appendChild(plusSign);

        // 添加覆盖整个槽位的 img 元素，初始 src 为空
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
        img.style.borderRadius = '6px';
        slot.appendChild(img);

        // 数字显示元素（虽然不使用，但保持结构一致）
        const numberDisplay = document.createElement('span');
        numberDisplay.className = 'slot-number-display';
        numberDisplay.textContent = '0';
        numberDisplay.style.display = 'none'; // 始终隐藏
        slot.appendChild(numberDisplay);

        return [slot, img, numberDisplay];
    }

    // 更新标记固体槽位的图片显示（count为0也显示图片）
    private updateMarkedSolidImg(itemStack: ItemStack, img: HTMLImageElement) {
        if (!itemStack.item) {
            // 没有物品时清空图片
            if (img.src !== '') img.src = '';
            if (img.style.display !== 'none') img.style.display = 'none';
        } else {
            // 有物品时始终显示图片，不管count是多少
            if (img.src !== itemStack.item.imgCache.src) {
                img.src = itemStack.item.imgCache.src;
            }
            if (img.style.display !== 'block') {
                img.style.display = 'block';
            }
        }
    }
}