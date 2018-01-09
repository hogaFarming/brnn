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
    public leftControl: LeftControl;
    public modalManager: ModalManager;
    private appLoading: AppLoading;

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
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource();
        this.createGameScene();
        await platform.login();
        let userInfo = await platform.getUserInfo();
        console.log(userInfo);
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
        }
        catch (e) {
            console.error(e);
        }
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
        this.showLoading();
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
}