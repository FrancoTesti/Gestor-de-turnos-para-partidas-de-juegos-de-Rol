"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defer = defer;
exports.now = now;
exports.duration = duration;
exports.checkOptionalTime = checkOptionalTime;
exports.checkRequiredTime = checkRequiredTime;
exports.delay = delay;
exports.reflect = reflect;
exports.tryPromise = tryPromise;
const PromiseInspection_1 = require("./PromiseInspection");
function defer() {
    let resolve = null;
    let reject = null;
    const promise = new Promise((resolver, rejecter) => {
        resolve = resolver;
        reject = rejecter;
    });
    return {
        promise,
        resolve,
        reject
    };
}
function now() {
    return Date.now();
}
function duration(t1, t2) {
    return Math.abs(t2 - t1);
}
function checkOptionalTime(time) {
    if (typeof time === 'undefined') {
        return true;
    }
    return checkRequiredTime(time);
}
function checkRequiredTime(time) {
    return typeof time === 'number' && time === Math.round(time) && time > 0;
}
function delay(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
function reflect(promise) {
    return promise
        .then(value => {
        return new PromiseInspection_1.PromiseInspection({ value });
    })
        .catch(error => {
        return new PromiseInspection_1.PromiseInspection({ error });
    });
}
function tryPromise(cb) {
    try {
        const result = cb();
        return Promise.resolve(result);
    }
    catch (err) {
        return Promise.reject(err);
    }
}
