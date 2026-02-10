import type Conveyor from "./machines/Conveyor";
import { Machine, MachineInstance } from "./machines/Machines";
import type Rect from "./utils/Rect";
import Vector2 from "./utils/Vector2";


interface GridCell {
    occupied: boolean;
}

class GridMap {
    private static grid: GridCell[][];
    private static width: number = 80;
    private static height: number = 80;

    private static _previewMachine: MachineInstance | null = null;
    private static _previewConveyor: Conveyor | null = null;

    private static Conveyors: Array<Conveyor> = [];
    private static _machines: Array<MachineInstance> = [];

    public static init(width: number, height: number) {
        GridMap.grid = Array.from(
            { length: height },
            () => Array.from({ length: width }, () => ({ occupied: false }))
        );
        GridMap.width = width;
        GridMap.height = height;
    }

    public static set PreviewMachine(machine: Machine) {
        GridMap._previewMachine = new MachineInstance(machine);
        GridMap._previewConveyor = null;
    }

    public static get PreviewMachine(): MachineInstance | null {
        return GridMap._previewMachine;
    }

    public static buildMachine(): boolean {
        if (!GridMap.checkMachine()) return false;
        GridMap._machines.push(GridMap._previewMachine!)
        const rect: Rect | null = GridMap._previewMachine!.shape()!;
        for (let i = 0; i < rect.h; i++) {
            for (let j = 0; j < rect.w; j++) {
                GridMap.grid[rect.min_y + i][rect.min_x + j].occupied = true;
            }
        }
        console.log("built", GridMap._previewMachine, "total:", GridMap._machines.length, "machines");
        GridMap._previewMachine = null;
        return true;
    }

    public static checkMachine(): boolean {
        if (GridMap._previewMachine === null) return false;
        const rect: Rect | null = GridMap._previewMachine.shape();
        if (rect === null) return false;
        let flag: boolean = true;
        for (let i = 0; i < rect.h; i++) {
            for (let j = 0; j < rect.w; j++) {
                const pos: Vector2 = new Vector2(rect.min_x + j, rect.min_y + i);
                if (GridMap.isOccupied(pos)) flag = false;
            }
        }
        return flag;
    }

    public static SetPreviewConveyor(conveyor: Conveyor) {
        GridMap._previewConveyor = conveyor;
        GridMap._previewMachine = null;
    }

    public static previewingConveyor() {
        return GridMap._previewConveyor;
    }

    public static previewPositon(mouseX: number, mouseY: number) {
        if (GridMap._previewMachine !== null)
            GridMap._previewMachine.setPosition(new Vector2(mouseX, mouseY));
        //if(GridMap._previewConveyor !== null) GridMap._previewConveyor = new Vector2(mouseX, mouseY);
    }

    public static previewRotate(time: number) {
        if (GridMap._previewMachine !== null)
            GridMap._previewMachine.rotate(time);
        //if(GridMap._previewConveyor !== null) GridMap._previewConveyor = new Vector2(mouseX, mouseY);
    }

    public static previewCancel() {
        GridMap._previewMachine = null;
        GridMap._previewConveyor = null;
    }

    public static isOccupied(pos: Vector2): boolean {
        return GridMap.grid[pos.y][pos.x].occupied;
    }

    public static buildConveyor(): boolean {
        return true;
    }
    public static checkConveyor(): boolean {
        return true;
    }

    public static build(): boolean {
        if (GridMap._previewMachine != null) return GridMap.buildMachine();
        if (GridMap._previewConveyor != null) return GridMap.buildConveyor();
        return false;
    }

    public static get allMachines(): ReadonlyArray<MachineInstance> {
        return GridMap._machines;
    }
}


export default GridMap;