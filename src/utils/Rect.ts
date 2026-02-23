import Vector2 from "./Vector2";

class Rect {
    public min_x: number;
    public min_y: number;
    public w: number;
    public h: number;

    constructor(min_x: number, min_y: number, w: number, h: number) {
        this.min_x = min_x;
        this.min_y = min_y;
        this.w = w;
        this.h = h;
    }

    toTuple(): [number, number, number, number] {
        return [this.min_x, this.min_y, this.w, this.h];
    }

    center(): Vector2 {
        return new Vector2(this.min_x + this.w / 2, this.min_y + this.h / 2);
    }

    mutiply(scalar: number): Rect {
        return new Rect(this.min_x * scalar, this.min_y * scalar, this.w * scalar, this.h * scalar);
    }

    // 添加 clamp 函数，将矩形限制在指定范围内
    clamp(minX: number, minY: number, maxX: number, maxY: number): Rect {
        const clampedMinX = Math.max(minX, Math.min(this.min_x, maxX));
        const clampedMinY = Math.max(minY, Math.min(this.min_y, maxY));
        const clampedMaxX = Math.max(minX, Math.min(this.min_x + this.w, maxX));
        const clampedMaxY = Math.max(minY, Math.min(this.min_y + this.h, maxY));

        return new Rect(
            clampedMinX,
            clampedMinY,
            clampedMaxX - clampedMinX,
            clampedMaxY - clampedMinY
        );
    }

    spread(size: number) {
        return new Rect(this.min_x - size, this.min_y - size, this.w + size * 2, this.h + size * 2);
    }
}


export default Rect;