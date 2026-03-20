import { imageAble } from "../utils/imageAble";
import Array2d from "../utils/Array2d";

export interface Logistic {
    id: string;
    img: imageAble;
    nodes: number[][][];
}

class Connector implements Logistic {
    id = 'connector';
    img = new imageAble(this.id, '/icon_belt/bg_logistic_log_connector.png');
    width = 1;
    height = 1;
    powerArea = 0;

    nodes = [
        [[Array2d.UP_n], [Array2d.DOWN_n]],
        [[Array2d.DOWN_n], [Array2d.UP_n]],
        [[Array2d.LEFT_n], [Array2d.RIGHT_n]],
        [[Array2d.RIGHT_n], [Array2d.LEFT_n]],
    ]

    constructor() {
        allLogistics.set(this.id, this);
    }
}

class Converter implements Logistic {
    id = 'converter';
    img = new imageAble(this.id, '/icon_belt/bg_logistic_log_converger.png');
    width = 1;
    height = 1;
    powerArea = 0;

    nodes = [
        [[Array2d.LEFT_n, Array2d.UP_n, Array2d.RIGHT_n], [Array2d.DOWN_n]],
    ]

    constructor() {
        allLogistics.set(this.id, this);
    }
}

class Splitter implements Logistic {
    id = 'splitter';
    img = new imageAble(this.id, '/icon_belt/bg_logistic_log_splitter.png');
    width = 1;
    height = 1;
    powerArea = 0;

    nodes = [
        [[Array2d.DOWN_n], [Array2d.LEFT_n, Array2d.UP_n, Array2d.RIGHT_n]],
    ]

    constructor() {
        allLogistics.set(this.id, this);
    }
}

export const allLogistics: Map<string, Logistic> = new Map<string, Logistic>();

export class LogisticSet {
    static readonly Connector: Logistic = new Connector();
    static readonly Converter: Logistic = new Converter();
    static readonly Splitter: Logistic = new Splitter();
}