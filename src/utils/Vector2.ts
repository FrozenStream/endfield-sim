class Vector2 {

    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public add(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    public subtract(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    public multiply(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    public divide(scalar: number): Vector2 {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    public dot(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    public equal(end: Vector2) {
        return this.x === end.x && this.y === end.y;
    }

    public magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public manhattanDistance(): number {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    public static readonly ZERO = new Vector2(0, 0);
    public static readonly ONE = new Vector2(1, 1);
    public static readonly UP = new Vector2(0, -1);
    public static readonly DOWN = new Vector2(0, 1);
    public static readonly LEFT = new Vector2(-1, 0);
    public static readonly RIGHT = new Vector2(1, 0);

    rotateCCW(time: number): Vector2 {
        time = time % 4;
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
        time = time % 4;
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
}

export default Vector2;