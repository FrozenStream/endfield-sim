import type { Item } from "../proto/Item";
import { ItemStack } from "../proto/ItemStack";
import type { Machine, MachineMode, PortGroup } from "../proto/Machines";
import { Config } from "../utils/Config";
import type EnumItemType from "../utils/EnumItemType";
import Rect from "../utils/Rect";
import Array2d from "../utils/Array2d";

export class portGroupInstance {
    owner: MachineInstance;
    src: PortGroup;

    constructor(owner: MachineInstance, portGroupSrc: PortGroup) {
        this.owner = owner;
        this.src = portGroupSrc;
    }
}

export class portInstance {
    group: portGroupInstance;
    id: number;
    position: Array2d;
    direc: number;

    constructor(group: portGroupInstance, id: number, postion: Array2d, direction: number) {
        this.group = group;
        this.id = id;
        this.position = postion;
        this.direc = direction;
    }

    get portGroupSrc(): PortGroup { return this.group.src; }

    get type(): EnumItemType { return this.group.src.itemType; }

    get isIn(): boolean { return this.group.src.isIn; }

    work(stack: ItemStack): boolean { return this.portGroupSrc.callback_in(stack, this.group.owner); }
}

export class WorkTimer {
    input: Item | string | null = null;
    out: Item | Item[] | null = null;
    count: number[] | null = null;
    isWorking: boolean = false;
    maxTime: number = 0;
    curTime: number = 0;

    _outID: number = 0;

    begin(input: Item | string | null, out: Item | Item[] | null, count: number[] | null, maxTime: number) {
        this.input = input;
        this.out = out;
        this.count = count;
        this.isWorking = true;
        this.maxTime = maxTime * Config.PhysicsFPS;
        this.curTime = 0;
    }

    reset() {
        this.input = null;
        this.isWorking = false;
        this.curTime = 0;
    }

    update_cyclic(deltaTime: number): boolean {
        if (!this.isWorking) return false;
        this.curTime += deltaTime;
        if (this.curTime >= this.maxTime) {
            return true;
        }
        return false;
    }

    update(deltaTime: number): boolean {
        if (!this.isWorking) return false;
        this.curTime += deltaTime;
        if (this.curTime >= this.maxTime) return true;
        return false;
    }

    toZero() {
        this.curTime = 0;
    }
}


export class MachineInstance {
    public readonly machine: Machine;
    private _powerCount: number = 0;
    private _position: Array2d | null = null;
    public rotation: number = 0;

    public R: Array2d = Array2d.RIGHT;
    public D: Array2d = Array2d.DOWN;

    public rect: Rect | null = null;
    public left_top: Array2d | null = null;

    public currentMode: MachineMode;
    public inventory: ItemStack[] = [];                 // 预览状态不使用
    public portGroupInsts: portGroupInstance[] | null = null;

    public timer: WorkTimer = new WorkTimer();
    public tmp_timers: WorkTimer[] = [];

    constructor(machine: Machine) {
        this.machine = machine;
        this.currentMode = this.machine.modes[0];
    }

    public switchMode(mode: MachineMode) {
        this.currentMode = mode;
        this.build();
    }

    public powerOn(num: number = 1) {
        this._powerCount += num;
    }

    public get onPower(): boolean {
        return this._powerCount + this.machine.powerArea >= 0;
    }

    public powerOff(num: number = 1) {
        this._powerCount -= num;
        if (!this.onPower) this.timer.toZero();
    }

    public rotate(time: number) {
        this.rotation = (this.rotation + time) % 4;
        this.R = this.R.rotateCW(time);
        this.D = this.D.rotateCW(time);
        this.updateRect();
    }

    public set Position(position: Array2d) {
        this._position = position;
        this.updateRect();
    }

    public get Position(): Array2d | undefined {
        return this.rect?.center();
    }

    private updateRect() {
        const R2 = this.R.mul(this.machine.width / 2);
        const D2 = this.D.mul(this.machine.height / 2);
        const LT: Array2d = this._position!.sub(R2).sub(D2).round();
        const RD: Array2d = this._position!.add(R2).add(D2).round();
        const LD: Array2d = this._position!.sub(R2).add(D2).round();
        const RT: Array2d = this._position!.add(R2).sub(D2).round();

        const min_x = Math.min(LT.x, RD.x, LD.x, RT.x);
        const max_x = Math.max(LT.x, RD.x, LD.x, RT.x);
        const min_y = Math.min(LT.y, RD.y, LD.y, RT.y);
        const max_y = Math.max(LT.y, RD.y, LD.y, RT.y);

        this.rect = new Rect(min_x, min_y, max_x - min_x, max_y - min_y);
        this.left_top = LT;
    }


    public build() {
        this.inventory = this.currentMode.inventory.map(config => new ItemStack(null, config.type, 0, config.max));
        this.portGroupInsts = this.currentMode.portGroups.map(portGroup => new portGroupInstance(this, portGroup));
    }

    public closestPort(dst: Array2d, isIn: boolean, itemType: EnumItemType): portInstance | null {
        if (!this.portGroupInsts) return null;
        let closest: portInstance | null = null;
        let closest_num = 1e9;
        let dist;
        for (const group of this.portGroupInsts) {
            if (group.src.isIn !== isIn || group.src.itemType !== itemType) continue;
            for (const port of group.ports) {
                let from = port.position.add(Array2d.DIREC[port.direc]);
                if (isIn) from = port.position.sub(Array2d.DIREC[port.direc]);
                dist = from.sub(dst).manhattanDistance();
                if (!closest || dist < closest_num) {
                    closest = port;
                    closest_num = dist;
                }
            }
        }
        return closest;
    }
}