class HaveImage {
    imgCache: HTMLImageElement;
    bitmapCache: ImageBitmap | null = null;

    constructor(imgsrc: string) {
        const img = document.createElement('img');
        img.src = imgsrc;
        img.alt = imgsrc;
        img.style.width = '70%';
        img.style.height = '70%';
        img.style.objectFit = 'contain';
        this.imgCache = img;
        this.createImageBitmap(imgsrc);
    }

    // 创建ImageBitmap的异步方法
    private async createImageBitmap(imgsrc: string) {
        try {
            const response = await fetch(imgsrc);
            const blob = await response.blob();
            this.bitmapCache = await createImageBitmap(blob);
        } catch (error) {
            console.error(`Failed to create ImageBitmap`, error);
        }
    }

    // 获取图片资源的方法（优先返回ImageBitmap）
    public getImageResource(): HTMLImageElement | ImageBitmap | null {
        return this.bitmapCache || this.imgCache;
    }

}