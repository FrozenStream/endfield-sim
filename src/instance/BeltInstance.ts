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
    readonly fromDirec: number;
    readonly toDirec: number;
    readonly position: Vector2;
    constructor(owner: BeltInstance, index: number, fromDirec: number, toDirec: number, position: Vector2) {
        this.owner = owner;
        this.index = index;
        this.direc = Vector2.ABtoIndex(fromDirec, toDirec);
        this.fromDirec = fromDirec;
        this.toDirec = toDirec;
        this.position = position;
    }
}


export class BeltInventory {
    public readonly length: number;
    public readonly type: EnumItemType;
    private _pointer: number;
    private _pointerDelay: number;
    private _inventory: ItemStack[];
    private _delay: number[];

    public _onCircle = false;
    private _count: number;

    public static readonly SecMaxDelay = Config.PhysicsFPS * Config.BeltSecond;

    constructor(length: number, type: EnumItemType) {
        this.length = length;
        this.type = type;
        this._pointer = 0;
        this._pointerDelay = 0;
        this._count = 0;
        this._inventory = new Array(length + 1);
        this._delay = new Array(length + 1).fill(0);
        for (let i = 0; i <= length; i++) this._inventory[i] = new ItemStack(null, type, 0, 1);

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

    public get(where: { index: number, delay: number }): ItemStack | null {
        if (!this._inventory[where.index].isEmpty() && this._delay[where.index] === where.delay)
            return this._inventory[where.index];
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
            return {
                itemstack: this._inventory[a],
                delay: this._delay[a] - this._pointerDelay
            };
        }
        else if (!this._inventory[b].isEmpty() && this._delay[b] < this._pointerDelay) {
            return {
                itemstack: this._inventory[b],
                delay: BeltInventory.SecMaxDelay - this._pointerDelay + this._delay[b]
            };
        }
        else return null;
    }

    public setInventory(index: number, data: { itemstack: ItemStack, delay: number } | null) {
        if (data === null || data.itemstack.isEmpty()) return;
        this._inventory[index] = data.itemstack;
        this._delay[index] = data.delay;
    }

