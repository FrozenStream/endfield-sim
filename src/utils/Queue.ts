/**
 * 基于定长数组实现的泛型队列
 * 使用循环数组的方式避免数据搬移，提高性能
 */
export class Queue<T> {
  private items: Array<T | undefined>;
  private capacity: number;
  private head: number;
  private tail: number;
  private size: number;

  /**
   * 构造函数
   * @param capacity 队列的最大容量
   */
  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('队列容量必须大于0');
    }
    
    this.capacity = capacity;
    this.items = new Array(capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  /**
   * 向队列尾部添加元素
   * @param item 要添加的元素
   * @returns 添加成功返回true，队列已满返回false
   */
  enqueue(item: T): boolean {
    if (this.isFull()) {
      return false;
    }
    
    this.items[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.size++;
    return true;
  }

  /**
   * 从队列头部移除并返回元素
   * @returns 队首元素
   * @throws 当队列为空时抛出错误
   */
  dequeue(): T {
    if (this.isEmpty()) {
      throw new Error('无法从空队列中取出元素');
    }
    
    const item = this.items[this.head]!;
    this.items[this.head] = undefined; // 清除引用，便于垃圾回收
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return item;
  }

  /**
   * 查看队列头部元素但不移除
   * @returns 队首元素
   * @throws 当队列为空时抛出错误
   */
  peek(): T {
    if (this.isEmpty()) {
      throw new Error('无法查看空队列的元素');
    }
    return this.items[this.head]!;
  }

  /**
   * 检查队列是否为空
   * @returns 空队列返回true，否则返回false
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * 检查队列是否已满
   * @returns 队列已满返回true，否则返回false
   */
  isFull(): boolean {
    return this.size === this.capacity;
  }

  /**
   * 获取队列当前元素数量
   * @returns 当前队列中的元素个数
   */
  getSize(): number {
    return this.size;
  }

  /**
   * 获取队列最大容量
   * @returns 队列的最大容量
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * 清空队列
   */
  clear(): void {
    // 清除所有元素引用
    for (let i = 0; i < this.capacity; i++) {
      this.items[i] = undefined;
    }
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  /**
   * 将队列转换为数组
   * @returns 包含队列中所有元素的数组
   */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % this.capacity;
      const item = this.items[index];
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * 获取队列的字符串表示
   * @returns 队列的字符串形式
   */
  toString(): string {
    return `Queue[${this.toArray().join(', ')}]`;
  }
}