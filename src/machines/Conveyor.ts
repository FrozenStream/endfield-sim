import Vector2 from "../utils/Vector2";


class Conveyor {
    public start: Vector2;
    public directions: Array<number>;

    private static readonly DIRECTION: Array<Vector2> = [
        Vector2.RIGHT, Vector2.UP, Vector2.LEFT, Vector2.DOWN
    ];

    private static rotateCCW(direction: number): number {
        return (direction + 1) % 4;
    }

    private static rotateCW(direction: number): number {
        return (direction + 3) % 4;
    }

    private static rotateBACK(direction: number): number {
        return (direction + 2) % 4;
    }

    constructor(start: Vector2, directions: Array<number>) {
        this.start = start;
        this.directions = directions;
    }

    public static buildConveyor(start: Vector2, faceDirection: number, end: Vector2): Conveyor {
        let directions: Array<number> = [];
        directions.push(faceDirection);

        const point: Vector2 = start.add(Conveyor.DIRECTION[faceDirection]);
        const relative: Vector2 = end.subtract(point);
        const inFaceDirection: number = relative.dot(Conveyor.DIRECTION[faceDirection]);

        if (inFaceDirection >= 0) {
            for (let i = 0; i < inFaceDirection; i++) directions.push(faceDirection);

            if (relative.manhattanDistance() != 0) {
                let dir_a = this.rotateCW(faceDirection);
                let dir_b = this.rotateCCW(faceDirection);
                if (relative.dot(this.DIRECTION[dir_a]) >= 0)
                    for (let j = 0; j < inFaceDirection; j++) directions.push(dir_a);
                else
                    for (let j = 0; j < inFaceDirection; j++) directions.push(dir_b);
            }
        }
        else {
            let dir_a = this.rotateCW(faceDirection);
            let dir_b = this.rotateCCW(faceDirection);
            let dir_back = this.rotateBACK(faceDirection);
            let rotated: boolean = false;
            if (relative.dot(this.DIRECTION[dir_a]) > 0) {
                rotated = true;
                for (let j = 0; j < -inFaceDirection; j++) directions.push(dir_a);
            } else if (relative.dot(this.DIRECTION[dir_b]) > 0) {
                rotated = true;
                for (let j = 0; j < -inFaceDirection; j++) directions.push(dir_b);
            }
            if (rotated) {
                for (let j = 0; j < -inFaceDirection; j++) directions.push(dir_back);
            }
        }
        return new Conveyor(start, directions);
    }
}
export default Conveyor;