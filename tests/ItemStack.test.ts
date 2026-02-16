import { describe, it, expect, beforeEach } from 'vitest'
import ItemStack from '@/ItemStack'
import Item from '@/Item'
import EnumItem from '@/utils/EnumItem'

describe('ItemStack', () => {
  let testItem: Item
  let emptyStack: ItemStack
  let filledStack: ItemStack
  let liquidStack: ItemStack

  beforeEach(() => {
    // 创建测试用的物品
    testItem = Item.iron_ore
    
    // 初始化不同的 ItemStack 实例
    emptyStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
    filledStack = new ItemStack(testItem, EnumItem.SOLID, 25, 50)
    liquidStack = new ItemStack(Item.liquid_water, EnumItem.LIQUID, 30, 100)
  })

  describe('构造函数', () => {
    it('应该正确初始化空的 ItemStack', () => {
      const stack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      expect(stack.item).toBeNull()
      expect(stack.itemType).toBe(EnumItem.SOLID)
      expect(stack.count).toBe(0)
      expect(stack.MaxCount).toBe(50)
    })

    it('应该正确初始化带物品的 ItemStack', () => {
      const stack = new ItemStack(testItem, EnumItem.SOLID, 10, 50)
      expect(stack.item).toBe(testItem)
      expect(stack.itemType).toBe(EnumItem.SOLID)
      expect(stack.count).toBe(10)
      expect(stack.MaxCount).toBe(50)
    })

    it('应该使用默认参数', () => {
      const stack = new ItemStack()
      expect(stack.item).toBeNull()
      expect(stack.itemType).toBeUndefined() // 默认值
      expect(stack.count).toBe(0)
      expect(stack.MaxCount).toBe(50) // 默认最大值
    })
  })

  describe('isEmpty 方法', () => {
    it('应该在 item 为 null 时返回 true', () => {
      const stack = new ItemStack(null, EnumItem.SOLID, 5, 50)
      expect(stack.isEmpty()).toBe(true)
    })

    it('应该在 count 为 0 时返回 true', () => {
      const stack = new ItemStack(testItem, EnumItem.SOLID, 0, 50)
      expect(stack.isEmpty()).toBe(true)
    })

    it('应该在 item 不为 null 且 count 大于 0 时返回 false', () => {
      const stack = new ItemStack(testItem, EnumItem.SOLID, 10, 50)
      expect(stack.isEmpty()).toBe(false)
    })

    it('应该处理边界情况', () => {
      const stack1 = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const stack2 = new ItemStack(testItem, EnumItem.SOLID, 0, 50)
      const stack3 = new ItemStack(null, EnumItem.SOLID, 10, 50)
      
      expect(stack1.isEmpty()).toBe(true)
      expect(stack2.isEmpty()).toBe(true)
      expect(stack3.isEmpty()).toBe(true)
    })
  })

  describe('isFull 方法', () => {
    it('应该在达到最大容量时返回 true', () => {
      const stack = new ItemStack(testItem, EnumItem.SOLID, 50, 50)
      expect(stack.isFull()).toBe(true)
    })

    it('应该在未达到最大容量时返回 false', () => {
      const stack = new ItemStack(testItem, EnumItem.SOLID, 25, 50)
      expect(stack.isFull()).toBe(false)
    })

    it('应该处理不同最大容量的情况', () => {
      const stack1 = new ItemStack(testItem, EnumItem.LIQUID, 100, 100)
      const stack2 = new ItemStack(testItem, EnumItem.SOLID, 49, 50)
      
      expect(stack1.isFull()).toBe(true)
      expect(stack2.isFull()).toBe(false)
    })
  })

  describe('merge 方法', () => {
    it('应该成功合并不同的 ItemStack（相同类型）', () => {
      const sourceStack = new ItemStack(testItem, EnumItem.SOLID, 10, 50)
      const result = filledStack.merge(sourceStack)
      
      expect(result).toBe(true)
      expect(filledStack.count).toBe(35) // 25 + 10
      expect(sourceStack.count).toBe(0)  // 全部合并完
      expect(filledStack.item).toBe(testItem)
    })

    it('应该处理部分合并（目标栈满）', () => {
      const sourceStack = new ItemStack(testItem, EnumItem.SOLID, 30, 50) // 25 + 30 = 55 > 50
      const result = filledStack.merge(sourceStack)
      
      expect(result).toBe(false) // 没有完全合并
      expect(filledStack.count).toBe(50) // 达到最大值
      expect(sourceStack.count).toBe(5)  // 剩余 5 个
    })

    it('应该拒绝不同类型物品的合并', () => {
      const solidStack = new ItemStack(testItem, EnumItem.SOLID, 10, 50)
      const liquidStack = new ItemStack(Item.liquid_water, EnumItem.LIQUID, 10, 50)
      
      const result = solidStack.merge(liquidStack)
      expect(result).toBe(false)
      expect(solidStack.count).toBe(10)
      expect(liquidStack.count).toBe(10)
    })

    it('应该允许 ANY 类型与任何类型合并', () => {
      const anyStack = new ItemStack(testItem, EnumItem.ANY, 10, 50)
      const solidStack = new ItemStack(Item.iron_ore, EnumItem.SOLID, 20, 50)
      
      const result = anyStack.merge(solidStack)
      expect(result).toBe(true)
      expect(anyStack.count).toBe(30)
    })

    it('应该处理空源栈的合并', () => {
      const emptySource = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const result = filledStack.merge(emptySource)
      
      expect(result).toBe(true)
      expect(filledStack.count).toBe(25) // 不变
    })

    it('应该处理目标栈为空的情况', () => {
      const emptyTarget = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const sourceStack = new ItemStack(testItem, EnumItem.SOLID, 15, 50)
      
      const result = emptyTarget.merge(sourceStack)
      
      expect(result).toBe(true)
      expect(emptyTarget.item).toBe(testItem)
      expect(emptyTarget.count).toBe(15)
      expect(sourceStack.count).toBe(0)
    })

    it('应该拒绝不同 ID 物品的合并', () => {
      const stack1 = new ItemStack(Item.iron_ore, EnumItem.SOLID, 10, 50)
      const stack2 = new ItemStack(Item.iron_powder, EnumItem.SOLID, 15, 50)
      
      const result = stack1.merge(stack2)
      expect(result).toBe(false)
      expect(stack1.count).toBe(10)
      expect(stack2.count).toBe(15)
    })

    it('应该处理刚好填满的情况', () => {
      const targetStack = new ItemStack(testItem, EnumItem.SOLID, 40, 50)
      const sourceStack = new ItemStack(testItem, EnumItem.SOLID, 10, 50)
      
      const result = targetStack.merge(sourceStack)
      
      expect(result).toBe(true)
      expect(targetStack.count).toBe(50)
      expect(sourceStack.count).toBe(0)
    })

    it('应该拒绝向已满栈合并', () => {
      const fullStack = new ItemStack(testItem, EnumItem.SOLID, 50, 50)
      const sourceStack = new ItemStack(testItem, EnumItem.SOLID, 10, 50)
      
      const result = fullStack.merge(sourceStack)
      expect(result).toBe(false)
      expect(fullStack.count).toBe(50) // 不变
      expect(sourceStack.count).toBe(10) // 不变
    })
  })

  describe('split 方法', () => {
    it('应该成功分割指定数量的物品', () => {
      const targetStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const result = filledStack.split(targetStack, 10)
      
      expect(result).toBe(true)
      expect(filledStack.count).toBe(15) // 25 - 10
      expect(targetStack.count).toBe(10)
      expect(targetStack.item).toBe(testItem)
    })

    it('应该拒绝从空栈分割', () => {
      const emptyStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const targetStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const result = emptyStack.split(targetStack, 5)
      
      expect(result).toBe(false)
      expect(targetStack.count).toBe(0)
      expect(emptyStack.count).toBe(0)
    })

    it('应该拒绝分割超过现有数量的物品', () => {
      const targetStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const result = filledStack.split(targetStack, 30) // 超过 25
      
      expect(result).toBe(false)
      expect(filledStack.count).toBe(25) // 不变
      expect(targetStack.count).toBe(0)
    })

    it('应该处理分割全部物品', () => {
      const targetStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const result = filledStack.split(targetStack, 25)
      
      expect(result).toBe(true)
      expect(filledStack.count).toBe(0)
      expect(targetStack.count).toBe(25)
    })

    it('应该处理边界情况（分割 1 个）', () => {
      const targetStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const result = filledStack.split(targetStack, 1)
      
      expect(result).toBe(true)
      expect(filledStack.count).toBe(24)
      expect(targetStack.count).toBe(1)
    })

    it('应该替换目标栈的物品而不是累加', () => {
      const targetStack = new ItemStack(Item.iron_powder, EnumItem.SOLID, 5, 50)
      const result = filledStack.split(targetStack, 10)
      
      expect(result).toBe(true)
      expect(targetStack.count).toBe(10) // 被替换为 10，不是 15
      expect(targetStack.item).toBe(testItem) // 被替换为源物品
    })
  })

  describe('边界情况和异常处理', () => {
    it('应该处理最大容量为 1 的情况', () => {
      const singleStack = new ItemStack(testItem, EnumItem.SOLID, 1, 1)
      expect(singleStack.isFull()).toBe(true)
      
      const emptySingle = new ItemStack(null, EnumItem.SOLID, 0, 1)
      expect(emptySingle.isFull()).toBe(false)
    })

    it('应该处理已满栈的合并', () => {
      const largeStack = new ItemStack(testItem, EnumItem.SOLID, 1000, 1000)
      const smallStack = new ItemStack(testItem, EnumItem.SOLID, 500, 1000)
      
      // 先让 largeStack 满
      largeStack.count = 1000
      
      const result = largeStack.merge(smallStack)
      expect(result).toBe(false) // 满栈无法合并
      expect(largeStack.count).toBe(1000) // 不变
      expect(smallStack.count).toBe(500) // 不变
    })

    it('应该正确处理负数数量', () => {
      const negativeStack = new ItemStack(testItem, EnumItem.SOLID, -5, 50)
      // isEmpty 的逻辑是 count === 0，所以负数不为空
      expect(negativeStack.isEmpty()).toBe(false) // 实际行为可能需要调整
      
      const result = filledStack.merge(negativeStack)
      expect(result).toBe(true)
      expect(filledStack.count).toBe(20) // 25 + (-5) = 20
    })

    it('应该处理零数量的分割', () => {
      const targetStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      const result = filledStack.split(targetStack, 0)
      
      expect(result).toBe(true)
      expect(filledStack.count).toBe(25) // 不变
      expect(targetStack.count).toBe(0)
    })
  })

  describe('不同类型物品的行为', () => {
    it('应该正确处理液体类型物品', () => {
      const liquidStack = new ItemStack(Item.liquid_water, EnumItem.LIQUID, 50, 100)
      expect(liquidStack.MaxCount).toBe(100) // 液体通常容量更大
      expect(liquidStack.isFull()).toBe(false)
      
      const fullLiquid = new ItemStack(Item.liquid_water, EnumItem.LIQUID, 100, 100)
      expect(fullLiquid.isFull()).toBe(true)
    })

    it('应该正确处理固体类型物品', () => {
      const solidStack = new ItemStack(Item.iron_ore, EnumItem.SOLID, 25, 50)
      expect(solidStack.MaxCount).toBe(50)
      expect(solidStack.isFull()).toBe(false)
    })

    it('应该处理 ANY 类型的特殊行为', () => {
      const anyStack = new ItemStack(null, EnumItem.ANY, 0, 50)
      expect(anyStack.itemType).toBe(EnumItem.ANY)
      expect(anyStack.isEmpty()).toBe(true)
      
      // ANY 类型应该能接受任何具体类型
      const solidItem = new ItemStack(Item.iron_ore, EnumItem.SOLID, 10, 50)
      expect(anyStack.merge(solidItem)).toBe(true)
    })
  })

  describe('状态一致性', () => {
    it('应该保持物品引用的一致性', () => {
      const originalItem = Item.iron_ore
      const stack = new ItemStack(originalItem, EnumItem.SOLID, 15, 50)
      
      expect(stack.item).toBe(originalItem)
      expect(stack.item?.id).toBe('item_iron_ore')
    })

    it('应该在合并后保持正确的物品类型', () => {
      const stack1 = new ItemStack(Item.iron_ore, EnumItem.SOLID, 10, 50)
      const stack2 = new ItemStack(Item.iron_ore, EnumItem.SOLID, 15, 50)
      
      stack1.merge(stack2)
      expect(stack1.itemType).toBe(EnumItem.SOLID)
      expect(stack1.item?.id).toBe('item_iron_ore')
    })

    it('应该在分割后保持正确的物品引用', () => {
      const targetStack = new ItemStack(null, EnumItem.SOLID, 0, 50)
      filledStack.split(targetStack, 5)
      
      expect(targetStack.item).toBe(testItem)
      expect(targetStack.item?.id).toBe(testItem.id)
    })
  })
})