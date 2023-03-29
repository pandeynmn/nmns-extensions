"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaReaderInterceptor = void 0;
class MangaReaderInterceptor {
    async interceptRequest(request) {
        return request;
    }
    async interceptResponse(response) {
        for (const interceptor of this.interceptors) {
            response = await interceptor.interceptResponse(response);
        }
        return response;
    }
    constructor(interceptors) {
        this.interceptors = interceptors;
    }
}
exports.MangaReaderInterceptor = MangaReaderInterceptor;
