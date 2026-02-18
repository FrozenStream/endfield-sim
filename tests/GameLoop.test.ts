import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../src/GameLoop';

describe('GameLoop', () => {
    let gameLoop: GameLoop;
    
    beforeEach(() => {
        gameLoop = GameLoop.getInstance();
        // 重置单例实例
        (GameLoop as any).instance = null;
        gameLoop = GameLoop.getInstance();
    });
    
    afterEach(() => {
        gameLoop.stop();
    });

    it('should be a singleton', () => {
        const instance1 = GameLoop.getInstance();
        const instance2 = GameLoop.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should set physics FPS correctly', () => {
        gameLoop.setPhysicsFPS(30);
        expect((gameLoop as any).physicsFPS).toBe(30);
        expect((gameLoop as any).physicsInterval).toBeCloseTo(1000 / 30);
    });

    it('should set render FPS correctly', () => {
        gameLoop.setRenderFPS(120);
        expect((gameLoop as any).renderFPS).toBe(120);
    });

    it('should accept update callbacks', () => {
        const mockUpdate = vi.fn();
        gameLoop.setUpdateCallback(mockUpdate);
        expect((gameLoop as any).updateCallback).toBe(mockUpdate);
    });

    it('should accept render callbacks', () => {
        const mockRender = vi.fn();
        gameLoop.setRenderCallback(mockRender);
        expect((gameLoop as any).renderCallback).toBe(mockRender);
    });

    it('should accept FPS callbacks', () => {
        const mockFPS = vi.fn();
        gameLoop.setFPSCallback(mockFPS);
        expect((gameLoop as any).fpsCallback).toBe(mockFPS);
    });

    it('should start and stop correctly', () => {
        expect(gameLoop.getIsRunning()).toBe(false);
        gameLoop.start();
        expect(gameLoop.getIsRunning()).toBe(true);
        gameLoop.stop();
        expect(gameLoop.getIsRunning()).toBe(false);
    });

    it('should pause and resume correctly', () => {
        gameLoop.start();
        expect(gameLoop.getIsPaused()).toBe(false);
        gameLoop.pause();
        expect(gameLoop.getIsPaused()).toBe(true);
        gameLoop.resume();
        expect(gameLoop.getIsPaused()).toBe(false);
    });

    it('should calculate physics interval correctly', () => {
        gameLoop.setPhysicsFPS(60);
        expect(gameLoop.getPhysicsInterval()).toBeCloseTo(1000 / 60);
        
        gameLoop.setPhysicsFPS(30);
        expect(gameLoop.getPhysicsInterval()).toBeCloseTo(1000 / 30);
    });

    it('should handle edge cases for FPS values', () => {
        // 测试边界值
        gameLoop.setPhysicsFPS(10);
        expect((gameLoop as any).physicsFPS).toBe(10);
        
        gameLoop.setPhysicsFPS(120);
        expect((gameLoop as any).physicsFPS).toBe(120);
    });
});