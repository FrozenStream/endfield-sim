import type { Item } from "../proto/Item";
import type { ItemStack } from "../proto/ItemStack";
import type { Machine, MachineMode, PortGroup } from "../proto/Machines";
import { Config } from "../utils/Config";
import type EnumItemType from "../utils/EnumItemType";
import Rect from "../utils/Rect";
import Vector2 from "../utils/Vector2";
import type { BeltSec } from "./BeltInstance";

export class portInstance {
    owner: MachineInstance;
    portGroupSrc: PortGroup;
    position: Vector2;
    direction: Vector2;

    connecting: BeltSec | null = null;

    constructor(owner: MachineInstance, portGroupSrc: PortGroup, postion: Vector2, direction: Vector2) {
        this.owner = owner;
        this.portGroupSrc = portGroupSrc;
        this.position = postion;
        this.direction = direction;
    }
}


export class WorkTimer {
    private _isWorking: boolean = false;
    private maxTime: number = 1e9;
    private cur: number = 0;

    begin(maxTime: number) {
        this._isWorking = true;
        this.maxTime = maxTime * Config.PhysicsFPS;
        this.cur = 0;
    }

    reset() {
        this._isWorking = false;
        this.maxTime = 1e9;
        this.cur = 0;
    }

    update(deltaTime: number): boolean {
        if (!this._isWorking) return false;
        if (this.maxTime <= 0) return false;
        this.cur += deltaTime;
        if (this.cur >= this.maxTime) {
            this.cur = 0;
            return true;
        }
        return false;
    }

    toZero() {
        this.cur = 0;
    }
}


export class MachineInstance {
    public readonly machine: Machine;
    private _powerCount: number = 0;
    private _position: Vector2 | null = null;
    public rotation: number = 0;

    public R: Vector2 = Vector2.RIGHT;
    public D: Vector2 = Vector2.DOWN;

    public rect: Rect | null = null;
    public left_top: Vector2 | null = null;

    public currentMode: MachineMode;
    public inventory: ItemStack[] = [];                 // 预览状态不使用
    public portInstances: portInstance[][] | null = null;
    public pollingPointer: number[] | null = null;

    public timer: WorkTimer = new WorkTimer();
    public curInv: Item | string | null = null;
    public curRecipe: any = null;

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
        return this._powerCount > 0;
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
        this.inventory = this.currentMode.inventory.buildItemStack();
        this.portInstances = this.currentMode.portGroups.map(portGroup => portGroup.buildInstances(this));
        this.pollingPointer = this.currentMode.portGroups.map(_ => 0);
        this.curInv = null;
        this.curRecipe = null;
    }

    public closestPort(dst: Vector2, isIn: boolean, itemType: EnumItemType): portInstance | null {
        if (!this.portInstances) return null;
        let closest: portInstance | null = null;
        let closest_num = 1e9;
        let dist;
        for (const instanceGroup of this.portInstances) {
            for (const instance of instanceGroup) {
                if (instance.portGroupSrc.isIn !== isIn || instance.portGroupSrc.itemType !== itemType) continue;
                dist = instance.position.sub(dst).manhattanDistance();
                if (!closest || dist < closest_num) {
                    closest = instance;
                    closest_num = dist;
                }
            }
        }
        return closest;
    }
}