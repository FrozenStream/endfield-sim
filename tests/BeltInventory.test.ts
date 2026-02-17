import { describe, it, expect, beforeEach } from 'vitest'
import { BeltInventory } from '@/instance/BeltInstance'
import { ItemStack } from '@/proto/ItemStack'
import EnumItemType from '@/utils/EnumItemType'
import type { Item } from '@/proto/Item'

// Mock Item 类型
const mockItem: Item = {
  id: 'test_item',
  name: 'Test Item',
  description: 'A test item'
}

describe('BeltInventory', () => {
  let beltInventory: BeltInventory
  let testItemStack: ItemStack

  beforeEach(() => {
    // 创建 BeltInventory 实例
    beltInventory = new BeltInventory(5)
    
    // 创建测试用的 ItemStack
    testItemStack = new ItemStack(mockItem, EnumItemType.SOLID, 10, 50)
  })

  describe('构造函数', () => {
    it('应该正确初始化 BeltInventory', () => {
      const inventory = new BeltInventory(3)
      expect(inventory.length).toBe(3)
    })

    it('应该初始化内部数组', () => {
      expect(beltInventory['_inventory']).toHaveLength(5)
      expect(beltInventory['_delay']).toHaveLength(5)
      expect(beltInventory['_pointer']).toBe(0)
      expect(beltInventory['_pointerDelay']).toBe(0)
    })

    it('应该初始化所有槽位为空的 ItemStack', () => {
      const inventory = beltInventory['_inventory']
      inventory.forEach((stack, index) => {
        expect(stack.item).toBeNull()
        expect(stack.itemType).toBe(EnumItemType.SOLID)
        expect(stack.count).toBe(0)
        expect(stack.MaxCount).toBe(1)
      })
    })
  })

  describe('tail 属性', () => {
    it('应该正确计算尾部索引', () => {
      expect(beltInventory.tail).toBe(4) // (0-1+5) % 5 = 4
    })

    it('在指针移动后应该更新尾部索引', () => {
      // 模拟指针移动
      beltInventory['_pointer'] = 2
      expect(beltInventory.tail).toBe(1) // (2-1+5) % 5 = 1
    })
  })

  describe('tailInventory 方法', () => {
    it('应该在尾部为空时返回 null', () => {
      expect(beltInventory.tailInventory()).toBeNull()
    })

    it('应该在延迟不匹配时返回 null', () => {
      const inventory = beltInventory['_inventory']
      inventory[beltInventory.tail] = testItemStack
      beltInventory['_delay'][beltInventory.tail] = 5 // 设置不同的延迟
      expect(beltInventory.tailInventory()).toBeNull()
    })

    it('应该在有物品且延迟匹配时返回 ItemStack', () => {
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 0 // 匹配当前延迟
      const result = beltInventory.tailInventory()
      expect(result).toBe(testItemStack)
    })
  })

  describe('headInventory 方法', () => {
    it('应该在头部为空时返回 null', () => {
      expect(beltInventory.headInventory()).toBeNull()
    })

    it('应该在延迟不匹配时返回 null', () => {
      const inventory = beltInventory['_inventory']
      inventory[beltInventory['_pointer']] = testItemStack
      beltInventory['_delay'][beltInventory['_pointer']] = 5 // 设置不同的延迟
      expect(beltInventory.headInventory()).toBeNull()
    })

    it('应该在有物品且延迟匹配时返回 ItemStack', () => {
      const inventory = beltInventory['_inventory']
      const headIndex = beltInventory['_pointer']
      inventory[headIndex] = testItemStack
      beltInventory['_delay'][headIndex] = 0 // 匹配当前延迟
      const result = beltInventory.headInventory()
      expect(result).toBe(testItemStack)
    })
  })

  describe('update 方法', () => {
    it('当尾部无物品时不应该更新指针', () => {
      const originalPointer = beltInventory['_pointer']
      const originalPointerDelay = beltInventory['_pointerDelay']
      
      beltInventory.update()
      
      expect(beltInventory['_pointer']).toBe(originalPointer)
      expect(beltInventory['_pointerDelay']).toBe(originalPointerDelay)
    })

    it('当尾部有物品时应该增加延迟计数', () => {
      // 在尾部放置物品
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 0
      
      beltInventory.update()
      
      expect(beltInventory['_pointerDelay']).toBe(1)
    })

    it('当延迟达到最大值时应该重置并移动指针', () => {
      // 设置接近最大延迟的值
      beltInventory['_pointerDelay'] = 19
      
      // 在尾部放置物品
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 19
      
      beltInventory.update()
      
      expect(beltInventory['_pointerDelay']).toBe(0)
      expect(beltInventory['_pointer']).toBe(4) // (0-1+5) % 5 = 4
    })

    it('应该正确处理指针循环', () => {
      // 设置指针到最后位置
      beltInventory['_pointer'] = 1
      beltInventory['_pointerDelay'] = 19
      
      // 在尾部放置物品
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail // 应该是 0
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 19
      
      beltInventory.update()
      
      expect(beltInventory['_pointer']).toBe(0) // 循环回到开始
    })
  })

  describe('insertable 方法', () => {
    it('当下一个位置有足够的延迟空间时应该返回 true', () => {
      expect(beltInventory.insertable()).toBe(true)
    })

    it('当下一个位置延迟空间不足时应该返回 false', () => {
      const nextIndex = (beltInventory['_pointer'] + 1) % beltInventory.length
      beltInventory['_delay'][nextIndex] = 15 // 设置较高的延迟值
      beltInventory['_pointerDelay'] = 10
      
      expect(beltInventory.insertable()).toBe(false)
    })

    it('当当前位置延迟小于指针延迟时应该返回 false', () => {
      beltInventory['_delay'][beltInventory['_pointer']] = 5 // 较小的延迟
      beltInventory['_pointerDelay'] = 10 // 较大的指针延迟
      
      expect(beltInventory.insertable()).toBe(false)
    })

    it('综合条件测试 - 可插入情况', () => {
      // 设置合理的延迟值使插入成为可能
      const nextIndex = (beltInventory['_pointer'] + 1) % beltInventory.length
      beltInventory['_delay'][nextIndex] = 5
      beltInventory['_pointerDelay'] = 15
      beltInventory['_delay'][beltInventory['_pointer']] = 20
      
      expect(beltInventory.insertable()).toBe(true)
    })
  })

  describe('边界情况测试', () => {
    it('应该正确处理长度为1的传送带', () => {
      const smallBelt = new BeltInventory(1)
      expect(smallBelt.length).toBe(1)
      expect(smallBelt.tail).toBe(0)
      expect(smallBelt['_inventory']).toHaveLength(1)
    })

    it('应该正确处理非常大的传送带', () => {
      const largeBelt = new BeltInventory(100)
      expect(largeBelt.length).toBe(100)
      expect(largeBelt.tail).toBe(99)
      expect(largeBelt['_inventory']).toHaveLength(100)
    })

    it('应该正确处理空物品栈', () => {
      const emptyStack = new ItemStack(null, EnumItemType.SOLID, 0, 1)
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail
      inventory[tailIndex] = emptyStack
      beltInventory['_delay'][tailIndex] = 0
      
      expect(beltInventory.tailInventory()).toBeNull()
    })
  })

  describe('状态一致性测试', () => {
    it('多个更新操作应该保持状态一致', () => {
      // 在尾部放置物品
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 0

      // 执行多次更新
      for (let i = 0; i < 5; i++) {
        beltInventory.update()
      }

      // 验证状态合理性
      expect(beltInventory['_pointerDelay']).toBeLessThan(BeltInventory['SecMaxDelay'])
      expect(beltInventory['_pointer']).toBeGreaterThanOrEqual(0)
      expect(beltInventory['_pointer']).toBeLessThan(beltInventory.length)
    })

    it('插入性检查应该与实际状态一致', () => {
      // 测试插入性检查的一致性
      const isInsertable = beltInventory.insertable()
      
      // 根据当前状态验证结果的合理性
      const nextIndex = (beltInventory['_pointer'] + 1) % beltInventory.length
      const delayCondition = BeltInventory['SecMaxDelay'] - beltInventory['_delay'][nextIndex] + beltInventory['_pointerDelay'] >= BeltInventory['SecMaxDelay']
      const pointerCondition = beltInventory['_delay'][beltInventory['_pointer']] >= beltInventory['_pointerDelay']
      const expectedInsertable = delayCondition && pointerCondition
      
      expect(isInsertable).toBe(expectedInsertable)
    })
  })

  describe('传送带动态运行稳定性测试', () => {
    it('应该在连续更新中保持稳定的传送节奏', () => {
      // 在尾部放置物品模拟传送带运行
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail
      
      // 放置物品并设置合适的延迟
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 0
      
      // 记录初始状态
      const initialState = {
        pointer: beltInventory['_pointer'],
        pointerDelay: beltInventory['_pointerDelay']
      }
      
      // 执行20次连续更新（超过最大延迟值）
      const updateCount = 20
      for (let i = 0; i < updateCount; i++) {
        beltInventory.update()
      }
      
      // 验证状态变化符合预期
      const finalState = {
        pointer: beltInventory['_pointer'],
        pointerDelay: beltInventory['_pointerDelay']
      }
      
      // 指针延迟应该在合理范围内循环
      expect(finalState.pointerDelay).toBeLessThan(BeltInventory['SecMaxDelay'])
      expect(finalState.pointerDelay).toBeGreaterThanOrEqual(0)
      
      // 至少发生了一次指针移动（因为20 > SecMaxDelay）
      expect(
        finalState.pointer !== initialState.pointer || 
        finalState.pointerDelay !== initialState.pointerDelay
      ).toBe(true)
    })

    it('应该正确处理多个物品在传送带上的同步传输', () => {
      const inventory = beltInventory['_inventory']
      
      // 在传送带上放置多个物品，模拟真实的传送带运行
      // 间隔放置物品以测试同步传输
      const positions = [0, 2, 4] // 在不同位置放置物品
      
      positions.forEach(pos => {
        inventory[pos] = new ItemStack(mockItem, EnumItemType.SOLID, 5, 50)
        beltInventory['_delay'][pos] = pos * 4 // 设置不同的延迟时间
      })
      
      // 记录初始状态
      const initialItems = positions.map(pos => ({
        position: pos,
        hasItem: !inventory[pos].isEmpty(),
        delay: beltInventory['_delay'][pos]
      }))
      
      // 执行多次更新
      for (let i = 0; i < 10; i++) {
        beltInventory.update()
      }
      
      // 验证物品仍然存在且状态合理
      positions.forEach((pos, index) => {
        const currentItem = inventory[pos]
        expect(currentItem.isEmpty()).toBe(false) // 物品不应消失
        expect(beltInventory['_delay'][pos]).toBeGreaterThanOrEqual(0) // 延迟应非负
      })
    })

    it('应该防止传送带堵塞情况下的异常行为', () => {
      const inventory = beltInventory['_inventory']
      
      // 模拟传送带完全堵塞的情况：所有位置都有物品
      for (let i = 0; i < beltInventory.length; i++) {
        inventory[i] = new ItemStack(mockItem, EnumItemType.SOLID, 1, 50)
        beltInventory['_delay'][i] = 0
      }
      
      // 记录堵塞前的状态
      const blockedPointer = beltInventory['_pointer']
      const blockedDelay = beltInventory['_pointerDelay']
      
      // 尝试多次更新（传送带堵塞时不应该移动）
      for (let i = 0; i < 15; i++) {
        beltInventory.update()
      }
      
      // 验证堵塞状态下指针未移动
      expect(beltInventory['_pointer']).toBe(blockedPointer)
      // 延迟可能增加，但指针应该保持不动
    })

    it('应该正确处理传送带启动和停止的基本状态转换', () => {
      // 测试插入阻塞条件
      const nextIndex = (beltInventory['_pointer'] + 1) % beltInventory.length
      
      // 初始状态：可以插入
      expect(beltInventory.insertable()).toBe(true)
      
      // 设置阻塞条件：下一个位置延迟太高
      beltInventory['_delay'][nextIndex] = BeltInventory['SecMaxDelay'] - 1
      beltInventory['_pointerDelay'] = 0
      expect(beltInventory.insertable()).toBe(false)
      
      // 清除阻塞条件
      beltInventory['_delay'][nextIndex] = 0
      expect(beltInventory.insertable()).toBe(true)
      
      // 测试传送带运行过程
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail
      
      // 放置物品开始传送
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 0
      
      // 执行足够的更新让物品传送到头部
      const updatesNeeded = BeltInventory['SecMaxDelay'] * 2
      for (let i = 0; i < updatesNeeded; i++) {
        beltInventory.update()
      }
      
      // 验证传送完成后尾部清空
      expect(beltInventory.tailInventory()).toBeNull()
    })

    it('应该维持传送带各段之间的正确时序关系', () => {
      const inventory = beltInventory['_inventory']
      
      // 设置传送带各段有不同的延迟，模拟真实运行
      for (let i = 0; i < beltInventory.length; i++) {
        inventory[i] = new ItemStack(mockItem, EnumItemType.SOLID, 1, 50)
        beltInventory['_delay'][i] = i * 3 // 递增的延迟
      }
      
      beltInventory['_pointerDelay'] = 5 // 设置中间延迟值
      
      // 执行几次更新
      for (let i = 0; i < 5; i++) {
        beltInventory.update()
      }
      
      // 验证时序关系保持正确
      const currentPointerDelay = beltInventory['_pointerDelay']
      const currentPointer = beltInventory['_pointer']
      
      // 相邻段的延迟差应该保持相对稳定
      for (let i = 0; i < beltInventory.length - 1; i++) {
        const next = (i + 1) % beltInventory.length
        const delayDiff = Math.abs(beltInventory['_delay'][next] - beltInventory['_delay'][i])
        expect(delayDiff).toBeLessThanOrEqual(10) // 延迟差异应在合理范围内
      }
    })

    it('应该正确处理高频率更新场景', () => {
      const inventory = beltInventory['_inventory']
      const tailIndex = beltInventory.tail
      
      // 放置物品
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 0
      
      // 模拟高频率更新（短时间内大量调用）
      const highFrequencyUpdates = 100
      const states: Array<{pointer: number, delay: number}> = []
      
      for (let i = 0; i < highFrequencyUpdates; i++) {
        beltInventory.update()
        states.push({
          pointer: beltInventory['_pointer'],
          delay: beltInventory['_pointerDelay']
        })
      }
      
      // 验证状态变化的合理性
      expect(states.every(state => 
        state.delay >= 0 && state.delay < BeltInventory['SecMaxDelay']
      )).toBe(true)
      
      expect(states.every(state => 
        state.pointer >= 0 && state.pointer < beltInventory.length
      )).toBe(true)
      
      // 验证不会出现状态突变
      for (let i = 1; i < states.length; i++) {
        const prevState = states[i-1]
        const currentState = states[i]
        
        // 每次更新指针最多移动1位或延迟增加1
        const pointerDiff = Math.abs(currentState.pointer - prevState.pointer)
        const delayDiff = Math.abs(currentState.delay - prevState.delay)
        
        expect(pointerDiff).toBeLessThanOrEqual(1)
        expect(delayDiff).toBeLessThanOrEqual(1)
      }
    })

    it('应该在极端条件下保持数值稳定性', () => {
      // 测试边界条件下的稳定性
      const extremeBelt = new BeltInventory(3) // 小型传送带更容易测试边界情况
      const inventory = extremeBelt['_inventory']
      
      // 在所有位置放置物品
      for (let i = 0; i < extremeBelt.length; i++) {
        inventory[i] = new ItemStack(mockItem, EnumItemType.SOLID, 1, 50)
        extremeBelt['_delay'][i] = i * 7
      }
      
      extremeBelt['_pointerDelay'] = 15
      
      // 执行大量更新操作
      const extremeUpdates = 200
      for (let i = 0; i < extremeUpdates; i++) {
        extremeBelt.update()
        
        // 每次更新后验证数值范围
        expect(extremeBelt['_pointer']).toBeGreaterThanOrEqual(0)
        expect(extremeBelt['_pointer']).toBeLessThan(extremeBelt.length)
        expect(extremeBelt['_pointerDelay']).toBeGreaterThanOrEqual(0)
        expect(extremeBelt['_pointerDelay']).toBeLessThan(BeltInventory['SecMaxDelay'])
      }
    })
  })

  describe('传送带插入阻塞现象演示', () => {
    it('应该演示传送带在运行过程中可能出现的临时插入阻塞', () => {
      const inventory = beltInventory['_inventory']
      
      console.log('=== 传送带插入阻塞现象演示 ===')
      
      // 1. 初始状态 - 空传送带，可以插入
      console.log('1. 初始状态:')
      console.log('   传送带状态: 空')
      console.log('   可插入状态:', beltInventory.insertable())
      expect(beltInventory.insertable()).toBe(true)
      
      // 2. 放置第一个物品 - 可能影响插入状态
      const tailIndex = beltInventory.tail
      inventory[tailIndex] = testItemStack
      beltInventory['_delay'][tailIndex] = 0
      
      console.log('2. 放置物品后:')
      console.log('   尾部有物品:', !beltInventory.tailInventory()?.isEmpty())
      console.log('   可插入状态:', beltInventory.insertable())
      
      // 3. 设置特定的延迟条件来制造插入阻塞
      const nextIndex = (beltInventory['_pointer'] + 1) % beltInventory.length
      beltInventory['_delay'][nextIndex] = 15  // 设置较高的延迟
      beltInventory['_pointerDelay'] = 10      // 设置较低的指针延迟
      
      console.log('3. 设置阻塞条件后:')
      console.log('   nextIndex延迟:', beltInventory['_delay'][nextIndex])
      console.log('   pointerDelay:', beltInventory['_pointerDelay'])
      console.log('   可插入状态:', beltInventory.insertable())
      expect(beltInventory.insertable()).toBe(false) // 应该不可插入
      
      // 4. 清除阻塞条件
      beltInventory['_delay'][nextIndex] = 0
      
      console.log('4. 清除阻塞条件后:')
      console.log('   可插入状态:', beltInventory.insertable())
      expect(beltInventory.insertable()).toBe(true) // 应该重新可插入
      
      // 5. 模拟完整传送过程
      console.log('5. 完整传送过程:')
      
      // 重置状态
      beltInventory['_pointer'] = 0
      beltInventory['_pointerDelay'] = 0
      for (let i = 0; i < beltInventory.length; i++) {
        inventory[i].clear()
        beltInventory['_delay'][i] = 0
      }
      
      // 重新放置物品并追踪传送过程
      inventory[0] = new ItemStack(mockItem, EnumItemType.SOLID, 1, 50)
      beltInventory['_delay'][0] = 0
      
      console.log('   初始: [■][ ][ ][ ][ ]')
      
      // 执行传送直到物品到达末端
      for (let step = 0; step < BeltInventory['SecMaxDelay'] * 3; step++) {
        beltInventory.update()
        
        // 显示传送带状态
        if (step % 10 === 0 || beltInventory.tailInventory() === null) {
          const display = inventory.map(stack => stack.isEmpty() ? '[ ]' : '[■]').join('')
          console.log(`   步骤${step}: ${display} (可插入:${beltInventory.insertable()})`)
        }
        
        // 当传送带清空时检查插入状态
        if (beltInventory.tailInventory() === null) {
          console.log('   → 传送带已清空，重新可插入')
          expect(beltInventory.insertable()).toBe(true)
          break
        }
      }
    })
  })

  describe('传送带插入机制详解', () => {
    it('应该解释传送带何时会阻止新物品插入', () => {
      const inventory = beltInventory['_inventory']
      
      console.log('=== 传送带插入机制详解 ===')
      
      // 1. 空传送带总是可以插入
      console.log('1. 空传送带状态:')
      console.log('   所有槽位为空，总是可以插入')
      expect(beltInventory.insertable()).toBe(true)
      
      // 2. 在下一个槽位放置物品但不影响插入（因为空槽位）
      const nextIndex = (beltInventory['_pointer'] + 1) % beltInventory.length
      inventory[nextIndex] = new ItemStack(mockItem, EnumItemType.SOLID, 1, 50)
      beltInventory['_delay'][nextIndex] = 0  // 充足的延迟空间
      
      console.log('2. 下一槽位有物品但延迟充足:')
      console.log('   nextIndex有物品但延迟充足 → 仍可插入')
      expect(beltInventory.insertable()).toBe(true)
      
      // 3. 创造真正的插入阻塞条件
      console.log('3. 创造插入阻塞条件:')
      
      // 清空下一槽位，改为在当前指针位置放置物品
      inventory[nextIndex].clear()
      
      // 在当前指针位置放置物品并设置延迟不足
      const currentIndex = beltInventory['_pointer']
      inventory[currentIndex] = new ItemStack(mockItem, EnumItemType.SOLID, 1, 50)
      beltInventory['_delay'][currentIndex] = 5   // 较低的延迟
      beltInventory['_pointerDelay'] = 15         // 较高的指针延迟
      
      console.log('   当前位置有物品且延迟不足 → 不可插入')
      console.log('   delay[current]:', beltInventory['_delay'][currentIndex])
      console.log('   pointerDelay:', beltInventory['_pointerDelay'])
      console.log('   delay < pointerDelay:', beltInventory['_delay'][currentIndex] < beltInventory['_pointerDelay'])
      expect(beltInventory.insertable()).toBe(false)
      
      // 4. 解决阻塞条件
      beltInventory['_delay'][currentIndex] = 20  // 提高延迟使其>=指针延迟
      
      console.log('4. 解决阻塞条件后:')
      console.log('   delay[current]:', beltInventory['_delay'][currentIndex])
      console.log('   pointerDelay:', beltInventory['_pointerDelay'])
      console.log('   现在可以插入:', beltInventory.insertable())
      expect(beltInventory.insertable()).toBe(true)
      
      // 5. 演示传送带运行中的自然插入机会
      console.log('5. 传送带运行中的插入机会:')
      
      // 重置状态
      for (let i = 0; i < beltInventory.length; i++) {
        inventory[i].clear()
        beltInventory['_delay'][i] = 0
      }
      beltInventory['_pointer'] = 0
      beltInventory['_pointerDelay'] = 0
      
      // 放置一个物品开始传送
      inventory[0] = new ItemStack(mockItem, EnumItemType.SOLID, 1, 50)
      beltInventory['_delay'][0] = 0
      
      console.log('   开始传送: [■][ ][ ][ ][ ]')
      
      let insertionOpportunities = 0
      let totalSteps = 0
      
      // 运行一段时间观察插入机会
      for (let step = 0; step < BeltInventory['SecMaxDelay'] * 4; step++) {
        const wasInsertable = beltInventory.insertable()
        beltInventory.update()
        totalSteps++
        
        if (wasInsertable) {
          insertionOpportunities++
          if (insertionOpportunities <= 3) { // 只显示前3次机会
            const display = inventory.map(stack => stack.isEmpty() ? '[ ]' : '[■]').join('')
            console.log(`   步骤${step}: ${display} ← 可插入!`)
          }
        }
        
        // 当传送带清空时停止
        if (inventory.every(stack => stack.isEmpty())) {
          console.log('   传送带已清空')
          break
        }
      }
      
      console.log(`   总共找到 ${insertionOpportunities} 次插入机会`)
      expect(insertionOpportunities).toBeGreaterThan(0)
    })
  })

})