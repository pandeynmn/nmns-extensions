"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlameScans = exports.FlameScansInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const parser_1 = require("./parser");
const FS_DOMAIN = 'https://flamescans.org';
exports.FlameScansInfo = {
    version: '2.0.7',
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
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.124 Safari/537.36 Edg/102.0.1245.44';
class FlameScans extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.baseUrl = FS_DOMAIN;
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
                    response['fixedData'] = response.data ?? Buffer.from(createByteArray(response.rawData)).toString();
                    return response;
                }
            }
        });
        this.RETRY = 5;
        this.parser = new parser_1.Parser();
    }
    getMangaShareUrl(mangaId) {
        return `${this.baseUrl}/series/${mangaId}`;
    }
    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${this.baseUrl}/series/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data ?? response['fixedData']);
        return this.parser.parseMangaDetails($, mangaId);
    }
    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${this.baseUrl}/series/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data ?? response['fixedData']);
        return this.parser.parseChapters($, mangaId, this);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${this.baseUrl}/${chapterId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data ?? response['fixedData']);
        return this.parser.parseChapterDetails($, mangaId, chapterId);
    }
    async getSearchResults(query, metadata) {
        let page = metadata?.page ?? 1;
        if (page == -1)
            return createPagedResults({ results: [], metadata: { page: -1 } });
        const param = `/page/${page}/?s=${(query.title ?? '').replace(/\s/g, '+')}`;
        const request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            param,
        });
        const data = await this.requestManager.schedule(request, this.RETRY);
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
    }
    async getHomePageSections(sectionCallback) {
        const request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data ?? response['fixedData']);
        this.parser.parseHomeSections($, sectionCallback);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        let page = metadata?.page ?? 1;
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
        const response = await this.requestManager.schedule(request, this.RETRY);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data ?? response['fixedData']);
        const manga = this.parser.parseViewMore($);
        page++;
        if (manga.length < 10)
            page = -1;
        return createPagedResults({
            results: manga,
            metadata: { page: page },
        });
    }
    /**
     * Parses a time string from a Madara source into a Date object.
     * Copied from Madara.ts made by gamefuzzy
     */
    convertTime(timeAgo) {
        let time;
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
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
