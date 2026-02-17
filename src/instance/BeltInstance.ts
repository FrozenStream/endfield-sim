import type { Belt } from "../proto/Belt";
import { ItemStack } from "../proto/ItemStack";
import EnumItemType from "../utils/EnumItemType";
import Vector2 from "../utils/Vector2";
import type { MachineInstance } from "./MachineInstance";

export class BeltSec {
    owner: BeltInstance;
    index: number;
    direc: number;
    position: Vector2;
    constructor(owner: BeltInstance, index: number, direc: number, position: Vector2) {
        this.owner = owner;
        this.index = index;
        this.direc = direc;
        this.position = position;
    }
}


export class BeltInventory {
    public readonly length: number;
    private _pointer: number;
    private _pointerDelay: number;
    private _inventory: ItemStack[];
    private _delay: number[];

    private static SecMaxDelay = 20;

    constructor(length: number) {
        this.length = length;
        this._pointer = 0;
        this._pointerDelay = 0;
        this._inventory = new Array(length);
        this._delay = new Array(length).fill(0);
        for (let i = 0; i < length; i++) {
            this._inventory[i] = new ItemStack(null, EnumItemType.SOLID, 0, 1);
        }
    }

    public get tail(): number { return (this._pointer - 1 + this._inventory.length) % this._inventory.length; }


    /**
     * @returns 传送带尾部物品，若为空则返回null
     */
    public tailInventory(): ItemStack | null {
        const stack = this._inventory[this.tail];
        const delay = this._delay[this.tail];
        if (stack.isEmpty() || delay !== this._pointerDelay) return null;
        return stack;
    }

    public headInventory(): ItemStack | null {
        const stack = this._inventory[this._pointer];
        const delay = this._delay[this._pointer];
        if (stack.isEmpty() || delay !== this._pointerDelay) return null;
        return stack;
    }

    public update() {
        if (!this.tailInventory()) return;  // 若尾部有物品，则传送带堵塞
        this._pointerDelay += 1;
        if (this._pointerDelay >= BeltInventory.SecMaxDelay) {
            this._pointerDelay = 0;
            this._pointer = (this._pointer - 1 + this._inventory.length) % this._inventory.length;
        }
    }

    public insertable() {
        const next = (this._pointer + 1 + this._inventory.length) % this._inventory.length;
        if (!this._inventory[next].isEmpty() && BeltInventory.SecMaxDelay - this._delay[next] + this._pointerDelay < BeltInventory.SecMaxDelay) return false;
        if (!this._inventory[this._pointer].isEmpty() && this._delay[this._pointer] < this._pointerDelay) return false;
        return true;
    }

    public insert(itemStack: ItemStack): boolean {
        if (!this.insertable()) return false;
        this._inventory[this._pointer].merge(itemStack);
        if (!this._inventory[this._pointer].isEmpty()) {
            this._delay[this._pointer] = this._pointerDelay;
            return true;
        }
        else return false;
    }
}

export class BeltInstance {
    public readonly beltType: Belt;
    public static readonly imgCache: HTMLImageElement;

    public start: MachineInstance | null = null;
    public startPoint: Vector2 | null = null;
    public direc: Array<number>;
    private _started: boolean = false;

    public sections: BeltSec[] | null = null;
    public inventory: BeltInventory | null = null;



    constructor(beltType: Belt) {
        this.beltType = beltType;
        this.direc = [];

    }

    public setStart(start: MachineInstance | Vector2) {
        if (start instanceof Vector2) {
            this.startPoint = start.floor();
            this.start = null;
        }
        else {
            this.startPoint = null;
            this.start = start;
        }
    }

    public lockStart() {
        if (this.start) this._started = true;
    }

    public get started() {
        return this._started;
    }

    public setEnd(end: Vector2) {
        if (this.start === null) throw new Error("start point is null");
        if (!this._started) return;
        end = end.floor();

        const start = this.start.closestPort(end, false, EnumItemType.SOLID);
        if (start === null) return;
        const faceAt = Vector2.toIndex(start.direction)!;
        this.startPoint = start.postion.add(Vector2.DIREC[faceAt]);
        this.direc = [faceAt];

        const relative: Vector2 = end.sub(this.startPoint);
        console.log('relative', relative);
        const inFaceLength: number = relative.dot(Vector2.DIREC[faceAt]);
        const dir_a = Vector2.toCW(faceAt);
        const dir_b = Vector2.toCCW(faceAt);
        const dir_back = Vector2.toBACK(faceAt);
        const l = relative.dot(Vector2.DIREC[dir_a]);

        if (inFaceLength >= 0) {
            // end在面朝方向，前进至垂直
            for (let i = 0; i < inFaceLength; i++) this.direc.push(faceAt);
            if (relative.manhattanDistance() !== 0) {
                if (l >= 0) for (let j = 0; j < l; j++) this.direc.push(dir_a);
                else for (let j = 0; j < -l; j++) this.direc.push(dir_b);
            }
        }
        else {
            // 若有转向空间
            if (l > 0) {
                for (let j = 0; j < l; j++) this.direc.push(dir_a);
                for (let j = 0; j < -inFaceLength; j++) this.direc.push(dir_back);
            }
            if (l < 0) {
                for (let j = 0; j < -l; j++) this.direc.push(dir_b);
                for (let j = 0; j < -inFaceLength; j++) this.direc.push(dir_back);
            }
        }
        console.log(this.direc);
    }

    public get length(): number {
        return this.direc.length;
    }

    public shapeAt(index: number): number {
        const nextDir = index + 1 < this.direc.length ? this.direc[index + 1] : this.direc[index];
        return Vector2.ABtoIndex(this.direc[index], nextDir);
    }

    public shape(): ReadonlyArray<Vector2> {
        if (!this.startPoint) return [];
        const arr: Array<Vector2> = [];
        let point: Vector2 = Vector2.copy(this.startPoint);
        arr.push(point);
        for (let i = 1; i < this.direc.length; i++) {
            point = point.add(Vector2.DIREC[this.direc[i]]);
            arr.push(point);
        }
        return arr;
    }

    public build() {
        if (!this.startPoint) return;
        this.sections = [];
        let point: Vector2 = Vector2.copy(this.startPoint);
        this.sections.push(new BeltSec(this, 0, this.shapeAt(0), point));
        for (let i = 1; i < this.direc.length; i++) {
            point = point.add(Vector2.DIREC[this.direc[i]]);
            this.sections.push(new BeltSec(this, i, this.shapeAt(i), point));
        }
    }
}