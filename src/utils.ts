let utils = {
    extends(target: Object, ...sources: any[]): any {
        if (arguments.length <= 1) return target;
        return sources.reduce((result, src) => {
            if (!src) return result;
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
    },
    cache: {
        set(key, value) {
            localStorage.setItem(key, value)
        },
        get(key) {
            return localStorage.getItem(key)
        },
        remove(key) {
            localStorage.removeItem(key)
        },
        clear() {
            localStorage.clear()
        }
    },
    url: {
        params(key?: string): any {
            let result = {};
            let searches = location.search.replace(/^\?/, '').split('&');
            searches.forEach(item => {
                let arr = item.split('=');
                if (arr[0] && arr[1]) {
                    result[arr[0]] = decodeURIComponent(arr[1]);
                }
            })
            if (key) {
                return result[key];
            }
            return result;
        },
        paramUrl(url: string, params: Object = {}): string {
            let searches = [];
            Object.keys(params).forEach(key => {
                searches.push(key + "=" + encodeURIComponent(params[key]));
            });
            if (searches.length) {
                return url + "?" + searches.join("&");
            }
            return url;
        }
    },
    randomNumber(min: number, max: number) {
        let diff = max - min + 1;
        let num = Math.floor(Math.random() * diff);
        return min + num;
    },
    unixTime(unixTime: number): string {
        let date = new Date(unixTime * 1000);
        return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    },
    isNumber(input: string): boolean {
        let num = +input;
        if (isNaN(num)) {
            return false;
        }
        return true;
    },
    coinToFufen(coin: number): number {
        if (!app.game.exchange_rate) return 0;
        return Math.floor(coin * app.game.exchange_rate);
    },
    fufenToCoin(fufen: number): number {
        if (!app.game.exchange_rate) return 0;
        return Math.floor(fufen / app.game.exchange_rate);
    }
};
