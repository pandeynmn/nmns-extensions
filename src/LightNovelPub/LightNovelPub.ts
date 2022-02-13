import {
    Chapter,
    ChapterDetails,
    ContentRating,
    HomeSection,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    PagedResults,
    Response,
    SearchRequest,
    Source,
    SourceInfo,
    Tag,
    RequestManager,
    TagType,
    SourceStateManager,
    Section,
    FormRow
} from 'paperback-extensions-common'

import { decodeHTMLEntity,
    ImageOptions,
    interceptResponse,
    spliterate } from '../LNInterceptor'
import { Parser } from './parser'

import { COLORS,
    getBackgroundColor,
    getFont,
    getTextColor,
    settings,
    getFontSize,
    getImageWidth,
    getLinesPerPage,
    getHorizontalPadding,
    getVerticalPadding,
    getSettingsString} from './settings'

const LNPUB_DOMAIN = 'https://www.lightnovelpub.com'
const REQUEST_RETRIES = 5

export const LightNovelPubInfo: SourceInfo = {
    version: '0.0.1',
    name: 'LightNovelPub',
    description: 'Extension that pulls manga from LightNovelPub.',
    author: 'NmN',
    authorWebsite: 'http://github.com/pandeynmm',
    icon: 'icon.jpg',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: LNPUB_DOMAIN,
    sourceTags: [
        {
            text: 'English',
            type: TagType.GREY,
        },
        {
            text: 'Light Novel',
            type: TagType.BLUE,
        },
    ],
}

export class LightNovelPub extends Source {
    parser = new Parser()
    stateManager: SourceStateManager = createSourceStateManager({})

    options = async(): Promise<ImageOptions> => {
        return {
            textColor: COLORS[(await getTextColor(this.stateManager)).toLowerCase().replace(' ', '_')],
            backgroundColor: COLORS[(await getBackgroundColor(this.stateManager)).toLowerCase().replace(' ', '_')],
            font: `${(await getFont(this.stateManager)).toLowerCase().replace(' ', '')}${await getFontSize(this.stateManager)}`,
            padding: {
                horizontal: await getHorizontalPadding(this.stateManager),
                vertical: await getVerticalPadding(this.stateManager)
            },
            width: await getImageWidth(this.stateManager),
            constantWidth: true,
            lines: await getLinesPerPage(this.stateManager)
        }
    }

    requestManager: RequestManager = createRequestManager({
        requestsPerSecond: 10,
        requestTimeout: 10000,
        interceptor: {
            interceptRequest: async (request) => {return request},
            interceptResponse: async (response) => {return interceptResponse(response, this.cheerio, await this.options(), '#chapter-container > p')}
        }
    })
    override async getSourceMenu(): Promise<Section> {
        return settings(this.stateManager)
    }
    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${LNPUB_DOMAIN}/novel/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId)
    }
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${LNPUB_DOMAIN}/novel/${mangaId}/chapters`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, this)

    }
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${LNPUB_DOMAIN}/novel/${mangaId}/${chapterId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        const $ = this.cheerio.load(response.data)
        const pages: string[] = []
        const textSegments: string[] = []
        const chapterText = $('#chapter-container > p').toArray()
        for(const chapterTextSeg of chapterText) {
            textSegments.push(decodeHTMLEntity($(chapterTextSeg).text()))
        }
        const text = textSegments.join('\n')
        const lines = Math.ceil(spliterate(text.replace(/[^\x00-\x7F]/g, ''), (await getImageWidth(this.stateManager))-(await getHorizontalPadding(this.stateManager))*2, `${(await getFont(this.stateManager)).toLowerCase().replace(' ', '')}${await getFontSize(this.stateManager)}`).split.length/(await getLinesPerPage(this.stateManager)))
        console.log(`lines: ${lines}`)
        for(let i = 1; i <= lines; i++) {
            pages.push(`${LNPUB_DOMAIN}/novel/${mangaId}/${chapterId}/?ttiparse&ttipage=${i}&ttisettings=${encodeURIComponent(await getSettingsString(this.stateManager))}`)
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })
    }
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        if(!query.title || query.title.length < 3) return createPagedResults({ results: [] })
        const request = createRequestObject({
            url: `${LNPUB_DOMAIN}/search/${query.title === undefined ? '' : `?searchkey=${encodeURIComponent(query.title)}`}`,
            method: 'POST',
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        const $ = this.cheerio.load(response.data)
        const htmlResults = $('div.ss-custom > div').toArray()
        const results: MangaTile[] = []
        for(const htmlResult of htmlResults) {
            const a = $('div.pic > a', htmlResult)
            results.push(createMangaTile({
                id: $(a).attr('href').substring(1).split('.')[0],
                title: createIconText({ text: $('img', a).attr('title')}),
                image: $('img', a).attr('src')
            }))
        }
        return createPagedResults({ results: results })
    }
    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: `${LNPUB_DOMAIN}/hot`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 2)
        const $ = this.cheerio.load(response.data)

        this.parser.parseHomeSections($, sectionCallback)
    }
    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1
        const request = createRequestObject({
            url: `${LNPUB_DOMAIN}/${homepageSectionId}/${page}/`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        const $ = this.cheerio.load(response.data)
        const lastPage = parseInt($('div.pages > ul > li').children('a').last().text()) === page
        const htmlResults = $('div.ss-custom > div').toArray()
        const results: MangaTile[] = []
        for(const htmlResult of htmlResults) {
            const a = $('div.pic > a', htmlResult)
            results.push(createMangaTile({
                id: $(a).attr('href').substring(1).split('.')[0],
                title: createIconText({ text: $('img', a).attr('title')}),
                image: $('img', a).attr('src')
            }))
        }
        return createPagedResults({
            results: results,
            metadata: lastPage ? undefined : {page: page + 1}
        })
    }
    override getMangaShareUrl(mangaId: string): string {
        return `${LNPUB_DOMAIN}/${mangaId}`
    }

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

