import {
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    Manga,
    MangaTile,
    PagedResults,
    SearchRequest,
    Source,
    SourceInfo,
    TagSection,
    TagType,
} from 'paperback-extensions-common'

import { Parser } from './Parser'
import { MangaReaderInterceptor } from './MangaReaderInterceptor'
import { ImageInterceptor } from './interceptors'

const MANGAREADER_DOMAIN = 'https://mangareader.to'

export const MangaReaderToInfo: SourceInfo = {
    version: '2.0.0',
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
    ],
}

export class MangaReaderTo extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 80000,
        interceptor: new MangaReaderInterceptor([new ImageInterceptor()]),
    })

    parser = new Parser()

    override getMangaShareUrl(mangaId: string): string {
        return `${MANGAREADER_DOMAIN}/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 3)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/${mangaId}`,
            method: 'GET',
        })

        const idd = mangaId.split('-')
        const chapRequest = createRequestObject({
            url: `${MANGAREADER_DOMAIN}/ajax/manga/reading-list/${idd[idd.length-1]}?readingBy=chap`,
            method: 'GET',
        })

        let response = await this.requestManager.schedule(chapRequest, 3)
        const jsonData = JSON.parse(response.data)
        let $ = this.cheerio.load(jsonData.html)
        console.log(`this is new data 2 ${$.html()}`)

        const arrOfIds: string[] = this.parser.parseChapterId($)

        response = await this.requestManager.schedule(request, 3)
        $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, arrOfIds)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `https://mangareader.to/ajax/image/list/chap/${chapterId}?mode=vertical&quality=high&hozPageSize=1`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 3)
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

        const data = await this.requestManager.schedule(request, 2)
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
        const response = await this.requestManager.schedule(request, 2)
        const $ = this.cheerio.load(response.data)

        this.parser.parseHomeSections($, sectionCallback)
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
