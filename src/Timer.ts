class Timer {

    private callback: Function = () => {};
    private completeCallback: Function;
    private interval: number = 500;
    private repeat: number = 0;
    private isInifitial: boolean = false;
    private intervalId: number = 0;

    constructor(callback: Function, completeCallback: Function, interval: number, repeat: number = 0) {
        this.callback = callback;
        this.interval = interval;
        this.repeat = repeat;
        this.completeCallback = completeCallback;
        if (repeat === 0) {
            this.isInifitial = true;
        }
        this.intervalId = setInterval(() => {
            this.tick();
        }, interval);
    }

    public tick() {
        this.callback();
        this.repeat -= 1;
        if (!this.repeat && !this.isInifitial) {
            clearInterval(this.intervalId);
            this.completeCallback && this.completeCallback();
        }
    }
}
