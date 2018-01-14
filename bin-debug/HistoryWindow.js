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
var mockRecordsData = (function () {
    function randomFlag() {
        return Math.round(Math.random());
    }
    var result = [];
    var count = 20;
    while (count--) {
        var recordItem = [randomFlag(), randomFlag(), randomFlag(), randomFlag()];
        result.push(recordItem);
    }
    return result;
})();
var HistoryWindow = (function (_super) {
    __extends(HistoryWindow, _super);
    function HistoryWindow() {
        var _this = _super.call(this) || this;
        _this.rightFlag = utils.getRes("brnn_cards.RightAndWrong1");
        _this.wrongFlag = utils.getRes("brnn_cards.RightAndWrong2");
        _this.recordsData = mockRecordsData;
        _this.showingIdx = 0;
        _this.width = 754;
        _this.height = 266;
        _this.init();
        return _this;
    }
    HistoryWindow.prototype.init = function () {
        var bg = new egret.Bitmap(utils.getRes("brnn_env.historyBG"));
        this.addChild(bg);
        var factory = new ButtonFactory();
        this.prevDisabledBtn = factory.createButton(ButtonModels.HistoryPrevBtn);
        this.prevDisabledBtn.x = 20;
        this.prevDisabledBtn.y = 95;
        this.addChild(this.prevDisabledBtn);
        this.prevBtn = factory.createButton(ButtonModels.HistoryPrevBtn);
        this.prevBtn.x = 20;
        this.prevBtn.y = 95;
        this.prevBtn.addEventListener(ButtonEvent.CLICK, this.showPrev, this);
        this.addChild(this.prevBtn);
        this.nextDisabledBtn = factory.createButton(ButtonModels.HistoryPrevBtn);
        this.nextDisabledBtn.x = 738;
        this.nextDisabledBtn.y = 204;
        this.nextDisabledBtn.rotation = 180;
        this.addChild(this.nextDisabledBtn);
        this.nextBtn = factory.createButton(ButtonModels.HistoryNextBtn);
        this.nextBtn.x = 738;
        this.nextBtn.y = 204;
        this.nextBtn.rotation = 180;
        this.nextBtn.addEventListener(ButtonEvent.CLICK, this.showNext, this);
        this.addChild(this.nextBtn);
        this.spRecords = new egret.Sprite();
        this.spRecords.x = 100;
        this.spRecords.y = 85;
        this.addChild(this.spRecords);
    };
    HistoryWindow.prototype.showPrev = function () {
        if (this.showingIdx > 0) {
            this.showingIdx -= 1;
            this.render();
        }
    };
    HistoryWindow.prototype.showNext = function () {
        if ((this.showingIdx + HistoryWindow.visibleCols) < this.recordsData.length) {
            this.showingIdx += 1;
            this.render();
        }
    };
    HistoryWindow.prototype.render = function () {
        var _this = this;
        this.spRecords.removeChildren();
        // let startX = 100;
        // let startY = 85;
        var cellWidth = 40;
        var cellHeight = 34;
        var visibleRecords = this.recordsData.slice(this.showingIdx, this.showingIdx + HistoryWindow.visibleCols);
        visibleRecords.forEach(function (recordItem, colIndex) {
            recordItem.forEach(function (resultFlag, rowIndex) {
                var bm = new egret.Bitmap(resultFlag ? _this.rightFlag : _this.wrongFlag);
                bm.x = colIndex * cellWidth;
                bm.y = rowIndex * cellHeight;
                _this.spRecords.addChild(bm);
            });
        });
    };
    HistoryWindow.prototype.onOpen = function () {
        this.render();
        return true;
    };
    HistoryWindow.prototype.onClose = function () {
        return true;
    };
    HistoryWindow.visibleCols = 15;
    return HistoryWindow;
}(egret.Sprite));
__reflect(HistoryWindow.prototype, "HistoryWindow", ["ModalLifeCycle"]);
//# sourceMappingURL=HistoryWindow.js.map