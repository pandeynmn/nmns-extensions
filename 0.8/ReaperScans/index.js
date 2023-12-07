(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
/**
* @deprecated Use {@link PaperbackExtensionBase}
*/
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

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":15}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./CloudflareBypassRequestProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);

},{"./ChapterProviding":8,"./CloudflareBypassRequestProviding":9,"./HomePageSectionsProviding":10,"./MangaProgressProviding":11,"./MangaProviding":12,"./RequestManagerProviding":13,"./SearchResultsProviding":14}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],60:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DynamicUI/Exports/DUIBinding"), exports);
__exportStar(require("./DynamicUI/Exports/DUIForm"), exports);
__exportStar(require("./DynamicUI/Exports/DUIFormRow"), exports);
__exportStar(require("./DynamicUI/Exports/DUISection"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIHeader"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILink"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIMultilineLabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUINavigationButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIOAuthButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISecureInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISelect"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIStepper"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISwitch"), exports);
__exportStar(require("./Exports/ChapterDetails"), exports);
__exportStar(require("./Exports/Chapter"), exports);
__exportStar(require("./Exports/Cookie"), exports);
__exportStar(require("./Exports/HomeSection"), exports);
__exportStar(require("./Exports/IconText"), exports);
__exportStar(require("./Exports/MangaInfo"), exports);
__exportStar(require("./Exports/MangaProgress"), exports);
__exportStar(require("./Exports/PartialSourceManga"), exports);
__exportStar(require("./Exports/MangaUpdates"), exports);
__exportStar(require("./Exports/PBCanvas"), exports);
__exportStar(require("./Exports/PBImage"), exports);
__exportStar(require("./Exports/PagedResults"), exports);
__exportStar(require("./Exports/RawData"), exports);
__exportStar(require("./Exports/Request"), exports);
__exportStar(require("./Exports/SourceInterceptor"), exports);
__exportStar(require("./Exports/RequestManager"), exports);
__exportStar(require("./Exports/Response"), exports);
__exportStar(require("./Exports/SearchField"), exports);
__exportStar(require("./Exports/SearchRequest"), exports);
__exportStar(require("./Exports/SourceCookieStore"), exports);
__exportStar(require("./Exports/SourceManga"), exports);
__exportStar(require("./Exports/SecureStateManager"), exports);
__exportStar(require("./Exports/SourceStateManager"), exports);
__exportStar(require("./Exports/Tag"), exports);
__exportStar(require("./Exports/TagSection"), exports);
__exportStar(require("./Exports/TrackedMangaChapterReadAction"), exports);
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":17,"./DynamicUI/Exports/DUIForm":18,"./DynamicUI/Exports/DUIFormRow":19,"./DynamicUI/Exports/DUISection":20,"./DynamicUI/Rows/Exports/DUIButton":21,"./DynamicUI/Rows/Exports/DUIHeader":22,"./DynamicUI/Rows/Exports/DUIInputField":23,"./DynamicUI/Rows/Exports/DUILabel":24,"./DynamicUI/Rows/Exports/DUILink":25,"./DynamicUI/Rows/Exports/DUIMultilineLabel":26,"./DynamicUI/Rows/Exports/DUINavigationButton":27,"./DynamicUI/Rows/Exports/DUIOAuthButton":28,"./DynamicUI/Rows/Exports/DUISecureInputField":29,"./DynamicUI/Rows/Exports/DUISelect":30,"./DynamicUI/Rows/Exports/DUIStepper":31,"./DynamicUI/Rows/Exports/DUISwitch":32,"./Exports/Chapter":33,"./Exports/ChapterDetails":34,"./Exports/Cookie":35,"./Exports/HomeSection":36,"./Exports/IconText":37,"./Exports/MangaInfo":38,"./Exports/MangaProgress":39,"./Exports/MangaUpdates":40,"./Exports/PBCanvas":41,"./Exports/PBImage":42,"./Exports/PagedResults":43,"./Exports/PartialSourceManga":44,"./Exports/RawData":45,"./Exports/Request":46,"./Exports/RequestManager":47,"./Exports/Response":48,"./Exports/SearchField":49,"./Exports/SearchRequest":50,"./Exports/SecureStateManager":51,"./Exports/SourceCookieStore":52,"./Exports/SourceInterceptor":53,"./Exports/SourceManga":54,"./Exports/SourceStateManager":55,"./Exports/Tag":56,"./Exports/TagSection":57,"./Exports/TrackedMangaChapterReadAction":58,"./Exports/TrackerActionQueue":59}],61:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);

},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReaperScans = exports.ReaperScansInfo = void 0;
const types_1 = require("@paperback/types");
const parser_1 = require("./parser");
const helper_1 = require("./helper");
const REAPERSCANS_DOMAIN = 'https://reapercomics.com';
exports.ReaperScansInfo = {
    version: '4.0.0',
    name: 'ReaperScans',
    description: 'Reaperscans source for 0.8',
    author: 'NmN',
    authorWebsite: 'http://github.com/pandeynmm',
    icon: 'icon.png',
    contentRating: types_1.ContentRating.EVERYONE,
    websiteBaseURL: REAPERSCANS_DOMAIN,
    sourceTags: [
        {
            text: 'English',
            type: types_1.BadgeColor.GREY,
        },
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS | types_1.SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
};
const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1';
class ReaperScans {
    constructor(cheerio) {
        this.cheerio = cheerio;
        this.baseUrl = REAPERSCANS_DOMAIN;
        this.stateManager = App.createSourceStateManager();
        this.RETRY = 5;
        this.parser = new parser_1.Parser();
        this.helper = new helper_1.Helper();
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 6,
            requestTimeout: 8000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': userAgent,
                            referer: `${this.baseUrl}`,
                        },
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                },
            },
        });
    }
    getMangaShareUrl(mangaId) {
        return `${this.baseUrl}/comics/${mangaId}`;
    }
    async getMangaDetails(mangaId) {
        const request = App.createRequest({
            url: `${this.baseUrl}/comics/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.checkResponseError(response);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId);
    }
    async getChapters(mangaId) {
        const chapters = [];
        const request = App.createRequest({
            url: `${this.baseUrl}/comics/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.checkResponseError(response);
        const $ = this.cheerio.load(response.data);
        chapters.push(...this.parser.parseChapter($, mangaId, this));
        let page = 2;
        let page_data = [];
        do {
            const json = await this.helper.createChapterRequestObject($, page, this);
            page_data = this.parser.parseChapter(this.cheerio.load(json.effects.html), mangaId, this);
            chapters.push(...page_data);
            page += 1;
        } while (page_data.length > 0);
        return chapters;
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = App.createRequest({
            url: `${this.baseUrl}/comics/${mangaId}/chapters/${chapterId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseChapterDetails($, mangaId, chapterId);
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        if (page == -1 || !query)
            return App.createPagedResults({ results: [], metadata: { page: -1 } });
        const request = App.createRequest({
            url: `${this.baseUrl}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.checkResponseError(response);
        const $ = this.cheerio.load(response.data);
        const json = await this.helper.createSearchRequestObject($, query, this);
        const result = this.parser.parseSearchResults(this.cheerio.load(json.effects.html));
        return App.createPagedResults({
            results: result,
            metadata: { page: -1 },
        });
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        let page = metadata?.page ?? 1;
        if (page == -1)
            return App.createPagedResults({ results: [], metadata: { page: -1 } });
        const request = App.createRequest({
            url: `${this.baseUrl}/latest/comics?page=${page.toString()}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.checkResponseError(response);
        const $ = this.cheerio.load(response.data);
        const result = this.parser.parseViewMore($);
        if (result.length < 1)
            page = -1;
        else
            page++;
        return App.createPagedResults({
            results: result,
            metadata: { page: page },
        });
    }
    async getHomePageSections(sectionCallback) {
        const request = App.createRequest({
            url: `${this.baseUrl}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.checkResponseError(response);
        const $ = this.cheerio.load(response.data);
        this.parser.parseHomeSections($, false, sectionCallback);
    }
    /**
     * Parses a time string from a Madara source into a Date object.
     * Copied from Madara.ts made by Netsky
     */
    convertTime(date) {
        date = date.toUpperCase();
        let time;
        const number = Number((/\d*/.exec(date) ?? [])[0]);
        if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
            time = new Date(Date.now());
        }
        else if (date.includes('YEAR') || date.includes('YEARS')) {
            time = new Date(Date.now() - number * 31556952000);
        }
        else if (date.includes('MONTH') || date.includes('MONTHS')) {
            time = new Date(Date.now() - number * 2592000000);
        }
        else if (date.includes('WEEK') || date.includes('WEEKS')) {
            time = new Date(Date.now() - number * 604800000);
        }
        else if (date.includes('YESTERDAY')) {
            time = new Date(Date.now() - 86400000);
        }
        else if (date.includes('DAY') || date.includes('DAYS')) {
            time = new Date(Date.now() - number * 86400000);
        }
        else if (date.includes('HOUR') || date.includes('HOURS')) {
            time = new Date(Date.now() - number * 3600000);
        }
        else if (date.includes('MINUTE') || date.includes('MINUTES')) {
            time = new Date(Date.now() - number * 60000);
        }
        else if (date.includes('SECOND') || date.includes('SECONDS')) {
            time = new Date(Date.now() - number * 1000);
        }
        else {
            time = new Date(date);
        }
        return time;
    }
    async getCloudflareBypassRequest() {
        return App.createRequest({
            url: this.baseUrl,
            method: 'GET',
            headers: {
                'user-agent': await this.requestManager.getDefaultUserAgent(),
                referer: `${this.baseUrl}/`,
            },
        });
    }
    checkResponseError(response) {
        const status = response.status;
        switch (status) {
            case 403:
            case 503:
                throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${this.baseUrl}> and press the cloud icon.`);
            case 404:
                throw new Error(`The requested page ${response.request.url} was not found!`);
        }
    }
}
exports.ReaperScans = ReaperScans;

},{"./helper":63,"./parser":64,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
class Helper {
    async createChapterRequestObject($, page, source) {
        const csrf = $('meta[name=csrf-token]').attr('content');
        const requestInfo = $('div.pb-4 div').attr('wire:initial-data');
        if (requestInfo === undefined || csrf === undefined)
            return {};
        const jsonObj = JSON.parse(requestInfo);
        const serverMemo = jsonObj.serverMemo ?? '';
        const fingerprint = jsonObj.fingerprint ?? '';
        const updates = JSON.parse(`[{"type":"callMethod","payload":{"id":"${(Math.random() + 1)
            .toString(36)
            .substring(8)}","method":"gotoPage","params":[${page.toString()},"page"]}}]`);
        const body = {
            fingerprint: fingerprint,
            serverMemo: serverMemo,
            updates: updates,
        };
        const request = App.createRequest({
            url: `${source.baseUrl}/livewire/message/${fingerprint.name ?? 'fingerprint.was_none'}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livewire': 'true',
                'X-CSRF-TOKEN': csrf,
            },
            data: JSON.stringify(body),
        });
        const response = await source.requestManager.schedule(request, source.RETRY);
        source.checkResponseError(response);
        const json = JSON.parse(response.data);
        if (!json?.effects?.html) {
            throw new Error('\n(ReaperScans) -> Chapter request returned no data. Contact support.\n');
        }
        return json;
    }
    async createSearchRequestObject($, query, source) {
        const csrf = $('meta[name=csrf-token]').attr('content');
        const requestInfo = $('[wire\\:initial-data]').attr('wire:initial-data');
        if (requestInfo === undefined || csrf === undefined)
            return;
        const jsonObj = JSON.parse(requestInfo);
        const serverMemo = jsonObj.serverMemo ?? '';
        const fingerprint = jsonObj.fingerprint ?? '';
        const updates = JSON.parse(`[{"type":"syncInput","payload":{"id":"${(Math.random() + 1)
            .toString(36)
            .substring(8)}","name":"query","value":"${query.title?.toLowerCase()}"}}]`);
        const body = {
            fingerprint: fingerprint,
            serverMemo: serverMemo,
            updates: updates,
        };
        const request = App.createRequest({
            url: `${source.baseUrl}/livewire/message/${fingerprint.name ?? 'fingerprint.was_none'}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Livewire': 'true',
                'X-CSRF-TOKEN': csrf,
            },
            data: JSON.stringify(body),
        });
        const response = await source.requestManager.schedule(request, source.RETRY);
        source.checkResponseError(response);
        const json = JSON.parse(response.data);
        if (!json?.effects?.html) {
            throw new Error('\n(ReaperScans) -> Search request returned no data. Contact support.\n');
        }
        return json;
    }
}
exports.Helper = Helper;

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const types_1 = require("@paperback/types");
class Parser {
    parseMangaDetails($, mangaId) {
        const title = $('.min-h-80 img').attr('alt') ?? '';
        const image_str = $('.min-h-80 img').attr('data-cfsrc') ?? $('.min-h-80 img').attr('src');
        const image = image_str.substring(image_str.indexOf('https:') ?? 0);
        const desc = $('p.prose').text().trim() ?? '';
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [this.encodeText(title)],
                image,
                status: 'Ongoing',
                tags: [],
                desc: this.encodeText(desc),
            }),
        });
    }
    parseChapter($, mangaId, source) {
        const chapters = [];
        const list = $('ul[role=list]').first();
        for (const obj of $('li', list).toArray()) {
            const id = $('a', obj).attr('href')?.split('/').pop() ?? '';
            const name = $('.font-medium', obj).text().trim();
            const date_str = $('div.mt-2 div p', obj).text().toLowerCase().replace('released', '').trim();
            if (!id)
                continue;
            chapters.push(App.createChapter({
                id,
                name,
                chapNum: Number(name.split(' ')[1] ?? '-1'),
                langCode: 'en',
                time: source.convertTime(date_str),
            }));
        }
        return chapters;
    }
    parseChapterDetails($, mangaId, id) {
        const pages = [];
        for (const item of $('img.max-w-full').toArray()) {
            const page_str = ($(item).attr('data-cfsrc') ?? $(item).attr('src') ?? '').replaceAll(' ', '%20');
            const page = page_str.substring(page_str.indexOf('https:') ?? 0);
            pages.push(page);
        }
        return App.createChapterDetails({
            id,
            mangaId,
            pages,
        });
    }
    parseSearchResults($) {
        const results = [];
        for (const item of $('ul li').toArray()) {
            const id = $('a', item).attr('href')?.split('/').pop() ?? '';
            if ($(item).text() == 'Novels')
                break;
            if (!id)
                continue;
            const title = $('a img', item).attr('alt');
            const subtitle = $('a p span:nth-child(3)', item).text().trim();
            const image_str = $('a img', item).attr('data-cfsrc') ?? $('a img', item).attr('src') ?? '';
            const image = image_str.substring(image_str.indexOf('https:') ?? 0);
            results.push(App.createPartialSourceManga({
                image,
                title: this.encodeText(title),
                mangaId: id,
                subtitle: this.encodeText(subtitle),
            }));
        }
        return results;
    }
    parseViewMore($) {
        const more = [];
        for (const obj of $('div.relative.space-x-2', $('.space-y-4 div')).toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('div a img', obj).attr('alt') ?? '';
            const subtitle = $('a.text-center', obj).first().text().trim().split('\n')[0] ?? '';
            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src');
            const image = image_str.substring(image_str.indexOf('https:') ?? 0);
            if (!id)
                continue;
            if ($('div a', obj).attr('href').includes('novel'))
                continue;
            more.push(App.createPartialSourceManga({
                image,
                title: this.encodeText(title),
                mangaId: id,
                subtitle: subtitle,
            }));
        }
        return more;
    }
    parseHomeSections($, _, sectionCallback) {
        const type = types_1.HomeSectionType.singleRowNormal;
        const section1 = App.createHomeSection({
            id: '1',
            title: 'Today\'s Picks',
            containsMoreItems: false,
            type: types_1.HomeSectionType.featured,
        });
        const section2 = App.createHomeSection({
            id: '2',
            title: 'Latest Comic',
            containsMoreItems: true,
            type: type,
        });
        const featured = [];
        const latest = [];
        for (const obj of $('ul.grid-cols-2 li').toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('div a img', obj).attr('alt') ?? '';
            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src');
            const image = image_str.substring(image_str.indexOf('https:') ?? 0);
            const chnum = $('.flex.mt-4.space-x-2.mb-4 a').first().text().trim() ?? '';
            const type = $('div a div.absolute span', obj).text().trim().toLowerCase() ?? '';
            if (!id)
                continue;
            if (type == 'novel')
                continue;
            featured.push(App.createPartialSourceManga({
                image,
                title: this.encodeText(title),
                mangaId: id,
                subtitle: chnum,
            }));
        }
        section1.items = featured;
        sectionCallback(section1);
        for (const obj of $('div.relative.space-x-2', $('.space-y-4 div')).toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('div a img', obj).attr('alt') ?? '';
            const subtitle = $('p', $('a.text-center', obj).first()).text().trim();
            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src');
            const image = image_str.substring(image_str.indexOf('https:') ?? 0);
            if (!id)
                continue;
            if ($('div a', obj).attr('href').includes('novel'))
                continue;
            latest.push(App.createPartialSourceManga({
                image,
                title: this.encodeText(title),
                mangaId: id,
                subtitle: subtitle,
            }));
        }
        section2.items = latest;
        sectionCallback(section2);
    }
    encodeText(str) {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
            return String.fromCharCode(parseInt(numStr, 10));
        });
    }
}
exports.Parser = Parser;

},{"@paperback/types":61}]},{},[62])(62)
});
