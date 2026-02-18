import { Item } from "./Item";

export class Recipes {
    public static readonly furnance_recipe: Map<Item, { out: Item, count: [number, number], time: number }> = new Map([
        [Item.iron_ore, { out: Item.iron_nugget, count: [1, 1], time: 2 }],
        [Item.quartz_sand, { out: Item.quartz_glass, count: [1, 1], time: 2 }],
        [Item.originium_ore, { out: Item.crystal_shell, count: [1, 1], time: 2 }],
        [Item.crystal_enr_powder, { out: Item.crystal_enr, count: [1, 1], time: 2 }],
        [Item.iron_enr_powder, { out: Item.iron_enr, count: [1, 1], time: 2 }],
        [Item.quartz_enr_powder, { out: Item.quartz_enr, count: [1, 1], time: 2 }],
        [Item.carbon_enr_powder, { out: Item.carbon_enr, count: [1, 1], time: 2 }],
        [Item.originium_enr_powder, { out: Item.crystal_enr_powder, count: [1, 1], time: 2 }],
        [Item.plant_moss_1, { out: Item.carbon_mtl, count: [1, 1], time: 2 }],
        [Item.iron_powder, { out: Item.iron_nugget, count: [1, 1], time: 2 }],
        [Item.quartz_powder, { out: Item.quartz_glass, count: [1, 1], time: 2 }],
        [Item.crystal_powder, { out: Item.crystal_shell, count: [1, 1], time: 2 }],
        [Item.originium_powder, { out: Item.crystal_powder, count: [1, 1], time: 2 }],
        [Item.plant_moss_2, { out: Item.carbon_mtl, count: [1, 1], time: 2 }],
        [Item.plant_moss_3, { out: Item.carbon_mtl, count: [1, 1], time: 2 }],
        [Item.plant_grass_1, { out: Item.carbon_mtl, count: [1, 2], time: 2 }],
        [Item.plant_grass_2, { out: Item.carbon_mtl, count: [1, 2], time: 2 }],
        [Item.plant_tundra_wood, { out: Item.carbon_mtl, count: [1, 1], time: 2 }],
        [Item.plant_moss_powder_1, { out: Item.carbon_powder, count: [1, 1], time: 2 }],
        [Item.plant_moss_powder_2, { out: Item.carbon_powder, count: [1, 1], time: 2 }],
        [Item.plant_moss_powder_3, { out: Item.carbon_powder, count: [3, 2], time: 2 }],
        [Item.plant_grass_powder_1, { out: Item.carbon_powder, count: [1, 2], time: 2 }],
        [Item.plant_grass_powder_2, { out: Item.carbon_powder, count: [1, 2], time: 2 }],
        [Item.plant_moss_enr_powder_1, { out: Item.carbon_enr_powder, count: [1, 1], time: 2 }],
        [Item.plant_moss_enr_powder_2, { out: Item.carbon_enr_powder, count: [1, 1], time: 2 }]
    ])

    public static readonly grinder_recipe: Map<Item, { out: Item, count: [number, number], time: number }> = new Map([
        [Item.iron_nugget, { out: Item.iron_powder, count: [1, 1], time: 2 }],
        [Item.quartz_glass, { out: Item.quartz_powder, count: [1, 1], time: 2 }],
        [Item.originium_ore, { out: Item.originium_powder, count: [1, 1], time: 2 }],
        [Item.carbon_mtl, { out: Item.carbon_powder, count: [1, 2], time: 2 }],
        [Item.crystal_shell, { out: Item.crystal_powder, count: [1, 1], time: 2 }],
        [Item.plant_moss_1, { out: Item.plant_moss_powder_1, count: [1, 2], time: 2 }],
        [Item.plant_moss_2, { out: Item.plant_moss_powder_2, count: [1, 2], time: 2 }],
        [Item.plant_moss_3, { out: Item.plant_moss_powder_3, count: [1, 3], time: 2 }],
        [Item.plant_bbflower_1, { out: Item.plant_bbflower_powder_1, count: [1, 2], time: 2 }],
        [Item.plant_grass_1, { out: Item.plant_grass_powder_1, count: [1, 2], time: 2 }],
        [Item.plant_grass_2, { out: Item.plant_grass_powder_2, count: [1, 2], time: 2 }]
    ])


