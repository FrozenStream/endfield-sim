import { InstanceAttention } from "./AttentionManager";
import { GridCanvas } from "./Grid";
import ItemIconManager from "./ItemManager";
import { MachinesIconsManager as MachineIconsManager } from "./MacineIconManager";
import { GameLoop } from "./GameLoop";

const gridWrapper = document.getElementById('grid-wrapper')!;
const gridCanvas = document.createElement('canvas');
const overlayCanvas = document.createElement('canvas');

// 初始化网格
document.addEventListener('DOMContentLoaded', () => {
    const grid = new GridCanvas(gridWrapper, gridCanvas, overlayCanvas);

    // 初始化图标管理器
    const machineIconsManager = new MachineIconsManager('icon-collection');
    const itemIconManager = new ItemIconManager('item-collection');

    // 创建游戏循环管理器
    const gameLoop = GameLoop.getInstance();
    
    // 设置不同的FPS：物理50FPS，渲染60FPS
    gameLoop.setPhysicsFPS(50);  // 物理更新频率
    gameLoop.setRenderFPS(60);   // 渲染频率
    
    // 设置物理更新回调
    gameLoop.setUpdateCallback(() => {
        // 物理更新逻辑
        grid.update();
        InstanceAttention.flash();
    });
    
    // 设置渲染回调
    gameLoop.setRenderCallback((interpolation: number) => {
        // 设置插值因子
        grid.setInterpolation(interpolation);
        // 渲染逻辑
        grid.drawGrid();
    });
    
    // 设置FPS显示回调
    gameLoop.setFPSCallback((fps: number) => {
        const fpsDisplay = document.getElementById('fps-display');
        if (fpsDisplay) {
            fpsDisplay.textContent = `FPS: ${fps}`;
        }
    });
    
    // 启动游戏循环
    gameLoop.start();
    
    // 添加调试控制按钮
    addDebugControls(gameLoop);
});

/**
 * 添加调试控制按钮
 */
function addDebugControls(gameLoop: GameLoop): void {
    const controlsDiv = document.createElement('div');
    controlsDiv.style.position = 'fixed';
    controlsDiv.style.top = '10px';
    controlsDiv.style.right = '10px';
    controlsDiv.style.zIndex = '1000';
    controlsDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
    controlsDiv.style.color = 'white';
    controlsDiv.style.padding = '10px';
    controlsDiv.style.borderRadius = '5px';
    controlsDiv.style.fontFamily = 'monospace';
    
    const fpsDisplay = document.createElement('div');
    fpsDisplay.id = 'fps-display';
    fpsDisplay.textContent = 'FPS: 0';
    fpsDisplay.style.marginBottom = '10px';
    
    controlsDiv.appendChild(fpsDisplay);
    
    document.body.appendChild(controlsDiv);
}