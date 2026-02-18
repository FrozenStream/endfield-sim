import { BeltInstance } from "./instance/BeltInstance";
import { MachineInstance } from "./instance/MachineInstance";
import type { Item } from "./proto/Item";
import type { ItemStack } from "./proto/ItemStack";
import { EnumInventoryType } from "./utils/EnumInventoryType";
import EnumItemType from "./utils/EnumItemType";



export class InstanceAttention {
    private static selectingInstance: MachineInstance | BeltInstance | null = null;

    private static selectingSlot: HTMLDivElement | null = null;
    private static selectingInventory: ItemStack | null = null;

    private static currentflash: (() => void) | null = null;

    public static flash() {
        if (this.currentflash) {
            this.currentflash();
        }
    }

    static readonly container = document.getElementById('machine-details-panel')!;
    static set select(instance: MachineInstance | BeltInstance | null) {
        if (!instance) { this.cancel(); return; }
        if (instance instanceof MachineInstance && instance !== this.selectingInstance) {
            this.clear();
            switch (instance.currentMode.inventory) {
                case EnumInventoryType.Storage_1x1_solid:
                    InstanceAttention.createLayout_1x1(instance);
                    break;
                case EnumInventoryType.Storage_2x1:
                    InstanceAttention.createLayout_2x1(instance);
                    break;
                case EnumInventoryType.Storage_6:
                    InstanceAttention.createLayout_6(instance);
                    break;
            }
            InstanceAttention.selectingInstance = instance;
        }
        else if (instance instanceof BeltInstance) {
        }
    }

    static get select(): MachineInstance | BeltInstance | null {
        return InstanceAttention.selectingInstance;
    }

    static cancel() {
        InstanceAttention.selectingInstance = null;
        this.clear();
    }

