import { describe, it, expect, beforeEach } from 'vitest';
import { Queue } from '../src/utils/Queue';

describe('Queue', () => {
  let queue: Queue<number>;

  beforeEach(() => {
    queue = new Queue<number>(5);
  });

  describe('构造函数', () => {
    it('应该正确初始化队列', () => {
      expect(queue.getCapacity()).toBe(5);
      expect(queue.getSize()).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.isFull()).toBe(false);
    });

    it('应该在容量小于等于0时抛出错误', () => {
      expect(() => new Queue<number>(0)).toThrow('队列容量必须大于0');
      expect(() => new Queue<number>(-1)).toThrow('队列容量必须大于0');
    });
  });

  describe('enqueue方法', () => {
    it('应该能够成功入队元素', () => {
      expect(queue.enqueue(1)).toBe(true);
      expect(queue.getSize()).toBe(1);
      expect(queue.peek()).toBe(1);
    });

    it('应该在队列满时拒绝入队', () => {
      // 填满队列
      for (let i = 0; i < 5; i++) {
        expect(queue.enqueue(i)).toBe(true);
      }
      
      // 尝试添加超出容量的元素
      expect(queue.enqueue(6)).toBe(false);
      expect(queue.getSize()).toBe(5);
    });

    it('应该支持不同类型的泛型', () => {
      const stringQueue = new Queue<string>(3);
      expect(stringQueue.enqueue('hello')).toBe(true);
      expect(stringQueue.enqueue('world')).toBe(true);
      expect(stringQueue.peek()).toBe('hello');
    });
  });

  describe('dequeue方法', () => {
    it('应该能够成功出队元素', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      
      expect(queue.dequeue()).toBe(1);
      expect(queue.getSize()).toBe(1);
      expect(queue.peek()).toBe(2);
    });

    it('应该在空队列时抛出错误', () => {
      expect(() => queue.dequeue()).toThrow('无法从空队列中取出元素');
    });

    it('应该保持先进先出的顺序', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      
      expect(queue.dequeue()).toBe(1);
      expect(queue.dequeue()).toBe(2);
      expect(queue.dequeue()).toBe(3);
      expect(() => queue.dequeue()).toThrow('无法从空队列中取出元素');
    });
  });

  describe('peek方法', () => {
    it('应该返回队首元素但不移除', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      
      expect(queue.peek()).toBe(1);
      expect(queue.getSize()).toBe(2);
      expect(queue.peek()).toBe(1); // 再次peek应该还是同一个元素
    });

    it('应该在空队列时抛出错误', () => {
      expect(() => queue.peek()).toThrow('无法查看空队列的元素');
    });
  });

  describe('状态检查方法', () => {
    it('isEmpty应该正确判断空队列', () => {
      expect(queue.isEmpty()).toBe(true);
      queue.enqueue(1);
      expect(queue.isEmpty()).toBe(false);
    });

    it('isFull应该正确判断满队列', () => {
      expect(queue.isFull()).toBe(false);
      
      for (let i = 0; i < 5; i++) {
        queue.enqueue(i);
      }
      
      expect(queue.isFull()).toBe(true);
    });
  });

  describe('clear方法', () => {
    it('应该清空队列中的所有元素', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      
      queue.clear();
      
      expect(queue.isEmpty()).toBe(true);
      expect(queue.getSize()).toBe(0);
      expect(() => queue.peek()).toThrow('无法查看空队列的元素');
    });
  });

  describe('toArray方法', () => {
    it('应该返回包含所有元素的数组', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      
      const array = queue.toArray();
      expect(array).toEqual([1, 2, 3]);
    });

    it('应该在空队列时返回空数组', () => {
      expect(queue.toArray()).toEqual([]);
    });
  });

  describe('toString方法', () => {
    it('应该返回正确的字符串表示', () => {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      
      expect(queue.toString()).toBe('Queue[1, 2, 3]');
    });

    it('应该在空队列时返回正确的字符串', () => {
      expect(queue.toString()).toBe('Queue[]');
    });
  });

  describe('循环数组功能', () => {
    it('应该正确处理循环情况', () => {
      const smallQueue = new Queue<number>(3);
      
      smallQueue.enqueue(1);
      smallQueue.enqueue(2);
      smallQueue.enqueue(3);
      
      // 队列满了，先出队一些元素
      expect(smallQueue.dequeue()).toBe(1);
      expect(smallQueue.dequeue()).toBe(2);
      
      // 现在可以继续入队，利用循环空间
      expect(smallQueue.enqueue(4)).toBe(true);
      expect(smallQueue.enqueue(5)).toBe(true);
      
      // 验证元素顺序
      expect(smallQueue.toArray()).toEqual([3, 4, 5]);
    });
  });

  describe('内存管理', () => {
    it('dequeue后应该清除元素引用', () => {
      const objQueue = new Queue<{value: number}>(3);
      const obj1 = {value: 1};
      const obj2 = {value: 2};
      
      objQueue.enqueue(obj1);
      objQueue.enqueue(obj2);
      
      const dequeued = objQueue.dequeue();
      expect(dequeued).toBe(obj1);
      
      // 验证原对象仍然可用
      expect(obj1.value).toBe(1);
    });
  });
});