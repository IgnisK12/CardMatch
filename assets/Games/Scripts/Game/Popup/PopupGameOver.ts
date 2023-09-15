import { Button, Label, _decorator } from "cc";
import { Utils } from "../../Utils/Utils";
import { MyPlayer } from "../../Model/MyPlayer";
import { PopupAbstract } from "./PopupAbstract";
import { BoardData } from "../../Model/GameModel";
import { Config } from "../../Config/Config";

const { ccclass, property } = _decorator;

@ccclass('PopupGameOver')
export class PopupGameOver extends PopupAbstract {
    @property(Label)
    protected lbTitlePopup: Label = null;

    @property(Label)
    protected lbCurrentScore: Label = null;
    @property(Label)
    protected lbHighScore: Label = null;
    @property(Label)
    protected lbTurnCount: Label = null;
    @property(Label)
    protected lbLevel: Label = null;

    @property(Button)
    protected btnNextLevel: Button = null;

    protected closePopupCb: Function = null;

    public beforeShow(data: any) {
        if (data) {
            const boardInfo = data.boardData as BoardData;

            this.btnNextLevel.node.active = boardInfo.isGameWin() && boardInfo.levelGame < Config.MAX_LEVEL;

            this.lbTitlePopup.string = boardInfo.isGameWin() ? 'YOU WIN' : 'YOU LOSE';
            this.lbCurrentScore.string = Utils.formatNumber(boardInfo.score);
            
            const highScore = boardInfo.score > MyPlayer.gI().highScore ? boardInfo.score : MyPlayer.gI().highScore;
            this.lbHighScore.string = Utils.formatNumber(highScore);

            this.lbTurnCount.string = boardInfo.turnCount + '/' + boardInfo.getConditionValue();
            this.lbLevel.string = boardInfo.levelGame.toString();

            this.closePopupCb = data.closeCb;
        }
    }

    protected setHighScore() {
        this.lbHighScore.string = Utils.formatNumber(MyPlayer.gI().highScore);
    }

    protected setCurrentScore(value: number) {
        this.lbCurrentScore.string = Utils.formatNumber(value);
    }

    protected onClickChooseValue(event: Event, customEventData: string) {
        const value = parseInt(customEventData);
        this.clickHide();
        if (this.closePopupCb) {
            this.closePopupCb(value);
        }
    }
}

