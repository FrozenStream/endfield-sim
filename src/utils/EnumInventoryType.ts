import { ItemStack } from "../proto/ItemStack";
import EnumItemType from "./EnumItemType";

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
        return this.configs.map(config => new ItemStack(null, config.type, 0, config.max));
    }

    public static readonly Storage_None: EnumInventoryType = new EnumInventoryType([]);

    public static readonly Storage_1_solid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
    ]);

    public static readonly Storage_1_liquid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.LIQUID, noIn: false, noOut: false, max: 500, markOnly: false },
    ]);

    public static readonly Storage_1_solid_1_solid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
    ]);

    public static readonly Storage_2x1_liquid_solid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.LIQUID, noIn: false, noOut: true, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
    ]);

    public static readonly Storage_2_solid_1_solid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: false, noOut: true, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: true, noOut: false, max: 50, markOnly: false },
    ]);

    public static readonly Storage_5_ANY_2_MarkedLiquid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.ANY, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.LIQUID, noIn: false, noOut: false, max: 0, markOnly: true },
        { type: EnumItemType.LIQUID, noIn: false, noOut: false, max: 0, markOnly: true },
    ])

    public static readonly Storage_6_Solid: EnumInventoryType = new EnumInventoryType([
        { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
        { type: EnumItemType.SOLID, noIn: false, noOut: false, max: 50, markOnly: false },
    ])

}