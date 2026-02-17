import type { ItemStack } from "../proto/ItemStack";
import type { Machine, MachineMode, PortGroup } from "../proto/Machines";
import type EnumItemType from "../utils/EnumItemType";
import Rect from "../utils/Rect";
import Vector2 from "../utils/Vector2";

export interface portInstance {
    portGroup: PortGroup;
    postion: Vector2;
    direction: Vector2;
}


export class MachineInstance {
    public readonly machine: Machine;
    private _position: Vector2 | null = null;
    public rotation: number = 0;

    public currentMode: MachineMode;

    public R: Vector2 = Vector2.RIGHT;
    public D: Vector2 = Vector2.DOWN;

    public rect: Rect | null = null;
    public left_top: Vector2 | null = null;

    public inventory: ItemStack[] = [];
    public portInstances: portInstance[][] | null = null;   // 预览状态不使用
    public pollingPointer: number[] | null = null;

    constructor(machine: Machine) {
        this.machine = machine;
        this.currentMode = this.machine.modes[0];
    }

    public switchMode(mode: MachineMode) {
        this.currentMode = mode;
        this.build();
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
    }

    public closestPort(dst: Vector2, isIn: boolean, itemType: EnumItemType): portInstance | null {
        if (!this.portInstances) return null;
        let closest: portInstance | null = null;
        let closest_num = 1e9;
        let dist;
        for (const instanceGroup of this.portInstances) {
            for (const instance of instanceGroup) {
                if (instance.portGroup.isIn !== isIn || instance.portGroup.itemType !== itemType) continue;
                dist = instance.postion.sub(dst).manhattanDistance();
                if (!closest || dist < closest_num) {
                    closest = instance;
                    closest_num = dist;
                }
            }
        }
        return closest
    }
}