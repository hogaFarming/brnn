class ModalManager extends egret.Sprite {

    private helpModal: Modal;
    private historyModal: Modal;
    private dealerListModal: Modal;

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
}
