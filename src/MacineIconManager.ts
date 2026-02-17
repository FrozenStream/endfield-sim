import { Belt } from "./proto/Belt";
import GridMap from "./GridMap";
import I18n from "./utils/I18n";
import { Machine } from "./proto/Machines";

export class MachinesIconsManager {
    private iconCollection: HTMLElement;

    public static icons: Map<string, HTMLDivElement> = new Map();
    public static selectedIcon: HTMLElement | null = null;

    private i18n: I18n = I18n.instance;

    constructor(collectionId: string) {
        this.iconCollection = document.getElementById(collectionId)!;
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

        const iconElement = this.buildIconElement(machine.imgCache);
        const nameElement = this.buildNameElement(machine.id);

        iconWrapper.appendChild(iconElement);
        iconWrapper.appendChild(nameElement);

        // 将整个包装容器添加到iconCollection中
        this.iconCollection.appendChild(iconWrapper);

        MachinesIconsManager.icons.set(machine.id, iconElement);

        iconElement.addEventListener('click', () => {
            if (GridMap.PreviewMachine?.machine === machine) {
                MachinesIconsManager.cancel();
                return;
            }
            MachinesIconsManager.select(machine, iconElement);
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

        MachinesIconsManager.icons.set(belt.id, iconElement);

        iconElement.addEventListener('click', () => {
            if (GridMap.PreviewBelt?.beltType === belt) {
                MachinesIconsManager.cancel();
                return;
            }
            MachinesIconsManager.select(belt, iconElement);
        });
    }

    public static cancel() {
        GridMap.previewCancel();
        if (MachinesIconsManager.selectedIcon)
            MachinesIconsManager.selectedIcon.classList.remove('machine-selected');
        MachinesIconsManager.selectedIcon = null;
    }

    public static select(type: Machine | Belt, icon: HTMLDivElement) {
        if (MachinesIconsManager.selectedIcon) MachinesIconsManager.selectedIcon.classList.remove('machine-selected');
        // 更新选中的图标引用
        MachinesIconsManager.selectedIcon = icon;
        if (type instanceof Machine) GridMap.PreviewMachine = type;
        if (type instanceof Belt) GridMap.PreviewBelt = type;
        // 添加selected类到当前选中的图标
        MachinesIconsManager.selectedIcon.classList.add('machine-selected');
    }
}
