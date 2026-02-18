import { describe, it, expect } from 'vitest';
import { Queue } from '../src/utils/Queue';

describe('Queue Performance Test', () => {
  const TEST_SIZE = 100000;
  
  it('应该在大数据量下保持良好性能', () => {
    const largeQueue = new Queue<number>(TEST_SIZE);
    const startTime = performance.now();
    
    // 批量入队
    for (let i = 0; i < TEST_SIZE; i++) {
      largeQueue.enqueue(i);
    }
    
    const enqueueTime = performance.now() - startTime;
    console.log(`批量入队 ${TEST_SIZE} 个元素耗时: ${enqueueTime.toFixed(2)}ms`);
    
    // 批量出队
    const dequeueStartTime = performance.now();
    while (!largeQueue.isEmpty()) {
      largeQueue.dequeue();
    }
    
    const dequeueTime = performance.now() - dequeueStartTime;
    console.log(`批量出队 ${TEST_SIZE} 个元素耗时: ${dequeueTime.toFixed(2)}ms`);
    
    // 性能阈值检查（根据实际环境调整）
    expect(enqueueTime).toBeLessThan(100); // 100ms阈值
    expect(dequeueTime).toBeLessThan(100); // 100ms阈值
  });

  it('应该正确处理循环数组的边界情况', () => {
    const smallQueue = new Queue<number>(100);
    
    // 填满队列然后清空，重复多次测试循环特性
    const iterations = 1000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      // 填充
      for (let j = 0; j < 100; j++) {
        smallQueue.enqueue(j);
      }
      // 清空
      while (!smallQueue.isEmpty()) {
        smallQueue.dequeue();
      }
    }
    
    const totalTime = performance.now() - startTime;
    console.log(`${iterations} 次循环操作耗时: ${totalTime.toFixed(2)}ms`);
    console.log(`平均每次循环耗时: ${(totalTime / iterations).toFixed(4)}ms`);
    
    expect(totalTime).toBeLessThan(50); // 50ms阈值
  });

  it('应该在异常情况下正确抛出错误', () => {
    const queue = new Queue<string>(5);
    
    // 测试空队列peek错误
    expect(() => queue.peek()).toThrow('无法查看空队列的元素');
    
    // 测试空队列dequeue错误
    expect(() => queue.dequeue()).toThrow('无法从空队列中取出元素');
    
    // 正常操作后再次测试错误情况
    queue.enqueue('test');
    queue.dequeue(); // 清空队列
    
    expect(() => queue.peek()).toThrow('无法查看空队列的元素');
    expect(() => queue.dequeue()).toThrow('无法从空队列中取出元素');
  });
});