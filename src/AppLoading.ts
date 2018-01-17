let appLoadingInstance = null;

class AppLoading extends egret.Sprite {

    private bmLoadingTexts: Array<egret.Bitmap>;
    private currIdx: number = -1;

    constructor() {
        super();
        if (appLoadingInstance) return appLoadingInstance;
        appLoadingInstance = this;
        this.init();
    }

    private init() {
        let blackBG = new egret.Bitmap(utils.getRes("blackBG_png"));
        this.addChild(blackBG);

        let loadingBG = new egret.Bitmap(utils.getRes("brnn_env.loadingBG"));
        loadingBG.x = 5;
        loadingBG.y = 325;
        this.addChild(loadingBG);

        this.bmLoadingTexts = [
            "brnn_env.text_Efforts1", "brnn_env.text_Efforts2",
            "brnn_env.text_Efforts3", "brnn_env.text_Efforts4"
        ].map(resName => {
            let bm = new egret.Bitmap(utils.getRes(resName));
            bm.y = 325;
            return bm;
        });
        
        this.nextText();
        new Timer(this.nextText.bind(this), () => {}, 450);
    }

    private nextText() {
        this.currIdx += 1;
        if (this.currIdx > this.bmLoadingTexts.length - 1) {
            this.currIdx = 0;
        }
        if (this.numChildren === 3) this.removeChildAt(2);
        this.addChild(this.bmLoadingTexts[this.currIdx]);
    }
}
