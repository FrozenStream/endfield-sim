import { AttentionManager } from "./AttentionManager";
import { GridCanvas } from "./Grid";
import { ItemIconManager } from "./ItemManager";
import { MachinesIconsManager as MachineIconsManager } from "./MacineIconManager";
import { GameLoop } from "./GameLoop";
import { Config } from "./utils/Config";
import { GridMap } from "./GridMap";

const gridWrapper = document.getElementById('grid-wrapper')!;
const gridCanvas = document.createElement('canvas');
const overlayCanvas = document.createElement('canvas');

// 初始化网格
document.addEventListener('DOMContentLoaded', () => {
    // 初始化   
    const gridMap = new GridMap(Config.gridWidth, Config.gridHeight);
    const machineIconsManager = new MachineIconsManager('icon-collection', gridMap);
    // 创建机器详情面板容器
    const machineDetailsPanel = document.getElementById('machine-details-panel')!;
    const instanceAttention = new AttentionManager(machineDetailsPanel);
    const itemIconManager = new ItemIconManager('item-collection', instanceAttention);
    const grid = new GridCanvas(gridWrapper, gridCanvas, overlayCanvas, gridMap, machineIconsManager, instanceAttention);




    // 创建游戏循环管理器
    const gameLoop = GameLoop.getInstance();

    gameLoop.setPhysicsFPS(Config.PhysicsFPS);  // 物理更新频率
    gameLoop.setRenderFPS(Config.RenderFPS);    // 渲染频率

    // 设置物理更新回调
    gameLoop.setUpdateCallback(() => {
        // 物理更新逻辑
        instanceAttention.flash();
        grid.update();
    });

    // 设置渲染回调
    gameLoop.setRenderCallback((_: number) => {
        // 渲染逻辑
        grid.drawGrid();
        grid.preview();
    });

    // 设置FPS显示回调
    gameLoop.setFPSCallback((fps: number) => {
        const fpsValueElement = document.getElementById('fps-value');
        if (fpsValueElement) {
            fpsValueElement.textContent = fps.toString();
        }
    });

    // 启动游戏循环
    gameLoop.start();
});
