"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaReaderTo = exports.MangaReaderToInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Settings_1 = require("./Settings");
const Parser_1 = require("./Parser");
const MangaReaderInterceptor_1 = require("./MangaReaderInterceptor");
const interceptors_1 = require("./interceptors");
const MANGAREADER_DOMAIN = 'https://mangareader.to';
exports.MangaReaderToInfo = {
    version: '2.1.1',
    name: 'MangaReaderTo',
    description: 'Extension that pulls manga from mangareader.to \nCanvas code by @Paper#1932',
    author: 'NmN | Ruii',
    authorWebsite: 'http://github.com/pandeynmm',
    icon: 'icon.ico',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: MANGAREADER_DOMAIN,
    sourceTags: [
        {
            text: 'English',
            type: paperback_extensions_common_1.TagType.GREY,
        },
        {
            text: 'Experimental',
            type: paperback_extensions_common_1.TagType.YELLOW,
        },
    ],
};
class MangaReaderTo extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 5,
            requestTimeout: 80000,
            interceptor: new MangaReaderInterceptor_1.MangaReaderInterceptor([new interceptors_1.ImageInterceptor()]),
        });
        this.RETRY = 5;
        this.parser = new Parser_1.Parser();
        this.stateManager = createSourceStateManager({});
    }
    getMangaShareUrl(mangaId) {
        return `${MANGAREADER_DOMAIN}/${mangaId}`;
    }
    async getSourceMenu() {
        return Promise.resolve(createSection({
            id: 'main',
            header: 'Source Settings',
            rows: async () => [
                await (0, Settings_1.mangaSection)(this.stateManager),
            ]
        }));
    }
    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId);
    }
    async getChapters(mangaId) {
        const idd = mangaId.split('-');
        const request = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/ajax/manga/reading-list/${idd[idd.length - 1]}?readingBy=chap`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        const jsonData = JSON.parse(response.data);
        const $ = this.cheerio.load(jsonData.html);
        const selected_langs = await (0, Settings_1.getEnabledLanguages)(this.stateManager);
        return this.parser.parseChapters($, mangaId, selected_langs);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `https://mangareader.to/ajax/image/list/chap/${chapterId}?mode=vertical&quality=high&hozPageSize=1`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        const jsonData = JSON.parse(response.data);
        const $ = this.cheerio.load(jsonData.html);
        return this.parser.parseChapterDetails($, mangaId, chapterId);
    }
    async getSearchResults(query, metadata) {
        let page = metadata?.page ?? 1;
        if (page == -1)
            return createPagedResults({ results: [], metadata: { page: -1 } });
        const param = `/search?keyword=${(query.title ?? '').replaceAll(' ', '+')}&page=${page}`;
        const request = createRequestObject({
            url: MANGAREADER_DOMAIN,
            method: 'GET',
            param,
        });
        const data = await this.requestManager.schedule(request, this.RETRY);
        const $ = this.cheerio.load(data.data);
        const manga = this.parser.parseSearchResults($);
        page++;
        if (manga.length < 18)
            page = -1;
        return createPagedResults({
            results: manga,
            metadata: { page: page },
        });
    }
    async getHomePageSections(sectionCallback) {
        const request = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/home`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        const $ = this.cheerio.load(response.data);
        this.parser.parseHomeSections($, sectionCallback);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        let page = metadata?.page ?? 1;
        if (page == -1)
            return createPagedResults({ results: [], metadata: { page: -1 } });
        let url = '';
        if (homepageSectionId == '1')
            url = `${MANGAREADER_DOMAIN}/latest-updated`;
        else if (homepageSectionId == '3')
            url = `${MANGAREADER_DOMAIN}/most-viewed`;
        else if (homepageSectionId == '4')
            url = `${MANGAREADER_DOMAIN}/completed`;
        const request = createRequestObject({
            url,
            method: 'GET',
            param: `?page=${page}`,
        });
        const response = await this.requestManager.schedule(request, this.RETRY);
        const $ = this.cheerio.load(response.data);
        const manga = this.parser.parseViewMore($);
        page++;
        if (manga.length < 10)
            page = -1;
        return createPagedResults({
            results: manga,
            metadata: { page: page },
        });
    }
}
exports.MangaReaderTo = MangaReaderTo;
