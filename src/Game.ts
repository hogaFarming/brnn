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
}

class Game extends egret.Sprite {

    static TimeAfterDecision = 1000; // 抽牌后多久开始发牌
    static DispatchInterval = 100; // 发牌时间间隔（速度）

    public gameId: number;
    public gameStateData: GameStateData; // 游戏状态数据（来自服务端）
    public currentPhase: Phase;
    public no_betting_time: number; // 截止下注时间
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

    constructor() {
        super();
    }

    init(stateData: GameStateData): void {
        this.gameStateData = stateData;
        this.gameId = stateData.id;
        if (stateData.status === 0) {
            if (stateData.no_betting_time * 1000 < +new Date) {
                app.showWaitTip();
            }
            this.initCurrentPhase();
        } else if (stateData.status === 1) {
            this.startLottery();
        } else if (stateData.status === 2) {
            // 显示牌面，并显示结算结果
            this.initCardPackage();
            this.initCurrentPhase();
            this.startDispatchCardsImmediately();
        }
    }

    /**
     * 获取到了牌面结果?
     */
    receivedGameStateData(stateData: GameStateData): void {
        this.gameStateData = stateData;
        if (this.currentPhase.countDown === 0) {
            this.startLottery();
        }
    }

    createNewGame(gameId: number, no_betting_time: number, lottery_time: number) {
        this.gameId = gameId;
        this.clear();
        let now = Math.floor(+new Date / 1000);
        let secondsToLottery = lottery_time - now;
        this.no_betting_time = no_betting_time;
        this.setCurrentPhase({
            type: PhaseType.Betting,
            countDown: secondsToLottery
        });
    }

    startLottery(): void {
        if (this.currentPhase.type === PhaseType.Lottery) return;
        this.setCurrentPhase({
            type: PhaseType.Lottery,
            countDown: 25
        });
        this.initCardPackage();
        this.dispatchDecisionCard();
        let timerToDispatchCards = new egret.Timer(Game.TimeAfterDecision, 1);
        timerToDispatchCards.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.startDispatchCards, this);
        timerToDispatchCards.start();
    }

    startDispatchCards(): void {
        console.log("开始发牌..");
        this.removeChildAt(0);
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
        } else if (this.gameStateData.status === 1) {
            this.setCurrentPhase({
                type: PhaseType.Lottery,
                countDown: 25
            })
        } else if (this.gameStateData.status === 2) {
            this.setCurrentPhase({
                type: PhaseType.Lottery,
                countDown: 0
            })
        }
    }

    setCurrentPhase(phase: Phase) {
        this.currentPhase = phase;
        if (this.currentPhase.countDown < 0) this.currentPhase.countDown = 0;
        if (phase.countDown) {
            let timer = this.timer = new egret.Timer(1000, phase.countDown);
            timer.addEventListener(egret.TimerEvent.TIMER, this.onCountDown, this);
        }
        this.onCountDown();
    }

    onCountDown() {
        if (this.currentPhase.countDown > 0) {
            this.currentPhase.countDown -= 1;
        } else {
            this.currentPhase.countDown = 0;
            if (this.gameStateData && this.gameStateData.status > 0) {
                this.startLottery();
            } else {
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
        } else {
            try {
                this.removeChild(this.txtPhase);
                this.removeChild(this.txtCountDown);
            } catch (e) {

            }
        }
        this.txtPhase.text = PhaseTitle[this.currentPhase.type];
        this.txtCountDown.text = this.currentPhase.countDown + "";
        this.addChild(this.txtPhase);
        this.addChild(this.txtCountDown);
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
        this.spResultContainer.addChild(this.createGameResultItem(2));
    }

    createGameResultItem(playerIdx: number): egret.Sprite {
        let sp = new egret.Sprite();
        let stateData = this.gameStateData;
        let winResults = [stateData.banker_result, stateData.player_a_result, stateData.player_b_result, stateData.player_c_result, stateData.player_d_result];
        let isWin = winResults[playerIdx] === 1;
        let cardResults = [stateData.game_detail_banker, stateData.game_result_a, stateData.game_result_b, stateData.game_result_c, stateData.game_result_d];
        let resultMsg = cardResults[playerIdx].result_msg;
        let resultMultiples = [stateData.multiple_banker, stateData.multiple_a, stateData.multiple_b, stateData.multiple_c, stateData.multiple_d];
        let multiple = resultMultiples[playerIdx];
        if (playerIdx === 0) {
            let resName = "brnn_env.win_1";
            let bm = new egret.Bitmap(utils.getRes(resName));
            sp.width = bm.width;
            sp.height = bm.height;
            sp.x = 0;
            sp.y = 0;
            if (isWin) sp.addChild(bm);
            let bmLabel = this.getResultLabelBitmapByMsg(resultMsg);
            bmLabel.x = 450;
            bmLabel.y = 10;
            let txt = new egret.TextField();
            txt.text = stateData.banker_type === 0 ? "系统上庄" : "玩家上庄";
            txt.textColor = 0xffffff;
            txt.size = 16;
            txt.textAlign = "center";
            txt.width = sp.width;
            txt.x = 260;
            txt.y = 24;
            sp.addChild(txt);
            let txt1 = new egret.TextField();
            txt1.text = multiple + "";
            txt1.textColor = 0xffffff;
            txt1.size = 16;
            txt1.textAlign = "center";
            txt1.width = sp.width;
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
        this.gameStateData = null;
    }
}
