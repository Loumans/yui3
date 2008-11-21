YUI.add("yuitest",
function(A) {
    A.namespace("Test");
    A.Test.Case = function(B) {
        this._should = {};
        for (var C in B) {
            this[C] = B[C];
        }
        if (!A.Lang.isString(this.name)) {
            this.name = "testCase" + A.guid();
        }
    };
    A.Test.Case.prototype = {
        resume: function(B) {
            A.Test.Runner.resume(B);
        },
        wait: function(D, C) {
            var B = arguments;
            if (A.Lang.isFunction(B[0])) {
                throw new A.Test.Wait(B[0], B[1]);
            } else {
                throw new A.Test.Wait(function() {
                    A.Assert.fail("Timeout: wait() called but resume() never called.");
                },
                (A.Lang.isNumber(B[0]) ? B[0] : 10000));
            }
        },
        setUp: function() {},
        tearDown: function() {}
    };
    A.Test.Wait = function(C, B) {
        this.segment = (A.Lang.isFunction(C) ? C: null);
        this.delay = (A.Lang.isNumber(B) ? B: 0);
    };
    A.namespace("Test");
    A.Test.Suite = function(B) {
        this.name = "";
        this.items = [];
        if (A.Lang.isString(B)) {
            this.name = B;
        } else {
            if (A.Lang.isObject(B)) {
                A.mix(this, B, true);
            }
        }
        if (this.name === "") {
            this.name = "testSuite" + A.guid();
        }
    };
    A.Test.Suite.prototype = {
        add: function(B) {
            if (B instanceof A.Test.Suite || B instanceof A.Test.Case) {
                this.items.push(B);
            }
        },
        setUp: function() {},
        tearDown: function() {}
    };
    A.Test.Runner = (function() {
        function C(D) {
            this.testObject = D;
            this.firstChild = null;
            this.lastChild = null;
            this.parent = null;
            this.next = null;
            this.results = {
                passed: 0,
                failed: 0,
                total: 0,
                ignored: 0
            };
            if (D instanceof A.Test.Suite) {
                this.results.type = "testsuite";
                this.results.name = D.name;
            } else {
                if (D instanceof A.Test.Case) {
                    this.results.type = "testcase";
                    this.results.name = D.name;
                }
            }
        }
        C.prototype = {
            appendChild: function(D) {
                var E = new C(D);
                if (this.firstChild === null) {
                    this.firstChild = this.lastChild = E;
                } else {
                    this.lastChild.next = E;
                    this.lastChild = E;
                }
                E.parent = this;
                return E;
            }
        };
        function B() {
            B.superclass.constructor.apply(this, arguments);
            this.masterSuite = new A.Test.Suite("YUI Test Results");
            this._cur = null;
            this._root = null;
            this._log = true;
            var E = [this.TEST_CASE_BEGIN_EVENT, this.TEST_CASE_COMPLETE_EVENT, this.TEST_SUITE_BEGIN_EVENT, this.TEST_SUITE_COMPLETE_EVENT, this.TEST_PASS_EVENT, this.TEST_FAIL_EVENT, this.TEST_IGNORE_EVENT, this.COMPLETE_EVENT, this.BEGIN_EVENT];
            for (var D = 0; D < E.length; D++) {
                this.subscribe(E[D], this._logEvent, this, true);
            }
        }
        A.extend(B, A.Event.Target, {
            TEST_CASE_BEGIN_EVENT: "testcasebegin",
            TEST_CASE_COMPLETE_EVENT: "testcasecomplete",
            TEST_SUITE_BEGIN_EVENT: "testsuitebegin",
            TEST_SUITE_COMPLETE_EVENT: "testsuitecomplete",
            TEST_PASS_EVENT: "pass",
            TEST_FAIL_EVENT: "fail",
            TEST_IGNORE_EVENT: "ignore",
            COMPLETE_EVENT: "complete",
            BEGIN_EVENT: "begin",
            disableLogging: function() {
                this._log = false;
            },
            enableLogging: function() {
                this._log = true;
            },
            _logEvent: function(F) {
                var E = "";
                var D = "";
                switch (F.type) {
                case this.BEGIN_EVENT:
                    E = "Testing began at " + (new Date()).toString() + ".";
                    D = "info";
                    break;
                case this.COMPLETE_EVENT:
                    E = "Testing completed at " + (new Date()).toString() + ".\nPassed:" + F.results.passed + " Failed:" + F.results.failed + " Total:" + F.results.total;
                    D = "info";
                    break;
                case this.TEST_FAIL_EVENT:
                    E = F.testName + ": " + F.error.getMessage();
                    D = "fail";
                    break;
                case this.TEST_IGNORE_EVENT:
                    E = F.testName + ": ignored.";
                    D = "ignore";
                    break;
                case this.TEST_PASS_EVENT:
                    E = F.testName + ": passed.";
                    D = "pass";
                    break;
                case this.TEST_SUITE_BEGIN_EVENT:
                    E = 'Test suite "' + F.testSuite.name + '" started.';
                    D = "info";
                    break;
                case this.TEST_SUITE_COMPLETE_EVENT:
                    E = 'Test suite "' + F.testSuite.name + '" completed.\nPassed:' + F.results.passed + " Failed:" + F.results.failed + " Total:" + F.results.total;
                    D = "info";
                    break;
                case this.TEST_CASE_BEGIN_EVENT:
                    E = 'Test case "' + F.testCase.name + '" started.';
                    D = "info";
                    break;
                case this.TEST_CASE_COMPLETE_EVENT:
                    E = 'Test case "' + F.testCase.name + '" completed.\nPassed:' + F.results.passed + " Failed:" + F.results.failed + " Total:" + F.results.total;
                    D = "info";
                    break;
                default:
                    E = "Unexpected event " + F.type;
                    E = "info";
                }
                if (this._log) {
                    A.log(E, D, "TestRunner");
                }
            },
            _addTestCaseToTestTree: function(D, E) {
                var F = D.appendChild(E);
                for (var G in E) {
                    if (G.indexOf("test") === 0 && A.Lang.isFunction(E[G])) {
                        F.appendChild(G);
                    }
                }
            },
            _addTestSuiteToTestTree: function(D, G) {
                var F = D.appendChild(G);
                for (var E = 0; E < G.items.length; E++) {
                    if (G.items[E] instanceof A.Test.Suite) {
                        this._addTestSuiteToTestTree(F, G.items[E]);
                    } else {
                        if (G.items[E] instanceof A.Test.Case) {
                            this._addTestCaseToTestTree(F, G.items[E]);
                        }
                    }
                }
            },
            _buildTestTree: function() {
                this._root = new C(this.masterSuite);
                this._cur = this._root;
                for (var D = 0; D < this.masterSuite.items.length; D++) {
                    if (this.masterSuite.items[D] instanceof A.Test.Suite) {
                        this._addTestSuiteToTestTree(this._root, this.masterSuite.items[D]);
                    } else {
                        if (this.masterSuite.items[D] instanceof A.Test.Case) {
                            this._addTestCaseToTestTree(this._root, this.masterSuite.items[D]);
                        }
                    }
                }
            },
            _handleTestObjectComplete: function(D) {
                if (A.Lang.isObject(D.testObject)) {
                    D.parent.results.passed += D.results.passed;
                    D.parent.results.failed += D.results.failed;
                    D.parent.results.total += D.results.total;
                    D.parent.results.ignored += D.results.ignored;
                    D.parent.results[D.testObject.name] = D.results;
                    if (D.testObject instanceof A.Test.Suite) {
                        D.testObject.tearDown();
                        this.fire(this.TEST_SUITE_COMPLETE_EVENT, {
                            testSuite: D.testObject,
                            results: D.results
                        });
                    } else {
                        if (D.testObject instanceof A.Test.Case) {
                            this.fire(this.TEST_CASE_COMPLETE_EVENT, {
                                testCase: D.testObject,
                                results: D.results
                            });
                        }
                    }
                }
            },
            _next: function() {
                if (this._cur.firstChild) {
                    this._cur = this._cur.firstChild;
                } else {
                    if (this._cur.next) {
                        this._cur = this._cur.next;
                    } else {
                        while (this._cur && !this._cur.next && this._cur !== this._root) {
                            this._handleTestObjectComplete(this._cur);
                            this._cur = this._cur.parent;
                        }
                        if (this._cur == this._root) {
                            this._cur.results.type = "report";
                            this._cur.results.timestamp = (new Date()).toLocaleString();
                            this._cur.results.duration = (new Date()) - this._cur.results.duration;
                            this.fire(this.COMPLETE_EVENT, {
                                results: this._cur.results
                            });
                            this._cur = null;
                        } else {
                            this._handleTestObjectComplete(this._cur);
                            this._cur = this._cur.next;
                        }
                    }
                }
                return this._cur;
            },
            _run: function() {
                var F = false;
                var E = this._next();
                if (E !== null) {
                    var D = E.testObject;
                    if (A.Lang.isObject(D)) {
                        if (D instanceof A.Test.Suite) {
                            this.fire(this.TEST_SUITE_BEGIN_EVENT, {
                                testSuite: D
                            });
                            D.setUp();
                        } else {
                            if (D instanceof A.Test.Case) {
                                this.fire(this.TEST_CASE_BEGIN_EVENT, {
                                    testCase: D
                                });
                            }
                        }
                        if (typeof setTimeout != "undefined") {
                            setTimeout(function() {
                                A.Test.Runner._run();
                            },
                            0);
                        } else {
                            this._run();
                        }
                    } else {
                        this._runTest(E);
                    }
                }
            },
            _resumeTest: function(H) {
                var D = this._cur;
                if (!D) {
                    return;
                }
                var I = D.testObject;
                var F = D.parent.testObject;
                if (F.__yui_wait) {
                    clearTimeout(F.__yui_wait);
                    delete F.__yui_wait;
                }
                var L = (F._should.fail || {})[I];
                var E = (F._should.error || {})[I];
                var G = false;
                var J = null;
                try {
                    H.apply(F);
                    if (L) {
                        J = new A.Assert.ShouldFail();
                        G = true;
                    } else {
                        if (E) {
                            J = new A.Assert.ShouldError();
                            G = true;
                        }
                    }
                } catch(K) {
                    if (F.__yui_wait) {
                        clearTimeout(F.__yui_wait);
                        delete F.__yui_wait;
                    }
                    if (K instanceof A.Assert.Error) {
                        if (!L) {
                            J = K;
                            G = true;
                        }
                    } else {
                        if (K instanceof A.Test.Wait) {
                            if (A.Lang.isFunction(K.segment)) {
                                if (A.Lang.isNumber(K.delay)) {
                                    if (typeof setTimeout != "undefined") {
                                        F.__yui_wait = setTimeout(function() {
                                            A.Test.Runner._resumeTest(K.segment);
                                        },
                                        K.delay);
                                    } else {
                                        throw new Error("Asynchronous tests not supported in this environment.");
                                    }
                                }
                            }
                            return;
                        } else {
                            if (!E) {
                                J = new A.Assert.UnexpectedError(K);
                                G = true;
                            } else {
                                if (A.Lang.isString(E)) {
                                    if (K.message != E) {
                                        J = new YAHOO.util.UnexpectedError(K);
                                        G = true;
                                    }
                                } else {
                                    if (A.Lang.isFunction(E)) {
                                        if (! (K instanceof E)) {
                                            J = new YAHOO.util.UnexpectedError(K);
                                            G = true;
                                        }
                                    } else {
                                        if (A.Lang.isObject(E)) {
                                            if (! (K instanceof E.constructor) || K.message != E.message) {
                                                J = new YAHOO.util.UnexpectedError(K);
                                                G = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (G) {
                    this.fire(this.TEST_FAIL_EVENT, {
                        testCase: F,
                        testName: I,
                        error: J
                    });
                } else {
                    this.fire(this.TEST_PASS_EVENT, {
                        testCase: F,
                        testName: I
                    });
                }
                F.tearDown();
                D.parent.results[I] = {
                    result: G ? "fail": "pass",
                    message: J ? J.getMessage() : "Test passed",
                    type: "test",
                    name: I
                };
                if (G) {
                    D.parent.results.failed++;
                } else {
                    D.parent.results.passed++;
                }
                D.parent.results.total++;
                if (typeof setTimeout != "undefined") {
                    setTimeout(function() {
                        A.Test.Runner._run();
                    },
                    0);
                } else {
                    this._run();
                }
            },
            _runTest: function(G) {
                var D = G.testObject;
                var E = G.parent.testObject;
                var H = E[D];
                var F = (E._should.ignore || {})[D];
                if (F) {
                    G.parent.results[D] = {
                        result: "ignore",
                        message: "Test ignored",
                        type: "test",
                        name: D
                    };
                    G.parent.results.ignored++;
                    G.parent.results.total++;
                    this.fire(this.TEST_IGNORE_EVENT, {
                        testCase: E,
                        testName: D
                    });
                    if (typeof setTimeout != "undefined") {
                        setTimeout(function() {
                            A.Test.Runner._run();
                        },
                        0);
                    } else {
                        this._run();
                    }
                } else {
                    E.setUp();
                    this._resumeTest(H);
                }
            },
            fire: function(D, E) {
                E = E || {};
                E.type = D;
                B.superclass.fire.call(this, D, E);
            },
            add: function(D) {
                this.masterSuite.add(D);
            },
            clear: function() {
                this.masterSuite.items = [];
            },
            resume: function(D) {
                this._resumeTest(D ||
                function() {});
            },
            run: function(D) {
                var E = A.Test.Runner;
                E._buildTestTree();
                E._root.results.duration = (new Date()).valueOf();
                E.fire(E.BEGIN_EVENT);
                E._run();
            }
        });
        return new B();
    })();
    A.Assert = {
        _formatMessage: function(C, B) {
            var D = C;
            if (A.Lang.isString(C) && C.length > 0) {
                return A.Lang.substitute(C, {
                    message: B
                });
            } else {
                return B;
            }
        },
        fail: function(B) {
            throw new A.Assert.Error(A.Assert._formatMessage(B, "Test force-failed."));
        },
        areEqual: function(C, D, B) {
            if (C != D) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(B, "Values should be equal."), C, D);
            }
        },
        areNotEqual: function(B, D, C) {
            if (B == D) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(C, "Values should not be equal."), B);
            }
        },
        areNotSame: function(B, D, C) {
            if (B === D) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(C, "Values should not be the same."), B);
            }
        },
        areSame: function(C, D, B) {
            if (C !== D) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(B, "Values should be the same."), C, D);
            }
        },
        isFalse: function(C, B) {
            if (false !== C) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(B, "Value should be false."), false, C);
            }
        },
        isTrue: function(C, B) {
            if (true !== C) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(B, "Value should be true."), true, C);
            }
        },
        isNaN: function(C, B) {
            if (!isNaN(C)) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(B, "Value should be NaN."), NaN, C);
            }
        },
        isNotNaN: function(C, B) {
            if (isNaN(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Values should not be NaN."), NaN);
            }
        },
        isNotNull: function(C, B) {
            if (A.Lang.isNull(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Values should not be null."), null);
            }
        },
        isNotUndefined: function(C, B) {
            if (A.Lang.isUndefined(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Value should not be undefined."), undefined);
            }
        },
        isNull: function(C, B) {
            if (!A.Lang.isNull(C)) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(B, "Value should be null."), null, C);
            }
        },
        isUndefined: function(C, B) {
            if (!A.Lang.isUndefined(C)) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(B, "Value should be undefined."), undefined, C);
            }
        },
        isArray: function(C, B) {
            if (!A.Lang.isArray(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Value should be an array."), C);
            }
        },
        isBoolean: function(C, B) {
            if (!A.Lang.isBoolean(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Value should be a Boolean."), C);
            }
        },
        isFunction: function(C, B) {
            if (!A.Lang.isFunction(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Value should be a function."), C);
            }
        },
        isInstanceOf: function(C, D, B) {
            if (! (D instanceof C)) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(B, "Value isn't an instance of expected type."), C, D);
            }
        },
        isNumber: function(C, B) {
            if (!A.Lang.isNumber(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Value should be a number."), C);
            }
        },
        isObject: function(C, B) {
            if (!A.Lang.isObject(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Value should be an object."), C);
            }
        },
        isString: function(C, B) {
            if (!A.Lang.isString(C)) {
                throw new A.Assert.UnexpectedValue(A.Assert._formatMessage(B, "Value should be a string."), C);
            }
        },
        isTypeOf: function(B, D, C) {
            if (typeof D != B) {
                throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(C, "Value should be of type " + B + "."), expected, typeof D);
            }
        }
    };
    A.Assert.Error = function(B) {
        arguments.callee.superclass.constructor.call(this, B);
        this.message = B;
        this.name = "Assert Error";
    };
    A.extend(A.Assert.Error, Error, {
        getMessage: function() {
            return this.message;
        },
        toString: function() {
            return this.name + ": " + this.getMessage();
        },
        valueOf: function() {
            return this.toString();
        }
    });
    A.Assert.ComparisonFailure = function(C, B, D) {
        arguments.callee.superclass.constructor.call(this, C);
        this.expected = B;
        this.actual = D;
        this.name = "ComparisonFailure";
    };
    A.extend(A.Assert.ComparisonFailure, A.Assert.Error, {
        getMessage: function() {
            return this.message + "\nExpected: " + this.expected + " (" + (typeof this.expected) + ")" + "\nActual:" + this.actual + " (" + (typeof this.actual) + ")";
        }
    });
    A.Assert.UnexpectedValue = function(C, B) {
        arguments.callee.superclass.constructor.call(this, C);
        this.unexpected = B;
        this.name = "UnexpectedValue";
    };
    A.extend(A.Assert.UnexpectedValue, A.Assert.Error, {
        getMessage: function() {
            return this.message + "\nUnexpected: " + this.unexpected + " (" + (typeof this.unexpected) + ") ";
        }
    });
    A.Assert.ShouldFail = function(B) {
        arguments.callee.superclass.constructor.call(this, B || "This test should fail but didn't.");
        this.name = "ShouldFail";
    };
    A.extend(A.Assert.ShouldFail, A.Assert.Error);
    A.Assert.ShouldError = function(B) {
        arguments.callee.superclass.constructor.call(this, B || "This test should have thrown an error but didn't.");
        this.name = "ShouldError";
    };
    A.extend(A.Assert.ShouldError, A.Assert.Error);
    A.Assert.UnexpectedError = function(B) {
        arguments.callee.superclass.constructor.call(this, "Unexpected error: " + B.message);
        this.cause = B;
        this.name = "UnexpectedError";
        this.stack = B.stack;
    };
    A.extend(A.Assert.UnexpectedError, A.Assert.Error);
    A.ArrayAssert = {
        contains: function(F, E, C) {
            var D = false;
            for (var B = 0; B < E.length && !D; B++) {
                if (E[B] === F) {
                    D = true;
                }
            }
            if (!D) {
                A.Assert.fail(A.Assert._formatMessage(C, "Value " + F + " (" + (typeof F) + ") not found in array [" + E + "]."));
            }
        },
        containsItems: function(D, E, C) {
            for (var B = 0; B < D.length; B++) {
                this.contains(D[B], E, C);
            }
        },
        containsMatch: function(F, E, C) {
            if (typeof F != "function") {
                throw new TypeError("ArrayAssert.containsMatch(): First argument must be a function.");
            }
            var D = false;
            for (var B = 0; B < E.length && !D; B++) {
                if (F(E[B])) {
                    D = true;
                }
            }
            if (!D) {
                A.Assert.fail(A.Assert._formatMessage(C, "No match found in array [" + E + "]."));
            }
        },
        doesNotContain: function(F, E, C) {
            var D = false;
            for (var B = 0; B < E.length && !D; B++) {
                if (E[B] === F) {
                    D = true;
                }
            }
            if (D) {
                A.Assert.fail(A.Assert._formatMessage(C, "Value found in array [" + E + "]."));
            }
        },
        doesNotContainItems: function(D, E, C) {
            for (var B = 0; B < D.length; B++) {
                this.doesNotContain(D[B], E, C);
            }
        },
        doesNotContainMatch: function(F, E, C) {
            if (typeof F != "function") {
                throw new TypeError("ArrayAssert.doesNotContainMatch(): First argument must be a function.");
            }
            var D = false;
            for (var B = 0; B < E.length && !D; B++) {
                if (F(E[B])) {
                    D = true;
                }
            }
            if (D) {
                A.Assert.fail(A.Assert._formatMessage(C, "Value found in array [" + E + "]."));
            }
        },
        indexOf: function(F, E, B, D) {
            for (var C = 0; C < E.length; C++) {
                if (E[C] === F) {
                    A.Assert.areEqual(B, C, D || "Value exists at index " + C + " but should be at index " + B + ".");
                    return;
                }
            }
            A.Assert.fail(A.Assert._formatMessage(D, "Value doesn't exist in array [" + E + "]."));
        },
        itemsAreEqual: function(E, F, D) {
            var B = Math.max(E.length, F.length);
            for (var C = 0; C < B; C++) {
                A.Assert.areEqual(E[C], F[C], A.Assert._formatMessage(D, "Values in position " + C + " are not equal."));
            }
        },
        itemsAreEquivalent: function(F, G, C, E) {
            if (typeof C != "function") {
                throw new TypeError("ArrayAssert.itemsAreEquivalent(): Third argument must be a function.");
            }
            var B = Math.max(F.length, G.length);
            for (var D = 0; D < B; D++) {
                if (!C(F[D], G[D])) {
                    throw new A.Assert.ComparisonFailure(A.Assert._formatMessage(E, "Values in position " + D + " are not equivalent."), F[D], G[D]);
                }
            }
        },
        isEmpty: function(C, B) {
            if (C.length > 0) {
                A.Assert.fail(A.Assert._formatMessage(B, "Array should be empty."));
            }
        },
        isNotEmpty: function(C, B) {
            if (C.length === 0) {
                A.Assert.fail(A.Assert._formatMessage(B, "Array should not be empty."));
            }
        },
        itemsAreSame: function(E, F, D) {
            var B = Math.max(E.length, F.length);
            for (var C = 0; C < B; C++) {
                A.Assert.areSame(E[C], F[C], A.Assert._formatMessage(D, "Values in position " + C + " are not the same."));
            }
        },
        lastIndexOf: function(F, E, B, D) {
            for (var C = E.length; C >= 0; C--) {
                if (E[C] === F) {
                    A.Assert.areEqual(B, C, A.Assert._formatMessage(D, "Value exists at index " + C + " but should be at index " + B + "."));
                    return;
                }
            }
            A.Assert.fail(A.Assert._formatMessage(D, "Value doesn't exist in array."));
        }
    };
    A.ObjectAssert = {
        areEqual: function(C, D, B) {
            A.Object.each(C,
            function(F, E) {
                A.Assert.areEqual(C[E], D[E], A.Assert._formatMessage(B, "Values should be equal for property " + E));
            });
        },
        has: function(B, C, D) {
            if (! (B in C)) {
                A.Assert.fail(A.Assert._formatMessage(D, "Property '" + B + "' not found on object."));
            }
        },
        hasAll: function(D, B, C) {
            A.Object.each(D,
            function(F, E) {
                if (! (E in B)) {
                    A.Assert.fail(A.Assert._formatMessage(C, "Property '" + E + "' not found on object."));
                }
            });
        },
        owns: function(B, C, D) {
            if (!A.Object.owns(C, B)) {
                A.Assert.fail(A.Assert._formatMessage(D, "Property '" + B + "' not found on object instance."));
            }
        },
        ownsAll: function(D, B, C) {
            A.Object.each(D,
            function(F, E) {
                if (!A.Object.owns(B, E)) {
                    A.Assert.fail(A.Assert._formatMessage(C, "Property '" + E + "' not found on object instance."));
                }
            });
        }
    };
    A.DateAssert = {
        datesAreEqual: function(C, D, B) {
            if (C instanceof Date && D instanceof Date) {
                A.AssertareEqual(C.getFullYear(), D.getFullYear(), A.Assert_formatMessage(B, "Years should be equal."));
                A.AssertareEqual(C.getMonth(), D.getMonth(), A.Assert_formatMessage(B, "Months should be equal."));
                A.AssertareEqual(C.getDate(), D.getDate(), A.Assert_formatMessage(B, "Day of month should be equal."));
            } else {
                throw new TypeError("DateY.AssertdatesAreEqual(): Expected and actual values must be Date objects.");
            }
        },
        timesAreEqual: function(C, D, B) {
            if (C instanceof Date && D instanceof Date) {
                A.AssertareEqual(C.getHours(), D.getHours(), A.Assert_formatMessage(B, "Hours should be equal."));
                A.AssertareEqual(C.getMinutes(), D.getMinutes(), A.Assert_formatMessage(B, "Minutes should be equal."));
                A.AssertareEqual(C.getSeconds(), D.getSeconds(), A.Assert_formatMessage(B, "Seconds should be equal."));
            } else {
                throw new TypeError("DateY.AsserttimesAreEqual(): Expected and actual values must be Date objects.");
            }
        }
    };
    A.namespace("Test.Format");
    A.Test.Format.JSON = function(B) {
        return A.JSON.stringify(B);
    };
    A.Test.Format.XML = function(D) {
        var B = A.Lang;
        var C = "<" + D.type + ' name="' + D.name.replace(/"/g, "&quot;").replace(/'/g, "&apos;") + '"';
        if (D.type == "test") {
            C += ' result="' + D.result + '" message="' + D.message + '">';
        } else {
            C += ' passed="' + D.passed + '" failed="' + D.failed + '" ignored="' + D.ignored + '" total="' + D.total + '">';
            for (var E in D) {
                if (A.Object.owns(D, E) && B.isObject(D[E]) && !B.isArray(D[E])) {
                    C += arguments.callee(D[E]);
                }
            }
        }
        C += "</" + D.type + ">";
        return C;
    };
    A.namespace("Test");
    A.Test.Reporter = function(B, C) {
        this.url = B;
        this.format = C || A.Test.Format.XML;
        this._fields = new Object();
        this._form = null;
        this._iframe = null;
    };
    A.Test.Reporter.prototype = {
        constructor: A.Test.Reporter,
        addField: function(B, C) {
            this._fields[B] = C;
        },
        clearFields: function() {
            this._fields = new Object();
        },
        destroy: function() {
            if (this._form) {
                this._form.parentNode.removeChild(this._form);
                this._form = null;
            }
            if (this._iframe) {
                this._iframe.parentNode.removeChild(this._iframe);
                this._iframe = null;
            }
            this._fields = null;
        },
        report: function(C) {
            if (!this._form) {
                this._form = document.createElement("form");
                this._form.method = "post";
                this._form.style.visibility = "hidden";
                this._form.style.position = "absolute";
                this._form.style.top = 0;
                document.body.appendChild(this._form);
                if (A.UA.ie) {
                    this._iframe = document.createElement('<iframe name="yuiTestTarget" />');
                } else {
                    this._iframe = document.createElement("iframe");
                    this._iframe.name = "yuiTestTarget";
                }
                this._iframe.src = "javascript:false";
                this._iframe.style.visibility = "hidden";
                this._iframe.style.position = "absolute";
                this._iframe.style.top = 0;
                document.body.appendChild(this._iframe);
                this._form.target = "yuiTestTarget";
            }
            this._form.action = this.url;
            while (this._form.hasChildNodes()) {
                this._form.removeChild(this._form.lastChild);
            }
            this._fields.results = this.format(C);
            this._fields.useragent = navigator.userAgent;
            this._fields.timestamp = (new Date()).toLocaleString();
            for (var D in this._fields) {
                if (A.Object.owns(this._fields, D) && typeof this._fields[D] != "function") {
                    var B = document.createElement("input");
                    B.type = "hidden";
                    B.name = D;
                    B.value = this._fields[D];
                    this._form.appendChild(B);
                }
            }
            delete this._fields.results;
            delete this._fields.useragent;
            delete this._fields.timestamp;
            if (arguments[1] !== false) {
                this._form.submit();
            }
        }
    };
    A.Mock = function(D) {
        D = D || {};
        var B = null;
        try {
            B = A.Object(D);
        } catch(C) {
            B = {};
            A.log("Couldn't create mock with prototype.", "warn", "Mock");
        }
        A.Object.each(D,
        function(E) {
            if (A.Lang.isFunction(D[E])) {
                B[E] = function() {
                    A.Assert.fail("Method " + E + "() was called but was not expected to be.");
                };
            }
        });
        return B;
    };
    A.Mock.expect = function(C, G) {
        if (!C.__expectations) {
            C.__expectations = {};
        }
        if (G.method) {
            var F = G.method,
            E = G.args || G.arguments || [],
            B = G.returns,
            I = A.Lang.isNumber(G.callCount) ? G.callCount: 1,
            D = G.error,
            H = G.run ||
            function() {};
            C.__expectations[F] = G;
            G.callCount = I;
            G.actualCallCount = 0;
            A.Array.each(E,
            function(J, K, L) {
                if (! (L[K] instanceof A.Mock.Value)) {
                    L[K] = A.Mock.Value(A.Assert.areSame, [J], "Argument " + K + " of " + F + "() is incorrect.");
                }
            });
            if (I > 0) {
                C[F] = function() {
                    G.actualCallCount++;
                    A.Assert.areEqual(E.length, arguments.length, "Method " + F + "() passed incorrect number of arguments.");
                    for (var K = 0,
                    J = E.length; K < J; K++) {
                        if (E[K]) {
                            E[K].verify(arguments[K]);
                        } else {
                            A.Assert.fail("Argument " + K + " (" + arguments[K] + ") was not expected to be used.");
                        }
                    }
                    H.apply(this, arguments);
                    if (D) {
                        throw D;
                    }
                    return B;
                };
            } else {
                C[F] = function() {
                    A.Assert.fail("Method " + F + "() should not have been called.");
                };
            }
        } else {
            if (G.property) {
                C.__expectations[F] = G;
            }
        }
    };
    A.Mock.verify = function(B) {
        A.Object.each(B.__expectations,
        function(C) {
            if (C.method) {
                A.Assert.areEqual(C.callCount, C.actualCallCount, "Method " + C.method + "() wasn't called the expected number of times.");
            } else {
                if (C.property) {
                    A.Assert.areEqual(C.value, B[C.property], "Property " + C.property + " wasn't set to the correct value.");
                }
            }
        });
    };
    A.Mock.Value = function(D, B, C) {
        if (this instanceof A.Mock.Value) {
            this.verify = function(E) {
                B = [].concat(B);
                B.push(E);
                B.push(C);
                D.apply(null, B);
            };
        } else {
            return new A.Mock.Value(D, B, C);
        }
    };
    A.Mock.Value.Any = A.Mock.Value(function() {},
    []);
    A.Mock.Value.Boolean = A.Mock.Value(A.Assert.isBoolean, []);
    A.Mock.Value.Number = A.Mock.Value(A.Assert.isNumber, []);
    A.Mock.Value.String = A.Mock.Value(A.Assert.isString, []);
    A.Mock.Value.Object = A.Mock.Value(A.Assert.isObject, []);
    A.Mock.Value.Function = A.Mock.Value(A.Assert.isFunction, []);
},
"@VERSION@", {
    requires: ["substitute", "event-custom", "array", "oop", "event-target", "event-simulate"]
});