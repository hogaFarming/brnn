interface ModalConfig {

}

interface ModalLifeCycle extends egret.Sprite {
    onOpen(): boolean;
    onClose(): boolean;
}

/**
 * 模态窗
 */
class Modal extends egret.Sprite {

    static ModalDeaultConfig: ModalConfig = {};

    private wind: ModalLifeCycle;
    private config: ModalConfig;
    private closeBtn: Button;

    constructor(wind: ModalLifeCycle, conf: ModalConfig = {}) {
        super();
        this.wind = wind;
        this.config = utils.extends(Modal.ModalDeaultConfig, conf);
        this.init();
    }

    private init(): void {
        this.visible = false;

        let blackBG = new egret.Bitmap(utils.getRes("blackBG_png"));
        this.addChild(blackBG);
        blackBG.touchEnabled = true;

        this.wind.x = (1280 - this.wind.width) / 2;
        this.wind.y = (720 - this.wind.height) / 2;
        this.addChild(this.wind);

        this.closeBtn = new ButtonFactory().createButton(ButtonModels.CloseBtn);
        this.closeBtn.x = this.wind.width - this.closeBtn.width - 15;
        this.closeBtn.y = 15;
        this.closeBtn.addEventListener(ButtonEvent.CLICK, this.onCloseClick, this);
        this.wind.addChild(this.closeBtn);
    }

    private onCloseClick(): void {
        this.close();
    }

    public close(): void {
        this.wind.onClose();
        this.visible = false;
    }

    public open(): void {
        this.wind.onOpen();
        this.visible = true;
    }
}
