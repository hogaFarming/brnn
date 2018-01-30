class QubiWindow extends egret.Sprite implements ModalLifeCycle {

    private txtTips: egret.TextField;
    private txtInput: egret.TextField;
    private txtResult: egret.TextField;
    private confirmBtn: Button;

    constructor() {
        super();
        this.init();
    }

    private init(): void {
        this.width = 573;
        this.height = 382;
        let bg = new egret.Bitmap(utils.getRes("brnn_qubi.qubiBG"));
        this.addChild(bg);

        let title = new egret.TextField();
        title.text = "取币";
        title.y = 20;
        title.width = 573;
        title.size = 30;
        title.textAlign = "center";
        this.addChild(title);

        let tips = this.txtTips = new egret.TextField();
        tips.width = 420;
        tips.x = 80;
        tips.y = 100;
        tips.textAlign = "center";
        tips.size = 22;
        tips.lineSpacing = 8;
        this.addChild(tips);

        let inputBG = new egret.Bitmap(utils.getRes("brnn_qubi.inputBG"));
        inputBG.width = 418;
        inputBG.height = 50;
        inputBG.x = 75;
        inputBG.y = 160;
        this.addChild(inputBG);

        let txInput: egret.TextField = this.txtInput = new egret.TextField();
        txInput.type = egret.TextFieldType.INPUT;
        txInput.width = 410;
        txInput.height = 50;
        txInput.x = 78;
        txInput.y = 160;
        txInput.textColor = 0xffffff;
        txInput.verticalAlign = "middle";
        txInput.addEventListener(egret.Event.CHANGE, this.onInputChange, this);
        this.addChild(txInput);

        this.txtResult = new egret.TextField();
        this.txtResult.text = "";
        this.txtResult.textColor = 0xff0000;
        this.txtResult.x = 75;
        this.txtResult.y = 230;
        this.txtResult.size = 24;
        this.txtResult.width = 420;
        this.txtResult.textAlign = "center";
        this.addChild(this.txtResult);

        this.confirmBtn = new ButtonFactory().createButton(ButtonModels.QubiConfirmBtn);
        this.confirmBtn.x = 214;
        this.confirmBtn.y = 300;
        this.confirmBtn.addEventListener(ButtonEvent.CLICK, this.handleConfirm, this);
        this.addChild(this.confirmBtn);
    }

    private async handleConfirm(e: egret.Event) {
        if (this.checkInput()) return;
        let amount = +this.txtInput.text;
        if (!amount) return;
        try {
            let res = await platform.exchangeCoin(amount, 0);
            new Dialog("兑换成功", () => {
                app.modalManager.qubiModal.close();
            });
            let gameConfig = await platform.getGameConfig(false);
            app.game.coin_num = gameConfig.coin_num;
            app.game.fufen_num = gameConfig.fufen_num;
            app.mainBoard.setMoney(gameConfig.coin_num);
        } catch (e) {
            new Dialog(e.message || "兑换失败");
        }
    }

    private onInputChange(e: egret.Event): void {
        let tx = <egret.TextField>e.target;
        let str = tx.text;
        if (!str) {
            this.txtResult.text = "";
            return;
        }
        let msg = this.checkInput();
        if (msg) {
            this.txtResult.text = msg;
            return;
        }
        let amount = +str;
        this.txtResult.text = "兑换成" + utils.fufenToCoin(amount) + "筹码";
    }

    private checkInput(): string {
        let str = this.txtInput.text;
        if (!utils.isNumber(str)) return "请输入数字";
        if (/\./.test(str)) return "请输入大于0的整数";
        if (+str < 0) return "请输入大于0的整数";
        return "";
    }

    public onOpen(): boolean {
        this.txtTips.text = "1积分可兑换" + app.game.exchange_rate + "筹码，输入您要兑换的积分 您的积分：" + app.game.fufen_num;
        this.txtInput.text = "";
        this.txtResult.text = "";
        return true;
    }

    public onClose(): boolean {
        return true;
    }
}
