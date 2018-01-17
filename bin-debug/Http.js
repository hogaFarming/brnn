var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
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
var http_api_token = "";
var Http = (function () {
    function Http() {
    }
    Http.prototype.getApiToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (http_api_token)
                            return [2 /*return*/, http_api_token];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._request("/api/init")];
                    case 2:
                        result = _a.sent();
                        http_api_token = result.token;
                        console.log("http_api_token: " + http_api_token);
                        return [2 /*return*/, http_api_token];
                    case 3:
                        e_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Http.prototype.get = function (url, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._request(url, utils.extends({}, { method: "get" }, options))];
            });
        });
    };
    Http.prototype.post = function (url, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._request(url, utils.extends({}, { method: "post" }, options))];
            });
        });
    };
    Http.prototype._request = function (url, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var opts, headers, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        opts = utils.extends({}, Http.DEFAULT_HTTP_OPTIONS, options);
                        headers = utils.extends({}, Http.DEFAULT_HTTP_HEADERS, opts.headers || {});
                        if (!(url === "/api/init")) return [3 /*break*/, 1];
                        return [3 /*break*/, 3];
                    case 1:
                        _a = headers;
                        return [4 /*yield*/, this.getApiToken()];
                    case 2:
                        _a.Authorization = _b.sent();
                        headers["X-ISAPI"] = 1;
                        _b.label = 3;
                    case 3: return [2 /*return*/, new Promise(function (resolve, reject) {
                            var request = new egret.HttpRequest();
                            request.responseType = egret.HttpResponseType.TEXT;
                            var _params = opts.params;
                            if (user_test) {
                                _params = utils.extends({}, _params, { usertest: user_test });
                            }
                            var _url = utils.url.paramUrl(Http.URL_BASE + url, _params);
                            var method = opts.method === "get" ? egret.HttpMethod.GET : egret.HttpMethod.POST;
                            request.open(_url, method);
                            Object.keys(headers).forEach(function (key) {
                                request.setRequestHeader(key, headers[key]);
                            });
                            if (opts.data) {
                                // let _data = [];
                                // Object.keys(opts.data).forEach(key => {
                                //     _data.push(key + "=" + opts.data[key]);
                                // });
                                // let strData = _data.join("&");
                                request.setRequestHeader("Content-Type", "application/json");
                                request.send(JSON.stringify(opts.data));
                            }
                            else {
                                request.send();
                            }
                            request.addEventListener(egret.Event.COMPLETE, function (event) {
                                try {
                                    var req = event.currentTarget;
                                    var res = JSON.parse(req.response);
                                    resolve(res);
                                }
                                catch (e) {
                                    reject(e);
                                }
                            }, _this);
                            request.addEventListener(egret.IOErrorEvent.IO_ERROR, function (event) {
                                console.log("http get error", event);
                                reject(event);
                            }, _this);
                        })];
                }
            });
        });
    };
    Http.URL_BASE = "http://120.79.21.200";
    Http.DEFAULT_HTTP_OPTIONS = {
        method: "get"
    };
    Http.DEFAULT_HTTP_HEADERS = {
        "Content-Type": "application/x-www-form-urlencoded"
    };
    return Http;
}());
__reflect(Http.prototype, "Http");
var http = new Http();
