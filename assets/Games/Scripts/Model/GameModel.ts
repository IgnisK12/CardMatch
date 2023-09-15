import { Config } from "../Config/Config";
import { LocalStorage } from "../Manager/LocalStorage";

// ================ Save Level Progress =============================
export class LevelInfo {
    public level: number = 0;
    public condition: number = 0;

    public lastTurnCount: number = 0;
    public isFinished: boolean = false;

    constructor(level: number, condition: number) {
        this.level = level;
        this.condition = condition;
    }

    public saveLevelResult(lastTurnCount: number, finish: boolean) {
        const oldInfo = LocalStorage.gI().getLevelInfo(this.level);
        const obj = this.convertToObject();
        obj.isFinished = finish;
        obj.lastTurnCount = lastTurnCount;
        if (oldInfo) {
            if (lastTurnCount > oldInfo.lastTurnCount) {
                obj.lastTurnCount = oldInfo.lastTurnCount;
            }
            if (oldInfo.isFinished) {
                obj.isFinished = oldInfo.isFinished;
            }
        }
        LocalStorage.gI().saveLevelInfo(this.level, JSON.stringify(obj));
    }

    public deserializeObject(obj: any) {
        this.level = obj.level;
        this.condition = obj.condition;
        this.lastTurnCount = obj.lastTurnCount;
        this.isFinished = obj.isFinished;
    }

    protected convertToObject() {
        const obj = {
            level: this.level,
            condition: this.condition,
            lastTurnCount: this.lastTurnCount,
            isFinished: this.isFinished,
        }
        return obj;
    }
}

// =========== Save Data Info =================
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
    public levelGame: number = 0;

    public conditionGames: any = {};

    protected isWin: boolean = false;

    public calculateScore() {
        const bonusPoint = Config.MATCH_POINT * Config.COMBO_RATE * this.comboCount;
        this.score = this.score + (Config.MATCH_POINT) + bonusPoint;
        return this.score;
    }

    public isFinishGame() {
        if (this.listPairDone.length == this.totalCard / 2) {
            this.isWin = true;
            return true;
        }
        if (this.turnCount >= this.getConditionValue()) {
            return true;
        }
        return false;
    }

    public isGameWin() {
        return this.isWin;
    }

    public getConditionValue() {
        return this.conditionGames['condition'];
    }

    public saveData(isReset: boolean) {
        if (isReset) {
            LocalStorage.gI().saveDataGame(null);
            const levelInfo = new LevelInfo(this.levelGame, this.getConditionValue());
            levelInfo.saveLevelResult(this.turnCount, this.isGameWin());
            return
        }
        if (this.isFinishGame()) {
            return;
        }
        const obj = this.convertToObject();
        LocalStorage.gI().saveDataGame(JSON.stringify(obj));
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
        this.levelGame = obj.levelGame;
        this.conditionGames = obj.conditionGames;
    }

    protected convertToObject() {
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
            levelGame: this.levelGame,
            conditionGames: this.conditionGames
        }
        return obj;
    }
}