import type { BeltInstance } from "../instance/BeltInstance";
import type { portGroupInstance } from "../instance/MachineInstance";
import { ItemStack } from "./ItemStack";
import type Array2d from "../utils/Array2d";

export interface Port {
    pos: Array2d;
    direc: number;
    isin: boolean;
}

export interface GraphNode {
    // use array for polling
    in: GraphNode[];
    out: GraphNode[];
    // polling pointer
    p_in: number;
    p_out: number;

    level: number;
    ports: Port[]

    awake(): void;
    update(): void;

    output(): ItemStack;
    input(stack: ItemStack): boolean;
}



export class BeltNode implements GraphNode {
    in: GraphNode[] = [];
    out: GraphNode[] = [];
    p_in: number = 0;
    p_out: number = 0;
    level: number = 1;

    owner: BeltInstance;

    constructor(owner: BeltInstance) {
        this.owner = owner;
    }

    awake(): void { return; }

    update(): void { return; }

    output(): ItemStack {
        return this.owner.inventory.getTail() ?? ItemStack.EMPTY;
    }

    input(stack: ItemStack): boolean {
        return this.owner.inventory.insert(stack);
    }
}


export class PortGroupNode implements GraphNode {
    in: GraphNode[] = [];
    out: GraphNode[] = [];
    p_in: number = 0;
    p_out: number = 0;
    level: number = 100;

    owner: portGroupInstance;

    constructor(owner: portGroupInstance) {
        this.owner = owner;
    }

    awake(): void { return; }

    update(): void { return; }

    output(): ItemStack {
        return this.owner.src.callback_out(this.owner.owner);
    }

    input(stack: ItemStack): boolean {
        return this.owner.src.callback_in(stack, this.owner.owner);
    }
}

export class ConverterNode implements GraphNode {
    in: GraphNode[] = [];
    out: GraphNode[] = [];
    p_in: number = 0;
    p_out: number = 0;
    level: number = 2;

    owner: portGroupInstance;

    constructor(owner: portGroupInstance) {
        this.owner = owner;
    }

    awake(): void { return; }

    update(): void { return; }

    output(): ItemStack {
        return this.owner.inventory.getTail() ?? ItemStack.EMPTY;
    }

    input(stack: ItemStack): boolean {
        return this.owner.inventory.insert(stack);
    }
}