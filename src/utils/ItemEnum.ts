class ItemEnum {
    private type: string;

    constructor(type: string) {
        this.type = type;
    }

    toString(): string {
        return this.type;
    }

    public static readonly SOLID: ItemEnum = new ItemEnum('solid');
    public static readonly LIQUID: ItemEnum = new ItemEnum('liquid');
}


export default ItemEnum;