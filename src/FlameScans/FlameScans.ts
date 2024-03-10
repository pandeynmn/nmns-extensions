import {
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    PagedResults,
    SearchRequest,
    Request,
    Response,
    SourceInfo,
    SourceManga,
    BadgeColor,
    SearchResultsProviding,
    MangaProviding,
    ChapterProviding,
    HomePageSectionsProviding,
    PartialSourceManga,
    SourceIntents,
    RequestManager,
} from '@paperback/types'

import { Parser } from './parser'

const FS_DOMAIN = 'https://flamescans.org'

export const FlameScansInfo: SourceInfo = {
    version: '3.0.0',
    name: 'FlameScans',
    description: 'Extension that pulls manga from Flame Scans.',
    author: 'NmN',
    authorWebsite: 'http://github.com/pandeynmm',
    icon: 'icon.ico',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: FS_DOMAIN,
    sourceTags: [
        {
            text: 'English',
            type: BadgeColor.GREY,
        },
        {
            text: 'Cloudflare',
            type: BadgeColor.RED,
        },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
}
const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.124 Safari/537.36 Edg/102.0.1245.44'


export class FlameScans implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
    baseUrl = FS_DOMAIN
    requestManager = App.createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 8000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': userAgent,
                        referer: `${this.baseUrl}/`,
                    },
                }
                return request
            },
            interceptResponse: async (response: FSResponse): Promise<Response> => {
                if (!response.rawData) return response
                response['fixedData'] = response.data ?? Buffer.from(App.createByteArray(response.rawData)).toString()
                return response
            },
        },
    })

    constructor(private cheerio: CheerioAPI) { }

    RETRY = 5
    parser = new Parser()
    getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/series/${mangaId}`
    }
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${this.baseUrl}/series/${mangaId}`,
            method: 'GET',
        })
        const response: { [key: string]: any } = await this.requestManager.schedule(request, this.RETRY)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data ?? response['fixedData'])
        return this.parser.parseMangaDetails($, mangaId)
    }
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${this.baseUrl}/series/${mangaId}`,
            method: 'GET',
        })
        const response: { [key: string]: any } = await this.requestManager.schedule(request, this.RETRY)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data ?? response['fixedData'])
        return this.parser.parseChapters($, mangaId, this)
    }
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${this.baseUrl}/${chapterId}`,
            method: 'GET',
        })
        const response: { [key: string]: any } = await this.requestManager.schedule(request, this.RETRY)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data ?? response['fixedData'])
        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return App.createPagedResults({ results: [], metadata: { page: -1 } })
        const param = `/page/${page}/?s=${(query.title ?? '').replace(/\s/g, '+')}`
        const request = App.createRequest({
            url: `${this.baseUrl}`,
            method: 'GET',
            param,
        })
        const data = await this.requestManager.schedule(request, this.RETRY)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($)
        page++
        if (manga.length < 10) page = -1
        return App.createPagedResults({
            results: manga,
            metadata: { page: page },
        })
    }
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: `${this.baseUrl}`,
            method: 'GET',
        })
        const response: { [key: string]: any } = await this.requestManager.schedule(request, this.RETRY)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data ?? response['fixedData'])
        this.parser.parseHomeSections($, sectionCallback)
    }
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return App.createPagedResults({ results: [], metadata: { page: -1 } })
        let url = ''
        if (homepageSectionId == '2') url = `${this.baseUrl}/series/?page=${page}&order=update`
        else if (homepageSectionId == '3') url = `${this.baseUrl}/series/?page=${page}?status=&type=&order=popular`
        const request = App.createRequest({
            url,
            method: 'GET',
        })
        const response: { [key: string]: any } = await this.requestManager.schedule(request, this.RETRY)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data ?? response['fixedData'])
        const manga: PartialSourceManga[] = this.parser.parseViewMore($)
        page++
        if (manga.length < 10) page = -1
        return App.createPagedResults({
            results: manga,
            metadata: { page: page },
        })
    }
    /**
     * Parses a time string from a Madara source into a Date object.
     * Copied from Madara.ts made by gamefuzzy
     */
    protected convertTime(timeAgo: string): Date {
        let time: Date
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0])
        trimmed = trimmed == 0 && timeAgo.includes('a') ? 1 : trimmed
        if (timeAgo.includes('mins') || timeAgo.includes('minutes') || timeAgo.includes('minute')) {
            time = new Date(Date.now() - trimmed * 60000)
        } else if (timeAgo.includes('hours') || timeAgo.includes('hour')) {
            time = new Date(Date.now() - trimmed * 3600000)
        } else if (timeAgo.includes('days') || timeAgo.includes('day')) {
            time = new Date(Date.now() - trimmed * 86400000)
        } else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000)
        } else {
            time = new Date(timeAgo)
        }
        return time
    }
    getCloudflareBypassRequest(): Request {
        return App.createRequest({
            url: this.baseUrl,
            method: 'GET',
            headers: {
                'user-agent': userAgent,
                referer: `${this.baseUrl}/`,
            },
        })
    }
    CloudFlareError(status: any) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > <The name of this source> and press Cloudflare Bypass')
        }
    }
}
// xOnlyFadi
export interface FSResponse extends Response {
    fixedData: string
}
export interface FSRequestManager extends RequestManager {
    schedule: (request: Request, retryCount: number) => Promise<FSResponse>
}
