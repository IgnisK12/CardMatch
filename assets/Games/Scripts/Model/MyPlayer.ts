import { _decorator, Component, game, Node, sys, SystemEvent } from 'cc';
import { LocalStorage } from '../Manager/LocalStorage';
const { ccclass, property } = _decorator;

@ccclass('MyPlayer')
export class MyPlayer {
    public static instance: MyPlayer = null;
    public static gI() { 
        if(this.instance == null) {
            this.instance = new MyPlayer();
        }
        return this.instance;
    }

    private _highScore: number = 0;
    public get highScore() {
        return this._highScore;
    }
    public set highScore(val: number) {
        this._highScore = val;
    }

    public updateHighScore(score: number) {
        if (score > this.highScore) {
            this.highScore = score;
            LocalStorage.gI().saveHighScore(score);

            game.emit('update_high_score');
        }
    }
}

