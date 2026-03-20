import { BeltSec, type BeltInstance } from "../instance/BeltInstance";
import type { MachineInstance } from "../instance/MachineInstance";
import { COLORS } from "./colors";
import EnumItemType from "./EnumItemType";
import type Rect from "./Rect";
import Array2d from "./Array2d";

const SoildBeltWidth: number = 40;
const LiquidBeltWidth: number = 20;


export function drawBelts(ctx: CanvasRenderingContext2D, insts: ReadonlySet<BeltInstance>, size: number, isPreview: boolean) {
    const set_1 = new Set<BeltInstance>();
    const set_2 = new Set<BeltInstance>();

    for (const instance of insts) {
        if (instance.ItemType === EnumItemType.SOLID) set_1.add(instance);
        if (instance.ItemType === EnumItemType.LIQUID) set_2.add(instance);
    }

    drawSoildBelts(ctx, set_1, size, isPreview);
    drawLiquidBelts(ctx, set_2, size, isPreview);
}

export function drawBelt(ctx: CanvasRenderingContext2D, inst: BeltInstance, size: number, isPreview: boolean) {
    ctx.setLineDash([]);
    if (isPreview) {
        ctx.fillStyle = COLORS.PREVIEW_FILL;
        ctx.strokeStyle = COLORS.BLUE;
    }
    else {
        ctx.fillStyle = COLORS.MACHINE_FILL;
        ctx.strokeStyle = COLORS.MACHINE_STROKE;
    }

    if (inst.ItemType === EnumItemType.SOLID) drawSoildBelt(ctx, inst, size, isPreview);
    if (inst.ItemType === EnumItemType.LIQUID) drawLiquidBelt(ctx, inst, size, isPreview);
}

function drawSoildBelts(ctx: CanvasRenderingContext2D, insts: ReadonlySet<BeltInstance>, size: number, isPreview: boolean) {
    ctx.setLineDash([]);
    if (isPreview) {
        ctx.fillStyle = COLORS.PREVIEW_FILL;
        ctx.strokeStyle = COLORS.BLUE;
    }
    else {
        ctx.fillStyle = COLORS.MACHINE_FILL;
        ctx.strokeStyle = COLORS.MACHINE_STROKE;
    }
    ctx.beginPath();
    for (const instance of insts) {
        if (!instance.sections) return;
        for (const sec of instance.sections) {
            const pos: Array2d = sec.position.mul(size);
            const direc = sec.direc;
            if (Array2d.isDiagonal(direc)) drawCurvedBelt(ctx, direc, pos.x, pos.y, size, SoildBeltWidth);
            else drawStraightBelt(ctx, direc, pos.x, pos.y, size, SoildBeltWidth);
        }
    }
    ctx.stroke();

    if (isPreview) ctx.fillStyle = COLORS.BeltOrange_previewing;
    else ctx.fillStyle = COLORS.BeltOrange;
    ctx.beginPath();
    for (const instance of insts) {
        if (!instance.sections) return;
        for (const sec of instance.sections) {
            const pos: Array2d = sec.position.mul(size);
            const direc = sec.direc;
            if (Array2d.isDiagonal(direc)) fillCurvedBelt(ctx, direc, pos.x, pos.y, size, SoildBeltWidth);
            else fillStraightBelt(ctx, direc, pos.x, pos.y, size, SoildBeltWidth);
        }
    }
    ctx.fill();

    if (isPreview) ctx.fillStyle = COLORS.BeltMarkWhite_previewing;
    else ctx.fillStyle = COLORS.BeltMarkWhite;
    ctx.beginPath();
    for (const instance of insts) {
        if (!instance.sections) return;
        for (const sec of instance.sections) {
            const pos: Array2d = sec.position.mul(size);
            const direc = sec.direc;
            fillBeltDirection(ctx, direc, pos.x, pos.y, size);
        }
    }
    ctx.fill();
}

