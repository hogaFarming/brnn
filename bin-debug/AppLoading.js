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
var appLoadingInstance = null;
var AppLoading = (function (_super) {
    __extends(AppLoading, _super);
    function AppLoading() {
        var _this = _super.call(this) || this;
        _this.currIdx = -1;
        if (appLoadingInstance)
            return appLoadingInstance;
        appLoadingInstance = _this;
        _this.init();
        return _this;
    }
    AppLoading.prototype.init = function () {
        var blackBG = new egret.Bitmap(utils.getRes("blackBG_png"));
        this.addChild(blackBG);
        var loadingBG = new egret.Bitmap(utils.getRes("brnn_env.loadingBG"));
        loadingBG.x = 5;
        loadingBG.y = 325;
        this.addChild(loadingBG);
        this.bmLoadingTexts = [
            "brnn_env.text_Efforts1", "brnn_env.text_Efforts2",
            "brnn_env.text_Efforts3", "brnn_env.text_Efforts4"
        ].map(function (resName) {
            var bm = new egret.Bitmap(utils.getRes(resName));
            bm.y = 325;
            return bm;
        });
        this.nextText();
        new Timer(this.nextText.bind(this), function () { }, 450);
    };
    AppLoading.prototype.nextText = function () {
        this.currIdx += 1;
        if (this.currIdx > this.bmLoadingTexts.length - 1) {
            this.currIdx = 0;
        }
        if (this.numChildren === 3)
            this.removeChildAt(2);
        this.addChild(this.bmLoadingTexts[this.currIdx]);
    };
    return AppLoading;
}(egret.Sprite));
__reflect(AppLoading.prototype, "AppLoading");
