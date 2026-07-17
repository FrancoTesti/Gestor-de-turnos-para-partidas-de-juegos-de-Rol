"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const utils_1 = require("./utils");
class Resource {
    constructor(resource) {
        this.resource = resource;
        this.resource = resource;
        this.timestamp = (0, utils_1.now)();
        this.deferred = (0, utils_1.defer)();
    }
    get promise() {
        return this.deferred.promise;
    }
    resolve() {
        this.deferred.resolve(undefined);
        return new Resource(this.resource);
    }
    settle() {
        this.deferred.resolve(undefined);
    }
}
exports.Resource = Resource;
