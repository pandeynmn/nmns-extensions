import {
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    Manga,
    MangaTile,
    PagedResults,
    SearchRequest,
    Section,
    Source,
    SourceInfo,
    SourceStateManager,
    TagSection,
    TagType,
} from 'paperback-extensions-common'

import {
    mangaSection,
    getEnabledLanguages } from './Settings'

import { Parser } from './Parser'
import { MangaReaderInterceptor } from './MangaReaderInterceptor'
import { ImageInterceptor } from './interceptors'

const MANGAREADER_DOMAIN = 'https://mangareader.to'

export const MangaReaderToInfo: SourceInfo = {
    version: '2.1.1',
    name: 'MangaReaderTo',
    description: 'Extension that pulls manga from mangareader.to \nCanvas code by @Paper#1932',
    author: 'NmN | Ruii',
    authorWebsite: 'http://github.com/pandeynmm',
    icon: 'icon.ico',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: MANGAREADER_DOMAIN,
    sourceTags: [
        {
            text: 'English',
            type: TagType.GREY,
        },
        {
            text: 'Experimental',
            type: TagType.YELLOW,
        },
    ],
}

export class MangaReaderTo extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 80000,
        interceptor: new MangaReaderInterceptor([new ImageInterceptor()]),
    })

    RETRY = 5
    parser = new Parser()
    stateManager: SourceStateManager = createSourceStateManager({})

    override getMangaShareUrl(mangaId: string): string {
        return `${MANGAREADER_DOMAIN}/${mangaId}`
    }

    override async getSourceMenu(): Promise<Section> {
        return Promise.resolve(createSection({
            id: 'main',
            header: 'Source Settings',
            rows: async () => [
                await mangaSection(this.stateManager),
            ]
        }))
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, this.RETRY)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const idd = mangaId.split('-')
        const request = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/ajax/manga/reading-list/${idd[idd.length-1]}?readingBy=chap`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, this.RETRY)
        const jsonData = JSON.parse(response.data)
        const $ = this.cheerio.load(jsonData.html)

        const selected_langs = await getEnabledLanguages(this.stateManager)
        return this.parser.parseChapters($, mangaId, selected_langs)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `https://mangareader.to/ajax/image/list/chap/${chapterId}?mode=vertical&quality=high&hozPageSize=1`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, this.RETRY)
        const jsonData = JSON.parse(response.data)
        const $ = this.cheerio.load(jsonData.html)

        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })

        const param = `/search?keyword=${(query.title ?? '').replaceAll(' ', '+')}&page=${page}`
        const request = createRequestObject({
            url: MANGAREADER_DOMAIN,
            method: 'GET',
            param,
        })

        const data = await this.requestManager.schedule(request, this.RETRY)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($)

        page++
        if (manga.length < 18) page = -1

        return createPagedResults({
            results: manga,
            metadata: { page: page },
        })
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/home`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, this.RETRY)
        const $ = this.cheerio.load(response.data)
        this.parser.parseHomeSections($, sectionCallback)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })

        let url = ''
        if      (homepageSectionId == '1') url = `${MANGAREADER_DOMAIN}/latest-updated`
        else if (homepageSectionId == '3') url = `${MANGAREADER_DOMAIN}/most-viewed`
        else if (homepageSectionId == '4') url = `${MANGAREADER_DOMAIN}/completed`

        const request = createRequestObject({
            url,
            method: 'GET',
            param: `?page=${page}`,
        })

        const response = await this.requestManager.schedule(request, this.RETRY)
        const $ = this.cheerio.load(response.data)
        const manga: MangaTile[] = this.parser.parseViewMore($)

        page++
        if (manga.length < 10) page = -1

        return createPagedResults({
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
}


// npm i paperback-extensions-common@5.0.0-alpha.5 paperback-cli@2.0.0-alpha.13
