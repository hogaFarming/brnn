const BeDealerMinLimit = 50000000;
const AreaLimit = 200000000;
const PersonLimit = 20000000;

class DealerListWindow extends egret.Sprite implements ModalLifeCycle {

    constructor() {
        super();
        this.width = 594;
        this.height = 397;
        this.init();
    }

    private init(): void {
        let bg = new egret.Bitmap(utils.getRes("brnn_env.bookiesList"));
        this.addChild(bg);
        let factory = new ButtonFactory();

        this.addTxt(BeDealerMinLimit + "", 62, 358);
        this.addTxt(AreaLimit + "", 250, 358);
        this.addTxt(PersonLimit + "", 452, 358);
    }

    private addTxt(text: string, x: number, y: number): void {
        let txt1 = new egret.TextField();
        txt1.text = text;
        txt1.x = x;
        txt1.y = y;
        txt1.size = 18;
        txt1.textColor = 0xd8b205;
        this.addChild(txt1);
    }

    private render(): void {
        
    }

    public onOpen(): boolean {
        this.render();
        return true;
    }
    public onClose(): boolean {
        return true;
    }
}