    public static readonly shaper_recipes: Map<Item, { out: Item, count: [number, number], time: number }> = new Map([
        [Item.iron_nugget, { out: Item.iron_bottle, count: [2, 1], time: 2 }],
        [Item.quartz_glass, { out: Item.glass_bottle, count: [2, 1], time: 2 }],
        [Item.iron_enr, { out: Item.iron_enr_bottle, count: [2, 1], time: 2 }],
        [Item.quartz_enr, { out: Item.glass_enr_bottle, count: [2, 1], time: 2 }]
    ])

    public static readonly component_recipe: Map<Item, { out: Item, count: [number, number], time: number }> = new Map([
        [Item.iron_nugget, { out: Item.iron_cmpt, count: [1, 1], time: 2 }],
        [Item.quartz_glass, { out: Item.glass_cmpt, count: [1, 1], time: 2 }],
        [Item.iron_enr, { out: Item.iron_enr_cmpt, count: [1, 1], time: 2 }],
        [Item.quartz_enr, { out: Item.glass_enr_cmpt, count: [1, 1], time: 2 }]
    ])

    public static readonly planter_recipe_soild: Map<Item, { out: Item, count: [number, number], time: number }> = new Map([
        [Item.plant_moss_seed_1, { out: Item.plant_moss_1, count: [1, 1], time: 2 }],
        [Item.plant_moss_seed_2, { out: Item.plant_moss_2, count: [1, 1], time: 2 }],
        [Item.plant_moss_seed_3, { out: Item.plant_moss_3, count: [1, 1], time: 2 }],
        [Item.plant_bbflower_seed_1, { out: Item.plant_bbflower_1, count: [1, 1], time: 2 }]
    ])

    public static readonly planter_recipe_liquid: Map<Item, { out: Item, count: [number, number], time: number }> = new Map([
        [Item.plant_grass_seed_1, { out: Item.plant_grass_1, count: [1, 2], time: 2 }],
        [Item.plant_grass_seed_2, { out: Item.plant_grass_2, count: [1, 2], time: 2 }]
    ])

    public static readonly seed_collector_recipe: Map<Item, { out: Item, count: [number, number], time: number }> = new Map([
        [Item.plant_moss_1, { out: Item.plant_moss_seed_1, count: [1, 2], time: 2 }],
        [Item.plant_moss_2, { out: Item.plant_moss_seed_2, count: [1, 2], time: 2 }],
        [Item.plant_moss_3, { out: Item.plant_moss_seed_3, count: [1, 2], time: 2 }],
        [Item.plant_bbflower_1, { out: Item.plant_bbflower_seed_1, count: [1, 2], time: 2 }],
        [Item.plant_grass_1, { out: Item.plant_grass_seed_1, count: [1, 1], time: 2 }],
        [Item.plant_grass_2, { out: Item.plant_grass_seed_2, count: [1, 1], time: 2 }],
        [Item.plant_sp_1, { out: Item.plant_sp_seed_1, count: [1, 2], time: 2 }],
        [Item.plant_sp_2, { out: Item.plant_sp_seed_2, count: [1, 2], time: 2 }],
        [Item.plant_sp_4, { out: Item.plant_sp_seed_4, count: [1, 2], time: 2 }],
        [Item.plant_sp_3, { out: Item.plant_sp_seed_3, count: [1, 2], time: 2 }]
    ])


    public static readonly winder_recipe: Map<[Item, Item], { out: Item, count: [number, number, number], time: number }> = new Map([
        [[Item.crystal_shell, Item.quartz_glass], { out: Item.equip_script_1, count: [5, 5, 1], time: 10 }],
        [[Item.crystal_shell, Item.iron_nugget], { out: Item.equip_script_2, count: [10, 10, 1], time: 10 }],
        [[Item.crystal_enr, Item.quartz_enr], { out: Item.equip_script_3, count: [10, 10, 1], time: 10 }],
        [[Item.crystal_enr, Item.xiranite_powder], { out: Item.equip_script_4, count: [10, 10, 1], time: 10 }]
    ])

    public static readonly filling_machine_recipe_basic: Map<[Item, Item], { out: Item, count: [number, number, number], time: number }> = new Map([
        [[Item.glass_bottle, Item.plant_moss_powder_2], { out: Item.bottled_food_1, count: [5, 5, 1], time: 10 }],
        [[Item.iron_bottle, Item.plant_moss_powder_2], { out: Item.bottled_food_2, count: [10, 10, 1], time: 10 }],
        [[Item.iron_enr_bottle, Item.plant_moss_enr_powder_2], { out: Item.bottled_food_3, count: [10, 10, 1], time: 10 }],
        [[Item.glass_bottle, Item.plant_moss_powder_1], { out: Item.bottled_rec_hp_1, count: [5, 5, 1], time: 10 }],
        [[Item.iron_bottle, Item.plant_moss_powder_1], { out: Item.bottled_rec_hp_2, count: [10, 10, 1], time: 10 }],
        [[Item.iron_enr_bottle, Item.plant_moss_enr_powder_1], { out: Item.bottled_rec_hp_3, count: [10, 10, 1], time: 10 }]
    ])

