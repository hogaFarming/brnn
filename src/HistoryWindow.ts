type RecordItem = Array<number>;

const mockRecordsData: Array<RecordItem> = (function() {
    function randomFlag() {
        return Math.round(Math.random());
    }
    let result = [];
    let count = 20;
    while (count--) {
        let recordItem: RecordItem = [randomFlag(), randomFlag(), randomFlag(), randomFlag()];
        result.push(recordItem);
    }
    return result;
})();

class HistoryWindow extends egret.Sprite implements ModalLifeCycle {

    static visibleCols = 15;

    private prevBtn: Button;
    private prevDisabledBtn: Button;
    private nextBtn: Button;
    private nextDisabledBtn: Button;
    private rightFlag = utils.getRes("brnn_cards.RightAndWrong3");
    private wrongFlag = utils.getRes("brnn_cards.RightAndWrong2");

    private spRecords: egret.Sprite;
    private recordsData: Array<RecordItem> = [];
    private showingIdx: number = 0;

    constructor() {
        super();
        this.width = 754;
        this.height = 266;
        this.init();
    }

    private init(): void {
        let bg = new egret.Bitmap(utils.getRes("brnn_env.historyBG"));
        this.addChild(bg);
        let factory = new ButtonFactory();

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
        this.spRecords.y = 85
        this.addChild(this.spRecords);
    }

    private showPrev(): void {
        if (this.showingIdx > 0) {
            this.showingIdx -= 1;
            this.render();
        }
    }

    private showNext(): void {
        if ((this.showingIdx + HistoryWindow.visibleCols) < this.recordsData.length) {
            this.showingIdx += 1;
            this.render();
        }
    }

    private render(): void {
        this.spRecords.removeChildren();
        // let startX = 100;
        // let startY = 85;
        let cellWidth = 40;
        let cellHeight = 34;
        let visibleRecords = this.recordsData.slice(this.showingIdx, this.showingIdx + HistoryWindow.visibleCols);
        visibleRecords.forEach((recordItem, colIndex) => {
            recordItem.forEach((resultFlag, rowIndex) => {
                let bm = new egret.Bitmap(resultFlag === 1 ? this.rightFlag : this.wrongFlag);
                bm.x = colIndex * cellWidth;
                bm.y = rowIndex * cellHeight;
                this.spRecords.addChild(bm);
            });
        });
    }

    public onOpen(): boolean {
        if (app.game.gameId) {
            platform.getHistory(app.game.gameId).then(result => {
                this.recordsData = result;
                this.render();
            });
        }
        return true;
    }
    public onClose(): boolean {
        return true;
    }
}