//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

let app: Main = null;

class Main extends egret.DisplayObjectContainer {
    public mainBoard: MainBoard;
    public game: Game;
    public modalManager: ModalManager;
    public leftControl: LeftControl;
    private appLoading: AppLoading;
    private bgMusic: egret.Sound;
    private bgChannel: egret.SoundChannel; // 背景音乐频道
    public effectChannel: egret.SoundChannel; // 音效频道
    public bgmEnabled: boolean = true;
    public spWaitTip: egret.Sprite; // 下注时间已过，请等待下一轮操作

    public constructor() {
        super();
        app = this;
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            // egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            // egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource();
        this.createGameScene();
        // this.showLoading();
        await this.loadSounds();
        await platform.login();
        let gameConfig = await platform.getGameConfig();
        let gameState: GameStateData = await platform.getGameState();
        this.game.init(gameState, gameConfig);
        
        platform.getUserMoney().then(result => {
            app.mainBoard.setMoney(result.num);
            app.mainBoard.setScore(result.user_total_betting_num);
            this.game.coin_num = result.num;
        });
        platform.getDealerMoney(gameState.id).then(result => {
            app.mainBoard.setDealerMoney(result.banker_total_coin_num || "--");
            app.mainBoard.setDealerScore(result.banker_total_betting_num);
            app.mainBoard.setDealerRounds(result.banker_total_game_num);
        });
        // this.hideLoading();

        platform.addEventListener(RemoteEvent.BET, this.onRemoteBet, this);
        platform.addEventListener(RemoteEvent.GAME_CREATE, this.onRemoteGameCreated, this);
        platform.addEventListener(RemoteEvent.GAME_RECEIVED_RESULT, this.onRemoteGameReceivedResult, this);
    }

    /**
     * 加载游戏图片资源，显示loading界面
     */
    private async loadResource() {
        try {
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("loading", 0);
            let loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadGroup("ui", 0, loadingView);
            this.stage.removeChild(loadingView);
        } catch (e) {
            console.error(e);
        }
    }

    private async loadSounds() {
        try {
            await RES.loadGroup("sounds", 0);
            this.bgMusic = RES.getRes("SoundBg_mp3");
            this.bgChannel = this.bgMusic.play();
        } catch (e) {
            console.error(e);
        }
    }
    
    /**
     * 打开/关闭声音
     */
    public toggleBgmEnabled() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.bgChannel = this.bgMusic.play();
        } else {
            this.bgChannel.stop();
        }
        const evt = new AppEvent(AppEvent.BGM_TOGGLE);
        evt.data = this.bgmEnabled;
        this.dispatchEvent(evt);
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        console.log('createGameScene');
        this.createGameBG();
        this.mainBoard = new MainBoard();
        this.addChild(this.mainBoard);
        this.game = new Game();
        this.addChild(this.game);
        this.modalManager = new ModalManager();
        this.addChild(this.modalManager);
        this.leftControl = new LeftControl();
        this.addChild(this.leftControl);
    }

    private createGameBG() {
        let bg = new egret.Sprite();
        let bgImg: egret.Bitmap = new egret.Bitmap(RES.getRes("BG_png"));
        bg.addChild(bgImg);
        this.addChild(bg);
    }

    public playEffectSound(resource: string);
    public playEffectSound(resource: egret.Sound);
    public playEffectSound(resource: string | egret.Sound) {
        if (!this.bgmEnabled) return;
        if (typeof resource === "string") {
            let sound: egret.Sound = RES.getRes(resource);
            this.effectChannel = sound.play(0, 1);
        } else {
            this.effectChannel = resource.play(0, 1);
        }
    }

    /**
     * 申请上庄
     */
    public async beDealer() {
        if (this.game.coin_num < BeDealerMinLimit) {
            new Dialog("您的余额不足，无法上庄！");
            return;
        }
        let result = await platform.applyDealer();
        // if (result) {

        // }
    }

    /**
     * 申请下庄
     */
    public bePlayer() {
        platform.applyPlayer();
    }

    /**
     * 下注
     */
    public postBet(playerIdx: number, amount: number) {
        if (!this.game.currentPhase) return;
        if (this.game.currentPhase.type !== PhaseType.Betting) return;
        if (this.game.no_betting_time * 1000 <= +new Date) return;
        if (this.game.is_banker) return;
        platform.bet(this.game.gameId, amount, playerIdx);
    }

    /**
     * 服务端下注触发
     */
    public onRemoteBet(e: RemoteEvent) {
        let data = e.data;
        if (data.gameId !== this.game.gameId) return;
        this.mainBoard.showBetAnimation(data.amount, data.playerIdx, data.isFromOther);
    }

    public onRemoteGameCreated(e: RemoteEvent) {
        this.game.nextNewGame = e.data;
        // if (this.game.currentPhase && this.game.currentPhase.type === PhaseType.Lottery && this.game.currentPhase.countDown > 0) {
        //     this.game.nextNewGame = e.data;
        // } else {
        //     let data = e.data;
        //     this.game.createNewGame(data.game_id, data.no_betting_time, data.lottery_time);
        // }
    }

    public onRemoteGameReceivedResult(e: RemoteEvent) {
        let data = e.data;
        this.game.receivedGameStateData(data);
    }

    public showLoading(): void {
        if (!this.appLoading) {
            this.appLoading = new AppLoading();
            this.addChild(this.appLoading);
        }
        this.appLoading.visible = true;
    }

    public hideLoading(): void {
        this.appLoading.visible = false;
    }

    public showWaitTip(): void {
        if (!this.spWaitTip) {
            this.spWaitTip = new egret.Sprite();
            let tipBG = new egret.Bitmap(utils.getRes("brnn_env.loadingBG"));
            tipBG.x = 5;
            tipBG.y = 325;
            this.spWaitTip.addChild(tipBG);
            let bmTip = new egret.Bitmap(utils.getRes("brnn_env.text_time"));
            bmTip.x = (1280 - bmTip.width) / 2;
            bmTip.y = 325;
            this.spWaitTip.addChild(bmTip);
        }
        this.addChild(this.spWaitTip);
    }

    public hideWaitTip(): void {
        try {
            this.removeChild(this.spWaitTip);
        } catch (e) {
            
        }
    }
}