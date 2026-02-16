import type { MachineInstance } from "../Machines";
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
            canvas.moveTo(x, y + edge);
            canvas.lineTo(x + edge, y + edge);
            canvas.lineTo(x + edge, y);

            canvas.moveTo(x + oedge, y);
            canvas.lineTo(x + oedge, y + edge);
            canvas.arc(
                x + edge, y + edge, beltWidth,
                0, Math.PI / 2,
                false
            );
            canvas.lineTo(x, y + oedge);
            canvas.stroke();
            break;
        case 1:
            canvas.beginPath();
            canvas.moveTo(x + size, y + oedge);
            canvas.lineTo(x + oedge, y + oedge);
            canvas.arc(
                x + oedge, y + edge, beltWidth,
                Math.PI / 2, Math.PI,
                false
            );
            canvas.lineTo(x + edge, y);

            canvas.moveTo(x + oedge, y);
            canvas.lineTo(x + oedge, y + edge);
            canvas.lineTo(x + size, y + edge);
            canvas.stroke();
            break;
        case 2:
            canvas.beginPath();
            canvas.moveTo(x, y + edge);
            canvas.lineTo(x + edge, y + edge);
            canvas.arc(
                x + edge, y + oedge, beltWidth,
                Math.PI * 3 / 2, 0,
                false
            );
            canvas.lineTo(x + oedge, y + size);

            canvas.moveTo(x, y + oedge);
            canvas.lineTo(x + edge, y + oedge);
            canvas.lineTo(x + edge, y + size);
            canvas.stroke();
            break;
        case 3:
            canvas.beginPath();
            canvas.moveTo(x + oedge, y + size);
            canvas.lineTo(x + oedge, y + oedge);
            canvas.lineTo(x + size, y + oedge);

            canvas.moveTo(x + edge, y + size);
            canvas.lineTo(x + edge, y + oedge);
            canvas.arc(
                x + oedge, y + oedge, beltWidth,
                Math.PI, Math.PI * 3 / 2, false
            );
            canvas.lineTo(x + size, y + edge);
            canvas.stroke();
            break;
        default:
            return;
    }
}


