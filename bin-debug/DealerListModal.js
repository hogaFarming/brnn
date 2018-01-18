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
var BeDealerMinLimit = 300000;
var AreaLimit = 2000000;
var PersonLimit = 200000;
var DealerListWindow = (function (_super) {
    __extends(DealerListWindow, _super);
    function DealerListWindow() {
        var _this = _super.call(this) || this;
        _this.dealerList = [];
        _this.width = 594;
        _this.height = 397;
        _this.init();
        return _this;
    }
    DealerListWindow.prototype.init = function () {
        var bg = new egret.Bitmap(utils.getRes("brnn_env.bookiesList"));
        this.addChild(bg);
        var factory = new ButtonFactory();
        this.addTxt(BeDealerMinLimit + "", 70, 358);
        this.addTxt(AreaLimit + "", 260, 358);
        this.addTxt(PersonLimit + "", 460, 358);
        this.spDealerList = new egret.Sprite();
        this.addChild(this.spDealerList);
        this.spDealerList.x = 28;
        this.spDealerList.y = 90;
    };
    DealerListWindow.prototype.addTxt = function (text, x, y) {
        var txt1 = new egret.TextField();
        txt1.text = text;
        txt1.x = x;
        txt1.y = y;
        txt1.size = 18;
        txt1.textColor = 0xd8b205;
        this.addChild(txt1);
    };
    DealerListWindow.prototype.render = function () {
        this.spDealerList.removeChildren();
        var text = this.dealerList.map(function (item) {
            return item.apply_name + "（" + item.banker_coin + "）";
        }).join("，");
        var txt = new egret.TextField();
        txt.width = 540;
        txt.height = 200;
        txt.size = 26;
        txt.text = text;
        txt.textColor = 0xffffff;
        this.spDealerList.addChild(txt);
    };
    DealerListWindow.prototype.onOpen = function () {
        var _this = this;
        platform.getDealerList().then(function (result) {
            _this.dealerList = result;
            _this.render();
        });
        return true;
    };
    DealerListWindow.prototype.onClose = function () {
        return true;
    };
    return DealerListWindow;
}(egret.Sprite));
__reflect(DealerListWindow.prototype, "DealerListWindow", ["ModalLifeCycle"]);
//# sourceMappingURL=DealerListModal.js.map