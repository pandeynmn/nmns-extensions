"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroScans = exports.ZeroScansInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const parser_1 = require("./parser");
const ZEROSCANS_DOMAIN = 'https://zeroscans.com';
exports.ZeroScansInfo = {
    version: '1.0.0',
    name: 'Zero Scans',
    description: 'Extension that pulls manga from Zero Scans.',
    author: 'NmN',
    authorWebsite: 'http://github.com/pandeynmm',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: ZEROSCANS_DOMAIN,
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
class ZeroScans extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.baseUrl = ZEROSCANS_DOMAIN;
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 8000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': userAgent,
                            'referer': `${this.baseUrl}/`
                        }
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                }
            }
        });
        this.RETRY = 5;
        this.parser = new parser_1.Parser();
    }
    getMangaShareUrl(mangaId) {
        return `${this.baseUrl}/comics/${mangaId}`;
    }
    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${this.baseUrl}/comics/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId);
    }
    async getChapters(mangaId) {
        const chapters = [];
        const request = createRequestObject({
            url: `${this.baseUrl}/comics/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const id_html = $.html().toString();
        const start_index = id_html.indexOf('data:[{details:{id:');
        let numericId = id_html.substring(start_index + 19, id_html.indexOf(',name:'));
        if (numericId == 'e') {
            const start_index = id_html.indexOf(',false,"Zero Scans"));') - 5;
            numericId = id_html.substring(start_index);
            numericId = numericId.substring(numericId.indexOf(',') + 1);
            numericId = numericId.substring(0, numericId.indexOf(','));
        }
        let json = null;
        let page = 1;
        do {
            json = await this.createChapterRequest(numericId, page);
            chapters.push(...this.parser.parseChapter(json, mangaId, this));
            page += 1;
        } while (json.data.total > json.data.to);
        return chapters;
    }
    async createChapterRequest(numericId, page) {
        const url = `https://zeroscans.com/swordflake/comic/${numericId}/chapters?sort=asc&page=${page.toString()}`;
        const request = createRequestObject({
            url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        const json = JSON.parse(response.data);
        return json;
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `https://zeroscans.com/swordflake/comic/${mangaId}/chapters/${chapterId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        const json = JSON.parse(response.data);
        return this.parser.parseChapterDetails(json, mangaId, chapterId);
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        if (page == -1)
            return createPagedResults({ results: [], metadata: { page: -1 } });
        const request = createRequestObject({
            url: `${this.baseUrl}/swordflake/comics`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const json = JSON.parse(response.data);
        return createPagedResults({
            results: this.parser.parseSearchResults(json, query),
            metadata: { page: -1 },
        });
    }
    async getSearchTags() {
        const request = createRequestObject({
            url: `${this.baseUrl}/swordflake/comics`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const json = JSON.parse(response.data);
        const genres = [];
        for (const item of json.data.genres) {
            genres.push(createTag({ label: item.name, id: item.slug }));
        }
        const tagSections = [createTagSection({ id: '0', label: 'Genres', tags: genres })];
        return tagSections;
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        if (page == -1)
            return createPagedResults({ results: [], metadata: { page: -1 } });
        const request = createRequestObject({
            url: `${this.baseUrl}/swordflake/comics`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const json = JSON.parse(response.data);
        return createPagedResults({
            results: this.parser.parseViewMore(json),
            metadata: { page: -1 },
        });
    }
    async getHomePageSections(sectionCallback) {
        let request = createRequestObject({
            url: `${this.baseUrl}/swordflake/home`,
            method: 'GET',
        });
        let response = await this.requestManager.schedule(request, this.RETRY);
        const jsonData = JSON.parse(response.data);
        this.CloudFlareError(response.status);
        request = createRequestObject({
            url: `${this.baseUrl}/swordflake/new-chapters`,
            method: 'GET',
        });
        response = await this.requestManager.schedule(request, this.RETRY);
        const releaseData = JSON.parse(response.data);
        this.parser.parseHomeSections(jsonData, releaseData, sectionCallback);
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
            time = new Date(Date.now() - (number * 31556952000));
        }
        else if (date.includes('MONTH') || date.includes('MONTHS')) {
            time = new Date(Date.now() - (number * 2592000000));
        }
        else if (date.includes('WEEK') || date.includes('WEEKS')) {
            time = new Date(Date.now() - (number * 604800000));
        }
        else if (date.includes('YESTERDAY')) {
            time = new Date(Date.now() - 86400000);
        }
        else if (date.includes('DAY') || date.includes('DAYS')) {
            time = new Date(Date.now() - (number * 86400000));
        }
        else if (date.includes('HOUR') || date.includes('HOURS')) {
            time = new Date(Date.now() - (number * 3600000));
        }
        else if (date.includes('MINUTE') || date.includes('MINUTES')) {
            time = new Date(Date.now() - (number * 60000));
        }
        else if (date.includes('SECOND') || date.includes('SECONDS')) {
            time = new Date(Date.now() - (number * 1000));
        }
        else {
            time = new Date(date);
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
exports.ZeroScans = ZeroScans;
