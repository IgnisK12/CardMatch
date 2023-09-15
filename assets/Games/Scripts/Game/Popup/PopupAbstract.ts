import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
import { SoundManager } from '../../Manager/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('PopupAbstract')
export class PopupAbstract extends Component {
    @property(Node)
    protected panelNode: Node = null;
    @property(Vec3)
    protected panelScale: Vec3 = null;

    protected isClosing: boolean = false;

    public isDestroy: boolean = true;

    public showPopup(data: any) {
        this.beforeShow(data);
        this.isClosing = false;
        
        this.doAnimOpen(() => {
            this.showDone(data);
        });
    }

    public hidePopup() {
        if (this.isClosing) {
            return;
        }
        this.beforeHide();

        this.isClosing = true;
        const callback = () => {
            this.isClosing = false;
            this.node.active = false;

            this.afterHide();
        }
        this.doAnimClose(callback);
    }

    // public close(){
    //     if (this.isClosing) {
    //         return;
    //     }
    //     this.isClosing = true;

    //     const callback = () => {
    //         this.isClosing = false;
    //         if (this.onBeforeClose) {
    //             this.onBeforeClose(this);
    //         }
            
    //         this.node.removeFromParent();
    //         this.node.destroy();
    //     }
    //     this.doAnimClose(callback);
    // }

    public clickHide(){
        SoundManager.gI().playClick();
        if (this.isClosing) {
            return;
        }
        this.hidePopup();
    }
    
    protected doAnimClose(callback: Function = null) {
        if (!this.isClosing) {
            return;
        }

        if (this.panelNode) {
            const obj = {
                scale: Vec3.ONE,
                opacity: 255,
            }
            const onUpdate = (updateObj, percent: number) => {
                this.panelNode.scale = updateObj.scale;
                if (this.panelNode.getComponent(UIOpacity)){
                    this.panelNode.getComponent(UIOpacity).opacity = updateObj.opacity;
                }
            }

            tween(obj)
                .to(0.3, { scale : Vec3.ZERO, opacity: 0 }, { easing: 'backIn', onUpdate})
                .call(() => {
                    if (callback) {
                        callback();
                    }
                })
                .start();
        } else {
            if (callback) {
                callback();
            }
        }
    }

    protected doAnimOpen(callback: Function = null) {
        this.node.active = true;

        if (this.panelNode) {
            this.panelNode.scale = Vec3.ZERO;
            if (this.panelNode.getComponent(UIOpacity)) {
                this.panelNode.getComponent(UIOpacity).opacity = 0;
            }

            const obj = {
                scale: this.panelNode.scale,
                opacity: 0,
            }
            const onUpdate = (updateObj, percent: number) => {
                this.panelNode.scale = updateObj.scale;
                if (this.panelNode.getComponent(UIOpacity)){
                    this.panelNode.getComponent(UIOpacity).opacity = updateObj.opacity;
                }
            }

            const value = this.panelScale ? this.panelScale : Vec3.ONE;
            tween(obj)
                .to(0.3, { scale : value, opacity: 255 }, { easing: 'backOut', onUpdate})
                .call(() => {
                    if (callback) {
                        callback();
                    }
                })
                .start();
        }
    }

    // =================== Abstract =======================

    protected beforeShow(data: any) {
    }
    protected showDone(data: any) {
    }

    protected beforeHide() {
    }
    protected afterHide() {
    }
}