function drawSoildBelt(ctx: CanvasRenderingContext2D, inst: BeltInstance, size: number, isPreview: boolean) {
    ctx.setLineDash([]);
    if (isPreview) {
        ctx.fillStyle = COLORS.PREVIEW_FILL;
        ctx.strokeStyle = COLORS.BLUE;
    }
    else {
        ctx.fillStyle = COLORS.MACHINE_FILL;
        ctx.strokeStyle = COLORS.MACHINE_STROKE;
    }
    ctx.beginPath();
    if (!inst.sections) return;
    for (const sec of inst.sections) {
        const pos: Array2d = sec.position.mul(size);
        const direc = sec.direc;
        if (Array2d.isDiagonal(direc)) drawCurvedBelt(ctx, direc, pos.x, pos.y, size, SoildBeltWidth);
        else drawStraightBelt(ctx, direc, pos.x, pos.y, size, SoildBeltWidth);
    }
    ctx.stroke();

    if (isPreview) ctx.fillStyle = COLORS.BeltOrange_previewing;
    else ctx.fillStyle = COLORS.BeltOrange;
    ctx.beginPath();
    if (!inst.sections) return;
    for (const sec of inst.sections) {
        const pos: Array2d = sec.position.mul(size);
        const direc = sec.direc;
        if (Array2d.isDiagonal(direc)) fillCurvedBelt(ctx, direc, pos.x, pos.y, size, SoildBeltWidth);
        else fillStraightBelt(ctx, direc, pos.x, pos.y, size, SoildBeltWidth);
    }
    ctx.fill();

    if (isPreview) ctx.fillStyle = COLORS.BeltMarkWhite_previewing;
    else ctx.fillStyle = COLORS.BeltMarkWhite;
    ctx.beginPath();
    if (!inst.sections) return;
    for (const sec of inst.sections) {
        const pos: Array2d = sec.position.mul(size);
        const direc = sec.direc;
        fillBeltDirection(ctx, direc, pos.x, pos.y, size);
    }
    ctx.fill();
}

function drawLiquidBelts(ctx: CanvasRenderingContext2D, insts: ReadonlySet<BeltInstance>, size: number, isPreview: boolean) {
    ctx.setLineDash([]);
    if (isPreview) {
        ctx.fillStyle = COLORS.PREVIEW_FILL;
        ctx.strokeStyle = COLORS.BLUE;
    }
    else {
        ctx.fillStyle = COLORS.MACHINE_FILL;
        ctx.strokeStyle = COLORS.MACHINE_STROKE;
    }
    ctx.beginPath();
    for (const instance of insts) {
        if (!instance.sections) return;
        for (const sec of instance.sections) {
            const pos: Array2d = sec.position.mul(size);
            const direc = sec.direc;
            if (Array2d.isDiagonal(direc)) drawCurvedBelt(ctx, direc, pos.x, pos.y, size, LiquidBeltWidth);
            else drawStraightBelt(ctx, direc, pos.x, pos.y, size, LiquidBeltWidth);
        }
    }
    ctx.stroke();

    if (isPreview) ctx.fillStyle = COLORS.BeltWaterBlue_previewing;
    else ctx.fillStyle = COLORS.BeltWaterBlue;
    ctx.beginPath();
    for (const instance of insts) {
        if (!instance.sections) return;
        for (const sec of instance.sections) {
            const pos: Array2d = sec.position.mul(size);
            const direc = sec.direc;
            if (Array2d.isDiagonal(direc)) fillCurvedBelt(ctx, direc, pos.x, pos.y, size, LiquidBeltWidth);
            else fillStraightBelt(ctx, direc, pos.x, pos.y, size, LiquidBeltWidth);
        }
    }
    ctx.fill();

    if (isPreview) ctx.fillStyle = COLORS.BeltMarkWhite_previewing;
    else ctx.fillStyle = COLORS.BeltMarkWhite;
    ctx.beginPath();
    for (const instance of insts) {
        if (!instance.sections) return;
        for (const sec of instance.sections) {
            const pos: Array2d = sec.position.mul(size);
            const direc = sec.direc;
            fillBeltDirection(ctx, direc, pos.x, pos.y, size);
        }
    }
    ctx.fill();
}

