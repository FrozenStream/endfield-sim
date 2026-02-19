import EnumItemType from "../utils/EnumItemType";
import type { Item } from "./Item";

export class ItemStack {
    private _item: Item | null;
    private _count: number;
    public readonly MaxCount: number;
    public readonly itemType: EnumItemType;

    constructor(item: Item | null, itemType: EnumItemType, count: number = 0, maxCount: number = 50) {
        this._item = item;
        this._count = count;
        this.MaxCount = maxCount;
        this.itemType = itemType;
    }

    public get item(): Item | null {
        if (this.MaxCount === 0) return this._item;
        if (!this.isEmpty()) return this._item;
        else return null;
    }

    public set item(item: Item | null) {
        this._item = item;
    }

    public get count(): number {
        if (this._item === null) return 0;
        return this._count;
    }

    public set count(count: number) {
        this._count = Math.min(Math.max(0, count), this.MaxCount);
    }

    public clear(): void {
        this._item = null;
        this._count = 0;
    }

    public copy(stack_in: ItemStack) {
        this._item = stack_in._item;
        this._count = stack_in._count;
    }

    public moveIn(stack_in: ItemStack) {
        this.copy(stack_in);
        stack_in.clear();
    }

    public isEmpty(): boolean {
        if (this._item === null || this._count === 0) return true;
        return false;
    }

    public isFull(): boolean {
        return this._item !== null && this._count === this.MaxCount;
    }

    /**
     * 将 itemStack_in 合并到该 itemStack 中
     * @param stack_in ref 待合并的ItemStack
     * @returns        若stack_in完全合并成功则返回true，否则返回false
     */
    public merge(stack_in: ItemStack): boolean {
        if (this.itemType !== EnumItemType.ANY && this.itemType !== stack_in.itemType) return false;
        if (stack_in.isEmpty() === null) return true;
        if (this.isEmpty()) this._item = stack_in._item;
        else if (this._item !== stack_in._item) return false;
        // 合并数量并处理溢出
        const num = Math.min(this.MaxCount - this._count, stack_in._count);
        this._count += num;
        stack_in._count -= num;
        return stack_in.isEmpty();
    }

    /**
     * 将该 itemStack 分割 count 个元素进入 itemStack_in 中
     * @param stack_in ref 待分割的ItemStack
     * @param count    待分割的数量
     * @returns        剩余需要分割的元素数量
     */
    public split(stack_in: ItemStack, count: number): number {
        if (stack_in.itemType !== EnumItemType.ANY && this.itemType !== stack_in.itemType) return count;
        if (this.isEmpty() || stack_in.isFull()) return count;
        if (stack_in._item !== null && this._item !== stack_in._item) return count;
        const num = Math.min(this._count, stack_in.MaxCount - stack_in._count, count);
        stack_in._count += num;
        this._count -= num;
        return count - num;
    }
}