function drawBeltDirection(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number) {
    const d: Vector2 = Vector2.DIREC[direc].mul(Vector2.isDiagonal(direc) ? 0.7 : 1);
    const center: Vector2 = new Vector2(x + size / 2, y + size / 2);
    const a = center.add(d.mul(7));
    const b = center.sub(d.mul(3)).add(d.rotateCW(1).mul(4));
    const c = center.sub(d.mul(3)).add(d.rotateCCW(1).mul(4));

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


function drawMachine(canvas: CanvasRenderingContext2D, instance: MachineInstance, gridSize: number) {
    const rect = instance.shape();
    if (!rect) return;
    const [startX, startY, width, height] = rect.mutiply(gridSize).toTuple();

    canvas.fillRect(startX, startY, width, height);
    canvas.strokeRect(startX, startY, width, height);

    drawMachinePort(canvas, instance, gridSize);
}


function drawMachinePort(canvas: CanvasRenderingContext2D, instance: MachineInstance, gridSize: number) {
    canvas.beginPath();
    instance.machine.ports.forEach(io => {
        const Tpos: Vector2 = instance.Position!;
        const center = Tpos.add(Vector2.linear(instance.R, io.relPos.x, instance.D, io.relPos.y));
        let v2 = center.add(io.direction.rotateCW(instance.rotation).mul(0.1));
        let v1 = center.add(io.direction.rotateCW(instance.rotation + 1).mul(0.1));
        let v3 = center.add(io.direction.rotateCW(instance.rotation - 1).mul(0.1));

        if (io.input) {
            v1 = v1.sub(io.direction.rotateCW(instance.rotation).mul(0.4));
            v2 = v2.sub(io.direction.rotateCW(instance.rotation).mul(0.4));
            v3 = v3.sub(io.direction.rotateCW(instance.rotation).mul(0.4));
        }
        else {
            v1 = v1.add(io.direction.rotateCW(instance.rotation).mul(0.3));
            v2 = v2.add(io.direction.rotateCW(instance.rotation).mul(0.3));
            v3 = v3.add(io.direction.rotateCW(instance.rotation).mul(0.3));
        }
        v1 = v1.mul(gridSize);
        v2 = v2.mul(gridSize);
        v3 = v3.mul(gridSize);

        canvas.moveTo(v1.x, v1.y);
        canvas.lineTo(v2.x, v2.y);
        canvas.lineTo(v3.x, v3.y);
    })
    canvas.stroke();
}


function drawMachineLinesFill(canvas: CanvasRenderingContext2D, instance: MachineInstance, gridSize: number) {
    const rect = instance.shape();
    if (!rect) return;
    const [x, y, w, h] = rect.mutiply(gridSize).toTuple();

    // 设置斜线间距
    const num = 15;
    const spacing = (w + h) / num;

    // 绘制斜线网格
    canvas.beginPath();

    for (let i = 1; i <= num; i += 2) {
        const offset1 = (i - 1) * spacing;
        const offset2 = i * spacing;
        let flag: boolean = false;

        canvas.beginPath();
        const X11 = Math.min(x + w, x + offset1);
        const Y11 = Math.max(y, y - w + offset1);
        canvas.moveTo(X11, Y11);

        const X12 = Math.min(x + w, x + offset2);
        const Y12 = Math.max(y, y - w + offset2);

        if (X11 < x + w && X12 > x + w) flag = true;
        if (flag) canvas.lineTo(x + w, y + h);
        canvas.lineTo(X12, Y12);

        const X21 = Math.max(x, x - h + offset2);
        const Y21 = Math.min(y + h, y + offset2);
        canvas.lineTo(X21, Y21);
        if (flag) canvas.lineTo(x, y);

        const X22 = Math.max(x, x - h + offset1);
        const Y22 = Math.min(y + h, y + offset1);
        canvas.lineTo(X22, Y22);
        canvas.closePath();
        canvas.fill();
    }
}


function drawGridLines(canvas: CanvasRenderingContext2D, width: number, height: number, gridSize: number) {
    canvas.beginPath();
    // 绘制垂直线
    for (let x = 1; x < width; x++) {
        const screenX = x * gridSize;
        canvas.moveTo(screenX, 0);
        canvas.lineTo(screenX, height * gridSize);
    }
    // 绘制水平线
    for (let y = 1; y < height; y++) {
        const screenY = y * gridSize;
        canvas.moveTo(0, screenY);
        canvas.lineTo(width * gridSize, screenY);
    }
    canvas.stroke();
}


function drawMachinesIcon(canvas: CanvasRenderingContext2D, instance: MachineInstance, transform: DOMMatrix, gridSize: number) {
    if (!canvas) return;
    // 清空区域内容，绘制新背景色和边框
    const rect = instance.shape();
    if (!rect) return;
    const [startX, startY, width, height] = rect.toTuple();
    const LT = new Vector2(startX, startY).mulSelf(gridSize).applySelf(transform);
    const RB = new Vector2(startX + width, startY + height).mulSelf(gridSize).applySelf(transform);

    const min_x = Math.min(LT.x, RB.x);
    const min_y = Math.min(LT.y, RB.y);
    const max_x = Math.max(LT.x, RB.x);
    const max_y = Math.max(LT.y, RB.y);

    // 绘制图标
    const img = instance.machine.imgCache;
    if (!img.complete) return;

    // 保持原始宽高比
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;

    const drawHeight = 0.8 * gridSize;
    const drawWidth = 0.8 * imgAspectRatio * gridSize;

    // 计算居中位置
    const drawX = min_x + (max_x - min_x - drawWidth) / 2;
    const drawY = min_y + (max_y - min_y - drawHeight) / 2;

    // 绘制机器图片
    canvas.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

export { drawBelt, drawMachine, drawMachineLinesFill, drawGridLines, drawMachinesIcon };
