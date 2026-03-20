import { portGroupInstance, portInstance, WorkTimer, type MachineInstance } from "../instance/MachineInstance";
import EnumItemType from "../utils/EnumItemType";
import Array2d from "../utils/Array2d";
import {
    basic_work,
    advance_work_2x1,
    advance_work_1x2
} from "./Actions";
import { imageAble } from "../utils/imageAble";
import EnumMachineLevel from "../utils/EnumMachineLevel";
import { Recipes } from "./Recipe";
import { ItemStack } from "./ItemStack";
import { Item, itemsTostring } from "./Item";

const in_default = (_: ItemStack, __: MachineInstance) => false;
const out_default = (_: MachineInstance) => ItemStack.EMPTY;


export class PortGroup {
    relpos: Array2d[];
    direction: number[];
    itemType: EnumItemType;
    isIn: boolean;
    length: number;
    callback_in: (stack: ItemStack, instance: MachineInstance) => boolean;
    callback_out: (instance: MachineInstance) => ItemStack;

    constructor(relpos: Array2d[],
        direction: number[],
        itemType: EnumItemType,
        isIn: boolean,
        callback_in: (stack: ItemStack, m: MachineInstance) => boolean,
        callback_out: (instance: MachineInstance) => ItemStack) {
        this.relpos = relpos;
        this.direction = direction;
        this.itemType = itemType;
        this.isIn = isIn;
        this.callback_in = callback_in;
        this.callback_out = callback_out;

        this.length = relpos.length;
        if (this.length !== direction.length) throw new Error("length not equal");
    }

    buildInstances(src: portGroupInstance, instance: MachineInstance): portInstance[] {
        const list: portInstance[] = []
        for (let i = 0; i < this.relpos.length; i++) {
            const transfromedRelPos = Array2d.linear(instance.R, this.relpos[i].x + 0.5, instance.D, this.relpos[i].y + 0.5);
            list.push(new portInstance(
                src,
                list.length,
                transfromedRelPos.addSelf(instance.left_top!),
                Array2d.toCW(this.direction[i], instance.rotation)
            ))
        }
        return list;
    }

}

export interface InventoryConfig {
    type: EnumItemType;
    noIn: boolean;
    noOut: boolean;
    max: number;
    markOnly: boolean;
}

export class MachineMode {
    readonly name: string;
    readonly inventory: InventoryConfig[];
    readonly portGroups: PortGroup[];

    readonly recipe: Map<any, any>;
    working: (instance: MachineInstance) => boolean;
    constructor(
        name: string,
        storage: InventoryConfig[],
        ports: PortGroup[],
        recipe: any,
        working: (instance: MachineInstance) => boolean) {
        this.name = name;
        this.inventory = storage;
        this.portGroups = ports;
        this.recipe = recipe;
        this.working = working;
    }
}

export interface Machine {
    id: string;
    img: imageAble;

    width: number;
    height: number;
    powerArea: number;
    levelType: EnumMachineLevel;

    modes: MachineMode[];
}

class Furnance implements Machine {
    id = 'furnance';
    img = new imageAble(this.id, '/icon_port/icon_port_furnance_1.png');
    width = 3;
    height = 3;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.BASIC;

