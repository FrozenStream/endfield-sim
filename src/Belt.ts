import ItemEnum from "./utils/ItemEnum";
import Vector2 from "./utils/Vector2";
import { MachineInstance } from "./Machines";



class BeltSec {
    owner: BeltInstance;
    index: number;
    direc: number;
    constructor(owner: BeltInstance, index: number, direc: number) {
        this.owner = owner;
        this.index = index;
        this.direc = direc;
    }
}

class BeltInstance {
    public readonly beltType: Belt;
    public static readonly imgCache: HTMLImageElement;

    public start: MachineInstance | null = null;
    public startPoint: Vector2 | null = null;
    public direc: Array<number>;

    private _started: boolean = false;
    private sections: ReadonlyArray<BeltSec> | null = null;

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

        const start = this.start.closestPort(end, false);
        if (start === null) return;
        const faceAt = this.start.portDirection_n(start);
        this.startPoint = start.postion.add(Vector2.DIREC[faceAt]);
        this.direc = [faceAt];

        const relative: Vector2 = end.sub(this.startPoint);
        console.log('relative',relative);
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
}


class Belt {
    public readonly id: string;
    public readonly type: ItemEnum;
    public readonly imgCache: HTMLImageElement;

    constructor(id: string, type: ItemEnum, imgsrc: string) {
        this.id = id;
        this.type = type;

        const img = document.createElement('img');
        img.src = imgsrc;
        img.alt = type.toString();
        img.style.width = '70%';
        img.style.height = '70%';
        img.style.objectFit = 'contain';
        this.imgCache = img;
    }

    public static readonly soildBelt: Belt = new Belt("solid_belt", ItemEnum.SOLID, '/icon_belt/image_grid_belt_01.png');
}




export { Belt, BeltInstance };