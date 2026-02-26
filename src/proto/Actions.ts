import type { BeltInstance } from "../instance/BeltInstance";
import type { MachineInstance } from "../instance/MachineInstance";
import { Config } from "../utils/Config";
import EnumItemType from "../utils/EnumItemType";
import { itemsTostring } from "./Item";
import { ItemStack } from "./ItemStack";
import { MachineMode } from "./Machines";
import { Recipes, type BasicRecipe, type AdvanceRecipe2x1, type AdvanceRecipe1x2 } from "./Recipe";


function single_in(b: BeltInstance | null, inv: ItemStack) {
    if (b === null || b?.inventory === null) return false;
    return b.inventory.extract(inv);
}

function single_out(b: BeltInstance | null, inv: ItemStack) {
    if (b === null || b?.inventory === null) return false;
    return b.inventory.insert(inv);
}

function basic_work(m: MachineInstance, recipe: BasicRecipe): boolean {
    if (m.onPower === false && m.machine.prividePower < 0) return false;

    if (m.inventory[0].isEmpty()) {
        m.curRecipe = null;
        m.curInv = null;
        m.timer.reset();
        return false;
    }
    const inv = m.inventory[0].item;
    if (inv !== m.curInv) {
        m.curInv = inv;
        if (recipe.has(inv!)) m.curRecipe = recipe.get(inv!);
        else m.curRecipe = null;
        if (m.curRecipe) m.timer.begin(m.curRecipe.time);
        else m.timer.reset();
    }
    if (m.curRecipe && m.inventory[0].count >= m.curRecipe.count[0]) {
        if (m.timer.update(1)) {
            const newStack = new ItemStack(m.curRecipe.out, EnumItemType.SOLID, m.curRecipe.count[1]);
            const outStack = new ItemStack(null, EnumItemType.ANY, 0);
            m.inventory[1].merge(newStack);
            m.inventory[0].split(outStack, m.curRecipe.count[0]);
        }
    }
    else m.timer.toZero();
    return true;
}

function advance_work_2x1(m: MachineInstance, recipe: AdvanceRecipe2x1): boolean {
    if (m.onPower === false && m.machine.prividePower < 0) return false;

    if (m.inventory[0].isEmpty() || m.inventory[1].isEmpty()) {
        m.curRecipe = null;
        m.curInv = null;
        m.timer.reset();
        return false;
    }
    const inv: string = itemsTostring([m.inventory[0].item, m.inventory[1].item]);
    if (inv !== m.curInv) {
        m.curInv = inv;
        if (recipe.has(inv)) m.curRecipe = recipe.get(inv);
        else m.curRecipe = null;
        if (m.curRecipe) m.timer.begin(m.curRecipe.time);
        else m.timer.reset();
    }
    if (m.curRecipe && m.inventory[0].count >= m.curRecipe.count[0] && m.inventory[1].count >= m.curRecipe.count[1]) {
        if (m.timer.update(1)) {
            const newStack = new ItemStack(m.curRecipe.out, EnumItemType.SOLID, m.curRecipe.count[2]);
            const outStack1 = new ItemStack(null, EnumItemType.ANY, 0);
            const outStack2 = new ItemStack(null, EnumItemType.ANY, 0);
            m.inventory[2].merge(newStack);
            m.inventory[0].split(outStack1, m.curRecipe.count[0]);
            m.inventory[1].split(outStack2, m.curRecipe.count[1]);
        }
    }
    else m.timer.toZero();
    return true;
}

function advance_work_1x2(m: MachineInstance, recipe: AdvanceRecipe1x2): boolean {
    if (m.onPower === false && m.machine.prividePower < 0) return false;

    if (m.inventory[0].isEmpty()) {
        m.curRecipe = null;
        m.curInv = null;
        m.timer.reset();
        return false;
    }
    const inv = m.inventory[0].item;
    if (inv !== m.curInv) {
        m.curInv = inv;
        if (recipe.has(inv!)) m.curRecipe = recipe.get(inv!);
        else m.curRecipe = null;
        if (m.curRecipe) m.timer.begin(m.curRecipe.time);
        else m.timer.reset();
    }
    if (m.curRecipe && m.inventory[0].count >= m.curRecipe.count[0]) {
        if (m.timer.update(1)) {
            const [outItem1, outItem2] = m.curRecipe.out;
            const newStack1 = new ItemStack(outItem1, EnumItemType.SOLID, m.curRecipe.count[1]);
            const newStack2 = new ItemStack(outItem2, EnumItemType.LIQUID, m.curRecipe.count[2]);
            const outStack = new ItemStack(null, EnumItemType.ANY, 0);

            m.inventory[1].merge(newStack1);
            m.inventory[2].merge(newStack2);
            m.inventory[0].split(outStack, m.curRecipe.count[0]);
        }
    }
    else m.timer.toZero();
    return true;
}

