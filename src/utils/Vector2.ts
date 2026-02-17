// TODO: 取消每次运算新建一个实例

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

    addSelf(v: Vector2): Vector2 {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        return this;
    }

    sub(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    subSelf(v: Vector2): Vector2 {
        this.x = this.x - v.x;
        this.y = this.y - v.y;
        return this;
    }

    mul(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    mulSelf(scalar: number): Vector2 {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }

    div(scalar: number): Vector2 {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    divSelf(scalar: number): Vector2 {
        this.x = this.x / scalar;
        this.y = this.y / scalar;
        return this;
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

    clamp(minX: number, minY: number, maxX: number, maxY: number) {
        return new Vector2(Math.min(Math.max(this.x, minX), maxX), Math.min(Math.max(this.y, minY), maxY));
    }

    clampSelf(minX: number, minY: number, maxX: number, maxY: number) {
        this.x = Math.min(Math.max(this.x, minX), maxX);
        this.y = Math.min(Math.max(this.y, minY), maxY);
        return this;
    }

    toT(): Vector2 {
        return new Vector2(this.x > 0 ? 1 : (this.x < 0 ? -1 : 0), this.y > 0 ? 1 : (this.y < 0 ? -1 : 0));
    }

    // toString():string{
    //     return `${this.x}`
    // }

    rotateCW(time: number): Vector2 {
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

    rotateCCW(time: number): Vector2 {
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

    apply(matrix: DOMMatrix): Vector2 {
        // 对于 2D 矩阵，变换公式为:
        // x' = a*x + c*y + e
        // y' = b*x + d*y + f
        const newX = matrix.a * this.x + matrix.c * this.y + matrix.e;
        const newY = matrix.b * this.x + matrix.d * this.y + matrix.f;

        return new Vector2(newX, newY);
    }

    applySelf(matrix: DOMMatrix): Vector2 {
        const newX = matrix.a * this.x + matrix.c * this.y + matrix.e;
        const newY = matrix.b * this.x + matrix.d * this.y + matrix.f;
        this.x = newX;
        this.y = newY;
        return this;
    }




    static readonly ZERO = new Vector2(0, 0);
    static readonly ONE = new Vector2(1, 1);

    static readonly UP = new Vector2(0, -1);
    static readonly DOWN = new Vector2(0, 1);
    static readonly LEFT = new Vector2(-1, 0);
    static readonly RIGHT = new Vector2(1, 0);


    static readonly UP_LEFT = new Vector2(-1, -1);
    static readonly LEFT_UP = new Vector2(-1, -1);
    static readonly UP_RIGHT = new Vector2(1, -1);
    static readonly RIGHT_UP = new Vector2(1, -1);
    static readonly DOWN_LEFT = new Vector2(-1, 1);
    static readonly LEFT_DOWN = new Vector2(-1, 1);
    static readonly DOWN_RIGHT = new Vector2(1, 1);
    static readonly RIGHT_DOWN = new Vector2(1, 1);

    static readonly DIREC: Vector2[] = [
        this.RIGHT, this.RIGHT_UP, this.UP_RIGHT,
        this.UP, this.UP_LEFT, this.LEFT_UP,
        this.LEFT, this.LEFT_DOWN, this.DOWN_LEFT,
        this.DOWN, this.DOWN_RIGHT, this.RIGHT_DOWN
    ]

    static readonly RIGHT_n = 0;
    static readonly UP_n = 3;
    static readonly LEFT_n = 6;
    static readonly DOWN_n = 9;

    static readonly INF = new Vector2(1e9, 1e9);

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

    static linear(v1: Vector2, s1: number, v2: Vector2, s2: number): Vector2 {
        return v1.mul(s1).add(v2.mul(s2));
    }

    static copy(v: Vector2): Vector2 {
        return new Vector2(v.x, v.y);
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

    static toCCW(direction: number): number {
        return (direction + 3) % 12;
    }

    static toCW(direction: number): number {
        return (direction + 9) % 12;
    }

    static toBACK(direction: number): number {
        return (direction + 6) % 12;
    }

    static toIndex(v: Vector2) {
        if (v.x === 1 && v.y === 0) return 0;
        else if (v.x === 0 && v.y === -1) return 3;
        else if (v.x === -1 && v.y === 0) return 6;
        else if (v.x === 0 && v.y === 1) return 9;
        return null;
    }
}


export default Vector2;