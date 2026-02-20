import type { BeltInstance } from "../instance/BeltInstance";
import { portInstance, type MachineInstance } from "../instance/MachineInstance";
import EnumItemType from "../utils/EnumItemType";
import { EnumInventoryType } from "../utils/EnumInventoryType";
import Vector2 from "../utils/Vector2";
import {
    furnance_Work,
    furnance_In,
    furnance_Out,
    grinder_Work,
    grinder_In,
    grinder_Out,
    shaper_Work,
    shaper_In,
    shaper_Out,
    component_Work,
    component_In,
    component_Out,
    planter_Work,
    planter_In_soild,
    planter_Out,
    seedcollector_Work,
    seedcollector_In,
    seedcollector_Out,
    winder_Work,
    winder_In,
    winder_Out,
    fillingmachine_Work,
    fillingmachine_In_soild,
    fillingmachine_Out,
    assemblymachine_Work,
    assemblymachine_In,
    assemblymachine_Out,
    thickener_Work,
    thickener_In,
    thickener_Out,
    mixpool_Work,
    mixpool_In,
    mixpool_Out,
    xiraniteoven_Work,
    xiraniteoven_In_soild,
    xiraniteoven_Out,
    dismantler_Work,
    dismantler_In,
    dismantler_Out,
    Storager_In,
    Storager_Out,
    planter_In_liquid
} from "./Actions";


export class PortGroup {
    relpos: Vector2[];
    direction: Vector2[];
    itemType: EnumItemType;
    isIn: boolean;
    length: number;
    callback: (beltInventory: BeltInstance | null, instance: MachineInstance) => boolean;

    constructor(relpos: Vector2[], direction: Vector2[], itemType: EnumItemType, isIn: boolean, callback: (b: BeltInstance | null, m: MachineInstance) => boolean) {
        this.relpos = relpos;
        this.direction = direction;
        this.itemType = itemType;
        this.isIn = isIn;
        this.callback = callback;

        this.length = relpos.length;
        if (this.length !== direction.length) throw new Error("length not equal");
    }

    buildInstances(instance: MachineInstance): portInstance[] {
        const list: portInstance[] = []
        for (let i = 0; i < this.relpos.length; i++) {
            const transfromedRelPos = Vector2.linear(instance.R, this.relpos[i].x + 0.5, instance.D, this.relpos[i].y + 0.5);
            list.push(new portInstance(
                instance,
                this,
                transfromedRelPos.addSelf(instance.left_top!),
                this.direction[i].rotateCW(instance.rotation)
            ))
        }
        return list;
    }

}

export class MachineMode {
    readonly id: string;
    readonly inventory: EnumInventoryType;
    readonly portGroups: PortGroup[];

    working: (instance: MachineInstance) => boolean;
    constructor(id: string, storage: EnumInventoryType, ports: PortGroup[], working: (instance: MachineInstance) => boolean = (_: MachineInstance) => true) {
        this.id = id;
        this.inventory = storage;
        this.portGroups = ports;
        this.working = working;
    }

    public static readonly soildMode: string = 'soildMode';
    public static readonly liquidMode: string = 'liquidMode';

    public static readonly dafultMode: MachineMode = new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_None, []);
}

export class Machine {
    id: string;
    imgCache: HTMLImageElement;
    bitmapCache: ImageBitmap | null = null;

    width: number;
    height: number;

    modes: MachineMode[] = [];

    constructor(id: string, imgsrc: string, width: number = 3, height: number = 3, modes: MachineMode[] = [MachineMode.dafultMode]) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.modes = modes;

        const img = document.createElement('img');
        img.src = imgsrc;
        img.alt = id;
        img.style.width = '70%';
        img.style.height = '70%';
        img.style.objectFit = 'contain';
        this.imgCache = img;

        // 异步创建ImageBitmap
        this.createImageBitmap(imgsrc);

