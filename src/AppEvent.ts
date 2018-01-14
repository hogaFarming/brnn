class AppEvent extends egret.Event {
    public static BGM_TOGGLE:string = "bgm_toggle";
    public _data: any = null;
    public constructor(type: string, bubbles: boolean = false, cancelable: boolean = false)  {
        super(type, bubbles, cancelable);
    }
}
