import type { BeltInstance } from "../instance/BeltInstance";
import type { MachineInstance } from "../instance/MachineInstance";
import { Recipes } from "./Recipe";


/**
 * 输入
 * @param b 
 * @param m 
 * @returns 该端口动作是否执行成功
 */
export function Storager_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const tail = b.inventory.getTail();
    if (tail === null) return false;
    for (const inv of m.inventory) {
        if (inv.isEmpty() || inv.isFull()) continue;
        if (inv.item === tail.item && b.inventory.extract(inv)) return true;
    }
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

export function furnance_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}


export function furnance_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function furnance_Work(m: MachineInstance): boolean {
    const recipe = Recipes.furnance_recipe;
    return true;
}

// 粉碎机接口
export function grinder_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function grinder_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function grinder_Work(m: MachineInstance): boolean {
    const recipe = Recipes.grinder_recipe;
    return true;
}

// 塑形机接口
export function shaper_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function shaper_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function shaper_Work(m: MachineInstance): boolean {
    const recipe = Recipes.shaper_recipes;
    return true;
}

// 配件机接口
export function component_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function component_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function component_Work(m: MachineInstance): boolean {
    const recipe = Recipes.component_recipe;
    return true;
}

// 种植机接口
export function planter_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function planter_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function planter_Work(m: MachineInstance): boolean {
    const recipe_soild = Recipes.planter_recipe_soild;
    const recipe_liquid = Recipes.planter_recipe_liquid;
    return true;
}

// 采种机接口
export function seedcollector_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function seedcollector_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function seedcollector_Work(m: MachineInstance): boolean {
    const recipe = Recipes.seed_collector_recipe;
    return true;
}

// 装备原件机接口
export function winder_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function winder_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function winder_Work(m: MachineInstance): boolean {
    const recipe = Recipes.winder_recipe;
    return true;
}

// 灌装机接口
export function fillingmachine_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function fillingmachine_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function fillingmachine_Work(m: MachineInstance): boolean {
    const recipe_basic = Recipes.filling_machine_recipe_basic;
    const recipe_liquid = Recipes.filling_machine_recipe_liquid;
    return true;
}

// 封装机接口
export function assemblymachine_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function assemblymachine_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function assemblymachine_Work(m: MachineInstance): boolean {
    const recipe = Recipes.assembly_machine_recipe;
    return true;
}

// 研磨机接口
export function thickener_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function thickener_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function thickener_Work(m: MachineInstance): boolean {
    const recipe = Recipes.thickener_recipe;
    return true;
}

// 反应池接口
export function mixpool_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function mixpool_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function mixpool_Work(m: MachineInstance): boolean {
    const recipe = Recipes.mix_pool_recipe;
    return true;
}

// 天有烘炉接口
export function xiraniteoven_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function xiraniteoven_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function xiraniteoven_Work(m: MachineInstance): boolean {
    const recipe = Recipes.xiranite_oven_recipe;
    return true;
}

// 拆解机接口
export function dismantler_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[0];
    if (b.inventory.extract(inv)) return true;
    return false;
}

export function dismantler_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = m.inventory[1];
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function dismantler_Work(m: MachineInstance): boolean {
    const recipe = Recipes.dismantler_recipe;
    return true;
}