/**
 * 输入
 * @param b 
 * @param m 
 * @returns 该端口动作是否执行成功
 */


export function belter_In(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function belter_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[1];
    return single_out(b, inv);
}

export function belter_Work(m: MachineInstance): boolean {
    if (!m.timer.isworking) m.timer.begin(Config.BeltSecond);
    if (m.inventory[0].isEmpty()) {
        m.timer.toZero();
        return false;
    }
    else {
        if (m.timer.update(1)) {
            m.inventory[1] = m.inventory[0];
            m.inventory[0] = new ItemStack(null, EnumItemType.SOLID, 0, 1);
        }
    }
    return true;
}


export function Loader_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const tmp = new ItemStack(null, EnumItemType.ANY, 0);
    return b.inventory.extract(tmp);
}

export function Unloader_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const inv = new ItemStack(m.inventory[0].item, EnumItemType.SOLID, 1);
    if (inv.isEmpty()) return false;
    if (b.inventory.insert(inv)) return true;
    return false;
}

export function Storager_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const tail = b.inventory.getTail();
    if (tail === null) return false;
    for (const inv of m.inventory)
        if (!inv.isEmpty() && !inv.isFull() && inv.item === tail.item && b.inventory.extract(inv)) { return true; }
    for (const inv of m.inventory)
        if (!inv.isFull() && b.inventory.extract(inv)) return true;
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
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function furnance_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[1];
    return single_out(b, inv);
}

export function furnance_Work(m: MachineInstance): boolean {
    const recipe = Recipes.furnance_recipe;
    return basic_work(m, recipe);
}

// 粉碎机接口
export function grinder_In(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function grinder_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[1];
    return single_out(b, inv);
}

export function grinder_Work(m: MachineInstance): boolean {
    const recipe = Recipes.grinder_recipe;
    return basic_work(m, recipe);
}

// 塑形机接口
export function shaper_In(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function shaper_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[1];
    return single_out(b, inv);
}

export function shaper_Work(m: MachineInstance): boolean {
    const recipe = Recipes.shaper_recipes;
    return basic_work(m, recipe);
}

// 配件机接口
export function component_In(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function component_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[1];
    return single_out(b, inv);
}

export function component_Work(m: MachineInstance): boolean {
    const recipe = Recipes.component_recipe;
    return basic_work(m, recipe);
}

// 种植机接口
export function planter_In_soild(b: BeltInstance | null, m: MachineInstance): boolean {
    if (m.currentMode.id === MachineMode.soildMode) {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }
    else {
        const inv = m.inventory[1];
        return single_in(b, inv);
    }
}

export function planter_In_liquid(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function planter_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    if (m.currentMode.id === MachineMode.soildMode) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }
    else {
        const inv = m.inventory[2];
        return single_out(b, inv);
    }
}

export function planter_Work(m: MachineInstance): boolean {
    const recipe_soild = Recipes.planter_recipe_soild;
    const recipe_liquid = Recipes.planter_recipe_liquid;
    if (m.currentMode.id === MachineMode.soildMode) return basic_work(m, recipe_soild);
    if (m.currentMode.id === MachineMode.liquidMode) return advance_work_2x1(m, recipe_liquid);
    return false;
}

// 采种机接口
export function seedcollector_In(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function seedcollector_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[1];
    return single_out(b, inv);
}

export function seedcollector_Work(m: MachineInstance): boolean {
    const recipe = Recipes.seed_collector_recipe;
    return basic_work(m, recipe);
}

// 装备原件机接口
export function winder_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const tail = b.inventory.getTail();
    if (tail === null) return false;
    const inv0 = m.inventory[0];
    const inv1 = m.inventory[1];
    if (!inv0.isEmpty() && !inv0.isFull() && inv0.item === tail.item) { return b.inventory.extract(inv0); }
    if (!inv1.isEmpty() && !inv0.isFull() && inv1.item === tail.item) { return b.inventory.extract(inv1); }
    if (!inv0.isFull() && b.inventory.extract(inv0)) return true;
    if (!inv1.isFull() && b.inventory.extract(inv1)) return true;
    return false;
}

export function winder_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[2];
    return single_out(b, inv);
}

export function winder_Work(m: MachineInstance): boolean {
    const recipe = Recipes.winder_recipe;
    return advance_work_2x1(m, recipe);
}

