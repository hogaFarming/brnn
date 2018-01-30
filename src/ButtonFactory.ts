type TxtrArea = {
    x?: number;
    y?: number;
    w?: number;
    h?: number;
}
type ButtonModel = {
    resName: string;
    normal: TxtrArea;
    hover: TxtrArea;
    pressed: TxtrArea;
}

const ButtonModels = {
    HistoryButton: {
        resName: "brnn_env.historyBtn",
        normal: { x: 0, y: 2, h: 89 },
        hover: { x: 0, y: 93, h: 89 },
        pressed: { x: 0, y: 180, h: 89 }
    },
    DealerListButton: {
        resName: "brnn_env.dealerList",
        normal: { x: 0, y: 2, h: 98 },
        hover: { x: 0, y: 98, h: 98 },
        pressed: { x: 0, y: 200, h: 98 }
    },
    BeDealerButton: {
        resName: "brnn_env.beDealer",
        normal: { x: 0, y: 2, h: 98 },
        hover: { x: 0, y: 98, h: 98 },
        pressed: { x: 0, y: 200, h: 98 }
    },
    BePlayerButton: {
        resName: "brnn_env.bePlayer",
        normal: { x: 0, y: 2, h: 98 },
        hover: { x: 0, y: 98, h: 98 },
        pressed: { x: 0, y: 200, h: 98 }
    },
    BackButton: {
        resName: "brnn_env.backBtn",
        normal: { x: 0, y: 2, h: 80 },
        hover: { x: 0, y: 81, h: 80 },
        pressed: { x: 0, y: 162, h: 80 }
    },
    SoundButtonA: {
        resName: "brnn_env.soundBtnA",
        normal: { x: 0, y: 2, h: 80 },
        hover: { x: 0, y: 81, h: 80 },
        pressed: { x: 0, y: 162, h: 80 }
    },
    SoundButtonB: {
        resName: "brnn_env.soundBtnB",
        normal: { x: 0, y: 2, h: 80 },
        hover: { x: 0, y: 81, h: 80 },
        pressed: { x: 0, y: 162, h: 80 }
    },
    HelpButton: {
        resName: "brnn_env.helpBtn",
        normal: { x: 0, y: 2, h: 80 },
        hover: { x: 0, y: 81, h: 80 },
        pressed: { x: 0, y: 162, h: 80 }
    },
    CloseBtn: {
        resName: "brnn_cards.quit",
        normal: { x: 0, y: 4, h: 57 },
        hover: { x: 0, y: 61, h: 61 },
        pressed: { x: 0, y: 129, h: 52 }
    },
    HistoryPrevBtn: {
        resName: "brnn_cards.historyBtn1",
        normal: { x: 0, y: 0, h: 108 },
        hover: { x: 0, y: 113, h: 114 },
        pressed: { x: 0, y: 235, h: 102 }
    },
    HistoryPrevDisabledBtn: {
        resName: "brnn_cards.historyBtn2",
        normal: { x: 0, y: 0, h: 108 },
        hover: { x: 0, y: 113, h: 114 },
        pressed: { x: 0, y: 235, h: 102 }
    },
    HistoryNextBtn: {
        resName: "brnn_cards.historyBtn1",
        normal: { x: 0, y: 0, h: 108 },
        hover: { x: 0, y: 113, h: 114 },
        pressed: { x: 0, y: 235, h: 102 }
    },
    HistoryNextDisabledBtn: {
        resName: "brnn_cards.historyBtn2",
        normal: { x: 0, y: 0, h: 108 },
        hover: { x: 0, y: 113, h: 114 },
        pressed: { x: 0, y: 235, h: 102 }
    },
    ConfirmBtn: {
        resName: "brnn_env.but_determine",
        normal: { x: 0, y: 1, h: 50 },
        hover: { x: 0, y: 54, h: 52 },
        pressed: { x: 0, y: 110, h: 50 }
    },
    QubiBtn: {
        resName: "brnn_qubi.qubiBtn",
        normal: { x: 0, y: 0, h: 51 },
        hover: { x: 0, y: 0, h: 51 },
        pressed: { x: 0, y: 0, h: 51 }
    },
    DuihuanBtn: {
        resName: "brnn_qubi.duihuanBtn",
        normal: { x: 0, y: 0, h: 51 },
        hover: { x: 0, y: 0, h: 51 },
        pressed: { x: 0, y: 0, h: 51 }
    },
    QubiConfirmBtn: {
        resName: "brnn_qubi.confirmBtn2",
        normal: { x: 0, y: 0, h: 50 },
        hover: { x: 0, y: 0, h: 50 },
        pressed: { x: 0, y: 0, h: 50 }
    },
    DuihuanConfirmBtn: {
        resName: "brnn_qubi.confirmBtn",
        normal: { x: 0, y: 0, h: 50 },
        hover: { x: 0, y: 0, h: 50 },
        pressed: { x: 0, y: 0, h: 50 }
    }
};

let globalButtonFactory = null;

class ButtonFactory {
    constructor() {
        if (globalButtonFactory) return globalButtonFactory;
    }

    public createButton(model: ButtonModel): Button {
        let txtr: egret.Texture = this.getRes(model.resName);
        let sheet = new egret.SpriteSheet(txtr);
        Object.keys(model).forEach(key => {
            if (key === "resName") return;
            let txtrArea = model[key];
            sheet.createTexture(key, txtrArea.x || 0, txtrArea.y || 0, txtrArea.w || txtr.textureWidth, txtrArea.h || txtr.textureHeight);
        });
        let btn = new Button(sheet);
        return btn;
    }

    private getRes(name: string): egret.Texture {
        let arr = name.split('.');
        if (arr.length === 1) {
            return RES.getRes(name);
        } else {
            return RES.getRes(arr[0]).getTexture(arr[1]);
        }
    }
}
