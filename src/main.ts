import { GridCanvas } from "./Grid";
import ItemIconManager from "./ItemManager";
import { MachinesIconsManager as MachineIconsManager } from "./MacineIconManager";

const gridWrapper = document.getElementById('grid-wrapper')!;
const gridCanvas = document.createElement('canvas');
const overlayCanvas = document.createElement('canvas');

// 初始化网格
document.addEventListener('DOMContentLoaded', () => {
    const grid = new GridCanvas(gridWrapper, gridCanvas, overlayCanvas);

    // 初始化图标管理器
    const machineIconsManager = new MachineIconsManager('icon-collection');
    const itemIconManager = new ItemIconManager('item-collection');
});