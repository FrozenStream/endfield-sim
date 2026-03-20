import type Array2f from "../utils/Array2f";
import type { GraphNode } from "./GraphNode";

interface GraphNodeWarpper {
    center: Array2f;
    nodes: GraphNode[];
}



class SplitterWarpper implements GraphNodeWarpper {
    center: Array2f;
    nodes: GraphNode[] = [new ];


}

class ConverterWarpper implements GraphNodeWarpper {
    center: Array2f;
    nodes: GraphNode[];


}

class ConnectorWarpper implements GraphNodeWarpper {
    center: Array2f;
    nodes: GraphNode[];


}