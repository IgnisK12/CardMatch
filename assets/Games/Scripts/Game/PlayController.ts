import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { SoundManager } from '../Manager/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('PlayController')
export class PlayController extends Component {
    @property([SpriteFrame])
    protected listSprFrameCards: SpriteFrame[] = [];

    public startGame() {

    }


    protected onClickBackLobby() {
        SoundManager.gI().playClick();
        this.node.active = false;
    }
}

