exports.test = function(next, assert) {
    pow(2, 3, function(err, result) {
        assert.is_null(err);
        assert.equal(result, 8);
        next();
    });
};
function pow(base, exponent, __callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    var n = 1;
    return zero(function(err, __result_4) {
        if (err) {
            return __callback_2(err)
        };
        var i = __result_4;
        __for_loop_3();
        function __for_loop_3() {
            return less_than(i, exponent, function(err, __result_6) {
                if (err) {
                    return __callback_2(err)
                };
                if (__result_6) {
                    __then_block_7();
                }
                 else {
                    __else_block_8();
                }
            ;
                function __then_block_7() {
                    return multiply(n, base, function(err, __result_9) {
                        if (err) {
                            return __callback_2(err)
                        };
                        n = __result_9;
                        return increment(i, function(err, __result_10) {
                            if (err) {
                                return __callback_2(err)
                            };
                            i = __result_10;
                            setTimeout(__for_loop_3, 0);
                        });
                    });
                };
                function __else_block_8() {
                    __rest_5();
                };
            });
        };
        function __rest_5() {
            return __callback_2(null, n);
        };
    });
};
function zero(callback) {
    return callback(null, 0);
};
function less_than(i, exponent, callback) {
    return callback(null, (i < exponent));
};
function increment(i, callback) {
    return callback(null, (i + 1));
};
function multiply(a, b, callback) {
    return callback(null, (a * b));
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
