import { _decorator, AudioSource, Component, Label, Node } from 'cc';
import { SoundManager } from '../Manager/SoundManager';
import { MyPlayer } from '../Model/MyPlayer';
const { ccclass, property } = _decorator;

@ccclass('MainController')
export class MainController extends Component {
    @property(Label)
    protected lbHighScore: Label = null;

    @property(Node)
    protected playPanel: Node = null;

    @property(AudioSource)
    protected audioSource: AudioSource = null;

    protected onLoad() {
        SoundManager.gI().initManager(this.audioSource);
        MyPlayer.gI().highScore = 5;
    }

    protected onClickBtnPlay() {
        SoundManager.gI().playClick();
        this.playPanel.active = true;
    }
}

