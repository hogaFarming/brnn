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
var LeftControl = (function (_super) {
    __extends(LeftControl, _super);
    function LeftControl() {
        var _this = _super.call(this) || this;
        _this.initView();
        return _this;
    }
    LeftControl.prototype.initView = function () {
        this.addToggle();
        this.addPanel();
    };
    LeftControl.prototype.addToggle = function () {
        var toggle = this.toggle = new egret.Sprite();
        var bitmap = new egret.Bitmap(this.getRes("brnn_cards.ctrlStatus"));
        toggle.addChild(bitmap);
        toggle.x = 0;
        toggle.y = 326;
        toggle.touchEnabled = true;
        toggle.addEventListener(egret.TouchEvent.TOUCH_TAP, this.togglePanel, this);
        this.addChild(toggle);
    };
    LeftControl.prototype.addPanel = function () {
        var panel = this.panel = new egret.Sprite();
        var bitmap = new egret.Bitmap(this.getRes("brnn_env.ctrlerBtns0"));
        panel.addChild(bitmap);
        panel.x = 0;
        panel.y = 210;
        this.addChild(panel);
        this.addPanelBtn(ButtonModels.BackButton, this.onClickBackBtn, 12, 18);
        this.addPanelBtn(ButtonModels.SoundButtonA, this.onClickBackBtn, 73, 118);
        this.addPanelBtn(ButtonModels.SoundButtonB, this.onClickBackBtn, 73, 118);
        this.addPanelBtn(ButtonModels.HelpButton, this.onClickBackBtn, 12, 212);
    };
    LeftControl.prototype.addPanelBtn = function (btnModel, clickHandler, x, y) {
        var factory = new ButtonFactory();
        var btn = factory.createButton(btnModel);
        btn.x = x;
        btn.y = y;
        btn.addEventListener(ButtonEvent.CLICK, clickHandler, this);
        this.panel.addChild(btn);
    };
    LeftControl.prototype.onClickBackBtn = function () {
        console.log("click panel btn");
        app.modalManager.openHelpModal();
    };
    LeftControl.prototype.togglePanel = function () {
        this.panel.visible = !this.panel.visible;
    };
    LeftControl.prototype.getRes = function (name) {
        var arr = name.split('.');
        if (arr.length === 1) {
            return RES.getRes(name);
        }
        else {
            return RES.getRes(arr[0]).getTexture(arr[1]);
        }
    };
    return LeftControl;
}(egret.Sprite));
__reflect(LeftControl.prototype, "LeftControl");
//# sourceMappingURL=LeftControl.js.map