exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 6);
        next();
    });
};
function f(__callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    return g(function(err, __result_3) {
        if (err) {
            return __callback_2(err)
        };
        if ((__result_3 === 5)) {
            __then_block_4();
        }
         else {
            __rest_block_5();
        }
    ;
        function __then_block_4() {
            return __callback_2(null, 6);
        };
        function __rest_block_5() {
            return __callback_2(null);
        };
    });
};
function g(__callback_6) {
    __callback_6 = (__callback_6 || __throw_1);
    return __callback_6(null, 5);
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
