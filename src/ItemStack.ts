import type Item from "./Item";

class ItemStack {
    public item: Item | null = null;
    public count: number = 0;
    public isEmpty(): boolean {
        if (this.item === null) return true;
        if (this.count === 0) return true;
        return false;
    }
    public isFull(): boolean {
        return this.count === 50;
    }

    public merge(stack_in: ItemStack): boolean {
        if (stack_in.item === null) return false;
        if (this.item === null) {
            // 完全转移
            this.item = stack_in.item;
            this.count = stack_in.count;
            stack_in.item = null;
            stack_in.count = 0;
            return true;
        }
        if (this.item.id != stack_in.item.id) return false;
        // 合并数量并处理溢出
        this.count += stack_in.count;
        stack_in.count = Math.max(this.count - 50, 0);
        this.count -= stack_in.count;
        return stack_in.isEmpty();
    }

    public split(stack_in: ItemStack, count: number): boolean {
        if (this.isEmpty()) return false;
        if (this.count < count) return false;
        stack_in.item = this.item;
        stack_in.count = count;
        this.count -= count;
        return true;
    }
}

export default ItemStack;