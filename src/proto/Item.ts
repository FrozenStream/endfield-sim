import EnumItemType from "../utils/EnumItemType";

export class Item {
    id: string;
    type: EnumItemType;
    imgCache: HTMLImageElement;
    bitmapCache: ImageBitmap | null = null;

    constructor(id: string, type: EnumItemType, imgsrc: string) {
        this.id = id;
        this.type = type;

        const img = document.createElement('img');
        img.src = `${import.meta.env.BASE_URL}` + imgsrc;
        img.alt = id;
        img.style.width = '70%';
        img.style.height = '70%';
        img.style.objectFit = 'contain';
        this.imgCache = img;

        this.createImageBitmap(imgsrc);

        Item.allItems.set(id, this);
    }

    // 创建ImageBitmap的异步方法
    private async createImageBitmap(imgsrc: string) {
        try {
            const response = await fetch(imgsrc);
            const blob = await response.blob();
            this.bitmapCache = await createImageBitmap(blob);
            console.log(`ImageBitmap created for ${this.id}`);
        } catch (error) {
            console.error(`Failed to create ImageBitmap for ${this.id}:`, error);
        }
    }

    // 获取图片资源的方法（优先返回ImageBitmap）
    public getImageResource(): HTMLImageElement | ImageBitmap | null {
        return this.bitmapCache || this.imgCache;
    }

    public static allItems: Map<string, Item> = new Map();

