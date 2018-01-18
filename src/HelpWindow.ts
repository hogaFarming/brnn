class Tab extends egret.Sprite {

    private bitmap: egret.Bitmap;
    private activeBitmap: egret.Bitmap;

    constructor(bitmap: egret.Bitmap, activeBitmap: egret.Bitmap, isActive?: boolean) {
        super();
        this.bitmap = bitmap;
        this.activeBitmap = activeBitmap;
        this.addChild(isActive ? this.activeBitmap : this.bitmap);
        this.touchEnabled = true;
    }

    // private init(): void {
    //     this.addChild(this.bitmap);
    //     this.touchEnabled = true;
    // }

    public setActive(active: boolean) {
        this.removeChildAt(0);
        this.addChild(active ? this.activeBitmap : this.bitmap);
    }
}

class HelpWindow extends egret.Sprite implements ModalLifeCycle {

    private activeIdx: number = 0;
    private tabs: Array<Tab>;
    private scrollView: egret.ScrollView;
    private contents: Array<egret.Bitmap>;

    constructor() {
        super();
        this.init();
    }

    private init(): void {
        this.width = 752;
        this.height = 502;
        let bg = new egret.Bitmap(utils.getRes("brnn_env.help_bg"));
        this.addChild(bg);
        this.tabs = this.createTabs();
        this.createContents();
    }

    private createTabs(): Array<Tab> {
        let tabs = [
            ["brnn_cards.help_btn1_0", "brnn_cards.help_btn2_0", 152, 44],
            ["brnn_cards.help_btn1_1", "brnn_cards.help_btn2_1", 315, 44],
            ["brnn_cards.help_btn1_2", "brnn_cards.help_btn2_2", 479, 44]
        ].map((info, index) => {
            let tab = this.createTab(<string>info[0], <string>info[1]);
            tab.x = <number>info[2];
            tab.y = <number>info[3];
            if (index === this.activeIdx) {
                tab.setActive(true);
            }
            tab.addEventListener(egret.TouchEvent.TOUCH_TAP, this.toggleTab.bind(this, index), this);
            this.addChild(tab);
            return tab;
        });
        return tabs;
    }

    private createContents() {
        this.contents = ["brnn_env.help1", "brnn_env.help2", "help3_png"]
            .map(resName => {
                let bm = new egret.Bitmap(utils.getRes(resName));
                if (resName === "brnn_env.help1") {
                    bm.height = 180;
                    bm.fillMode = egret.BitmapFillMode.CLIP;
                }
                return bm;
            });
        let scrollView = this.scrollView = new egret.ScrollView();
        scrollView.width = 672;
        scrollView.height = 375;
        scrollView.x = 38;
        scrollView.y = 100;
        scrollView.setContent(this.contents[this.activeIdx]);
        this.addChild(scrollView);
    }

    private toggleTab(index: number): void {
        this.activeIdx = index;
        this.tabs.forEach((item, idx) => {
            item.setActive(idx === index);
        });
        this.scrollView.scrollTop = 0;
        this.scrollView.setContent(this.contents[index]);
    }

    private createTab(resName: string, activeResName: string): Tab {
        let bm = new egret.Bitmap(utils.getRes(resName));
        let bmActive = new egret.Bitmap(utils.getRes(activeResName));
        return new Tab(bm, bmActive);
    }

    public onOpen(): boolean {
        return true;
    }
    public onClose(): boolean {
        return true;
    }
}