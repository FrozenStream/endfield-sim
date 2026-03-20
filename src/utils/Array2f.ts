import Array2d from "./Array2d";

class Array2f {

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    set(v: Array2f) {
        this.x = v.x;
        this.y = v.y;
    }

    add(v: Array2f): Array2f {
        return new Array2f(this.x + v.x, this.y + v.y);
    }

    addSelf(v: Array2f): Array2f {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        return this;
    }

    sub(v: Array2f): Array2f {
        return new Array2f(this.x - v.x, this.y - v.y);
    }

    subSelf(v: Array2f): Array2f {
        this.x = this.x - v.x;
        this.y = this.y - v.y;
        return this;
    }

    mul(scalar: number): Array2f {
        return new Array2f(this.x * scalar, this.y * scalar);
    }

    mulSelf(scalar: number): Array2f {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }

    div(scalar: number): Array2f {
        return new Array2f(this.x / scalar, this.y / scalar);
    }

    divSelf(scalar: number): Array2f {
        this.x = this.x / scalar;
        this.y = this.y / scalar;
        return this;
    }

    dot(v: Array2f): number {
        return this.x * v.x + this.y * v.y;
    }

    equalf(a: Array2f) {
        return this.x === a.x && this.y === a.y;
    }

    equald(a: Array2d) {
        return this.x === a.x && this.y === a.y;
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    round(): Array2d {
        return new Array2d(Math.round(this.x), Math.round(this.y));
    }

    roundSelf(): Array2f {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    floor(): Array2d {
        return new Array2d(Math.floor(this.x), Math.floor(this.y));
    }

    floorSelf(): Array2f {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        return this;
    }

    clamp(minX: number, minY: number, maxX: number, maxY: number) {
        return new Array2f(Math.min(Math.max(this.x, minX), maxX), Math.min(Math.max(this.y, minY), maxY));
    }

    clampSelf(minX: number, minY: number, maxX: number, maxY: number) {
        this.x = Math.min(Math.max(this.x, minX), maxX);
        this.y = Math.min(Math.max(this.y, minY), maxY);
        return this;
    }

    toT(): Array2f {
        return new Array2f(this.x > 0 ? 1 : (this.x < 0 ? -1 : 0), this.y > 0 ? 1 : (this.y < 0 ? -1 : 0));
    }

    rotateCW(time: number): Array2f {
        time = (time + 4) % 4;
        switch (time) {
            case 0:
                return new Array2f(this.x, this.y);
            case 1:
                return new Array2f(-this.y, this.x);
            case 2:
                return new Array2f(-this.x, -this.y);
            case 3:
                return new Array2f(this.y, -this.x);
        }
        throw new Error("Invalid time");
    }

    rotateCCW(time: number): Array2f {
        time = (time + 4) % 4;
        switch (time) {
            case 0:
                return new Array2f(this.x, this.y);
            case 1:
                return new Array2f(this.y, -this.x);
            case 2:
                return new Array2f(-this.x, -this.y);
            case 3:
                return new Array2f(-this.y, this.x);
        }
        throw new Error("Invalid time");
    }

    apply(matrix: DOMMatrix): Array2f {
        // 对于 2D 矩阵，变换公式为:
        // x' = a*x + c*y + e
        // y' = b*x + d*y + f
        const newX = matrix.a * this.x + matrix.c * this.y + matrix.e;
        const newY = matrix.b * this.x + matrix.d * this.y + matrix.f;

        return new Array2f(newX, newY);
    }

    applySelf(matrix: DOMMatrix): Array2f {
        const newX = matrix.a * this.x + matrix.c * this.y + matrix.e;
        const newY = matrix.b * this.x + matrix.d * this.y + matrix.f;
        this.x = newX;
        this.y = newY;
        return this;
    }


    static readonly ZERO = new Array2f(0, 0);
    static readonly ONE = new Array2f(1, 1);

    static readonly UP = new Array2f(0, -1);
    static readonly DOWN = new Array2f(0, 1);
    static readonly LEFT = new Array2f(-1, 0);
    static readonly RIGHT = new Array2f(1, 0);


    static readonly UP_LEFT = new Array2f(-1, -1);
    static readonly LEFT_UP = new Array2f(-1, -1);
    static readonly UP_RIGHT = new Array2f(1, -1);
    static readonly RIGHT_UP = new Array2f(1, -1);
    static readonly DOWN_LEFT = new Array2f(-1, 1);
    static readonly LEFT_DOWN = new Array2f(-1, 1);
    static readonly DOWN_RIGHT = new Array2f(1, 1);
    static readonly RIGHT_DOWN = new Array2f(1, 1);

    static readonly DIREC: Array2f[] = [
        this.RIGHT, this.RIGHT_UP, this.UP_RIGHT,
        this.UP, this.UP_LEFT, this.LEFT_UP,
        this.LEFT, this.LEFT_DOWN, this.DOWN_LEFT,
        this.DOWN, this.DOWN_RIGHT, this.RIGHT_DOWN
    ]

    static readonly RIGHT_n = 0;
    static readonly UP_n = 3;
    static readonly LEFT_n = 6;
    static readonly DOWN_n = 9;
    static readonly straightVector_digital = [this.RIGHT_n, this.UP_n, this.LEFT_n, this.DOWN_n]

    static readonly INF = new Array2f(1e9, 1e9);

    static ABtoIndex(v1: number, v2: number) {
        if (v1 === 0) {
            if (v2 === 0) return 0;
            else if (v2 === 3) return 1;
            else if (v2 === 9) return 11;
        }
        else if (v1 === 3) {
            if (v2 === 0) return 2;
            else if (v2 === 3) return 3;
            else if (v2 === 6) return 4;
        }
        else if (v1 === 6) {
            if (v2 === 3) return 5;
            else if (v2 === 6) return 6;
            else if (v2 === 9) return 7;
        }
        else if (v1 === 9) {
            if (v2 === 6) return 8;
            else if (v2 === 9) return 9;
            else if (v2 === 0) return 10;
        }
        throw new Error("get bad array");
    }

    static linear(v1: Array2f, s1: number, v2: Array2f, s2: number): Array2f {
        return v1.mul(s1).add(v2.mul(s2));
    }

    static copy(v: Array2f): Array2f {
        return new Array2f(v.x, v.y);
    }

    static isOpposite(v1: number, v2: number) {
        return (v1 + 6) % 12 === v2;
    }

    static isPerpendicular(v1: number, v2: number) {
        return Math.abs(v1 - v2) === 3;
    }

    static isDiagonal(v: number) {
        return v % 3 !== 0;
    }

    static toCCW(direction: number, times: number = 1): number {
        return (direction + 3 * times) % 12;
    }

    static toCW(direction: number, times: number = 1): number {
        return (direction + 9 * times) % 12;
    }

    static toBACK(direction: number): number {
        return (direction + 6) % 12;
    }

    static toIndex(v: Array2f) {
        if (v.x === 1 && v.y === 0) return 0;
        else if (v.x === 0 && v.y === -1) return 3;
        else if (v.x === -1 && v.y === 0) return 6;
        else if (v.x === 0 && v.y === 1) return 9;
        return null;
    }
}


export default Array2f;