var utils = {
    extends: function (target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        if (arguments.length <= 1)
            return target;
        return sources.reduce(function (result, src) {
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
    }
};
//# sourceMappingURL=utils.js.map