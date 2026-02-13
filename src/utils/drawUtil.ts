import Vector2 from "./Vector2";

const beltWidth: number = 40;

function drawBelt(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number) {
    if (Vector2.isDiagonal(direc)) drawCurvedBelt(canvas, direc, x, y, size);
    else drawStraightBelt(canvas, direc, x, y, size);
    drawBeltDirection(canvas, direc, x, y, size);
}

function drawStraightBelt(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number) {
    const edge: number = (size - beltWidth) / 2;
    const oedge = (size + beltWidth) / 2;
    if (direc === 0 || direc === 6) {
        canvas.beginPath();
        canvas.moveTo(x, y + edge);
        canvas.lineTo(x + size, y + edge);
        canvas.stroke();

        canvas.beginPath();
        canvas.moveTo(x, y + oedge);
        canvas.lineTo(x + size, y + oedge);
        canvas.stroke();
    }
    else if (direc === 3 || direc === 9) {
        canvas.beginPath();
        canvas.moveTo(x + edge, y);
        canvas.lineTo(x + edge, y + size);
        canvas.stroke();

        canvas.beginPath();
        canvas.moveTo(x + oedge, y);
        canvas.lineTo(x + oedge, y + size);
        canvas.stroke();
    }
}

function drawCurvedBelt(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number) {
    const edge: number = (size - beltWidth) / 2;
    const oedge = (size + beltWidth) / 2;
    let type: number = 0;
    if (direc === 1 || direc === 8) type = 0;
    else if (direc === 5 || direc === 10) type = 1;
    else if (direc === 11 || direc === 4) type = 2;
    else if (direc === 2 || direc === 7) type = 3;
    else type = 114514;
    switch (type) {
        case 0:
            canvas.beginPath();
            canvas.arc(
                x + edge, y + edge, beltWidth,
                0, Math.PI / 2,    // 起始角度，终止角度
                false
            );
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x, y + edge);
            canvas.lineTo(x + edge, y + edge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x, y + oedge);
            canvas.lineTo(x + edge, y + oedge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + edge, y);
            canvas.lineTo(x + edge, y + edge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + oedge, y);
            canvas.lineTo(x + oedge, y + edge);
            canvas.stroke();
            break;
        case 1:
            canvas.beginPath();
            canvas.arc(
                x + oedge, y + edge, beltWidth,
                Math.PI / 2, Math.PI,
                false
            );
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + oedge, y + edge);
            canvas.lineTo(x + size, y + edge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + oedge, y + oedge);
            canvas.lineTo(x + size, y + oedge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + edge, y);
            canvas.lineTo(x + edge, y + edge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + oedge, y);
            canvas.lineTo(x + oedge, y + edge);
            canvas.stroke();
            break;
        case 2:
            canvas.beginPath();
            canvas.arc(
                x + edge, y + oedge, beltWidth,
                Math.PI * 3 / 2, 0,
                false
            );
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x, y + edge);
            canvas.lineTo(x + edge, y + edge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x, y + oedge);
            canvas.lineTo(x + edge, y + oedge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + edge, y + oedge);
            canvas.lineTo(x + edge, y + size);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + oedge, y + oedge);
            canvas.lineTo(x + oedge, y + size);
            canvas.stroke();
            break;
        case 3:
            canvas.beginPath();
            canvas.arc(
                x + oedge, y + oedge, beltWidth,
                Math.PI, Math.PI * 3 / 2,
                false
            );
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + oedge, y + edge);
            canvas.lineTo(x + size, y + edge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + oedge, y + oedge);
            canvas.lineTo(x + size, y + oedge);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + edge, y + oedge);
            canvas.lineTo(x + edge, y + size);
            canvas.stroke();

            canvas.beginPath();
            canvas.moveTo(x + oedge, y + oedge);
            canvas.lineTo(x + oedge, y + size);
            canvas.stroke();
            break;
        default:
            return;
    }
}


function drawBeltDirection(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number) {
    const d: Vector2 = Vector2.DIREC[direc].multiply(Vector2.isDiagonal(direc) ? 0.7 : 1);
    const center: Vector2 = new Vector2(x + size / 2, y + size / 2);
    const a = center.add(d.multiply(7));
    const b = center.subtract(d.multiply(3)).add(d.rotateCW(1).multiply(5));
    const c = center.subtract(d.multiply(3)).add(d.rotateCCW(1).multiply(5));

    if (!Vector2.isDiagonal(direc)) {
        fillTriangle(canvas, a, b, c);
    }
    else {
        let t = 0;
        const trans: Vector2 = new Vector2(-beltWidth * 0.12, -beltWidth * 0.12);
        if (direc === 1 || direc === 8) t = 0;
        else if (direc === 5 || direc === 10) t = 1;
        else if (direc === 11 || direc === 4) t = 3;
        else if (direc === 2 || direc === 7) t = 2;
        fillTriangle(canvas, a.add(trans.rotateCW(t)), b.add(trans.rotateCW(t)), c.add(trans.rotateCW(t)));
    }
}


function fillTriangle(canvas: CanvasRenderingContext2D, a: Vector2, b: Vector2, c: Vector2) {
    canvas.beginPath();
    canvas.moveTo(a.x, a.y);
    canvas.lineTo(b.x, b.y);
    canvas.lineTo(c.x, c.y);
    canvas.closePath();
    canvas.fill();
}
export default drawBelt;