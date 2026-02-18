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
    for (const inv of m.inventory) {
        if (inv.isFull()) continue;
        if (b.inventory.extract(inv)) return true;
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