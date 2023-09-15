import { _decorator, instantiate, Node, ScrollView } from 'cc';
import { PopupAbstract } from './PopupAbstract';
import { Config } from '../../Config/Config';
import { ItemSelectLevel } from './ItemPopup/ItemSelectLevel';
import { LevelInfo } from '../../Model/GameModel';
import { LocalStorage } from '../../Manager/LocalStorage';

const { ccclass, property } = _decorator;

@ccclass('PopupSelectLevel')
export class PopupSelectLevel extends PopupAbstract {
    @property(ScrollView)
    protected levelScrollView: ScrollView = null;

    @property(Node)
    protected templateItem: Node = null;

    protected selectCompleteCb: Function = null;

    protected onLoad(): void {
        this.templateItem.active = false;
    }

    protected beforeShow(data: any): void {
        this.levelScrollView.content.destroyAllChildren();
        for (let i = 0; i < Config.MAX_LEVEL; i++) {
            const item = instantiate(this.templateItem);
            item.parent = this.levelScrollView.content;
            item.active = true;

            const ctr = item.getComponent(ItemSelectLevel);
            const level = i + 1;
            ctr.initItem(this.getInfoLevel(level));
            ctr.setSelectCallback(() => {
                this.doSelectLevel(level);
            })
        }

        this.selectCompleteCb = data['selectCallback'];
    }

    protected getInfoLevel(level: number): LevelInfo {
        const condition = Config.LEVEL_CONDITIONS[level];
        let info = new LevelInfo(level, condition['condition']);

        const oldInfo = LocalStorage.gI().getLevelInfo(level);
        if (oldInfo) {
            info.deserializeObject(oldInfo);
        }
        return info;
    }

    protected doSelectLevel(level: number) {
        if (this.selectCompleteCb) {
            this.selectCompleteCb(level);
        }
        this.clickHide();
    }
}

