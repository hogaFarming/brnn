/** 
 * 平台数据接口。
 * 由于每款游戏通常需要发布到多个平台上，所以提取出一个统一的接口用于开发者获取平台数据信息
 * 推荐开发者通过这种方式封装平台逻辑，以保证整体结构的稳定
 * 由于不同平台的接口形式各有不同，白鹭推荐开发者将所有接口封装为基于 Promise 的异步形式
 */
declare interface Platform extends egret.EventDispatcher {

    getGameConfig(): Promise<any>;

    getUserMoney(): Promise<any>;

    getDealerMoney(gameId: number): Promise<any>;

    getGameState(): Promise<any>;

    getGameResult(gameId: number): Promise<any>;

    bet(gameId: number, amount: number, playerIdx: number): Promise<any>;

    getHistory(gameId: number): Promise<any>;

    getDealerList(): Promise<any>;

    applyDealer(): Promise<any>;

    applyPlayer(): Promise<any>;

    login(): Promise<any>

}

let user_test = "";

interface SocketMsg {
    type: string;
    status: boolean;
    error_code: string;
    error_msg: string;
    list: Array<any>;
    data: any;
}

class RemoteEvent extends egret.Event {
    public static BET:string = "bet";
    public static GAME_CREATE: string = "game_create";
    public static GAME_RECEIVED_RESULT: string = "game_received_result";
    public constructor(type: string, bubbles: boolean = false, cancelable: boolean = false)  {
        super(type, bubbles, cancelable);
    }
}

class WeixinPlatform extends egret.EventDispatcher implements Platform {

    private ws: egret.WebSocket;

    async getGameConfig() {
        let res = await http.get("/api/gameinfo_niuniu");
        let config = res.data.config;
        this.connectSocket(config.ip, config.port);
        return res.data;
    }

    async getUserMoney() {
        let res = await http.get("/api/get_total");
        return res.data;
    }

    async getDealerMoney(gameId: number) {
        let res = await http.get("/api/get_total_banker", { params: { game_id: gameId } });
        return res.data;
    }

    async getGameState() {
        let res = await http.get("/api/game_info_now");
        let data = <GameStateData>res.data;
        if (data.now_time && data.lottery_time) {
            let client_now_time = Math.round(+new Date() / 1000);
            let diff = client_now_time - data.now_time;
            data.lottery_time += diff;
            data.no_betting_time && (data.no_betting_time += diff);
            if (data.next_game_info) {
                let lottery_time = data.next_game_info.lottery_time;
                data.next_game_info.lottery_time += diff;
                data.next_game_info.no_betting_time += diff;
                console.log(
                    `下一局游戏开奖时间：(${data.next_game_info.lottery_time - client_now_time}秒后) 本地(${utils.unixTime(data.next_game_info.lottery_time)})，服务(${utils.unixTime(lottery_time)})。
                    当前服务器时间(${utils.unixTime(data.now_time)})，
                    当前客户端时间(${utils.unixTime(client_now_time)})，
                    校准值为${diff}秒
                    `
                );
            }
        }
        return data;
    }

    async getGameResult(gameId: number) {
        let res = await http.get("/api/game_result", { params: { id: gameId } });
        if (res.data.status === 0) return null;
        let evt = new RemoteEvent(RemoteEvent.GAME_RECEIVED_RESULT);
        evt.data = res.data;
        this.dispatchEvent(evt);
        return res.data;
    }

    async bet(gameId, amount, playerIdx) {
        let chipTypeMap = {
            10: 0,
            100: 1,
            500: 2,
            1000: 3,
            5000: 4,
            10000: 5
        };
        let res = await http.post("/api/betting", {
            data: {
                game_id: gameId,
                chip_type: chipTypeMap[amount],
                betting_type: playerIdx - 1
            }
        });
        if (res.status) {
            let evt = new RemoteEvent(RemoteEvent.BET);
            evt.data = {
                gameId: gameId,
                amount,
                playerIdx,
                isFromOther: false
            };
            this.dispatchEvent(evt);
        } else {
            new Dialog(res.error_msg);
        }
    }

    async getHistory(gameId) {
        let res = await http.get("/api/game_history", { params: { id: gameId } });
        let list = res.data.map(item => {
            return [item.player_a_result, item.player_b_result, item.player_c_result, item.player_d_result, item.id];
        });
        return list;
    }

    async login() {
        if (utils.url.params("usertest")) {
            user_test = utils.url.params("usertest");
        } else {
            await this._login();
        }
    }

