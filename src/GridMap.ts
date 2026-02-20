import { MachineInstance, type portInstance } from "./instance/MachineInstance";
import { type Belt } from "./proto/Belt";
import { BeltInstance, BeltSec } from "./instance/BeltInstance";
import { Machine } from "./proto/Machines";
import type Rect from "./utils/Rect";
import Vector2 from "./utils/Vector2";


interface GridCell {
    occupied: boolean;
    by: MachineInstance | BeltSec | null;
    beltDirec: number | null;
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
                    if (this.isOccupied(v)) list.push(v);
                }
            }
        }
        else {
            if (!this._previewing.started) return [];
            const vecs: ReadonlyArray<Vector2> = this._previewing.shape();
            for (let i = 0; i < vecs.length; i++) {
                const pos = vecs[i];
                const direc = this._previewing.shapeAt(i);
                if (this.isOccupiedBy(pos.floor()) instanceof MachineInstance) list.push(pos);
                const mapDirec = this.occupyingDirec(pos);
                if (mapDirec && (Vector2.isOpposite(direc, mapDirec) || Vector2.isDiagonal(mapDirec) || Vector2.isDiagonal(direc))) list.push(pos);
            }
        }
        return list;
    }


    private clampMachineShape(vec: Vector2, instance: MachineInstance) {
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
            this.clampMachineShape(vec, this._previewing);
            this._previewing.Position = vec;
        }
        else if (this._previewing instanceof BeltInstance) {
            console.log("Belt started? ", this._previewing.started);
            vec.clampSelf(0, 0, this._width, this._height);
            const occupied: MachineInstance | BeltSec | null = this.isOccupiedBy(vec);
            if (!this._previewing.started) {
                if (occupied instanceof MachineInstance) this._previewing.setStart(occupied);
                else this._previewing.setStart(vec);
            }
            else {
                if (occupied instanceof MachineInstance) this._previewing.setEnd(vec, occupied);
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

    public isOutside(pos: Vector2): boolean {
        return pos.x < 0 || pos.x >= this._width || pos.y < 0 || pos.y >= this._height;
    }

    public isOccupied(pos: Vector2): boolean {
        if (this.isOutside(pos)) return false;
        return this.grid[pos.y][pos.x].occupied;
    }

    public isOccupiedBy(pos: Vector2): MachineInstance | BeltSec | null {
        if (this.isOutside(pos)) return null;
        pos = pos.floor();
        return this.grid[pos.y][pos.x].by;
    }

    public occupyingDirec(pos: Vector2): number | null {
        if (this.isOutside(pos)) return null;
        return this.grid[pos.y][pos.x].beltDirec;
    }

    public build(): boolean {
        if (this._previewing === null) return false;
        if (this._previewing instanceof MachineInstance) {
            this._machines.add(this._previewing)
            this._previewing.build();
            // 标记领地
            const rect: Rect = this._previewing.rect!;
            for (let i = 0; i < rect.h; i++) {
                for (let j = 0; j < rect.w; j++) {
                    this.grid[rect.min_y + i][rect.min_x + j].occupied = true;
                    this.grid[rect.min_y + i][rect.min_x + j].by = this._previewing;
                }
            }
            console.log("built", this._previewing, "total:", this._machines.size, "machines");
            // 清空预览
            this._previewing = null;
            return true;
        }
        else if (this._previewing instanceof BeltInstance) {
            this._belts.add(this._previewing);
            this._previewing.build();
            if (!this._previewing.sections) return false;
            // 标记领地
            const list: ReadonlyArray<Vector2> = this._previewing.shape();
            for (let i = 0; i < list.length; i++) {
                const pos: Vector2 = list[i];
                this.grid[pos.y][pos.x].occupied = true;
                this.grid[pos.y][pos.x].by = this._previewing.sections[i];
                this.grid[pos.y][pos.x].beltDirec = this._previewing.shapeAt(i);
            };
            console.log("built", this._previewing, "total:", this._belts.size, "belts");
            // 清空预览
            this._previewing = null;
            return true;
        }
        return false;
    }

    public beltConcat(belt0: BeltInstance, belt1: BeltInstance) {
        const newBelt = BeltInstance.concat(belt0, belt1);
        this.clearBelt(belt0);
        this.clearBelt(belt1);
    }

    private clearBelt(belt: BeltInstance) {
        if (!belt.sections) return;
        for (const section of belt.sections) {
            const pos = section.position;
            this.grid[pos.y][pos.x].by = null;
        }
    }

    public get allMachines(): ReadonlySet<MachineInstance> {
        return this._machines;
    }

    public get allBelts(): ReadonlySet<BeltInstance> {
        return this._belts;
    }

    public portConnecting(port: portInstance): BeltSec | null {
        if (port.portGroup.isIn) {
            const pos = port.postion.sub(port.direction).floor();
            const t = this.isOccupiedBy(pos);
            if (t instanceof BeltSec) return t;
        }
        else {
            const pos = port.postion.add(port.direction).floor();
            const t = this.isOccupiedBy(pos);
            if (t instanceof BeltSec) return t;
        }
        return null;
    }

    private updateMachine(instance: MachineInstance) {
        if (!instance.portInstances || !instance.pollingPointer) return;
        for (let i = 0; i < instance.portInstances.length; i++) {
            const begin: number = instance.pollingPointer[i];
            const group: portInstance[] = instance.portInstances[i];
            for (let j = 0; j < group.length; j++) {
                const current: number = (begin + j) % group.length;
                const connecting = this.portConnecting(group[current]);
                // 若该端口成功动作，则将轮询初始指针拨到下一个端口
                if (connecting && group[current].portGroup.callback(connecting.owner, instance))
                    instance.pollingPointer[i] = (current + 1) % group.length;
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


export default this;