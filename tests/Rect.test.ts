import { describe, it, expect } from 'vitest'
import Rect from '@/utils/Rect'
import Vector2 from '@/utils/Vector2'

describe('Rect', () => {
  describe('构造函数', () => {
    it('应该正确初始化矩形', () => {
      const rect = new Rect(10, 20, 30, 40)
      expect(rect.min_x).toBe(10)
      expect(rect.min_y).toBe(20)
      expect(rect.w).toBe(30)
      expect(rect.h).toBe(40)
    })
  })

  describe('toTuple 方法', () => {
    it('应该返回正确的元组格式', () => {
      const rect = new Rect(5, 10, 15, 20)
      const tuple = rect.toTuple()
      expect(tuple).toEqual([5, 10, 15, 20])
      expect(Array.isArray(tuple)).toBe(true)
      expect(tuple.length).toBe(4)
    })
  })

  describe('center 方法', () => {
    it('应该计算正确的中心点', () => {
      const rect = new Rect(0, 0, 10, 20)
      const center = rect.center()
      expect(center.x).toBe(5)
      expect(center.y).toBe(10)
    })

    it('应该处理负坐标', () => {
      const rect = new Rect(-10, -20, 20, 40)
      const center = rect.center()
      expect(center.x).toBe(0)
      expect(center.y).toBe(0)
    })

    it('应该返回 Vector2 实例', () => {
      const rect = new Rect(0, 0, 10, 10)
      const center = rect.center()
      expect(center instanceof Vector2).toBe(true)
    })
  })

  describe('mutiply 方法', () => {
    it('应该正确缩放矩形', () => {
      const rect = new Rect(10, 20, 30, 40)
      const scaled = rect.mutiply(2)
      
      expect(scaled.min_x).toBe(20)
      expect(scaled.min_y).toBe(40)
      expect(scaled.w).toBe(60)
      expect(scaled.h).toBe(80)
    })

    it('应该处理小数缩放', () => {
      const rect = new Rect(10, 20, 30, 40)
      const scaled = rect.mutiply(0.5)
      
      expect(scaled.min_x).toBe(5)
      expect(scaled.min_y).toBe(10)
      expect(scaled.w).toBe(15)
      expect(scaled.h).toBe(20)
    })

    it('应该处理零缩放', () => {
      const rect = new Rect(10, 20, 30, 40)
      const scaled = rect.mutiply(0)
      
      expect(scaled.min_x).toBe(0)
      expect(scaled.min_y).toBe(0)
      expect(scaled.w).toBe(0)
      expect(scaled.h).toBe(0)
    })

    it('不应该修改原矩形', () => {
      const rect = new Rect(10, 20, 30, 40)
      const originalValues = { ...rect }
      rect.mutiply(2)
      
      expect(rect.min_x).toBe(originalValues.min_x)
      expect(rect.min_y).toBe(originalValues.min_y)
      expect(rect.w).toBe(originalValues.w)
      expect(rect.h).toBe(originalValues.h)
    })
  })

  describe('边界情况', () => {
    it('应该处理负尺寸', () => {
      const rect = new Rect(10, 20, -30, -40)
      expect(rect.w).toBe(-30)
      expect(rect.h).toBe(-40)
    })

    it('应该处理零尺寸', () => {
      const rect = new Rect(10, 20, 0, 0)
      const center = rect.center()
      expect(center.x).toBe(10)
      expect(center.y).toBe(20)
    })

    it('应该处理大数值', () => {
      const rect = new Rect(1000000, 2000000, 3000000, 4000000)
      const scaled = rect.mutiply(0.001)
      expect(scaled.min_x).toBe(1000)
      expect(scaled.min_y).toBe(2000)
    })
  })
})