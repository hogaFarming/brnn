/**
 * loading页面进度条，包括进度文字
 */
class ProgressBar extends egret.Sprite {
    constructor() {
        super();
        this.initView();
    }

    private indicator: egret.Bitmap;
    private percent: egret.TextField;

    private initView() {
        let box = new egret.Bitmap(RES.getRes("loading_icon_box_png"));
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

    public setProgress(current: number, total: number): void {
        let val = current / total;
        this.percent.x = val * 704 - 22;
        this.percent.text = Math.floor(val * 100) + "%";
        this.indicator.width = val * 704;
    }
}
