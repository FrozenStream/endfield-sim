import { BeltInventory, type BeltInstance } from "../instance/BeltInstance";
import type { MachineInstance } from "../instance/MachineInstance";
import type Rect from "./Rect";
import Vector2 from "./Vector2";

const beltWidth: number = 40;

export function drawBelt(canvas: CanvasRenderingContext2D, instance: BeltInstance, size: number) {
    const list = instance.postions();
    for (let i = 0; i < instance.length; i++) {
        const pos: Vector2 = list[i].mul(size);
        const direc = instance.beltDIrec(i);
        if (Vector2.isDiagonal(direc)) drawCurvedBelt(canvas, direc, pos.x, pos.y, size);
        else drawStraightBelt(canvas, direc, pos.x, pos.y, size);
        drawBeltDirection(canvas, direc, pos.x, pos.y, size);
    }
}

function drawStraightBelt(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number) {
    const edge: number = (size - beltWidth) / 2;
    const oedge = (size + beltWidth) / 2;
    if (direc === 0 || direc === 6) {
        canvas.beginPath();
        canvas.moveTo(x, y + edge);
        canvas.lineTo(x + size, y + edge);

        canvas.moveTo(x, y + oedge);
        canvas.lineTo(x + size, y + oedge);
        canvas.stroke();
    }
    else if (direc === 3 || direc === 9) {
        canvas.beginPath();
        canvas.moveTo(x + edge, y);
        canvas.lineTo(x + edge, y + size);

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


export function drawMachine(canvas: CanvasRenderingContext2D, instance: MachineInstance, gridSize: number) {
    const rect = instance.rect;
    if (!rect) return;
    const [startX, startY, width, height] = rect.mutiply(gridSize).toTuple();

    canvas.fillRect(startX, startY, width, height);
    canvas.strokeRect(startX, startY, width, height);

    drawMachinePort(canvas, instance, gridSize);
}

export function drawAttention(canvas: CanvasRenderingContext2D, instance: MachineInstance, gridSize: number) {
    if (!instance.rect) return;

    const rect = instance.rect.mutiply(gridSize);
    const [x, y, width, height] = rect.toTuple();

    // 保存当前画布状态
    canvas.save();

    // 设置高亮样式
    canvas.strokeStyle = '#FFD700'; // 金色边框
    canvas.lineWidth = 3;
    canvas.setLineDash([5, 3]); // 虚线效果

    // 绘制选中框
    canvas.strokeRect(x, y, width, height);

    // 绘制角标指示器
    const indicatorSize = 8;
    canvas.fillStyle = '#FFD700';

    // 左上角
    canvas.fillRect(x - indicatorSize / 2, y - indicatorSize / 2, indicatorSize, indicatorSize);
    // 右上角
    canvas.fillRect(x + width - indicatorSize / 2, y - indicatorSize / 2, indicatorSize, indicatorSize);
    // 左下角
    canvas.fillRect(x - indicatorSize / 2, y + height - indicatorSize / 2, indicatorSize, indicatorSize);
    // 右下角
    canvas.fillRect(x + width - indicatorSize / 2, y + height - indicatorSize / 2, indicatorSize, indicatorSize);

    // 恢复画布状态
    canvas.restore();
}


function drawMachinePort(canvas: CanvasRenderingContext2D, instance: MachineInstance, gridSize: number) {
    canvas.beginPath();
    const LT: Vector2 = instance.left_top!;

    for (const group of instance.currentMode.portGroups) {
        for (let i = 0; i < group.length; i++) {
            const center = Vector2.linear(instance.R, group.relpos[i].x + 0.5, instance.D, group.relpos[i].y + 0.5).addSelf(LT);
            let v2 = group.direction[i].rotateCW(instance.rotation).mulSelf(0.1).addSelf(center);
            let v1 = group.direction[i].rotateCW(instance.rotation + 1).mulSelf(0.1).addSelf(center);
            let v3 = group.direction[i].rotateCW(instance.rotation - 1).mulSelf(0.1).addSelf(center);

            if (group.isIn) {
                const offset = group.direction[i].rotateCW(instance.rotation).mul(0.4);
                v1.subSelf(offset);
                v2.subSelf(offset);
                v3.subSelf(offset);
            }
            else {
                const offset = group.direction[i].rotateCW(instance.rotation).mul(0.3);
                v1.addSelf(offset);
                v2.addSelf(offset);
                v3.addSelf(offset);
            }
            v1.mulSelf(gridSize);
            v2.mulSelf(gridSize);
            v3.mulSelf(gridSize);

            canvas.moveTo(v1.x, v1.y);
            canvas.lineTo(v2.x, v2.y);
            canvas.lineTo(v3.x, v3.y);
        }
    }
    canvas.stroke();
}


export function drawRectLinesFill(canvas: CanvasRenderingContext2D, rect: Rect | null, gridSize: number) {
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

export function drawCellLinesFill(canvas: CanvasRenderingContext2D, vec: Vector2, gridSize: number, color: string) {
    const [x, y, w, h] = [vec.x * gridSize, vec.y * gridSize, gridSize, gridSize];

    // 设置填充颜色为透明黄色
    canvas.fillStyle = color;

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

export function drawCellFill(canvas: CanvasRenderingContext2D, vec: Vector2 | null, gridSize: number, color: string) {
    if (vec === null) return;
    vec = vec.floor();
    canvas.fillStyle = color;
    canvas.fillRect(vec.x * gridSize, vec.y * gridSize, gridSize, gridSize);
}

export function drawGridLines(canvas: CanvasRenderingContext2D, width: number, height: number, gridSize: number) {
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


export function drawMachinesIcon(canvas: CanvasRenderingContext2D, instance: MachineInstance, transform: DOMMatrix, gridSize: number) {
    if (!canvas) return;
    // 清空区域内容，绘制新背景色和边框
    const rect = instance.rect;
    if (!rect) return;
    const [startX, startY, width, height] = rect.toTuple();
    const LT = new Vector2(startX, startY).mulSelf(gridSize).applySelf(transform);
    const RB = new Vector2(startX + width, startY + height).mulSelf(gridSize).applySelf(transform);

    const min_x = Math.min(LT.x, RB.x);
    const min_y = Math.min(LT.y, RB.y);
    const max_x = Math.max(LT.x, RB.x);
    const max_y = Math.max(LT.y, RB.y);

    // 绘制图标
    const img = instance.machine.getImageResource();
    let imgAspectRatio = 1;
    if (img && (img instanceof HTMLImageElement)) {
        imgAspectRatio = img.naturalWidth / img.naturalHeight;
    }
    else if (img && (img instanceof ImageBitmap)) {
        imgAspectRatio = img.width / img.height;
    }
    else return;

    const drawHeight = 0.8 * gridSize;
    const drawWidth = 0.8 * imgAspectRatio * gridSize;

    // 计算居中位置
    const drawX = min_x + (max_x - min_x - drawWidth) / 2;
    const drawY = min_y + (max_y - min_y - drawHeight) / 2;

    // 绘制机器图片
    canvas.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}


export function drawBeltItems(canvas: CanvasRenderingContext2D, instance: BeltInstance, gridSize: number) {
    if (!instance.inventory) return;

    const inv = instance.inventory;
    const sec = instance.sections;

    if (!sec) return;

    const l = instance.inventory._onCircle ? inv.length + 1 : inv.length;

    // 遍历传送带的所有段
    for (let i = 0; i < l; i++) {
        const data = inv.getInventory(i);
        const pos = sec[i].position.add(new Vector2(0.1, 0.1));
        if (!data) continue;
        if (Vector2.isDiagonal(sec[i].direc)) {
            let v1, v2;
            if (sec[i].direc % 3 === 1) {
                v1 = Vector2.DIREC[(sec[i].direc - 1 + Vector2.DIREC.length) % Vector2.DIREC.length];
                v2 = Vector2.DIREC[(sec[i].direc + 2 + Vector2.DIREC.length) % Vector2.DIREC.length];
            }
            else {
                v1 = Vector2.DIREC[(sec[i].direc + 1 + Vector2.DIREC.length) % Vector2.DIREC.length];
                v2 = Vector2.DIREC[(sec[i].direc - 2 + Vector2.DIREC.length) % Vector2.DIREC.length];
            }
            const offset = data.delay / BeltInventory.SecMaxDelay - 0.5;
            if (offset > 0) pos.addSelf(v2.mul(offset));
            else pos.addSelf(v1.mul(offset));
        }
        else {
            const offset = Vector2.DIREC[sec[i].direc].mul(data.delay / BeltInventory.SecMaxDelay - 0.5);
            pos.addSelf(offset);
        }
        pos.mulSelf(gridSize);

        const img = data.itemstack.item?.getImageResource();
        if (!img) continue;

        canvas.drawImage(img, pos.x, pos.y, gridSize * 0.8, gridSize * 0.8);
    }
}
