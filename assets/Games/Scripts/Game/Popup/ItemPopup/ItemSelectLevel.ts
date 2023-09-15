import { _decorator, Component, Label, Node } from 'cc';
import { SoundManager } from '../../../Manager/SoundManager';
import { LevelInfo } from '../../../Model/GameModel';
const { ccclass, property } = _decorator;

@ccclass('ItemSelectLevel')
export class ItemSelectLevel extends Component {
    @property(Label)
    protected lbLevel: Label = null;
    @property(Label)
    protected lbLastTurnCount: Label = null;

    @property(Node)
    protected uiComplete: Node = null;

    protected selectCallback: Function = null;

    public initItem(info: LevelInfo) {
        this.lbLevel.string = info.level.toString();
        this.lbLastTurnCount.string = info.lastTurnCount + "/" + info.condition;

        this.uiComplete.active = info.isFinished;
    }

    public setSelectCallback(callback: Function) {
        this.selectCallback = callback;
    }

    protected onClickSelect() {
        SoundManager.gI().playClick();
        if (this.selectCallback) {
            this.selectCallback();
        }
    }
}



