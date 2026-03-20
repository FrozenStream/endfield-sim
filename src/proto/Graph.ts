import type { ItemStack } from "./ItemStack";
import type { GraphNode } from "./GraphNode";

export class Graph {
    nodes: Set<GraphNode> = new Set<GraphNode>();
    leaf: Set<GraphNode> = new Set<GraphNode>();

    addNode(node: GraphNode) {
        this.nodes.add(node);
    }

    addEdge(a: GraphNode, b: GraphNode) {
        a.out.push(b);
        b.in.push(a);
    }

    delNode(node: GraphNode) {
        this.nodes.delete(node);
        for (let n of node.in) n.out = n.out.filter(n => n !== node);
        for (let n of node.out) n.in = n.in.filter(n => n !== node);
    }

    update() {
        this.nodes.forEach(node => node.awake());
        this.nodes.forEach(node => node.update());

        const visited = new Set<GraphNode>();
        const recStack = [...this.leaf];

        while (recStack.length > 0) {
            const node = recStack.pop()!;
            if (visited.has(node)) continue;

            // 向下游节点请求送出
            for (let i = 1; i <= node.out.length; i++) {
                const pos = (node.p_out + i) % node.out.length;
                const n = node.out[pos];
                if (node.level < n.level) continue;             // 跳过比当前节点等级更高的节点
                const stack: ItemStack = node.output();         // 获取该节点的输出物品
                if (stack.isEmpty()) continue;
                if (n.input(stack)) node.p_out = pos;           // 若请求成功则将轮询指针置为该出边
            }
            // 向上游节点请求输入
            for (let i = 1; i <= node.in.length; i++) {
                const pos = (node.p_in + i) % node.in.length;
                const n = node.in[pos];
                if (node.level <= n.level) continue;            // 跳过比当前节点等级更高或同级的节点
                const stack: ItemStack = n.output();            // 获取上游的输出物品
                if (stack.isEmpty()) continue;
                if (node.input(stack)) node.p_in = pos;         // 若请求成功则将轮询指针置为该出边
            }
        }
    }

    rebuild() {
        // 使用深度优先搜索检测并移除回边来破环
        const visited = new Set<GraphNode>();
        const recStack = new Set<GraphNode>(); // 递归栈，用于检测后向边
        const backEdges = new Set<[GraphNode, GraphNode]>(); // 存储回边

        // DFS遍历寻找回边
        const dfs = (node: GraphNode) => {
            if (!visited.has(node)) {
                visited.add(node);
                recStack.add(node);

                // 遍历当前节点的所有出边
                for (const nextNode of node.out) {
                    // 如果下一个节点在递归栈中，说明找到了回边
                    if (recStack.has(nextNode)) backEdges.add([node, nextNode]);
                    else if (!visited.has(nextNode)) dfs(nextNode);
                }
            }
            recStack.delete(node); // 回溯时从递归栈中移除
        };

        // 对所有未访问的节点执行DFS
        for (const node of this.nodes) {
            if (!visited.has(node)) dfs(node);
        }

        // 重新计算叶子节点（没有出度的节点）
        this.leaf.clear();
        for (const node of this.nodes) {
            if (node.out.filter(n => !backEdges.has([node, n])).length === 0) {
                this.leaf.add(node);
            }
        }

        console.log("backEdges.size", backEdges.size); // 返回删除的回边数量
    }
}
