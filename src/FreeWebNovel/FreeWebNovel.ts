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
    Request,
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
    interceptResponse,
    spliterate } from './FreeWebNovelResponseInterceptor'

const WEBSITE_URL = 'https://freewebnovel.com'
const REQUEST_RETRIES = 3
const MAX_PAGE_WIDTH = 800
const LINES_PER_PAGE = 60.0
const SETTINGS: any = {
    textColor: ['White', 'Light Gray', 'Brown', 'Dark Gray', 'Black'],
    backgroundColor: ['White', 'Sepia', 'Dark Gray', 'Black'],
    fontSize: ['18', '24', '30', '36'],
    font: ['San Francisco']
}

const COLORS: any = {
    white: 0xFFFFFF,
    light_gray: 0xDDDDDD,
    brown: 0x4C3320,
    sepia: 0xF2E5C9,
    dark_gray: 0x444444,
    black: 0x000000
}

export class FreeWebNovel extends Source {
    requestManager: RequestManager = createRequestManager({
        requestsPerSecond: 1,
        requestTimeout: 5000,
        interceptor: {
            interceptRequest: async (request) => {return request},
            interceptResponse: async (response) => {return interceptResponse(response, this.cheerio, {
                textColor: COLORS[(await getTextColor(this.stateManager)).toLowerCase()],
                backgroundColor: COLORS[(await getBackgroundColor(this.stateManager)).toLowerCase()],
                font: `${(await getFont(this.stateManager)).toLowerCase().replace(' ', '')}${await getFontSize(this.stateManager)}`,
                padding: {
                    horizontal: await getHorizontalPadding(this.stateManager),
                    vertical: await getVerticalPadding(this.stateManager)
                }
            })}
        }
    })
    stateManager: SourceStateManager = createSourceStateManager({})
    override async getSourceMenu(): Promise<Section> {
        return styleSettings(this.stateManager)
    }
    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${WEBSITE_URL}/${mangaId}.html`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        const $ = this.cheerio.load(response.data)
        const htmlInfo = $('div.m-book1')
        const titles: string[] = [$('h1.tit', htmlInfo).text()]
        const tagStrings: string[] = []
        let status = MangaStatus.UNKNOWN
        let author = undefined
        for(const object of $('div.txt > div', htmlInfo).toArray()) {
            switch($('span.glyphicon', object).attr('title')) {
                case 'Alternative names': titles.push(...($('span.s1', object).text().split(', '))); break
                case 'Author': author = $('span.s1', object).text(); break
                case 'Genre': tagStrings.push(...($('span.s1', object).text().split(', '))); break
                case 'Status': status = $('span.s1', object).text().toLowerCase() === 'completed' ? MangaStatus.COMPLETED : MangaStatus.ONGOING
            }
        }
        const tags: Tag[] = []
        for(const tag of tagStrings) {
            tags.push(createTag({ id: tag, label: tag }))
        }
        return createManga({
            id: mangaId,
            titles: titles,
            image: $('div.pic > img', htmlInfo).attr('src'),
            status: status,
            author: author,
            tags: [createTagSection({ id: 'genres', label: 'Genres', tags: tags })]
        })
    }
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${WEBSITE_URL}/${mangaId}.html`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        let $ = this.cheerio.load(response.data)
        const chapterPages = $('div.page > select > option').toArray()
        const chapters: Chapter[] = []
        while(chapterPages.length > 0) {
            const option = chapterPages.shift()
            const newRequest = createRequestObject({
                url: `${WEBSITE_URL}${$(option).attr('value')}`,
                method: 'GET',
            })
            const newResponse = await this.requestManager.schedule(newRequest, REQUEST_RETRIES)
            $ = this.cheerio.load(newResponse.data)
            const embeddedChapters = $('div.m-newest2 > ul.ul-list5 > li').toArray()
            for(const embeddedChapter of embeddedChapters) {
                const link = $('a', embeddedChapter).attr('href')
                chapters.push(createChapter({
                    id: link.substring(1, link.indexOf('.')),
                    mangaId: mangaId,
                    chapNum: isNaN(parseInt(link.substring(link.lastIndexOf('-')+1, link.indexOf('.')))) ? 0 : parseInt(link.substring(link.lastIndexOf('-')+1, link.indexOf('.'))),
                    langCode: LanguageCode.ENGLISH,
                    name: $(embeddedChapter).text()
                }))
            }
        }
        return chapters
    }
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${WEBSITE_URL}/${chapterId}.html`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        const $ = this.cheerio.load(response.data)
        const pages: string[] = []
        const textSegments: string[] = []
        const chapterText = $('div.txt > p').toArray()
        for(const chapterTextSeg of chapterText) {
            textSegments.push(decodeHTMLEntity($(chapterTextSeg).text()))
        }
        const text = textSegments.join('\n')
        const lines = Math.ceil(spliterate(text.replace(/[^\x00-\x7F]/g, ''), MAX_PAGE_WIDTH-(await getHorizontalPadding(this.stateManager))*2, `${(await getFont(this.stateManager)).toLowerCase().replace(' ', '')}${await getFontSize(this.stateManager)}`).split.length/LINES_PER_PAGE)
        for(let i = 1; i <= lines; i++) {
            pages.push(`${WEBSITE_URL}/${chapterId}.html?ttiparse&ttipage=${i}`)
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        if(!query.title || query.title.length < 3) return createPagedResults({ results: [] })
        const request = createRequestObject({
            url: `${WEBSITE_URL}/search/?searchkey=${query.title}`,
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
        const section = createHomeSection({
            id: 'recently_updated',
            title: 'Recently Updated Novels',
            view_more: true,
        })
        const request = createRequestObject({
            url: `${WEBSITE_URL}/latest-release-novel/`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, REQUEST_RETRIES)
        const $ = this.cheerio.load(response.data)
        sectionCallback(section)
        section.items = [

            createMangaTile({
                id: 'the-demonic-king-chases-his-wife-the-rebellious-good-for-nothing-miss',
                title: createIconText({text: 'test'}),
                image: ''
            })
        ]
        sectionCallback(section)
    }
    override getCloudflareBypassRequest(): Request {
        return createRequestObject({
            url: WEBSITE_URL,
            method: 'GET'
        })
    }
}

export const FreeWebNovelInfo: SourceInfo = {
    version: '1.0.0',
    name: 'FreeWebNovel',
    icon: 'icon.jpg',
    author: 'JimIsWayTooEpic',
    authorWebsite: 'https://jimphieffer.com/paperback/',
    description: 'Source for FreeWebNovel. Created by JimIsWayTooEpic.',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: WEBSITE_URL,
    language: 'English',
    sourceTags: [
        {
            text: 'Light Novel',
            type: TagType.BLUE
        },
        {
            text: 'Experimental',
            type: TagType.YELLOW
        }
    ]
}

async function getTextColor(stateManager: SourceStateManager): Promise<string> {
    return (await stateManager.retrieve('text_color') as string) ?? 'Black'
}
async function getBackgroundColor(stateManager: SourceStateManager): Promise<string> {
    return (await stateManager.retrieve('background_color') as string) ?? 'White'
}
async function getFontSize(stateManager: SourceStateManager): Promise<number> {
    return (await stateManager.retrieve('font_size') as number) ?? 18
}
async function getFont(stateManager: SourceStateManager): Promise<string> {
    return (await stateManager.retrieve('font') as string) ?? 'San Francisco'
}
async function getHorizontalPadding(stateManager: SourceStateManager): Promise<number> {
    return parseInt(await stateManager.retrieve('horizontal_padding') as string) ?? 20
}
async function getVerticalPadding(stateManager: SourceStateManager): Promise<number> {
    return parseInt(await stateManager.retrieve('vertical_padding') as string) ?? 20
}

async function styleSettings(stateManager: SourceStateManager): Promise<Section> {
    return Promise.resolve(createSection({
        id: 'main',
        header: 'Source Settings',
        rows: async () => [
            createNavigationButton({
                label: 'Reader Style',
                value: '',
                id: 'style',
                form: createForm({
                    sections: async (): Promise<Section[]> => {
                        return [
                            createSection({
                                id: '',
                                rows: async (): Promise<FormRow[]> => {
                                    return [
                                        createSelect({
                                            label: 'Text Color',
                                            options: SETTINGS.textColor,
                                            displayLabel: option => {return option},
                                            value: [await getTextColor(stateManager)],
                                            id: 'text_color',
                                            allowsMultiselect: false
                                        }),
                                        createSelect({
                                            label: 'Background Color',
                                            options: SETTINGS.backgroundColor,
                                            displayLabel: option => {return option},
                                            value: [await getBackgroundColor(stateManager)],
                                            id: 'background_color',
                                            allowsMultiselect: false
                                        }),
                                        createSelect({
                                            label: 'Font',
                                            options: SETTINGS.font,
                                            displayLabel: option => {return option},
                                            value: [await getFont(stateManager)],
                                            id: 'font',
                                            allowsMultiselect: false
                                        }),
                                        createSelect({
                                            label: 'Font Size',
                                            options: SETTINGS.fontSize,
                                            displayLabel: option => {return option},
                                            value: [(await getFontSize(stateManager)).toString()],
                                            id: 'font_size',
                                            allowsMultiselect: false
                                        }),
                                        createInputField({
                                            placeholder: 'Horizontal Padding',
                                            maskInput: false,
                                            value: (await getHorizontalPadding(stateManager)).toString(),
                                            id: 'horizontal_padding'
                                        }),
                                        createInputField({
                                            placeholder: 'Vertical Padding',
                                            maskInput: false,
                                            value: (await getVerticalPadding(stateManager)).toString(),
                                            id: 'vertical_padding'
                                        })
                                    ]
                                }
                            })
                        ]
                    },
                    onSubmit: async (values: any): Promise<void> => {
                        return Promise.all([
                            stateManager.store('text_color', values.text_color[0]),
                            stateManager.store('background_color', values.background_color[0]),
                            stateManager.store('font_size', values.font_size[0]),
                            stateManager.store('font', values.font[0]),
                            stateManager.store('horizontal_padding', values.horizontal_padding),
                            stateManager.store('vertical_padding', values.vertical_padding)
                        ]).then()
                    },
                    validate: async (values: any): Promise<boolean> => {
                        return !isNaN(parseInt(values.horizontal_padding)) && !isNaN(parseInt(values.vertical_padding))
                    }
                })
            })
        ]
    }))
}