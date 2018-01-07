class LeftControl extends egret.Sprite {

    private toggle: egret.Sprite;
    private panel: egret.Sprite;
    private backBtn: Button;
    private soundBtnA: Button;
    private soundBtnB: Button;
    private helpBtn: Button;

    constructor() {
        super();
        this.initView();
    }

    private initView(): void {
        this.addToggle();
        this.addPanel();
    }

    private addToggle(): void {
        let toggle = this.toggle = new egret.Sprite();
        let bitmap = new egret.Bitmap(this.getRes("brnn_cards.ctrlStatus"));
        toggle.addChild(bitmap);
        toggle.x = 0;
        toggle.y = 326;
        toggle.touchEnabled = true;
        toggle.addEventListener(egret.TouchEvent.TOUCH_TAP, this.togglePanel, this);
        this.addChild(toggle);
    }

    private addPanel(): void {
        let panel = this.panel = new egret.Sprite();
        let bitmap = new egret.Bitmap(this.getRes("brnn_env.ctrlerBtns0"));
        panel.addChild(bitmap);
        panel.x = 0;
        panel.y = 210;
        this.addChild(panel);
        this.addPanelBtn(ButtonModels.BackButton, this.onClickBackBtn, 12, 18);
        this.addPanelBtn(ButtonModels.SoundButtonA, this.onClickBackBtn, 73, 118);
        this.addPanelBtn(ButtonModels.SoundButtonB, this.onClickBackBtn, 73, 118);
        this.addPanelBtn(ButtonModels.HelpButton, this.onClickBackBtn, 12, 212);
    }

    private addPanelBtn(btnModel: ButtonModel, clickHandler: Function, x: number, y: number): void {
        let factory = new ButtonFactory();
        let btn = factory.createButton(btnModel);
        btn.x = x;
        btn.y = y;
        btn.addEventListener(ButtonEvent.CLICK, clickHandler, this);
        this.panel.addChild(btn);
    }

    private onClickBackBtn(): void {
        console.log("click panel btn");
    }

    public togglePanel(): void {
        this.panel.visible = !this.panel.visible;
    }

    private getRes(name: string): egret.Texture {
        let arr = name.split('.');
        if (arr.length === 1) {
            return RES.getRes(name);
        } else {
            return RES.getRes(arr[0]).getTexture(arr[1]);
        }
    }
}
