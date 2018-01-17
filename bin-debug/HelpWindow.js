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
var Tab = (function (_super) {
    __extends(Tab, _super);
    function Tab(bitmap, activeBitmap, isActive) {
        var _this = _super.call(this) || this;
        _this.bitmap = bitmap;
        _this.activeBitmap = activeBitmap;
        _this.addChild(isActive ? _this.activeBitmap : _this.bitmap);
        _this.touchEnabled = true;
        return _this;
    }
    // private init(): void {
    //     this.addChild(this.bitmap);
    //     this.touchEnabled = true;
    // }
    Tab.prototype.setActive = function (active) {
        this.removeChildAt(0);
        this.addChild(active ? this.activeBitmap : this.bitmap);
    };
    return Tab;
}(egret.Sprite));
__reflect(Tab.prototype, "Tab");
var HelpWindow = (function (_super) {
    __extends(HelpWindow, _super);
    function HelpWindow() {
        var _this = _super.call(this) || this;
        _this.activeIdx = 0;
        _this.init();
        return _this;
    }
    HelpWindow.prototype.init = function () {
        this.width = 752;
        this.height = 502;
        var bg = new egret.Bitmap(utils.getRes("brnn_env.help_bg"));
        this.addChild(bg);
        this.tabs = this.createTabs();
        this.createContents();
    };
    HelpWindow.prototype.createTabs = function () {
        var _this = this;
        var tabs = [
            ["brnn_cards.help_btn1_0", "brnn_cards.help_btn2_0", 152, 44],
            ["brnn_cards.help_btn1_1", "brnn_cards.help_btn2_1", 315, 44],
            ["brnn_cards.help_btn1_2", "brnn_cards.help_btn2_2", 479, 44]
        ].map(function (info, index) {
            var tab = _this.createTab(info[0], info[1]);
            tab.x = info[2];
            tab.y = info[3];
            if (index === _this.activeIdx) {
                tab.setActive(true);
            }
            tab.addEventListener(egret.TouchEvent.TOUCH_TAP, _this.toggleTab.bind(_this, index), _this);
            _this.addChild(tab);
            return tab;
        });
        return tabs;
    };
    HelpWindow.prototype.createContents = function () {
        this.contents = ["brnn_env.help1", "brnn_env.help2", "help3_png"]
            .map(function (resName) { return new egret.Bitmap(utils.getRes(resName)); });
        var scrollView = this.scrollView = new egret.ScrollView();
        scrollView.width = 672;
        scrollView.height = 375;
        scrollView.x = 38;
        scrollView.y = 100;
        scrollView.setContent(this.contents[this.activeIdx]);
        this.addChild(scrollView);
    };
    HelpWindow.prototype.toggleTab = function (index) {
        this.activeIdx = index;
        this.tabs.forEach(function (item, idx) {
            item.setActive(idx === index);
        });
        this.scrollView.scrollTop = 0;
        this.scrollView.setContent(this.contents[index]);
    };
    HelpWindow.prototype.createTab = function (resName, activeResName) {
        var bm = new egret.Bitmap(utils.getRes(resName));
        var bmActive = new egret.Bitmap(utils.getRes(activeResName));
        return new Tab(bm, bmActive);
    };
    HelpWindow.prototype.onOpen = function () {
        return true;
    };
    HelpWindow.prototype.onClose = function () {
        return true;
    };
    return HelpWindow;
}(egret.Sprite));
__reflect(HelpWindow.prototype, "HelpWindow", ["ModalLifeCycle"]);
