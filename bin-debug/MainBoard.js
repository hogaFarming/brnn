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
/**
 * 游戏主面板
 */
var MainBoard = (function (_super) {
    __extends(MainBoard, _super);
    function MainBoard() {
        var _this = _super.call(this) || this;
        _this.addSprites();
        return _this;
    }
    MainBoard.prototype.addSprites = function () {
        this.addBitmap("brnn_env.DealerInformation", 21, 28);
        this.addBitmap("brnn_env.timeBg", (1280 - 225) / 2, 7);
        this.txtMoney = this.createInfoText("0", 98, 605);
        this.txtScore = this.createInfoText("0", 98, 641);
        this.txtBetting = this.createInfoText("0", 98, 677);
        this.txtDealerMoney = this.createInfoText("0", 120, 75);
        this.txtDealerScore = this.createInfoText("0", 120, 111);
        this.txtDealerRounds = this.createInfoText("0", 120, 147);
        this.btnHistory = this.createButton(ButtonModels.HistoryButton, this.onClickHistory, 263, 610);
        this.btnDealerList = this.createButton(ButtonModels.DealerListButton, this.onClickHistory, 955, 610);
        this.btnBeDealer = this.createButton(ButtonModels.BeDealerButton, this.onClickHistory, 1120, 610);
        this.btnBePlayer = this.createButton(ButtonModels.BePlayerButton, this.onClickHistory, 1120, 610);
        this.btnBePlayer.visible = false;
        this.chips = this.createChips();
    };
    MainBoard.prototype.createButton = function (btnModel, clickHandler, x, y) {
        var btnFactory = new ButtonFactory();
        var btn = btnFactory.createButton(btnModel);
        btn.x = x;
        btn.y = y;
        btn.addEventListener(ButtonEvent.CLICK, clickHandler, this);
        this.addChild(btn);
        return btn;
    };
    MainBoard.prototype.createInfoText = function (text, x, y) {
        var txt = new egret.TextField();
        txt.text = text;
        txt.x = x;
        txt.y = y;
        txt.textColor = 0xffffff;
        txt.size = 20;
        txt.width = 160;
        txt.textAlign = "center";
        this.addChild(txt);
        return txt;
    };
    MainBoard.prototype.createChips = function () {
        var _this = this;
        var result = [];
        var chipValues = [1000, 5000, 10000, 100000, 500000, 1000000];
        var startChipX = 345;
        var chipY = 590;
        var chipMargin = 10;
        var chipWidth = 87;
        chipValues.forEach(function (val, index) {
            var chip = new Chip(val);
            chip.x = startChipX + (chipMargin + chipWidth) * index;
            chip.y = chipY;
            result.push(chip);
            _this.addChild(chip);
            chip.addEventListener(egret.TouchEvent.TOUCH_TAP, function (event) {
                console.log('click chip');
                _this.selectChip(index);
            }, _this);
        });
        return result;
    };
    MainBoard.prototype.selectChip = function (idx) {
        this.chips.forEach(function (chip, index) {
            chip.setActive(idx === index);
        });
    };
    MainBoard.prototype.addBitmap = function (name, x, y) {
        var bitmap = this.createBitmap(name);
        bitmap.x = x;
        bitmap.y = y;
        this.addChild(bitmap);
        return bitmap;
    };
    MainBoard.prototype.createBitmap = function (name) {
        var result = new egret.Bitmap();
        var texture = this.getRes(name);
        result.texture = texture;
        return result;
    };
    MainBoard.prototype.getRes = function (name) {
        var arr = name.split('.');
        if (arr.length === 1) {
            return RES.getRes(name);
        }
        else {
            return RES.getRes(arr[0]).getTexture(arr[1]);
        }
    };
    MainBoard.prototype.onClickHistory = function () {
        console.log("on click.");
    };
    return MainBoard;
}(egret.DisplayObjectContainer));
__reflect(MainBoard.prototype, "MainBoard");
