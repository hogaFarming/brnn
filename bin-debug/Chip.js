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
var ChipValMap = {
    1000: ["brnn_env.chip_0", 0xdbbc3f],
    5000: ["brnn_env.chip_1", 0x589b44],
    10000: ["brnn_env.chip_2", 0x20a8a3],
    100000: ["brnn_env.chip_3", 0x2067a9],
    500000: ["brnn_env.chip_4", 0x7b2fad],
    1000000: ["brnn_env.chip_5", 0xc92121]
};
var Chip = (function (_super) {
    __extends(Chip, _super);
    function Chip(value) {
        var _this = _super.call(this) || this;
        _this.disabled = false;
        _this.active = false;
        _this.value = value;
        // this.touchEnabled = true;
        _this.bitmaps = _this.createBitmaps();
        _this.txt = _this.createText();
        _this.render();
        return _this;
    }
    Chip.prototype.createBitmaps = function () {
        var txtr = utils.getRes(ChipValMap[this.value][0]);
        var sheet = new egret.SpriteSheet(txtr);
        var bmNormal = new egret.Bitmap(sheet.createTexture("normal", 10, 13, 100, 100));
        var bmActive = new egret.Bitmap(sheet.createTexture("active", 10, 135, 110, 110));
        bmNormal.fillMode = egret.BitmapFillMode.CLIP;
        bmActive.fillMode = egret.BitmapFillMode.CLIP;
        return [bmNormal, bmActive];
    };
    Chip.prototype.createText = function () {
        var txt = new egret.TextField();
        txt.textColor = ChipValMap[this.value][1];
        txt.size = 22;
        txt.textAlign = "center";
        txt.verticalAlign = "middle";
        txt.width = 100;
        txt.height = 100;
        txt.text = this.formatValue(this.value);
        return txt;
    };
    Chip.prototype.setActive = function (active) {
        this.active = active;
        this.render();
    };
    Chip.prototype.setDisabled = function (disabled) {
        this.disabled = disabled;
        this.render();
    };
    Chip.prototype.render = function () {
        this.removeChildren();
        var bmIndex = this.active ? 1 : this.disabled ? 2 : 0;
        this.txt.height = this.active ? 110 : 100;
        this.addChild(this.bitmaps[bmIndex]);
        this.addChild(this.txt);
    };
    Chip.prototype.formatValue = function (value) {
        if (value < 10000) {
            return value + "";
        }
        else if (value < 1000000) {
            return value / 10000 + "万";
        }
        else {
            return value / 1000000 + "百万";
        }
    };
    return Chip;
}(egret.Sprite));
__reflect(Chip.prototype, "Chip");
//# sourceMappingURL=Chip.js.map