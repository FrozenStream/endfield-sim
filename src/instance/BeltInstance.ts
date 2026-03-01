import { Belt } from "../proto/Belt";
import { ItemStack } from "../proto/ItemStack";
import { Config } from "../utils/Config";
import EnumItemType from "../utils/EnumItemType";
import Vector2 from "../utils/Vector2";
import { MachineInstance, portInstance } from "./MachineInstance";

export class BeltSec {
    owner: BeltInstance;
    index: number;
    private _direc: number;
    private _fromDirec: number;
    private _toDirec: number;
    position: Vector2;
    constructor(owner: BeltInstance, index: number, fromDirec: number, toDirec: number, position: Vector2) {
        this.owner = owner;
        this.index = index;
        this._direc = Vector2.ABtoIndex(fromDirec, toDirec);
        this._fromDirec = fromDirec;
        this._toDirec = toDirec;
        this.position = position;
    }

    get type(): EnumItemType { return this.owner.ItemType; }

    get direc(): number { return this._direc; }
    get fromDirec(): number { return this._fromDirec; }
    get toDirec(): number { return this._toDirec; }

    set fromDirec(fromDirec: number) {
        this._fromDirec = fromDirec;
        this._direc = Vector2.ABtoIndex(this._fromDirec, this._toDirec);
    }