    public update() {
        if (this.getTail() !== null && this._onCircle === false) {     // 若尾部有物品，则传送带堵塞
            if (this._count === this.length && this.get(this.blockTail(0))) { console.log('Belt full blocked'); return; }    // 若全段阻塞，暂停更新

            for (let i = this.length - 1; i >= 0; i--) {
                const tmp = this.blockTail(i);
                if (this.get(tmp) === null) {
                    // 找到第一个未满节点后退出
                    console.log('Belt blocked at ', i);
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

        if (this._pointerDelay === 0) {
            this._pointerDelay = BeltInventory.SecMaxDelay - 1;
            this._pointer = (this._pointer - 1 + this._inventory.length) % this._inventory.length;
        }
        else this._pointerDelay -= 1;
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
        const newInv = new BeltInventory(beltInv0.length + beltInv1.length, beltInv0.type);
        for (let i = 0; i < beltInv0.length; i++) {
            const data = beltInv0.getInventory(i);
            if (data === null) continue;
            newInv._count++;
            newInv.setInventory(i, data);
        }
        for (let i = 0; i < beltInv1.length; i++) {
            const data = beltInv1.getInventory(i);
            if (data === null) continue;
            newInv._count++;
            newInv.setInventory(beltInv0.length + i, beltInv1.getInventory(i));
        }
        console.log('new belt item count:', newInv._count);
        return newInv;
    }

    public static cut(beltInv: BeltInventory, start: number, end: number): BeltInventory {
        if (start > end) throw new Error("start > end");
        const newInv = new BeltInventory(end - start, beltInv.type);

        for (let i = 0; i < end - start; i++) newInv.setInventory(i, beltInv.getInventory(start + i));
        newInv.updateCount();
        return newInv;
    }

    public static cutCircle(beltInv: BeltInventory, start: number): BeltInventory {
        const newInv = new BeltInventory(beltInv.length + 1, beltInv.type);

        for (let i = 0; i < beltInv.length + 1; i++) newInv.setInventory(i, beltInv.getInventory(start + i));
        newInv.updateCount();
        return newInv;
    }

    public static circle(beltInv: BeltInventory): BeltInventory {
        const newInv = new BeltInventory(beltInv.length - 1, beltInv.type);
        newInv._onCircle = true;
        for (let i = 0; i < beltInv.length; i++) newInv.setInventory(i, beltInv.getInventory(i));
        newInv.updateCount();
        return newInv;
    }


    private updateCount(): void {
        this._count = this._inventory.reduce((acc, cur) => acc + (cur.isEmpty() ? 0 : 1), 0);
    }
}

export class BeltInstance {
    public readonly beltType: Belt;
    public static readonly imgCache: HTMLImageElement;

    // On_building elements
    private _vaild: boolean = true;
    private _started: boolean = false;
    public start: MachineInstance | BeltSec | portInstance | null = null;
    public startPos: Vector2 | null = null;
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

    public setStart(start: MachineInstance | BeltSec | portInstance | null, pos: Vector2) {
        if (start == null) {
            this.startPos = pos.floor();
            this.start = null;
            this._vaild = false;
        }
        else {
            this.startPos = pos.floor();
            this.start = start;
            this._vaild = true;
        }
    }

    public lockStart() {
        if (this._vaild) this._started = true;
    }

    public get started() {
        return this._started;
    }

    public setEnd(end: Vector2, instance?: MachineInstance) {
        if (!this._started || !this.startPos) return;
        const port = instance?.closestPort(end, true, EnumItemType.SOLID);
        if (!port) {
            this.end = null;
            this.endPoint = end;
        }
        else {
            this.end = instance!;
            this.endPoint = port.position!.sub(port.direction);
        }

        let startDirec: number;
        if (this.start instanceof MachineInstance) {
            const start = this.start.closestPort(this.endPoint, false, EnumItemType.SOLID);
            if (start === null) return;
            startDirec = Vector2.toIndex(start.direction)!;
            this.startPos = start.position.add(Vector2.DIREC[startDirec]).floor();
        }
        else if (this.start instanceof BeltSec) {
            if (this.start.position.equal(this.startPos)) {
                startDirec = this.start.owner.direc[this.start.index];
                this.startPos = this.start.position;
            }
            else {
                startDirec = this.start.owner.direc[this.start.index + 1];
                this.startPos = this.start.position.add(Vector2.DIREC[startDirec]);
            }
        }
        else if (this.start instanceof portInstance) {
            startDirec = Vector2.toIndex(this.start.direction)!
            this.startPos = this.start.position.add(Vector2.DIREC[startDirec]).floor();
        }
        else throw new Error("start point is null");

        this.direc = [startDirec];

        const relative: Vector2 = this.endPoint.floor().sub(this.startPos);
        const inFaceLength: number = relative.dot(Vector2.DIREC[startDirec]);
        const dir_a = Vector2.toCW(startDirec);
        const dir_b = Vector2.toCCW(startDirec);
        const dir_back = Vector2.toBACK(startDirec);
        const l = relative.dot(Vector2.DIREC[dir_a]);

        if (inFaceLength >= 0) {
            // end在面朝方向，前进至垂直
            for (let i = 0; i < inFaceLength; i++) this.direc.push(startDirec);
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
        console.debug("belt directions:", this.direc);
    }

    public get length(): number {
        return this.direc.length - 1;
    }

    public beltDIrec(index: number): number {
        if (index >= this.length) throw new Error("index out of range");
        return Vector2.ABtoIndex(this.direc[index], this.direc[index + 1]);
    }

    public postions(): ReadonlyArray<Vector2> {
        if (!this.startPos) return [];
        const arr: Array<Vector2> = [];
        let point: Vector2 = Vector2.copy(this.startPos);
        arr.push(point);
        for (let i = 1; i < this.length; i++) {
            point = point.add(Vector2.DIREC[this.direc[i]]);
            arr.push(point);
        }
        return arr;
    }

    public build() {
        if (!this.startPos) return;
        if (!this.inventory) this.inventory = new BeltInventory(this.length, this.beltType.type);
        this.sections = new Array<BeltSec>(this.length);
        let point: Vector2 = Vector2.copy(this.startPos);
        this.sections[0] = new BeltSec(this, 0, this.direc[0], this.direc[1], point);
        for (let i = 1; i < this.length; i++) {
            point = point.add(Vector2.DIREC[this.direc[i]]);
            this.sections[i] = new BeltSec(this, i, this.direc[i], this.direc[i + 1], point);
        }
    }

    // break this belt instance after index, return the newly instance. the cut index should not be the last one.
    public breakAfter(index: number): BeltInstance {
        if (this.sections === null) throw new Error("belt sections is null");

        const newBelt = new BeltInstance(this.beltType);
        newBelt.direc = this.direc.slice(index + 1);
        this.direc = this.direc.slice(0, index + 2);

        if (newBelt.length === 0) throw new Error("new belt length is 0");

        return newBelt;
    }

    public changeEnd(direc: number) {
        this.direc[this.length + 1] = direc;
        if (this.sections === null) return;
        this.sections[this.length] = new BeltSec(
            this, this.length,
            this.direc[this.length], this.direc[this.length + 1],
            this.sections[this.length].position);
    }

    public changeStart(direc: number) {
        this.direc[0] = direc;
        if (this.sections === null) return;
        this.sections[this.length] = new BeltSec(
            this, 0,
            this.direc[0], this.direc[1],
            this.sections[0].position);
    }

    public static concatCircle(belt: BeltInstance) {
        if (belt.inventory) belt.inventory = BeltInventory.circle(belt.inventory);
    }

    public static concat(belt0: BeltInstance, belt1: BeltInstance): BeltInstance {
        console.log("concat belt0 length: " + belt0.length + " belt1 length: " + belt1.length);
        if (belt0.beltType !== belt1.beltType) throw new Error("Belt type mismatch");
        if (belt0.direc[belt0.length] !== belt1.direc[0]) throw new Error("Belt direction mismatch");
        const newBelt = new BeltInstance(belt0.beltType);
        newBelt.startPos = belt0.startPos;

        // 连接方向数组，跳过belt1的第一个元素避免重复
        newBelt.direc = belt0.direc.concat(belt1.direc.slice(1));

        // 设置起点和终点
        newBelt.start = belt0.start;
        newBelt.end = belt1.end;
        newBelt.endPoint = belt1.endPoint;
        newBelt._started = true;

        // 合并库存系统
        if (belt0.inventory && belt1.inventory) {
            newBelt.inventory = BeltInventory.concat(belt0.inventory, belt1.inventory);
        }
        newBelt.build();

        console.log("new belt length:", newBelt.length);

        return newBelt;
    }

    public static cutDirec(belt: BeltInstance, closeOne: boolean, index: number, toward: number): [BeltInstance | null, BeltInstance | null] {
        console.log("cut belt length:", belt.length);
        if (belt.sections === null) throw new Error("belt sections is null");

        // 创建两个新的传送带实例
        const newBelt0 = new BeltInstance(belt.beltType);
        const newBelt1 = new BeltInstance(belt.beltType);

        // 分割方向数组
        if (closeOne) {
            newBelt0.direc = [...belt.direc.slice(0, index), toward];
            newBelt1.direc = belt.direc.slice(index);
        }
        else {
            newBelt0.direc = belt.direc.slice(0, index + 1);
            newBelt1.direc = [toward, ...belt.direc.slice(index + 1)];
        }

        const able0 = newBelt0.length > 0;
        const able1 = newBelt1.length > 0;

        // 如果原传送带有库存系统，则分割库存
        if (belt.inventory) {
            if (able0) newBelt0.inventory = BeltInventory.cut(belt.inventory, 0, index);
            if (able1) newBelt1.inventory = BeltInventory.cut(belt.inventory, index, belt.inventory.length);
        }

        // 设置新传送带0的属性
        if (able0) {
            newBelt0.startPos = belt.startPos;
            newBelt0.endPoint = belt.sections[index - 1].position;
        }
        if (able1) {
            // 设置新传送带1的属性
            newBelt1.startPos = belt.sections[index].position;
            newBelt1.endPoint = belt.endPoint;
        }
        // 构建传送带段
        newBelt0.build();
        newBelt1.build();

        console.log("cutToward to", toward, "new belt0 length:", newBelt0.length, "new belt1 length:", newBelt1.length);

        return [able0 ? newBelt0 : null, able1 ? newBelt1 : null];
    }

    public static cutCircle(belt: BeltInstance, closerOne: boolean, index: number, toward: number): BeltInstance {
        console.log("cut belt length:", belt.length);
        if (belt.sections === null) throw new Error("belt sections is null");

        // 分割方向数组
        if (closerOne)
            belt.direc = [...belt.direc.slice(index), ...belt.direc.slice(1, index), toward];
        else
            belt.direc = [toward, ...belt.direc.slice(index + 1), ...belt.direc.slice(1, index + 1)];

        // 如果原传送带有库存系统，则分割库存
        if (belt.inventory) belt.inventory = BeltInventory.cutCircle(belt.inventory, index);

        // 设置新传送带0的属性
        belt.startPos = belt.sections[index].position;
        belt.endPoint = belt.sections[(index - 1 + belt.length) % belt.length].position;
        // 构建传送带段
        belt.build();

        console.log("cutCircle to", toward, "new belt length:", belt.length);

        return belt;
    }
}