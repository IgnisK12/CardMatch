import { _decorator, Component, Node, Sprite, SpriteFrame, Tween, tween, UITransform, Vec3 } from 'cc';
import { SoundManager } from '../Manager/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('Card')
export class Card extends Component {
    @property(Sprite)
    protected sprCardImage: Sprite = null;

    @property(Node)
    protected cardImageNode: Node = null;

    @property(Node)
    protected cardBackNode: Node = null;

    protected cardClickCb: Function = null;

    public isFlipped: boolean = false;

    protected _cardId: number = -1;
    public get cardId() {
        return this._cardId;
    }
    public set cardId(val: number) {
        this._cardId = val;
    }

    protected _cardIndex: number = -1;
    public get cardIndex() {
        return this._cardIndex;
    }
    public set cardIndex(val: number) {
        this._cardIndex = val;
    }

    init(id: number, index: number, sprFrame: SpriteFrame, onClickCb: Function) {
        this.cardId = id;
        this.cardIndex = index;
        this.sprCardImage.spriteFrame = sprFrame;
        this.cardClickCb = onClickCb;
    }

    public flipCard(flipCb: Function, isAnim: boolean = true) {
        this.isFlipped = true;
        if (isAnim) {
            this.doFlipCard(false, flipCb);
        } else {
            this.cardBackNode.scale = Vec3.ZERO;
            this.cardImageNode.scale = Vec3.ONE;
        }
    }
    

    public flipBack() {
        this.doFlipCard(true, () => {
            this.isFlipped = false;
        });
    }

    public resetCard() {
        this.isFlipped = false;
        this.cardBackNode.scale = Vec3.ONE;
    }

    protected doFlipCard(isBack: boolean, flipComplete: Function) {
        const targetShow = isBack ? this.cardBackNode : this.cardImageNode;
        const targetHide = isBack ? this.cardImageNode : this.cardBackNode;

        targetShow.scale = Vec3.ZERO;
        targetHide.scale = Vec3.ONE;
        Tween.stopAllByTarget(targetShow);
        Tween.stopAllByTarget(targetHide);

        const time = 0.2;
        tween(targetShow).delay(time / 2)
            .to(time, { scale: Vec3.ONE }, {easing: 'backOut'})
            .call(() => {
                if (flipComplete) {
                    flipComplete();
                }
            })
            .start();
        tween(targetHide).to(time, { scale: Vec3.ZERO }, {easing: 'backOut'}).start();
    }

    protected onClickCard() {
        SoundManager.gI().playClick();
        if (this.isFlipped) {
            return;
        }

        if (this.cardClickCb) {
            this.cardClickCb(this);
        }
    }
}

