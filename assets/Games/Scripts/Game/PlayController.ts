import { _decorator, Component, instantiate, Label, Node, Prefab, Size, SpriteFrame, Tween, tween, UITransform } from 'cc';
import { SoundManager } from '../Manager/SoundManager';
import { Config } from '../Config/Config';
import { Utils } from '../Utils/Utils';
import { Card } from '../Component/Card';
import { MyPlayer } from '../Model/MyPlayer';
import { PopupManager } from '../Manager/PopupManager';
import { BoardData } from '../Model/GameModel';

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
    protected lbLevel: Label = null;
    @property(Label)
    protected lbTurn: Label = null;
    @property(Label)
    protected lbCondition: Label = null;

    @property(Node)
    protected blockUI: Node = null;

    @property(Prefab)
    protected cardPrefab: Prefab = null;
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
    protected backLobbyFunc: Function = null;

    // =============== Start New Game =============================
    public startNewGame(levelGame: number = 1) {
        this.resetGame();

        const index = levelGame - 1;
        const totalCard = this.generateRowColumn(index + Config.LEVEL_FIRST_PAIR);
        const shuffleResults = this.shuffleCard(totalCard);

        this.gameData.totalCard = totalCard;
        this.gameData.arrayResults = shuffleResults;

        this.gameData.levelGame = levelGame;
        this.gameData.conditionGames = Config.LEVEL_CONDITIONS[levelGame];
        if (!this.gameData.conditionGames) {
            const listKeys = Object.keys(Config.LEVEL_CONDITIONS);
            this.gameData.conditionGames = Config.LEVEL_CONDITIONS[listKeys[listKeys.length - 1]];
        }

        this.initBoardGame(totalCard);
    }

    // =============== Resume Game =============================
    public resumeGame(obj: any) {
        this.resetGame();
        this.gameData.deserializeObject(obj);

        this.initBoardGame(this.gameData.totalCard);
    }

    public setBackLobbyCallback(callback: Function) {
        this.backLobbyFunc = callback;
    }

    //#region Logic Game
    // protected checkTotalCard(): number {
    //     this.gameData.numColumn = Config.COLUMN;
    //     this.gameData.numRow = Config.ROW;
        
    //     let totalCard = Config.COLUMN * Config.ROW;
    //     if (totalCard % 2 != 0) {
    //         totalCard -= 1;
    //     }

    //     if (totalCard / 2 > this.listSprFrameCards.length) {
    //         totalCard = this.listSprFrameCards.length * 2;
    //         this.gameData.numColumn = Math.floor(Math.sqrt(totalCard)) + 1;
    //         this.gameData.numRow = Math.round(totalCard / this.gameData.numColumn);
    //     }

    //     return totalCard;
    // }

    protected generateRowColumn(numPair: number): number {
        let totalCard = numPair * 2;

        if (totalCard / 2 > this.listSprFrameCards.length) {
            totalCard = this.listSprFrameCards.length * 2;
        }

        const tempRow = Math.floor(Math.sqrt(totalCard));
        for (let i = tempRow; i < tempRow * 2; i++) {
            if (totalCard % i == 0) {
                this.gameData.numRow = i;
                this.gameData.numColumn = totalCard / i;
                break;
            }
        }
        if (this.gameData.numColumn == 0) {
            this.gameData.numRow = 2;
            this.gameData.numColumn = totalCard / 2;
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

        this.lbLevel.string = this.gameData.levelGame.toString();
        this.lbTurn.string = Utils.formatNumber(this.gameData.turnCount);
        this.lbCondition.string = this.gameData.getConditionValue();

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
        this.checkFinishGame();
        this.gameData.saveData(false);
    }

    protected checkFinishGame() {
        if (this.gameData.isFinishGame()) {
            const isWin = this.gameData.isGameWin();
            if (isWin) {
                SoundManager.gI().playSound(SoundManager.SFX_WIN);
            } else {
                SoundManager.gI().playSound(SoundManager.SFX_LOSE);
            }
            this.doGameOver();
        }
    }

    protected doGameOver() {
        PopupManager.gI().showPopupGame('PopupGameOver', null, {
            boardData: this.gameData,
            closeCb: this.doPlayerChoose.bind(this)
        });

        this.cardLayer.children.forEach(child => {
            Tween.stopAllByTarget(child);
        });

        this.gameData.saveData(true);
        this.blockUI.active = true;
    }

    protected resetGame() {
        this.currentScore = 0;
        this.lbTurn.string = '0';
        this.cardLayer.destroyAllChildren();

        this.gameData = new BoardData();
        this.blockUI.active = false;
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
    // -1: Back Lobby, 0: Retry, 1: Next Level
    protected doPlayerChoose(valueChoose: number) {
        MyPlayer.gI().updateHighScore(this.currentScore);
        if (valueChoose == -1) {
            this.node.active = false;
        } else if (valueChoose == 0) {
            this.startNewGame(this.gameData.levelGame);
        } else if (valueChoose == 1) {
            this.startNewGame(this.gameData.levelGame + 1);
        }
    }

    protected onClickBack() {
        SoundManager.gI().playClick();
        
        this.node.active = false;
        if (this.backLobbyFunc) {
            this.backLobbyFunc();
        }
    }

    //#endregion
}

