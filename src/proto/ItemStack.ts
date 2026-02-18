import EnumItemType from "../utils/EnumItemType";
import type { Item } from "./Item";

export class ItemStack {
    public item: Item | null;
    public readonly itemType: EnumItemType;
    public count: number;
    public readonly MaxCount: number;

    constructor(item: Item | null, itemType: EnumItemType, count: number = 0, maxCount: number = 50) {
        this.item = item;
        this.itemType = itemType;
        this.count = count;
        this.MaxCount = maxCount;
    }

    public clear(): void {
        this.item = null;
        this.count = 0;
    }

    public copy(stack_in: ItemStack){
        this.item = stack_in.item;
        this.count = stack_in.count;
    }

    public moveIn(stack_in: ItemStack){
        this.copy(stack_in);
        stack_in.clear();
    }

    public isEmpty(): boolean {
        if (this.item === null) return true;
        if (this.count === 0) return true;
        return false;
    }
    public isFull(): boolean {
        return this.count === this.MaxCount;
    }

    /**
     * 将 itemStack_in 合并到该 itemStack 中
     * @param stack_in ref 待合并的ItemStack
     * @returns        若stack_in完全合并成功则返回true，否则返回false
     */
    public merge(stack_in: ItemStack): boolean {
        if (this.itemType !== EnumItemType.ANY && this.itemType !== stack_in.itemType) return false;
        if (stack_in.item === null) return true;
        if (this.item === null) this.item = stack_in.item;
        else if (this.item !== stack_in.item) return false;
        // 合并数量并处理溢出
        const num = Math.min(this.MaxCount - this.count, stack_in.count);
        this.count += num;
        stack_in.count -= num;
        return stack_in.isEmpty();
    }

    /**
     * 将该 itemStack 分割 count 个元素进入 itemStack_in 中
     * @param stack_in ref 待分割的ItemStack
     * @param count    待分割的数量
     * @returns        剩余需要分割的元素数量
     */
    public split(stack_in: ItemStack, count: number): number {
        if (this.itemType !== EnumItemType.ANY && this.itemType !== stack_in.itemType) return count;
        if (this.isEmpty() || stack_in.isFull()) return count;
        if (stack_in.item !== null && this.item !== stack_in.item) return count;
        const num = Math.min(this.count, stack_in.MaxCount - stack_in.count, count);
        stack_in.count += num;
        this.count -= num;
        return count - num;
    }
}