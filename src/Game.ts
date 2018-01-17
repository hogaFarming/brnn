enum PhaseType {
    Free,
    Betting,
    Lottery
}

const PhaseTitle = {
    0: "休闲时间",
    1: "投注时间",
    2: "开奖时间"
};

interface Phase {
    type: PhaseType;
    countDown: number;
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
    next_game_info: Object;
}

class Game extends egret.Sprite {

    static TimeAfterDecision = 1000; // 抽牌后多久开始发牌
    static DispatchInterval = 100; // 发牌时间间隔（速度）

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
            this.initCurrentPhase();
        } else {
            this.nextNewGame = stateData.next_game_info;
            if (stateData.status === 1) {
                let secondsForLottery = Math.ceil(this.nextNewGame.lottery_time - 20 - (+new Date / 1000));
                this.startLottery(secondsForLottery);
            } else if (stateData.status === 2) {
                // 显示牌面，并显示结算结果
                this.initCardPackage();
                this.initCurrentPhase();
                this.startDispatchCardsImmediately();
            }
        }
    }

    /**
     * 投注过程或开奖过程中，获取到了牌面/结算结果
     */
    receivedGameStateData(stateData: GameStateData): void {
        // console.log("this.currentPhase.type === PhaseType.Betting && this.currentPhase.countDown <= 0 => " + (this.currentPhase.type === PhaseType.Betting && this.currentPhase.countDown <= 0));
        // console.log("this.currentPhase.type === PhaseType.Lottery => " + (this.currentPhase.type === PhaseType.Lottery));
        if (this.currentPhase.type === PhaseType.Betting) {
            this.setGameStateData(stateData);
            if (this.currentPhase.countDown <= 0) {
                let lottery_time = this.nextNewGame ? this.nextNewGame.lottery_time : (stateData.lottery_time + 50);
                let secondsForLottery = Math.ceil(lottery_time - 20 - (+new Date / 1000));
                
                if (secondsForLottery < 0) secondsForLottery += 51;
                this.startLottery(secondsForLottery);
            }
        } else if (this.currentPhase.type === PhaseType.Lottery) {
            this.setGameStateData(stateData);
            if (stateData.status === 2 && this.currentPhase.countDown === 0) {
                this.showGameResult();
            }
        }
    }

    createNewGame(gameId: number, no_betting_time: number, lottery_time: number) {
        console.log(`create new game: ${gameId}, no_betting_time: ${new Date(no_betting_time * 1000)}, lottery_time: ${new Date(lottery_time * 1000)}`);
        this.setGameStateData(null);
        this.gameId = gameId;
        this.clear();
        app.mainBoard.clearBetChips();
        let now = Math.floor(+new Date / 1000);
        let secondsToLottery = lottery_time - now;
        this.no_betting_time = no_betting_time;
        console.log("countdown seconds: " + secondsToLottery);
        this.setCurrentPhase({
            type: PhaseType.Betting,
            countDown: secondsToLottery
        });
    }

    startLottery(countDown?: number): void {
        if (this.currentPhase.type === PhaseType.Lottery) return;
        console.log("开奖，countdown" + countDown);
        this.setCurrentPhase({
            type: PhaseType.Lottery,
            countDown: countDown || 25
        });
        this.initCardPackage();
        this.dispatchDecisionCard();
        let timerToDispatchCards = new egret.Timer(Game.TimeAfterDecision, 1);
        timerToDispatchCards.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.startDispatchCards, this);
        timerToDispatchCards.start();
    }

    startDispatchCards(): void {
        console.log("开始发牌..");
        try {
            this.removeChild(this.decisionCard);
        } catch (e) {};
        let timer = new egret.Timer(Game.DispatchInterval, 24);
        timer.addEventListener(egret.TimerEvent.TIMER, this.dispatchNextCard, this);
        timer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.onDispatchCardsComplete, this);
        timer.start();

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

    // 初始化当前阶段
    initCurrentPhase(): void {
        if (this.gameStateData.status === 0) {
            let now = Math.floor(+new Date / 1000);
            let secondsToLottery = this.gameStateData.lottery_time - now;
            this.no_betting_time = this.gameStateData.no_betting_time;
            this.setCurrentPhase({
                type: PhaseType.Betting,
                countDown: secondsToLottery
            })
        } else {
            let secondsForLottery = Math.ceil(this.nextNewGame.lottery_time - 20 - (+new Date / 1000));
            this.setCurrentPhase({
                type: PhaseType.Lottery,
                countDown: secondsForLottery
            });
            // if (this.gameStateData.status === 1) {
            //     this.setCurrentPhase({
            //         type: PhaseType.Lottery,
            //         countDown: secondsForLottery
            //     })
            // } else if (this.gameStateData.status === 2) {
            //     this.setCurrentPhase({
            //         type: PhaseType.Lottery,
            //         countDown: secondsForLottery
            //     })
            // }
        }
    }

    setGameStateData(stateData: GameStateData) {
        if (stateData === null) {
            console.log("set game state " + stateData);
            this.gameStateData = null;
        } else {
            console.log("set game state status:" + stateData.status);
            this.gameStateData = stateData;
            app.mainBoard.setDealerType(stateData.banker_username || "");
        }
    }

    setCurrentPhase(phase: Phase) {
        this.currentPhase = phase;
        if (this.currentPhase.countDown < 0) this.currentPhase.countDown = 0;
        if (this.currentPhase.countDown) {
            let timer = this.timer = new egret.Timer(1000, this.currentPhase.countDown);
            timer.addEventListener(egret.TimerEvent.TIMER, this.onCountDown, this);
            timer.start();
        }
        this.onCountDown();
    }

    onCountDown() {
        console.log("count down " + this.currentPhase.countDown);
        if (this.currentPhase.countDown > 0) {
            this.currentPhase.countDown -= 1;
        } else {
            this.currentPhase.countDown = 0;

            if (this.currentPhase.type === PhaseType.Betting && this.gameStateData && this.gameStateData.status > 0) {
                // let lottery_time = this.nextNewGame ? this.nextNewGame.lottery_time : (this.gameStateData.lottery_time + 50);
                // if (!this.nextNewGame) {
                //     console.log("no next new game")
                // }
                let secondsForLottery = Math.ceil(this.nextNewGame.lottery_time - 20 - (+new Date / 1000));
                // if (secondsForLottery < 0) debugger;
                this.startLottery(secondsForLottery);
            } else if (this.currentPhase.type === PhaseType.Lottery) {
                // if (this.nextNewGame) {
                    this.createNewGame(this.nextNewGame.game_id, this.nextNewGame.no_betting_time, this.nextNewGame.lottery_time);
                // }
                // platform.getGameResult(this.gameId);
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
        let timer = new egret.Timer(2000, 5);
        let idx = 1;
        timer.addEventListener(egret.TimerEvent.TIMER, () => {
            let playerIdx = idx >= 5 ? 0 : idx;
            let cards = this.getPlayerCards(playerIdx);
            let card = cards[cards.length - 1];
            card.lookCard(() => {
                this.showPlayerResult(playerIdx);
            });
            idx += 1;
        }, this);
        timer.start();
    }

    showPlayerResult(playerIdx: number, playSound: boolean = true) {
        let cards = this.getPlayerCards(playerIdx);
        // cards[cards.length - 1].y -= 20;
        // cards[cards.length - 2].y -= 20;
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

        if (playerIdx === 0) {
            setTimeout(() => {
                this.showGameResult();
            }, 1000);
        }
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
            "牛牛": "brnn_env.Calf1_11"
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
            let txt = new egret.TextField();
            txt.text = stateData.banker_type === 0 ? "系统上庄" : "玩家上庄";
            txt.textColor = 0xffffff;
            txt.size = 24;
            txt.x = 260;
            txt.y = 24;
            sp.addChild(txt);
            let txt1 = new egret.TextField();
            txt1.text = bettingNum + "";
            txt1.textColor = 0xffffff;
            txt1.size = 20;
            txt1.x = 296;
            txt1.y = 64;
            sp.addChild(txt1);
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