    public static readonly filling_machine_recipe_liquid: Map<[Item, Item], { out: Item, count: [number, number, number], time: number }> = new Map([
        [[Item.iron_bottle, Item.liquid_water], { out: Item.fbottle_iron_water, count: [1, 1, 1], time: 2 }],
        [[Item.iron_bottle, Item.liquid_plant_grass_1], { out: Item.fbottle_iron_grass_1, count: [1, 1, 1], time: 2 }],
        [[Item.iron_bottle, Item.liquid_plant_grass_2], { out: Item.fbottle_iron_grass_2, count: [1, 1, 1], time: 2 }],
        [[Item.iron_bottle, Item.liquid_xiranite], { out: Item.fbottle_iron_xiranite, count: [1, 1, 1], time: 2 }],
        [[Item.glass_bottle, Item.liquid_water], { out: Item.fbottle_glass_water, count: [1, 1, 1], time: 2 }],
        [[Item.glass_bottle, Item.liquid_plant_grass_1], { out: Item.fbottle_glass_grass_1, count: [1, 1, 1], time: 2 }],
        [[Item.glass_bottle, Item.liquid_plant_grass_2], { out: Item.fbottle_glass_grass_2, count: [1, 1, 1], time: 2 }],
        [[Item.glass_bottle, Item.liquid_xiranite], { out: Item.fbottle_glass_xiranite, count: [1, 1, 1], time: 2 }],
        [[Item.glass_enr_bottle, Item.liquid_water], { out: Item.fbottle_glassenr_water, count: [1, 1, 1], time: 2 }],
        [[Item.glass_enr_bottle, Item.liquid_plant_grass_1], { out: Item.fbottle_glassenr_grass_1, count: [1, 1, 1], time: 2 }],
        [[Item.glass_enr_bottle, Item.liquid_plant_grass_2], { out: Item.fbottle_glassenr_grass_2, count: [1, 1, 1], time: 2 }],
        [[Item.glass_enr_bottle, Item.liquid_xiranite], { out: Item.fbottle_glassenr_xiranite, count: [1, 1, 1], time: 2 }],
        [[Item.iron_enr_bottle, Item.liquid_water], { out: Item.fbottle_ironenr_water, count: [1, 1, 1], time: 2 }],
        [[Item.iron_enr_bottle, Item.liquid_plant_grass_1], { out: Item.fbottle_ironenr_grass_1, count: [1, 1, 1], time: 2 }],
        [[Item.iron_enr_bottle, Item.liquid_plant_grass_2], { out: Item.fbottle_ironenr_grass_2, count: [1, 1, 1], time: 2 }],
        [[Item.iron_enr_bottle, Item.liquid_xiranite], { out: Item.fbottle_ironenr_xiranite, count: [1, 1, 1], time: 2 }]
    ])

    public static readonly assembly_machine_recipe: Map<[Item, Item], { out: Item, count: [number, number, number], time: number }> = new Map([
        // 工业制品类
        [[Item.glass_cmpt, Item.plant_bbflower_powder_1], { out: Item.proc_bomb_1, count: [5, 1, 1], time: 10 }],
        [[Item.glass_cmpt, Item.originium_powder], { out: Item.proc_battery_1, count: [5, 10, 1], time: 10 }],
        [[Item.iron_cmpt, Item.originium_powder], { out: Item.proc_battery_2, count: [10, 15, 1], time: 10 }],
        [[Item.iron_enr_cmpt, Item.originium_enr_powder], { out: Item.proc_battery_3, count: [10, 15, 1], time: 10 }],
        [[Item.xiranite_powder, Item.originium_enr_powder], { out: Item.proc_battery_4, count: [5, 15, 1], time: 10 }],
        // 药剂/饮品类
        [[Item.iron_cmpt, Item.fbottle_iron_grass_2], { out: Item.bottled_rec_hp_4, count: [10, 5, 1], time: 10 }],
        [[Item.iron_cmpt, Item.fbottle_iron_grass_1], { out: Item.bottled_food_4, count: [10, 5, 1], time: 10 }]
    ])

