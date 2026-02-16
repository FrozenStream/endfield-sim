import I18n from "./I18n";
import Item from "./Item";

class ItemIconManager {
    private iconCollection: HTMLElement;

    public static icons: Map<string, HTMLDivElement> = new Map();
    public static selectedIcon: HTMLElement | null = null;

    private i18n: I18n = I18n.instance;

    constructor(collectionId: string) {
        this.iconCollection = document.getElementById(collectionId)!;
        this.iconCollection.classList.add('item-manager-container');
        
        for (const [_, item] of Item.allItems) {
            this.addItem(item);
        }
    }

    private buildIconElement(imgCache: HTMLImageElement): HTMLDivElement {
        const iconElement = document.createElement('div');
        iconElement.className = 'item-icon-element';  // 修改为独特的item-icon-element类名
        const img = imgCache;
        iconElement.appendChild(img);
        return iconElement;
    }

    private buildNameElement(id: string): HTMLDivElement {
        const nameElement = document.createElement('div');
        nameElement.className = 'item-name-label'; // 修改为独特的item-name-label类名
        this.i18n.addTranslateList(() => {
            nameElement.textContent = this.i18n.t(id);
        });
        nameElement.style.fontSize = '12px';
        nameElement.style.textAlign = 'center';
        nameElement.style.marginTop = '4px';
        nameElement.style.maxWidth = '100%';
        nameElement.style.overflow = 'hidden';
        nameElement.style.textOverflow = 'ellipsis';
        return nameElement;
    }

    public addItem(item: Item): void {
        // 创建一个容器来包装图标和名称
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'item-wrapper'; // 添加包装容器类名

        const iconElement = this.buildIconElement(item.imgCache);
        const nameElement = this.buildNameElement(item.id);

        iconWrapper.appendChild(iconElement);
        iconWrapper.appendChild(nameElement);

        // 将整个包装容器添加到iconCollection中
        this.iconCollection.appendChild(iconWrapper);

        ItemIconManager.icons.set(item.id, iconElement);

        iconElement.addEventListener('click', () => {
            // ItemManager的点击逻辑
            if (ItemIconManager.selectedIcon) {
                ItemIconManager.selectedIcon.classList.remove('item-selected');
            }
            ItemIconManager.selectedIcon = iconElement;
            iconElement.classList.add('item-selected');
            console.log("Selected item: " + item.id);
        });
    }
}


export default ItemIconManager;