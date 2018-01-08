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
    }

    public openHelpModal(): void {
        console.log("open help modal");
        this.helpModal.open();
    }
}
