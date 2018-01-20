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
    PhaseType[PhaseType["Dispatch"] = 3] = "Dispatch";
    PhaseType[PhaseType["Result"] = 4] = "Result";
})(PhaseType || (PhaseType = {}));
var PhaseTitle = {
    0: "休闲时间",
    1: "投注时间",
    2: "开奖时间",
    3: "发牌时间",
    4: "结算时间"
};
var TimeForBetting = 15;
var TimeForDispatchCards = 15;
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        var _this = _super.call(this) || this;
        _this.coin_num = 0; // 余额
        _this.is_banker = 0;
        _this.banker_username = "";
        _this.startIndex = 0; // 从哪个玩家开始发牌
        _this.currIndex = 0; // 当前发到第几张
        _this.spPlayerResults = []; // 翻牌结果
        return _this;
    }
    Game.prototype.init = function (stateData, gameConfig) {
        this.setGameStateData(stateData);
        this.gameId = stateData.id;
        if (gameConfig) {
            this.coin_num = gameConfig.coin_num;
            app.mainBoard.setMoney(gameConfig.coin_num);
        }
        if (stateData.status === 0) {
            if (stateData.no_betting_time * 1000 < +new Date) {
                app.showWaitTip();
            }
            var now = Math.round(+new Date / 1000);
            var secondsToLottery = this.gameStateData.lottery_time - now;
            this.no_betting_time = this.gameStateData.no_betting_time;
            this.setCurrentPhase({
                type: PhaseType.Betting,
                countDown: secondsToLottery
            });
        }
        else {
            this.nextNewGame = stateData.next_game_info;
            var secondsForLottery = Math.round(this.nextNewGame.lottery_time - TimeForBetting - (+new Date / 1000));
            if (secondsForLottery > TimeForDispatchCards + 3) {
                this.startLottery();
            }
            else {
                // 显示牌面，并显示结算结果
                this.initCardPackage();
                this.setCurrentPhase({
                    type: PhaseType.Result,
                    countDown: secondsForLottery
                });
                this.startDispatchCardsImmediately();
            }
        }
    };
    /**
     * 投注过程或开奖过程中，获取到了牌面/结算结果
     */
    Game.prototype.receivedGameStateData = function (stateData) {
        if (this.currentPhase.type === PhaseType.Betting) {
            this.setGameStateData(stateData);
            if (this.currentPhase.countDown <= 0) {
                this.startLottery();
            }
        }
        else {
            this.setGameStateData(stateData);
        }
    };
    Game.prototype.createNewGame = function (gameId, no_betting_time, lottery_time) {
        console.log("create new game: " + gameId + ", no_betting_time: " + utils.unixTime(no_betting_time) + ", lottery_time: " + utils.unixTime(lottery_time));
        this.setGameStateData(null);
        this.gameId = gameId;
        this.clear();
        app.mainBoard.clearBetChips();
        var now = Math.round(+new Date / 1000);
        var secondsToLottery = lottery_time - now;
        this.no_betting_time = no_betting_time;
        this.setCurrentPhase({
            type: PhaseType.Betting,
            countDown: secondsToLottery
        });
    };
    Game.prototype.startLottery = function () {
        this.setCurrentPhase({
            type: PhaseType.Dispatch,
            countDown: TimeForDispatchCards
        });
        this.initCardPackage();
        this.dispatchDecisionCard();
        setTimeout(this.startDispatchCards.bind(this), Game.TimeAfterDecision);
        return;
        // let secondsForLottery;
        // if (this.nextNewGame) {
        //     secondsForLottery = Math.round(this.nextNewGame.lottery_time - TimeForBetting - (+new Date / 1000));
        //     console.log("has next new game data, secondsForLottery " + secondsForLottery);
        // } else {
        //     secondsForLottery = Math.round(this.gameStateData.lottery_time + 42 - TimeForBetting - (+new Date / 1000));
        //     console.log("no next new game data, secondsForLottery " + secondsForLottery);
        // }
        // console.log("开始开奖：" + utils.unixTime(+new Date / 1000));
        // console.log("剩余开奖时间" + secondsForLottery + "秒");
        // if (secondsForLottery > TimeForDispatchCards + 3) {
        //     this.setCurrentPhase({
        //         type: PhaseType.Dispatch,
        //         countDown: TimeForDispatchCards,
        //         restForResult: secondsForLottery - TimeForDispatchCards
        //     });
        //     this.initCardPackage();
        //     this.dispatchDecisionCard();
        //     setTimeout(this.startDispatchCards.bind(this), Game.TimeAfterDecision);
        // } else {
        //     // 显示牌面，并显示结算结果
        //     this.initCardPackage();
        //     this.setCurrentPhase({
        //         type: PhaseType.Result,
        //         countDown: secondsForLottery
        //     })
        //     this.startDispatchCardsImmediately();
        // }
    };
    Game.prototype.setGameStateData = function (stateData) {
        if (stateData === null) {
            console.log("set game state " + stateData);
            this.gameStateData = null;
        }
        else {
            console.log("set game state status:" + stateData.status);
            this.gameStateData = stateData;
            app.mainBoard.setDealerType(stateData.banker_username || "");
            this.is_banker = stateData.is_banker;
            app.mainBoard.setBeDealerBtn(this.is_banker === 1);
        }
    };
    Game.prototype.setCurrentPhase = function (phase) {
        this.currentPhase = phase;
        if (this.currentPhase.restForResult) {
            console.log("预计结算时间" + this.currentPhase.restForResult);
        }
        if (this.currentPhase.countDown < 0)
            this.currentPhase.countDown = 0;
        if (this.currentPhase.countDown) {
            new Timer(this.onCountDown.bind(this), function () { }, 1000, this.currentPhase.countDown);
        }
        this.onCountDown();
    };
    Game.prototype.onCountDown = function () {
        if (this.currentPhase.countDown > 0) {
            this.currentPhase.countDown -= 1;
        }
        else {
            this.currentPhase.countDown = 0;
            if (this.currentPhase.type === PhaseType.Betting && this.gameStateData && this.gameStateData.status > 0) {
                this.startLottery();
            }
            else if (this.currentPhase.type === PhaseType.Dispatch) {
                this.setCurrentPhase({
                    type: PhaseType.Result,
                    countDown: Math.round(this.nextNewGame.lottery_time - TimeForBetting - (+new Date / 1000))
                });
                this.showGameResult();
            }
            else if (this.currentPhase.type === PhaseType.Result) {
                this.createNewGame(this.nextNewGame.game_id, this.nextNewGame.no_betting_time, this.nextNewGame.lottery_time);
            }
        }
        if (!this.txtPhase) {
            this.txtPhase = new egret.TextField();
            this.txtPhase.textColor = 0xe7cf6e;
            this.txtPhase.size = 24;
            this.txtPhase.x = 560;
            this.txtPhase.y = 40;
            this.txtCountDown = new egret.TextField();
            this.txtCountDown.textColor = 0x333333;
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
        this.addChildAt(this.txtPhase, 0);
        this.addChildAt(this.txtCountDown, 0);
    };
    Game.prototype.startDispatchCards = function () {
        try {
            this.removeChild(this.decisionCard);
        }
        catch (e) { }
        ;
        new Timer(this.dispatchNextCard.bind(this), this.onDispatchCardsComplete.bind(this), Game.DispatchInterval, 24);
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
        var idx = 1;
        new Timer(function () {
            var playerIdx = idx >= 5 ? 0 : idx;
            var cards = _this.getPlayerCards(playerIdx);
            var card = cards[cards.length - 1];
            card.lookCard(function () {
                _this.showPlayerResult(playerIdx);
            });
            idx += 1;
        }, function () { }, 2000, 5);
    };
    Game.prototype.showPlayerResult = function (playerIdx, playSound) {
        if (playSound === void 0) { playSound = true; }
        var cards = this.getPlayerCards(playerIdx);
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
            "牛牛": "brnn_cards.Calf1_11"
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
        var _this = this;
        if (this.gameStateData.status !== 2)
            return;
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
        this.spResultContainer.addChild(this.createGameResultItem(0));
        this.spResultContainer.addChild(this.createGameResultItem(1));
        this.spResultContainer.addChild(this.createGameResultItem(2));
        this.spResultContainer.addChild(this.createGameResultItem(3));
        this.spResultContainer.addChild(this.createGameResultItem(4));
        var txtFinnalBetting = new egret.TextField();
        txtFinnalBetting.size = 24;
        txtFinnalBetting.x = 200;
        txtFinnalBetting.y = 280;
        txtFinnalBetting.text = this.gameStateData.finnal_betting_num + "";
        this.spResultContainer.addChild(txtFinnalBetting);
        if (this.nextNewGame) {
            platform.getUserMoney().then(function (result) {
                app.mainBoard.setMoney(result.num);
                app.mainBoard.setScore(result.user_total_betting_num);
                _this.coin_num = result.num;
            });
            platform.getDealerMoney(this.nextNewGame.game_id).then(function (result) {
                app.mainBoard.setDealerMoney(result.banker_total_coin_num || "--");
                app.mainBoard.setDealerScore(result.banker_total_betting_num);
                app.mainBoard.setDealerRounds(result.banker_total_game_num);
            });
        }
    };
    Game.prototype.createGameResultItem = function (playerIdx) {
        var sp = new egret.Sprite();
        var stateData = this.gameStateData;
        var winResults = [stateData.banker_result, stateData.player_a_result, stateData.player_b_result, stateData.player_c_result, stateData.player_d_result];
        var isWin = winResults[playerIdx] === 1;
        var cardResults = [stateData.game_detail_banker, stateData.game_result_a, stateData.game_result_b, stateData.game_result_c, stateData.game_result_d];
        var resultMsg = cardResults[playerIdx].result_msg;
        // let resultMultiples = [stateData.multiple_banker, stateData.multiple_a, stateData.multiple_b, stateData.multiple_c, stateData.multiple_d];
        // let multiple = resultMultiples[playerIdx];
        var resultBetting = [0, stateData.betting_a, stateData.betting_b, stateData.betting_c, stateData.betting_d];
        var bettingNum = resultBetting[playerIdx];
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
            sp.addChild(bmLabel);
            bmLabel.x = 450;
            bmLabel.y = 10;
            // 去掉上庄
            // let txt = new egret.TextField();
            // txt.text = stateData.banker_type === 0 ? "系统上庄" : "玩家上庄";
            // txt.textColor = 0xffffff;
            // txt.size = 24;
            // txt.x = 260;
            // txt.y = 24;
            // sp.addChild(txt);
            // let txt1 = new egret.TextField();
            // txt1.text = bettingNum + "";
            // txt1.textColor = 0xffffff;
            // txt1.size = 20;
            // txt1.x = 296;
            // txt1.y = 64;
            // sp.addChild(txt1);
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
            txt.text = bettingNum + "";
            txt.textColor = 0xffffff;
            txt.size = 20;
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
    };
    Game.TimeAfterDecision = 1000; // 抽牌后多久开始发牌
    Game.DispatchInterval = 90; // 发牌时间间隔（速度）
    return Game;
}(egret.Sprite));
__reflect(Game.prototype, "Game");
//# sourceMappingURL=Game.js.map