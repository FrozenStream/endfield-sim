import { describe, it, expect, beforeEach } from 'vitest'
import Vector2 from '@/utils/Vector2'

// Mock DOMMatrix for Node.js environment
class MockDOMMatrix {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number

  constructor(transformList?: number[]) {
    if (transformList && transformList.length >= 6) {
      this.a = transformList[0]
      this.b = transformList[1]
      this.c = transformList[2]
      this.d = transformList[3]
      this.e = transformList[4]
      this.f = transformList[5]
    } else {
      this.a = 1
      this.b = 0
      this.c = 0
      this.d = 1
      this.e = 0
      this.f = 0
    }
  }
}

// 在全局作用域中定义 DOMMatrix
global.DOMMatrix = MockDOMMatrix as any

describe('Vector2', () => {
  let vector: Vector2

  beforeEach(() => {
    vector = new Vector2(3, 4)
  })

  describe('构造函数', () => {
    it('应该正确初始化向量', () => {
      expect(vector.x).toBe(3)
      expect(vector.y).toBe(4)
    })
  })

  describe('基本运算方法', () => {
    it('add 方法应该返回新的向量', () => {
      const result = vector.add(new Vector2(1, 2))
      expect(result.x).toBe(4)
      expect(result.y).toBe(6)
      // 原向量不应该被修改
      expect(vector.x).toBe(3)
      expect(vector.y).toBe(4)
    })

    it('addSelf 方法应该修改原向量', () => {
      const result = vector.addSelf(new Vector2(1, 2))
      expect(result.x).toBe(4)
      expect(result.y).toBe(6)
      // 原向量应该被修改
      expect(vector.x).toBe(4)
      expect(vector.y).toBe(6)
    })

    it('sub 方法应该正确计算差值', () => {
      const result = vector.sub(new Vector2(1, 2))
      expect(result.x).toBe(2)
      expect(result.y).toBe(2)
    })

    it('mul 方法应该正确计算标量乘法', () => {
      const result = vector.mul(2)
      expect(result.x).toBe(6)
      expect(result.y).toBe(8)
    })

    it('div 方法应该正确计算标量除法', () => {
      const result = vector.div(2)
      expect(result.x).toBe(1.5)
      expect(result.y).toBe(2)
    })
  })

  describe('点积和比较方法', () => {
    it('dot 方法应该计算正确的点积', () => {
      const result = vector.dot(new Vector2(2, 3))
      expect(result).toBe(18) // 3*2 + 4*3 = 6 + 12 = 18
    })

    it('equal 方法应该正确判断相等性', () => {
      expect(vector.equal(new Vector2(3, 4))).toBe(true)
      expect(vector.equal(new Vector2(1, 2))).toBe(false)
    })
  })

  describe('长度和距离方法', () => {
    it('magnitude 方法应该计算正确的模长', () => {
      const result = vector.magnitude()
      expect(result).toBe(5) // sqrt(3² + 4²) = sqrt(25) = 5
    })

    it('manhattanDistance 方法应该计算正确的曼哈顿距离', () => {
      const zeroVector = new Vector2(0, 0)
      const result = vector.manhattanDistance()
      expect(result).toBe(7) // |3| + |4| = 7
    })
  })

  describe('取整方法', () => {
    it('round 方法应该正确四舍五入', () => {
      const testVector = new Vector2(3.6, 4.3)
      const result = testVector.round()
      expect(result.x).toBe(4)
      expect(result.y).toBe(4)
    })

    it('floor 方法应该正确向下取整', () => {
      const testVector = new Vector2(3.9, 4.1)
      const result = testVector.floor()
      expect(result.x).toBe(3)
      expect(result.y).toBe(4)
    })
  })

  describe('方向转换方法', () => {
    it('toT 方法应该正确转换为单位向量', () => {
      expect(new Vector2(5, 3).toT().x).toBe(1)
      expect(new Vector2(5, 3).toT().y).toBe(1)
      expect(new Vector2(-2, -3).toT().x).toBe(-1)
      expect(new Vector2(-2, -3).toT().y).toBe(-1)
      expect(new Vector2(0, 0).toT().x).toBe(0)
      expect(new Vector2(0, 0).toT().y).toBe(0)
    })
  })

  describe('旋转方法', () => {
    it('rotateCW 方法应该正确顺时针旋转', () => {
      const right = Vector2.RIGHT
      // 使用自定义比较函数处理 -0 和 +0 的问题
      const compareVectors = (v1: Vector2, v2: Vector2) => {
        expect(v1.x).toBeCloseTo(v2.x)
        expect(v1.y).toBeCloseTo(v2.y)
      }
      
      compareVectors(right.rotateCW(1), Vector2.DOWN)
      compareVectors(right.rotateCW(2), Vector2.LEFT)
      compareVectors(right.rotateCW(3), Vector2.UP)
      compareVectors(right.rotateCW(4), Vector2.RIGHT) // 完整一圈
    })

    it('rotateCCW 方法应该正确逆时针旋转', () => {
      const right = Vector2.RIGHT
      const compareVectors = (v1: Vector2, v2: Vector2) => {
        expect(v1.x).toBeCloseTo(v2.x)
        expect(v1.y).toBeCloseTo(v2.y)
      }
      
      compareVectors(right.rotateCCW(1), Vector2.UP)
      compareVectors(right.rotateCCW(2), Vector2.LEFT)
      compareVectors(right.rotateCCW(3), Vector2.DOWN)
      compareVectors(right.rotateCCW(4), Vector2.RIGHT) // 完整一圈
    })

    it('应该处理负数旋转次数', () => {
      const right = Vector2.RIGHT
      const compareVectors = (v1: Vector2, v2: Vector2) => {
        expect(v1.x).toBeCloseTo(v2.x)
        expect(v1.y).toBeCloseTo(v2.y)
      }
      
      compareVectors(right.rotateCW(-1), Vector2.UP)
      compareVectors(right.rotateCCW(-1), Vector2.DOWN)
    })
  })

  describe('静态属性', () => {
    it('应该有正确的预定义向量', () => {
      expect(Vector2.ZERO.x).toBe(0)
      expect(Vector2.ZERO.y).toBe(0)
      expect(Vector2.ONE.x).toBe(1)
      expect(Vector2.ONE.y).toBe(1)
      expect(Vector2.UP.x).toBe(0)
      expect(Vector2.UP.y).toBe(-1)
      expect(Vector2.RIGHT.x).toBe(1)
      expect(Vector2.RIGHT.y).toBe(0)
    })
  })

  describe('静态方法', () => {
    it('linear 方法应该正确计算线性插值', () => {
      const v1 = new Vector2(1, 2)
      const v2 = new Vector2(3, 4)
      const result = Vector2.linear(v1, 2, v2, 3)
      expect(result.x).toBe(11) // 1*2 + 3*3 = 2 + 9 = 11
      expect(result.y).toBe(16) // 2*2 + 4*3 = 4 + 12 = 16
    })

    it('copy 方法应该创建独立的副本', () => {
      const original = new Vector2(5, 6)
      const copy = Vector2.copy(original)
      expect(copy.x).toBe(5)
      expect(copy.y).toBe(6)
      // 修改副本不应该影响原向量
      copy.x = 10
      expect(original.x).toBe(5)
    })

    it('isOpposite 方法应该正确判断相反方向', () => {
      expect(Vector2.isOpposite(0, 6)).toBe(true)  // RIGHT vs LEFT
      expect(Vector2.isOpposite(3, 9)).toBe(true)  // UP vs DOWN
      expect(Vector2.isOpposite(0, 3)).toBe(false) // RIGHT vs UP
    })

    it('toIndex 方法应该正确转换为索引', () => {
      expect(Vector2.toIndex(Vector2.RIGHT)).toBe(0)
      expect(Vector2.toIndex(Vector2.UP)).toBe(3)
      expect(Vector2.toIndex(Vector2.LEFT)).toBe(6)
      expect(Vector2.toIndex(Vector2.DOWN)).toBe(9)
      expect(Vector2.toIndex(new Vector2(1, 1))).toBeNull()
    })
  })

  describe('DOMMatrix 应用方法', () => {
    it('apply 方法应该正确应用矩阵变换', () => {
      // 创建一个简单的平移矩阵
      const matrix = new DOMMatrix([1, 0, 0, 1, 5, 3]) // 平移 (5, 3)
      const result = vector.apply(matrix)
      expect(result.x).toBe(8) // 3 + 5
      expect(result.y).toBe(7) // 4 + 3
    })

    it('applySelf 方法应该修改原向量', () => {
      const matrix = new DOMMatrix([2, 0, 0, 2, 0, 0]) // 缩放 2 倍
      const result = vector.applySelf(matrix)
      expect(result.x).toBe(6)
      expect(result.y).toBe(8)
      expect(vector.x).toBe(6) // 原向量被修改
      expect(vector.y).toBe(8)
    })
  })

  describe('边界情况测试', () => {
    it('应该处理零向量', () => {
      const zero = new Vector2(0, 0)
      expect(zero.magnitude()).toBe(0)
      expect(zero.manhattanDistance()).toBe(0)
      expect(zero.toT().x).toBe(0)
      expect(zero.toT().y).toBe(0)
    })

    it('应该处理负数坐标', () => {
      const negative = new Vector2(-3, -4)
      expect(negative.magnitude()).toBe(5)
      expect(negative.manhattanDistance()).toBe(7)
    })

    it('应该处理大数值', () => {
      const large = new Vector2(1000, 2000)
      expect(large.magnitude()).toBeCloseTo(2236.068, 2)
    })
  })
})