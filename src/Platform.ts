/** 
 * 平台数据接口。
 * 由于每款游戏通常需要发布到多个平台上，所以提取出一个统一的接口用于开发者获取平台数据信息
 * 推荐开发者通过这种方式封装平台逻辑，以保证整体结构的稳定
 * 由于不同平台的接口形式各有不同，白鹭推荐开发者将所有接口封装为基于 Promise 的异步形式
 */
declare interface Platform extends egret.EventDispatcher {

    getGameConfig(): Promise<any>;

    getGameState(): Promise<any>;

    getGameResult(gameId: number): Promise<any>;

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
        return { nickName: "username" }
    }

    async getGameState() {
        let res = await http.get("/api/game_info_now");
        return res.data as GameStateData;
    }

    async getGameResult(gameId: number) {
        let res = await http.get("/api/game_result", { params: { id: gameId } });
        if (res.data.status === 0) return null;
        let evt = new RemoteEvent(RemoteEvent.GAME_RECEIVED_RESULT);
        evt.data = res.data;
        this.dispatchEvent(evt);
        return res.data;
    }

    async login() {
        if (utils.url.params("usertest")) {
            user_test = utils.url.params("usertest");
        } else {
            await this._login();
        }
    }

    connectSocket(address: string, port: number) {
        this.ws = new egret.WebSocket();
        this.ws.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onSocketData, this);
        this.ws.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.ws.connect(address, port);
    }

    onSocketOpen(): void {
        var cmd = "Hello Egret WebSocket";    
        console.log("连接成功，发送数据：" + cmd);    
        // this.ws.writeUTF(cmd);
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
                evt.data = {
                    game_id: parsed.game_id,
                    lottery_time: parsed.lottery_time,
                    no_betting_time: parsed.no_betting_time
                };
                this.dispatchEvent(evt);
            } else if (parsed.type === "game_result") {
                let game_id = parsed.game_id;
                this.getGameResult(game_id);
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
        if (!loginStatus || loginStatus === "0") {
            let isAuth = utils.cache.get("isAuth");
            if (isAuth === "1") return;
            let callbackUrl = location.href;
            let apiToken = await http.getApiToken();
            let url = Http.URL_BASE + "/api/wechat/auth" +
                "?callback=" + (encodeURIComponent(callbackUrl)) +
                "&token=" + apiToken +
                "&type=mp";
            utils.cache.set("isLogin", "2");
            window.location.href = url;
        } else if (loginStatus === "2") {
            return this.judgeLogin();
        } else {

        }
    }

    private async judgeLogin() {
        try {
            let res = await http.get("/api/judge/logins?usertest=74");
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