function drawLiquidBelt(ctx: CanvasRenderingContext2D, inst: BeltInstance, size: number, isPreview: boolean) {
    ctx.setLineDash([]);
    if (isPreview) {
        ctx.fillStyle = COLORS.PREVIEW_FILL;
        ctx.strokeStyle = COLORS.BLUE;
    }
    else {
        ctx.fillStyle = COLORS.MACHINE_FILL;
        ctx.strokeStyle = COLORS.MACHINE_STROKE;
    }
    ctx.beginPath();
    if (!inst.sections) return;
    for (const sec of inst.sections) {
        const pos: Array2d = sec.position.mul(size);
        const direc = sec.direc;
        if (Array2d.isDiagonal(direc)) drawCurvedBelt(ctx, direc, pos.x, pos.y, size, LiquidBeltWidth);
        else drawStraightBelt(ctx, direc, pos.x, pos.y, size, LiquidBeltWidth);
    }
    ctx.stroke();

    if (isPreview) ctx.fillStyle = COLORS.BeltWaterBlue_previewing;
    else ctx.fillStyle = COLORS.BeltWaterBlue;
    ctx.beginPath();
    if (!inst.sections) return;
    for (const sec of inst.sections) {
        const pos: Array2d = sec.position.mul(size);
        const direc = sec.direc;
        if (Array2d.isDiagonal(direc)) fillCurvedBelt(ctx, direc, pos.x, pos.y, size, LiquidBeltWidth);
        else fillStraightBelt(ctx, direc, pos.x, pos.y, size, LiquidBeltWidth);
    }
    ctx.fill();

    if (isPreview) ctx.fillStyle = COLORS.BeltMarkWhite_previewing;
    else ctx.fillStyle = COLORS.BeltMarkWhite;
    ctx.beginPath();
    if (!inst.sections) return;
    for (const sec of inst.sections) {
        const pos: Array2d = sec.position.mul(size);
        const direc = sec.direc;
        fillBeltDirection(ctx, direc, pos.x, pos.y, size);
    }
    ctx.fill();
}

function drawStraightBelt(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number, beltwidth: number) {
    const edge: number = (size - beltwidth) / 2;
    const oedge = (size + beltwidth) / 2;
    if (direc === 0 || direc === 6) {
        canvas.moveTo(x, y + edge);
        canvas.lineTo(x + size, y + edge);

        canvas.moveTo(x, y + oedge);
        canvas.lineTo(x + size, y + oedge);
    }
    else if (direc === 3 || direc === 9) {
        canvas.moveTo(x + edge, y);
        canvas.lineTo(x + edge, y + size);

        canvas.moveTo(x + oedge, y);
        canvas.lineTo(x + oedge, y + size);
    }
}

function fillStraightBelt(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number, beltwidth: number) {
    const edge: number = (size - beltwidth) / 2;
    const oedge = (size + beltwidth) / 2;
    if (direc === 0 || direc === 6) {
        canvas.moveTo(x, y + edge);
        canvas.lineTo(x + size, y + edge);
        canvas.lineTo(x + size, y + oedge);
        canvas.lineTo(x, y + oedge);
        canvas.closePath();
    }
    else if (direc === 3 || direc === 9) {
        canvas.moveTo(x + edge, y);
        canvas.lineTo(x + edge, y + size);
        canvas.lineTo(x + oedge, y + size);
        canvas.lineTo(x + oedge, y);
        canvas.closePath();
    }
}

