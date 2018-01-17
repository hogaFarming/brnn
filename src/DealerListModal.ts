const BeDealerMinLimit = 300000;
const AreaLimit = 2000000;
const PersonLimit = 200000;

class DealerListWindow extends egret.Sprite implements ModalLifeCycle {

    private dealerList: Array<any> = [];
    private spDealerList: egret.Sprite;

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

        this.spDealerList = new egret.Sprite();
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
        this.spDealerList.removeChildren();
        let text = this.dealerList.map(item => {
            return item.apply_name;
        }).join("， ");
        let txt = new egret.TextField();
        txt.x = 0;
        txt.y = 0;
        txt.width = this.width - 20;
        txt.height = this.height - 40;
        txt.text = text;
        txt.textColor = 0xffffff;
        this.spDealerList.addChild(txt);
    }

    public onOpen(): boolean {
        platform.getDealerList().then(result => {
            this.dealerList = result.list;
            this.render();
        });
        return true;
    }
    public onClose(): boolean {
        return true;
    }
}