    async getDealerList() {
        let res = await http.get("/api/banker_list");
        return res.data;
    }

    async applyDealer() {
        let res = await http.get("/api/banker_apply");
    }

    async applyPlayer() {
        let res = await http.get("/api/down_banker");
    }

    connectSocket(address: string, port: number) {
        this.ws = new egret.WebSocket();
        this.ws.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onSocketData, this);
        this.ws.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.ws.connect(address, port);
    }

    onSocketOpen(): void { 
        console.log("Egret WebSocket 连接成功");    
    }

    onSocketData(e: egret.Event): void {
        let msg = this.ws.readUTF();
        try {
            let parsed = JSON.parse(msg);
            if (parsed.type === "connection") {
                let clientId = <string>parsed.data;
                this.bindSocket(clientId);
            } else if (parsed.type === "game_create") {
                let evt = new RemoteEvent(RemoteEvent.GAME_CREATE);
                let client_now_time = Math.round(+new Date() / 1000);
                let diff = client_now_time - parsed.now_time;
                evt.data = {
                    game_id: parsed.game_id,
                    lottery_time: parsed.lottery_time + diff,
                    no_betting_time: parsed.no_betting_time + diff
                };
                console.log(
                    `下一局游戏开奖时间：(${evt.data.lottery_time - client_now_time}秒后) 本地(${utils.unixTime(evt.data.lottery_time)})，服务(${utils.unixTime(parsed.lottery_time)})。
                    当前服务器时间(${utils.unixTime(parsed.now_time)})，
                    当前客户端时间(${utils.unixTime(client_now_time)})，
                    校准值为${diff}秒
                    `
                );
                this.dispatchEvent(evt);
            } else if (parsed.type === "game_result") {
                this.getGameResult(parsed.id);
            } else if (parsed.type === "game_balance") {
                this.getGameResult(parsed.id);
            } else if (parsed.type === "game_user_betting") {
                let chipTypeMap2 = {
                    0: 10,
                    1: 100,
                    2: 500,
                    3: 1000,
                    4: 5000,
                    5: 10000
                };
                let evt = new RemoteEvent(RemoteEvent.BET);
                evt.data = {
                    gameId: parsed.game_id,
                    amount: chipTypeMap2[parsed.chip_type],
                    playerIdx: parsed.betting_type + 1,
                    isFromOther: true
                };
                this.dispatchEvent(evt);
            }
        } catch (e) {
            console.error("解析socket数据出错, ", msg);
        }
    }

    bindSocket(clientId: string) {
        let data = {
            client_id: clientId,
            type: 1 // 游戏类型（0\|推币机，1\|牛牛）
        };
        let res = http.post("/api/bind", { data });
    }

    private async _login() {
        // 第一步，从本地检查登录状态
        let loginStatus = utils.cache.get("isLogin");
        if (utils.cache.get("debug")) {
            debugger;
        }
        if (!loginStatus || loginStatus === "0") {
            let isAuth = utils.cache.get("isAuth");
            if (isAuth === "1") return;
            let callbackUrl = location.href;
            let apiToken = await http.getApiToken();
            let url = Http.URL_BASE + "/api/wechat/auth" +
                "?callback=" + (encodeURIComponent(callbackUrl)) +
                "&token=" + apiToken +
                "&type=mp";
            console.log("redirect url: " + url);
            console.log("callback url == " + callbackUrl);
            utils.cache.set("isLogin", "2");
            window.location.href = url;
        } else if (loginStatus === "2") {
            return this.judgeLogin();
        } else {

        }
    }

    private async judgeLogin() {
        try {
            let res = await http.get("/api/judge/logins");
            if (utils.cache.get("debug")) {
                debugger;
            }
            if (res.data.is_auth === 1 && res.data.is_user === 0) {
                utils.cache.set("isLogin", "0");
                utils.cache.set("isAuth", "1");
                // TODO
                console.error("已通过微信认证，但是未登录？");
            } else if (res.data.is_auth === 0) {
                utils.cache.set("isAuth", "0");
                utils.cache.set("isLogin", "0");
                return await this._login();
            } else if (res.data.is_auth === 1 && res.data.is_user === 1) {
                utils.cache.set("isAuth", "1");
                utils.cache.set("isLogin", "1");
                return await this._login();
            }
        } catch (e) {
            utils.cache.set("isAuth", "0");
            utils.cache.set("isLogin", "0");
            return await this._login();
        }
    }
}


if (!window.platform) {
    window.platform = new WeixinPlatform();
}



declare let platform: Platform;

declare interface Window {

    platform: Platform
}