function drawCurvedBelt(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number, beltwidth: number) {
    const edge: number = (size - beltwidth) / 2;
    const oedge = (size + beltwidth) / 2;
    let type: number = 0;
    if (direc === 1 || direc === 8) type = 0;
    else if (direc === 5 || direc === 10) type = 1;
    else if (direc === 11 || direc === 4) type = 2;
    else if (direc === 2 || direc === 7) type = 3;
    else type = 114514;
    switch (type) {
        case 0:
            canvas.moveTo(x, y + edge);
            canvas.lineTo(x + edge, y + edge);
            canvas.lineTo(x + edge, y);

            canvas.moveTo(x + oedge, y);
            canvas.lineTo(x + oedge, y + edge);
            canvas.arc(
                x + edge, y + edge, beltwidth,
                0, Math.PI / 2,
                false
            );
            canvas.lineTo(x, y + oedge);
            break;
        case 1:
            canvas.moveTo(x + size, y + oedge);
            canvas.lineTo(x + oedge, y + oedge);
            canvas.arc(
                x + oedge, y + edge, beltwidth,
                Math.PI / 2, Math.PI,
                false
            );
            canvas.lineTo(x + edge, y);

            canvas.moveTo(x + oedge, y);
            canvas.lineTo(x + oedge, y + edge);
            canvas.lineTo(x + size, y + edge);
            break;
        case 2:
            canvas.moveTo(x, y + edge);
            canvas.lineTo(x + edge, y + edge);
            canvas.arc(
                x + edge, y + oedge, beltwidth,
                Math.PI * 3 / 2, 0,
                false
            );
            canvas.lineTo(x + oedge, y + size);

            canvas.moveTo(x, y + oedge);
            canvas.lineTo(x + edge, y + oedge);
            canvas.lineTo(x + edge, y + size);
            break;
        case 3:
            canvas.moveTo(x + oedge, y + size);
            canvas.lineTo(x + oedge, y + oedge);
            canvas.lineTo(x + size, y + oedge);

            canvas.moveTo(x + edge, y + size);
            canvas.lineTo(x + edge, y + oedge);
            canvas.arc(
                x + oedge, y + oedge, beltwidth,
                Math.PI, Math.PI * 3 / 2, false
            );
            canvas.lineTo(x + size, y + edge);
            break;
        default:
            return;
    }
}

function fillCurvedBelt(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number, beltwidth: number) {
    const edge: number = (size - beltwidth) / 2;
    const oedge = (size + beltwidth) / 2;
    let type: number = 0;
    if (direc === 1 || direc === 8) type = 0;
    else if (direc === 5 || direc === 10) type = 1;
    else if (direc === 11 || direc === 4) type = 2;
    else if (direc === 2 || direc === 7) type = 3;
    else type = 114514;
    switch (type) {
        case 0:
            canvas.moveTo(x, y + edge);
            canvas.lineTo(x + edge, y + edge);
            canvas.lineTo(x + edge, y);

            canvas.lineTo(x + oedge, y);
            canvas.lineTo(x + oedge, y + edge);
            canvas.arc(
                x + edge, y + edge, beltwidth,
                0, Math.PI / 2,
                false
            );
            canvas.lineTo(x, y + oedge);
            canvas.closePath();
            break;
        case 1:
            canvas.moveTo(x + size, y + oedge);
            canvas.lineTo(x + oedge, y + oedge);
            canvas.arc(
                x + oedge, y + edge, beltwidth,
                Math.PI / 2, Math.PI,
                false
            );
            canvas.lineTo(x + edge, y);

            canvas.lineTo(x + oedge, y);
            canvas.lineTo(x + oedge, y + edge);
            canvas.lineTo(x + size, y + edge);
            canvas.closePath();
            break;
        case 2:
            canvas.moveTo(x, y + edge);
            canvas.lineTo(x + edge, y + edge);
            canvas.arc(
                x + edge, y + oedge, beltwidth,
                Math.PI * 3 / 2, 0,
                false
            );
            canvas.lineTo(x + oedge, y + size);
            canvas.lineTo(x + edge, y + size);
            canvas.lineTo(x + edge, y + oedge);
            canvas.lineTo(x, y + oedge);
            canvas.closePath();
            break;
        case 3:
            canvas.moveTo(x + edge, y + size);
            canvas.lineTo(x + edge, y + oedge);
            canvas.arc(
                x + oedge, y + oedge, beltwidth,
                Math.PI, Math.PI * 3 / 2, false
            );
            canvas.lineTo(x + size, y + edge);
            canvas.lineTo(x + size, y + oedge);
            canvas.lineTo(x + oedge, y + oedge);
            canvas.lineTo(x + oedge, y + size);
            canvas.closePath();

            break;
        default:
            return;
    }
}

