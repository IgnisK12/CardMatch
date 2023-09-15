import { _decorator, Component, director, error, instantiate, Node, Prefab, resources } from 'cc';
import { PopupAbstract } from '../Game/Popup/PopupAbstract';

const { ccclass, property } = _decorator;

@ccclass('PopupManager')
export class PopupManager extends Component {
    private static instance: PopupManager = null;
    public static gI() { 
        if (this.instance == null) {
            this.instance = new PopupManager();
        }
        director.addPersistRootNode(this.instance.node);
        return this.instance;
    }

    @property(Node)
    protected popupLayer: Node = null;

    protected PREFAB_PATH = 'Prefabs/Popups/';

    protected mapPopupLoaded: Map<string, Prefab> = new Map();
    protected mapPopupInstance: Map<string, PopupAbstract> = new Map();

    protected onLoad() {
        PopupManager.instance = this;
    }

    public showPopupGame(popupName: string, callback: Function, data: any) {
        if (this.mapPopupInstance && this.mapPopupInstance.get(popupName)) {
            const popup = this.mapPopupInstance.get(popupName);
            popup.showPopup(data);
            if (callback) {
                callback();
            }
        } else {
            this.openPopup(popupName, callback, data);
        }
    }
    
    public hidePopupGame(popupName: string) {
        for (let key of this.mapPopupInstance.keys()) {
            if (this.mapPopupInstance.get(key).name === popupName) {
                this.mapPopupInstance.get(key).hidePopup();
            }
        }
    }

    protected async openPopup(popupName: string, callback: Function, data: any) {
        const prefabPopup = await this.loadPopup(popupName);
        if (prefabPopup) {
            let obj = instantiate(prefabPopup);
            obj.parent = this.popupLayer;
            obj.name = popupName;

            let popup: PopupAbstract = obj.getComponent(PopupAbstract);
            popup.showPopup(data);

            this.mapPopupInstance.set(popupName, popup);
            if (callback) {
                callback();
            }
        }
    }

    protected async loadPopup(path: string){
        if (this.mapPopupLoaded.get[path]) {
            return this.mapPopupLoaded.get[path];
        }
        const fullPath = this.PREFAB_PATH + path;
        return await new Promise<any>((resolve, reject)=>{
            resources.load(fullPath, Prefab, (err, prefab) => {
                if (err){
                    error('Cannot load Popup from ' , path);
                    return;
                }
                this.mapPopupLoaded.set(path, prefab);
                resolve(prefab)
            });
        })
    }
}

