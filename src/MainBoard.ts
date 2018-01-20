/**
 * 游戏主面板
 */

const Max_Bet_Percent = 0.2;
const Max_Bet_Num = 300000;

class MainBoard extends egret.DisplayObjectContainer {

    private txtMoney: egret.TextField; // 余额
    private txtScore: egret.TextField; // 成绩
    private txtBetting: egret.TextField; // 投注

    private txtDealerType: egret.TextField; // 当前坐庄
    private txtDealerMoney: egret.TextField; // 庄家余额
    private txtDealerScore: egret.TextField; // 庄家成绩
    private txtDealerRounds: egret.TextField; // 庄家局数

    private spPhaseTitle: egret.Sprite; // 当前阶段
    private txtCountDown: egret.TextField; // 倒计时

    private chips: Array<Chip>; // 筹码
    private chipIdx: number; // 选中筹码

    private btnHistory: Button; // 历史纪录按钮
    private btnDealerList: Button; // 上庄列表按钮
    private btnBeDealer: Button; // 申请上庄按钮;
    private btnBePlayer: Button; // 申请下庄按钮;

    private spPlayerAreas: Array<egret.Sprite>; // 下筹区域
    private betChips: Array<Chip> = []; // 已下筹码
    private txtCurrBettings: Array<egret.TextField> = []; // 显示四个位置下注金额
    public currBettings: Array<number> = [0, 0, 0, 0]; // 当前下注

    constructor() {
        super();
        this.addSprites();
    }

    public setMoney(money: number) {
        this.txtMoney.text = money + "";
    }

    public setScore(num: number) {
        this.txtScore.text = num + "";
    }

    public setBetting(num: number) {
        this.txtBetting.text = num + "";
    }

    public setDealerMoney(money: number | string) {
        this.txtDealerMoney.text = money + "";
    }

    public setDealerScore(num: number) {
        this.txtDealerScore.text = num + "";
    }

    public setDealerRounds(num: number) {
        this.txtDealerRounds.text = num + "";
    }

    public setDealerType(dealerType: string) {
        this.txtDealerType.text = dealerType ;
    }

    public setBeDealerBtn(isDealder: boolean) {
        // 去掉上庄
        // if (isDealder) {
        //     this.btnBeDealer.visible = false;
        //     this.btnBePlayer.visible = true;
        // } else {
        //     this.btnBeDealer.visible = true;
        //     this.btnBePlayer.visible = false;
        // }
    }

