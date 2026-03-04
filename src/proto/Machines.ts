import type { BeltInstance } from "../instance/BeltInstance";
import { portGroupInstance, portInstance, type MachineInstance } from "../instance/MachineInstance";
import EnumItemType from "../utils/EnumItemType";
import Vector2 from "../utils/Vector2";
import {
    belter_Work,
    single_in,
    single_out,
    basic_work,
    advance_work_2x1,
    advance_work_1x2
} from "./Actions";
import { imageAble } from "../utils/imageAble";
import EnumMachineLevel from "../utils/EnumMachineLevel";
import { Recipes } from "./Recipe";
import { Config } from "../utils/Config";
import { ItemStack } from "./ItemStack";


export class PortGroup {
    relpos: Vector2[];
    direction: number[];
    itemType: EnumItemType;
    isIn: boolean;
    length: number;
    callback: (beltInventory: BeltInstance | null, instance: MachineInstance) => boolean;

    constructor(relpos: Vector2[], direction: number[], itemType: EnumItemType, isIn: boolean, callback: (b: BeltInstance | null, m: MachineInstance) => boolean) {
        this.relpos = relpos;
        this.direction = direction;
        this.itemType = itemType;
        this.isIn = isIn;
        this.callback = callback;

        this.length = relpos.length;
        if (this.length !== direction.length) throw new Error("length not equal");
    }

    buildInstances(src: portGroupInstance, instance: MachineInstance): portInstance[] {
        const list: portInstance[] = []
        for (let i = 0; i < this.relpos.length; i++) {
            const transfromedRelPos = Vector2.linear(instance.R, this.relpos[i].x + 0.5, instance.D, this.relpos[i].y + 0.5);
            list.push(new portInstance(
                src,
                list.length,
                transfromedRelPos.addSelf(instance.left_top!),
                Vector2.toCW(this.direction[i], instance.rotation)
            ))
        }
        return list;
    }

}

interface InventoryConfig {
    type: EnumItemType;
    noIn: boolean;
    noOut: boolean;
    max: number;
    markOnly: boolean;
}

export class MachineMode {
    readonly id: string;
    readonly inventory: InventoryConfig[];
    readonly portGroups: PortGroup[];

    readonly recipe: any;
    working: (instance: MachineInstance) => boolean;
    constructor(id: string, storage: InventoryConfig[], ports: PortGroup[], recipe: any, working: (instance: MachineInstance) => boolean) {
        this.id = id;
        this.inventory = storage;
        this.portGroups = ports;
        this.recipe = recipe;
        this.working = working;
    }

    public static readonly soildMode: string = 'soildMode';
    public static readonly liquidMode: string = 'liquidMode';
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup(
                    [new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Furnance.in
                ),
                new PortGroup(
                    [new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Furnance.out
                )
            ],
            Recipes.furnance_recipe, Furnance.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Grinder.in
                ),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Grinder.out
                )
            ],
            Recipes.grinder_recipe, Grinder.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Shaper.in
                ),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Shaper.out
                )
            ],
            Recipes.shaper_recipes, Shaper.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Component.in
                ),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Component.out
                )
            ],
            Recipes.component_recipe, Component.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Planter.in_soild
                ),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Planter.out
                )
            ],
            Recipes.planter_recipe_soild, Planter.work
        ),
        new MachineMode(MachineMode.liquidMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Planter.in_soild
                ),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Planter.out
                ),
                new PortGroup([new Vector2(0, 2)],
                    [Vector2.LEFT_n],
                    EnumItemType.LIQUID, true, Planter.in_liquid
                )
            ],
            Recipes.planter_recipe_liquid, Planter.work
        )
    ]

    static in_soild(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static in_liquid(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Seedcollector.in
                ),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Seedcollector.out
                )
            ],
            Recipes.seed_collector_recipe, Seedcollector.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Winder.in
                ),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Winder.out
                )
            ],
            Recipes.winder_recipe, Winder.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, FillingMachine.in_soild
                ),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, FillingMachine.out
                )
            ],
            Recipes.filling_machine_recipe_basic, FillingMachine.work
        ),
        new MachineMode(MachineMode.liquidMode,
            [
                { type: EnumItemType.LIQUID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, FillingMachine.in_soild
                ),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, FillingMachine.out
                )
            ],
            Recipes.filling_machine_recipe_liquid, FillingMachine.work
        )
    ]

    static in_soild(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, AssemblyMachine.in
                ),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, AssemblyMachine.out
                )
            ],
            Recipes.assembly_machine_recipe, AssemblyMachine.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Thickener.in
                ),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Thickener.out
                )
            ],
            Recipes.thickener_recipe, Thickener.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, MixPool.in
                ),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, MixPool.out
                )
            ],
            Recipes.mix_pool_recipe, MixPool.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, XiraniteOven.in_soild
                ),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, XiraniteOven.out
                )
            ],
            Recipes.xiranite_oven_recipe, XiraniteOven.work
        )
    ]

    static in_soild(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return advance_work_2x1(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Dismantler.in
                ),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Dismantler.out
                )
            ],
            Recipes.dismantler_recipe, Dismantler.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return advance_work_1x2(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
    }
}

class Converter implements Machine {
    id = 'converter';
    img = new imageAble(this.id, '/icon_belt/bg_logistic_log_converger.png');
    width = 1;
    height = 1;
    powerArea = 0;
    levelType: EnumMachineLevel = EnumMachineLevel.LOGISTIC;

