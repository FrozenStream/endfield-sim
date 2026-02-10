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
}


export default Rect;