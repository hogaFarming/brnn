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
var QubiWindow = (function (_super) {
    __extends(QubiWindow, _super);
    function QubiWindow() {
        var _this = _super.call(this) || this;
        _this.init();
        return _this;
    }
    QubiWindow.prototype.init = function () {
        this.width = 573;
        this.height = 382;
        var bg = new egret.Bitmap(utils.getRes("brnn_qubi.qubiBG"));
        this.addChild(bg);
        var title = new egret.TextField();
        title.text = "取币";
        title.y = 20;
        title.width = 573;
        title.size = 30;
        title.textAlign = "center";
        this.addChild(title);
        var tips = this.txtTips = new egret.TextField();
        tips.width = 420;
        tips.x = 80;
        tips.y = 100;
        tips.textAlign = "center";
        tips.size = 22;
        tips.lineSpacing = 8;
        this.addChild(tips);
        var inputBG = new egret.Bitmap(utils.getRes("brnn_qubi.inputBG"));
        inputBG.width = 418;
        inputBG.height = 50;
        inputBG.x = 75;
        inputBG.y = 160;
        this.addChild(inputBG);
        var txInput = this.txtInput = new egret.TextField();
        txInput.type = egret.TextFieldType.INPUT;
        txInput.width = 410;
        txInput.height = 50;
        txInput.x = 78;
        txInput.y = 160;
        txInput.textColor = 0xffffff;
        txInput.verticalAlign = "middle";
        txInput.addEventListener(egret.Event.CHANGE, this.onInputChange, this);
        this.addChild(txInput);
        this.txtResult = new egret.TextField();
        this.txtResult.text = "";
        this.txtResult.textColor = 0xff0000;
        this.txtResult.x = 75;
        this.txtResult.y = 230;
        this.txtResult.size = 24;
        this.txtResult.width = 420;
        this.txtResult.textAlign = "center";
        this.addChild(this.txtResult);
        this.confirmBtn = new ButtonFactory().createButton(ButtonModels.QubiConfirmBtn);
        this.confirmBtn.x = 214;
        this.confirmBtn.y = 300;
        this.confirmBtn.addEventListener(ButtonEvent.CLICK, this.handleConfirm, this);
        this.addChild(this.confirmBtn);
    };
    QubiWindow.prototype.handleConfirm = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var amount, res, gameConfig, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.checkInput())
                            return [2 /*return*/];
                        amount = +this.txtInput.text;
                        if (!amount)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, platform.exchangeCoin(amount, 0)];
                    case 2:
                        res = _a.sent();
                        new Dialog("兑换成功", function () {
                            app.modalManager.qubiModal.close();
                        });
                        return [4 /*yield*/, platform.getGameConfig(false)];
                    case 3:
                        gameConfig = _a.sent();
                        app.game.coin_num = gameConfig.coin_num;
                        app.game.fufen_num = gameConfig.fufen_num;
                        app.mainBoard.setMoney(gameConfig.coin_num);
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        new Dialog(e_1.message || "兑换失败");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    QubiWindow.prototype.onInputChange = function (e) {
        var tx = e.target;
        var str = tx.text;
        if (!str) {
            this.txtResult.text = "";
            return;
        }
        var msg = this.checkInput();
        if (msg) {
            this.txtResult.text = msg;
            return;
        }
        var amount = +str;
        this.txtResult.text = "兑换成" + utils.fufenToCoin(amount) + "筹码";
    };
    QubiWindow.prototype.checkInput = function () {
        var str = this.txtInput.text;
        if (!utils.isNumber(str))
            return "请输入数字";
        if (/\./.test(str))
            return "请输入大于0的整数";
        if (+str < 0)
            return "请输入大于0的整数";
        return "";
    };
    QubiWindow.prototype.onOpen = function () {
        this.txtTips.text = "1积分可兑换" + app.game.exchange_rate + "筹码，输入您要兑换的积分 您的积分：" + app.game.fufen_num;
        this.txtInput.text = "";
        this.txtResult.text = "";
        return true;
    };
    QubiWindow.prototype.onClose = function () {
        return true;
    };
    return QubiWindow;
}(egret.Sprite));
__reflect(QubiWindow.prototype, "QubiWindow", ["ModalLifeCycle"]);
//# sourceMappingURL=QubiWindow.js.map