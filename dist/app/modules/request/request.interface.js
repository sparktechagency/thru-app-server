"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_TYPE = exports.REQUEST_STATUS = void 0;
var REQUEST_STATUS;
(function (REQUEST_STATUS) {
    REQUEST_STATUS["PENDING"] = "pending";
    REQUEST_STATUS["ACCEPTED"] = "accepted";
    REQUEST_STATUS["REJECTED"] = "rejected";
})(REQUEST_STATUS || (exports.REQUEST_STATUS = REQUEST_STATUS = {}));
var REQUEST_TYPE;
(function (REQUEST_TYPE) {
    REQUEST_TYPE["PLAN"] = "plan";
    REQUEST_TYPE["FRIEND"] = "friend";
})(REQUEST_TYPE || (exports.REQUEST_TYPE = REQUEST_TYPE = {}));
