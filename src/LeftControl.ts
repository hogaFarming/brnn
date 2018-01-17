class LeftControl extends egret.Sprite {

    private toggle: egret.Sprite;
    private panel: egret.Sprite;
    private backBtn: Button;
    private soundBtn: Button;
    private soundDisabledBtn: Button;
    private helpBtn: Button;

    constructor() {
        super();
        this.initView();
        app.addEventListener(AppEvent.BGM_TOGGLE, this.onAppBgmToggled, this);
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
        panel.visible = false;
        this.addChild(panel);
        this.addPanelBtn(ButtonModels.BackButton, this.onClickBackBtn, 12, 18);
        this.soundBtn = this.addPanelBtn(ButtonModels.SoundButtonA, this.handleClickSoundBtn, 73, 118);
        this.soundDisabledBtn = this.addPanelBtn(ButtonModels.SoundButtonB, this.handleClickSoundBtn, 73, 118);
        this.addPanelBtn(ButtonModels.HelpButton, this.onClickHelpBtn, 12, 212);
        if (app.bgmEnabled) {
            this.panel.removeChild(this.soundDisabledBtn);
        } else {
            this.panel.removeChild(this.soundBtn);
        }
    }

    private addPanelBtn(btnModel: ButtonModel, clickHandler: Function, x: number, y: number): Button {
        let factory = new ButtonFactory();
        let btn = factory.createButton(btnModel);
        btn.x = x;
        btn.y = y;
        btn.addEventListener(ButtonEvent.CLICK, clickHandler, this);
        this.panel.addChild(btn);
        return btn;
    }

    private onAppBgmToggled(event: AppEvent): void {
        if (event.data === true) {
            this.panel.removeChild(this.soundDisabledBtn);
            this.panel.addChild(this.soundBtn);
        } else {
            this.panel.removeChild(this.soundBtn);
            this.panel.addChild(this.soundDisabledBtn);
        }
    }

    private onClickBackBtn(): void {
        if (history.length > 1) {
            history.back();
        } else {
            window.close();
        }
    }

    private onClickHelpBtn(): void {
        app.modalManager.openHelpModal();
    }

    private handleClickSoundBtn(): void {
        app.toggleBgmEnabled();
    }

    public togglePanel(): void {
        app.playEffectSound("ClickSound_wav");
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
