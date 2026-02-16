import ItemStack from "./ItemStack";
import EnumItemType from "./utils/EnumItem";
import { EnumInventoryType } from "./utils/EnumStorageType";
import Rect from "./utils/Rect";
import Vector2 from "./utils/Vector2";


interface port {
    relPos: Vector2;
    type: EnumItemType;
    input: boolean;
    direction: Vector2;
    callback: (itemstack: ItemStack, instance: MachineInstance) => boolean;
}


interface portInstance {
    portSrc: port;
    postion: Vector2;
}


class MachineInstance {
    public readonly machine: Machine;
    public inventory: ItemStack[] = [];
    private _position: Vector2 | null = null;
    public rotation: number = 0;

    public currentMode: MachineMode;

    public R: Vector2 = Vector2.RIGHT;
    public D: Vector2 = Vector2.DOWN;

    public rect: Rect | null = null;
    public left_top: Vector2 | null = null;
    private portInstances: ReadonlyArray<portInstance> | null = null;   // 预览状态不使用

    constructor(machine: Machine) {
        this.machine = machine;
        this.currentMode = this.machine.modes[0];
        this.inventory = this.machine.modes[0].inventory.buildItemStack();
    }

    public switchMode(mode: MachineMode) {
        this.currentMode = mode;
        this.inventory = mode.inventory.buildItemStack();
    }

    public rotate(time: number) {
        this.rotation = (this.rotation + time) % 4;
        this.R = this.R.rotateCW(time);
        this.D = this.D.rotateCW(time);
        this.updateRect();
    }

    public set Position(position: Vector2) {
        this._position = position;
        this.updateRect();
    }

    public get Position(): Vector2 | undefined {
        return this.rect?.center();
    }

    private updateRect() {
        const R2 = this.R.mul(this.machine.width / 2);
        const D2 = this.D.mul(this.machine.height / 2);
        const LT: Vector2 = this._position!.sub(R2).sub(D2).round();
        const RD: Vector2 = this._position!.add(R2).add(D2).round();
        const LD: Vector2 = this._position!.sub(R2).add(D2).round();
        const RT: Vector2 = this._position!.add(R2).sub(D2).round();

        const min_x = Math.min(LT.x, RD.x, LD.x, RT.x);
        const max_x = Math.max(LT.x, RD.x, LD.x, RT.x);
        const min_y = Math.min(LT.y, RD.y, LD.y, RT.y);
        const max_y = Math.max(LT.y, RD.y, LD.y, RT.y);

        this.rect = new Rect(min_x, min_y, max_x - min_x, max_y - min_y);
        this.left_top = LT;
    }

    public build() {
        if (!this.machine) throw new Error("machine not exist!");
        this.buildPortsInstance();
    }

    private buildPortsInstance() {
        if (!this._position) return;
        const list: portInstance[] = []
        this.currentMode.ports.forEach((port: port) => {
            list.push({
                portSrc: port,
                postion: Vector2.linear(this.R, port.relPos.x, this.D, port.relPos.y).addSelf(this.left_top!)
            })
        })
        this.portInstances = list;
    }

    public closestPort(pos: Vector2, input: boolean): portInstance | null {
        if (!this.portInstances) return null;
        let closest: portInstance | null = null;
        let closest_num = 1e9;
        let tmp;
        this.portInstances.forEach((port: portInstance) => {
            if (port.portSrc.input != input) return;
            tmp = port.postion.sub(pos).manhattanDistance();
            if (!closest || tmp < closest_num) {
                closest = port;
                closest_num = tmp;
            }
        });
        return closest
    }

    public portDirection_n(port: portInstance): number {
        return Vector2.toIndex(port.portSrc.direction.rotateCCW(this.rotation))!;
    }
}


class MachineMode {
    readonly id: string;
    readonly inventory: EnumInventoryType;
    readonly ports: port[];

    working: (instance: MachineInstance) => boolean;
    constructor(id: string, storage: EnumInventoryType, ports: port[], working: (instance: MachineInstance) => boolean = (instance: MachineInstance) => true) {
        this.id = id;
        this.inventory = storage;
        this.ports = ports;
        this.working = working;
    }

    public static readonly soildMode: string = 'soildMode';
    public static readonly liquidMode: string = 'liquidMode';

    public static readonly dafultMode: MachineMode = new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_None, []);
}

