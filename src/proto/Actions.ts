import type { BeltInstance } from "../instance/BeltInstance";
import type { MachineInstance } from "../instance/MachineInstance";


/**
 * 输入
 * @param b 
 * @param m 
 * @returns 该端口动作是否执行成功
 */
export function Storager_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const stack = b.inventory.tailInventory();
    if (stack === null) return false;
    for (const inv of m.inventory) {
        inv.merge(stack);
        if (stack.isEmpty()) return true;
    }
    return false;
}


export function Storager_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    for (const inv of m.inventory) {
        if (inv.isEmpty()) continue;
        if (b.inventory.insert(inv)) return true;
    }
    return false;
}