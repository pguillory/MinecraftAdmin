exports.test = function(next, assert) {
    f(function(err, result) {
        assert.equal(result, 5);
        assert.is_true(g_called);
        next();
    });
};
function f(__callback_2) {
    __callback_2 = (__callback_2 || __throw_1);
    __try_block_3();
    function __try_block_3() {
        var __main_callback_7 = __callback_2;
        var __callback_2 = function(err, result) {
            (err ? __catch_block_4 : __main_callback_7)(err, result);
        };
        g(function(err) {
            if (err) {
                return __callback_2(err)
            };
            __rest_block_6();
        });
    };
    function __catch_block_4(err) {
        return __callback_2(err);
    };
    function __rest_block_6() {
        return __callback_2(null, 5);
    };
};
var g_called = false;
function g(__callback_8) {
    __callback_8 = (__callback_8 || __throw_1);
    g_called = true;
    return __callback_8(null);
};
function __throw_1(err) {
    if (err) {
        throw err;
    }
;
};
