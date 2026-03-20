import type { MachineInstance } from "../instance/MachineInstance";
import EnumItemType from "../utils/EnumItemType";
import { Item, itemsTostring } from "./Item";
import { ItemStack } from "./ItemStack";
import { type BasicRecipe, type AdvanceRecipe2x1, type AdvanceRecipe1x2 } from "./Recipe";

export function basic_work(m: MachineInstance, recipe: BasicRecipe): boolean {
    if (m.onPower === false && m.machine.powerArea < 0) return false;

    if (m.inventory[0].isEmpty()) {
        m.timer.reset();
        return false;
    }
    const inv = m.inventory[0].item;
    if (inv && inv !== m.timer.input) {
        if (recipe.has(inv)) {
            const r = recipe.get(inv)!;
            m.timer.begin(inv, r.out, r.count, r.time);
        }
        else m.timer.reset();
    }
    if (m.timer.isWorking && m.timer.out && m.timer.count && m.inventory[0].count >= m.timer.count[0]) {
        if (m.timer.update_cyclic(1)) {
            const outItem = m.timer.out as Item;
            const newStack = new ItemStack(outItem, EnumItemType.SOLID, m.timer.count[1]);
            const outStack = new ItemStack(null, EnumItemType.ANY, 0);
            m.inventory[1].merge(newStack);
            m.inventory[0].split(outStack, m.timer.count[0]);
        }
    }
    else m.timer.toZero();
    return true;
}

export function advance_work_2x1(m: MachineInstance, recipe: AdvanceRecipe2x1): boolean {
    if (m.onPower === false && m.machine.powerArea < 0) return false;

    if (m.inventory[0].isEmpty() || m.inventory[1].isEmpty()) {
        m.timer.reset();
        return false;
    }
    const inv: string = itemsTostring([m.inventory[0].item, m.inventory[1].item]);
    if (inv !== m.timer.input) {
        if (recipe.has(inv)) {
            const r = recipe.get(inv)!;
            m.timer.begin(inv, r.out, r.count, r.time);
        }
        else m.timer.reset();
    }
    if (m.timer.isWorking && m.timer.out && m.timer.count && m.inventory[0].count >= m.timer.count[0] && m.inventory[1].count >= m.timer.count[1]) {
        if (m.timer.update_cyclic(1)) {
            const outItem = m.timer.out as Item;
            const newStack = new ItemStack(outItem, EnumItemType.SOLID, m.timer.count[2]);
            const outStack1 = new ItemStack(null, EnumItemType.ANY, 0);
            const outStack2 = new ItemStack(null, EnumItemType.ANY, 0);
            m.inventory[2].merge(newStack);
            m.inventory[0].split(outStack1, m.timer.count[0]);
            m.inventory[1].split(outStack2, m.timer.count[1]);
        }
    }
    else m.timer.toZero();
    return true;
}

export function advance_work_1x2(m: MachineInstance, recipe: AdvanceRecipe1x2): boolean {
    if (m.onPower === false && m.machine.powerArea < 0) return false;

    if (m.inventory[0].isEmpty()) {
        m.timer.reset();
        return false;
    }
    const inv = m.inventory[0].item;
    if (inv && inv !== m.timer.input) {
        if (recipe.has(inv)) {
            const r = recipe.get(inv)!;
            m.timer.begin(inv, r.out, r.count, r.time);
        }
        else m.timer.reset();
    }
    if (m.timer.isWorking && m.timer.out && m.timer.count && m.inventory[0].count >= m.timer.count[0]) {
        if (m.timer.update_cyclic(1)) {
            const [outItem1, outItem2] = m.timer.out as [Item, Item];
            const newStack1 = new ItemStack(outItem1, EnumItemType.SOLID, m.timer.count[1]);
            const newStack2 = new ItemStack(outItem2, EnumItemType.LIQUID, m.timer.count[2]);
            const outStack = new ItemStack(null, EnumItemType.ANY, 0);

            m.inventory[1].merge(newStack1);
            m.inventory[2].merge(newStack2);
            m.inventory[0].split(outStack, m.timer.count[0]);
        }
    }
    else m.timer.toZero();
    return true;
}


