import { describe, it, expect } from 'vitest';
import { Queue } from '../src/utils/Queue';

// 测试用的类定义
class TestPerson {
  constructor(
    public id: number,
    public name: string,
    public age: number,
    public email: string
  ) {}
  
  toString(): string {
    return `Person{id:${this.id}, name:${this.name}, age:${this.age}}`;
  }
}

class TestProduct {
  constructor(
    public productId: string,
    public name: string,
    public price: number,
    public category: string,
    public tags: string[]
  ) {}
  
  getDiscountPrice(discount: number): number {
    return this.price * (1 - discount);
  }
}

class TestComplexObject {
  public metadata: Map<string, any>;
  public nestedObjects: TestComplexObject[];
  
  constructor(
    public id: string,
    public data: any,
    public timestamp: Date
  ) {
    this.metadata = new Map();
    this.nestedObjects = [];
  }
  
  addMetadata(key: string, value: any): void {
    this.metadata.set(key, value);
  }
}

describe('Queue Class Type Performance Test', () => {
  const LARGE_TEST_SIZE = 50000;
  const MEDIUM_TEST_SIZE = 10000;
  
  describe('简单类对象性能测试', () => {
    it('TestPerson类对象队列性能', () => {
      const personQueue = new Queue<TestPerson>(LARGE_TEST_SIZE);
      const startTime = performance.now();
      
      // 创建并入队大量Person对象
      for (let i = 0; i < LARGE_TEST_SIZE; i++) {
        const person = new TestPerson(
          i,
          `User${i}`,
          20 + (i % 50),
          `user${i}@example.com`
        );
        personQueue.enqueue(person);
      }
      
      const enqueueTime = performance.now() - startTime;
      console.log(`Person对象入队 ${LARGE_TEST_SIZE} 个耗时: ${enqueueTime.toFixed(2)}ms`);
      
      // 出队测试
      const dequeueStartTime = performance.now();
      while (!personQueue.isEmpty()) {
        const person = personQueue.dequeue();
        // 简单访问属性以确保对象被正常使用
        person.name.toLowerCase();
      }
      
      const dequeueTime = performance.now() - dequeueStartTime;
      console.log(`Person对象出队 ${LARGE_TEST_SIZE} 个耗时: ${dequeueTime.toFixed(2)}ms`);
      
      expect(enqueueTime).toBeLessThan(200); // 200ms阈值
      expect(dequeueTime).toBeLessThan(200); // 200ms阈值
    });
    
    it('TestProduct类对象队列性能', () => {
      const productQueue = new Queue<TestProduct>(MEDIUM_TEST_SIZE);
      const startTime = performance.now();
      
      // 创建并入队Product对象
      for (let i = 0; i < MEDIUM_TEST_SIZE; i++) {
        const product = new TestProduct(
          `PROD-${i.toString().padStart(5, '0')}`,
          `Product ${i}`,
          10 + (i % 1000),
          ['Electronics', 'Clothing', 'Books', 'Home'][i % 4],
          [`tag${i % 5}`, `category${i % 3}`]
        );
        productQueue.enqueue(product);
      }
      
      const enqueueTime = performance.now() - startTime;
      console.log(`Product对象入队 ${MEDIUM_TEST_SIZE} 个耗时: ${enqueueTime.toFixed(2)}ms`);
      
      // 出队并调用方法测试
      const dequeueStartTime = performance.now();
      while (!productQueue.isEmpty()) {
        const product = productQueue.dequeue();
        // 调用对象方法
        product.getDiscountPrice(0.1);
      }
      
      const dequeueTime = performance.now() - dequeueStartTime;
      console.log(`Product对象出队 ${MEDIUM_TEST_SIZE} 个耗时: ${dequeueTime.toFixed(2)}ms`);
      
      expect(enqueueTime).toBeLessThan(100);
      expect(dequeueTime).toBeLessThan(100);
    });
  });
  
  describe('复杂对象性能测试', () => {
    it('TestComplexObject复杂对象队列性能', () => {
      const complexQueue = new Queue<TestComplexObject>(5000);
      const startTime = performance.now();
      
      // 创建复杂的嵌套对象
      for (let i = 0; i < 5000; i++) {
        const complexObj = new TestComplexObject(
          `OBJ-${i}`,
          {
            value: i,
            nested: {
              data: `nested-data-${i}`,
              array: Array.from({length: 10}, (_, idx) => idx + i)
            }
          },
          new Date(Date.now() - (i * 1000))
        );
        
        // 添加元数据
        complexObj.addMetadata('createdBy', 'test');
        complexObj.addMetadata('version', 1.0);
        complexObj.addMetadata('tags', ['performance', 'test']);
        
        complexQueue.enqueue(complexObj);
      }
      
      const enqueueTime = performance.now() - startTime;
      console.log(`复杂对象入队 5000 个耗时: ${enqueueTime.toFixed(2)}ms`);
      
      // 出队测试
      const dequeueStartTime = performance.now();
      while (!complexQueue.isEmpty()) {
        const obj = complexQueue.dequeue();
        // 访问复杂属性
        obj.metadata.get('createdBy');
        obj.timestamp.getTime();
      }
      
      const dequeueTime = performance.now() - dequeueStartTime;
      console.log(`复杂对象出队 5000 个耗时: ${dequeueTime.toFixed(2)}ms`);
      
      expect(enqueueTime).toBeLessThan(150);
      expect(dequeueTime).toBeLessThan(150);
    });
  });
  
  describe('继承关系类性能测试', () => {
    class BaseClass {
      constructor(public baseId: number) {}
    }
    
    class DerivedClass extends BaseClass {
      constructor(baseId: number, public derivedProp: string) {
        super(baseId);
      }
    }
    
    it('继承类对象队列性能', () => {
      const derivedQueue = new Queue<DerivedClass>(20000);
      const startTime = performance.now();
      
      for (let i = 0; i < 20000; i++) {
        const derived = new DerivedClass(i, `derived-${i}`);
        derivedQueue.enqueue(derived);
      }
      
      const enqueueTime = performance.now() - startTime;
      console.log(`继承类对象入队 20000 个耗时: ${enqueueTime.toFixed(2)}ms`);
      
      const dequeueStartTime = performance.now();
      while (!derivedQueue.isEmpty()) {
        const obj = derivedQueue.dequeue();
        obj.baseId + obj.derivedProp.length; // 访问属性
      }
      
      const dequeueTime = performance.now() - dequeueStartTime;
      console.log(`继承类对象出队 20000 个耗时: ${dequeueTime.toFixed(2)}ms`);
      
      expect(enqueueTime).toBeLessThan(100);
      expect(dequeueTime).toBeLessThan(100);
    });
  });
  
  describe('内存使用测试', () => {
    it('大量对象的内存管理测试', () => {
      const queue = new Queue<TestPerson>(10000);
      
      // 预热
      for (let i = 0; i < 1000; i++) {
        queue.enqueue(new TestPerson(i, `Temp${i}`, 25, `temp${i}@test.com`));
      }
      while (!queue.isEmpty()) {
        queue.dequeue();
      }
      
      const memoryBefore = process.memoryUsage?.().heapUsed || 0;
      
      // 大量对象测试
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let i = 0; i < 10000; i++) {
          queue.enqueue(new TestPerson(
            cycle * 10000 + i,
            `User${cycle}-${i}`,
            20 + (i % 60),
            `user${cycle}-${i}@company.com`
          ));
        }
        
        // 处理一部分对象
        for (let i = 0; i < 5000; i++) {
          const person = queue.dequeue();
          // 确保对象被使用
          person.email.toUpperCase();
        }
      }
      
      const memoryAfter = process.memoryUsage?.().heapUsed || 0;
      const memoryGrowth = Math.max(0, memoryAfter - memoryBefore);
      
      console.log(`内存增长: ${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
      
      // 清理剩余对象
      while (!queue.isEmpty()) {
        queue.dequeue();
      }
      
      // 内存增长应该在合理范围内（这里设置较宽松的阈值）
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });
  
  describe('混合类型测试', () => {
    it('不同类型对象混合队列性能', () => {
      type MixedType = TestPerson | TestProduct | TestComplexObject;
      const mixedQueue = new Queue<MixedType>(15000);
      const startTime = performance.now();
      
      // 混合添加不同类型对象
      for (let i = 0; i < 15000; i++) {
        let obj: MixedType;
        
        switch (i % 3) {
          case 0:
            obj = new TestPerson(i, `MixedUser${i}`, 25 + (i % 40), `mixed${i}@test.com`);
            break;
          case 1:
            obj = new TestProduct(
              `MIXED-${i}`,
              `Mixed Product ${i}`,
              50 + (i % 500),
              'Mixed',
              ['mixed-tag']
            );
            break;
          case 2:
          default:
            obj = new TestComplexObject(
              `MIXED-OBJ-${i}`,
              { mixedData: i },
              new Date()
            );
            break;
        }
        
        mixedQueue.enqueue(obj);
      }
      
      const enqueueTime = performance.now() - startTime;
      console.log(`混合类型对象入队 15000 个耗时: ${enqueueTime.toFixed(2)}ms`);
      
      const dequeueStartTime = performance.now();
      while (!mixedQueue.isEmpty()) {
        const obj = mixedQueue.dequeue();
        // 根据类型进行不同的操作
        if (obj instanceof TestPerson) {
          obj.name.substring(0, 5);
        } else if (obj instanceof TestProduct) {
          obj.getDiscountPrice(0.05);
        } else if (obj instanceof TestComplexObject) {
          obj.timestamp.getDate();
        }
      }
      
      const dequeueTime = performance.now() - dequeueStartTime;
      console.log(`混合类型对象出队 15000 个耗时: ${dequeueTime.toFixed(2)}ms`);
      
      expect(enqueueTime).toBeLessThan(150);
      expect(dequeueTime).toBeLessThan(150);
    });
  });
});