import { _decorator, Component, Node, Sprite, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Card')
export class Card extends Component {
    @property(Sprite)
    protected sprCardImage: Sprite = null;

    @property(Node)
    protected cardImageNode: Node = null;

    @property(Node)
    protected cardBackNode: Node = null;

    protected isFlipped: boolean = false;
    protected cardClickCb: Function = null;

    protected _cardId: number = -1;
    public get cardId() {
        return this._cardId;
    }
    public set cardId(val: number) {
        this._cardId = val;
    }

    init(id: number, sprFrame: SpriteFrame, onClickCb: Function) {
        this.cardId = id;
        this.sprCardImage.spriteFrame = sprFrame;
        this.cardClickCb = onClickCb;
        // //scale sprite to fit card size
        // const uiTransform = this.node.getComponent(UITransform);
        // const size = uiTransform.contentSize;
        // this.node.getComponent(UITransform).setContentSize(size.width, size.height);
    }

    public flipCard() {
        this.isFlipped = true;
        this.cardBackNode.active = false;
    }

    public flipBack() {
        this.isFlipped = false;
        this.cardBackNode.active = true;
    }

    public resetCard() {
        this.isFlipped = false;
        this.cardBackNode.active = true;
    }

    protected doFlipCard(flipComplete: Function) {

        if (flipComplete) {
            flipComplete();
        }
    }

    protected onClickCard() {
        if (this.cardClickCb) {
            this.cardClickCb(this);
        }
    }
}

