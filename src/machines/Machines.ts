import type ItemStack from "../ItemStack";
import ItemEnum from "../utils/ItemEnum";
import Rect from "../utils/Rect";
import Vector2 from "../utils/Vector2";


interface IOblock {
    relPos: Vector2;
    type: ItemEnum;
    input: boolean;
    direction: Vector2;
    callback: (itemstack: ItemStack, instance: MachineInstance) => boolean;
}

interface StorageData {
    type: ItemEnum;
    NoIn: boolean;
    NoOut: boolean;
}

class MachineInstance {
    public readonly machine: Machine;
    public inventory: Array<ItemStack> = [];
    private _position: Vector2 | null = null;
    private rotation: number = 0;

    private R: Vector2 = Vector2.RIGHT;
    private D: Vector2 = Vector2.DOWN;

    private rect: Rect | null = null;

    constructor(machine: Machine) {
        this.machine = machine;
    }

    public rotate(time: number) {
        this.rotation = (this.rotation + time) % 4;
        this.R = this.R.rotateCW(time);
        this.D = this.D.rotateCW(time);
        this.updateRect();
    }

    public setPosition(position: Vector2) {
        this._position = position;
        this.updateRect();
    }

    private updateRect() {
        const R2 = this.R.multiply(this.machine.width / 2);
        const D2 = this.D.multiply(this.machine.height / 2);
        const LT: Vector2 = this._position!.subtract(R2).subtract(D2).round();
        const RD: Vector2 = this._position!.add(R2).add(D2).round();
        const LD: Vector2 = this._position!.subtract(R2).add(D2).round();
        const RT: Vector2 = this._position!.add(R2).subtract(D2).round();

        const min_x = Math.min(LT.x, RD.x, LD.x, RT.x);
        const max_x = Math.max(LT.x, RD.x, LD.x, RT.x);
        const min_y = Math.min(LT.y, RD.y, LD.y, RT.y);
        const max_y = Math.max(LT.y, RD.y, LD.y, RT.y);

        this.rect = new Rect(min_x, min_y, max_x - min_x, max_y - min_y);
    }

    public shape(): Rect | null {
        return this.rect;
    }

    public portShape(): Array<{ v1: Vector2, v2: Vector2, v3: Vector2 }> {
        let ans: Array<{ v1: Vector2, v2: Vector2, v3: Vector2 }> = [];
        this.machine.IOs.forEach(io => {
            const Tpos: Vector2 = this.rect!.center();
            const center = Tpos.add(Vector2.linear(this.R, io.relPos.x, this.D, io.relPos.y));
            let v2 = center.add(io.direction.rotateCW(this.rotation).multiply(0.1));
            let v1 = center.add(io.direction.rotateCW(this.rotation + 1).multiply(0.1));
            let v3 = center.add(io.direction.rotateCW(this.rotation - 1).multiply(0.1));

            if (io.input) {
                v1 = v1.subtract(io.direction.rotateCW(this.rotation).multiply(0.4));
                v2 = v2.subtract(io.direction.rotateCW(this.rotation).multiply(0.4));
                v3 = v3.subtract(io.direction.rotateCW(this.rotation).multiply(0.4));
            }
            else {
                v1 = v1.add(io.direction.rotateCW(this.rotation).multiply(0.3));
                v2 = v2.add(io.direction.rotateCW(this.rotation).multiply(0.3));
                v3 = v3.add(io.direction.rotateCW(this.rotation).multiply(0.3));
            }
            ans.push({ v1, v2, v3 });
        })
        return ans;
    }
}

class Machine {
    id: string;
    imgCache: HTMLImageElement;

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
        this.width = width;
        this.height = height;
        this.storage = storage;
        this.IOs = IOs;
        this.working = working;


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
    public static readonly Furnance: Machine = new Machine('furnance', '/icon_port/icon_port_furnance_1.png', 3, 3,
        [], []
    );
    // 粉碎机
    public static readonly Grinder: Machine = new Machine('grinder', '/icon_port/icon_port_grinder_1.png', 3, 3,
        [], []);
    // 塑形机
    public static readonly Shaper: Machine = new Machine('shaper', '/icon_port/icon_port_shaper_1.png', 3, 3,
        [], []);
    // 配件机
    public static readonly Component: Machine = new Machine('component', '/icon_port/icon_port_cmpt_mc_1.png', 3, 3,
        [], []);
    // 种植机
    public static readonly Planter: Machine = new Machine('planter', '/icon_port/icon_port_planter_1.png', 5, 5,
        [], []);
    // 采种机
    public static readonly Seedcollector: Machine = new Machine('seedcollector', '/icon_port/icon_port_seedcol_1.png', 5, 5,
        [], []);

    // 装备原件机
    public static readonly Winder: Machine = new Machine('winder', '/icon_port/icon_port_winder_1.png', 6, 4,
        [], []);
    // 灌装机
    public static readonly FillingMachine: Machine = new Machine('fillingmachine', '/icon_port/icon_port_filling_pd_mc_1.png', 6, 4,
        [], []);
    // 封装机
    public static readonly AssemblyMachine: Machine = new Machine('assemblymachine', '/icon_port/icon_port_tools_asm_mc_1.png', 6, 4,
        [], []);
    // 研磨机
    public static readonly Thickener: Machine = new Machine('thickener', '/icon_port/icon_port_thickener_1.png', 6, 4,
        [], []);
    // 反应池
    public static readonly MixPool: Machine = new Machine('mixpool', '/icon_port/icon_port_mix_pool_1.png');
    // 天有烘炉
    public static readonly XiraniteOven: Machine = new Machine('xiraniteoven', '/icon_port/icon_port_xiranite_oven_1.png');
    // 拆解机
    public static readonly Dismantler: Machine = new Machine('dismantler', '/icon_port/icon_port_dismantler_1.png', 6, 4,
        [], []);
}


export { ItemEnum, Machine, MachineInstance };


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
