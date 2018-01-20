const ChipValMap = {
    10: ["brnn_env.chip_0", 0xdbbc3f],
    100: ["brnn_env.chip_1", 0x589b44],
    500: ["brnn_env.chip_2", 0x20a8a3],
    1000: ["brnn_env.chip_3", 0x2067a9],
    5000: ["brnn_env.chip_4", 0x7b2fad],
    10000: ["brnn_env.chip_5", 0xc92121]
};

class Chip extends egret.Sprite {

    public value: number;
    public disabled: boolean = false;
    public active = false;
    private bitmaps: Array<egret.Bitmap>;
    private txt: egret.TextField;

    constructor(value: number) {
        super();
        this.value = value;
        // this.touchEnabled = true;
        this.bitmaps = this.createBitmaps();
        this.txt = this.createText();
        this.render();
    }

    private createBitmaps(): Array<egret.Bitmap> {
        let txtr: egret.Texture = utils.getRes(ChipValMap[this.value][0]);
        let sheet = new egret.SpriteSheet(txtr);
        let bmNormal = new egret.Bitmap(sheet.createTexture("normal", 10, 13, 100, 100));
        let bmActive = new egret.Bitmap(sheet.createTexture("active", 10, 135, 110, 110));
        bmNormal.fillMode = egret.BitmapFillMode.CLIP;
        bmActive.fillMode = egret.BitmapFillMode.CLIP;
        return [bmNormal, bmActive];
    }

    private createText(): egret.TextField {
        let txt = new egret.TextField();
        txt.textColor = ChipValMap[this.value][1];
        txt.size = 22;
        txt.textAlign = "center";
        txt.verticalAlign = "middle";
        txt.width = 100;
        txt.height = 100;
        txt.text = this.formatValue(this.value);
        return txt;
    }

    public setActive(active: boolean) {
        this.active = active;
        this.render();
    }

    public setDisabled(disabled: boolean) {
        this.disabled = disabled;
        this.render();
    }

    private render() {
        this.removeChildren();
        let bmIndex = this.active ? 1 : this.disabled ? 2 : 0;
        this.txt.height = this.active ? 110 : 100;
        this.addChild(this.bitmaps[bmIndex]);
        this.addChild(this.txt);
    }

    private formatValue(value: number) {
        if (value < 10000) {
            return value + "";
        } else if (value < 1000000) {
            return value / 10000 + "万";
        } else {
            return value / 1000000 + "百万";
        }
    }
}
