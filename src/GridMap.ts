import { MachineInstance, type portInstance } from "./instance/MachineInstance";
import { type Belt } from "./proto/Belt";
import { BeltInstance } from "./instance/BeltInstance";
import { Machine } from "./proto/Machines";
import type Rect from "./utils/Rect";
import Vector2 from "./utils/Vector2";


interface GridCell {
    occupied: boolean;
    by: MachineInstance | BeltInstance | null;
    beltDirec: number | null;
}

class GridMap {
    private static grid: GridCell[][];
    private static width: number = 80;
    private static height: number = 80;

    private static _previewing: MachineInstance | BeltInstance | null = null;

    private static _belts: Array<BeltInstance> = [];
    private static _machines: Array<MachineInstance> = [];

    public static init(width: number, height: number) {
        GridMap.grid = Array.from(
            { length: height },
            () => Array.from({ length: width }, () => ({ occupied: false, by: null, beltDirec: null }))
        );
        GridMap.width = width;
        GridMap.height = height;
    }

    public static set PreviewMachine(machine: Machine) {
        GridMap._previewing = new MachineInstance(machine);
    }

    public static get PreviewMachine(): MachineInstance | null {
        return (GridMap._previewing instanceof MachineInstance) ? GridMap._previewing : null;
    }

    public static set PreviewBelt(belt: Belt) {
        GridMap._previewing = new BeltInstance(belt);
    }

    public static get PreviewBelt(): BeltInstance | null {
        return (GridMap._previewing instanceof BeltInstance) ? GridMap._previewing : null;
    }

    public static get onPreview(): boolean {
        return GridMap._previewing !== null;
    }

    public static howOccupying(): Vector2[] {
        const list: Vector2[] = [];
        if (GridMap._previewing === null) return list;
        if (GridMap._previewing instanceof MachineInstance) {
            const rect: Rect | null = GridMap._previewing.rect;
            if (rect === null) return list;
            for (let i = 0; i < rect.h; i++) {
                for (let j = 0; j < rect.w; j++) {
                    const v: Vector2 = new Vector2(rect.min_x + j, rect.min_y + i);
                    if (GridMap.isOccupied(v)) list.push(v);
                }
            }
        }
        else {
            if (!GridMap._previewing.started) return [];
            const vecs: ReadonlyArray<Vector2> = GridMap._previewing.shape();
            for (let i = 0; i < vecs.length; i++) {
                const pos = vecs[i];
                const direc = GridMap._previewing.shapeAt(i);
                if (GridMap.isOccupiedBy(pos.floor()) instanceof MachineInstance) list.push(pos);
                const mapDirec = GridMap.occupyingDirec(pos);
                if (mapDirec && (Vector2.isOpposite(direc, mapDirec) || Vector2.isDiagonal(mapDirec) || Vector2.isDiagonal(direc))) list.push(pos);
            }
        }
        return list;
    }


    private static clampMachineShape(vec: Vector2, instance: MachineInstance) {
        return vec.clampSelf(
            instance.machine.width / 2,
            instance.machine.height / 2,
            GridMap.width - instance.machine.width / 2,
            GridMap.height - instance.machine.height / 2
        );
    }

    /**
     * @param mouseX 鼠标X网格坐标(float)
     * @param mouseY 鼠标Y网格坐标(float)
     */
    public static previewPositon(mouseX: number, mouseY: number) {
        const vec: Vector2 = new Vector2(mouseX, mouseY);
        if (GridMap._previewing instanceof MachineInstance) {
            GridMap.clampMachineShape(vec, GridMap._previewing);
            GridMap._previewing.Position = vec;
        }
        else if (GridMap._previewing instanceof BeltInstance) {
            console.log("Belt started? ", GridMap._previewing.started);
            vec.clampSelf(0, 0, GridMap.width, GridMap.height);
            const occupied: MachineInstance | BeltInstance | null = this.isOccupiedBy(vec);
            if (!GridMap._previewing.started) {
                if (occupied instanceof MachineInstance) GridMap._previewing.setStart(occupied);
                else GridMap._previewing.setStart(vec);
            }
            else {
                if (occupied instanceof MachineInstance) GridMap._previewing.setEnd(vec, occupied);
                else GridMap._previewing.setEnd(vec);
            }
        }
    }

