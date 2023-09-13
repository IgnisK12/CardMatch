import { _decorator, Component, instantiate, Label, Node, Prefab, Size, SpriteFrame, Tween, tween, UITransform } from 'cc';
import { SoundManager } from '../Manager/SoundManager';
import { Config } from '../Config/Config';
import { Utils } from '../Utils/Utils';
import { Card } from '../Component/Card';
import { MyPlayer } from '../Model/MyPlayer';
import { LocalStorage } from '../Manager/LocalStorage';
const { ccclass, property } = _decorator;

@ccclass('PlayController')
export class PlayController extends Component {
    @property(UITransform)
    protected playBoard: UITransform = null;

    @property(Node)
    protected cardLayer: Node = null;

    @property(Label)
    protected lbCurrentScore: Label = null;

    @property(Label)
    protected lbTurn: Label = null;

    @property(Prefab)
    protected cardPrefab: Prefab = null;

    @property(Node)
    protected panelGameOver: Node = null;

    @property([SpriteFrame])
    protected listSprFrameCards: SpriteFrame[] = [];

    protected padding = 10;

    protected boardSize: Size = null;
    protected cardWidth = 0;
    protected cardHeight = 0;

    protected _currentScore: number = 0;
    public get currentScore() {
        return this._currentScore;
    }
    public set currentScore(val: number) {
        this._currentScore = val;
        this.lbCurrentScore.string = Utils.formatNumber(this._currentScore);
    }

    protected gameData: BoardData = null;

    public startNewGame() {
        this.resetGame();

        const totalCard = this.checkTotalCard();
        const shuffleResults = this.shuffleCard(totalCard);

        this.gameData.totalCard = totalCard;
        this.gameData.arrayResults = shuffleResults;

        this.initBoardGame(totalCard);
    }

    public resumeGame(obj: any) {
        this.resetGame();
        this.gameData.deserializeObject(obj);

        this.initBoardGame(this.gameData.totalCard);
    }

    //#region Logic Game
    protected checkTotalCard(): number {
        this.gameData.numColumn = Config.COLUMN;
        this.gameData.numRow = Config.ROW;
        
        let totalCard = Config.COLUMN * Config.ROW;
        if (totalCard % 2 != 0) {
            totalCard -= 1;
        }

        if (totalCard / 2 > this.listSprFrameCards.length) {
            totalCard = this.listSprFrameCards.length * 2;
            this.gameData.numColumn = Math.floor(Math.sqrt(totalCard)) + 1;
            this.gameData.numRow = Math.round(totalCard / this.gameData.numColumn);
        }

        return totalCard;
    }

    protected shuffleCard(totalCard: number): number[] {
        const boardPairs = [];
        for (let i = 0; i < totalCard; i++) {
            boardPairs.push(Math.floor(i / 2));
        }
        for (let i = 0; i < totalCard; i++) {
            const rand = Utils.getRandomInt(totalCard, 0);
            const temp = boardPairs[i];
            boardPairs[i] = boardPairs[rand];
            boardPairs[rand] = temp;
        }
        return boardPairs;
    }

    protected initBoardGame(totalCard: number) {
        const column = this.gameData.numColumn;
        const row = this.gameData.numRow;

        this.lbTurn.string = Utils.formatNumber(this.gameData.turnCount);

        this.boardSize = this.playBoard.contentSize;
        this.cardWidth = this.calculateSize(this.boardSize.width, this.gameData.numColumn);
        this.cardHeight = this.calculateSize(this.boardSize.height, this.gameData.numRow);
        
        for (let i = 0; i < column; i++) {
            for (let j = 0; j < row; j++) {
                const index = j * column + i;
                if (index >= totalCard) {
                    break;
                }

                const obj = instantiate(this.cardPrefab);
                obj.parent = this.cardLayer;
                obj.active = true;
        
                const posX = (this.padding + this.cardWidth * i + this.padding * i + this.cardWidth / 2) - this.boardSize.width / 2;
                const posY = this.boardSize.height / 2 - (this.padding + this.cardHeight * j + this.padding * j + this.cardHeight / 2);
                obj.setPosition(posX, posY);
        
                //set card size
                obj.getComponent(UITransform).setContentSize(this.cardWidth, this.cardHeight);

                const cardId = this.gameData.arrayResults[index];
                const card = obj.getComponent(Card);
                card.init(cardId, index, this.listSprFrameCards[cardId], this.doSelectCard.bind(this));
            }
        }

        tween(this.node)
            .delay(0.1)
            .call(() => {
                this.gameData.selectedCards.forEach((index) => {
                    const card = this.getCardByIndex(index);
                    card.flipCard(null, false);
                })
                let listOpened: number[] = [];
                this.gameData.listPairDone.forEach((pair: number[]) => {
                    listOpened = listOpened.concat(pair);
                });
                for (let i = 0; i < this.cardLayer.children.length; i++) {
                    const card = this.cardLayer.children[i].getComponent(Card);
                    if (card && listOpened.indexOf(card.cardIndex) > -1) {
                        card.flipCard(null, false);
                    }
                }
                Tween.stopAllByTarget(this.node);
            })
            .start();
    }