function fillBeltDirection(canvas: CanvasRenderingContext2D, direc: number, x: number, y: number, size: number) {
    const d: Array2d = Array2d.DIREC[direc].mul(Array2d.isDiagonal(direc) ? 0.7 : 1);
    const center: Array2d = new Array2d(x + size / 2, y + size / 2);
    const a = center.add(d.mul(7));
    const b = center.sub(d.mul(3)).add(d.rotateCW(1).mul(4));
    const c = center.sub(d.mul(3)).add(d.rotateCCW(1).mul(4));

    if (!Array2d.isDiagonal(direc)) {
        fillTriangle(canvas, a, b, c);
    }
    else {
        let t = 0;
        const trans: Array2d = new Array2d(-SoildBeltWidth * 0.12, -SoildBeltWidth * 0.12);
        if (direc === 1 || direc === 8) t = 0;
        else if (direc === 5 || direc === 10) t = 1;
        else if (direc === 11 || direc === 4) t = 3;
        else if (direc === 2 || direc === 7) t = 2;
        fillTriangle(canvas, a.add(trans.rotateCW(t)), b.add(trans.rotateCW(t)), c.add(trans.rotateCW(t)));
    }
}

function fillTriangle(canvas: CanvasRenderingContext2D, a: Array2d, b: Array2d, c: Array2d) {
    canvas.moveTo(a.x, a.y);
    canvas.lineTo(b.x, b.y);
    canvas.lineTo(c.x, c.y);
    canvas.closePath();
}




export function drawMachine(canvas: CanvasRenderingContext2D, instance: MachineInstance, gridSize: number) {
    const rect = instance.rect;
    if (!rect) return;
    const [startX, startY, width, height] = rect.mutiply(gridSize).toTuple();

    canvas.fillRect(startX, startY, width, height);
    canvas.strokeRect(startX, startY, width, height);

    drawMachinePort(canvas, instance, gridSize);
}

