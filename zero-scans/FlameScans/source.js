(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

},{}],3:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./Tracker"), exports);

},{"./Source":1,"./Tracker":2}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);

},{"./base":3,"./models":46}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],6:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],7:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],8:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],9:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],10:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],11:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],12:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],13:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],14:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],15:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],16:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],17:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],18:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],19:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],20:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],21:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],22:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],23:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Button"), exports);
__exportStar(require("./Form"), exports);
__exportStar(require("./Header"), exports);
__exportStar(require("./InputField"), exports);
__exportStar(require("./Label"), exports);
__exportStar(require("./Link"), exports);
__exportStar(require("./MultilineLabel"), exports);
__exportStar(require("./NavigationButton"), exports);
__exportStar(require("./OAuthButton"), exports);
__exportStar(require("./Section"), exports);
__exportStar(require("./Select"), exports);
__exportStar(require("./Switch"), exports);
__exportStar(require("./WebViewButton"), exports);
__exportStar(require("./FormRow"), exports);
__exportStar(require("./Stepper"), exports);

},{"./Button":8,"./Form":9,"./FormRow":10,"./Header":11,"./InputField":12,"./Label":13,"./Link":14,"./MultilineLabel":15,"./NavigationButton":16,"./OAuthButton":17,"./Section":18,"./Select":19,"./Stepper":20,"./Switch":21,"./WebViewButton":22}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
    MangaStatus[MangaStatus["UNKNOWN"] = 2] = "UNKNOWN";
    MangaStatus[MangaStatus["ABANDONED"] = 3] = "ABANDONED";
    MangaStatus[MangaStatus["HIATUS"] = 4] = "HIATUS";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],27:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],28:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],29:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],30:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],31:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],32:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],33:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],34:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],35:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],36:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOperator = void 0;