    modes = [
        new MachineMode(
            'soild',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup(
                    [new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Furnance.in,
                    out_default
                ),
                new PortGroup(
                    [new Array2d(0, 2), new Array2d(1, 2), new Array2d(2, 2)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Furnance.out
                )
            ],
            Recipes.furnance_recipe, Furnance.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return inv.merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[1];
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Grinder implements Machine {
    id = 'grinder';
    img = new imageAble(this.id, '/icon_port/icon_port_grinder_1.png');
    width = 3;
    height = 3;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.BASIC;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Grinder.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 2), new Array2d(1, 2), new Array2d(2, 2)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Grinder.out
                )
            ],
            Recipes.grinder_recipe, Grinder.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return inv.merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[1];
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Shaper implements Machine {
    id = 'shaper';
    img = new imageAble(this.id, '/icon_port/icon_port_shaper_1.png');
    width = 3;
    height = 3;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.BASIC;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Shaper.in,
                    out_default

                ),
                new PortGroup([new Array2d(0, 2), new Array2d(1, 2), new Array2d(2, 2)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Shaper.out
                )
            ],
            Recipes.shaper_recipes, Shaper.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return inv.merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[1];
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Component implements Machine {
    id = 'component';
    img = new imageAble(this.id, '/icon_port/icon_port_cmpt_mc_1.png');
    width = 3;
    height = 3;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.BASIC;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Component.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 2), new Array2d(1, 2), new Array2d(2, 2)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Component.out
                )
            ],
            Recipes.component_recipe, Component.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return inv.merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[1];
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Planter implements Machine {
    id = 'planter';
    img = new imageAble(this.id, '/icon_port/icon_port_planter_1.png');
    width = 5;
    height = 5;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.BASIC;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Planter.in_soild,
                    out_default
                ),
                new PortGroup([new Array2d(0, 4), new Array2d(1, 4), new Array2d(2, 4), new Array2d(3, 4), new Array2d(4, 4)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Planter.out
                )
            ],
            Recipes.planter_recipe_soild, Planter.work
        ),
        new MachineMode(
            'liquid',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Planter.in_soild,
                    out_default
                ),
                new PortGroup([new Array2d(0, 4), new Array2d(1, 4), new Array2d(2, 4), new Array2d(3, 4), new Array2d(4, 4)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Planter.out
                ),
                new PortGroup([new Array2d(0, 2)],
                    [Array2d.LEFT_n],
                    EnumItemType.LIQUID, true,
                    Planter.in_liquid,
                    out_default
                )
            ],
            Recipes.planter_recipe_liquid, Planter.work
        )
    ]

    static in_soild(stack: ItemStack, m: MachineInstance): boolean {
        const inv = m.inventory[m.currentMode.name === 'normal' ? 0 : 1];
        return inv.merge(stack);
    }

    static in_liquid(stack: ItemStack, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return inv.merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        const inv = m.inventory[m.currentMode.name === 'normal' ? 1 : 2];
        return inv;
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Seedcollector implements Machine {
    id = 'seedcollector';
    img = new imageAble(this.id, '/icon_port/icon_port_seedcol_1.png');
    width = 5;
    height = 5;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.BASIC;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Seedcollector.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 4), new Array2d(1, 4), new Array2d(2, 4), new Array2d(3, 4), new Array2d(4, 4)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Seedcollector.out
                )
            ],
            Recipes.seed_collector_recipe, Seedcollector.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return inv.merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[1];
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Winder implements Machine {
    id = 'winder';
    img = new imageAble(this.id, '/icon_port/icon_port_winder_1.png');
    width = 6;
    height = 4;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.ADVANCED;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0), new Array2d(5, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Winder.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 3), new Array2d(1, 3), new Array2d(2, 3), new Array2d(3, 3), new Array2d(4, 3), new Array2d(5, 3)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Winder.out
                )
            ],
            Recipes.winder_recipe, Winder.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        return m.inventory[0].merge(stack) || m.inventory[1].merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        const inv = m.inventory[2];
        return inv;
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class FillingMachine implements Machine {
    id = 'fillingmachine';
    img = new imageAble(this.id, '/icon_port/icon_port_filling_pd_mc_1.png');
    width = 6;
    height = 4;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.ADVANCED;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0), new Array2d(5, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    FillingMachine.in_soild,
                    out_default
                ),
                new PortGroup([new Array2d(0, 3), new Array2d(1, 3), new Array2d(2, 3), new Array2d(3, 3), new Array2d(4, 3), new Array2d(5, 3)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    FillingMachine.out
                )
            ],
            Recipes.filling_machine_recipe_basic, FillingMachine.work
        ),
        new MachineMode(
            'liquid',
            [
                { type: EnumItemType.LIQUID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0), new Array2d(5, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    FillingMachine.in_soild,
                    out_default
                ),
                new PortGroup([new Array2d(0, 3), new Array2d(1, 3), new Array2d(2, 3), new Array2d(3, 3), new Array2d(4, 3), new Array2d(5, 3)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    FillingMachine.out
                )
            ],
            Recipes.filling_machine_recipe_liquid, FillingMachine.work
        )
    ]

    static in_soild(stack: ItemStack, m: MachineInstance): boolean {
        if (m.currentMode.name == 'normal')
            return m.inventory[0].merge(stack) || m.inventory[1].merge(stack);
        else
            return m.inventory[1].merge(stack);
    }

    static in_liquid(stack: ItemStack, m: MachineInstance): boolean {
        return m.inventory[0].merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[2];
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class AssemblyMachine implements Machine {
    id = 'assemblymachine';
    img = new imageAble(this.id, '/icon_port/icon_port_tools_asm_mc_1.png');
    width = 6;
    height = 4;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.ADVANCED;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0), new Array2d(5, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    AssemblyMachine.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 3), new Array2d(1, 3), new Array2d(2, 3), new Array2d(3, 3), new Array2d(4, 3), new Array2d(5, 3)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    AssemblyMachine.out
                )
            ],
            Recipes.assembly_machine_recipe, AssemblyMachine.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        return m.inventory[0].merge(stack) || m.inventory[1].merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[2];
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Thickener implements Machine {
    id = 'thickener';
    img = new imageAble(this.id, '/icon_port/icon_port_thickener_1.png');
    width = 6;
    height = 4;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.ADVANCED;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0), new Array2d(5, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Thickener.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 3), new Array2d(1, 3), new Array2d(2, 3), new Array2d(3, 3), new Array2d(4, 3), new Array2d(5, 3)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Thickener.out
                )
            ],
            Recipes.thickener_recipe, Thickener.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        return m.inventory[0].merge(stack) || m.inventory[1].merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[2];
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class MixPool implements Machine {
    id = 'mixpool';
    img = new imageAble(this.id, '/icon_port/icon_port_mix_pool_1.png');
    width = 5;
    height = 5;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.ADVANCED;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },

                { type: EnumItemType.LIQUID, noIn: false, noOut: false, max: 0, markOnly: true },
                { type: EnumItemType.LIQUID, noIn: false, noOut: false, max: 0, markOnly: true },
                { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 0, markOnly: true }
            ],
            [
                new PortGroup([new Array2d(1, 0), new Array2d(3, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    MixPool.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 1), new Array2d(0, 3)],
                    [Array2d.RIGHT_n, Array2d.RIGHT_n],
                    EnumItemType.LIQUID, true,
                    MixPool.in,
                    out_default
                ),
                new PortGroup([new Array2d(1, 4), new Array2d(3, 4)],
                    [Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    MixPool.out_s
                ),
                new PortGroup([new Array2d(4, 1)],
                    [Array2d.RIGHT_n],
                    EnumItemType.LIQUID, false,
                    in_default,
                    MixPool.out_l1
                ),
                new PortGroup([new Array2d(4, 3)],
                    [Array2d.RIGHT_n],
                    EnumItemType.LIQUID, false,
                    in_default,
                    MixPool.out_l2
                ),
            ],
            Recipes.mix_pool_recipe, MixPool.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        for (const inv of m.inventory)
            if (!inv.isEmpty()) inv.merge(stack);
        if (stack.isEmpty()) return true;
        for (const inv of m.inventory)
            if (inv.isEmpty()) { inv.merge(stack); return true; }
        return false;
    }

    static out_s(m: MachineInstance): ItemStack {
        for (const inv of m.inventory)
            if (inv.item === m.inventory[7].item) return inv;
        return ItemStack.EMPTY;
    }

    static out_l1(m: MachineInstance): ItemStack {
        for (const inv of m.inventory)
            if (inv.item === m.inventory[5].item) return inv;
        return ItemStack.EMPTY;
    }

    static out_l2(m: MachineInstance): ItemStack {
        for (const inv of m.inventory)
            if (inv.item === m.inventory[6].item) return inv;
        return ItemStack.EMPTY;
    }

    static readonly timer1: number[] = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3];
    static readonly timer2: number[] = [1, 2, 3, 4, 2, 3, 4, 3, 4, 4];

    static work(m: MachineInstance): boolean {
        const recipe = m.currentMode.recipe;
        if (m.onPower === false && m.machine.powerArea < 0) return false;
        if (m.tmp_timers.length === 0) m.tmp_timers = Array.from({ length: 10 }, () => new WorkTimer());
        for (let i = 0; i < m.tmp_timers.length; i++) {   // 每个计时器独立计算库存
            const timer = m.tmp_timers[i];
            const stack1 = m.inventory[MixPool.timer1[i]];
            const stack2 = m.inventory[MixPool.timer2[i]];
            if (stack1.isEmpty() || stack2.isEmpty()) continue;
            const inv: string = itemsTostring([stack1.item, stack2.item]);

            if (inv !== timer.input) {
                if (recipe.has(inv)) {
                    const r = recipe.get(inv)!;
                    timer.begin(inv, r.out, r.count, r.time);
                }
                else timer.reset();
            }

            if (timer.isWorking && (timer.out instanceof Item) && timer.count &&
                stack1.count >= timer.count[0] && stack2.count >= timer.count[1]) {
                const item = m.inventory[timer._outID].item;    // 若预定出口被占用
                if (item && item !== timer.out) {
                    for (let k = 0; k < m.inventory.length; k++) {
                        const item = m.inventory[k].item;
                        if (item === null || item === timer.out) { timer._outID = k; break; }
                    }
                }
                if (item && item !== timer.out) { timer.toZero(); continue; }   // 找不到新出口，重置

                const outItem = timer.out as Item;
                if (timer.update_cyclic(1)) {
                    const newStack = new ItemStack(outItem, EnumItemType.ANY, timer.count[2]);
                    const outStack1 = new ItemStack(null, EnumItemType.ANY, 0);
                    const outStack2 = new ItemStack(null, EnumItemType.ANY, 0);
                    m.inventory[timer._outID].merge(newStack);
                    stack1.split(outStack1, timer.count[0]);
                    stack2.split(outStack2, timer.count[1]);
                }
            }
            else timer.toZero();
        }


        return true;
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class XiraniteOven implements Machine {
    id = 'xiraniteoven';
    img = new imageAble(this.id, '/icon_port/icon_port_xiranite_oven_1.png');
    width = 5;
    height = 5;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.ADVANCED;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.LIQUID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    XiraniteOven.in_soild,
                    out_default
                ),
                new PortGroup([new Array2d(2, 0)],
                    [Array2d.RIGHT_n],
                    EnumItemType.LIQUID, true,
                    XiraniteOven.in_liquid,
                    out_default
                ),
                new PortGroup([new Array2d(0, 4), new Array2d(1, 4), new Array2d(2, 4), new Array2d(3, 4), new Array2d(4, 4)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    XiraniteOven.out
                )
            ],
            Recipes.xiranite_oven_recipe, XiraniteOven.work
        )
    ]

    static in_soild(stack: ItemStack, m: MachineInstance): boolean {
        return m.inventory[1].merge(stack);
    }

    static in_liquid(stack: ItemStack, m: MachineInstance): boolean {
        return m.inventory[0].merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[2];
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Dismantler implements Machine {
    id = 'dismantler';
    img = new imageAble(this.id, '/icon_port/icon_port_dismantler_1.png');
    width = 6;
    height = 4;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.ADVANCED;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0), new Array2d(3, 0), new Array2d(4, 0), new Array2d(5, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Dismantler.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 3), new Array2d(1, 3), new Array2d(2, 3), new Array2d(3, 3), new Array2d(4, 3), new Array2d(5, 3)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Dismantler.out
                )
            ],
            Recipes.dismantler_recipe, Dismantler.work
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return inv.merge(stack);
    }

    static out(m: MachineInstance): ItemStack {
        return m.inventory[1];
    }

    static work(m: MachineInstance): boolean {
        return advance_work_1x2(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Storager implements Machine {
    id = 'storager';
    img = new imageAble(this.id, '/icon_port/icon_port_storager_1.png');
    width = 3;
    height = 3;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.STORAGE;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Array2d(0, 0), new Array2d(1, 0), new Array2d(2, 0)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, true,
                    Storager.in,
                    out_default
                ),
                new PortGroup([new Array2d(0, 2), new Array2d(1, 2), new Array2d(2, 2)],
                    [Array2d.DOWN_n, Array2d.DOWN_n, Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Storager.out
                )
            ],
            null, (_) => true
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        for (const inv of m.inventory)
            if (!inv.isEmpty()) inv.merge(stack);
        if (stack.isEmpty()) return true;
        for (const inv of m.inventory)
            if (inv.isEmpty()) { inv.merge(stack); return true; }
        return false;
    }

    static out(m: MachineInstance): ItemStack {
        for (const inv of m.inventory)
            if (!inv.isEmpty()) return inv;
        return ItemStack.EMPTY;
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Loader implements Machine {
    id = 'loader';
    img = new imageAble(this.id, '/icon_port/icon_port_loader_1.png');
    width = 3;
    height = 1;
    powerArea = 0;
    levelType: EnumMachineLevel = EnumMachineLevel.STORAGE;

    modes = [
        new MachineMode(
            'normal',
            [],
            [
                new PortGroup([new Array2d(1, 0)],
                    [Array2d.UP_n],
                    EnumItemType.SOLID, true,
                    Loader.in,
                    out_default
                ),
            ],
            null, (_) => true
        )
    ]

    static in(stack: ItemStack, m: MachineInstance): boolean {
        const tmp = new ItemStack(null, EnumItemType.ANY, 0, 50);
        return tmp.merge(stack);
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Unloader implements Machine {
    id = 'unloader';
    img = new imageAble(this.id, '/icon_port/icon_port_unloader_1.png');
    width = 3;
    height = 1;
    powerArea = 0;
    levelType: EnumMachineLevel = EnumMachineLevel.STORAGE;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 0, markOnly: true },
            ],
            [
                new PortGroup([new Array2d(1, 0)],
                    [Array2d.DOWN_n],
                    EnumItemType.SOLID, false,
                    in_default,
                    Unloader.out
                ),
            ],
            null, (_) => true
        )
    ]

    static out(m: MachineInstance): ItemStack {
        const inv = new ItemStack(m.inventory[0].item, EnumItemType.SOLID, 1);
        return inv;
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

class PowerDiffuser implements Machine {
    id = 'power_diffuser';
    img = new imageAble(this.id, '/icon_port/icon_port_power_diffuser_1.png');
    width = 2;
    height = 2;
    powerArea = 5;
    levelType: EnumMachineLevel = EnumMachineLevel.ELECTRIC;

    modes = [new MachineMode('None', [], [], null, (_) => true)]

    constructor() {
        allMachines.set(this.id, this);
    }
}

class Pump implements Machine {
    id = 'pump';
    img = new imageAble(this.id, '/icon_port/icon_port_pump_1.png');
    width = 3;
    height = 3;
    powerArea = -1;
    levelType: EnumMachineLevel = EnumMachineLevel.BASIC;

    modes = [
        new MachineMode(
            'normal',
            [
                { type: EnumItemType.LIQUID, noIn: false, noOut: true, max: 0, markOnly: true },
                { type: EnumItemType.LIQUID, noIn: true, noOut: false, max: 50, markOnly: false }
            ],
            [
                new PortGroup(
                    [new Array2d(2, 1)],
                    [Array2d.RIGHT_n],
                    EnumItemType.LIQUID, false,
                    in_default,
                    Pump.out
                ),
            ],
            null, Pump.work
        )
    ];

    static out(m: MachineInstance): ItemStack {
        const inv = m.inventory[0];
        return inv;
    }

    static work(m: MachineInstance): boolean {
        if (m.onPower === false && m.machine.powerArea < 0) return false;

        const item = m.inventory[0].item;
        if (m.inventory[1].item && item !== m.inventory[1].item) {
            m.inventory[1].clear();
            m.timer.toZero();
            return true;
        }

        if (!m.timer.isWorking) m.timer.begin(null, null, null, 2);

        if (m.timer.update_cyclic(1)) {
            const newStack = new ItemStack(item, EnumItemType.LIQUID, 2);
            m.inventory[1].merge(newStack);
        }
        return true;
    }

    constructor() {
        allMachines.set(this.id, this);
    }
}

export const allMachines: Map<string, Machine> = new Map<string, Machine>();

export class MachineSet {
    static readonly Storager: Machine = new Storager();
    static readonly Loader: Machine = new Loader();
    static readonly Unloader: Machine = new Unloader();
    static readonly PowerDiffuser: Machine = new PowerDiffuser();
    static readonly Furnance: Machine = new Furnance();
    static readonly Grinder: Machine = new Grinder();
    static readonly Shaper: Machine = new Shaper();
    static readonly Component: Machine = new Component();
    static readonly Planter: Machine = new Planter();
    static readonly Seedcollector: Machine = new Seedcollector();
    static readonly Winder: Machine = new Winder();
    static readonly FillingMachine: Machine = new FillingMachine();
    static readonly AssemblyMachine: Machine = new AssemblyMachine();
    static readonly Thickener: Machine = new Thickener();
    static readonly MixPool: Machine = new MixPool();
    static readonly XiraniteOven: Machine = new XiraniteOven();
    static readonly Dismantler: Machine = new Dismantler();
    static readonly Pump: Machine = new Pump();
}