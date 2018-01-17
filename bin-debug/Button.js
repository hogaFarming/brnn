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
var ButtonEvent = (function (_super) {
    __extends(ButtonEvent, _super);
    function ButtonEvent(type, bubbles, cancelable) {
        if (bubbles === void 0) { bubbles = false; }
        if (cancelable === void 0) { cancelable = false; }
        return _super.call(this, type, bubbles, cancelable) || this;
    }
    ButtonEvent.CLICK = "click";
    return ButtonEvent;
}(egret.Event));
__reflect(ButtonEvent.prototype, "ButtonEvent");
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(sheet) {
        var _this = _super.call(this) || this;
        _this.sheet = sheet;
        _this.init();
        return _this;
    }
    Button.prototype.init = function () {
        this.state = Button.STATE.NORMAL;
        this.bitmap = new egret.Bitmap(this.sheet.getTexture("normal"));
        this.addChild(this.bitmap);
        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
    };
    Button.prototype.onTouchTap = function (event) {
        app.playEffectSound("ClickSound_wav");
        var clickEvt = new ButtonEvent(ButtonEvent.CLICK);
        this.dispatchEvent(clickEvt);
    };
    Button.STATE = {
        NORMAL: "normal",
        PRESSED: "pressed",
        HOVER: "hover"
    };
    return Button;
}(egret.Sprite));
__reflect(Button.prototype, "Button");
