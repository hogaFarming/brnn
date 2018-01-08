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
var ModalManager = (function (_super) {
    __extends(ModalManager, _super);
    function ModalManager() {
        var _this = _super.call(this) || this;
        _this.createModals();
        return _this;
    }
    ModalManager.prototype.createModals = function () {
        this.helpModal = new Modal(new HelpWindow());
        this.addChild(this.helpModal);
    };
    ModalManager.prototype.openHelpModal = function () {
        console.log("open help modal");
        this.helpModal.open();
    };
    return ModalManager;
}(egret.Sprite));
__reflect(ModalManager.prototype, "ModalManager");
//# sourceMappingURL=ModalManager.js.map