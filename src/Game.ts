enum PhaseType {
    Free,
    Betting,
    Lottery,
    Dispatch,
    Result
}

const PhaseTitle = {
    0: "休闲时间",
    1: "投注时间",
    2: "开奖时间",
    3: "发牌时间",
    4: "结算时间"
};

interface Phase {
    type: PhaseType;
    countDown: number;
    restForResult?: number;
}

interface CardResult {
    card: Array<{ number: number, color: number }>;
    result_msg: string;
}

interface GameStateData {
    id: number; // 牌局id
    status: number; // 0 投注中，1 开奖中，2 已结算
    banker_type: number; // 用户/系统上庄
    banker_username: string;
    is_banker: number; // 当前用户是否上庄
    no_betting_time: number; // 截止投注时间
    lottery_time: number; // 开奖开始时间
    balance_time: number; // 结算时间
    now_time: number;
    game_detail_banker: CardResult; // 牌面结果
    game_result_a: CardResult;
    game_result_b: CardResult;
    game_result_c: CardResult;
    game_result_d: CardResult;
    multiple_banker: number; // 牌面倍数
    multiple_a: number;
    multiple_b: number;
    multiple_c: number;
    multiple_d: number;
    banker_result: number; // 输赢
    player_a_result: number;
    player_b_result: number;
    player_c_result: number;
    player_d_result: number;
    finnal_betting_num: number; // 结算分数
    betting_a: number;
    betting_b: number;
    betting_c: number;
    betting_d: number;
    next_game_info: any;
}

const TimeForBetting = 15;
const TimeForDispatchCards = 15;

class Game extends egret.Sprite {

    static TimeAfterDecision = 1000; // 抽牌后多久开始发牌
    static DispatchInterval = 90; // 发牌时间间隔（速度）

    public gameId: number;
    public gameStateData: GameStateData; // 游戏状态数据（来自服务端）
    public currentPhase: Phase;
    public no_betting_time: number; // 截止下注时间
    public coin_num: number = 0; // 余额
    public is_banker: number = 0;
    public banker_username: string = "";
    private cardPackage: Array<Card>;
    private decisionCard: Card; // 抽牌牌面
    private startIndex: number = 0; // 从哪个玩家开始发牌
    private currIndex: number = 0; // 当前发到第几张
    private spPlayerResults: Array<egret.Sprite> = []; // 翻牌结果
    private spGameResult: egret.Sprite;
    private spResultContainer: egret.Sprite;
    private txtPhase: egret.TextField; // 时钟标题
    private txtCountDown: egret.TextField; // 倒计时


    private timer: egret.Timer; // 倒计时timer
    public nextNewGame: any;

    constructor() {
        super();
    }