    modes = [
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)],
                    [Vector2.RIGHT_n, Vector2.DOWN_n, Vector2.LEFT_n],
                    EnumItemType.SOLID, true, Converter.in
                ),
                new PortGroup([new Vector2(0, 0)],
                    [Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Converter.out
                ),
            ],
            null, Converter.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        if (!m.timer._isWorking) m.timer.begin(Config.BeltSecond);
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

    constructor() {
        allMachines.set(this.id,this);
    }
}

class Splitter implements Machine {
    id = 'splitter';
    img = new imageAble(this.id, '/icon_belt/bg_logistic_log_splitter.png');
    width = 1;
    height = 1;
    powerArea = 0;
    levelType: EnumMachineLevel = EnumMachineLevel.LOGISTIC;

    modes = [
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0)],
                    [Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Splitter.in
                ),
                new PortGroup([new Vector2(0, 0), new Vector2(0, 0), new Vector2(0, 0)],
                    [Vector2.RIGHT_n, Vector2.DOWN_n, Vector2.LEFT_n],
                    EnumItemType.SOLID, false, Splitter.out
                )
            ],
            null, Splitter.work
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        if (!m.timer._isWorking) m.timer.begin(Config.BeltSecond);
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

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Storager.in
                ),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)],
                    [Vector2.DOWN_n, Vector2.DOWN_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Storager.out
                )
            ],
            null, (_) => true
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        if (b === null || b?.inventory === null) return false;
        const tail = b.inventory.getTail();
        if (tail === null) return false;
        for (const inv of m.inventory)
            if (!inv.isEmpty() && !inv.isFull() && inv.item === tail.item && b.inventory.extract(inv)) { return true; }
        for (const inv of m.inventory)
            if (!inv.isFull() && b.inventory.extract(inv)) return true;
        return false;
    }

    static out(b: BeltInstance | null, m: MachineInstance): boolean {
        if (b === null || b?.inventory === null) return false;
        for (const inv of m.inventory) {
            if (inv.isEmpty()) continue;
            if (b.inventory.insert(inv)) return true;
        }
        return false;
    }


    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(1, 0)],
                    [Vector2.UP_n],
                    EnumItemType.SOLID, true, Loader.in
                ),
            ],
            null, (_) => true
        )
    ]

    static in(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    constructor() {
        allMachines.set(this.id,this);
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
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(1, 0)],
                    [Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Unloader.out
                ),
            ],
            null, (_) => true
        )
    ]

    static out(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    constructor() {
        allMachines.set(this.id,this);
    }
}

class PowerDiffuser implements Machine {
    id = 'power_diffuser';
    img = new imageAble(this.id, '/icon_port/icon_port_power_diffuser_1.png');
    width = 2;
    height = 2;
    powerArea = 5;
    levelType: EnumMachineLevel = EnumMachineLevel.ELECTRIC;

    modes = [new MachineMode(MachineMode.soildMode, [], [], null, (_) => true)]

    constructor() {
        allMachines.set(this.id,this);
    }
}

class Connector implements Machine {
    id = 'connector';
    img = new imageAble(this.id, '/icon_belt/bg_logistic_log_connector.png');
    width = 1;
    height = 1;
    powerArea = 0;
    levelType: EnumMachineLevel = EnumMachineLevel.LOGISTIC;

    modes = [
        new MachineMode(MachineMode.soildMode,
            [
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 1, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 1, markOnly: false },
                { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 1, markOnly: false },
                { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 1, markOnly: false },
            ],
            [
                new PortGroup([new Vector2(0, 0), new Vector2(0, 0)],
                    [Vector2.RIGHT_n, Vector2.LEFT_n],
                    EnumItemType.SOLID, true, Connector.in_horizontal
                ),
                new PortGroup([new Vector2(0, 0), new Vector2(0, 0)],
                    [Vector2.RIGHT_n, Vector2.LEFT_n],
                    EnumItemType.SOLID, false, Connector.out_horizontal
                ),
                new PortGroup([new Vector2(0, 0), new Vector2(0, 0)],
                    [Vector2.UP_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, true, Connector.in_vertical
                ),
                new PortGroup([new Vector2(0, 0), new Vector2(0, 0)],
                    [Vector2.UP_n, Vector2.DOWN_n],
                    EnumItemType.SOLID, false, Connector.out_vertical
                ),
            ],
            null, belter_Work
        )
    ]

    static in_horizontal(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[0];
        return single_in(b, inv);
    }

    static out_horizontal(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[1];
        return single_out(b, inv);
    }

    static in_vertical(b: BeltInstance | null, m: MachineInstance): boolean {
        const inv = m.inventory[2];
        return single_in(b, inv);
    }

    static out_vertical(b: BeltInstance | null, m: MachineInstance) {
        const inv = m.inventory[3];
        return single_out(b, inv);
    }

    static work(m: MachineInstance): boolean {
        return basic_work(m, m.currentMode.recipe);
    }

    constructor() {
        allMachines.set(this.id,this);
    }
}

export const allMachines: Map<string, Machine> = new Map<string, Machine>();

export class MachineSet {
    static readonly Connector: Machine = new Connector();
    static readonly Converter: Machine = new Converter();
    static readonly Splitter: Machine = new Splitter();
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
}