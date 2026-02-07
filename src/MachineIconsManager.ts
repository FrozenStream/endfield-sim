import I18n from "./I18n";
import {Machine} from "./machines/Machines";



class SelectedMachine {
    public static selected: Machine | null = null;
    public static selectedIcon: HTMLElement | null = null;

    public static rotation: number = 0;

    public static cancel(): void {
        if (SelectedMachine.selectedIcon) {
            SelectedMachine.selectedIcon.classList.remove('active');
        }
        SelectedMachine.selectedIcon = null;
        SelectedMachine.selected = null;
        SelectedMachine.rotation = 0;

        console.log("Canceled selection.");
    }

    public static select(key: string) {
        if (SelectedMachine.selectedIcon) {
            SelectedMachine.selectedIcon.classList.remove('active');
        }

        // 更新选中的图标引用
        SelectedMachine.selectedIcon = MachineIconsManager.icons.get(key)!;
        SelectedMachine.selected = Machine.getAllMachines().get(key)!;

        // 添加active类到当前选中的图标
        SelectedMachine.selectedIcon.classList.add('active');
        console.log("Selected icon: " + SelectedMachine.selected.id);
    }
}


class MachineIconsManager {
    private iconCollection: HTMLElement;

    public static icons: Map<string, HTMLDivElement> = new Map();

    private i18n: I18n = new I18n('/i18n/machines');

    constructor(collectionId: string) {
        this.iconCollection = document.getElementById(collectionId)!;
        for (const [key, machine] of Machine.getAllMachines()) {
            this.addIcon(key, machine);
        }
    }

    public addIcon(key: string, machine: Machine): void {

        // 创建一个容器来包装图标和名称
        const iconWrapper = document.createElement('div');

        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item';
        // 创建img元素
        const img = document.createElement('img');
        img.src = machine.imgsrc;
        this.i18n.addTranslateList(() => {
            img.alt = this.i18n.t(machine.id);
        });
        img.style.width = '70%';
        img.style.height = '70%';
        img.style.objectFit = 'contain';
        iconElement.appendChild(img);
        // 将图标元素添加到包装容器
        iconWrapper.appendChild(iconElement);

        // 添加名称显示（在蓝色背景外）
        const nameElement = document.createElement('div');
        nameElement.className = 'icon-name'; // 添加CSS类名
        this.i18n.addTranslateList(() => {
            nameElement.textContent = this.i18n.t(machine.id);
        });
        nameElement.style.fontSize = '12px';
        nameElement.style.textAlign = 'center';
        nameElement.style.marginTop = '4px';
        nameElement.style.maxWidth = '100%';
        nameElement.style.overflow = 'hidden';
        nameElement.style.textOverflow = 'ellipsis';
        iconWrapper.appendChild(nameElement);

        // 将整个包装容器添加到iconCollection中
        this.iconCollection.appendChild(iconWrapper);

        MachineIconsManager.icons.set(key, iconElement);

        iconElement.addEventListener('click', () => {
            if (SelectedMachine.selectedIcon == iconElement) {
                SelectedMachine.cancel();
                return;
            }
            SelectedMachine.select(key);
        });
    }
}


export { SelectedMachine, MachineIconsManager };