class Machine {
    id: string;
    imgCache: HTMLImageElement;

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

        Machine.allMachines.set(id, this);
    }

    public static getAllMachines(): ReadonlyMap<string, Machine> {
        return Machine.allMachines;
    }

    private static allMachines: Map<string, Machine> = new Map();

    // public static readonly Cannon1: Machine = new Machine('cannon1', '/icon_port/icon_port_battle_cannon_1.png');
    // public static readonly Connon2: Machine = new Machine('cannon2', '/icon_port/icon_port_battle_cannon_2.png');

    // 存储箱
    public static readonly Storager: Machine = new Machine('storager', '/icon_port/icon_port_storager_1.png', 3, 3,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_6, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );


    // 精炼炉
    public static readonly Furnance: Machine = new Machine('furnance', '/icon_port/icon_port_furnance_1.png', 3, 3,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 粉碎机
    public static readonly Grinder: Machine = new Machine('grinder', '/icon_port/icon_port_grinder_1.png', 3, 3,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 塑形机
    public static readonly Shaper: Machine = new Machine('shaper', '/icon_port/icon_port_shaper_1.png', 3, 3,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 配件机
    public static readonly Component: Machine = new Machine('component', '/icon_port/icon_port_cmpt_mc_1.png', 3, 3,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 2), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 种植机
    public static readonly Planter: Machine = new Machine('planter', '/icon_port/icon_port_planter_1.png', 5, 5,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(3, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(4, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(3, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(4, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 采种机
    public static readonly Seedcollector: Machine = new Machine('seedcollector', '/icon_port/icon_port_seedcol_1.png', 5, 5,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_1x1_solid, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(3, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(4, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(3, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(4, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );

    // 装备原件机
    public static readonly Winder: Machine = new Machine('winder', '/icon_port/icon_port_winder_1.png', 6, 4,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(3, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(4, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(5, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(3, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(4, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(5, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 灌装机
    public static readonly FillingMachine: Machine = new Machine('fillingmachine', '/icon_port/icon_port_filling_pd_mc_1.png', 6, 4,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(3, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(4, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(5, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(3, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(4, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(5, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 封装机
    public static readonly AssemblyMachine: Machine = new Machine('assemblymachine', '/icon_port/icon_port_tools_asm_mc_1.png', 6, 4,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(3, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(4, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(5, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(3, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(4, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(5, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 研磨机
    public static readonly Thickener: Machine = new Machine('thickener', '/icon_port/icon_port_thickener_1.png', 6, 4,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1, [
            { relPos: new Vector2(0, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(2, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(3, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(4, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(5, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
            { relPos: new Vector2(0, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(1, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(2, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(3, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(4, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
            { relPos: new Vector2(5, 3), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }])
        ]
    );
    // 反应池
    public static readonly MixPool: Machine = new Machine('mixpool', '/icon_port/icon_port_mix_pool_1.png', 5, 5,
        [new MachineMode(MachineMode.soildMode, EnumInventoryType.Storage_2x1,
            [
                { relPos: new Vector2(1, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
                { relPos: new Vector2(3, 0), type: EnumItemType.SOLID, input: true, direction: Vector2.DOWN, callback: Storager_In },
                { relPos: new Vector2(1, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out },
                { relPos: new Vector2(3, 4), type: EnumItemType.SOLID, input: false, direction: Vector2.DOWN, callback: Storager_Out }
            ])
        ]
    );
    // 天有烘炉
    public static readonly XiraniteOven: Machine = new Machine('xiraniteoven', '/icon_port/icon_port_xiranite_oven_1.png');
    // 拆解机
    public static readonly Dismantler: Machine = new Machine('dismantler', '/icon_port/icon_port_dismantler_1.png', 6, 4,

    );
}


export { EnumItemType as ItemEnum, Machine, MachineInstance };


function Storager_In(itemstack: ItemStack, instance: MachineInstance): boolean {
    for (let i = 0; i < instance.inventory.length; i++) {
        if (instance.inventory[i].merge(itemstack)) return true;
    }
    return false;
}


function Storager_Out(itemstack: ItemStack, instance: MachineInstance): boolean {
    for (let i = 0; i < instance.inventory.length; i++) {
        if (instance.inventory[i].split(itemstack, 1) === 0) return true;
    }
    return false;
}