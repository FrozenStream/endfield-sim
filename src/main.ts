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
    
    // 设置不同的FPS：物理60FPS，渲染60FPS
    gameLoop.setPhysicsFPS(60);  // 物理更新频率
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
    
    const physicsFpsInput = document.createElement('input');
    physicsFpsInput.type = 'number';
    physicsFpsInput.value = '60';
    physicsFpsInput.min = '10';
    physicsFpsInput.max = '120';
    physicsFpsInput.style.width = '60px';
    physicsFpsInput.style.marginRight = '5px';
    
    const physicsLabel = document.createElement('label');
    physicsLabel.textContent = '物理FPS: ';
    physicsLabel.appendChild(physicsFpsInput);
    physicsLabel.style.display = 'block';
    physicsLabel.style.marginBottom = '5px';
    
    const renderFpsInput = document.createElement('input');
    renderFpsInput.type = 'number';
    renderFpsInput.value = '60';
    renderFpsInput.min = '10';
    renderFpsInput.max = '120';
    renderFpsInput.style.width = '60px';
    renderFpsInput.style.marginRight = '5px';
    
    const renderLabel = document.createElement('label');
    renderLabel.textContent = '渲染FPS: ';
    renderLabel.appendChild(renderFpsInput);
    renderLabel.style.display = 'block';
    renderLabel.style.marginBottom = '10px';
    
    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = '暂停';
    pauseBtn.style.marginRight = '5px';
    pauseBtn.onclick = () => {
        if (gameLoop.getIsPaused()) {
            gameLoop.resume();
            pauseBtn.textContent = '暂停';
        } else {
            gameLoop.pause();
            pauseBtn.textContent = '继续';
        }
    };
    
    const restartBtn = document.createElement('button');
    restartBtn.textContent = '重启';
    restartBtn.onclick = () => {
        gameLoop.stop();
        gameLoop.setPhysicsFPS(parseInt(physicsFpsInput.value) || 60);
        gameLoop.setRenderFPS(parseInt(renderFpsInput.value) || 60);
        gameLoop.start();
        pauseBtn.textContent = '暂停';
    };
    
    // 监听输入框变化
    physicsFpsInput.addEventListener('change', () => {
        const newFps = parseInt(physicsFpsInput.value) || 60;
        physicsFpsInput.value = newFps.toString();
        gameLoop.setPhysicsFPS(newFps);
    });
    
    renderFpsInput.addEventListener('change', () => {
        const newFps = parseInt(renderFpsInput.value) || 60;
        renderFpsInput.value = newFps.toString();
        gameLoop.setRenderFPS(newFps);
    });
    
    controlsDiv.appendChild(fpsDisplay);
    controlsDiv.appendChild(physicsLabel);
    controlsDiv.appendChild(renderLabel);
    controlsDiv.appendChild(pauseBtn);
    controlsDiv.appendChild(restartBtn);
    
    document.body.appendChild(controlsDiv);
}