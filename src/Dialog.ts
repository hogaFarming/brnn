class Dialog extends egret.Sprite {

    private message: string;
    private callback: Function;

    constructor(message: string, callback?: Function) {
        super();
        this.message = message;
        this.callback = callback;
        this.init();
    }

    private init() {
        let blackBG = new egret.Bitmap(utils.getRes("blackBG_png"));
        this.addChild(blackBG);

        let dialogWindow = new egret.Sprite();
        this.addChild(dialogWindow);
        let dialogBG = new egret.Bitmap(utils.getRes("brnn_env.tipBg"));
        dialogWindow.addChild(dialogBG);
        dialogWindow.x = (1280 - dialogBG.width) / 2;
        dialogWindow.y = (720 - dialogBG.height) / 2;

        let confirmBtn = new ButtonFactory().createButton(ButtonModels.ConfirmBtn);
        dialogWindow.addChild(confirmBtn);
        confirmBtn.x = 206;
        confirmBtn.y = 187;
        confirmBtn.addEventListener(ButtonEvent.CLICK, this.handleConfirm, this);

        let txt = new egret.TextField();
        txt.x = 32;
        txt.y = 70;
        txt.width = 420;
        txt.textColor = 0xffffff;
        txt.size = 24;
        txt.text = this.message;
        dialogWindow.addChild(txt);

        app.stage.addChild(this);
    }

    private handleConfirm() {
        this.callback && this.callback();
        app.stage.removeChild(this);
    }
}