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

import { Parser } from './parser'

const FS_DOMAIN = 'https://flamescans.org'

export const FlameScansInfo: SourceInfo = {
    version: '2.0.1',
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
            type: TagType.GREY,
        },
    ],
}

export class FlameScans extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 3,
    })

    TIMEOUT = 12
    parser = new Parser()

    override getMangaShareUrl(mangaId: string): string {
        return `${FS_DOMAIN}/series/${mangaId}`
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${FS_DOMAIN}/series/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, this.TIMEOUT)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${FS_DOMAIN}/series/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, this.TIMEOUT)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, this)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: chapterId,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, this.TIMEOUT)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }


    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })

        // const param = `/?page=${page}${this.addTags(query)}&title=${query.title}`
        const param = `/page/${page}/?s=${(query.title ?? '').replace(/\s/g, '+')}`
        const request = createRequestObject({
            url: `${FS_DOMAIN}`,
            method: 'GET',
            param,
        })

        const data = await this.requestManager.schedule(request, this.TIMEOUT)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($)

        page++
        if (manga.length < 10) page = -1

        return createPagedResults({
            results: manga,
            metadata: { page: page },
        })
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: `${FS_DOMAIN}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, this.TIMEOUT)
        const $ = this.cheerio.load(response.data)

        this.parser.parseHomeSections($, sectionCallback)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        let url = ''
        if      (homepageSectionId == '2') url = `${FS_DOMAIN}/series/?page=${page}&order=update`
        else if (homepageSectionId == '3') url = `${FS_DOMAIN}/series/?page=${page}?status=&type=&order=popular`
        const request = createRequestObject({
            url,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, this.TIMEOUT)
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

    // addTags(query: SearchRequest): string {
    //     let tag_str = ''
    //     if (query.includedTags?.length != null) {
    //         tag_str = '&genre_inc='
    //         for (const tag of query.includedTags) {
    //             tag_str += `${tag.id},`
    //         }
    //     }

    //     if (query.excludedTags?.length != null) {
    //         tag_str += '&genre_exc='
    //         for (const tag of query.excludedTags) {
    //             tag_str += `${tag.id},`
    //         }
    //     }
    //     return tag_str.replace(/,\s*$/, '')
    // }
}
