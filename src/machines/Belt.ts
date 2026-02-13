import ItemEnum from "../utils/ItemEnum";
import Vector2 from "../utils/Vector2";


class BeltInstance {
    public readonly beltType: Belt;
    public static readonly imgCache: HTMLImageElement;

    public start: Vector2 | null = null;
    public direc: Array<number>;

    public startFIXED: boolean = false;

    constructor(beltType: Belt) {
        this.beltType = beltType;
        this.direc = [];

    }

    public setStart(start: Vector2) {
        this.start = start.floor();
    }

    public fixStart() {
        this.startFIXED = true;
    }

    public setEnd(faceAt: number, end: Vector2) {
        if (this.start === null) throw new Error("start point is null");
        end = end.floor();
        this.direc = [faceAt];

        const relative: Vector2 = end.subtract(this.start);
        const inFaceLength: number = relative.dot(Vector2.DIREC[faceAt]);

        if (inFaceLength >= 0) {
            // end在面朝方向，前进至垂直
            for (let i = 0; i < inFaceLength; i++) this.direc.push(faceAt);

            if (relative.manhattanDistance() != 0) {
                const dir_a = Vector2.toCW(faceAt);
                const dir_b = Vector2.toCCW(faceAt);
                const l = relative.dot(Vector2.DIREC[dir_a]);
                if (l >= 0)
                    for (let j = 0; j < l; j++) this.direc.push(dir_a);
                else
                    for (let j = 0; j < -l; j++) this.direc.push(dir_b);
            }
        }
        else {
            let dir_a = Vector2.toCW(faceAt);
            let dir_b = Vector2.toCCW(faceAt);
            let dir_back = Vector2.toBACK(faceAt);
            let rotated: boolean = false;

            const l = relative.dot(Vector2.DIREC[dir_a]);
            if (l > 0) {
                rotated = true;
                for (let j = 0; j < l; j++) this.direc.push(dir_a);
            } else if (l < 0) {
                rotated = true;
                for (let j = 0; j < -l; j++) this.direc.push(dir_b);
            }
            if (rotated) {
                for (let j = 0; j < -inFaceLength; j++) this.direc.push(dir_back);
            }
        }
    }

    public get length(): number {
        return this.direc.length;
    }

    public shapeAt(index: number): number {
        const nextDir = index + 1 < this.direc.length ? this.direc[index + 1] : this.direc[index];
        return Vector2.ABtoIndex(this.direc[index], nextDir);
    }

    public shape(): ReadonlyArray<Vector2> {
        let point: Vector2 = Vector2.copy(this.start!);
        const arr: Array<Vector2> = [];
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