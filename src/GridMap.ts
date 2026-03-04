import { MachineInstance, portGroupInstance, portInstance } from "./instance/MachineInstance";
import { Belt } from "./proto/Belt";
import { BeltInstance, BeltSec } from "./instance/BeltInstance";
import type Rect from "./utils/Rect";
import Vector2 from "./utils/Vector2";
import EnumItemType from "./utils/EnumItemType";
import type { Machine } from "./proto/Machines";


interface GridCell {
    machine: MachineInstance | null;
    port: portInstance | null;
    soildBelt: BeltSec | null;
    liquidBelt: BeltSec | null;
    power: number;
}

function isBeltInst(inst: any) { return inst instanceof BeltInstance; }
function isMachineInst(inst: any) { return inst instanceof MachineInstance; }
function isPortInst(inst: any) { return inst instanceof portInstance; }
function isBeltSec(inst: any) { return inst instanceof BeltSec; }

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
            () => Array.from({ length: width }, () => ({
                machine: null,
                port: null,
                soildBelt: null,
                liquidBelt: null,
                power: 0
            }))
        );
        this._width = width;
        this._height = height;
    }

    private _isOutside(pos: Vector2): boolean {
        return pos.x < 0 || pos.x >= this._width || pos.y < 0 || pos.y >= this._height;
    }

    public getBeltSec(pos: Vector2, type: EnumItemType): BeltSec | null {
        if (this._isOutside(pos)) return null;
        if (type === EnumItemType.SOLID) return this.grid[pos.y][pos.x].soildBelt;
        if (type === EnumItemType.LIQUID) this.grid[pos.y][pos.x].liquidBelt;
        return null;
    }

    public getPort(pos: Vector2): portInstance | null {
        if (this._isOutside(pos)) return null;
        return this.grid[pos.y][pos.x].port;
    }

    public getMachine(pos: Vector2): MachineInstance | null {
        if (this._isOutside(pos)) return null;
        return this.grid[pos.y][pos.x].machine;
    }

    private _isOccupied(pos: Vector2): boolean {
        if (this._isOutside(pos)) return false;
        return this.grid[pos.y][pos.x].machine !== null ||
            this.grid[pos.y][pos.x].port !== null ||
            this.grid[pos.y][pos.x].soildBelt !== null ||
            this.grid[pos.y][pos.x].liquidBelt !== null;
    }

    public get width(): number { return this._width; }
    public get height(): number { return this._height; }
    public get allMachines(): ReadonlySet<MachineInstance> { return this._machines; }
    public get allBelts(): ReadonlySet<BeltInstance> { return this._belts; }

    public set PreviewMachine(machine: Machine) { this._previewing = new MachineInstance(machine); }
    public set PreviewBelt(belt: Belt) { this._previewing = new BeltInstance(belt); }
    public get PreviewMachine(): MachineInstance | null { return isMachineInst(this._previewing) ? this._previewing : null; }
    public get PreviewBelt(): BeltInstance | null { return isBeltInst(this._previewing) ? this._previewing : null; }
    public get onPreview(): boolean { return this._previewing !== null; }

    private _howMachineOccupying(inst: MachineInstance): ReadonlyArray<Vector2> {
        const rect: Rect | null = inst.rect;
        if (rect === null) return [];
        const list: Vector2[] = [];
        for (let i = 0; i < rect.h; i++) {
            for (let j = 0; j < rect.w; j++) {
                const v: Vector2 = new Vector2(rect.min_x + j, rect.min_y + i);
                if (this._isOccupied(v)) list.push(v);
            }
        }
        return list;
    }

    private _howBeltOccupying(inst: BeltInstance): ReadonlyArray<Vector2> {
        if (!inst.sections) return [];
        const list: Vector2[] = [];
        const secs: ReadonlyArray<BeltSec> = inst.sections;
        for (let i = 0; i < inst.length; i++) {
            const pos = secs[i].position;
            if (this.getMachine(pos)) list.push(pos);
            const by = this.getBeltSec(pos, inst.ItemType);
            if (by === null) continue;
            if (by.fromDirec !== secs[i].fromDirec && by.toDirec !== secs[i].toDirec
                && Vector2.isDiagonal(by.direc) && Vector2.isDiagonal(secs[i].direc)) list.push(pos);

        }
        return list;
    }

    public howOccupying(): ReadonlyArray<Vector2> {
        if (this._previewing === null) return [];
        if (isMachineInst(this._previewing)) return this._howMachineOccupying(this._previewing);
        else return this._howBeltOccupying(this._previewing);
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
            const m = this.getMachine(vecfloor);
            const b = this.getBeltSec(vecfloor, this._previewing.ItemType);
            const surrounding: BeltSec | portInstance | null = this._beltStartCheckSurrounding(vecfloor, this._previewing.ItemType);
            if (!this._previewing.started) {
                if (m) this._previewing.setStart(m, vec);
                else if (b) this._previewing.setStart(b, vec);
                else if (surrounding) this._previewing.setStart(surrounding, vec);
                else this._previewing.setStart(null, vec);
            }
            else {
                if (m) this._previewing.setEnd(vec, m);
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

    private _buildMachine(inst: MachineInstance) {
        this._machines.add(inst);
        inst.build();
        this._markMachineArea(inst);
        inst.powerOn(this._countPower(inst.rect!));
        if (inst.machine.powerArea) {
            const rect = inst.rect!.spread(inst.machine.powerArea);
            this._addPower(rect, inst.machine.powerArea);
        }
        console.log("built", this._previewing, "total:", this._machines.size, "machines");
        this._previewing = null;
        return true;
    }

    private _buildBelt(inst: BeltInstance) {
        if (!inst.sections) return false;
        const breakTailList: BeltSec[] = [];
        const breakHeadList: BeltSec[] = [];
        const deleteList: BeltSec[] = [];
        const buildList: Array<BeltSec[]> = [];

        let owner = null;
        let newBeltSec: BeltSec[] = [];
        for (let i = 0; i < inst.length; i++) {
            owner = this.getBeltSec(inst.sections[i].position, inst.ItemType);
            if (owner === null) newBeltSec.push(inst.sections[i]);
            else {
                if (newBeltSec.length) buildList.push(newBeltSec);
                newBeltSec = [];
                if (owner.fromDirec !== inst.sections[i].fromDirec && owner.toDirec !== inst.sections[i].toDirec)
                    deleteList.push(inst.sections[i]);
                else if (owner.fromDirec !== inst.sections[i].fromDirec)
                    breakHeadList.push(inst.sections[i]);
                else if (owner.toDirec !== inst.sections[i].toDirec)
                    breakTailList.push(inst.sections[i]);
            }
        }
        if (newBeltSec.length) buildList.push(newBeltSec);

        breakTailList.forEach(sec => {
            const old = this.getBeltSec(sec.position, sec.type)!;
            if (old.owner.inventory!._onCircle) {
                const newBelt = this._beltCutCircleDirec(old, true, sec.toDirec);
                this._beltNewConnect(newBelt);
            }
            else {
                const tailBelt = this._beltCutDirec(old, true, sec.toDirec);
                this._beltNewConnect(sec.owner);
            }
        })
        breakHeadList.forEach(sec => {
            const old = this.getBeltSec(sec.position, sec.type)!;
            if (old.owner.inventory!._onCircle) {
                const newBelt = this._beltCutCircleDirec(old, false, sec.fromDirec);
                this._beltNewConnect(newBelt);
            }
            else {
                const tailBelt = this._beltCutDirec(old, false, sec.fromDirec);
                if (tailBelt) this._beltNewConnect(tailBelt);
            }
        })
        buildList.forEach(list => {
            const newinstance = new BeltInstance(inst.beltType);
            newinstance.sections = list;
            newinstance.build();
            this._markBeltArea(newinstance);
            this._belts.add(newinstance);
            this._beltNewConnect(newinstance);
            console.log("buildList built", newinstance, "total:", this._belts.size, "belts");
        })
        this._previewing = null;
        return true;
    }

    public buildInstance(): boolean {
        if (this._previewing === null) return false;
        if (this._previewing instanceof MachineInstance) return this._buildMachine(this._previewing);
        else if (this._previewing instanceof BeltInstance) return this._buildBelt(this._previewing);
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

    private _beltfindHeadConcatAble(inst: BeltInstance): BeltInstance | null {
        if (inst.sections === null) return null;
        const pos: Vector2 = inst.sections[0].position;
        const direc: number = inst.sections[0].fromDirec;

        const point = pos.sub(Vector2.DIREC[direc]);
        const by = this.getBeltSec(point, inst.ItemType);
        if (by && by.index === by.owner.length - 1 && by.toDirec === direc) return by.owner;

        return null;
    }

    private _beltfindTailConcatAble(inst: BeltInstance): BeltInstance | null {
        if (inst.sections === null) return null;
        const length = inst.length;
        const pos: Vector2 = inst.sections[length - 1].position;
        const direc: number = inst.sections[length - 1].toDirec;

        const point = pos.add(Vector2.DIREC[direc]);
        const by = this.getBeltSec(point, inst.ItemType);
        if (by && by.index === 0 && by.fromDirec === direc) return by.owner;

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
            if (instance.machine.powerArea) {
                const rect = instance.rect!.spread(instance.machine.powerArea);
                this._subPower(rect, instance.machine.powerArea);
            }
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
                this.grid[rect.min_y + i][rect.min_x + j].machine = instance;
            }
        }
        for (const group of instance.portGroupInsts!)
            for (const port of group.ports) {
                const pos = port.position.floor();
                this.grid[pos.y][pos.x].port = port;
                console.log('mark', pos)
            }
    }

    private _clearMachineArea(instance: MachineInstance) {
        const rect: Rect = instance.rect!;
        for (let i = 0; i < rect.h; i++) {
            for (let j = 0; j < rect.w; j++) {
                this.grid[rect.min_y + i][rect.min_x + j].machine = null;
            }
        }
    }

    private _markBeltArea(instance: BeltInstance) {
        if (!instance.sections) return false;
        for (const sec of instance.sections) this._markBeltSec(sec);
    }

    private _clearBeltArea(instance: BeltInstance) {
        if (!instance.sections) return;
        for (const sec of instance.sections) this._clearBeltSec(sec);
    }

    private _markBeltSec(sec: BeltSec) {
        const pos: Vector2 = sec.position;
        const port_out = this.getPort(sec.position.sub(Vector2.DIREC[sec.fromDirec]));
        if (port_out && port_out.direc === sec.fromDirec && sec.type === port_out.type) port_out.owner.insert(port_out);
        const port_in = this.getPort(sec.position.add(Vector2.DIREC[sec.toDirec]));
        if (port_in && port_in.direc === sec.toDirec && sec.type === port_in.type) port_in.owner.insert(port_in);
        if (sec.type === EnumItemType.SOLID) this.grid[pos.y][pos.x].soildBelt = sec;
        if (sec.type === EnumItemType.LIQUID) this.grid[pos.y][pos.x].liquidBelt = sec;
    }

    private _clearBeltSec(sec: BeltSec) {
        const pos = sec.position;
        const port_out = this.getPort(sec.position.sub(Vector2.DIREC[sec.fromDirec]));
        if (port_out && port_out.direc === sec.fromDirec && sec.type === port_out.type) port_out.owner.remove(port_out);
        const port_in = this.getPort(sec.position.add(Vector2.DIREC[sec.toDirec]));
        if (port_in && port_in.direc === sec.toDirec && sec.type === port_in.type) port_in.owner.remove(port_in);
        if (sec.type === EnumItemType.SOLID) this.grid[pos.y][pos.x].soildBelt = null;
        if (sec.type === EnumItemType.LIQUID) this.grid[pos.y][pos.x].liquidBelt = null;
    }

    private _beltCutCircleDirec(sec: BeltSec, isToDirec: boolean, toward: number): BeltInstance {
        sec.owner.cutCircle(isToDirec, sec.index, toward);
        this._markBeltArea(sec.owner);
        return sec.owner;
    }

    private _beltCutDirec(sec: BeltSec, isToDirec: boolean, toward: number): BeltInstance | null {
        const newBelt = sec.owner.cutDirec(isToDirec, sec.index, toward);
        this._markBeltArea(sec.owner);
        if (newBelt.length > 0) {
            this._markBeltArea(newBelt);
            if (newBelt.length > 0) this._belts.add(newBelt);
            return newBelt;
        }
        else return null;
    }

    private _beltStartCheckSurrounding(start: Vector2, type: EnumItemType): BeltSec | portInstance | null {
        const directions = Vector2.straightVector_digital;
        for (const direction of directions) {
            const point = start.add(Vector2.DIREC[direction]);
            const by = this.getPort(point);
            if (by && Vector2.DIREC[by.direc].add(by.position).floorSelf().equal(start.floor())) return by;
        }
        for (const direction of directions) {
            const point = start.add(Vector2.DIREC[direction]);
            const by = this.getBeltSec(point, type);
            if (by && by.toDirec === Vector2.toBACK(direction)) return by;
        }
        return null;
    }

    private updateMachine(instance: MachineInstance) {
        if (!instance.portGroupInsts) return;
        for (let i = 0; i < instance.portGroupInsts.length; i++) {
            const portGroup: portGroupInstance = instance.portGroupInsts[i];
            const begin = portGroup.point;
            const list = portGroup.pollingList;
            for (let j = 0; j < list.length; j++) {
                const current = (begin + j) % list.length;
                const cur_port = list[current];
                const belt_pos = cur_port.isIn ?
                    cur_port.position.sub(Vector2.DIREC[cur_port.direc]).floorSelf() :
                    cur_port.position.add(Vector2.DIREC[cur_port.direc]).floorSelf();
                const connecting = this.getBeltSec(belt_pos, cur_port.type)!;
                // 若该端口成功动作，则将轮询初始指针拨到下一个端口
                if (connecting && cur_port.portGroupSrc.callback(connecting.owner, instance))
                    portGroup.point = (current + 1) % list.length;
            }
        }
        instance.currentMode.working(instance);
    }

    private _addPower(rect: Rect, power: number) {
        for (let i = rect.min_y; i < rect.min_y + rect.h; i++)
            for (let j = rect.min_x; j < rect.min_x + rect.w; j++) {
                if (i < 0 || j < 0 || i >= this.grid.length || j >= this.grid[0].length) continue;
                this.grid[i][j].power += power;
                const by = this.grid[i][j].machine;
                if (by) by.powerOn(power);
            }
    }

    private _subPower(rect: Rect, power: number) {
        for (let i = rect.min_y; i < rect.min_y + rect.h; i++)
            for (let j = rect.min_x; j < rect.min_x + rect.w; j++) {
                if (i < 0 || j < 0 || i >= this.grid.length || j >= this.grid[0].length) continue;
                this.grid[i][j].power -= power;
                const by = this.grid[i][j].machine;
                if (by) by.powerOff(power);
            }
    }

    private _countPower(rect: Rect): number {
        let count = 0;
        for (let i = rect.min_y; i < rect.min_y + rect.h; i++)
            for (let j = rect.min_x; j < rect.min_x + rect.w; j++) {
                if (i < 0 || j < 0 || i >= this.grid.length || j >= this.grid[0].length) continue;
                count += this.grid[i][j].power;
            }
        return count;
    }

    private updateBelt(instance: BeltInstance) {
        if (instance.inventory === null) return;
        instance.inventory.update();
    }

    public rectEffectingMachines(rect: Rect): ReadonlySet<MachineInstance> {
        const set = new Set<MachineInstance>();
        for (let i = rect.min_y; i < rect.min_y + rect.h; i++)
            for (let j = rect.min_x; j < rect.min_x + rect.w; j++) {
                if (i < 0 || j < 0 || i >= this.grid.length || j >= this.grid[0].length) continue;
                const by = this.grid[i][j].machine;
                if (by) set.add(by);
            }
        return set;
    }

    public update() {
        for (const instance of this._machines) this.updateMachine(instance);
        for (const instance of this._belts) this.updateBelt(instance);
    }
}