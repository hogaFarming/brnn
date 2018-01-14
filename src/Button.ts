class ButtonEvent extends egret.Event {
    public static CLICK:string = "click";
    public constructor(type: string, bubbles: boolean = false, cancelable: boolean = false)  {
        super(type, bubbles, cancelable);
    }
}

class Button extends egret.Sprite {
    static STATE = {
        NORMAL: "normal",
        PRESSED: "pressed",
        HOVER: "hover"
    };

    private state: string;
    private sheet: egret.SpriteSheet;
    private bitmap: egret.Bitmap;

    constructor(sheet: egret.SpriteSheet) {
        super();
        this.sheet = sheet;
        this.init();
    }

    private init(): void {
        this.state = Button.STATE.NORMAL;
        this.bitmap = new egret.Bitmap(this.sheet.getTexture("normal"));
        this.addChild(this.bitmap);

        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
    }

    private onTouchTap(event: egret.Event) {
        app.playEffectSound("ClickSound_wav");
        let clickEvt = new ButtonEvent(ButtonEvent.CLICK);
        this.dispatchEvent(clickEvt);
    }
}
