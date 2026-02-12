import ItemEnum from "../utils/ItemEnum";
import Vector2 from "../utils/Vector2";


class BeltInstance {
    public readonly beltType: Belt;
    public static readonly imgCache: HTMLImageElement;

    public start: Vector2 | null = null;
    public directions: Array<number>;

    public startFIXED: boolean = false;

    constructor(beltType: Belt) {
        this.beltType = beltType;
        this.directions = [];

    }

    public setStart(start: Vector2) {
        this.start = start.floor();
    }

    public fixStart() {
        this.startFIXED = true;
    }

    public setEnd(faceDirection: number, end: Vector2) {
        if (this.start === null) throw new Error("start point is null");
        end = end.floor();
        this.directions.push(faceDirection);

        const point: Vector2 = this.start.add(Belt.DIRECTION[faceDirection]);
        const relative: Vector2 = end.subtract(point);
        const inFaceDirection: number = relative.dot(Belt.DIRECTION[faceDirection]);

        if (inFaceDirection >= 0) {
            for (let i = 0; i < inFaceDirection; i++) this.directions.push(faceDirection);

            if (relative.manhattanDistance() != 0) {
                let dir_a = Belt.rotateCW(faceDirection);
                let dir_b = Belt.rotateCCW(faceDirection);
                if (relative.dot(Belt.DIRECTION[dir_a]) >= 0)
                    for (let j = 0; j < inFaceDirection; j++) this.directions.push(dir_a);
                else
                    for (let j = 0; j < inFaceDirection; j++) this.directions.push(dir_b);
            }
        }
        else {
            let dir_a = Belt.rotateCW(faceDirection);
            let dir_b = Belt.rotateCCW(faceDirection);
            let dir_back = Belt.rotateBACK(faceDirection);
            let rotated: boolean = false;
            if (relative.dot(Belt.DIRECTION[dir_a]) > 0) {
                rotated = true;
                for (let j = 0; j < -inFaceDirection; j++) this.directions.push(dir_a);
            } else if (relative.dot(Belt.DIRECTION[dir_b]) > 0) {
                rotated = true;
                for (let j = 0; j < -inFaceDirection; j++) this.directions.push(dir_b);
            }
            if (rotated) {
                for (let j = 0; j < -inFaceDirection; j++) this.directions.push(dir_back);
            }
        }
    }

    public shape(): ReadonlyArray<{ pos: Vector2, dire: Vector2 }> {
        let point: Vector2 = Vector2.copy(this.start!);
        const arr: Array<{ pos: Vector2, dire: Vector2 }> = [];
        arr.push({
            pos: point,
            dire: Belt.DIRECTION[this.directions[0]].add(Belt.DIRECTION[this.directions[0]])
        })
        const lenth = this.directions.length;
        for (let i = 0; i < length - 1; i++) {
            point = point.add(Belt.DIRECTION[this.directions[i]]);
            arr.push({
                pos: point,
                dire: Belt.DIRECTION[this.directions[i]].add(Belt.DIRECTION[this.directions[i + 1]])
            });
        }
        arr.push({
            pos: point,
            dire: Belt.DIRECTION[this.directions[lenth - 1]].add(Belt.DIRECTION[this.directions[lenth - 1]])
        })
        return arr;
    }
}


class Belt {
    public readonly id: string;
    public readonly type: ItemEnum;
    public readonly imgCache: HTMLImageElement;

    public static readonly DIRECTION: Array<Vector2> = [
        Vector2.RIGHT, Vector2.UP, Vector2.LEFT, Vector2.DOWN
    ];

    public static rotateCCW(direction: number): number {
        return (direction + 1) % 4;
    }

    public static rotateCW(direction: number): number {
        return (direction + 3) % 4;
    }

    public static rotateBACK(direction: number): number {
        return (direction + 2) % 4;
    }

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