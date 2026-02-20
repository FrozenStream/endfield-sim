import { Belt } from "../proto/Belt";
import { ItemStack } from "../proto/ItemStack";
import { Config } from "../utils/Config";
import EnumItemType from "../utils/EnumItemType";
import Vector2 from "../utils/Vector2";
import { MachineInstance, portInstance } from "./MachineInstance";

export class BeltSec {
    readonly owner: BeltInstance;
    readonly index: number;
    readonly direc: number;
    readonly position: Vector2;
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

    private _count: number;

    public static readonly BeltSpeed = 2;
    public static readonly SecMaxDelay = Config.PhysicsFPS * 2;

    public oldCache: ({ itemstack: ItemStack, delay: number } | null)[] = new Array(length);

    constructor(length: number) {
        this.length = length;
        this._pointer = 0;
        this._pointerDelay = 0;
        this._count = 0;
        this._inventory = new Array(length + 1);
        this._delay = new Array(length + 1).fill(0);
        for (let i = 0; i <= length; i++)
            this._inventory[i] = new ItemStack(null, EnumItemType.SOLID, 0, 1);

        console.log("BeltInventory.length", this.length);
    }

    private point(index: number): number {
        return (this._pointer + index + this._inventory.length) % this._inventory.length;
    }

    private blockTail(index: number): { index: number, delay: number } {
        if (this._pointerDelay === 0) {
            return {
                index: this.point(index),
                delay: BeltInventory.SecMaxDelay - 1
            }
        }
        else return {
            index: this.point(index + 1),
            delay: this._pointerDelay - 1
        }
    }

    private blockHead(index: number): { index: number, delay: number } {
        return {
            index: this.point(index),
            delay: this._pointerDelay
        }
    }

    public get isFull(): boolean {
        return this._count === this.length;
    }

    public get(data: { index: number, delay: number }): ItemStack | null {
        if (!this._inventory[data.index].isEmpty() && this._delay[data.index] === data.delay)
            return this._inventory[data.index];
        else
            return null;
    }

    public getTail(): ItemStack | null {
        const tail = this.blockTail(this.length - 1);
        return this.get(tail);
    }

    public getHead(): ItemStack | null {
        const head = this.blockHead(0);
        return this.get(head);
    }

    public getInventory(index: number): ({ itemstack: ItemStack, delay: number } | null) {
        const a = this.point(index);
        const b = this.point(index + 1);
        if (!this._inventory[a].isEmpty() && this._delay[a] >= this._pointerDelay) {
            const tmp = {
                itemstack: this._inventory[a],
                delay: this._delay[a] - this._pointerDelay
            };
            this.oldCache[index] = tmp;
            return tmp;
        }
        else if (!this._inventory[b].isEmpty() && this._delay[b] < this._pointerDelay) {
            const tmp = {
                itemstack: this._inventory[b],
                delay: BeltInventory.SecMaxDelay - this._pointerDelay + this._delay[b]
            };
            this.oldCache[index] = tmp;
            return tmp;
        }
        else {
            this.oldCache[index] = null;
            return null
        };
    }

    public setInventory(index: number, data: { itemstack: ItemStack, delay: number } | null) {
        if (data === null || data.itemstack.isEmpty()) return;
        this._inventory[index] = data.itemstack;
        this._delay[index] = data.delay;
    }

    public update() {
        if (this.getTail() !== null) {     // 若尾部有物品，则传送带堵塞
            console.log('Belt blocked');
            if (this._count === this.length) return;    // 若全段阻塞，暂停更新

            for (let i = this.length - 1; i >= 0; i--) {
                const tmp = this.blockTail(i);
                if (this.get(tmp) === null) {
                    // 找到第一个未满节点后退出
                    for (let j = i + 1; j < this.length; j++) {
                        const tail = this.blockTail(j);
                        if (this._delay[tail.index] === 0) {
                            const before = this.blockHead(j).index;
                            this._inventory[before].moveIn(this._inventory[tail.index]);
                            this._delay[before] = BeltInventory.SecMaxDelay - 1;
                        }
                        else {
                            this._delay[tail.index] -= 1;
                        }
                    }
                    break;
                }
            }
        }
        this._pointerDelay -= 1;
        if (this._pointerDelay < 0) {
            this._pointerDelay = BeltInventory.SecMaxDelay - 1;
            this._pointer = (this._pointer - 1 + this._inventory.length) % this._inventory.length;
        }
    }

    public insertable() {
        const next = this.point(1);
        if (!this._inventory[next].isEmpty() && BeltInventory.SecMaxDelay + this._delay[next] - this._pointerDelay < BeltInventory.SecMaxDelay) return false;
        if (!this._inventory[this._pointer].isEmpty() && this._delay[this._pointer] >= this._pointerDelay) return false;
        return true;
    }

    public insert(itemStack_in: ItemStack): boolean {
        if (!this.insertable()) return false;
        this._inventory[this._pointer].merge(itemStack_in);
        if (!this._inventory[this._pointer].isEmpty()) {
            this._delay[this._pointer] = this._pointerDelay;
            console.log("insert");
            this._count++;
            return true;
        }
        else return false;
    }

