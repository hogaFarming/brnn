/**
 * 游戏主面板
 */
class MainBoard extends egret.DisplayObjectContainer {

    private txtMoney: egret.TextField; // 余额
    private txtScore: egret.TextField; // 成绩
    private txtBetting: egret.TextField; // 投注

    private spDealer: egret.Sprite; // 当前坐庄
    private txtDealerMoney: egret.TextField; // 庄家余额
    private txtDealerScore: egret.TextField; // 庄家成绩
    private txtDealerRounds: egret.TextField; // 庄家局数

    private spPhaseTitle: egret.Sprite; // 当前阶段
    private txtCount: egret.TextField; // 倒计时

    private chips: Array<Chip>; // 筹码
    private chipIdx: number; // 选中筹码

    private btnHistory: Button; // 历史纪录按钮
    private btnDealerList: Button; // 上庄列表按钮
    private btnBeDealer: Button; // 申请上庄按钮;
    private btnBePlayer: Button; // 申请下庄按钮;

    constructor() {
        super();
        this.addSprites();
    }

    private addSprites(): void {
        this.addBitmap("brnn_env.DealerInformation", 21, 28);
        this.addBitmap("brnn_env.timeBg", (1280 - 225) / 2, 7);

        this.txtMoney = this.createInfoText("0", 98, 605);
        this.txtScore = this.createInfoText("0", 98, 641);
        this.txtBetting = this.createInfoText("0", 98, 677);

        this.txtDealerMoney = this.createInfoText("0", 120, 75);
        this.txtDealerScore = this.createInfoText("0", 120, 111);
        this.txtDealerRounds = this.createInfoText("0", 120, 147);

        this.btnHistory = this.createButton(ButtonModels.HistoryButton, this.onClickHistory, 263, 610);
        this.btnDealerList = this.createButton(ButtonModels.DealerListButton, this.onClickHistory, 955, 610);
        this.btnBeDealer = this.createButton(ButtonModels.BeDealerButton, this.onClickHistory, 1120, 610);
        this.btnBePlayer = this.createButton(ButtonModels.BePlayerButton, this.onClickHistory, 1120, 610);
        this.btnBePlayer.visible = false;

        this.chips = this.createChips();
    }

    private createButton(btnModel: ButtonModel, clickHandler: Function, x: number, y: number): Button {
        let btnFactory = new ButtonFactory();
        let btn = btnFactory.createButton(btnModel);
        btn.x = x;
        btn.y = y;
        btn.addEventListener(ButtonEvent.CLICK, clickHandler, this);
        this.addChild(btn);
        return btn;
    }

    private createInfoText(text: string, x: number, y: number): egret.TextField {
        let txt = new egret.TextField();
        txt.text = text;
        txt.x = x;
        txt.y = y;
        txt.textColor = 0xffffff;
        txt.size = 20;
        txt.width = 160;
        txt.textAlign = "center";
        this.addChild(txt);
        return txt;
    }

    private createChips(): Array<Chip> {
        let result = [];
        const chipValues = [1000, 5000, 10000, 100000, 500000, 1000000];
        const startChipX = 345;
        const chipY = 590;
        const chipMargin = 10;
        const chipWidth = 87;
        chipValues.forEach((val, index) => {
            let chip = new Chip(val);
            chip.x = startChipX + (chipMargin + chipWidth) * index;
            chip.y = chipY;
            result.push(chip);
            this.addChild(chip);
            chip.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.Event) => {
                console.log('click chip')
                this.selectChip(index);
            }, this);
        });
        return result;
    }

    private selectChip(idx: number): void {
        this.chips.forEach((chip, index) => {
            chip.setActive(idx === index);
        });
    }

    private addBitmap(name: string, x: number, y: number): egret.Bitmap {
        let bitmap = this.createBitmap(name);
        bitmap.x = x;
        bitmap.y = y;
        this.addChild(bitmap);
        return bitmap;
    }

    private createBitmap(name: string): egret.Bitmap {
        let result = new egret.Bitmap();
        let texture: egret.Texture = this.getRes(name);
        result.texture = texture;
        return result;
    }

    private getRes(name: string): egret.Texture {
        let arr = name.split('.');
        if (arr.length === 1) {
            return RES.getRes(name);
        } else {
            return RES.getRes(arr[0]).getTexture(arr[1]);
        }
    }

    private onClickHistory(): void {
        console.log("on click.");
    }
}
