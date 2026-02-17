import EnumItemType from "../utils/EnumItemType";


export class Belt {
    public readonly id: string;
    public readonly type: EnumItemType;
    public readonly imgCache: HTMLImageElement;

    constructor(id: string, type: EnumItemType, imgsrc: string) {
        this.id = id;
        this.type = type;

        const img = document.createElement('img');
        img.src = imgsrc;
        img.alt = type.toString();
        img.style.width = '70%';
        img.style.height = '70%';
        img.style.objectFit = 'contain';
        this.imgCache = img;
    }

    public static readonly soildBelt: Belt = new Belt("solid_belt", EnumItemType.SOLID, '/icon_belt/image_grid_belt_01.png');
}