        Machine.allMachines.set(id, this);
    }

    // 创建ImageBitmap的异步方法
    private async createImageBitmap(imgsrc: string) {
        try {
            const response = await fetch(imgsrc);
            const blob = await response.blob();
            this.bitmapCache = await createImageBitmap(blob);
            console.log(`ImageBitmap created for ${this.id}`);
        } catch (error) {
            console.error(`Failed to create ImageBitmap for ${this.id}:`, error);
        }
    }

    // 获取图片资源的方法（优先返回ImageBitmap）
    public getImageResource(): HTMLImageElement | ImageBitmap | null {
        return this.bitmapCache || this.imgCache;
    }

    public static allMachines: Map<string, Machine> = new Map();

    // public static readonly Cannon1: Machine = new Machine('cannon1', '/icon_port/icon_port_battle_cannon_1.png');
    // public static readonly Connon2: Machine = new Machine('cannon2', '/icon_port/icon_port_battle_cannon_2.png');

    // 存储箱
    public static readonly Storager: Machine = new Machine('storager', '/icon_port/icon_port_storager_1.png', 3, 3,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_6, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, Storager_In),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, Storager_Out)
            ])
        ]
    );


    // 精炼炉
    public static readonly Furnance: Machine = new Machine('furnance', '/icon_port/icon_port_furnance_1.png', 3, 3,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, furnance_In),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, furnance_Out)
            ], furnance_Work)
        ]
    );
    // 粉碎机
    public static readonly Grinder: Machine = new Machine('grinder', '/icon_port/icon_port_grinder_1.png', 3, 3,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, grinder_In),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, grinder_Out)
            ], grinder_Work)
        ]
    );
    // 塑形机
    public static readonly Shaper: Machine = new Machine('shaper', '/icon_port/icon_port_shaper_1.png', 3, 3,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, shaper_In),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, shaper_Out)
            ], shaper_Work)
        ]
    );
    // 配件机
    public static readonly Component: Machine = new Machine('component', '/icon_port/icon_port_cmpt_mc_1.png', 3, 3,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, component_In),
                new PortGroup([new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, component_Out)
            ], component_Work)
        ]
    );
    // 种植机
    public static readonly Planter: Machine = new Machine('planter', '/icon_port/icon_port_planter_1.png', 5, 5,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, planter_In_soild),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, planter_Out)
            ], planter_Work),
            new MachineMode(MachineMode.liquidMode, EnumInventoryType.Storage_2x1_liquid_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, planter_In_soild),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, planter_Out),
                new PortGroup([new Vector2(0, 2)], [Vector2.LEFT], EnumItemType.LIQUID, true, planter_In_liquid)
            ], planter_Work)
        ]
    );
    // 采种机
    public static readonly Seedcollector: Machine = new Machine('seedcollector', '/icon_port/icon_port_seedcol_1.png', 5, 5,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, seedcollector_In),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, seedcollector_Out)
            ], seedcollector_Work)
        ]
    );

    // 装备原件机
    public static readonly Winder: Machine = new Machine('winder', '/icon_port/icon_port_winder_1.png', 6, 4,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, winder_In),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, winder_Out)
            ], winder_Work)
        ]
    );
    // 灌装机
    public static readonly FillingMachine: Machine = new Machine('fillingmachine', '/icon_port/icon_port_filling_pd_mc_1.png', 6, 4,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, fillingmachine_In_soild),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, fillingmachine_Out)
            ], fillingmachine_Work)
        ]
    );
    // 封装机
    public static readonly AssemblyMachine: Machine = new Machine('assemblymachine', '/icon_port/icon_port_tools_asm_mc_1.png', 6, 4,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, assemblymachine_In),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, assemblymachine_Out)
            ], assemblymachine_Work)
        ]
    );
    // 研磨机
    public static readonly Thickener: Machine = new Machine('thickener', '/icon_port/icon_port_thickener_1.png', 6, 4,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, thickener_In),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, thickener_Out)
            ], thickener_Work)
        ]
    );
    // 反应池
    public static readonly MixPool: Machine = new Machine('mixpool', '/icon_port/icon_port_mix_pool_1.png', 5, 5,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, mixpool_In),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, mixpool_Out)
            ], mixpool_Work)
        ]
    );
    // 天有烘炉
    public static readonly XiraniteOven: Machine = new Machine('xiraniteoven', '/icon_port/icon_port_xiranite_oven_1.png', 5, 5,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, xiraniteoven_In_soild),
                new PortGroup([new Vector2(0, 4), new Vector2(1, 4), new Vector2(2, 4), new Vector2(3, 4), new Vector2(4, 4)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, xiraniteoven_Out)
            ], xiraniteoven_Work)
        ]
    );
    // 拆解机
    public static readonly Dismantler: Machine = new Machine('dismantler', '/icon_port/icon_port_dismantler_1.png', 6, 4,
        [
            new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1_solid, [
                new PortGroup([new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0), new Vector2(4, 0), new Vector2(5, 0)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, true, dismantler_In),
                new PortGroup([new Vector2(0, 3), new Vector2(1, 3), new Vector2(2, 3), new Vector2(3, 3), new Vector2(4, 3), new Vector2(5, 3)], [Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN, Vector2.DOWN], EnumItemType.SOLID, false, dismantler_Out)
            ], dismantler_Work)
        ]
    );
}