    public static readonly bottled_food_1: Item = new Item('item_bottled_food_1', EnumItemType.SOLID, '/items/item_bottled_food_1.png');
    public static readonly bottled_food_2: Item = new Item('item_bottled_food_2', EnumItemType.SOLID, '/items/item_bottled_food_2.png');
    public static readonly bottled_food_3: Item = new Item('item_bottled_food_3', EnumItemType.SOLID, '/items/item_bottled_food_3.png');
    public static readonly bottled_food_4: Item = new Item('item_bottled_food_4', EnumItemType.SOLID, '/items/item_bottled_food_4.png');
    public static readonly bottled_rec_hp_1: Item = new Item('item_bottled_rec_hp_1', EnumItemType.SOLID, '/items/item_bottled_rec_hp_1.png');
    public static readonly bottled_rec_hp_2: Item = new Item('item_bottled_rec_hp_2', EnumItemType.SOLID, '/items/item_bottled_rec_hp_2.png');
    public static readonly bottled_rec_hp_3: Item = new Item('item_bottled_rec_hp_3', EnumItemType.SOLID, '/items/item_bottled_rec_hp_3.png');
    public static readonly bottled_rec_hp_4: Item = new Item('item_bottled_rec_hp_4', EnumItemType.SOLID, '/items/item_bottled_rec_hp_4.png');
    public static readonly carbon_enr: Item = new Item('item_carbon_enr', EnumItemType.SOLID, '/items/item_carbon_enr.png');
    public static readonly carbon_enr_powder: Item = new Item('item_carbon_enr_powder', EnumItemType.SOLID, '/items/item_carbon_enr_powder.png');
    public static readonly carbon_mtl: Item = new Item('item_carbon_mtl', EnumItemType.SOLID, '/items/item_carbon_mtl.png');
    public static readonly carbon_powder: Item = new Item('item_carbon_powder', EnumItemType.SOLID, '/items/item_carbon_powder.png');
    public static readonly crystal_enr: Item = new Item('item_crystal_enr', EnumItemType.SOLID, '/items/item_crystal_enr.png');
    public static readonly crystal_enr_powder: Item = new Item('item_crystal_enr_powder', EnumItemType.SOLID, '/items/item_crystal_enr_powder.png');
    public static readonly crystal_powder: Item = new Item('item_crystal_powder', EnumItemType.SOLID, '/items/item_crystal_powder.png');
    public static readonly crystal_shell: Item = new Item('item_crystal_shell', EnumItemType.SOLID, '/items/item_crystal_shell.png');
    public static readonly equip_script_1: Item = new Item('item_equip_script_1', EnumItemType.SOLID, '/items/item_equip_script_1.png');
    public static readonly equip_script_2: Item = new Item('item_equip_script_2', EnumItemType.SOLID, '/items/item_equip_script_2.png');
    public static readonly equip_script_3: Item = new Item('item_equip_script_3', EnumItemType.SOLID, '/items/item_equip_script_3.png');
    public static readonly equip_script_4: Item = new Item('item_equip_script_4', EnumItemType.SOLID, '/items/item_equip_script_4.png');
    public static readonly fbottle_glassenr_grass_1: Item = new Item('item_fbottle_glassenr_grass_1', EnumItemType.SOLID, '/items/item_fbottle_glassenr_grass_1.png');
    public static readonly fbottle_glassenr_grass_2: Item = new Item('item_fbottle_glassenr_grass_2', EnumItemType.SOLID, '/items/item_fbottle_glassenr_grass_2.png');
    public static readonly fbottle_glassenr_water: Item = new Item('item_fbottle_glassenr_water', EnumItemType.SOLID, '/items/item_fbottle_glassenr_water.png');
    public static readonly fbottle_glassenr_xiranite: Item = new Item('item_fbottle_glassenr_xiranite', EnumItemType.SOLID, '/items/item_fbottle_glassenr_xiranite.png');
    public static readonly fbottle_glass_grass_1: Item = new Item('item_fbottle_glass_grass_1', EnumItemType.SOLID, '/items/item_fbottle_glass_grass_1.png');
    public static readonly fbottle_glass_grass_2: Item = new Item('item_fbottle_glass_grass_2', EnumItemType.SOLID, '/items/item_fbottle_glass_grass_2.png');
    public static readonly fbottle_glass_water: Item = new Item('item_fbottle_glass_water', EnumItemType.SOLID, '/items/item_fbottle_glass_water.png');
    public static readonly fbottle_glass_xiranite: Item = new Item('item_fbottle_glass_xiranite', EnumItemType.SOLID, '/items/item_fbottle_glass_xiranite.png');
    public static readonly fbottle_ironenr_grass_1: Item = new Item('item_fbottle_ironenr_grass_1', EnumItemType.SOLID, '/items/item_fbottle_ironenr_grass_1.png');
    public static readonly fbottle_ironenr_grass_2: Item = new Item('item_fbottle_ironenr_grass_2', EnumItemType.SOLID, '/items/item_fbottle_ironenr_grass_2.png');
    public static readonly fbottle_ironenr_water: Item = new Item('item_fbottle_ironenr_water', EnumItemType.SOLID, '/items/item_fbottle_ironenr_water.png');
    public static readonly fbottle_ironenr_xiranite: Item = new Item('item_fbottle_ironenr_xiranite', EnumItemType.SOLID, '/items/item_fbottle_ironenr_xiranite.png');
    public static readonly fbottle_iron_grass_1: Item = new Item('item_fbottle_iron_grass_1', EnumItemType.SOLID, '/items/item_fbottle_iron_grass_1.png');
    public static readonly fbottle_iron_grass_2: Item = new Item('item_fbottle_iron_grass_2', EnumItemType.SOLID, '/items/item_fbottle_iron_grass_2.png');
    public static readonly fbottle_iron_water: Item = new Item('item_fbottle_iron_water', EnumItemType.SOLID, '/items/item_fbottle_iron_water.png');
    public static readonly fbottle_iron_xiranite: Item = new Item('item_fbottle_iron_xiranite', EnumItemType.SOLID, '/items/item_fbottle_iron_xiranite.png');
    public static readonly glass_bottle: Item = new Item('item_glass_bottle', EnumItemType.SOLID, '/items/item_glass_bottle.png');
    public static readonly glass_cmpt: Item = new Item('item_glass_cmpt', EnumItemType.SOLID, '/items/item_glass_cmpt.png');
    public static readonly glass_enr_bottle: Item = new Item('item_glass_enr_bottle', EnumItemType.SOLID, '/items/item_glass_enr_bottle.png');
    public static readonly glass_enr_cmpt: Item = new Item('item_glass_enr_cmpt', EnumItemType.SOLID, '/items/item_glass_enr_cmpt.png');
    public static readonly iron_bottle: Item = new Item('item_iron_bottle', EnumItemType.SOLID, '/items/item_iron_bottle.png');
    public static readonly iron_cmpt: Item = new Item('item_iron_cmpt', EnumItemType.SOLID, '/items/item_iron_cmpt.png');
    public static readonly iron_enr: Item = new Item('item_iron_enr', EnumItemType.SOLID, '/items/item_iron_enr.png');
    public static readonly iron_enr_bottle: Item = new Item('item_iron_enr_bottle', EnumItemType.SOLID, '/items/item_iron_enr_bottle.png');
    public static readonly iron_enr_cmpt: Item = new Item('item_iron_enr_cmpt', EnumItemType.SOLID, '/items/item_iron_enr_cmpt.png');
    public static readonly iron_enr_powder: Item = new Item('item_iron_enr_powder', EnumItemType.SOLID, '/items/item_iron_enr_powder.png');
    public static readonly iron_nugget: Item = new Item('item_iron_nugget', EnumItemType.SOLID, '/items/item_iron_nugget.png');
    public static readonly iron_ore: Item = new Item('item_iron_ore', EnumItemType.SOLID, '/items/item_iron_ore.png');
    public static readonly iron_powder: Item = new Item('item_iron_powder', EnumItemType.SOLID, '/items/item_iron_powder.png');
    public static readonly liquid_plant_grass_1: Item = new Item('item_liquid_plant_grass_1', EnumItemType.LIQUID, '/items/item_liquid_plant_grass_1.png');
    public static readonly liquid_plant_grass_2: Item = new Item('item_liquid_plant_grass_2', EnumItemType.LIQUID, '/items/item_liquid_plant_grass_2.png');
    public static readonly liquid_water: Item = new Item('item_liquid_water', EnumItemType.LIQUID, '/items/item_liquid_water.png');
    public static readonly liquid_xiranite: Item = new Item('item_liquid_xiranite', EnumItemType.LIQUID, '/items/item_liquid_xiranite.png');
    public static readonly muck_feces_1: Item = new Item('item_muck_feces_1', EnumItemType.SOLID, '/items/item_muck_feces_1.png');
    public static readonly muck_xiranite_1: Item = new Item('item_muck_xiranite_1', EnumItemType.SOLID, '/items/item_muck_xiranite_1.png');
    public static readonly originium_enr_powder: Item = new Item('item_originium_enr_powder', EnumItemType.SOLID, '/items/item_originium_enr_powder.png');
    public static readonly originium_ore: Item = new Item('item_originium_ore', EnumItemType.SOLID, '/items/item_originium_ore.png');
    public static readonly originium_powder: Item = new Item('item_originium_powder', EnumItemType.SOLID, '/items/item_originium_powder.png');
    public static readonly plant_bbflower_1: Item = new Item('item_plant_bbflower_1', EnumItemType.SOLID, '/items/item_plant_bbflower_1.png');
    public static readonly plant_bbflower_powder_1: Item = new Item('item_plant_bbflower_powder_1', EnumItemType.SOLID, '/items/item_plant_bbflower_powder_1.png');
    public static readonly plant_bbflower_seed_1: Item = new Item('item_plant_bbflower_seed_1', EnumItemType.SOLID, '/items/item_plant_bbflower_seed_1.png');
    public static readonly plant_grass_1: Item = new Item('item_plant_grass_1', EnumItemType.SOLID, '/items/item_plant_grass_1.png');
    public static readonly plant_grass_2: Item = new Item('item_plant_grass_2', EnumItemType.SOLID, '/items/item_plant_grass_2.png');
    public static readonly plant_grass_powder_1: Item = new Item('item_plant_grass_powder_1', EnumItemType.SOLID, '/items/item_plant_grass_powder_1.png');
    public static readonly plant_grass_powder_2: Item = new Item('item_plant_grass_powder_2', EnumItemType.SOLID, '/items/item_plant_grass_powder_2.png');
    public static readonly plant_grass_seed_1: Item = new Item('item_plant_grass_seed_1', EnumItemType.SOLID, '/items/item_plant_grass_seed_1.png');
    public static readonly plant_grass_seed_2: Item = new Item('item_plant_grass_seed_2', EnumItemType.SOLID, '/items/item_plant_grass_seed_2.png');
    public static readonly plant_moss_1: Item = new Item('item_plant_moss_1', EnumItemType.SOLID, '/items/item_plant_moss_1.png');
    public static readonly plant_moss_2: Item = new Item('item_plant_moss_2', EnumItemType.SOLID, '/items/item_plant_moss_2.png');
    public static readonly plant_moss_3: Item = new Item('item_plant_moss_3', EnumItemType.SOLID, '/items/item_plant_moss_3.png');
    public static readonly plant_moss_enr_powder_1: Item = new Item('item_plant_moss_enr_powder_1', EnumItemType.SOLID, '/items/item_plant_moss_enr_powder_1.png');
    public static readonly plant_moss_enr_powder_2: Item = new Item('item_plant_moss_enr_powder_2', EnumItemType.SOLID, '/items/item_plant_moss_enr_powder_2.png');
    public static readonly plant_moss_powder_1: Item = new Item('item_plant_moss_powder_1', EnumItemType.SOLID, '/items/item_plant_moss_powder_1.png');
    public static readonly plant_moss_powder_2: Item = new Item('item_plant_moss_powder_2', EnumItemType.SOLID, '/items/item_plant_moss_powder_2.png');
    public static readonly plant_moss_powder_3: Item = new Item('item_plant_moss_powder_3', EnumItemType.SOLID, '/items/item_plant_moss_powder_3.png');
    public static readonly plant_moss_seed_1: Item = new Item('item_plant_moss_seed_1', EnumItemType.SOLID, '/items/item_plant_moss_seed_1.png');
    public static readonly plant_moss_seed_2: Item = new Item('item_plant_moss_seed_2', EnumItemType.SOLID, '/items/item_plant_moss_seed_2.png');
    public static readonly plant_moss_seed_3: Item = new Item('item_plant_moss_seed_3', EnumItemType.SOLID, '/items/item_plant_moss_seed_3.png');
    public static readonly plant_sp_1: Item = new Item('item_plant_sp_1', EnumItemType.SOLID, '/items/item_plant_sp_1.png');
    public static readonly plant_sp_2: Item = new Item('item_plant_sp_2', EnumItemType.SOLID, '/items/item_plant_sp_2.png');
    public static readonly plant_sp_3: Item = new Item('item_plant_sp_3', EnumItemType.SOLID, '/items/item_plant_sp_3.png');
    public static readonly plant_sp_4: Item = new Item('item_plant_sp_4', EnumItemType.SOLID, '/items/item_plant_sp_4.png');
    public static readonly plant_sp_seed_1: Item = new Item('item_plant_sp_seed_1', EnumItemType.SOLID, '/items/item_plant_sp_seed_1.png');
    public static readonly plant_sp_seed_2: Item = new Item('item_plant_sp_seed_2', EnumItemType.SOLID, '/items/item_plant_sp_seed_2.png');
    public static readonly plant_sp_seed_3: Item = new Item('item_plant_sp_seed_3', EnumItemType.SOLID, '/items/item_plant_sp_seed_3.png');
    public static readonly plant_sp_seed_4: Item = new Item('item_plant_sp_seed_4', EnumItemType.SOLID, '/items/item_plant_sp_seed_4.png');
    public static readonly plant_tundra_wood: Item = new Item('item_plant_tundra_wood', EnumItemType.SOLID, '/items/item_plant_tundra_wood.png');
    public static readonly proc_battery_1: Item = new Item('item_proc_battery_1', EnumItemType.SOLID, '/items/item_proc_battery_1.png');
    public static readonly proc_battery_2: Item = new Item('item_proc_battery_2', EnumItemType.SOLID, '/items/item_proc_battery_2.png');
    public static readonly proc_battery_3: Item = new Item('item_proc_battery_3', EnumItemType.SOLID, '/items/item_proc_battery_3.png');
    public static readonly proc_battery_4: Item = new Item('item_proc_battery_4', EnumItemType.SOLID, '/items/item_proc_battery_4.png');
    public static readonly proc_bomb_1: Item = new Item('item_proc_bomb_1', EnumItemType.SOLID, '/items/item_proc_bomb_1.png');
    public static readonly quartz_enr: Item = new Item('item_quartz_enr', EnumItemType.SOLID, '/items/item_quartz_enr.png');
    public static readonly quartz_enr_powder: Item = new Item('item_quartz_enr_powder', EnumItemType.SOLID, '/items/item_quartz_enr_powder.png');
    public static readonly quartz_glass: Item = new Item('item_quartz_glass', EnumItemType.SOLID, '/items/item_quartz_glass.png');
    public static readonly quartz_powder: Item = new Item('item_quartz_powder', EnumItemType.SOLID, '/items/item_quartz_powder.png');
    public static readonly quartz_sand: Item = new Item('item_quartz_sand', EnumItemType.SOLID, '/items/item_quartz_sand.png');
    public static readonly xiranite_powder: Item = new Item('item_xiranite_powder', EnumItemType.SOLID, '/items/item_xiranite_powder.png');
}


export function itemsTostring(items: (Item | null)[]): string {
    return items.map(item => item?.id ?? "null").join(',');
}