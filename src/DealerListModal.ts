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

        this.addTxt(BeDealerMinLimit + "", 70, 358);
        this.addTxt(AreaLimit + "", 260, 358);
        this.addTxt(PersonLimit + "", 460, 358);

        this.spDealerList = new egret.Sprite();
        this.addChild(this.spDealerList);
        this.spDealerList.x = 28;
        this.spDealerList.y = 90;
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
            return item.apply_name + "（" + item.banker_coin + "）";
        }).join("，");
        let txt = new egret.TextField();
        txt.width = 540;
        txt.height = 200;
        txt.size = 26;
        txt.text = text;
        txt.textColor = 0xffffff;
        this.spDealerList.addChild(txt);
    }

    public onOpen(): boolean {
        platform.getDealerList().then(result => {
            this.dealerList = result;
            this.render();
        });
        return true;
    }
    public onClose(): boolean {
        return true;
    }
}