class ModalManager extends egret.Sprite {

    public helpModal: Modal;
    public historyModal: Modal;
    public dealerListModal: Modal;
    public qubiModal: Modal;
    public duihuanModal: Modal;

    constructor() {
        super();
        this.createModals();
    }

    private createModals(): void {
        this.helpModal = new Modal(new HelpWindow());
        this.addChild(this.helpModal);
        this.historyModal = new Modal(new HistoryWindow());
        this.addChild(this.historyModal);
        this.dealerListModal = new Modal(new DealerListWindow());
        this.addChild(this.dealerListModal);
        this.qubiModal = new Modal(new QubiWindow());
        this.addChild(this.qubiModal);
        this.duihuanModal = new Modal(new DuihuanWindow());
        this.addChild(this.duihuanModal);
    }

    public openHelpModal(): void {
        console.log("open help modal");
        this.helpModal.open();
    }

    public openHistoryModal(): void {
        console.log("open historyModal");
        this.historyModal.open();
    }

    public openDealerListModal(): void {
        console.log("open historyModal");
        this.dealerListModal.open();
    }

    public openQubiModal(): void {
        this.qubiModal.open();
    }

    public openDuihuanModal(): void {
        this.duihuanModal.open();
    }
}