    protected doSelectCard(card: Card) {
        if (this.gameData.selectedCards.length > 2) {
            return;
        }
        if (this.gameData.selectedCards.length < 2 && !card.isFlipped) {
            const flipComplete = () => {
                this.cardOpenComplete(card);
            }
            card.flipCard(flipComplete);
        }
    }

    protected cardOpenComplete(card: Card) {
        this.gameData.selectedCards.push(card.cardIndex);
        const listSelected = this.gameData.selectedCards;
        if (listSelected.length == 2) {
            const card_0 = this.getCardByIndex(listSelected[0]);
            const card_1 = this.getCardByIndex(listSelected[1]);

            this.gameData.turnCount++;
            this.gameData.selectedCards = [];

            this.lbTurn.string = Utils.formatNumber(this.gameData.turnCount);

            if (card_0.cardId == card_1.cardId) {
                SoundManager.gI().playSound(SoundManager.SFX_COMBO_WIN);
                this.gameData.comboCount++;
                this.currentScore = this.gameData.calculateScore();
                this.gameData.listPairDone.push([card_0.cardIndex, card_1.cardIndex]);
                this.checkFinishGame();
            } else {
                this.gameData.comboCount = 0;
                const timeDelay = 0.3;
                tween(card_0.node).delay(timeDelay).call(() => {
                    card_0.flipBack();
                }).start();
                tween(card_1.node).delay(timeDelay).call(() => {
                    card_1.flipBack();
                }).start();
            }
        }

        this.gameData.saveData(false);
    }

    protected checkFinishGame() {
        if (this.gameData.isFinishGame()) {
            this.doGameOver();
        }
    }

    protected doGameOver() {
        SoundManager.gI().playSound(SoundManager.SFX_WIN);
        this.panelGameOver.active = true;
        this.gameData.saveData(true);
    }

    protected resetGame() {
        this.currentScore = 0;
        this.lbTurn.string = '0';
        this.cardLayer.destroyAllChildren();

        this.panelGameOver.active = false;
        this.gameData = new BoardData();
    }

    protected getCardByIndex(index: number): Card {
        for (let i = 0; i < this.cardLayer.children.length; i++) {
            const card = this.cardLayer.children[i].getComponent(Card);
            if (card.cardIndex == index) {
                return card;
            }
        }
    }

    protected calculateSize(maxRange: number, numberItem: number) {
        return (maxRange - this.padding * (numberItem + 1)) / numberItem;
    }
    //#endregion

    //#region Click Handler
    protected onClickBackLobby() {
        SoundManager.gI().playClick();
        this.node.active = false;
        MyPlayer.gI().updateHighScore(this.currentScore);
    }

    //#endregion
}

export class BoardData {
    public totalCard = 0;
    public numColumn = 0;
    public numRow = 0;

    public arrayResults: number[] = [];

    public turnCount: number = 0;
    public comboCount: number = 0;
    public selectedCards: number[] = [];
    public listPairDone: number[][] = [];

    public score: number = 0;

    public calculateScore() {
        const bonusPoint = Config.MATCH_POINT * Config.COMBO_RATE * this.comboCount;
        this.score = this.score + (Config.MATCH_POINT) + bonusPoint;
        return this.score;
    }

    public isFinishGame() {
        return this.listPairDone.length == this.totalCard / 2;
    }

    public saveData(isReset: boolean) {
        if (isReset) {
            LocalStorage.gI().saveDataGame(null);
            return
        }
        if (this.isFinishGame()) {
            return;
        }
        const obj = this.convertToObject();
        LocalStorage.gI().saveDataGame(JSON.stringify(obj));
    }

    public convertToObject() {
        const obj = {
            totalCard: this.totalCard,
            numColumn: this.numColumn,
            numRow: this.numRow,

            arrayResults: this.arrayResults,

            turnCount: this.turnCount,
            comboCount: this.comboCount,
            selectedCards: this.selectedCards,
            listPairDone: this.listPairDone,

            score: this.score,
        }
        return obj;
    }

    public deserializeObject(obj: any) {
        this.totalCard = obj.totalCard;
        this.numColumn = obj.numColumn;
        this.numRow = obj.numRow;

        this.arrayResults = obj.arrayResults;

        this.turnCount = obj.turnCount;
        this.comboCount = obj.comboCount;
        this.selectedCards = obj.selectedCards;
        this.listPairDone = obj.listPairDone;

        this.score = obj.score;
    }
}

