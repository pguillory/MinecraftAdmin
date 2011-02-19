exports.test = function(next, assert) {
    sum_squares(3, 4, function(err, result) {
        assert.equal(result, (5 * 5));
        next();
    });
};
function sum_squares(a, b, __callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    return square(a, function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        return square(b, function(err, __result_4) {
            if (err) {
                return __callback_2(err)
            };
            return __callback_2(null, (__result_3 + __result_4));
        });
    });
};
function square(x, __callback_5) {
    __callback_5 = (__callback_5 || __throw_1);
    return __callback_5(null, (x * x));
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
