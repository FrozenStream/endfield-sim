import type { BeltNode } from "../proto/Graph";
import type { Logistic } from "../proto/Logistic";
import type EnumItemType from "../utils/EnumItemType";
import Array2d from "../utils/Array2d";
import { BeltInventory } from "./BeltInstance";

export class LogisticInstance {
    readonly logistic: Logistic;
    private _position: Array2d = Array2d.INF;
    rotation: number = 0;

    R: Array2d = Array2d.RIGHT;
    D: Array2d = Array2d.DOWN;

    inventory: BeltInventory;
    itemtype: EnumItemType;

    nodes: BeltNode[];

    constructor(logistic: Logistic, itemtype: EnumItemType) {
        this.logistic = logistic;
        this.itemtype = itemtype;
        this.inventory = new BeltInventory(itemtype);
        this.inventory.build(1);
    }

    rotate(time: number) {
        this.rotation = (this.rotation + time) % 4;
        this.R = this.R.rotateCW(time);
        this.D = this.D.rotateCW(time);
    }

    set Position(position: Array2d) {
        this._position = position;
    }
}