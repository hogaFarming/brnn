let utils = {
    extends(target: Object, ...sources: any[]): any {
        if (arguments.length <= 1) return target;
        return sources.reduce((result, src) => {
            Object.keys(src).forEach(key => {
                result[key] = src[key];
            });
            return result;
        }, target);
    },
    getRes(name: string): egret.Texture {
        let arr = name.split('.');
        if (arr.length === 1) {
            return RES.getRes(name);
        } else {
            return RES.getRes(arr[0]).getTexture(arr[1]);
        }
    }
};