var SearchOperator;
(function (SearchOperator) {
    SearchOperator["AND"] = "AND";
    SearchOperator["OR"] = "OR";
})(SearchOperator = exports.SearchOperator || (exports.SearchOperator = {}));

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = void 0;
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],39:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],40:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],42:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],43:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],44:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],45:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],46:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./DynamicUI"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./SourceStateManager"), exports);
__exportStar(require("./RequestInterceptor"), exports);
__exportStar(require("./TrackedManga"), exports);
__exportStar(require("./SourceManga"), exports);
__exportStar(require("./TrackedMangaChapterReadAction"), exports);
__exportStar(require("./TrackerActionQueue"), exports);
__exportStar(require("./SearchField"), exports);
__exportStar(require("./RawData"), exports);

},{"./Chapter":5,"./ChapterDetails":6,"./Constants":7,"./DynamicUI":23,"./HomeSection":24,"./Languages":25,"./Manga":26,"./MangaTile":27,"./MangaUpdate":28,"./PagedResults":29,"./RawData":30,"./RequestHeaders":31,"./RequestInterceptor":32,"./RequestManager":33,"./RequestObject":34,"./ResponseObject":35,"./SearchField":36,"./SearchRequest":37,"./SourceInfo":38,"./SourceManga":39,"./SourceStateManager":40,"./SourceTag":41,"./TagSection":42,"./TrackedManga":43,"./TrackedMangaChapterReadAction":44,"./TrackerActionQueue":45}],47:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlameScans = exports.FlameScansInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const parser_1 = require("./parser");
const FS_DOMAIN = 'https://flamescans.org';
exports.FlameScansInfo = {
    version: '2.0.3',
    name: 'FlameScans',
    description: 'Extension that pulls manga from Flame Scans.',
    author: 'NmN',
    authorWebsite: 'http://github.com/pandeynmm',
    icon: 'icon.ico',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: FS_DOMAIN,
    sourceTags: [
        {
            text: 'English',
            type: paperback_extensions_common_1.TagType.GREY,
        },
        {
            text: 'Cloudflare',
            type: paperback_extensions_common_1.TagType.RED
        },
    ],
};
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1';
class FlameScans extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.baseUrl = FS_DOMAIN;
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 8000,
            interceptor: {
                interceptRequest: (request) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    request.headers = Object.assign(Object.assign({}, ((_a = request.headers) !== null && _a !== void 0 ? _a : {})), {
                        'user-agent': userAgent,
                        'referer': `${this.baseUrl}/`
                    });
                    return request;
                }),
                interceptResponse: (response) => __awaiter(this, void 0, void 0, function* () {
                    return response;
                })
            }
        });
        this.RETRY = 5;
        this.parser = new parser_1.Parser();
    }
    getMangaShareUrl(mangaId) {
        return `${this.baseUrl}/series/${mangaId}`;
    }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/series/${mangaId}`,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(request, this.RETRY);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseMangaDetails($, mangaId);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/series/${mangaId}`,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(request, this.RETRY);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseChapters($, mangaId, this);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: chapterId,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(request, this.RETRY);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseChapterDetails($, mangaId, chapterId);
        });
    }
    getSearchResults(query, metadata) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            if (page == -1)
                return createPagedResults({ results: [], metadata: { page: -1 } });
            const param = `/page/${page}/?s=${((_b = query.title) !== null && _b !== void 0 ? _b : '').replace(/\s/g, '+')}`;
            const request = createRequestObject({
                url: `${this.baseUrl}`,
                method: 'GET',
                param,
            });
            const data = yield this.requestManager.schedule(request, this.RETRY);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const manga = this.parser.parseSearchResults($);
            page++;
            if (manga.length < 10)
                page = -1;
            return createPagedResults({
                results: manga,
                metadata: { page: page },
            });
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}`,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(request, this.RETRY);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            this.parser.parseHomeSections($, sectionCallback);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            if (page == -1)
                return createPagedResults({ results: [], metadata: { page: -1 } });
            let url = '';
            if (homepageSectionId == '2')
                url = `${this.baseUrl}/series/?page=${page}&order=update`;
            else if (homepageSectionId == '3')
                url = `${this.baseUrl}/series/?page=${page}?status=&type=&order=popular`;
            const request = createRequestObject({
                url,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(request, this.RETRY);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            const manga = this.parser.parseViewMore($);
            page++;
            if (manga.length < 10)
                page = -1;
            return createPagedResults({
                results: manga,
                metadata: { page: page },
            });
        });
    }
    /**
     * Parses a time string from a Madara source into a Date object.
     * Copied from Madara.ts made by gamefuzzy
     */
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = trimmed == 0 && timeAgo.includes('a') ? 1 : trimmed;
        if (timeAgo.includes('mins') || timeAgo.includes('minutes') || timeAgo.includes('minute')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('hours') || timeAgo.includes('hour')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('days') || timeAgo.includes('day')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            time = new Date(timeAgo);
        }
        return time;
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: this.baseUrl,
            method: 'GET',
            headers: {
                'user-agent': userAgent,
                'referer': `${this.baseUrl}/`
            }
        });
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > <The name of this source> and press Cloudflare Bypass');
        }
    }
}
exports.FlameScans = FlameScans;

},{"./parser":48,"paperback-extensions-common":4}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    parseMangaDetails($, mangaId) {
        var _a, _b, _c, _d, _e, _f, _g;
        const title = (_a = $('.thumb img').attr('alt')) !== null && _a !== void 0 ? _a : '';
        const image = (_b = $('.thumb img').attr('src')) !== null && _b !== void 0 ? _b : '';
        const desc = (_c = $('.entry-content.entry-content-single').text().trim()) !== null && _c !== void 0 ? _c : '';
        const rating = Number((_d = $('div.extra-info div.mobile-rt div.numscore').html()) !== null && _d !== void 0 ? _d : '0');
        let status = paperback_extensions_common_1.MangaStatus.UNKNOWN, author = '', artist = '';
        for (const obj of $('.left-side .imptdt').toArray()) {
            const item = $('i', obj).text().trim();
            const type = $('h1', obj).text().trim();
            if (type.toLowerCase().includes('status'))
                status = this.mangaStatus(item.toLowerCase());
            else if (type.toLowerCase().includes('author'))
                author = item;
            else if (type.toLowerCase().includes('artist'))
                artist = item;
        }
        const arrayTags = [];
        for (const obj of $('.mgen a').toArray()) {
            const id = (_f = (_e = $(obj).attr('href')) === null || _e === void 0 ? void 0 : _e.replace('https://flamescans.org/genres/', '').replace('/', '')) !== null && _f !== void 0 ? _f : '';
            const label = $(obj).text().trim();
            if (!id || !label)
                continue;
            arrayTags.push({ id: id, label: label });
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })];
        return createManga({
            id: mangaId,
            titles: [this.encodeText(title)],
            image,
            rating: (_g = Number(rating)) !== null && _g !== void 0 ? _g : 0,
            status,
            artist,
            author,
            tags: tagSections,
            desc: this.encodeText(desc),
        });
    }
    mangaStatus(str) {
        if (str.includes('ongoing'))
            return paperback_extensions_common_1.MangaStatus.ONGOING;
        if (str.includes('complete'))
            return paperback_extensions_common_1.MangaStatus.COMPLETED;
        if (str.includes('haitus'))
            return paperback_extensions_common_1.MangaStatus.HIATUS;
        if (str.includes('cancelled'))
            return paperback_extensions_common_1.MangaStatus.ABANDONED;
        if (str.includes('coming'))
            return paperback_extensions_common_1.MangaStatus.ONGOING;
        return paperback_extensions_common_1.MangaStatus.ONGOING;
    }
    parseChapters($, mangaId, source) {
        var _a, _b;
        const chapters = [];
        const arrChapters = $('#chapterlist li').toArray().reverse();
        for (const item of arrChapters) {
            const id = (_a = $('a', item).attr('href')) !== null && _a !== void 0 ? _a : '';
            const chapNum = Number((_b = $(item).attr('data-num')) !== null && _b !== void 0 ? _b : '0');
            const time = source.convertTime($('.chapterdate', item).text().trim());
            chapters.push(createChapter({
                id,
                mangaId,
                name: `Chapter ${chapNum.toString()}`,
                chapNum,
                time,
                langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            }));
        }
        return chapters;
    }
    parseChapterDetails($, mangaId, id) {
        const pages = [];
        const chapterList = $('#readerarea p img').toArray();
        for (const obj of chapterList) {
            const imageUrl = $(obj).attr('src');
            if (!imageUrl)
                continue;
            pages.push(imageUrl.trim());
        }
        return createChapterDetails({
            id,
            mangaId,
            pages,
            longStrip: true,
        });
    }
    parseSearchResults($) {
        var _a, _b, _c, _d;
        const results = [];
        for (const item of $('.listupd .bsx').toArray()) {
            const id = (_b = (_a = $('a', item).attr('href')) === null || _a === void 0 ? void 0 : _a.replace('https://flamescans.org/series/', '').replace('/', '')) !== null && _b !== void 0 ? _b : '';
            const title = (_c = $('a', item).attr('title')) !== null && _c !== void 0 ? _c : '';
            const image = (_d = $('img', item).attr('src')) !== null && _d !== void 0 ? _d : '';
            results.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
            }));
        }
        return results;
    }
    parseViewMore($) {
        var _a, _b, _c, _d;
        const more = [];
        for (const item of $('.listupd .bsx').toArray()) {
            const id = (_b = (_a = $('a', item).attr('href')) === null || _a === void 0 ? void 0 : _a.replace('https://flamescans.org/series/', '').replace('/', '')) !== null && _b !== void 0 ? _b : '';
            const title = (_c = $('a', item).attr('title')) !== null && _c !== void 0 ? _c : '';
            const image = (_d = $('img', item).attr('src')) !== null && _d !== void 0 ? _d : '';
            more.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
            }));
        }
        return more;
    }
    parseHomeSections($, sectionCallback) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const section1 = createHomeSection({ id: '1', title: 'Popular', type: paperback_extensions_common_1.HomeSectionType.featured, });
        const section2 = createHomeSection({ id: '2', title: 'Latest', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal, view_more: true, });
        const section3 = createHomeSection({ id: '3', title: 'Popular Titles', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal, view_more: true, });
        const featured = [];
        const popular = [];
        const latest = [];
        const arrFeatured = $('.desktop-slide').toArray();
        const arrPopular = $('.pop-list-desktop .bsx').toArray();
        const arrLatest = $('.latest-updates .bsx').toArray();
        for (const obj of arrFeatured) {
            const id = (_b = (_a = $(obj).attr('href')) === null || _a === void 0 ? void 0 : _a.replace('https://flamescans.org/series/', '').replace('/', '')) !== null && _b !== void 0 ? _b : '';
            const title = $('.tt', obj).text().trim();
            const strImg = (_c = $('.bigbanner', obj).attr('style')) !== null && _c !== void 0 ? _c : '';
            const image = (_d = strImg.substring(23, strImg.length - 3)) !== null && _d !== void 0 ? _d : '';
            featured.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
            }));
        }
        section1.items = featured;
        sectionCallback(section1);
        for (const item of arrLatest) {
            const id = (_f = (_e = $('a', item).attr('href')) === null || _e === void 0 ? void 0 : _e.replace('https://flamescans.org/series/', '').replace('/', '')) !== null && _f !== void 0 ? _f : '';
            const title = (_g = $('a', item).attr('title')) !== null && _g !== void 0 ? _g : '';
            const image = (_h = $('img', item).attr('src')) !== null && _h !== void 0 ? _h : '';
            latest.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
            }));
        }
        section2.items = latest;
        sectionCallback(section2);
        for (const obj of arrPopular) {
            const id = (_k = (_j = $('a', obj).attr('href')) === null || _j === void 0 ? void 0 : _j.replace('https://flamescans.org/series/', '').replace('/', '')) !== null && _k !== void 0 ? _k : '';
            const title = (_l = $('a', obj).attr('title')) !== null && _l !== void 0 ? _l : '';
            const subText = (_m = $('.status', obj).text()) !== null && _m !== void 0 ? _m : '';
            const image = (_o = $('img', obj).attr('src')) !== null && _o !== void 0 ? _o : '';
            popular.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
                subtitleText: createIconText({ text: subText }),
            }));
        }
        section3.items = popular;
        sectionCallback(section3);
    }
    encodeText(str) {
        return str.replace(/&#([0-9]{1,4});/gi, function (_, numStr) {
            var num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
    }
}
exports.Parser = Parser;

},{"paperback-extensions-common":4}]},{},[47])(47)
});
