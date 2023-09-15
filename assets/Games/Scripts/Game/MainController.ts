import { _decorator, AudioSource, Component, game, Label, Node } from 'cc';
import { SoundManager } from '../Manager/SoundManager';
import { MyPlayer } from '../Model/MyPlayer';
import { PlayController } from './PlayController';
import { LocalStorage } from '../Manager/LocalStorage';
import { Utils } from '../Utils/Utils';
import { PopupManager } from '../Manager/PopupManager';

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
        this.playPanel.setBackLobbyCallback(() => {
            this.checkResumeData();
        })
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

    protected doPlayGame(level: number) {
        this.playPanel.startNewGame(level);
        this.setUIPlayGame();
    }

    protected setUIPlayGame() {
        this.playPanel.node.active = true;
        this.lastGame = null;
        this.btnResumeGame.active = false;
    }

    //#region Click Handler
    protected onClickShowPopupLevel() {
        SoundManager.gI().playClick();
        PopupManager.gI().showPopupGame('PopupSelectLevel', null, {selectCallback: this.doPlayGame.bind(this)});
    }

    protected onClickResume() {
        SoundManager.gI().playClick();
        
        this.playPanel.resumeGame(this.lastGame);
        this.setUIPlayGame();
    }
    //#endregion
}