    private addSprites(): void {
        // 去掉上庄
        // this.addBitmap("brnn_env.DealerInformation", 21, 28);
        this.addBitmap("brnn_env.timeBg", (1280 - 225) / 2, 7);

        this.txtMoney = this.createInfoText("0", 98, 605);
        this.txtScore = this.createInfoText("0", 98, 641);
        this.txtBetting = this.createInfoText("0", 98, 677);

        this.txtDealerType = this.createInfoText("", 120, 39);
        this.txtDealerType.visible = false;
        this.txtDealerMoney = this.createInfoText("--", 120, 75);
        this.txtDealerMoney.visible = false;
        this.txtDealerScore = this.createInfoText("0", 120, 111);
        this.txtDealerScore.visible = false;
        this.txtDealerRounds = this.createInfoText("0", 120, 147);
        this.txtDealerRounds.visible = false;

        this.btnHistory = this.createButton(ButtonModels.HistoryButton, this.showHistory, 263, 610);
        this.btnDealerList = this.createButton(ButtonModels.DealerListButton, this.showDealerList, 955, 610);
        this.btnDealerList.visible = false;
        this.btnBeDealer = this.createButton(ButtonModels.BeDealerButton, this.handleBeDealer, 1120, 610);
        this.btnBeDealer.visible = false;
        this.btnBePlayer = this.createButton(ButtonModels.BePlayerButton, this.handleBePlayer, 1120, 610);
        this.btnBePlayer.visible = false;

        this.chips = this.createChips();

        this.spPlayerAreas = this.createPlayerAreas();
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
        const chipValues = [10, 100, 500, 1000, 5000, 10000];
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
            chip.touchEnabled = true;
            chip.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.Event) => {
                console.log('click chip')
                this.selectChip(index);
            }, this);
        });
        return result;
    }

    private createPlayerAreas(): Array<egret.Sprite> {
        let areaInfos = [
            { resName: "brnn_env.bottomGlow_4", x: 342, y: 70 },
            { resName: "brnn_env.bottomGlow_0", x: 0, y: 200 },
            { resName: "brnn_env.bottomGlow_1", x: 272, y: 234 },
            { resName: "brnn_env.bottomGlow_2", x: 612, y: 235 },
            { resName: "brnn_env.bottomGlow_3", x: 880, y: 200 },
        ];
        let result = areaInfos.map((info, idx) => {
            let sp = new egret.Sprite();
            sp.graphics.beginFill(0x000000, 0);
            let bitmap = new egret.Bitmap(utils.getRes(info.resName));
            sp.graphics.drawRect(0, 0, bitmap.width, bitmap.height);
            sp.graphics.endFill();
            sp.addChild(bitmap);
            sp.width = bitmap.width;
            sp.height = bitmap.height;
            bitmap.visible = false;
            sp.x = info.x;
            sp.y = info.y;
            this.addChild(sp);
            sp.touchEnabled = true;
            if (idx !== 0) {
                sp.addEventListener(egret.TouchEvent.TOUCH_TAP, (e: egret.TouchEvent) => {
                    // console.log(e);
                    const padding = 80;
                    if ((e.stageX - sp.x) > padding
                        && (e.stageX + padding) < (sp.x + sp.width)
                        && (e.stageY - sp.y) > padding
                        && (e.stageY + padding) < (sp.y + sp.height)) {
                        this.handlePlayerAreaClick(idx);
                    }
                }, this);
            }
            return sp;
        });
        return result;
    }

    private handlePlayerAreaClick(index: number) {
        // TODO 限制下注时间
        if (this.chipIdx === undefined) return;
        let amount = this.chips[this.chipIdx].value;

        let currBet = this.currBettings[index];
        if ((currBet + amount > app.game.coin_num * Max_Bet_Percent) || (currBet + amount > Max_Bet_Num)) {
            new Dialog("超过允许投注数");
            return;
        }
        if (amount > app.game.coin_num) {
            new Dialog("目前余额不足");
            return;
        }
        app.postBet(index, amount);
        // this.showBetAnimation(amount, index);
    }

    public showBetAnimation(value: number, playerIdx: number, isFromOther: boolean) {
        let originChip = this.chips.filter(item => item.value === value)[0];
        if (!originChip) return;
        
        app.playEffectSound("SoundChouMa_wav");
        let spArea = this.spPlayerAreas[playerIdx];
        const padding = 120;
        let width = spArea.width - (padding * 2);
        let height = spArea.height - (padding * 2);
        let targetX = spArea.x + Math.round(Math.random() * width) + padding;
        let targetY = spArea.y + Math.round(Math.random() * height) + padding;
        let startX = isFromOther ? 1230 : originChip.x;
        let startY = isFromOther ? 500 : originChip.y;
        let currX = startX;
        let currY = startY;
        let lastFrameTime = egret.getTimer();
        let speed = 200;

        let chip = new Chip(value);
        chip.x = currX;
        chip.y = currY;
        chip.scaleX = 0.65;
        chip.scaleY = 0.65;
        chip.anchorOffsetX = 50;
        chip.anchorOffsetY = 50;
        this.addChild(chip);
        this.betChips.push(chip);

        let onEnterFrame = () => {
            let now = egret.getTimer();
            let pass = now - lastFrameTime;
            currX += (targetX - startX) / speed * pass;
            currY += (targetY - startY) / speed * pass;
            if (currY < targetY) {
                currX = targetX;
                currY = targetY;
            } else {
                requestAnimationFrame(onEnterFrame);
            }
            chip.x = currX;
            chip.y = currY;
        }

        requestAnimationFrame(onEnterFrame);

        this.currBettings[playerIdx - 1] = this.currBettings[playerIdx - 1] + value;
        let txtBettingPos = [
            { x: 135, y: 250 },
            { x: 380, y: 285 },
            { x: 673, y: 280 },
            { x: 940, y: 246 }
        ];
        this.txtCurrBettings.forEach(item => {
            try {
                this.removeChild(item);
            } catch (e) {}
        });
        this.txtCurrBettings = [];
        txtBettingPos.forEach((pos, index) => {
            let betValue = this.currBettings[index];
            if (!betValue) return;
            let txt = new egret.TextField();
            txt.text = "已下注： " + betValue;
            txt.textColor = 0xc9b667;
            txt.x = pos.x;
            txt.y = pos.y;
            txt.size = 20;
            this.txtCurrBettings.push(txt);
            this.addChild(txt);
        });

        if (!isFromOther) {
            let totalBettings = 0;
            this.currBettings.forEach(num => {
                totalBettings += num;
            });
            this.setMoney(app.game.coin_num - totalBettings);
            this.setBetting(totalBettings);
        }
    }

    private selectChip(idx: number): void {
        app.playEffectSound("ClickSound_wav");
        this.chipIdx = idx;
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
        let texture: egret.Texture = utils.getRes(name);
        result.texture = texture;
        return result;
    }

    public clearBetChips() {
        try {
            this.betChips.forEach(item => {
                this.removeChild(item);
            });
            this.betChips = [];
            this.txtCurrBettings.forEach(item => {
                this.removeChild(item);
            });
            this.txtCurrBettings = [];
            this.currBettings = [0, 0, 0, 0];
            this.setBetting(0);
        } catch (e) {

        }
    }

    private showHistory(): void {
        app.modalManager.openHistoryModal();
    }

    private showDealerList(): void {
        app.modalManager.openDealerListModal();
    }

    private handleBeDealer(): void {
        app.beDealer();
    }

    private handleBePlayer(): void {
        app.bePlayer();
    }
}
