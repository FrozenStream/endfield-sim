class EnumItemType {
    private readonly type: string;

    constructor(type: string) {
        this.type = type;
    }

    toString(): string {
        return this.type;
    }

    public static readonly ANY: EnumItemType = new EnumItemType('any');
    public static readonly SOLID: EnumItemType = new EnumItemType('solid');
    public static readonly LIQUID: EnumItemType = new EnumItemType('liquid');
}


export default EnumItemType;