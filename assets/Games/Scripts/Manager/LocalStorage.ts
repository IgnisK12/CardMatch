import { _decorator, Component, Node } from 'cc';

export class LocalStorage {
    public static instance: LocalStorage = null;
    public static gI() { 
        if(this.instance == null) {
            this.instance = new LocalStorage();
        }
        return this.instance;
    }

    public saveHighScore(val: number) {
        localStorage.setItem('high_score', val.toString());
    }
    public getHighScore() {
        const val = localStorage.getItem('high_score');
        return val?.length > 0 ? parseFloat(val) : 0;
    }

    public saveDataGame(data: string) {
        localStorage.setItem('data_game', data);
    }
    public getDataGame() {
        const val = localStorage.getItem('data_game');
        if (val) {
            return JSON.parse(val);
        }
        return null;
    }

    public saveLevelInfo(level: number, data: string) {
        const key = 'level_info_' + level;
        localStorage.setItem(key, data);
    }
    public getLevelInfo(level: number) {
        const key = 'level_info_' + level;
        const val = localStorage.getItem(key);
        if (val) {
            return JSON.parse(val);
        }
        return null;
    }
}

