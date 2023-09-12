import { _decorator, Component, Node, sys, SystemEvent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MyPlayer')
export class MyPlayer {
    public static instance:MyPlayer = null;
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
}

