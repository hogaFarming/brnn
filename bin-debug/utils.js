var utils = {
    extends: function (target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        if (arguments.length <= 1)
            return target;
        return sources.reduce(function (result, src) {
            if (!src)
                return result;
            Object.keys(src).forEach(function (key) {
                result[key] = src[key];
            });
            return result;
        }, target);
    },
    getRes: function (name) {
        var arr = name.split('.');
        if (arr.length === 1) {
            return RES.getRes(name);
        }
        else {
            return RES.getRes(arr[0]).getTexture(arr[1]);
        }
    },
    cache: {
        set: function (key, value) {
            localStorage.setItem(key, value);
        },
        get: function (key) {
            return localStorage.getItem(key);
        },
        remove: function (key) {
            localStorage.removeItem(key);
        },
        clear: function () {
            localStorage.clear();
        }
    },
    url: {
        params: function (key) {
            var result = {};
            var searches = location.search.replace(/^\?/, '').split('&');
            searches.forEach(function (item) {
                var arr = item.split('=');
                if (arr[0] && arr[1]) {
                    result[arr[0]] = decodeURIComponent(arr[1]);
                }
            });
            if (key) {
                return result[key];
            }
            return result;
        },
        paramUrl: function (url, params) {
            if (params === void 0) { params = {}; }
            var searches = [];
            Object.keys(params).forEach(function (key) {
                searches.push(key + "=" + encodeURIComponent(params[key]));
            });
            if (searches.length) {
                return url + "?" + searches.join("&");
            }
            return url;
        }
    },
    randomNumber: function (min, max) {
        var diff = max - min + 1;
        var num = Math.floor(Math.random() * diff);
        return min + num;
    },
    unixTime: function (unixTime) {
        var date = new Date(unixTime * 1000);
        return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    }
};
//# sourceMappingURL=utils.js.map