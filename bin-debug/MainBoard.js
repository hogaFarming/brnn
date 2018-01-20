/**
 * 游戏主面板
 */
var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var Max_Bet_Percent = 0.2;
var Max_Bet_Num = 300000;
var MainBoard = (function (_super) {
    __extends(MainBoard, _super);
    function MainBoard() {
        var _this = _super.call(this) || this;
        _this.betChips = []; // 已下筹码
        _this.txtCurrBettings = []; // 显示四个位置下注金额
        _this.currBettings = [0, 0, 0, 0]; // 当前下注
        _this.addSprites();
        return _this;
    }
    MainBoard.prototype.setMoney = function (money) {
        this.txtMoney.text = money + "";
    };
    MainBoard.prototype.setScore = function (num) {
        this.txtScore.text = num + "";
    };
    MainBoard.prototype.setBetting = function (num) {
        this.txtBetting.text = num + "";
    };
    MainBoard.prototype.setDealerMoney = function (money) {
        this.txtDealerMoney.text = money + "";
    };
    MainBoard.prototype.setDealerScore = function (num) {
        this.txtDealerScore.text = num + "";
    };
    MainBoard.prototype.setDealerRounds = function (num) {
        this.txtDealerRounds.text = num + "";
    };
    MainBoard.prototype.setDealerType = function (dealerType) {
        this.txtDealerType.text = dealerType;
    };
    MainBoard.prototype.setBeDealerBtn = function (isDealder) {
        // 去掉上庄
        // if (isDealder) {
        //     this.btnBeDealer.visible = false;
        //     this.btnBePlayer.visible = true;
        // } else {
        //     this.btnBeDealer.visible = true;
        //     this.btnBePlayer.visible = false;
        // }
    };
    MainBoard.prototype.addSprites = function () {
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
    };
    MainBoard.prototype.createButton = function (btnModel, clickHandler, x, y) {
        var btnFactory = new ButtonFactory();
        var btn = btnFactory.createButton(btnModel);
        btn.x = x;
        btn.y = y;
        btn.addEventListener(ButtonEvent.CLICK, clickHandler, this);
        this.addChild(btn);
        return btn;
    };
    MainBoard.prototype.createInfoText = function (text, x, y) {
        var txt = new egret.TextField();
        txt.text = text;
        txt.x = x;
        txt.y = y;
        txt.textColor = 0xffffff;
        txt.size = 20;
        txt.width = 160;
        txt.textAlign = "center";
        this.addChild(txt);
        return txt;
    };
    MainBoard.prototype.createChips = function () {
        var _this = this;
        var result = [];
        var chipValues = [10, 100, 500, 1000, 5000, 10000];
        var startChipX = 345;
        var chipY = 590;
        var chipMargin = 10;
        var chipWidth = 87;
        chipValues.forEach(function (val, index) {
            var chip = new Chip(val);
            chip.x = startChipX + (chipMargin + chipWidth) * index;
            chip.y = chipY;
            result.push(chip);
            _this.addChild(chip);
            chip.touchEnabled = true;
            chip.addEventListener(egret.TouchEvent.TOUCH_TAP, function (event) {
                console.log('click chip');
                _this.selectChip(index);
            }, _this);
        });
        return result;
    };
    MainBoard.prototype.createPlayerAreas = function () {
        var _this = this;
        var areaInfos = [
            { resName: "brnn_env.bottomGlow_4", x: 342, y: 70 },
            { resName: "brnn_env.bottomGlow_0", x: 0, y: 200 },
            { resName: "brnn_env.bottomGlow_1", x: 272, y: 234 },
            { resName: "brnn_env.bottomGlow_2", x: 612, y: 235 },
            { resName: "brnn_env.bottomGlow_3", x: 880, y: 200 },
        ];
        var result = areaInfos.map(function (info, idx) {
            var sp = new egret.Sprite();
            sp.graphics.beginFill(0x000000, 0);
            var bitmap = new egret.Bitmap(utils.getRes(info.resName));
            sp.graphics.drawRect(0, 0, bitmap.width, bitmap.height);
            sp.graphics.endFill();
            sp.addChild(bitmap);
            sp.width = bitmap.width;
            sp.height = bitmap.height;
            bitmap.visible = false;
            sp.x = info.x;
            sp.y = info.y;
            _this.addChild(sp);
            sp.touchEnabled = true;
            if (idx !== 0) {
                sp.addEventListener(egret.TouchEvent.TOUCH_TAP, function (e) {
                    // console.log(e);
                    var padding = 80;
                    if ((e.stageX - sp.x) > padding
                        && (e.stageX + padding) < (sp.x + sp.width)
                        && (e.stageY - sp.y) > padding
                        && (e.stageY + padding) < (sp.y + sp.height)) {
                        _this.handlePlayerAreaClick(idx);
                    }
                }, _this);
            }
            return sp;
        });
        return result;
    };
    MainBoard.prototype.handlePlayerAreaClick = function (index) {
        // TODO 限制下注时间
        if (this.chipIdx === undefined)
            return;
        var amount = this.chips[this.chipIdx].value;
        var currBet = this.currBettings[index];
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
    };
    MainBoard.prototype.showBetAnimation = function (value, playerIdx, isFromOther) {
        var _this = this;
        var originChip = this.chips.filter(function (item) { return item.value === value; })[0];
        if (!originChip)
            return;
        app.playEffectSound("SoundChouMa_wav");
        var spArea = this.spPlayerAreas[playerIdx];
        var padding = 120;
        var width = spArea.width - (padding * 2);
        var height = spArea.height - (padding * 2);
        var targetX = spArea.x + Math.round(Math.random() * width) + padding;
        var targetY = spArea.y + Math.round(Math.random() * height) + padding;
        var startX = isFromOther ? 1230 : originChip.x;
        var startY = isFromOther ? 500 : originChip.y;
        var currX = startX;
        var currY = startY;
        var lastFrameTime = egret.getTimer();
        var speed = 200;
        var chip = new Chip(value);
        chip.x = currX;
        chip.y = currY;
        chip.scaleX = 0.65;
        chip.scaleY = 0.65;
        chip.anchorOffsetX = 50;
        chip.anchorOffsetY = 50;
        this.addChild(chip);
        this.betChips.push(chip);
        var onEnterFrame = function () {
            var now = egret.getTimer();
            var pass = now - lastFrameTime;
            currX += (targetX - startX) / speed * pass;
            currY += (targetY - startY) / speed * pass;
            if (currY < targetY) {
                currX = targetX;
                currY = targetY;
            }
            else {
                requestAnimationFrame(onEnterFrame);
            }
            chip.x = currX;
            chip.y = currY;
        };
        requestAnimationFrame(onEnterFrame);
        this.currBettings[playerIdx - 1] = this.currBettings[playerIdx - 1] + value;
        var txtBettingPos = [
            { x: 135, y: 250 },
            { x: 380, y: 285 },
            { x: 673, y: 280 },
            { x: 940, y: 246 }
        ];
        this.txtCurrBettings.forEach(function (item) {
            try {
                _this.removeChild(item);
            }
            catch (e) { }
        });
        this.txtCurrBettings = [];
        txtBettingPos.forEach(function (pos, index) {
            var betValue = _this.currBettings[index];
            if (!betValue)
                return;
            var txt = new egret.TextField();
            txt.text = "已下注： " + betValue;
            txt.textColor = 0xc9b667;
            txt.x = pos.x;
            txt.y = pos.y;
            txt.size = 20;
            _this.txtCurrBettings.push(txt);
            _this.addChild(txt);
        });
        if (!isFromOther) {
            var totalBettings_1 = 0;
            this.currBettings.forEach(function (num) {
                totalBettings_1 += num;
            });
            this.setMoney(app.game.coin_num - totalBettings_1);
            this.setBetting(totalBettings_1);
        }
    };
    MainBoard.prototype.selectChip = function (idx) {
        app.playEffectSound("ClickSound_wav");
        this.chipIdx = idx;
        this.chips.forEach(function (chip, index) {
            chip.setActive(idx === index);
        });
    };
    MainBoard.prototype.addBitmap = function (name, x, y) {
        var bitmap = this.createBitmap(name);
        bitmap.x = x;
        bitmap.y = y;
        this.addChild(bitmap);
        return bitmap;
    };
    MainBoard.prototype.createBitmap = function (name) {
        var result = new egret.Bitmap();
        var texture = utils.getRes(name);
        result.texture = texture;
        return result;
    };
    MainBoard.prototype.clearBetChips = function () {
        var _this = this;
        try {
            this.betChips.forEach(function (item) {
                _this.removeChild(item);
            });
            this.betChips = [];
            this.txtCurrBettings.forEach(function (item) {
                _this.removeChild(item);
            });
            this.txtCurrBettings = [];
            this.currBettings = [0, 0, 0, 0];
            this.setBetting(0);
        }
        catch (e) {
        }
    };
    MainBoard.prototype.showHistory = function () {
        app.modalManager.openHistoryModal();
    };
    MainBoard.prototype.showDealerList = function () {
        app.modalManager.openDealerListModal();
    };
    MainBoard.prototype.handleBeDealer = function () {
        app.beDealer();
    };
    MainBoard.prototype.handleBePlayer = function () {
        app.bePlayer();
    };
    return MainBoard;
}(egret.DisplayObjectContainer));
__reflect(MainBoard.prototype, "MainBoard");
//# sourceMappingURL=MainBoard.js.map