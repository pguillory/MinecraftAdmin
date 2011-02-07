$(document).ready(function(){
	var module = QUnit.module;
	var transform = Streamline.transform;
	
	module("generation");
	
	function clean(s){
		return s.replace(/[\n\t ]/g, '');
	}
	
	function genTest(f1, f2){
		var s1 = clean(transform(f1.toString(), {
			noHelpers: true
		}));
		var s2 = clean(f2.toString()) + ";";
		if (s1 !== s2) {
			console.log("transformed=" + s1);
			console.log("expected   =" + s2);
		}
		strictEqual(s1, s2);
	}
	
	test("basic", 1, function(){
		genTest(function f_(){
			f1_();
			f2();
		}, function f(_){
			var __ = _;
			return f1(__cb(_, function(){
				f2();
				return __();
			}));
		});
	});
	
	test("var return", 1, function(){
		genTest(function f_(){
			var x = f1_();
			f2();
			return x;
		}, function f(_){
			var __ = _;
			return f1(__cb(_, function(__1){
				var x = __1;
				f2();
				return _(null, x);
			}));
		});
	});
	
	test("return", 1, function(){
		genTest(function f_(){
			f1();
			return f2_();
		}, function f(_){
			var __ = _;
			f1();
			return f2(__cb(_, function(__1){
				return _(null, __1);
			}));
		});
	});
	
	test("if", 1, function(){
		genTest(function f_(b){
			f1();
			if (b) {
				f2();
				f3_();
				f4();
			}
			f5();
		}, function f(b, _){
			var __ = _;
			f1();
			return (function(__){
				if (b) {
					f2();
					return f3(__cb(_, function(){
						f4();
						return __();
					}));
				};
				return __();
			})(function(){
				f5();
				return __();
			});
		});
	});
	
	test("if else", 1, function(){
		genTest(function f_(b){
			f1();
			if (b) {
				f2();
				f3_();
				f4();
			}
			else {
				f5();
				f6_();
				f7();
			}
			f8();
		}, function f(b, _){
			var __ = _;
			f1();
			return (function(__){
				if (b) {
					f2();
					return f3(__cb(_, function(){
						f4();
						return __();
					}));
				}
				else {
					f5();
					return f6(__cb(_, function(){
						f7();
						return __();
					}));
				};
							})(function(){
				f8();
				return __();
			});
		});
	});
	
	test("if else 2", 1, function(){
		genTest(function f_(b){
			f1();
			if (b) {
				f2();
				f3_();
				f4();
				return 1;
			}
			else {
				f5();
			}
			f6();
			return 2;
		}, function f(b, _){
			var __ = _;
			f1();
			return (function(__){
				if (b) {
					f2();
					return f3(__cb(_, function(){
						f4();
						return _(null, 1);
					}));
				}
				else {
					f5();
				};
				return __();
			})(function(){
				f6();
				return _(null, 2);
			});
		});
	});
	
	test("each", 1, function(){
		genTest(function f_(arr){
			f1();
			each_(arr, function _(elt){
				f2_(elt);
				f3();
			})
			f4();
		}, function f(arr, _){
			var __ = _;
			f1();
			return each(arr, function(elt, _){
				var __ = _;
				return f2(elt, __cb(_, function(){
					f3();
					return __();
				}));
			}, __cb(_, function(){
				f4();
				return __();
			}));
		});
	});
	
	test("while", 1, function(){
		genTest(function f_(){
			f1();
			while (cond) {
				f2_();
				f3();
			}
			f4();
		}, function f(_){
			var __ = _;
			f1();
			{
				return (function(__break){
					return (function __loop(){
						var __ = __loop;
						if (cond) {
							return f2(__cb(_, function(){
								f3();
								return __();
							}));
						}
						else {
							return __break();
						};
											})();
				})(function(){
					f4();
					return __();
				});
			};
					});
	});
	
	test("do while", 1, function(){
		genTest(function f_(){
			f1();
			do {
				f2_();
				f3();
			}
			while (cond);
			f4();
		}, function f(_){
			var __ = _;
			f1();
			var __1 = true;
			{
				return (function(__break){
					return (function __loop(){
						var __ = __loop;
						if ((__1 || cond)) {
							__1 = false;
							return f2(__cb(_, function(){
								f3();
								return __();
							}));
						}
						else {
							return __break();
						};
											})();
				})(function(){
					f4();
					return __();
				});
			};
			
					});
	});
	
	test("for", 1, function(){
		genTest(function f_(arr){
			f1();
			for (var i = 0; i < arr.length; i++) {
				f2_();
				f3();
			}
			f4();
		}, function f(arr, _){
			var __ = _;
			f1();
			var i = 0;
			{
				var __2 = false;
				return (function(__break){
					return (function __loop(){
						var __ = __loop;
						if (__2) {
							i++;
						}
						else {
							__2 = true;
						};
						if ((i < arr.length)) {
							return f2(__cb(_, function(){
								f3();
								return __();
							}));
						}
						else {
							return __break();
						};
											})();
				})(function(){
					f4();
					return __();
				});
			};
					})
	})
	
	test("for in", 1, function(){
		genTest(function f_(){
			f1();
			for (var k in obj) {
				f2_(k);
				f3(k);
			}
			f4();
		}, function f(_){
			var __ = _;
			f1();
			var __1 = [];
			for (var __2 in obj) {
				__1.push(__2);
			};
			var __3 = 0;
			{
				return (function(__break){
					return (function __loop(){
						var __ = __loop;
						if ((__3 < __1.length)) {
							var k = __1[__3++];
							return f2(k, __cb(_, function(){
								f3(k);
								return __();
							}));
						}
						else {
							return __break();
						};
											})();
				})(function(){
					f4();
					return __();
				});
			};
					});
	})
	
	test("switch", 1, function(){
		genTest(function f_(){
			f1();
			switch (exp) {
				case 'a':
					f2_();
					f3();
					break;
				case 'b':
				case 'c':
					f4();
					f5_();
					break;
				default:
					f6();
					break;
			}
			f7();
		}, function f(_){
			var __ = _;
			f1();
			return (function(__){
				var __break = __;
				switch (exp) {
					case "a":
						return f2(__cb(_, function(){
							f3();
							return __break();
						}));
					case "b":
						
					case "c":
						f4();
						return f5(__cb(_, function(){
							return __break();
						}));
					default:
						f6();
						return __break();
				};
				return __();
			})(function(){
				f7();
				return __();
			});
		});
	})
	
	test("nested switch", 1, function(){
		genTest(function f_(){
			switch (exp) {
				case 'a':
					f2_();
					switch (exp2) {
						case "b":
							break;
					}
					break;
			}
		}, function f(_){
			var __ = _;
			return (function(__){
				var __break = __;
				switch (exp) {
					case "a":
						return f2(__cb(_, function(){
							switch (exp2) {
								case "b":
									break;
							};
							return __break();
						}));
				};
				return __();
			})(function(){
				return __();
			});
		});
	})
	
	test("nested calls", 1, function(){
		genTest(function f_(){
			f1();
			f2_(f3_(f4_()), f5_(f6()));
			f7();
		}, function f(_){
			var __ = _;
			f1();
			return f4(__cb(_, function(__1){
				return f3(__1, __cb(_, function(__2){
					return f5(f6(), __cb(_, function(__3){
						return f2(__2, __3, __cb(_, function(){
							f7();
							return __();
						}));
					}));
				}));
			}));
		});
	})
	
	test("async while condition", 1, function(){
		genTest(function f_(){
			f1();
			while (f2_()) 
				f3();
			f4();
		}, function f(_){
			var __ = _;
			f1();
			{
				return (function(__break){
					return (function __loop(){
						var __ = __loop;
						return f2(__cb(_, function(__1){
							if (__1) {
								f3();
							}
							else {
								return __break();
							};
							return __();
						}));
					})();
				})(function(){
					f4();
					return __();
				});
			};
					})
	})
	
	test("try catch", 1, function(){
		genTest(function f_(){
			f1();
			try {
				f2();
				f3_();
				f4();
			} 
			catch (ex) {
				f5();
				f6_();
				f7();
			}
			f8();
		}, function f(_){
			var __ = _;
			f1();
			return (function(__){
				return (function(_){
					try {
						f2();
						return f3(__cb(_, function(){
							f4();
							return __();
						}));
					} 
					catch (__err) {
						return _(__err);
					};
					
									})(function(ex, __result){
					if (ex) {
						f5();
						return f6(__cb(_, function(){
							f7();
							return __();
						}));
					}
					else 
						return _(null, __result);
				});
			})(function(){
				f8();
				return __();
			});
		});
	})
	
	test("try finally", 1, function(){
		genTest(function f_(){
			f1();
			try {
				f2();
				f3_();
				f4();
			}
			finally {
				f5();
				f6_();
				f7();
			}
			f8();
		}, function f(_){
			var __ = _;
			f1();
			return (function(__){
				return (function(_){
					function __(){
						return _(null, null, true);
					};
					try {
						f2();
						return f3(__cb(_, function(){
							f4();
							return __();
						}));
					} 
					catch (__err) {
						return _(__err);
					};
									})(function(__err, __result, __cont){
					return (function(__){
						f5();
						return f6(__cb(_, function(){
							f7();
							return __();
						}));
					})(function(){
						if (__cont) {
							return __()
						}
						else {
							return _(__err, __result)
						};
											});
				});
			})(function(){
				f8();
				return __();
			});
		})
	})
	
	test("lazy and", 1, function(){
		genTest(function f_(){
			f1();
			if (f2_() && f3_()) {
				f4();
				f5_();
				f6()
			}
			f7();
		}, function f(_){
			var __ = _;
			f1();
			return (function(__){
				return (function(_){
					var __ = _;
					return f2(__cb(_, function(__1){
						var __val = __1;
						if ((!__val == true)) {
							return _(null, __val);
						};
						return f3(__cb(_, function(__2){
							return _(null, __2);
							
						}));
					}));
				})(__cb(_, function(__1){
					if (__1) {
						f4();
						return f5(__cb(_, function(){
							f6();
							return __();
						}));
					};
					return __();
				}));
			})(function(){
				f7();
				return __();
			});
		})
	})
	
	test("empty body", 1, function(){
		genTest(function f_(){
		}, function f(_){
			return __();
		})
	})
	
	test("only return in body", 1, function(){
		genTest(function f_(){
			return 4;
		}, function f(_){
			return _(null, 4);
		})
	})
	
	
	
	module("evaluation");
	function evalTest(f, val){
		var str = transform(f.toString());
		(function(){
			eval(str);
			f(function(err, result){
				var str = err ? "ERR: " + err : result;
				strictEqual(str, val);
				start();
			})
		})();
	}
	
	function delay(val, _){
		setTimeout(function(){
			_(null, val);
		}, 0);
	}
	
	function delayFail(err, _){
		setTimeout(function(){
			_(err);
		}, 0);
	}
	
	asyncTest("eval return", 1, function(){
		evalTest(function f_(){
			return delay_(5);
		}, 5);
	})
	
	asyncTest("eval if true", 1, function(){
		evalTest(function f_(){
			if (true) 
				return delay_(3);
			return 4;
		}, 3);
	})
	
	asyncTest("eval if false", 1, function(){
		evalTest(function f_(){
			if (false) 
				return delay_(3);
			return 4;
		}, 4);
	})
	
	asyncTest("eval while", 1, function(){
		evalTest(function f_(){
			var i = 1, result = 1;
			while (i < 5) {
				result = delay_(i * result);
				i++;
			}
			return result;
		}, 24);
	})
	
	asyncTest("eval for", 1, function(){
		evalTest(function f_(){
			var result = 1;
			for (var i = 1; i < 5; i++) {
				result = delay_(i) * delay_(result);
			}
			return result;
		}, 24);
	})
	
	asyncTest("eval for in", 1, function(){
		evalTest(function f_(){
			var foo = {
				a: 1,
				b: 2,
				c: 3,
				d: 5
			}
			var result = 1;
			for (var k in foo) {
				result = delay_(foo[delay_(k)]) * delay_(result);
			}
			return result;
		}, 30);
	})
	
	asyncTest("fully async for in", 1, function(){
		evalTest(function f_(){
			var result = 1;
			for (var i = delay_(1); i < delay_(5); i = delay_(i) + 1) {
				result = delay_(result) * delay_(i)
			}
			return result;
		}, 24);
	})
	
	asyncTest("break in loop", 1, function(){
		evalTest(function f_(){
			var result = 1;
			for (var i = 1; i < 10; i++) {
				if (i == 5) 
					break;
				result = delay_(result) * delay_(i)
			}
			return result;
		}, 24);
	})
	
	asyncTest("continue", 1, function(){
		evalTest(function f_(){
			var result = 1;
			for (var i = 1; i < 10; i++) {
				if (i >= 5) 
					continue;
				result = delay_(result) * delay_(i)
			}
			return result;
		}, 24);
	})
	
	asyncTest("break in while", 1, function(){
		evalTest(function f_(){
			var i = 1, result = 1;
			while (i < 10) {
				if (i == 5) 
					break;
				result = delay_(result) * delay_(i);
				i++;
			}
			return result;
		}, 24);
	})
	
	asyncTest("continue in while", 1, function(){
		evalTest(function f_(){
			var i = 1, result = 1;
			while (i < 10) {
				i++;
				if (i >= 5) 
					continue;
				result = delay_(result) * delay_(i);
			}
			return result;
		}, 24);
	})
	
	asyncTest("eval lazy", 1, function(){
		evalTest(function f_(){
			var result = 1;
			return delay_(delay_(result + 8) < 5) && true ? 2 : 4
		}, 4);
	})
	
	asyncTest("try catch 1", 1, function(){
		evalTest(function f_(){
			try {
				return delay_("ok");
			} 
			catch (ex) {
				return delay_("err");
			}
		}, "ok");
	})
	
	asyncTest("try catch 2", 1, function(){
		evalTest(function f_(){
			try {
				throw delay_("thrown");
			} 
			catch (ex) {
				return delay_("caught ") + ex;
			}
		}, "caught thrown");
	})
	
	asyncTest("try catch 3", 1, function(){
		evalTest(function f_(){
			try {
				throw delay_("thrown");
			} 
			catch (ex) {
				return delay_("caught ") + ex;
			}
		}, "caught thrown");
	})
	
	asyncTest("try catch 5", 1, function(){
		evalTest(function f_(){
			try {
				delayFail_("delay fail");
			} 
			catch (ex) {
				return delay_("caught ") + ex;
			}
		}, "caught delay fail");
	})
	
	asyncTest("try finally 1", 1, function(){
		evalTest(function f_(){
			var x = "";
			try {
				x += delay_("try")
			}
			finally {
				x += delay_(" finally");
			}
			x += " end"
			return x;
		}, "try finally end");
	})
	
	asyncTest("try finally 2", 1, function(){
		evalTest(function f_(){
			var x = "";
			try {
				x += delay_("try")
				return x;
			}
			finally {
				x += delay_(" finally");
			}
			x += " end"
			return x;
		}, "try");
	})
	
	asyncTest("try finally 3", 1, function(){
		evalTest(function f_(){
			var x = "";
			try {
				x += delay_("try")
				throw "bad try";
			}
			finally {
				x += delay_(" finally");
			}
			x += " end"
			return x;
		}, "ERR: bad try");
	})
	
	asyncTest("and ok", 1, function(){
		evalTest(function f_(){
			var x = "<<";
			if (delay_(true) && delay_(true)) 
				x += "T1";
			else 
				x += "F1"
			if (delay_(true) && delay_(false)) 
				x += "T2";
			else 
				x += "F2"
			if (delay_(false) && delay_(true)) 
				x += "T3";
			else 
				x += "F3"
			if (delay_(false) && delay_(false)) 
				x += "T4";
			else 
				x += "F4"
			if (delay_(false) && delayFail_("bad")) 
				x += "T5";
			else 
				x += "F5"
			x += ">>";
			return x;
		}, "<<T1F2F3F4F5>>");
	})
	
	asyncTest("or ok", 1, function(){
		evalTest(function f_(){
			var x = "<<";
			if (delay_(true) || delay_(true)) 
				x += "T1";
			else 
				x += "F1"
			if (delay_(true) || delay_(false)) 
				x += "T2";
			else 
				x += "F2"
			if (delay_(false) || delay_(true)) 
				x += "T3";
			else 
				x += "F3"
			if (delay_(false) || delay_(false)) 
				x += "T4";
			else 
				x += "F4"
			if (delay_(true) || delayFail_("bad")) 
				x += "T5";
			else 
				x += "F5"
			x += ">>";
			return x;
		}, "<<T1T2T3F4T5>>");
	})
})

