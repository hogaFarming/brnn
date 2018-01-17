/**
 * loading页面
 */
class LoadingUI extends egret.Sprite implements RES.PromiseTaskReporter {

    public constructor() {
        super();
        this.createView();
    }

    private progressBar: ProgressBar;
    private gameTips: egret.TextField;
    private tipsArr: Array<string> = [];
    private tipIdx: number;
    private timer: egret.Timer;

    private createView(): void {
        // 画背景图
        let bg: egret.Bitmap = new egret.Bitmap(RES.getRes("loading_bg_png"));
        this.addChild(bg);
        bg.width = 1280;
        bg.height = 720;
        
        // 进度条
        this.progressBar = new ProgressBar();
        this.addChild(this.progressBar);
        this.progressBar.x = (1280 - 704) / 2;
        this.progressBar.y = 535;

        this.initTips();
    }

    /**
     * 初始化小贴士
     */
    private initTips(): void {   
        this.tipsArr.push("我已使出洪荒之力了，首次加载比较慢，耐心等待 ~");
        this.tipsArr.push("惊不惊喜，意不意外，第二次加载无需消耗流量！");
        this.tipsArr.push("合理安排时间，享受游戏人生。");
        this.tipsArr.push("兄弟，别怪我没提醒你：只能在下注时间下注，其余时间无法下注！");
        this.tipsArr.push("如果你要上庄，先别着急，注意上庄条件的限制。");
        this.tipsArr.push("速来游戏，玩家最多可赢取牛牛10倍奖金。");
        this.tipsArr.push("高能提醒：玩家每个区域的下注金额都有限制");
        this.tipsArr.push("游戏开始后，除庄家外，所有玩家都可下注。");

        this.tipIdx = -1;

        this.gameTips = new egret.TextField();
        this.gameTips.size = 18;
        this.gameTips.width = 1280;
        this.gameTips.y = 625;
        this.gameTips.x = 0;
        this.gameTips.textAlign = "center";
        this.addChild(this.gameTips);

        this.nextTip();
        new Timer(this.nextTip.bind(this), () => {}, 3000);
    }

    private nextTip(): void {
        this.tipIdx += 1;
        if (this.tipIdx > this.tipsArr.length - 1) {
            this.tipIdx = 0;
        }
        this.gameTips.text = this.tipsArr[this.tipIdx];
    }

    /**
     * 响应资源加载
     */
    public onProgress(current: number, total: number): void {
        this.progressBar.setProgress(current, total);
    }
}
