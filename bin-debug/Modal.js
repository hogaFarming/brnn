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
 * 模态窗
 */
var Modal = (function (_super) {
    __extends(Modal, _super);
    function Modal(wind, conf) {
        if (conf === void 0) { conf = {}; }
        var _this = _super.call(this) || this;
        _this.wind = wind;
        _this.config = utils.extends(Modal.ModalDeaultConfig, conf);
        _this.init();
        return _this;
    }
    Modal.prototype.init = function () {
        this.visible = false;
        var blackBG = new egret.Bitmap(utils.getRes("blackBG_png"));
        this.addChild(blackBG);
        blackBG.touchEnabled = true;
        this.wind.x = (1280 - this.wind.width) / 2;
        this.wind.y = (720 - this.wind.height) / 2;
        this.addChild(this.wind);
        this.closeBtn = new ButtonFactory().createButton(ButtonModels.CloseBtn);
        this.closeBtn.x = this.wind.width - this.closeBtn.width - 15;
        this.closeBtn.y = 15;
        this.closeBtn.addEventListener(ButtonEvent.CLICK, this.onCloseClick, this);
        this.wind.addChild(this.closeBtn);
    };
    Modal.prototype.onCloseClick = function () {
        this.close();
    };
    Modal.prototype.close = function () {
        this.wind.onClose();
        this.visible = false;
    };
    Modal.prototype.open = function () {
        this.wind.onOpen();
        this.visible = true;
    };
    Modal.ModalDeaultConfig = {};
    return Modal;
}(egret.Sprite));
__reflect(Modal.prototype, "Modal");
//# sourceMappingURL=Modal.js.map