    public static readonly thickener_recipe: Map<[Item, Item], { out: Item, count: [number, number, number], time: number }> = new Map([
        [[Item.iron_powder, Item.plant_moss_powder_3], { out: Item.iron_enr_powder, count: [2, 1, 1], time: 2 }],
        [[Item.quartz_powder, Item.plant_moss_powder_3], { out: Item.quartz_enr_powder, count: [2, 1, 1], time: 2 }],
        [[Item.originium_powder, Item.plant_moss_powder_3], { out: Item.originium_enr_powder, count: [2, 1, 1], time: 2 }],
        [[Item.carbon_powder, Item.plant_moss_powder_3], { out: Item.carbon_enr_powder, count: [2, 1, 1], time: 2 }],
        [[Item.crystal_powder, Item.plant_moss_powder_3], { out: Item.crystal_enr_powder, count: [2, 1, 1], time: 2 }],
        [[Item.plant_moss_powder_1, Item.plant_moss_powder_3], { out: Item.plant_moss_enr_powder_1, count: [2, 1, 1], time: 2 }],
        [[Item.plant_moss_powder_2, Item.plant_moss_powder_3], { out: Item.plant_moss_enr_powder_2, count: [2, 1, 1], time: 2 }]
    ])

    public static readonly mix_pool_recipe: Map<[Item, Item], { out: Item, count: [number, number, number], time: number }> = new Map([
        [[Item.plant_grass_powder_1, Item.liquid_water], { out: Item.liquid_plant_grass_1, count: [1, 1, 1], time: 2 }],
        [[Item.plant_grass_powder_2, Item.liquid_water], { out: Item.liquid_plant_grass_2, count: [1, 1, 1], time: 2 }],
        [[Item.xiranite_powder, Item.liquid_water], { out: Item.liquid_xiranite, count: [1, 1, 1], time: 2 }]
    ])

    public static readonly xiranite_oven_recipe: Map<[Item, Item], { out: Item, count: [number, number, number], time: number }> = new Map([
        // 基础配方（默认显示）
        [[Item.carbon_enr, Item.liquid_water], { out: Item.xiranite_powder, count: [2, 1, 1], time: 2 }],
        // 隐藏配方（需加工1次后解锁）
        [[Item.muck_feces_1, Item.liquid_xiranite], { out: Item.muck_xiranite_1, count: [1, 1, 1], time: 2 }]
    ])

    public static readonly dismantler_recipe: Map<Item, { out: [Item, Item], count: [number, number, number], time: number }> = new Map([
        // 基础配方（默认显示）
        [Item.fbottle_iron_water, { out: [Item.iron_bottle, Item.liquid_water], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_iron_grass_1, { out: [Item.iron_bottle, Item.liquid_plant_grass_1], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_iron_grass_2, { out: [Item.iron_bottle, Item.liquid_plant_grass_2], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_iron_xiranite, { out: [Item.iron_bottle, Item.liquid_xiranite], count: [1, 1, 1], time: 2 }],
        
        // 隐藏配方（需合成1次后解锁）
        // 紫晶质瓶系列
        [Item.fbottle_glass_water, { out: [Item.glass_bottle, Item.liquid_water], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_glass_grass_1, { out: [Item.glass_bottle, Item.liquid_plant_grass_1], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_glass_grass_2, { out: [Item.glass_bottle, Item.liquid_plant_grass_2], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_glass_xiranite, { out: [Item.glass_bottle, Item.liquid_xiranite], count: [1, 1, 1], time: 2 }],
        
        // 高晶质瓶系列
        [Item.fbottle_glassenr_water, { out: [Item.glass_enr_bottle, Item.liquid_water], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_glassenr_grass_1, { out: [Item.glass_enr_bottle, Item.liquid_plant_grass_1], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_glassenr_grass_2, { out: [Item.glass_enr_bottle, Item.liquid_plant_grass_2], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_glassenr_xiranite, { out: [Item.glass_enr_bottle, Item.liquid_xiranite], count: [1, 1, 1], time: 2 }],
        
        // 钢质瓶系列
        [Item.fbottle_ironenr_water, { out: [Item.iron_enr_bottle, Item.liquid_water], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_ironenr_grass_1, { out: [Item.iron_enr_bottle, Item.liquid_plant_grass_1], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_ironenr_grass_2, { out: [Item.iron_enr_bottle, Item.liquid_plant_grass_2], count: [1, 1, 1], time: 2 }],
        [Item.fbottle_ironenr_xiranite, { out: [Item.iron_enr_bottle, Item.liquid_xiranite], count: [1, 1, 1], time: 2 }]
    ])
}