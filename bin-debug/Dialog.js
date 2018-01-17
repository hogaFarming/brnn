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
var Dialog = (function (_super) {
    __extends(Dialog, _super);
    function Dialog(message) {
        var _this = _super.call(this) || this;
        _this.message = message;
        _this.init();
        return _this;
    }
    Dialog.prototype.init = function () {
        var blackBG = new egret.Bitmap(utils.getRes("blackBG_png"));
        this.addChild(blackBG);
        var dialogWindow = new egret.Sprite();
        this.addChild(dialogWindow);
        var dialogBG = new egret.Bitmap(utils.getRes("brnn_env.tipBg"));
        dialogWindow.addChild(dialogBG);
        dialogWindow.x = (1280 - dialogBG.width) / 2;
        dialogWindow.y = (720 - dialogBG.height) / 2;
        var confirmBtn = new ButtonFactory().createButton(ButtonModels.ConfirmBtn);
        dialogWindow.addChild(confirmBtn);
        confirmBtn.x = 206;
        confirmBtn.y = 187;
        confirmBtn.addEventListener(ButtonEvent.CLICK, this.handleConfirm, this);
        var txt = new egret.TextField();
        txt.x = 32;
        txt.y = 70;
        txt.width = 420;
        txt.textColor = 0xffffff;
        txt.size = 24;
        txt.text = this.message;
        dialogWindow.addChild(txt);
        app.stage.addChild(this);
    };
    Dialog.prototype.handleConfirm = function () {
        app.stage.removeChild(this);
    };
    return Dialog;
}(egret.Sprite));
__reflect(Dialog.prototype, "Dialog");
