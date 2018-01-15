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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var user_test = "";
var RemoteEvent = (function (_super) {
    __extends(RemoteEvent, _super);
    function RemoteEvent(type, bubbles, cancelable) {
        if (bubbles === void 0) { bubbles = false; }
        if (cancelable === void 0) { cancelable = false; }
        return _super.call(this, type, bubbles, cancelable) || this;
    }
    RemoteEvent.BET = "bet";
    RemoteEvent.GAME_CREATE = "game_create";
    RemoteEvent.GAME_RECEIVED_RESULT = "game_received_result";
    return RemoteEvent;
}(egret.Event));
__reflect(RemoteEvent.prototype, "RemoteEvent");
var WeixinPlatform = (function (_super) {
    __extends(WeixinPlatform, _super);
    function WeixinPlatform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WeixinPlatform.prototype.getGameConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, http.get("/api/gameinfo_niuniu")];
                    case 1:
                        res = _a.sent();
                        config = res.data.config;
                        this.connectSocket(config.ip, config.port);
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    WeixinPlatform.prototype.getGameState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, http.get("/api/game_info_now")];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    WeixinPlatform.prototype.getGameResult = function (gameId) {
        return __awaiter(this, void 0, void 0, function () {
            var res, evt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("get game result... ");
                        return [4 /*yield*/, http.get("/api/game_result", { params: { id: gameId } })];
                    case 1:
                        res = _a.sent();
                        if (res.data.status === 0)
                            return [2 /*return*/, null];
                        evt = new RemoteEvent(RemoteEvent.GAME_RECEIVED_RESULT);
                        evt.data = res.data;
                        this.dispatchEvent(evt);
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    WeixinPlatform.prototype.bet = function (gameId, amount, playerIdx) {
        return __awaiter(this, void 0, void 0, function () {
            var chipTypeMap, res, evt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chipTypeMap = {
                            1000: 0,
                            5000: 1,
                            10000: 2,
                            100000: 3,
                            500000: 4,
                            1000000: 5
                        };
                        return [4 /*yield*/, http.post("/api/betting", {
                                data: {
                                    game_id: gameId,
                                    chip_type: chipTypeMap[amount],
                                    betting_type: playerIdx - 1
                                }
                            })];
                    case 1:
                        res = _a.sent();
                        if (res.status) {
                            evt = new RemoteEvent(RemoteEvent.BET);
                            evt.data = {
                                amount: amount,
                                playerIdx: playerIdx
                            };
                            this.dispatchEvent(evt);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    WeixinPlatform.prototype.getHistory = function (gameId) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, http.get("/api/game_history", { params: { id: gameId } })];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    WeixinPlatform.prototype.login = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!utils.url.params("usertest")) return [3 /*break*/, 1];
                        user_test = utils.url.params("usertest");
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this._login()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WeixinPlatform.prototype.connectSocket = function (address, port) {
        this.ws = new egret.WebSocket();
        this.ws.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onSocketData, this);
        this.ws.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.ws.connect(address, port);
    };
    WeixinPlatform.prototype.onSocketOpen = function () {
        var cmd = "Hello Egret WebSocket";
        console.log("连接成功，发送数据：" + cmd);
        // this.ws.writeUTF(cmd);
    };
    WeixinPlatform.prototype.onSocketData = function (e) {
        var msg = this.ws.readUTF();
        try {
            var parsed = JSON.parse(msg);
            if (parsed.type === "connection") {
                var clientId = parsed.data;
                this.bindSocket(clientId);
            }
            else if (parsed.type === "game_create") {
                var evt = new RemoteEvent(RemoteEvent.GAME_CREATE);
                evt.data = {
                    game_id: parsed.game_id,
                    lottery_time: parsed.lottery_time,
                    no_betting_time: parsed.no_betting_time
                };
                this.dispatchEvent(evt);
            }
            else if (parsed.type === "game_result") {
                this.getGameResult(parsed.id);
            }
            else if (parsed.type === "game_balance") {
                this.getGameResult(parsed.id);
            }
        }
        catch (e) {
            console.error("解析socket数据出错, ", msg);
        }
    };
    WeixinPlatform.prototype.bindSocket = function (clientId) {
        var data = {
            client_id: clientId,
            type: 1 // 游戏类型（0\|推币机，1\|牛牛）
        };
        var res = http.post("/api/bind", { data: data });
    };
    WeixinPlatform.prototype._login = function () {
        return __awaiter(this, void 0, void 0, function () {
            var loginStatus, isAuth, callbackUrl, apiToken, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginStatus = utils.cache.get("isLogin");
                        if (!(!loginStatus || loginStatus === "0")) return [3 /*break*/, 2];
                        isAuth = utils.cache.get("isAuth");
                        if (isAuth === "1")
                            return [2 /*return*/];
                        callbackUrl = location.href;
                        return [4 /*yield*/, http.getApiToken()];
                    case 1:
                        apiToken = _a.sent();
                        url = Http.URL_BASE + "/api/wechat/auth" +
                            "?callback=" + (encodeURIComponent(callbackUrl)) +
                            "&token=" + apiToken +
                            "&type=mp";
                        utils.cache.set("isLogin", "2");
                        window.location.href = url;
                        return [3 /*break*/, 3];
                    case 2:
                        if (loginStatus === "2") {
                            return [2 /*return*/, this.judgeLogin()];
                        }
                        else {
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WeixinPlatform.prototype.judgeLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 9]);
                        return [4 /*yield*/, http.get("/api/judge/logins?usertest=74")];
                    case 1:
                        res = _a.sent();
                        if (!(res.data.is_auth === 1 && res.data.is_user === 0)) return [3 /*break*/, 2];
                        utils.cache.set("isLogin", "0");
                        utils.cache.set("isAuth", "1");
                        // TODO
                        console.error("已通过微信认证，但是未登录？");
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(res.data.is_auth === 0)) return [3 /*break*/, 4];
                        utils.cache.set("isAuth", "0");
                        utils.cache.set("isLogin", "0");
                        return [4 /*yield*/, this._login()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        if (!(res.data.is_auth === 1 && res.data.is_user === 1)) return [3 /*break*/, 6];
                        utils.cache.set("isAuth", "1");
                        utils.cache.set("isLogin", "1");
                        return [4 /*yield*/, this._login()];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1 = _a.sent();
                        utils.cache.set("isAuth", "0");
                        utils.cache.set("isLogin", "0");
                        return [4 /*yield*/, this._login()];
                    case 8: return [2 /*return*/, _a.sent()];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return WeixinPlatform;
}(egret.EventDispatcher));
__reflect(WeixinPlatform.prototype, "WeixinPlatform", ["Platform"]);
if (!window.platform) {
    window.platform = new WeixinPlatform();
}
//# sourceMappingURL=Platform.js.map