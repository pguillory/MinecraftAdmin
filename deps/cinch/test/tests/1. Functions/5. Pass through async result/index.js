exports.test = function(next, assert) {
    f(function(err, result) {
        assert.is_null(err);
        assert.is_true((result === 5));
        next();
    });
};
function f(__callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    return g(function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        return __callback_2(null, __result_3);
    });
};
function g(callback) {
    return callback(null, 5);
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
