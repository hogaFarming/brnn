var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var CardType;
(function (CardType) {
    CardType[CardType["\u5C0F\u4E11"] = 0] = "\u5C0F\u4E11";
    CardType[CardType["\u9ED1\u6843"] = 1] = "\u9ED1\u6843";
    CardType[CardType["\u7EA2\u5FC3"] = 2] = "\u7EA2\u5FC3";
    CardType[CardType["\u6885\u82B1"] = 3] = "\u6885\u82B1";
    CardType[CardType["\u65B9\u5757"] = 4] = "\u65B9\u5757";
})(CardType || (CardType = {}));
var CardSide;
(function (CardSide) {
    CardSide[CardSide["Front"] = 0] = "Front";
    CardSide[CardSide["Back"] = 1] = "Back";
})(CardSide || (CardSide = {}));
var CardState;
(function (CardState) {
    CardState[CardState["Initial"] = 0] = "Initial";
    CardState[CardState["Flying"] = 1] = "Flying";
    CardState[CardState["Hidden"] = 2] = "Hidden";
    CardState[CardState["Shown"] = 3] = "Shown";
    CardState[CardState["LookCard"] = 4] = "LookCard";
})(CardState || (CardState = {}));
var Card = (function (_super) {
    __extends(Card, _super);
    function Card(cardType, cardNum) {
        var _this = _super.call(this) || this;
        _this.lastFrameTime = 0;
        _this.lookCardFrames = Card.getLookCardFrames();
        _this.lookCardFrameIdx = 0;
        _this.cardType = cardType;
        _this.cardNum = cardNum;
        return _this;
    }
    Card.getLookCardFrames = function () {
        var lookCardFrames = [];
        var count = 20;
        while (count) {
            var strNum = ("00" + count).slice(-2);
            lookCardFrames.unshift("brnn_ani.lookCards_" + strNum);
            count--;
        }
        return lookCardFrames;
    };
    // 发牌
    Card.prototype.dispatch = function (position, cardIndex, isHidden) {
        if (cardIndex === void 0) { cardIndex = 0; }
        if (isHidden === void 0) { isHidden = false; }
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
    };
    // 发牌
    Card.prototype.dispatchImmediately = function (position, cardIndex, isHidden) {
        if (cardIndex === void 0) { cardIndex = 0; }
        if (isHidden === void 0) { isHidden = false; }
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
    };
    Card.prototype.lookCard = function (callback) {
        this.state = CardState.LookCard;
        this.spLookCard = new egret.Sprite();
        this.spLookCard.width = 614;
        this.spLookCard.height = 244;
        this.lookCardCallBack = callback;
        requestAnimationFrame(this.onLookCardFrame.bind(this));
    };
    Card.prototype.onFlyFrame = function () {
        var now = egret.getTimer();
        var pass = now - this.lastFrameTime;
        // 计算位置
        var deltaX = (this.finalPositon.x - Card.StartPos.x) / Card.Speed * pass;
        var deltaY = (this.finalPositon.y - Card.StartPos.y) / Card.Speed * pass;
        this.currPosition.x += deltaX;
        this.currPosition.y += deltaY;
        // 计算旋转角度
        var totalRotation = Card.RotateRounds * 360;
        var rotation = totalRotation / Card.Speed * pass;
        this.rotation += rotation;
        if (this.currPosition.y >= this.finalPositon.y) {
            this.currPosition.x = this.finalPositon.x;
            this.currPosition.y = this.finalPositon.y;
            this.rotation = 0;
            requestAnimationFrame(this.onFlyComplete.bind(this));
        }
        else {
            requestAnimationFrame(this.onFlyFrame.bind(this));
        }
        this.render();
    };
    Card.prototype.onFlyComplete = function () {
        this.state = this.isHidden ? CardState.Hidden : CardState.Shown;
        this.render();
    };
    Card.prototype.onLookCardFrame = function () {
        this.spLookCard.removeChildren();
        var lookCardFrame = this.lookCardFrames[this.lookCardFrameIdx++];
        if (!lookCardFrame) {
            this.onLookCardComplete();
        }
        else {
            var bm = new egret.Bitmap(utils.getRes(lookCardFrame));
            bm.x = (this.spLookCard.width - bm.width) / 2;
            bm.y = 0;
            this.spLookCard.addChild(bm);
            this.render();
            requestAnimationFrame(this.onLookCardFrame.bind(this));
        }
    };
    Card.prototype.onLookCardComplete = function () {
        this.state = CardState.Shown;
        this.render();
        if (this.lookCardCallBack) {
            this.lookCardCallBack();
        }
    };
    Card.prototype.render = function () {
        this.x = this.currPosition.x + Card.AnchorOffsetX;
        this.y = this.currPosition.y + Card.AnchorOffsetY;
        this.removeChildren();
        var sp;
        if (this.state === CardState.Flying) {
            sp = this.spBackSide;
        }
        else if (this.state === CardState.Hidden) {
            sp = this.spBackSide;
            this.rotation = 90;
            this.x += 10;
            this.y += 12;
        }
        else if (this.state === CardState.Shown) {
            sp = this.spFrontSide;
        }
        else if (this.state === CardState.LookCard) {
            sp = this.spLookCard;
            this.rotation = 0;
            this.x = this.x - 249;
            this.y = this.y - 30;
        }
        this.addChild(sp);
        this.lastFrameTime = egret.getTimer();
    };
    Card.prototype.createBackSide = function () {
        var sp = new egret.Sprite();
        sp.addChild(new egret.Bitmap(utils.getRes("brnn_env.card_back")));
        return sp;
    };
    Card.prototype.createFrontSide = function () {
        var sp = new egret.Sprite();
        sp.graphics.lineStyle(2, 0x999999);
        sp.graphics.beginFill(0xffffff, 1);
        sp.graphics.drawRect(0, 0, 93, 130);
        sp.graphics.endFill();
        var bm = new egret.Bitmap();
        var cardName;
        if (this.cardType === CardType.小丑) {
            cardName = this.cardNum === 0 ? "card4_01" : "card5_01";
        }
        else {
            cardName = "card" + (this.cardType - 1) + "_" + ("00" + this.cardNum).slice(-2);
        }
        var txtr = utils.getRes("brnn_env." + cardName) || utils.getRes("brnn_cards." + cardName);
        bm.texture = txtr;
        sp.addChild(bm);
        return sp;
    };
    Card.StartPos = { x: 990, y: 35 }; // 发牌位置
    Card.DealerPos = { x: 537, y: 113 }; // 庄家位置
    Card.PlayersPos = [
        { x: 85, y: 319 },
        { x: 365, y: 345 },
        { x: 690, y: 355 },
        { x: 970, y: 320 }
    ];
    Card.DecisionPos = { x: 587, y: 322 }; // 抽大小位置
    Card.StartRotate = 0; // 初始角度
    Card.Speed = 200; // 发牌速度
    Card.RotateRounds = 1; // 旋转周数
    Card.AnchorOffsetX = 46;
    Card.AnchorOffsetY = 65;
    return Card;
}(egret.Sprite));
__reflect(Card.prototype, "Card");
//# sourceMappingURL=Card.js.map