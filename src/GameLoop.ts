/**
 * 游戏循环管理器
 * 实现物理帧和渲染帧的分离
 */
export class GameLoop {
    private static instance: GameLoop | null = null;
    
    // 物理更新相关
    private physicsFPS: number = 60;
    private physicsInterval: number = 1000 / 60;
    private lastPhysicsTime: number = 0;
    private accumulatedPhysicsTime: number = 0;
    
    // 渲染相关
    private renderFPS: number = 60;
    private lastRenderTime: number = 0;
    private frameCount: number = 0;
    private fpsUpdateInterval: number = 1000; // FPS更新间隔(ms)
    private lastFpsUpdate: number = 0;
    private currentFPS: number = 0;
    
    // 状态控制
    private isRunning: boolean = false;
    private isPaused: boolean = false;
    
    // 回调函数
    private updateCallback: (() => void) | null = null;
    private renderCallback: ((interpolation: number) => void) | null = null;
    private fpsCallback: ((fps: number) => void) | null = null;

    private constructor() {}

    public static getInstance(): GameLoop {
        if (!GameLoop.instance) {
            GameLoop.instance = new GameLoop();
        }
        return GameLoop.instance;
    }

    /**
     * 设置物理更新频率
     * @param fps 物理更新FPS
     */
    public setPhysicsFPS(fps: number): void {
        this.physicsFPS = fps;
        this.physicsInterval = 1000 / fps;
    }

    /**
     * 设置渲染频率
     * @param fps 渲染FPS
     */
    public setRenderFPS(fps: number): void {
        this.renderFPS = fps;
    }

    /**
     * 设置更新回调函数
     * @param callback 物理更新回调
     */
    public setUpdateCallback(callback: () => void): void {
        this.updateCallback = callback;
    }

    /**
     * 设置渲染回调函数
     * @param callback 渲染回调，接收插值参数
     */
    public setRenderCallback(callback: (interpolation: number) => void): void {
        this.renderCallback = callback;
    }

    /**
     * 设置FPS显示回调函数
     * @param callback FPS更新回调
     */
    public setFPSCallback(callback: (fps: number) => void): void {
        this.fpsCallback = callback;
    }

    /**
     * 启动游戏循环
     */
    public start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastPhysicsTime = performance.now();
        this.lastRenderTime = performance.now();
        this.lastFpsUpdate = performance.now();
        this.frameCount = 0;
        
        this.gameLoop(performance.now());
    }

    /**
     * 暂停游戏循环
     */
    public pause(): void {
        this.isPaused = true;
    }

    /**
     * 恢复游戏循环
     */
    public resume(): void {
        if (!this.isRunning) return;
        this.isPaused = false;
        this.lastPhysicsTime = performance.now();
        this.lastRenderTime = performance.now();
    }

    /**
     * 停止游戏循环
     */
    public stop(): void {
        this.isRunning = false;
        this.isPaused = false;
    }

    /**
     * 主游戏循环
     */
    private gameLoop(currentTime: number): void {
        if (!this.isRunning) return;

        if (!this.isPaused) {
            // 更新物理状态
            this.updatePhysics(currentTime);
            
            // 更新FPS统计
            this.updateFPS(currentTime);
        }

        // 渲染画面
        this.render(currentTime);

        // 请求下一帧
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    /**
     * 更新物理状态
     */
    private updatePhysics(currentTime: number): void {
        const deltaTime = currentTime - this.lastPhysicsTime;
        this.lastPhysicsTime = currentTime;
        this.accumulatedPhysicsTime += deltaTime;

        // 以固定时间步长更新物理状态
        while (this.accumulatedPhysicsTime >= this.physicsInterval) {
            if (this.updateCallback) {
                this.updateCallback();
            }
            this.accumulatedPhysicsTime -= this.physicsInterval;
        }
    }

    /**
     * 渲染画面
     */
    private render(currentTime: number): void {
        const deltaTime = currentTime - this.lastRenderTime;
        this.lastRenderTime = currentTime;

        // 计算插值因子（用于平滑渲染）
        const interpolation = Math.min(this.accumulatedPhysicsTime / this.physicsInterval, 1.0);

        if (this.renderCallback) {
            this.renderCallback(interpolation);
        }

        this.frameCount++;
    }

    /**
     * 更新FPS统计
     */
    private updateFPS(currentTime: number): void {
        if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            if (this.fpsCallback) {
                this.fpsCallback(this.currentFPS);
            }
        }
    }

    /**
     * 获取当前FPS
     */
    public getCurrentFPS(): number {
        return this.currentFPS;
    }

    /**
     * 获取物理更新间隔
     */
    public getPhysicsInterval(): number {
        return this.physicsInterval;
    }

    /**
     * 是否正在运行
     */
    public getIsRunning(): boolean {
        return this.isRunning;
    }

    /**
     * 是否已暂停
     */
    public getIsPaused(): boolean {
        return this.isPaused;
    }
}