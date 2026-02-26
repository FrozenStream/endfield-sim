import { Belt } from "./proto/Belt";
import I18n from "./utils/I18n";
import { Machine } from "./proto/Machines";
import type { GridMap } from "./GridMap";

export class MachinesIconsManager {
    private iconCollection: HTMLElement;
    private gridMap: GridMap;

    public icons: Map<string, HTMLDivElement> = new Map();
    public selectedIcon: HTMLElement | null = null;

    private i18n: I18n = I18n.instance;

    constructor(collectionId: string, gridMap: GridMap) {
        this.iconCollection = document.getElementById(collectionId)!;
        this.gridMap = gridMap;
        this.addBeltIcon(Belt.soildBelt);
        for (const [_, machine] of Machine.allMachines) {
            this.addMachineIcon(machine);
        }
    }

    private buildIconElement(imgCache: HTMLImageElement): HTMLDivElement {
        const iconElement = document.createElement('div');
        iconElement.className = 'machine-icon-element'; // 修改为独特的machine-icon-element类名
        const img = imgCache;
        iconElement.appendChild(img);
        return iconElement;
    }

    private buildNameElement(id: string): HTMLDivElement {
        const nameElement = document.createElement('div');
        nameElement.className = 'machine-name-label'; // 修改为独特的machine-name-label类名
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

    public addMachineIcon(machine: Machine): void {
        // 创建一个容器来包装图标和名称
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'machine-wrapper'; // 添加包装容器类名

        const iconElement = this.buildIconElement(machine.img.imgCache);
        const nameElement = this.buildNameElement(machine.id);

        iconWrapper.appendChild(iconElement);
        iconWrapper.appendChild(nameElement);

        // 将整个包装容器添加到iconCollection中
        this.iconCollection.appendChild(iconWrapper);

        this.icons.set(machine.id, iconElement);

        iconElement.addEventListener('click', () => {
            if (this.gridMap.PreviewMachine?.machine === machine) {
                this.cancel();
                return;
            }
            this.select(machine, iconElement);
        });
    }

    public addBeltIcon(belt: Belt): void {
        // 创建一个容器来包装图标和名称
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'belt-wrapper'; // 添加传送带包装容器类名

        const iconElement = this.buildIconElement(belt.imgCache);
        const nameElement = this.buildNameElement(belt.id);

        iconWrapper.appendChild(iconElement);
        iconWrapper.appendChild(nameElement);

        // 将整个包装容器添加到iconCollection中
        this.iconCollection.appendChild(iconWrapper);

        this.icons.set(belt.id, iconElement);

        iconElement.addEventListener('click', () => {
            if (this.gridMap.PreviewBelt?.beltType === belt) {
                this.cancel();
                return;
            }
            this.select(belt, iconElement);
        });
    }

    public cancel() {
        this.gridMap.previewCancel();
        if (this.selectedIcon)
            this.selectedIcon.classList.remove('machine-selected');
        this.selectedIcon = null;
    }

    public select(type: Machine | Belt, icon: HTMLDivElement) {
        if (this.selectedIcon) this.selectedIcon.classList.remove('machine-selected');
        // 更新选中的图标引用
        this.selectedIcon = icon;
        if (type instanceof Machine) this.gridMap.PreviewMachine = type;
        if (type instanceof Belt) this.gridMap.PreviewBelt = type;
        // 添加selected类到当前选中的图标
        this.selectedIcon.classList.add('machine-selected');
    }
}
