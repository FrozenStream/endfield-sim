import { BeltInstance, type Belt } from "./machines/Belt";
import { Machine, MachineInstance } from "./machines/Machines";
import type Rect from "./utils/Rect";
import Vector2 from "./utils/Vector2";


interface GridCell {
    occupied: boolean;
    by: MachineInstance | BeltInstance | null;
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
            () => Array.from({ length: width }, () => ({ occupied: false, by: null }))
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

    public static onPreview(): boolean {
        return GridMap._previewing !== null;
    }

    public static howOccupying(): Vector2[] {
        const list: Vector2[] = [];

        if (GridMap._previewing === null) return list;
        if (GridMap._previewing instanceof MachineInstance) {
            const rect: Rect = GridMap._previewing.shape()!;
            for (let i = 0; i < rect.h; i++) {
                for (let j = 0; j < rect.w; j++) {
                    const v: Vector2 = new Vector2(rect.min_y + i, rect.min_x + j);
                    if (GridMap.isOccupied(v)) list.push(v);
                }
            }
        }
        else {
            GridMap._previewing.shape().forEach(({ pos, dire }) => {
                if (GridMap.isOccupiedBy(pos) instanceof MachineInstance) list.push(pos);
            });
        }
        return [];
    }

    /**
     * @param mouseX 鼠标X网格坐标(float)
     * @param mouseY 鼠标Y网格坐标(float)
     */
    public static previewPositon(mouseX: number, mouseY: number) {
        if (GridMap._previewing instanceof MachineInstance) {
            GridMap._previewing.setPosition(new Vector2(mouseX, mouseY));
        }
        else if (GridMap._previewing instanceof BeltInstance) {
            if (!GridMap._previewing.startFIXED)
                GridMap._previewing.setStart(new Vector2(mouseX, mouseY));
            else GridMap._previewing.setEnd(0, new Vector2(mouseX, mouseY));
        }
    }

    public static previewRotate(time: number) {
        if (GridMap._previewing instanceof MachineInstance)
            GridMap._previewing.rotate(time);
    }

    public static previewCancel() {
        GridMap._previewing = null;
    }

    public static isOccupied(pos: Vector2): boolean {
        return GridMap.grid[pos.y][pos.x].occupied;
    }

    public static isOccupiedBy(pos: Vector2): MachineInstance | BeltInstance | null {
        return GridMap.grid[pos.y][pos.x].by;
    }

    public static build(): boolean {
        if (GridMap._previewing instanceof MachineInstance) {
            GridMap._machines.push(GridMap._previewing)
            const rect: Rect = GridMap._previewing.shape()!;
            for (let i = 0; i < rect.h; i++) {
                for (let j = 0; j < rect.w; j++) {
                    GridMap.grid[rect.min_y + i][rect.min_x + j].occupied = true;
                    GridMap.grid[rect.min_y + i][rect.min_x + j].by = GridMap._previewing;
                }
            }
            console.log("built", GridMap._previewing, "total:", GridMap._machines.length, "machines");
            GridMap._previewing = null;
            return true;
        }
        else if (GridMap._previewing instanceof BeltInstance) {
            GridMap._belts.push(GridMap._previewing)
            GridMap._previewing.shape().forEach(({ pos, dire }) => {
                GridMap.grid[pos.y][pos.x].occupied = true;
                GridMap.grid[pos.y][pos.x].by = GridMap._previewing;
            });
            console.log("built", GridMap._previewing, "total:", GridMap._belts.length, "belts");
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
}


export default GridMap;