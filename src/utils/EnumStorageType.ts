import ItemStack from "../ItemStack";
import EnumItemType from "./EnumItem";

export interface InventoryConfig {
    type: EnumItemType;
    noIn: boolean;
    noOut: boolean;
    max: number;
    markOnly: boolean;
}

export class EnumInventoryType {
    public readonly configs: InventoryConfig[];
    constructor(type: InventoryConfig[]) {
        this.configs = type;
    }

    buildItemStack(): ItemStack[] {
        const stacklist: ItemStack[] = [];
        for (const config of this.configs) {
            stacklist.push(new ItemStack(null, config.type, 0, config.max));
        }
        return stacklist;
    }

    public static readonly Storage_None: EnumInventoryType = new EnumInventoryType([]);

    public static readonly Storage_1_solid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
    ]);

    public static readonly Storage_1_liquid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.LIQUID, noIn: false, noOut: false, max: 500, markOnly: false },
    ]);

    public static readonly Storage_1x1_solid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
    ]);

    public static readonly Storage_2x1: EnumInventoryType = new EnumInventoryType([

    ]);

    public static readonly Storage_5_ANY: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
    ])

    public static readonly Storage_6: EnumInventoryType = new EnumInventoryType([

    ])

}