    public extract(itemStack_out: ItemStack): boolean {
        const stack = this.getTail();
        if (stack === null) return false;
        itemStack_out.merge(stack);
        if (stack.isEmpty()) {
            this._count--;
            console.log("extract");
            return true;
        }
        return false;
    }

    public static concat(beltInv0: BeltInventory, beltInv1: BeltInventory): BeltInventory {
        const newInv = new BeltInventory(beltInv0.length + beltInv1.length);
        for (let i = 0; i < beltInv0.length; i++)newInv.setInventory(i, beltInv0.getInventory(i));
        for (let i = 0; i < beltInv1.length; i++)newInv.setInventory(beltInv0.length + i, beltInv1.getInventory(i));
        return newInv;
    }
}

export class BeltInstance {
    public readonly beltType: Belt;
    public static readonly imgCache: HTMLImageElement;

    // On_building elements
    private _vaild: boolean = true;
    private _started: boolean = false;
    public start: MachineInstance | BeltSec | portInstance | null = null;
    public startPoint: Vector2 | null = null;
    public end: MachineInstance | null = null;
    public endPoint: Vector2 | null = null;

    // after_built elements
    public direc: Array<number>;

    // data elements
    public sections: BeltSec[] | null = null;
    public inventory: BeltInventory | null = null;



    constructor(beltType: Belt) {
        this.beltType = beltType;
        this.direc = [];
    }

    public get vaild() {
        return this._vaild;
    }

    public setStart(start: MachineInstance | BeltSec | portInstance | Vector2, pos: Vector2) {
        if (start instanceof Vector2) {
            this.startPoint = start.floor();
            this.start = null;
            this._vaild = false;
        }
        else {
            this.startPoint = pos;
            this.start = start;
            this._vaild = true;
        }
    }

    public lockStart() {
        if (this.start) this._started = true;
    }

    public get started() {
        return this._started;
    }

    public setEnd(end: Vector2, instance?: MachineInstance) {
        if (!this._started) return;
        const port = instance?.closestPort(end, true, EnumItemType.SOLID);
        if (!port) {
            this.end = null;
            this.endPoint = end;
        }
        else {
            this.end = instance!;
            this.endPoint = port.position!.sub(port.direction);
        }

        let faceAt: number;
        if (this.start instanceof MachineInstance) {
            const start = this.start.closestPort(this.endPoint, false, EnumItemType.SOLID);
            if (start === null) return;
            faceAt = Vector2.toIndex(start.direction)!;
            this.startPoint = start.position.add(Vector2.DIREC[faceAt]).floor();
        }
        else if (this.start instanceof BeltSec) {
            faceAt = this.start.owner.direc[this.start.index + 1];
            this.startPoint = this.start.position.add(Vector2.DIREC[faceAt]);
        }
        else if (this.start instanceof portInstance) {
            faceAt = Vector2.toIndex(this.start.direction)!
            this.startPoint = this.start.position.add(Vector2.DIREC[faceAt]).floor();
        }
        else throw new Error("start point is null");

        this.direc = [faceAt];

        const relative: Vector2 = this.endPoint.floor().sub(this.startPoint);
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

        if (!port) this.direc.push(this.direc[this.direc.length - 1]);
        else this.direc.push(Vector2.toIndex(port.direction)!);
        console.log("belt directions:", this.direc);
    }

    public get length(): number {
        return this.direc.length - 1;
    }

    public shapeAt(index: number): number {
        if (index >= this.length) throw new Error("index out of range");
        return Vector2.ABtoIndex(this.direc[index], this.direc[index + 1]);
    }

    public shape(): ReadonlyArray<Vector2> {
        if (!this.startPoint) return [];
        const arr: Array<Vector2> = [];
        let point: Vector2 = Vector2.copy(this.startPoint);
        arr.push(point);
        for (let i = 1; i < this.length; i++) {
            point = point.add(Vector2.DIREC[this.direc[i]]);
            arr.push(point);
        }
        return arr;
    }

    public build() {
        if (!this.startPoint) return;
        this.inventory = new BeltInventory(this.length);
        this.sections = [];
        let point: Vector2 = Vector2.copy(this.startPoint);
        this.sections.push(new BeltSec(this, 0, this.shapeAt(0), point));
        for (let i = 1; i < this.length; i++) {
            point = point.add(Vector2.DIREC[this.direc[i]]);
            this.sections.push(new BeltSec(this, i, this.shapeAt(i), point));
        }
    }

    public static concat(belt0: BeltInstance, belt1: BeltInstance): BeltInstance {
        const newBelt = new BeltInstance(Belt.soildBelt);
        newBelt.startPoint = belt0.startPoint;

        // 连接方向数组，跳过belt1的第一个元素避免重复
        newBelt.direc = belt0.direc.concat(belt1.direc.slice(1));

        // 设置起点和终点
        newBelt.start = belt0.start;
        newBelt.end = belt1.end;
        newBelt.endPoint = belt1.endPoint;
        newBelt._started = true;

        // 构建传送带段
        newBelt.build();

        // 合并库存系统
        if (belt0.inventory && belt1.inventory) {
            newBelt.inventory = BeltInventory.concat(belt0.inventory, belt1.inventory);
        }

        return newBelt;
    }
}