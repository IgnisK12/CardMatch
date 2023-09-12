import { _decorator, AudioSource, Component, game, Label, Node } from 'cc';
import { SoundManager } from '../Manager/SoundManager';
import { MyPlayer } from '../Model/MyPlayer';
import { PlayController } from './PlayController';
import { LocalStorage } from '../Manager/LocalStorage';
import { Utils } from '../Utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('MainController')
export class MainController extends Component {
    @property(Label)
    protected lbHighScore: Label = null;

    @property(PlayController)
    protected playPanel: PlayController = null;

    @property(Node)
    protected btnResumeGame: Node = null;

    @property(AudioSource)
    protected audioSource: AudioSource = null;

    protected lastGame: any = null;

    protected onLoad() {
        SoundManager.gI().initManager(this.audioSource);
        MyPlayer.gI().highScore = LocalStorage.gI().getHighScore();
        this.updateHighScore();

        this.playPanel.node.active = false;
        game.on('update_high_score', this.updateHighScore, this);

        this.checkResumeData();
    }

    protected checkResumeData() {
        this.lastGame = LocalStorage.gI().getDataGame();
        if (this.lastGame) {
            this.btnResumeGame.active = true;
        } else {
            this.btnResumeGame.active = false;
        }
    }

    protected updateHighScore() {
        this.lbHighScore.string = Utils.formatNumber(MyPlayer.gI().highScore);
    }

    protected onClickBtnPlay() {
        SoundManager.gI().playClick();
        this.playPanel.node.active = true;
        this.playPanel.startNewGame();
    }

    protected onClickResume() {
        SoundManager.gI().playClick();
        this.playPanel.node.active = true;
        this.playPanel.resumeGame(this.lastGame);

        this.lastGame = null;
        this.btnResumeGame.active = false;
    }
}

