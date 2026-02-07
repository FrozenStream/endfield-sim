import type ItemStack from "../ItemStack";
import Vector2 from "../utils/Vector2";


const ItemEnum = {
    SOLID: 0,
    FLUID: 1
} as const;

interface IOblock {
    relPos: Vector2;
    type: number;
    input: boolean;
    direction: Vector2;
    callback: (itemstack: ItemStack, instance: MachineInstance) => boolean;
}

interface StorageData {
    type: number;
    NoIn: boolean;
    NoOut: boolean;
}



class MachineInstance {
    public readonly machine: Machine;
    public inventory: Array<ItemStack> = [];
    public position: Vector2;
    public rotate: number;

    constructor(machine: Machine, position: Vector2, rotate: number) {
        this.machine = machine;
        this.position = position;
        this.rotate = rotate;

    }
}

class Machine {
    id: string;
    imgsrc: string;

    width: number;
    height: number;

    storage: Array<StorageData>;
    IOs: ReadonlyArray<IOblock>;

    working: (instance: MachineInstance) => boolean;

    constructor(id: string, imgsrc: string, width: number = 3, height: number = 3,
        storage: Array<StorageData> = [],
        IOs: Array<IOblock> = [],
        working: (instance: MachineInstance) => boolean = (_: MachineInstance) => true) {
        this.id = id;
        this.imgsrc = imgsrc;
        this.width = width;
        this.height = height;
        this.storage = storage;
        this.IOs = IOs;
        this.working = working;

        Machine.allMachines.set(id, this);
    }

    public static getAllMachines(): ReadonlyMap<string, Machine> {
        return Machine.allMachines;
    }

    private static allMachines: Map<string, Machine> = new Map();

    public static readonly Cannon1: Machine = new Machine('cannon1', '/icon_port/icon_port_battle_cannon_1.png');
    public static readonly Connon2: Machine = new Machine('cannon2', '/icon_port/icon_port_battle_cannon_2.png');

    // 存储箱
    public static readonly Storager: Machine = new Machine('storager', '/icon_port/icon_port_storager_1.png', 3, 3,
        [
            { type: ItemEnum.SOLID, NoIn: false, NoOut: false }, { type: ItemEnum.SOLID, NoIn: false, NoOut: false },
            { type: ItemEnum.SOLID, NoIn: false, NoOut: false }, { type: ItemEnum.SOLID, NoIn: false, NoOut: false },
            { type: ItemEnum.SOLID, NoIn: false, NoOut: false }, { type: ItemEnum.SOLID, NoIn: false, NoOut: false }
        ],
        [
            { relPos: new Vector2(-1, -1), type: ItemEnum.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, -1), type: ItemEnum.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, -1), type: ItemEnum.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(-1, 1), type: ItemEnum.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(0, 1), type: ItemEnum.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 1), type: ItemEnum.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
        ]
    );


    // 精炼炉
    public static readonly Furnance: Machine = new Machine('furnance', '/icon_port/icon_port_furnance_1.png');
    // 粉碎机
    public static readonly Grinder: Machine = new Machine('grinder', '/icon_port/icon_port_grinder_1.png');
    // 塑形机
    public static readonly Shaper: Machine = new Machine('shaper', '/icon_port/icon_port_shaper_1.png');
    // 配件机
    public static readonly Component: Machine = new Machine('component', '/icon_port/icon_port_cmpt_mc_1.png');
    // 种植机
    public static readonly Planter: Machine = new Machine('planter', '/icon_port/icon_port_planter_1.png');
    // 采种机
    public static readonly Seedcollector: Machine = new Machine('seedcollector', '/icon_port/icon_port_seedcol_1.png');

    // 装备原件机
    public static readonly Winder: Machine = new Machine('winder', '/icon_port/icon_port_winder_1.png');
    // 灌装机
    public static readonly FillingMachine: Machine = new Machine('fillingmachine', '/icon_port/icon_port_filling_pd_mc_1.png');
    // 封装机
    public static readonly AssemblyMachine: Machine = new Machine('assemblymachine', '/icon_port/icon_port_tools_asm_mc_1.png');
    // 研磨机
    public static readonly Thickener: Machine = new Machine('thickener', '/icon_port/icon_port_thickener_1.png');
    // 反应池
    public static readonly MixPool: Machine = new Machine('mixpool', '/icon_port/icon_port_mix_pool_1.png');
    // 天有烘炉
    public static readonly XiraniteOven: Machine = new Machine('xiraniteoven', '/icon_port/icon_port_xiranite_oven_1.png');
    // 拆解机
    public static readonly Dismantler: Machine = new Machine('dismantler', '/icon_port/icon_port_dismantler_1.png');
}


export { Machine, MachineInstance };


function Storager_In(itemstack: ItemStack, instance: MachineInstance): boolean {
    for (let i = 0; i < instance.inventory.length; i++) {
        if (instance.inventory[i].merge(itemstack)) return true;
    }
    return false;
}


function Storager_Out(itemstack: ItemStack, instance: MachineInstance): boolean {
    for (let i = 0; i < instance.inventory.length; i++) {
        if (instance.inventory[i].split(itemstack, 1)) return true;
    }
    return false;
}