    static clear() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        InstanceAttention.selectingSlot = null;
        InstanceAttention.selectingInventory = null;
    }


    static addItemto(item: Item): void {
        if (!InstanceAttention.selectingInventory) return;
        if (InstanceAttention.selectingInventory.itemType !== EnumItemType.ANY &&
            InstanceAttention.selectingInventory.itemType !== item.type) return;
        if (!InstanceAttention.selectingInventory.isEmpty() && item !== InstanceAttention.selectingInventory.item)
            InstanceAttention.selectingInventory.clear();
        if (!InstanceAttention.selectingInventory.isFull()) {
            InstanceAttention.selectingInventory.item = item;
            InstanceAttention.selectingInventory.count += 1;
        }

        // 添加物品后立即刷新显示
        if (InstanceAttention.currentflash) {
            InstanceAttention.currentflash();
        }
    }


    static delItemto(item: Item) {
        if (!InstanceAttention.selectingInventory) return;
        if (InstanceAttention.selectingInventory.itemType !== EnumItemType.ANY &&
            InstanceAttention.selectingInventory.itemType !== item.type) return;
        if (!InstanceAttention.selectingInventory.isEmpty() && item !== InstanceAttention.selectingInventory.item)
            InstanceAttention.selectingInventory.clear();
        if (!InstanceAttention.selectingInventory.isEmpty()) {
            InstanceAttention.selectingInventory.item = item;
            InstanceAttention.selectingInventory.count -= 1;
        }

        // 添加物品后立即刷新显示
        if (InstanceAttention.currentflash) {
            InstanceAttention.currentflash();
        }
    }

    static buildInSlot_Solid(): [HTMLDivElement, HTMLImageElement, HTMLSpanElement] {
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

    static buildArrayMark(): HTMLDivElement {
        const arrowContainer = document.createElement('div');
        arrowContainer.className = 'arrow-container';
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.textContent = '→';
        arrowContainer.appendChild(arrow);
        return arrowContainer;
    }

    static buildOutSlot_Solid(): [HTMLDivElement, HTMLImageElement, HTMLSpanElement] {
        const outputSlot = document.createElement('div');
        outputSlot.className = 'slot output-slot';
        outputSlot.dataset.slot = 'output-1';
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

    // 动态创建槽位布局
    static createLayout_2x1(instance: MachineInstance): void {
        const layout = document.createElement('div');
        layout.className = 'belt-slots-layout';
        layout.id = 'belt-slots-layout';

        // 创建输入槽位容器
        const inputSlots = document.createElement('div');
        inputSlots.className = 'input-slots';

        const [inputSlot1, img1, num1] = InstanceAttention.buildInSlot_Solid();
        const [inputSlot2, img2, num2] = InstanceAttention.buildInSlot_Solid();
        inputSlots.appendChild(inputSlot1);
        inputSlots.appendChild(inputSlot2);

        // 创建箭头容器
        const arrowContainer = InstanceAttention.buildArrayMark();

        // 创建输出槽位容器
        const outputSlots = document.createElement('div');
        outputSlots.className = 'output-slots';

        const [outputSlot, img3, num3] = InstanceAttention.buildOutSlot_Solid();
        outputSlots.appendChild(outputSlot);

        // 组装所有元素
        layout.appendChild(inputSlots);
        layout.appendChild(arrowContainer);
        layout.appendChild(outputSlots);

        if (this.container) this.container.appendChild(layout);
    }

    static createLayout_1x1(instance: MachineInstance): void {
        const layout = document.createElement('div');
        layout.className = 'belt-slots-layout';
        layout.id = 'belt-slots-layout-single';

        // 创建输入槽位容器
        const inputSlots = document.createElement('div');
        inputSlots.className = 'input-slots';
        const [inputSlot, img1, num1] = InstanceAttention.buildInSlot_Solid();
        inputSlots.appendChild(inputSlot);

        const arrowContainer = InstanceAttention.buildArrayMark();

        const outputSlots = document.createElement('div');
        outputSlots.className = 'output-slots';
        const [outputSlot, img2, num2] = InstanceAttention.buildOutSlot_Solid();
        outputSlots.appendChild(outputSlot);

        // 组装所有元素
        layout.appendChild(inputSlots);
        layout.appendChild(arrowContainer);
        layout.appendChild(outputSlots);
        if (this.container) this.container.appendChild(layout);

        inputSlot.addEventListener('click', () => InstanceAttention.selectSlot(inputSlot, instance.inventory[0]));

        InstanceAttention.currentflash = () => {
            InstanceAttention.updateImgAndNumber(instance.inventory[0], img1, num1);
            InstanceAttention.updateImgAndNumber(instance.inventory[1], img2, num2);
        }
        InstanceAttention.currentflash();
    }

    // 动态创建6槽位布局（2列3行排列）
    static createLayout_6(instance: MachineInstance): void {
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
            const [slot, img, num] = InstanceAttention.buildInSlot_Solid();
            slot.dataset.slotIndex = i.toString();
            slots.push([slot, img, num]);
            slotsContainer.appendChild(slot);

            // 为每个槽位添加点击事件
            slot.addEventListener('click', () => {
                InstanceAttention.selectSlot(slot, instance.inventory[i]);
            });
        }

        // 组装所有元素
        layout.appendChild(slotsContainer);
        if (this.container) this.container.appendChild(layout);

        // 设置刷新函数
        InstanceAttention.currentflash = () => {
            for (let i = 0; i < 6; i++) {
                InstanceAttention.updateImgAndNumber(instance.inventory[i], slots[i][1], slots[i][2]);
            }
        };
        InstanceAttention.currentflash();
    }

    private static selectSlot(slot: HTMLDivElement, inventory: ItemStack) {
        if (InstanceAttention.selectingSlot) {
            InstanceAttention.selectingSlot.classList.remove('selected');
        }
        InstanceAttention.selectingSlot = slot;
        InstanceAttention.selectingSlot.classList.add('selected');
        InstanceAttention.selectingInventory = inventory;
    }

    static updateImgAndNumber(itemStack: ItemStack, img: HTMLImageElement, numberElement: HTMLSpanElement) {
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
}