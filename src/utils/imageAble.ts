export class imageAble {
    id: string;
    imgsrc: string;
    imgCache: HTMLImageElement;
    bitmapCache: ImageBitmap | null = null;

    constructor(id: string, imgsrc: string) {
        this.id = id;
        this.imgsrc = imgsrc;
        const img = document.createElement('img');
        img.src = `${import.meta.env.BASE_URL}` + imgsrc;
        img.alt = id;
        img.style.width = '70%';
        img.style.height = '70%';
        img.style.objectFit = 'contain';
        this.imgCache = img;
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

    public getImageResource() {
        if (!this.bitmapCache) this.createImageBitmap(this.imgCache.src);
        if (this.bitmapCache) return this.bitmapCache;
        return this.imgCache;
    }
}