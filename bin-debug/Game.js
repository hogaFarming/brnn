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
var PhaseType;
(function (PhaseType) {
    PhaseType[PhaseType["Free"] = 0] = "Free";
    PhaseType[PhaseType["Betting"] = 1] = "Betting";
    PhaseType[PhaseType["Lottery"] = 2] = "Lottery";
})(PhaseType || (PhaseType = {}));
var PhaseTitle = {
    0: "休闲时间",
    1: "投注时间",
    2: "开奖时间"
};
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        var _this = _super.call(this) || this;
        _this.startIndex = 0; // 从哪个玩家开始发牌
        _this.currIndex = 0; // 当前发到第几张
        _this.spPlayerResults = []; // 翻牌结果
        return _this;
    }
    Game.prototype.init = function (stateData) {
        this.gameStateData = stateData;
        this.gameId = stateData.id;
        if (stateData.status === 0) {
            if (stateData.no_betting_time * 1000 < +new Date) {
                app.showWaitTip();
            }
            this.initCurrentPhase();
        }
        else if (stateData.status === 1) {
            this.startLottery();
        }
        else if (stateData.status === 2) {
            // 显示牌面，并显示结算结果
            this.initCardPackage();
            this.initCurrentPhase();
            this.startDispatchCardsImmediately();
        }
    };
    /**
     * 获取到了牌面结果?
     */
    Game.prototype.receivedGameStateData = function (stateData) {
        this.gameStateData = stateData;
        if (this.currentPhase.countDown === 0) {
            this.startLottery();
        }
    };
    Game.prototype.createNewGame = function (gameId, no_betting_time, lottery_time) {
        this.gameId = gameId;
        this.clear();
        var now = Math.floor(+new Date / 1000);
        var secondsToLottery = lottery_time - now;
        this.no_betting_time = no_betting_time;
        this.setCurrentPhase({
            type: PhaseType.Betting,
            countDown: secondsToLottery
        });
    };
    Game.prototype.startLottery = function () {
        if (this.currentPhase.type === PhaseType.Lottery)
            return;
        this.setCurrentPhase({
            type: PhaseType.Lottery,
            countDown: 25
        });
        this.initCardPackage();
        this.dispatchDecisionCard();
        var timerToDispatchCards = new egret.Timer(Game.TimeAfterDecision, 1);
        timerToDispatchCards.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.startDispatchCards, this);
        timerToDispatchCards.start();
    };
    Game.prototype.startDispatchCards = function () {
        console.log("开始发牌..");
        this.removeChildAt(0);
        var timer = new egret.Timer(Game.DispatchInterval, 24);
        timer.addEventListener(egret.TimerEvent.TIMER, this.dispatchNextCard, this);
        timer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.onDispatchCardsComplete, this);
        timer.start();
        this.dispatchNextCard();
    };
    Game.prototype.startDispatchCardsImmediately = function () {
        var count = 25;
        while (count--) {
            this.dispatchNextCardImmediateLy();
        }
        this.showPlayerResult(0, false);
        this.showPlayerResult(1, false);
        this.showPlayerResult(2, false);
        this.showPlayerResult(3, false);
        this.showPlayerResult(4, false);
        this.showGameResult();
    };
    Game.prototype.refreshCardPackage = function () {
        this.cardPackage = [];
        this.currIndex = 0;
        this.startIndex = 0;
        var count = 54;
        while (count--) {
            this.cardPackage.push(new Card(CardType.方块, 5));
        }
    };
    // 初始化当前阶段
    Game.prototype.initCurrentPhase = function () {
        if (this.gameStateData.status === 0) {
            var now = Math.floor(+new Date / 1000);
            var secondsToLottery = this.gameStateData.lottery_time - now;
            this.no_betting_time = this.gameStateData.no_betting_time;
            this.setCurrentPhase({
                type: PhaseType.Betting,
                countDown: secondsToLottery
            });
        }
        else if (this.gameStateData.status === 1) {
            this.setCurrentPhase({
                type: PhaseType.Lottery,
                countDown: 25
            });
        }
        else if (this.gameStateData.status === 2) {
            this.setCurrentPhase({
                type: PhaseType.Lottery,
                countDown: 0
            });
        }
    };
    Game.prototype.setCurrentPhase = function (phase) {
        this.currentPhase = phase;
        if (this.currentPhase.countDown < 0)
            this.currentPhase.countDown = 0;
        if (phase.countDown) {
            var timer = this.timer = new egret.Timer(1000, phase.countDown);
            timer.addEventListener(egret.TimerEvent.TIMER, this.onCountDown, this);
        }
        this.onCountDown();
    };
    Game.prototype.onCountDown = function () {
        if (this.currentPhase.countDown > 0) {
            this.currentPhase.countDown -= 1;
        }
        else {
            this.currentPhase.countDown = 0;
            if (this.gameStateData && this.gameStateData.status > 0) {
                this.startLottery();
            }
            else {
                platform.getGameResult(this.gameId);
            }
        }
        if (!this.txtPhase) {
            this.txtPhase = new egret.TextField();
            this.txtPhase.textColor = 0xe7cf6e;
            this.txtPhase.size = 24;
            this.txtPhase.x = 560;
            this.txtPhase.y = 40;
            this.txtCountDown = new egret.TextField();
            this.txtCountDown.textColor = 0xe7cf6e;
            this.txtCountDown.size = 24;
            this.txtCountDown.x = 692;
            this.txtCountDown.y = 40;
            this.txtCountDown.width = 42;
            this.txtCountDown.textAlign = "center";
        }
        else {
            try {
                this.removeChild(this.txtPhase);
                this.removeChild(this.txtCountDown);
            }
            catch (e) {
            }
        }
        this.txtPhase.text = PhaseTitle[this.currentPhase.type];
        this.txtCountDown.text = this.currentPhase.countDown + "";
        this.addChild(this.txtPhase);
        this.addChild(this.txtCountDown);
    };
    // 初始化卡包
    Game.prototype.initCardPackage = function () {
        this.decisionCard = this.createDecisionCard();
        this.startIndex = (this.decisionCard.cardNum - 1) % 5;
        this.currIndex = 0;
        var stateData = this.gameStateData;
        var cardArr = [stateData.game_detail_banker, stateData.game_result_a, stateData.game_result_b, stateData.game_result_c, stateData.game_result_d];
        var cardPkg = [];
        var curr = 0;
        while (curr < 25) {
            var playerIdx = (curr + this.startIndex) % 5;
            var cardIdx = Math.floor(curr / 5);
            var cardInfo = cardArr[playerIdx].card[cardIdx];
            cardPkg[curr] = new Card(cardInfo.color, cardInfo.number);
            curr += 1;
        }
        this.cardPackage = cardPkg;
    };
    // 随机创建decisionCard
    Game.prototype.createDecisionCard = function () {
        var color = utils.randomNumber(1, 4);
        var num = utils.randomNumber(1, 13);
        var card = new Card(color, num);
        return card;
    };
    Game.prototype.getNextCard = function () {
        if (this.currIndex <= this.cardPackage.length - 1) {
            var card = this.cardPackage[this.currIndex];
            return card;
        }
        return null;
    };
    Game.prototype.dispatchDecisionCard = function () {
        this.addChild(this.decisionCard);
        this.decisionCard.dispatch(Card.DecisionPos);
    };
    Game.prototype.dispatchNextCard = function () {
        var card = this.getNextCard();
        var toPlayerIdx = (this.currIndex + this.startIndex) % 5;
        var playerCardIndex = Math.floor(this.currIndex / 5);
        var cardHidden = playerCardIndex === 4;
        this.addChild(card);
        if (toPlayerIdx === 0) {
            card.dispatch(Card.DealerPos, playerCardIndex, cardHidden);
        }
        else {
            card.dispatch(Card.PlayersPos[toPlayerIdx - 1], playerCardIndex, cardHidden);
        }
        this.currIndex += 1;
    };
    Game.prototype.dispatchNextCardImmediateLy = function () {
        var card = this.getNextCard();
        var toPlayerIdx = (this.currIndex + this.startIndex) % 5;
        var playerCardIndex = Math.floor(this.currIndex / 5);
        var cardHidden = playerCardIndex === 4;
        this.addChild(card);
        if (toPlayerIdx === 0) {
            card.dispatchImmediately(Card.DealerPos, playerCardIndex, cardHidden);
        }
        else {
            card.dispatchImmediately(Card.PlayersPos[toPlayerIdx - 1], playerCardIndex, cardHidden);
        }
        this.currIndex += 1;
    };
    Game.prototype.onDispatchCardsComplete = function () {
        var _this = this;
        setTimeout(function () {
            _this.startLookCard();
        }, 0);
    };
    Game.prototype.startLookCard = function () {
        var _this = this;
        var timer = new egret.Timer(2000, 5);
        var idx = 1;
        timer.addEventListener(egret.TimerEvent.TIMER, function () {
            var playerIdx = idx >= 5 ? 0 : idx;
            var cards = _this.getPlayerCards(playerIdx);
            var card = cards[cards.length - 1];
            card.lookCard(function () {
                _this.showPlayerResult(playerIdx);
            });
            idx += 1;
        }, this);
        timer.start();
    };
    Game.prototype.showPlayerResult = function (playerIdx, playSound) {
        var _this = this;
        if (playSound === void 0) { playSound = true; }
        var cards = this.getPlayerCards(playerIdx);
        // cards[cards.length - 1].y -= 20;
        // cards[cards.length - 2].y -= 20;
        var spResult = new egret.Sprite();
        var stateData = this.gameStateData;
        var cardResults = [stateData.game_detail_banker, stateData.game_result_a, stateData.game_result_b, stateData.game_result_c, stateData.game_result_d];
        var resultMsg = cardResults[playerIdx].result_msg;
        var bm = this.getResultBitmapByMsg(resultMsg);
        spResult.addChild(bm);
        if (playSound) {
            var sound = this.getResultSoundByMsg(resultMsg);
            app.playEffectSound(sound);
        }
        var pos = playerIdx === 0 ? Card.DealerPos : Card.PlayersPos[playerIdx - 1];
        spResult.x = pos.x + 50;
        spResult.y = pos.y + 58;
        this.spPlayerResults.push(spResult);
        this.addChild(spResult);
        if (playerIdx === 0) {
            setTimeout(function () {
                _this.showGameResult();
            }, 1000);
        }
    };
    Game.prototype.getResultBitmapByMsg = function (msg) {
        var msgMap = {
            "没有牛": "brnn_cards.Calf0_01",
            "牛1": "brnn_cards.Calf0_02",
            "牛2": "brnn_cards.Calf0_03",
            "牛3": "brnn_cards.Calf0_04",
            "牛4": "brnn_cards.Calf0_05",
            "牛5": "brnn_cards.Calf0_06",
            "牛6": "brnn_cards.Calf0_07",
            "牛7": "brnn_cards.Calf0_08",
            "牛8": "brnn_cards.Calf0_09",
            "牛9": "brnn_cards.Calf0_10",
            "牛牛": "brnn_env.Calf0_11"
        };
        return new egret.Bitmap(utils.getRes(msgMap[msg]));
    };
    Game.prototype.getResultLabelBitmapByMsg = function (msg) {
        var msgMap = {
            "没有牛": "brnn_cards.Calf1_01",
            "牛1": "brnn_cards.Calf1_02",
            "牛2": "brnn_cards.Calf1_03",
            "牛3": "brnn_cards.Calf1_04",
            "牛4": "brnn_cards.Calf1_05",
            "牛5": "brnn_cards.Calf1_06",
            "牛6": "brnn_cards.Calf1_07",
            "牛7": "brnn_cards.Calf1_08",
            "牛8": "brnn_cards.Calf1_09",
            "牛9": "brnn_cards.Calf1_10",
            "牛牛": "brnn_env.Calf1_11"
        };
        return new egret.Bitmap(utils.getRes(msgMap[msg]));
    };
    Game.prototype.getResultSoundByMsg = function (msg) {
        var msgMap = {
            "没有牛": "SoundB0_wav",
            "牛1": "SoundB1_wav",
            "牛2": "SoundB2_wav",
            "牛3": "SoundB3_wav",
            "牛4": "SoundB4_wav",
            "牛5": "SoundB5_wav",
            "牛6": "SoundB6_wav",
            "牛7": "SoundB7_wav",
            "牛8": "SoundB8_wav",
            "牛9": "SoundB9_wav",
            "牛牛": "SoundB10_wav"
        };
        return RES.getRes(msgMap[msg]);
    };
    Game.prototype.showGameResult = function () {
        if (!this.spGameResult) {
            var spGameResult = this.spGameResult = new egret.Sprite();
            var mask = new egret.Bitmap(utils.getRes("blackBG_png"));
            spGameResult.addChild(mask);
            mask.touchEnabled = true;
            var spWind = new egret.Sprite();
            spGameResult.addChild(spWind);
            var windBG = new egret.Bitmap(utils.getRes("brnn_env.jiesuandh"));
            spWind.addChild(windBG);
            spWind.width = windBG.width - 25;
            spWind.height = windBG.height;
            spWind.x = (app.stage.width - spWind.width) / 2;
            spWind.y = (app.stage.height - spWind.height) / 2;
            windBG.x = -25;
            windBG.y = 0;
            var resultBG = new egret.Bitmap(utils.getRes("brnn_env.resultShower_z"));
            spWind.addChild(resultBG);
            resultBG.x = 35;
            resultBG.y = 130;
            this.spResultContainer = new egret.Sprite();
            this.spResultContainer.width = resultBG.width;
            this.spResultContainer.height = resultBG.height;
            this.spResultContainer.x = resultBG.x;
            this.spResultContainer.y = resultBG.y;
            spWind.addChild(this.spResultContainer);
        }
        this.addChild(this.spGameResult);
        this.spResultContainer.removeChildren();
        this.spResultContainer.addChild(this.createGameResultItem(2));
    };
    Game.prototype.createGameResultItem = function (playerIdx) {
        var sp = new egret.Sprite();
        var stateData = this.gameStateData;
        var winResults = [stateData.banker_result, stateData.player_a_result, stateData.player_b_result, stateData.player_c_result, stateData.player_d_result];
        var isWin = winResults[playerIdx] === 1;
        var cardResults = [stateData.game_detail_banker, stateData.game_result_a, stateData.game_result_b, stateData.game_result_c, stateData.game_result_d];
        var resultMsg = cardResults[playerIdx].result_msg;
        var resultMultiples = [stateData.multiple_banker, stateData.multiple_a, stateData.multiple_b, stateData.multiple_c, stateData.multiple_d];
        var multiple = resultMultiples[playerIdx];
        if (playerIdx === 0) {
            var resName = "brnn_env.win_1";
            var bm = new egret.Bitmap(utils.getRes(resName));
            sp.width = bm.width;
            sp.height = bm.height;
            sp.x = 0;
            sp.y = 0;
            if (isWin)
                sp.addChild(bm);
            var bmLabel = this.getResultLabelBitmapByMsg(resultMsg);
            bmLabel.x = 450;
            bmLabel.y = 10;
            var txt = new egret.TextField();
            txt.text = stateData.banker_type === 0 ? "系统上庄" : "玩家上庄";
            txt.textColor = 0xffffff;
            txt.size = 16;
            txt.textAlign = "center";
            txt.width = sp.width;
            txt.x = 260;
            txt.y = 24;
            sp.addChild(txt);
            var txt1 = new egret.TextField();
            txt1.text = multiple + "";
            txt1.textColor = 0xffffff;
            txt1.size = 16;
            txt1.textAlign = "center";
            txt1.width = sp.width;
            txt1.x = 296;
            txt1.y = 64;
            sp.addChild(txt1);
        }
        else {
            var resName = "brnn_env.win_" + (playerIdx + 1);
            var bm = new egret.Bitmap(utils.getRes(resName));
            sp.width = bm.width;
            sp.height = bm.height;
            sp.x = 0 + (playerIdx - 1) * 156;
            sp.y = 105;
            if (isWin)
                sp.addChild(bm);
            var bmLabel = this.getResultLabelBitmapByMsg(resultMsg);
            sp.addChild(bmLabel);
            bmLabel.x = 28;
            bmLabel.y = 38;
            var txt = new egret.TextField();
            txt.text = multiple + "";
            txt.textColor = 0xffffff;
            txt.size = 16;
            txt.textAlign = "center";
            txt.width = sp.width;
            txt.x = 0;
            txt.y = 115;
            sp.addChild(txt);
        }
        return sp;
    };
    Game.prototype.getPlayerCards = function (playerIdx) {
        var _this = this;
        var cards = this.cardPackage.slice(0, 25).filter(function (card, index) {
            return (index + _this.startIndex) % 5 === playerIdx;
        });
        return cards;
    };
    Game.prototype.clear = function () {
        app.hideWaitTip();
        this.removeChildren();
        this.gameStateData = null;
    };
    Game.TimeAfterDecision = 1000; // 抽牌后多久开始发牌
    Game.DispatchInterval = 100; // 发牌时间间隔（速度）
    return Game;
}(egret.Sprite));
__reflect(Game.prototype, "Game");
//# sourceMappingURL=Game.js.map