    init(stateData: GameStateData, gameConfig?: any): void {
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
            let now = Math.round(+new Date / 1000);
            let secondsToLottery = this.gameStateData.lottery_time - now;
            this.no_betting_time = this.gameStateData.no_betting_time;
            this.setCurrentPhase({
                type: PhaseType.Betting,
                countDown: secondsToLottery
            });
        } else {
            this.nextNewGame = stateData.next_game_info;
            let secondsForLottery = Math.round(this.nextNewGame.lottery_time - TimeForBetting - (+new Date / 1000));
            if (secondsForLottery > TimeForDispatchCards + 3) {
                this.startLottery();
            } else {
                // 显示牌面，并显示结算结果
                this.initCardPackage();
                this.setCurrentPhase({
                    type: PhaseType.Result,
                    countDown: secondsForLottery
                })
                this.startDispatchCardsImmediately();
            }
        }
    }

    /**
     * 投注过程或开奖过程中，获取到了牌面/结算结果
     */
    receivedGameStateData(stateData: GameStateData): void {
        if (this.currentPhase.type === PhaseType.Betting) {
            this.setGameStateData(stateData);
            if (this.currentPhase.countDown <= 0) {
                this.startLottery();
            }
        } else {
            this.setGameStateData(stateData);
        }
    }

    createNewGame(gameId: number, no_betting_time: number, lottery_time: number) {
        console.log(`create new game: ${gameId}, no_betting_time: ${utils.unixTime(no_betting_time)}, lottery_time: ${utils.unixTime(lottery_time)}`);
        this.setGameStateData(null);
        this.gameId = gameId;
        this.clear();
        app.mainBoard.clearBetChips();
        let now = Math.round(+new Date / 1000);
        let secondsToLottery = lottery_time - now;
        this.no_betting_time = no_betting_time;
        this.setCurrentPhase({
            type: PhaseType.Betting,
            countDown: secondsToLottery
        });
    }

    startLottery(): void {
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
    }

    setGameStateData(stateData: GameStateData) {
        if (stateData === null) {
            console.log("set game state " + stateData);
            this.gameStateData = null;
        } else {
            console.log("set game state status:" + stateData.status);
            this.gameStateData = stateData;
            app.mainBoard.setDealerType(stateData.banker_username || "");
            this.is_banker = stateData.is_banker;
            app.mainBoard.setBeDealerBtn(this.is_banker === 1);
        }
    }

    setCurrentPhase(phase: Phase) {
        this.currentPhase = phase;
        if (this.currentPhase.restForResult) {
            console.log("预计结算时间" + this.currentPhase.restForResult);
        }
        if (this.currentPhase.countDown < 0) this.currentPhase.countDown = 0;
        if (this.currentPhase.countDown) {
            new Timer(this.onCountDown.bind(this), () => {}, 1000, this.currentPhase.countDown);
        }
        this.onCountDown();
    }

    onCountDown() {
        if (this.currentPhase.countDown > 0) {
            this.currentPhase.countDown -= 1;
        } else {
            this.currentPhase.countDown = 0;
            if (this.currentPhase.type === PhaseType.Betting && this.gameStateData && this.gameStateData.status > 0) {
                this.startLottery();
            } else if (this.currentPhase.type === PhaseType.Dispatch) {
                this.setCurrentPhase({
                    type: PhaseType.Result,
                    countDown: Math.round(this.nextNewGame.lottery_time - TimeForBetting - (+new Date / 1000))
                });
                this.showGameResult();
            } else if (this.currentPhase.type === PhaseType.Result) {
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
        } else {
            try {
                this.removeChild(this.txtPhase);
                this.removeChild(this.txtCountDown);
            } catch (e) {

            }
        }
        this.txtPhase.text = PhaseTitle[this.currentPhase.type];
        this.txtCountDown.text = this.currentPhase.countDown + "";
        this.addChildAt(this.txtPhase, 0);
        this.addChildAt(this.txtCountDown, 0);
    }

    startDispatchCards(): void {
        try {
            this.removeChild(this.decisionCard);
        } catch (e) {};
        new Timer(this.dispatchNextCard.bind(this), this.onDispatchCardsComplete.bind(this), Game.DispatchInterval, 24);

        this.dispatchNextCard();
    }

    startDispatchCardsImmediately(): void {
        let count = 25;
        while (count --) {
            this.dispatchNextCardImmediateLy();
        }
        this.showPlayerResult(0, false);
        this.showPlayerResult(1, false);
        this.showPlayerResult(2, false);
        this.showPlayerResult(3, false);
        this.showPlayerResult(4, false);
        this.showGameResult();
    }

    refreshCardPackage(): void {
        this.cardPackage = [];
        this.currIndex = 0;
        this.startIndex = 0;
        let count = 54;
        while (count --) {
            this.cardPackage.push(new Card(CardType.方块, 5));
        }
    }

    // 初始化卡包
    initCardPackage(): void {
        this.decisionCard = this.createDecisionCard();
        this.startIndex = (this.decisionCard.cardNum - 1) % 5;
        this.currIndex = 0;

        let stateData = this.gameStateData;
        let cardArr = [stateData.game_detail_banker, stateData.game_result_a, stateData.game_result_b, stateData.game_result_c, stateData.game_result_d];
        let cardPkg = [];
        let curr = 0;
        while (curr < 25) {
            let playerIdx = (curr + this.startIndex) % 5;
            let cardIdx = Math.floor(curr / 5);
            let cardInfo = cardArr[playerIdx].card[cardIdx];
            cardPkg[curr] = new Card(cardInfo.color, cardInfo.number);
            curr += 1;
        }
        this.cardPackage = cardPkg;
    }

    // 随机创建decisionCard
    createDecisionCard(): Card {
        let color = utils.randomNumber(1, 4);
        let num = utils.randomNumber(1, 13);
        let card = new Card(color, num);
        return card;
    }

    getNextCard(): Card | null {
        if (this.currIndex <= this.cardPackage.length - 1) {
            let card = this.cardPackage[this.currIndex];
            return card;
        }
        return null;
    }

    dispatchDecisionCard(): void {
        this.addChild(this.decisionCard);
        this.decisionCard.dispatch(Card.DecisionPos);
    }

    dispatchNextCard(): void {
        let card = this.getNextCard();
        let toPlayerIdx = (this.currIndex + this.startIndex) % 5;
        let playerCardIndex = Math.floor(this.currIndex / 5);
        let cardHidden = playerCardIndex === 4;
        this.addChild(card);
        if (toPlayerIdx === 0) {
            card.dispatch(Card.DealerPos, playerCardIndex, cardHidden);
        } else {
            card.dispatch(Card.PlayersPos[toPlayerIdx - 1], playerCardIndex, cardHidden);
        }
        this.currIndex += 1;
    }

    dispatchNextCardImmediateLy(): void {
        let card = this.getNextCard();
        let toPlayerIdx = (this.currIndex + this.startIndex) % 5;
        let playerCardIndex = Math.floor(this.currIndex / 5);
        let cardHidden = playerCardIndex === 4;
        this.addChild(card);
        if (toPlayerIdx === 0) {
            card.dispatchImmediately(Card.DealerPos, playerCardIndex, cardHidden);
        } else {
            card.dispatchImmediately(Card.PlayersPos[toPlayerIdx - 1], playerCardIndex, cardHidden);
        }
        this.currIndex += 1;
    }

    onDispatchCardsComplete(): void {
        setTimeout(() => {
            this.startLookCard();
        }, 0);
    }

    startLookCard(): void {
        let idx = 1;
        new Timer(() => {
            let playerIdx = idx >= 5 ? 0 : idx;
            let cards = this.getPlayerCards(playerIdx);
            let card = cards[cards.length - 1];
            card.lookCard(() => {
                this.showPlayerResult(playerIdx);
            });
            idx += 1;
        }, () => {}, 2000, 5);
    }

    showPlayerResult(playerIdx: number, playSound: boolean = true) {
        let cards = this.getPlayerCards(playerIdx);
        let spResult = new egret.Sprite();
        let stateData = this.gameStateData;
        let cardResults = [stateData.game_detail_banker, stateData.game_result_a, stateData.game_result_b, stateData.game_result_c, stateData.game_result_d];
        let resultMsg = cardResults[playerIdx].result_msg;
        let bm = this.getResultBitmapByMsg(resultMsg);
        spResult.addChild(bm);
        if (playSound) {
            let sound = this.getResultSoundByMsg(resultMsg);
            app.playEffectSound(sound);
        }
        let pos = playerIdx === 0 ? Card.DealerPos : Card.PlayersPos[playerIdx - 1];
        spResult.x = pos.x + 50;
        spResult.y = pos.y + 58;
        this.spPlayerResults.push(spResult);
        this.addChild(spResult);
    }

    getResultBitmapByMsg(msg: string): egret.Bitmap {
        const msgMap = {
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
    }

    getResultLabelBitmapByMsg(msg: string): egret.Bitmap {
        const msgMap = {
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
    }

    getResultSoundByMsg(msg: string): egret.Sound {
        const msgMap = {
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
    }

    showGameResult() {
        if (this.gameStateData.status !== 2) return;
        if (!this.spGameResult) {
            let spGameResult = this.spGameResult = new egret.Sprite();

            let mask = new egret.Bitmap(utils.getRes("blackBG_png"));
            spGameResult.addChild(mask);
            mask.touchEnabled = true;

            let spWind = new egret.Sprite();
            spGameResult.addChild(spWind);

            let windBG = new egret.Bitmap(utils.getRes("brnn_env.jiesuandh"));
            spWind.addChild(windBG);
            spWind.width = windBG.width -25;
            spWind.height = windBG.height;
            spWind.x = (app.stage.width - spWind.width) / 2;
            spWind.y = (app.stage.height - spWind.height) / 2;
            windBG.x = -25;
            windBG.y = 0;

            let resultBG = new egret.Bitmap(utils.getRes("brnn_env.resultShower_z"));
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
        
        let txtFinnalBetting = new egret.TextField();
        txtFinnalBetting.size = 24;
        txtFinnalBetting.x = 200;
        txtFinnalBetting.y = 280;
        txtFinnalBetting.text = this.gameStateData.finnal_betting_num + "";
        this.spResultContainer.addChild(txtFinnalBetting);

        if (this.nextNewGame) {
            platform.getUserMoney().then(result => {
                app.mainBoard.setMoney(result.num);
                app.mainBoard.setScore(result.user_total_betting_num);
                this.coin_num = result.num;
            });
            platform.getDealerMoney(this.nextNewGame.game_id).then(result => {
                app.mainBoard.setDealerMoney(result.banker_total_coin_num || "--");
                app.mainBoard.setDealerScore(result.banker_total_betting_num);
                app.mainBoard.setDealerRounds(result.banker_total_game_num);
            });
        }
    }

    createGameResultItem(playerIdx: number): egret.Sprite {
        let sp = new egret.Sprite();
        let stateData = this.gameStateData;
        let winResults = [stateData.banker_result, stateData.player_a_result, stateData.player_b_result, stateData.player_c_result, stateData.player_d_result];
        let isWin = winResults[playerIdx] === 1;
        let cardResults = [stateData.game_detail_banker, stateData.game_result_a, stateData.game_result_b, stateData.game_result_c, stateData.game_result_d];
        let resultMsg = cardResults[playerIdx].result_msg;
        // let resultMultiples = [stateData.multiple_banker, stateData.multiple_a, stateData.multiple_b, stateData.multiple_c, stateData.multiple_d];
        // let multiple = resultMultiples[playerIdx];
        let resultBetting = [0, stateData.betting_a, stateData.betting_b, stateData.betting_c, stateData.betting_d];
        let bettingNum = resultBetting[playerIdx];
        if (playerIdx === 0) {
            let resName = "brnn_env.win_1";
            let bm = new egret.Bitmap(utils.getRes(resName));
            sp.width = bm.width;
            sp.height = bm.height;
            sp.x = 0;
            sp.y = 0;
            if (isWin) sp.addChild(bm);
            let bmLabel = this.getResultLabelBitmapByMsg(resultMsg);
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
        } else {
            let resName = "brnn_env.win_" + (playerIdx + 1);
            let bm = new egret.Bitmap(utils.getRes(resName));
            sp.width = bm.width;
            sp.height = bm.height;
            sp.x = 0 + (playerIdx - 1) * 156;
            sp.y = 105;
            if (isWin) sp.addChild(bm);
            let bmLabel = this.getResultLabelBitmapByMsg(resultMsg);
            sp.addChild(bmLabel);
            bmLabel.x = 28;
            bmLabel.y = 38;
            let txt = new egret.TextField();
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
    }

    getPlayerCards(playerIdx: number): Array<Card> {
        let cards = this.cardPackage.slice(0, 25).filter((card, index) => {
            return (index + this.startIndex) % 5 === playerIdx;
        });
        return cards;
    }

    clear(): void {
        app.hideWaitTip();
        this.removeChildren();
    }
}
