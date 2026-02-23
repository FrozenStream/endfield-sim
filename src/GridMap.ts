import { MachineInstance, portInstance } from "./instance/MachineInstance";
import { type Belt } from "./proto/Belt";
import { BeltInstance, BeltSec } from "./instance/BeltInstance";
import { Machine } from "./proto/Machines";
import type Rect from "./utils/Rect";
import Vector2 from "./utils/Vector2";


interface GridCell {
    occupied: boolean;
    by: MachineInstance | portInstance | BeltSec | null;
}

export class GridMap {
    private grid: GridCell[][];
    private _width: number = 80;
    private _height: number = 80;

    private _previewing: MachineInstance | BeltInstance | null = null;

    private _belts: Set<BeltInstance> = new Set<BeltInstance>();
    private _machines: Set<MachineInstance> = new Set<MachineInstance>();

    constructor(width: number, height: number) {
        this.grid = Array.from(
            { length: height },
            () => Array.from({ length: width }, () => ({ occupied: false, by: null, beltDirec: null }))
        );
        this._width = width;
        this._height = height;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public set PreviewMachine(machine: Machine) {
        this._previewing = new MachineInstance(machine);
    }

    public get PreviewMachine(): MachineInstance | null {
        return (this._previewing instanceof MachineInstance) ? this._previewing : null;
    }

    public set PreviewBelt(belt: Belt) {
        this._previewing = new BeltInstance(belt);
    }

    public get PreviewBelt(): BeltInstance | null {
        return (this._previewing instanceof BeltInstance) ? this._previewing : null;
    }

    public get onPreview(): boolean {
        return this._previewing !== null;
    }

    public howOccupying(): Vector2[] {
        const list: Vector2[] = [];
        if (this._previewing === null) return list;
        if (this._previewing instanceof MachineInstance) {
            const rect: Rect | null = this._previewing.rect;
            if (rect === null) return list;
            for (let i = 0; i < rect.h; i++) {
                for (let j = 0; j < rect.w; j++) {
                    const v: Vector2 = new Vector2(rect.min_x + j, rect.min_y + i);
                    if (this._isOccupied(v)) list.push(v);
                }
            }
        }
        else {
            if (!this._previewing.started) return [];
            const vecs: ReadonlyArray<Vector2> = this._previewing.postions();
            for (let i = 0; i < this._previewing.length; i++) {
                const pos = vecs[i].floor();
                if (Vector2.isOpposite(this._previewing.direc[i], this._previewing.direc[i + 1])) {
                    list.push(pos); continue;
                }
                const direc = this._previewing.beltDIrec(i);
                const by = this.isOccupiedBy(pos);
                if (by instanceof MachineInstance) list.push(pos);
                else if (by instanceof portInstance) list.push(pos);
                else if (by instanceof BeltSec) {
                    if (Vector2.isOpposite(direc, by.direc) || (Vector2.isDiagonal(by.direc) && Vector2.isDiagonal(direc) && i > 0)) list.push(pos);
                }
            }
        }
        return list;
    }


    private _clampMachineShape(vec: Vector2, instance: MachineInstance) {
        return vec.clampSelf(
            instance.machine.width / 2,
            instance.machine.height / 2,
            this._width - instance.machine.width / 2,
            this._height - instance.machine.height / 2
        );
    }

    /**
     * @param mouseX 鼠标X网格坐标(float)
     * @param mouseY 鼠标Y网格坐标(float)
     */
    public previewPositon(mouseX: number, mouseY: number) {
        const vec: Vector2 = new Vector2(mouseX, mouseY);
        if (this._previewing instanceof MachineInstance) {
            this._clampMachineShape(vec, this._previewing);
            this._previewing.Position = vec;
        }
        else if (this._previewing instanceof BeltInstance) {
            const vecfloor = vec.clampSelf(0, 0, this._width, this._height).floor();
            const occupied: MachineInstance | portInstance | BeltSec | null = this.isOccupiedBy(vecfloor);
            const surrounding: BeltSec | portInstance | null = this._beltStartCheckSurrounding(vecfloor);
            if (!this._previewing.started) {
                if (occupied instanceof MachineInstance) this._previewing.setStart(occupied, vec);
                else if (occupied instanceof portInstance) this._previewing.setStart(occupied.owner, vec);
                else if (occupied instanceof BeltSec) this._previewing.setStart(occupied, vec);
                else if (surrounding) this._previewing.setStart(surrounding, vec);
                else this._previewing.setStart(null, vec);
            }
            else {
                if (occupied instanceof MachineInstance) this._previewing.setEnd(vec, occupied);
                else if (occupied instanceof portInstance) this._previewing.setEnd(vec, occupied.owner);
                else this._previewing.setEnd(vec);
            }
        }
    }

    public previewRotate(time: number) {
        if (this._previewing instanceof MachineInstance)
            this._previewing.rotate(time);
    }

    public previewCancel() {
        this._previewing = null;
    }

    private _isOutside(pos: Vector2): boolean {
        return pos.x < 0 || pos.x >= this._width || pos.y < 0 || pos.y >= this._height;
    }

    private _isOccupied(pos: Vector2): boolean {
        if (this._isOutside(pos)) return false;
        return this.grid[pos.y][pos.x].occupied;
    }

    public isOccupiedBy(pos: Vector2): MachineInstance | portInstance | BeltSec | null {
        if (this._isOutside(pos)) return null;
        return this.grid[pos.y][pos.x].by;
    }

    public buildInstance(): boolean {
        if (this._previewing === null) return false;
        if (this._previewing instanceof MachineInstance) {
            this._machines.add(this._previewing)
            this._previewing.build();
            this._markMachineArea(this._previewing);
            console.log("built", this._previewing, "total:", this._machines.size, "machines");
            this._previewing = null;
            return true;
        }
        else if (this._previewing instanceof BeltInstance) {
            const breakHeadList: { pos: Vector2, direc: number }[] = [];
            const breakTailList: { pos: Vector2, direc: number }[] = [];
            const deleteList: { pos: Vector2 }[] = [];
            const buildList: { start: Vector2, direc: number[] }[] = [];

            let start = this._previewing.startPos!;
            let owner = this.isOccupiedBy(start) as BeltSec;
            let newBeltStart: Vector2 | null = owner === null ? start : null;
            let newBeltDirec: number[] = owner === null ? [this._previewing.direc[0]] : [];
            const NewPostions = this._previewing.postions();
            for (let i = 1; i < this._previewing.length; i++) {
                const next = NewPostions[i];
                const nextOwner = this.isOccupiedBy(next) as BeltSec;
                if (owner !== nextOwner) {
                    if (owner && owner.toDirec !== this._previewing.direc[i])
                        breakTailList.push({ pos: start, direc: this._previewing.direc[i] });
                    if (nextOwner && nextOwner.fromDirec !== this._previewing.direc[i])
                        breakHeadList.push({ pos: next, direc: this._previewing.direc[i] });
                    if (owner === null) {
                        if (newBeltStart) buildList.push({ start: newBeltStart, direc: [...newBeltDirec, this._previewing.direc[i]] });
                        newBeltStart = null;
                        newBeltDirec = [];
                    }
                    if (nextOwner === null) {
                        newBeltStart = next;
                        newBeltDirec = [this._previewing.direc[i]];
                    }
                }
                if (owner === nextOwner && owner === null && nextOwner === null) newBeltDirec.push(this._previewing.direc[i]);
                start = next;
                owner = nextOwner;
            }
            if (newBeltStart) buildList.push({ start: newBeltStart, direc: [...newBeltDirec, this._previewing.direc[this._previewing.length]] });

            breakTailList.forEach(({ pos, direc }) => {
                const sec = this.isOccupiedBy(pos) as BeltSec;
                if (sec.owner.inventory?._onCircle) {
                    const newBelt = this._beltCutCircleDirec(sec.owner, true, sec.index + 1, direc);
                    this._beltNewConnect(newBelt);
                }
                else {
                    const [newBelt0, _] = this._beltCutDirec(sec.owner, true, sec.index + 1, direc);
                    if (newBelt0) this._beltNewConnect(newBelt0);
                }
            })
            breakHeadList.forEach(({ pos, direc }) => {
                const sec = this.isOccupiedBy(pos) as BeltSec;
                if (sec.owner.inventory?._onCircle) {
                    const newBelt = this._beltCutCircleDirec(sec.owner, false, sec.index, direc);
                    this._beltNewConnect(newBelt);
                }
                else {
                    const [_, newBelt1] = this._beltCutDirec(sec.owner, false, sec.index, direc);
                    if (newBelt1) this._beltNewConnect(newBelt1);
                }
            })
            buildList.forEach(({ start, direc }) => {
                const newinstance = new BeltInstance((this._previewing as BeltInstance).beltType);
                newinstance.startPos = start;
                newinstance.direc = direc;
                newinstance.build();
                this._markBeltArea(newinstance);
                this._belts.add(newinstance);
                this._beltNewConnect(newinstance);
                console.log("buildList built", newinstance, "total:", this._belts.size, "belts");
            })
            return true;
        }
        return false;
    }

    private _beltNewConnect(belt: BeltInstance) {
        const headbelt = this._beltfindHeadConcatAble(belt);
        const tailbelt = this._beltfindTailConcatAble(belt);
        console.log("headbelt", headbelt);
        console.log("tailbelt", tailbelt);

        if (headbelt === tailbelt && headbelt) {
            if (belt === headbelt) this._beltConcat(belt, belt);
            else {
                belt = this._beltConcat(headbelt, belt);
                this._beltConcat(belt, belt);
            }
        }
        else {
            if (headbelt) belt = this._beltConcat(headbelt, belt);
            if (tailbelt) belt = this._beltConcat(belt, tailbelt);
        }
    }

    private _beltfindHeadConcatAble(instance: BeltInstance): BeltInstance | null {
        if (instance.sections === null) return null;
        const pos: Vector2 = instance.sections[0].position;
        const direc: number = instance.direc[0];

        const point = pos.sub(Vector2.DIREC[direc]);
        const by = this.isOccupiedBy(point);
        if (!(by instanceof BeltSec)) return null;
        if (by.index === by.owner.length - 1 && by.owner.direc[by.owner.length] === direc) return by.owner;

        return null;
    }

    private _beltfindTailConcatAble(instance: BeltInstance): BeltInstance | null {
        if (instance.sections === null) return null;
        const length = instance.length;
        const pos: Vector2 = instance.sections[length - 1].position;
        const direc: number = instance.direc[length];

        const point = pos.add(Vector2.DIREC[direc]);
        const by = this.isOccupiedBy(point);
        if (!(by instanceof BeltSec)) return null;
        if (by.owner.direc[0] === direc) return by.owner;

        return null;
    }

    private _beltConcat(belt0: BeltInstance, belt1: BeltInstance): BeltInstance {
        if (belt0 === belt1) {
            BeltInstance.concatCircle(belt0);
            console.log("Building CIRCLE", belt0);
            return belt0;
        }
        const newBelt = BeltInstance.concat(belt0, belt1);
        this._markBeltArea(newBelt);
        this._belts.delete(belt0);
        this._belts.delete(belt1);
        this._belts.add(newBelt);
        console.log("beltConcat built", this._previewing, "total:", this._belts.size, "belts");
        return newBelt;
    }

    public destroyInstance(instance: MachineInstance | BeltInstance | null) {
        if (instance === null) return false;
        if (instance instanceof MachineInstance && this._machines.has(instance)) {
            this._machines.delete(instance)
            this._clearMachineArea(instance);
            console.log("delete", instance, "total:", this._machines.size, "machines");
            return true;
        }
        else if (instance instanceof BeltInstance) {
            this._belts.delete(instance);
            this._clearBeltArea(instance);
            console.log("delete", instance, "total:", this._belts.size, "belts");
        }
        return false;
    }

    private _markMachineArea(instance: MachineInstance): void {
        const rect: Rect = instance.rect!;
        for (let i = 0; i < rect.h; i++) {
            for (let j = 0; j < rect.w; j++) {
                this.grid[rect.min_y + i][rect.min_x + j].occupied = true;
                this.grid[rect.min_y + i][rect.min_x + j].by = instance;
            }
        }
        for (const portGroup of instance.portInstances!)
            for (const port of portGroup) {
                const pos = port.position.floor();
                this.grid[pos.y][pos.x].by = port;
                console.log('mark', pos)
            }
    }

    private _clearMachineArea(instance: MachineInstance) {
        const rect: Rect = instance.rect!;
        for (let i = 0; i < rect.h; i++) {
            for (let j = 0; j < rect.w; j++) {
                this.grid[rect.min_y + i][rect.min_x + j].occupied = false;
                this.grid[rect.min_y + i][rect.min_x + j].by = null;
            }
        }
    }

    private _markBeltArea(instance: BeltInstance) {
        if (!instance.sections) return false;
        // 标记领地
        const list: ReadonlyArray<Vector2> = instance.postions();
        for (let i = 0; i < list.length; i++) {
            const pos: Vector2 = list[i];
            this.grid[pos.y][pos.x].occupied = true;
            this.grid[pos.y][pos.x].by = instance.sections[i];
        };
    }

    private _clearBeltArea(instance: BeltInstance) {
        if (!instance.sections) return;
        for (const section of instance.sections) {
            const pos = section.position;
            this.grid[pos.y][pos.x].occupied = false;
            this.grid[pos.y][pos.x].by = null;
        }
    }

    private _markBeltSecArea(sec: BeltSec) {
        const pos = sec.position;
        this.grid[pos.y][pos.x].occupied = true;
        this.grid[pos.y][pos.x].by = sec;
    }

    private _clearBeltSecArea(sec: BeltSec) {
        const pos = sec.position;
        this.grid[pos.y][pos.x].occupied = false;
        this.grid[pos.y][pos.x].by = null;
    }

    private _beltCutCircleDirec(belt: BeltInstance, frontOne: boolean, index: number, toward: number): BeltInstance {
        const newBelt = BeltInstance.cutCircle(belt, frontOne, index, toward);
        this._markBeltArea(newBelt);
        this._belts.delete(belt);
        this._belts.add(newBelt);
        return newBelt;
    }

    private _beltCutDirec(belt: BeltInstance, frontOne: boolean, index: number, toward: number): [BeltInstance | null, BeltInstance | null] {
        const [newBelt0, newBelt1] = BeltInstance.cutDirec(belt, frontOne, index, toward);
        if (newBelt0) this._markBeltArea(newBelt0);
        if (newBelt1) this._markBeltArea(newBelt1);
        this._belts.delete(belt);
        if (newBelt0) this._belts.add(newBelt0);
        if (newBelt1) this._belts.add(newBelt1);
        return [newBelt0, newBelt1];
    }

    private _beltStartCheckSurrounding(start: Vector2): BeltSec | portInstance | null {
        const directions = Vector2.straightVector_digital;
        for (const direction of directions) {
            const point = start.add(Vector2.DIREC[direction]);
            const by = this.isOccupiedBy(point);
            if (!(by instanceof portInstance)) continue;
            if (by.direction.add(by.position).floorSelf().equal(start.floor())) return by;
        }
        for (const direction of directions) {
            const point = start.add(Vector2.DIREC[direction]);
            const by = this.isOccupiedBy(point);
            if (!(by instanceof BeltSec)) continue;
            if (by.owner.direc[by.index + 1] === Vector2.toBACK(direction)) return by;
        }
        return null;
    }

    public get allMachines(): ReadonlySet<MachineInstance> {
        return this._machines;
    }

    public get allBelts(): ReadonlySet<BeltInstance> {
        return this._belts;
    }

    public portConnecting(port: portInstance): BeltSec | null {
        if (port.portGroupSrc.isIn) {
            const pos = port.position.sub(port.direction).floor();
            const t = this.isOccupiedBy(pos);
            if (t instanceof BeltSec) return t;
        }
        else {
            const pos = port.position.add(port.direction).floor();
            const t = this.isOccupiedBy(pos);
            if (t instanceof BeltSec) return t;
        }
        return null;
    }

    private updateMachine(instance: MachineInstance) {
        if (!instance.portInstances || !instance.pollingPointer) return;
        for (let i = 0; i < instance.portInstances.length; i++) {
            const begin: number = instance.pollingPointer[i];
            const portGroup: portInstance[] = instance.portInstances[i];
            for (let j = 0; j < portGroup.length; j++) {
                const current: number = (begin + j) % portGroup.length;
                const connecting = this.portConnecting(portGroup[current]);
                // 若该端口成功动作，则将轮询初始指针拨到下一个端口
                if (connecting && portGroup[current].portGroupSrc.callback(connecting.owner, instance))
                    instance.pollingPointer[i] = (current + 1) % portGroup.length;
            }
        }
        instance.currentMode.working(instance);
    }

    private updateBelt(instance: BeltInstance) {
        if (instance.inventory === null) return;
        instance.inventory.update();
    }

    public update() {
        for (const instance of this._machines) this.updateMachine(instance);
        for (const instance of this._belts) this.updateBelt(instance);
    }
}