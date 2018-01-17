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
 * loading页面进度条，包括进度文字
 */
var ProgressBar = (function (_super) {
    __extends(ProgressBar, _super);
    function ProgressBar() {
        var _this = _super.call(this) || this;
        _this.initView();
        return _this;
    }
    ProgressBar.prototype.initView = function () {
        var box = new egret.Bitmap(RES.getRes("loading_icon_box_png"));
        box.y = 38;
        this.addChild(box);
        this.percent = new egret.TextField();
        this.percent.text = "0%";
        this.percent.x = -22;
        this.percent.y = 0;
        this.percent.size = 22;
        this.addChild(this.percent);
        this.indicator = new egret.Bitmap(RES.getRes("loading_middle_png"));
        this.indicator.fillMode = egret.BitmapFillMode.CLIP;
        this.indicator.width = 0;
        this.indicator.y = 38;
        this.addChild(this.indicator);
    };
    ;
    ProgressBar.prototype.setProgress = function (current, total) {
        var val = current / total;
        this.percent.x = val * 704 - 22;
        this.percent.text = Math.floor(val * 100) + "%";
        this.indicator.width = val * 704;
    };
    return ProgressBar;
}(egret.Sprite));
__reflect(ProgressBar.prototype, "ProgressBar");
