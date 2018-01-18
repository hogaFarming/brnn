var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var Timer = (function () {
    function Timer(callback, completeCallback, interval, repeat) {
        if (repeat === void 0) { repeat = 0; }
        var _this = this;
        this.callback = function () { };
        this.interval = 500;
        this.repeat = 0;
        this.isInifitial = false;
        this.intervalId = 0;
        this.callback = callback;
        this.interval = interval;
        this.repeat = repeat;
        this.completeCallback = completeCallback;
        if (repeat === 0) {
            this.isInifitial = true;
        }
        this.intervalId = setInterval(function () {
            _this.tick();
        }, interval);
    }
    Timer.prototype.tick = function () {
        this.callback();
        this.repeat -= 1;
        if (!this.repeat && !this.isInifitial) {
            clearInterval(this.intervalId);
            this.completeCallback && this.completeCallback();
        }
    };
    return Timer;
}());
__reflect(Timer.prototype, "Timer");
//# sourceMappingURL=Timer.js.map