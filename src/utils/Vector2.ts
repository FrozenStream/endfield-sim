class Vector2 {

    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Vector2 {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    equal(end: Vector2) {
        return this.x === end.x && this.y === end.y;
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    manhattanDistance(): number {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    round(): Vector2 {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    floor(): Vector2 {
        return new Vector2(Math.floor(this.x), Math.floor(this.y));
    }

    toT(): Vector2 {
        return new Vector2(this.x > 0 ? 1 : (this.x < 0 ? -1 : 0), this.y > 0 ? 1 : (this.y < 0 ? -1 : 0));
    }

    rotateCCW(time: number): Vector2 {
        time = (time + 4) % 4;
        switch (time) {
            case 0:
                return new Vector2(this.x, this.y);
            case 1:
                return new Vector2(-this.y, this.x);
            case 2:
                return new Vector2(-this.x, -this.y);
            case 3:
                return new Vector2(this.y, -this.x);
        }
        throw new Error("Invalid time");
    }

    rotateCW(time: number): Vector2 {
        time = (time + 4) % 4;
        switch (time) {
            case 0:
                return new Vector2(this.x, this.y);
            case 1:
                return new Vector2(this.y, -this.x);
            case 2:
                return new Vector2(-this.x, -this.y);
            case 3:
                return new Vector2(-this.y, this.x);
        }
        throw new Error("Invalid time");
    }

    applyMatrix(matrix: DOMMatrix): Vector2 {
        // 对于 2D 矩阵，变换公式为:
        // x' = a*x + c*y + e
        // y' = b*x + d*y + f
        const newX = matrix.a * this.x + matrix.c * this.y + matrix.e;
        const newY = matrix.b * this.x + matrix.d * this.y + matrix.f;

        return new Vector2(newX, newY);
    }




    static readonly ZERO = new Vector2(0, 0);
    static readonly ONE = new Vector2(1, 1);

    static readonly UP = new Vector2(0, -1);
    static readonly DOWN = new Vector2(0, 1);
    static readonly LEFT = new Vector2(-1, 0);
    static readonly RIGHT = new Vector2(1, 0);

    static readonly UP_LEFT = new Vector2(-1, -1);
    static readonly UP_RIGHT = new Vector2(-1, 1);
    static readonly DOWN_LEFT = new Vector2(1, -1);
    static readonly DOWN_RIGHT = new Vector2(1, 1);

    static readonly DIREC: Vector2[] = [
        this.RIGHT, this.UP_RIGHT,
        this.UP, this.UP_LEFT,
        this.LEFT, this.DOWN_LEFT,
        this.DOWN, this.DOWN_RIGHT
    ]

    static linear(v1: Vector2, s1: number, v2: Vector2, s2: number): Vector2 {
        return v1.multiply(s1).add(v2.multiply(s2));
    }

    static copy(v: Vector2): Vector2 {
        return new Vector2(v.x, v.y);
    }

    static isOpposite(v1: number, v2: number) {
        return (v1 + 4) % 8 === v2;
    }

    static isPerpendicular(v1: number, v2: number) {
        return Math.abs(v1 - v2) === 2;
    }

    static isDiagonal(v: number) {
        return v % 2 === 1;
    }

    static toCCW(direction: number): number {
        return (direction + 2) % 8;
    }

    static toCW(direction: number): number {
        return (direction + 6) % 8;
    }

    static toBACK(direction: number): number {
        return (direction + 4) % 8;
    }

    static toIndex(v: Vector2) {
        if (v.x === -1) {
            if (v.y === -1) return 3;
            else if (v.y === 0) return 4;
            else if (v.y === 1) return 5;
        }
        else if (v.x === 0) {
            if (v.y === -1) return 2;
            else if (v.y === 1) return 6;
        }
        else if (v.x === 1) {
            if (v.y === -1) return 1;
            else if (v.y === 0) return 0;
            else if (v.y === 1) return 7;
        }
        return null;
    }

    static ABtoIndex(v1: number, v2: number) {
        if (v1 === 0) {
            if (v2 === 0) return 0;
            else if (v2 === 2) return 1;
            else if (v2 === 6) return 7;
        }
        else if (v1 === 2) {
            if (v2 === 0) return 1;
            else if (v2 === 2) return 2;
            else if (v2 === 4) return 3;
        }
        else if (v1 === 4) {
            if (v2 === 2) return 3;
            else if (v2 === 4) return 4;
            else if (v2 === 6) return 5;
        }
        else if (v1 === 6) {
            if (v2 === 4) return 5;
            else if (v2 === 6) return 6;
            else if (v2 === 0) return 7;
        }
        throw new Error("get bad array");
    }
}


export default Vector2;