// 灌装机接口
export function fillingmachine_In_soild(b: BeltInstance | null, m: MachineInstance): boolean {
    if (m.currentMode.id === MachineMode.soildMode) {
        if (b === null || b?.inventory === null) return false;
        const tail = b.inventory.getTail();
        if (tail === null) return false;
        const inv0 = m.inventory[0];
        const inv1 = m.inventory[1];
        if (!inv0.isEmpty() && !inv0.isFull() && inv0.item === tail.item) { return b.inventory.extract(inv0); }
        if (!inv1.isEmpty() && !inv0.isFull() && inv1.item === tail.item) { return b.inventory.extract(inv1); }
        if (!inv0.isFull() && b.inventory.extract(inv0)) return true;
        if (!inv1.isFull() && b.inventory.extract(inv1)) return true;
        return false;
    }
    else {
        if (b === null || b?.inventory === null) return false;
        const inv = m.inventory[0];
        return b.inventory.extract(inv);
    }
}

export function fillingmachine_In_liquid(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);

}

export function fillingmachine_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[2];
    return single_out(b, inv);
}

export function fillingmachine_Work(m: MachineInstance): boolean {
    const recipe_basic = Recipes.filling_machine_recipe_basic;
    const recipe_liquid = Recipes.filling_machine_recipe_liquid;
    if (m.currentMode.id === MachineMode.soildMode) return advance_work_2x1(m, recipe_basic);
    if (m.currentMode.id === MachineMode.liquidMode) return advance_work_2x1(m, recipe_liquid);
    return false;
}

// 封装机接口
export function assemblymachine_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const tail = b.inventory.getTail();
    if (tail === null) return false;
    const inv0 = m.inventory[0];
    const inv1 = m.inventory[1];
    if (!inv0.isEmpty() && !inv0.isFull() && inv0.item === tail.item) { return b.inventory.extract(inv0); }
    if (!inv1.isEmpty() && !inv0.isFull() && inv1.item === tail.item) { return b.inventory.extract(inv1); }
    if (!inv0.isFull() && b.inventory.extract(inv0)) return true;
    if (!inv1.isFull() && b.inventory.extract(inv1)) return true;
    return false;
}

export function assemblymachine_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[2];
    return single_out(b, inv);
}

export function assemblymachine_Work(m: MachineInstance): boolean {
    const recipe = Recipes.assembly_machine_recipe;
    return advance_work_2x1(m, recipe);
}

// 研磨机接口
export function thickener_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const tail = b.inventory.getTail();
    if (tail === null) return false;
    const inv0 = m.inventory[0];
    const inv1 = m.inventory[1];
    if (!inv0.isEmpty() && !inv0.isFull() && inv0.item === tail.item) { return b.inventory.extract(inv0); }
    if (!inv1.isEmpty() && !inv0.isFull() && inv1.item === tail.item) { return b.inventory.extract(inv1); }
    if (!inv0.isFull() && b.inventory.extract(inv0)) return true;
    if (!inv1.isFull() && b.inventory.extract(inv1)) return true;
    return false;
}

export function thickener_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[2];
    return single_out(b, inv);
}

export function thickener_Work(m: MachineInstance): boolean {
    const recipe = Recipes.thickener_recipe;
    return advance_work_2x1(m, recipe);
}

// 反应池接口
export function mixpool_In(b: BeltInstance | null, m: MachineInstance): boolean {
    if (b === null || b?.inventory === null) return false;
    const tail = b.inventory.getTail();
    if (tail === null) return false;
    for (const inv of m.inventory)
        if (!inv.isEmpty() && !inv.isFull() && inv.item === tail.item && b.inventory.extract(inv)) { return true; }
    for (const inv of m.inventory)
        if (!inv.isFull() && b.inventory.extract(inv)) return true;
    return false;
}

export function mixpool_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[1];
    return single_out(b, inv);
}

export function mixpool_Work(m: MachineInstance): boolean {
    const recipe = Recipes.mix_pool_recipe;
    return advance_work_2x1(m, recipe);
}

// 天有烘炉接口
export function xiraniteoven_In_soild(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[1];
    return single_in(b, inv);
}

export function xiraniteoven_In_liquid(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function xiraniteoven_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[2];
    return single_out(b, inv);
}

export function xiraniteoven_Work(m: MachineInstance): boolean {
    const recipe = Recipes.xiranite_oven_recipe;
    return advance_work_2x1(m, recipe);
}

// 拆解机接口
export function dismantler_In(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv = m.inventory[0];
    return single_in(b, inv);
}

export function dismantler_Out(b: BeltInstance | null, m: MachineInstance): boolean {
    const inv0 = m.inventory[1];
    const inv1 = m.inventory[2];
    return single_out(b, inv0) || single_out(b, inv1);
}

export function dismantler_Work(m: MachineInstance): boolean {
    const recipe = Recipes.dismantler_recipe;
    return advance_work_1x2(m, recipe);
}