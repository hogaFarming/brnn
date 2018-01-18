interface CardPosition {
    x: number;
    y: number;
}

enum CardType {
    小丑,
    黑桃,
    红心,
    梅花,
    方块
}
enum CardSide {
    Front,
    Back
}
enum CardState {
    Initial,
    Flying,
    Hidden,
    Shown,
    LookCard
}

class Card extends egret.Sprite {

    static StartPos = { x: 990, y: 35 }; // 发牌位置
    static DealerPos = { x: 537, y: 113 }; // 庄家位置
    static PlayersPos = [
        { x: 85, y: 319 }, // 闲家1位置
        { x: 365, y: 345 },
        { x: 690, y: 355 },
        { x: 970, y: 320 }
    ];
    static DecisionPos = { x: 587, y: 322 } // 抽大小位置
    static StartRotate = 0; // 初始角度
    static Speed = 200; // 发牌速度
    static RotateRounds = 1; // 旋转周数

    static AnchorOffsetX = 46;
    static AnchorOffsetY = 65;

    static getLookCardFrames(): Array<string> {
        let lookCardFrames = [];
        let count = 20;
        while (count) {
            let strNum = ("00" + count).slice(-2);
            lookCardFrames.unshift("brnn_ani.lookCards_" + strNum);
            count --;
        }
        return lookCardFrames;
    }

    public cardType: CardType;
    public cardNum: number;
    public finalPositon: CardPosition;
    public cardIndex: number;
    public isHidden: boolean;

    private state: CardState;
    private side: CardSide;
    private rotate: number; // 旋转角度
    private currPosition: CardPosition; // 飞行过程位置
    private spFrontSide: egret.Sprite; // 正面图
    private spBackSide: egret.Sprite; // 背面图
    private shapeFrontBlank: egret.Shape; // 正面空图
    private lastFrameTime: number = 0;
    private lookCardFrames: Array<string> = Card.getLookCardFrames();
    private lookCardFrameIdx: number = 0;
    private spLookCard: egret.Sprite;
    private lookCardCallBack: Function;

    constructor(cardType: CardType, cardNum: number) {
        super();
        this.cardType = cardType;
        this.cardNum = cardNum;
    }

    // 发牌
    public dispatch(position: CardPosition, cardIndex: number = 0, isHidden: boolean = false) {
        app.playEffectSound("SoundSendCard_wav");
        this.finalPositon = {
            x: position.x + cardIndex * 35,
            y: position.y
        };
        this.cardIndex = cardIndex;
        this.isHidden = isHidden;

        this.anchorOffsetX = Card.AnchorOffsetX;
        this.anchorOffsetY = Card.AnchorOffsetY;
        this.state = CardState.Flying;
        this.side = CardSide.Back;
        this.rotate = Card.StartRotate;
        this.currPosition = utils.extends({}, Card.StartPos);
        this.spBackSide = this.createBackSide();
        this.spFrontSide = this.createFrontSide();
        requestAnimationFrame(this.onFlyFrame.bind(this));
        this.lastFrameTime = egret.getTimer();
    }

    // 发牌
    public dispatchImmediately(position: CardPosition, cardIndex: number = 0, isHidden: boolean = false) {
        this.finalPositon = {
            x: position.x + cardIndex * 35,
            y: position.y
        };
        this.cardIndex = cardIndex;
        this.isHidden = isHidden;

        this.anchorOffsetX = Card.AnchorOffsetX;
        this.anchorOffsetY = Card.AnchorOffsetY;
        this.state = CardState.Shown;
        this.side = CardSide.Front;
        this.rotate = 0;
        this.currPosition = utils.extends({}, this.finalPositon);
        this.spBackSide = this.createBackSide();
        this.spFrontSide = this.createFrontSide();
        this.render();
    }

    public lookCard(callback?: Function) {
        this.state = CardState.LookCard;
        this.spLookCard = new egret.Sprite();
        this.spLookCard.width = 614;
        this.spLookCard.height = 244;
        this.lookCardCallBack = callback;
        requestAnimationFrame(this.onLookCardFrame.bind(this));
    }

    private onFlyFrame() {
        let now = egret.getTimer();
        let pass = now - this.lastFrameTime;

        // 计算位置
        let deltaX = (this.finalPositon.x - Card.StartPos.x) / Card.Speed * pass;
        let deltaY = (this.finalPositon.y - Card.StartPos.y) / Card.Speed * pass;
        this.currPosition.x += deltaX;
        this.currPosition.y += deltaY;
        
        // 计算旋转角度
        let totalRotation = Card.RotateRounds * 360;
        let rotation = totalRotation / Card.Speed * pass;
        this.rotation += rotation;

        if (this.currPosition.y >= this.finalPositon.y) {
            this.currPosition.x = this.finalPositon.x;
            this.currPosition.y = this.finalPositon.y;
            this.rotation = 0;
            requestAnimationFrame(this.onFlyComplete.bind(this));
        } else {
            requestAnimationFrame(this.onFlyFrame.bind(this));
        }

        this.render();
    }

    private onFlyComplete() {
        this.state = this.isHidden ? CardState.Hidden : CardState.Shown;
        this.render();
    }

    private onLookCardFrame() {
        this.spLookCard.removeChildren();
        let lookCardFrame = this.lookCardFrames[this.lookCardFrameIdx ++];
        if (!lookCardFrame) {
            this.onLookCardComplete();
        } else {
            let bm = new egret.Bitmap(utils.getRes(lookCardFrame));
            bm.x = (this.spLookCard.width - bm.width) / 2;
            bm.y = 0;
            this.spLookCard.addChild(bm);
            this.render();
            requestAnimationFrame(this.onLookCardFrame.bind(this));
        }
    }

    private onLookCardComplete() {
        this.state = CardState.Shown;
        this.render();
        if (this.lookCardCallBack) {
            this.lookCardCallBack();
        }
    }

    private render() {
        this.x = this.currPosition.x + Card.AnchorOffsetX;
        this.y = this.currPosition.y + Card.AnchorOffsetY;
        this.removeChildren();
        let sp;
        if (this.state === CardState.Flying) {
            sp = this.spBackSide;
        } else if (this.state === CardState.Hidden) {
            sp = this.spBackSide;
            this.rotation = 90;
            this.x += 10;
            this.y += 12;
        } else if (this.state === CardState.Shown) {
            sp = this.spFrontSide;
        } else if (this.state === CardState.LookCard) {
            sp = this.spLookCard;
            this.rotation = 0;
            this.x = this.x - 249;
            this.y = this.y - 30;
        }
        this.addChild(sp);
        this.lastFrameTime = egret.getTimer();
    }

    private createBackSide(): egret.Sprite {
        let sp = new egret.Sprite();
        sp.addChild(new egret.Bitmap(utils.getRes("brnn_env.card_back")));
        return sp;
    }

    private createFrontSide(): egret.Sprite {
        let sp = new egret.Sprite();
        sp.graphics.lineStyle(2, 0x999999);
        sp.graphics.beginFill(0xffffff, 1);
        sp.graphics.drawRect(0, 0, 93, 130);
        sp.graphics.endFill();

        let bm = new egret.Bitmap();
        let cardName;
        if (this.cardType === CardType.小丑) {
            cardName = this.cardNum === 0 ? "card4_01" : "card5_01";
        } else {
            cardName = "card" + (this.cardType - 1) + "_" + ("00" + this.cardNum).slice(-2);
        }
        let txtr = utils.getRes("brnn_env." + cardName) || utils.getRes("brnn_cards." + cardName);
        bm.texture = txtr;
        sp.addChild(bm);

        return sp;
    }
}