    set toDirec(toDirec: number) {
        this._toDirec = toDirec;
        this._direc = Vector2.ABtoIndex(this._fromDirec, this._toDirec);
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

    public cut(start: number, end: number): BeltInventory {
        if (start > end) throw new Error("start > end");
        const newInv = new BeltInventory(end - start, this.type);

        for (let i = 0; i < end - start; i++) newInv.setInventory(i, this.getInventory(start + i));
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
    public endPoint: Vector2 | null = null;

    // data elements
    public sections: BeltSec[] | null = null;
    public inventory: BeltInventory | null = null;



    constructor(beltType: Belt) {
        this.beltType = beltType;
    }

    get ItemType(): EnumItemType {
        return this.beltType.type;
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
        const closestPort = instance?.closestPort(end, true, EnumItemType.SOLID);
        if (!closestPort) this.endPoint = end;
        else this.endPoint = closestPort.position.sub(Vector2.DIREC[closestPort.direc]);

        let startDirec: number;
        if (this.start instanceof MachineInstance) {
            const start = this.start.closestPort(this.endPoint, false, EnumItemType.SOLID);
            if (start === null) return;
            startDirec = start.direc;
            this.startPos = start.position.add(Vector2.DIREC[startDirec]).floor();
        }
        else if (this.start instanceof BeltSec) {
            if (this.start.position.equal(this.startPos)) startDirec = this.start.fromDirec;
            else startDirec = this.start.toDirec;
        }
        else if (this.start instanceof portInstance) {
            startDirec = this.start.direc;
            this.startPos = this.start.position.add(Vector2.DIREC[startDirec]).floor();
        }
        else throw new Error("start point is null");

        this.sections = [];
        let pos: Vector2 = this.startPos;
        let direc: number = startDirec;

        const relative: Vector2 = this.endPoint.floor().sub(this.startPos);
        const inFaceLength: number = relative.dot(Vector2.DIREC[startDirec]);
        const dir_a = Vector2.toCW(startDirec);
        const dir_b = Vector2.toCCW(startDirec);
        const dir_back = Vector2.toBACK(startDirec);
        const l = relative.dot(Vector2.DIREC[dir_a]);

        if (inFaceLength >= 0) {
            // end在面朝方向，前进至垂直
            for (let i = 0; i < inFaceLength; i++) {
                this.sections.push(new BeltSec(this, this.sections.length, direc, startDirec, pos));
                direc = startDirec;
                pos = pos.add(Vector2.DIREC[direc]);
            }
            // 转向
            if (l >= 0) for (let j = 0; j < l; j++) {
                this.sections.push(new BeltSec(this, this.sections.length, direc, dir_a, pos));
                direc = dir_a;
                pos = pos.add(Vector2.DIREC[direc]);
            }
            else for (let j = 0; j < -l; j++) {
                this.sections.push(new BeltSec(this, this.sections.length, direc, dir_b, pos));
                direc = dir_b;
                pos = pos.add(Vector2.DIREC[direc]);
            }
        }
        else {
            // 若有转向空间
            if (l > 0) {
                for (let j = 0; j < l; j++) {
                    this.sections.push(new BeltSec(this, this.sections.length, direc, dir_a, pos));
                    direc = dir_a;
                    pos = pos.add(Vector2.DIREC[direc]);
                }
                for (let j = 0; j < -inFaceLength; j++) {
                    this.sections.push(new BeltSec(this, this.sections.length, direc, dir_back, pos));
                    direc = dir_back;
                    pos = pos.add(Vector2.DIREC[direc]);
                }
            }
            if (l < 0) {
                for (let j = 0; j < -l; j++) {
                    this.sections.push(new BeltSec(this, this.sections.length, direc, dir_b, pos));
                    direc = dir_b;
                    pos = pos.add(Vector2.DIREC[direc]);
                }
                for (let j = 0; j < -inFaceLength; j++) {
                    this.sections.push(new BeltSec(this, this.sections.length, direc, dir_back, pos));
                    direc = dir_back;
                    pos = pos.add(Vector2.DIREC[direc]);
                }
            }
        }

        if (!closestPort)
            this.sections.push(new BeltSec(this, this.sections.length, direc, direc, pos));
        else if (!Vector2.isOpposite(direc, closestPort.direc))
            this.sections.push(new BeltSec(this, this.sections.length, direc, closestPort.direc, pos));
    }

    public get length(): number {
        return this.sections ? this.sections.length : -1;
    }

    public build() {
        if (!this.inventory) this.inventory = new BeltInventory(this.length, this.beltType.type);
        if (this.sections)
            for (let i = 0; i < this.sections.length; i++) {
                this.sections[i].owner = this;
                this.sections[i].index = i;
            }
    }

    public static concatCircle(belt: BeltInstance) {
        if (belt.inventory) belt.inventory = BeltInventory.circle(belt.inventory);
    }

    public static concat(belt0: BeltInstance, belt1: BeltInstance): BeltInstance {
        console.log("concat belt0 length: " + belt0.length + " belt1 length: " + belt1.length);
        if (belt0.beltType !== belt1.beltType) throw new Error("Belt type mismatch!");
        if (!belt0.sections || !belt1.sections) throw new Error("Belt is not ready!");
        if (belt0.sections[belt0.length - 1].toDirec !== belt1.sections[0].fromDirec) throw new Error("Belt direction mismatch");
        const newBelt = new BeltInstance(belt0.beltType);
        newBelt.startPos = belt0.startPos;

        // 设置起点和终点
        newBelt.sections = belt0.sections.concat(belt1.sections);
        newBelt._started = true;

        // 合并库存系统
        if (belt0.inventory && belt1.inventory) {
            newBelt.inventory = BeltInventory.concat(belt0.inventory, belt1.inventory);
        }
        newBelt.build();
        console.log("new belt length:", newBelt.length);

        return newBelt;
    }

    public cutDirec(isToDirec: boolean, index: number, toward: number): BeltInstance {
        if (this.sections === null || this.inventory === null) throw new Error("belt sections is null");
        const newBelt = new BeltInstance(this.beltType);

        if (isToDirec) {
            newBelt.sections = this.sections.slice(index + 1);
            this.sections = this.sections.slice(0, index + 1);
            this.sections[this.length - 1].toDirec = toward;

            newBelt.inventory = this.inventory.cut(index + 1, this.inventory.length);
            this.inventory = this.inventory.cut(0, index + 1);
        }
        else {
            newBelt.sections = this.sections.slice(index);
            this.sections = this.sections.slice(0, index);
            newBelt.sections[0].fromDirec = toward;
            newBelt.inventory = this.inventory.cut(index, this.inventory.length);
            this.inventory = this.inventory.cut(0, index);
        }

        // 更新传送带段
        this.build();
        newBelt.build();

        console.log("cutToward to", toward, "belt length:", this.length, "new belt length:", newBelt.length);

        return newBelt;
    }

    public cutCircle(isToDirec: boolean, index: number, toward: number): BeltInstance {
        console.log("cut belt length:", this.length);
        if (this.sections === null || this.inventory === null) throw new Error("belt sections is null");

        // 分割方向数组
        if (isToDirec) {
            this.sections[index].toDirec = toward;
            this.sections = [...this.sections.slice(index + 1), ...this.sections.slice(0, index + 1)];
            this.inventory = BeltInventory.cutCircle(this.inventory, index + 1);
        }
        else {
            this.sections[index].fromDirec = toward;
            this.sections = [...this.sections.slice(index), ...this.sections.slice(0, index)];
            this.inventory = BeltInventory.cutCircle(this.inventory, index);
        }

        this.build();

        console.log("cutCircle to", toward, "new belt length:", this.length);

        return this;
    }
}