function drawMachinePort(canvas: CanvasRenderingContext2D, instance: MachineInstance, gridSize: number) {
    canvas.beginPath();
    const LT: Array2d = instance.left_top!;

    for (const group of instance.currentMode.portGroups) {
        for (let i = 0; i < group.length; i++) {
            const center = Array2d.linear(instance.R, group.relpos[i].x + 0.5, instance.D, group.relpos[i].y + 0.5).addSelf(LT);
            const direc = Array2d.DIREC[group.direction[i]];
            let v2 = direc.rotateCW(instance.rotation).mulSelf(0.1).addSelf(center);
            let v1 = direc.rotateCW(instance.rotation + 1).mulSelf(0.1).addSelf(center);
            let v3 = direc.rotateCW(instance.rotation - 1).mulSelf(0.1).addSelf(center);

            if (group.isIn) {
                const offset = direc.rotateCW(instance.rotation).mul(0.4);
                v1.subSelf(offset);
                v2.subSelf(offset);
                v3.subSelf(offset);
            }
            else {
                const offset = direc.rotateCW(instance.rotation).mul(0.3);
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

export function drawBeltAttention(canvas: CanvasRenderingContext2D, instance: BeltSec, gridSize: number) {
    canvas.fillStyle = COLORS.BLUE;
    const belt = instance.owner;
    if (!belt.sections) return;
    for (const sec of belt.sections) {
        const vec = sec.position;
        canvas.fillRect(vec.x * gridSize, vec.y * gridSize, gridSize, gridSize);
    }
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

export function drawCellLinesFill(canvas: CanvasRenderingContext2D, vec: Array2d, gridSize: number, color: string) {
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

export function drawCellFill(canvas: CanvasRenderingContext2D, vec: Array2d | null, gridSize: number, color: string) {
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

export function drawRect(canvas: CanvasRenderingContext2D, rect: Rect, gridSize: number) {
    const [startX, startY, width, height] = rect.mutiply(gridSize).toTuple();
    canvas.strokeRect(startX, startY, width, height);
    canvas.fillRect(startX, startY, width, height);
}


export function drawMachinesIcon(canvas: CanvasRenderingContext2D, instance: MachineInstance, transform: DOMMatrix, gridSize: number) {
    if (!canvas) return;
    // 清空区域内容，绘制新背景色和边框
    const rect = instance.rect;
    if (!rect) return;
    const [startX, startY, width, height] = rect.toTuple();
    const LT = new Array2d(startX, startY).mulSelf(gridSize).applySelf(transform);
    const RB = new Array2d(startX + width, startY + height).mulSelf(gridSize).applySelf(transform);

    const min_x = Math.min(LT.x, RB.x);
    const min_y = Math.min(LT.y, RB.y);
    const max_x = Math.max(LT.x, RB.x);
    const max_y = Math.max(LT.y, RB.y);

    // 绘制图标
    const img = instance.machine.img.getImageResource();
    let imgAspectRatio = 1;
    if (img && (img instanceof HTMLImageElement)) {
        imgAspectRatio = img.naturalWidth / img.naturalHeight;
    }
    else if (img && (img instanceof ImageBitmap)) {
        imgAspectRatio = img.width / img.height;
    }
    else return;

    const drawHeight = 0.5 * gridSize;
    const drawWidth = 0.5 * imgAspectRatio * gridSize;

    // 计算居中位置
    const drawX = min_x + (max_x - min_x - drawWidth) / 2;
    const drawY = min_y + (max_y - min_y - drawHeight) / 2;

    // 绘制机器图片
    canvas.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // 根据onPower状态绘制勾或叉
    if (instance.machine.powerArea >= 0) return;
    const indicatorSize = 12;
    const indicatorX = drawX + drawWidth - indicatorSize / 2;
    const indicatorY = drawY - indicatorSize / 2;

    canvas.beginPath();
    canvas.lineWidth = 2;

    if (instance.onPower) {
        // 绘制绿色勾
        canvas.strokeStyle = '#00ff00';
        canvas.moveTo(indicatorX - indicatorSize / 3, indicatorY);
        canvas.lineTo(indicatorX, indicatorY + indicatorSize / 3);
        canvas.lineTo(indicatorX + indicatorSize / 2, indicatorY - indicatorSize / 6);
    } else {
        // 绘制红色叉
        canvas.strokeStyle = '#ff0000';
        canvas.moveTo(indicatorX - indicatorSize / 3, indicatorY - indicatorSize / 3);
        canvas.lineTo(indicatorX + indicatorSize / 3, indicatorY + indicatorSize / 3);
        canvas.moveTo(indicatorX + indicatorSize / 3, indicatorY - indicatorSize / 3);
        canvas.lineTo(indicatorX - indicatorSize / 3, indicatorY + indicatorSize / 3);
    }

    canvas.stroke();
    canvas.closePath();
}

export function drawBeltItems(canvas: CanvasRenderingContext2D, instance: BeltInstance, gridSize: number) {
    if (!instance.inventory) return;

    const inv = instance.inventory;
    const sec = instance.sections;

    if (!sec) return;

    // 遍历传送带的所有段
    for (let i = 0; i < instance.length; i++) {
        const data = inv.getInventory(i);
        const pos = sec[i].position.add(new Array2d(0.1, 0.1));
        if (!data) continue;
        if (Array2d.isDiagonal(sec[i].direc)) {
            let v1, v2;
            if (sec[i].direc % 3 === 1) {
                v1 = Array2d.DIREC[(sec[i].direc - 1 + Array2d.DIREC.length) % Array2d.DIREC.length];
                v2 = Array2d.DIREC[(sec[i].direc + 2 + Array2d.DIREC.length) % Array2d.DIREC.length];
            }
            else {
                v1 = Array2d.DIREC[(sec[i].direc + 1 + Array2d.DIREC.length) % Array2d.DIREC.length];
                v2 = Array2d.DIREC[(sec[i].direc - 2 + Array2d.DIREC.length) % Array2d.DIREC.length];
            }
            const offset = data.delay / inv.SecMaxDelay - 0.5;
            if (offset > 0) pos.addSelf(v2.mul(offset));
            else pos.addSelf(v1.mul(offset));
        }
        else {
            const offset = Array2d.DIREC[sec[i].direc].mul(data.delay / inv.SecMaxDelay - 0.5);
            pos.addSelf(offset);
        }
        pos.mulSelf(gridSize);

        const img = data.itemstack.item?.getImageResource();
        if (!img) continue;

        canvas.drawImage(img, pos.x, pos.y, gridSize * 0.8, gridSize * 0.8);
    }
}