    public static previewRotate(time: number) {
        if (GridMap._previewing instanceof MachineInstance)
            GridMap._previewing.rotate(time);
    }

    public static previewCancel() {
        GridMap._previewing = null;
    }

    public static isOutside(pos: Vector2): boolean {
        return pos.x < 0 || pos.x >= GridMap.width || pos.y < 0 || pos.y >= GridMap.height;
    }

    public static isOccupied(pos: Vector2): boolean {
        if (GridMap.isOutside(pos)) return false;
        return GridMap.grid[pos.y][pos.x].occupied;
    }

    public static isOccupiedBy(pos: Vector2): MachineInstance | BeltInstance | null {
        if (GridMap.isOutside(pos)) return null;
        pos = pos.floor();
        return GridMap.grid[pos.y][pos.x].by;
    }

    public static occupyingDirec(pos: Vector2): number | null {
        if (GridMap.isOutside(pos)) return null;
        return GridMap.grid[pos.y][pos.x].beltDirec;
    }

    public static build(): boolean {
        if (GridMap._previewing === null) return false;
        if (GridMap._previewing instanceof MachineInstance) {
            GridMap._machines.push(GridMap._previewing)
            GridMap._previewing.build();
            // 标记领地
            const rect: Rect = GridMap._previewing.rect!;
            for (let i = 0; i < rect.h; i++) {
                for (let j = 0; j < rect.w; j++) {
                    GridMap.grid[rect.min_y + i][rect.min_x + j].occupied = true;
                    GridMap.grid[rect.min_y + i][rect.min_x + j].by = GridMap._previewing;
                }
            }
            console.log("built", GridMap._previewing, "total:", GridMap._machines.length, "machines");
            // 清空预览
            GridMap._previewing = null;
            return true;
        }
        else if (GridMap._previewing instanceof BeltInstance) {
            GridMap._belts.push(GridMap._previewing);
            GridMap._previewing.build();
            // 标记领地
            const list: ReadonlyArray<Vector2> = GridMap._previewing.shape();
            for (let i = 0; i < list.length; i++) {
                const pos: Vector2 = list[i];
                GridMap.grid[pos.y][pos.x].occupied = true;
                GridMap.grid[pos.y][pos.x].by = GridMap._previewing;
                GridMap.grid[pos.y][pos.x].beltDirec = GridMap._previewing.shapeAt(i);
            };
            console.log("built", GridMap._previewing, "total:", GridMap._belts.length, "belts");
            // 清空预览
            GridMap._previewing = null;
            return true;
        }
        return false;
    }

    public static get allMachines(): ReadonlyArray<MachineInstance> {
        return GridMap._machines;
    }

    public static get allBelts(): ReadonlyArray<BeltInstance> {
        return GridMap._belts;
    }

    public static portConnecting(port: portInstance): BeltInstance | null {
        if (port.portGroup.isIn) {
            const pos = port.postion.sub(port.direction).floor();
            const t = GridMap.isOccupiedBy(pos);
            if (t instanceof BeltInstance) return t;
        }
        else {
            const pos = port.postion.add(port.direction).floor();
            const t = GridMap.isOccupiedBy(pos);
            if (t instanceof BeltInstance) return t;
        }
        return null;
    }


    private static updateMachine(instance: MachineInstance) {
        if (!instance.portInstances || !instance.pollingPointer) return;
        for (let i = 0; i < instance.portInstances.length; i++) {
            const begin: number = instance.pollingPointer[i];
            const group: portInstance[] = instance.portInstances[i];
            for (let j = 0; j < group.length; j++) {
                const current: number = (begin + j) % group.length;
                const connecting = GridMap.portConnecting(group[current]);
                // 若该端口成功动作，则将轮询初始指针拨到下一个端口
                if (group[current].portGroup.callback(connecting, instance))
                    instance.pollingPointer[i] = (current + 1) % group.length;
            }
        }

        instance.currentMode.working(instance);
    }

    private static updateBelt(instance: BeltInstance) {
        if (instance.inventory === null) return;
        instance.inventory.update();
    }

    public static update() {
        for (const instance of this._machines) GridMap.updateMachine(instance);
        for (const instance of this._belts) GridMap.updateBelt(instance);
    }
}


export default GridMap;