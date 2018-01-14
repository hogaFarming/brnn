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
var BeDealerMinLimit = 50000000;
var AreaLimit = 200000000;
var PersonLimit = 20000000;
var DealerListWindow = (function (_super) {
    __extends(DealerListWindow, _super);
    function DealerListWindow() {
        var _this = _super.call(this) || this;
        _this.width = 594;
        _this.height = 397;
        _this.init();
        return _this;
    }
    DealerListWindow.prototype.init = function () {
        var bg = new egret.Bitmap(utils.getRes("brnn_env.bookiesList"));
        this.addChild(bg);
        var factory = new ButtonFactory();
        this.addTxt(BeDealerMinLimit + "", 62, 358);
        this.addTxt(AreaLimit + "", 250, 358);
        this.addTxt(PersonLimit + "", 452, 358);
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
    };
    DealerListWindow.prototype.onOpen = function () {
        this.render();
        return true;
    };
    DealerListWindow.prototype.onClose = function () {
        return true;
    };
    return DealerListWindow;
}(egret.Sprite));
__reflect(DealerListWindow.prototype, "DealerListWindow", ["ModalLifeCycle"]);
//# sourceMappingURL=DealerListModal.js.map