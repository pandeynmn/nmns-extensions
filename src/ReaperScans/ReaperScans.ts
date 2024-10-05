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
    SourceIntents,
    SourceManga,
    SourceStateManager,
    BadgeColor,
    SearchResultsProviding,
    MangaProviding,
    ChapterProviding,
    HomePageSectionsProviding,
} from "@paperback/types"

import { Parser } from "./parser"
import { MangaItem } from "./types/MangaItem"

import {
    QueryData,
    QueryResult,
    RSChapterDetails,
    RSCHapterDetailsData,
    RSChapterList,
    RSChapterListData,
    RSMangaDetails,
} from "./types"

const REAPERSCANS_DOMAIN = "https://reaperscans.com"
const REAPERSCANS_DOMAIN_API = "https://api.reaperscans.com"
const REAPERSCANS_CDN = "https://media.reaperscans.com/file/4SRBHm" // https://domain.tld/file/<bucket>/<file>
const ID_SEP = "|#|"
// https://media.reaperscans.com/file/4SRBHm//comics/c22c1254-ce3c-4628-b3ad-34df82e40cd8/tdDPcgIEfalT3qvWpQQgVZECpadGpI9azYAxFcOo.jpg

//SECTION - SourceInfo
export const ReaperScansInfo: SourceInfo = {
    version: "5.2",
    name: "ReaperScans",
    description: "Reaperscans source for 0.8",
    author: "NmN",
    authorWebsite: "http://github.com/pandeynmm",
    icon: "icon.png",
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: REAPERSCANS_DOMAIN,
    sourceTags: [
        {
            text: "English",
            type: BadgeColor.GREY,
        },
    ],
    intents:
        SourceIntents.MANGA_CHAPTERS |
        SourceIntents.HOMEPAGE_SECTIONS |
        SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
}

//SECTION - ReaperScans
export class ReaperScans
    implements
        SearchResultsProviding,
        MangaProviding,
        ChapterProviding,
        HomePageSectionsProviding
{
    //LINK - Class variables
    baseUrl = REAPERSCANS_DOMAIN
    apiUrl = REAPERSCANS_DOMAIN_API
    stateManager: SourceStateManager = App.createSourceStateManager()
    RETRY = 5
    parser = new Parser()

    //LINK - Manager
    requestManager = App.createRequestManager({
        requestsPerSecond: 6,
        requestTimeout: 8000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        "user-agent":
                            await this.requestManager.getDefaultUserAgent(),
                        referer: `${this.baseUrl}`,
                    },
                }
                return request
            },
            interceptResponse: async (
                response: Response
            ): Promise<Response> => {
                return response
            },
        },
    })

    //LINK - URL
    getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/series/${mangaId.split("|#|")[1]}`
    }

    //LINK - M-Details
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${this.apiUrl}/series/${mangaId.split("|#|")[1]}`,
            method: "GET",
        })
        const response = await this.requestManager.schedule(request, 1)
        this.checkResponseError(response)
        const mangaDetails = JSON.parse(response.data ?? "[]") as RSMangaDetails
        return this.parser.parseMangaDetails(mangaDetails, mangaId)
    }

    //LINK - Chapters
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const chapters: Chapter[] = []
        const params = {
            perPage: 10000,
            series_id: mangaId.split(ID_SEP)[0],
            page: 1,
        }

        const queryString = this.parser.joinParams(params)
        const constructedURL = `${this.apiUrl}/chapter/query?adult=true${queryString}`

        const request = App.createRequest({
            url: constructedURL,
            method: "GET",
            headers: {
                "user-agent": await this.requestManager.getDefaultUserAgent(),
                referer: `${this.baseUrl}/`,
            },
        })

        const response = await this.requestManager.schedule(request, 1)
        this.checkResponseError(response)
        const json = JSON.parse(response.data ?? "[]") as RSChapterList
        const chapterList = json.data as RSChapterListData[]

        for (const item of chapterList) {
            chapters.push(
                App.createChapter({
                    id: item.chapter_slug?.toString() ?? "",
                    name: item.chapter_name,
                    chapNum: Number(
                        item.chapter_name?.replace("Chapter", "") ?? "-1"
                    ),
                    langCode: "en",
                    time: new Date(item.created_at ?? "0"),
                })
            )
        }

        return chapters
    }

    //LINK - C-Details
    async getChapterDetails(
        mangaId: string,
        chapterId: string
    ): Promise<ChapterDetails> {
        // https://api.reaperscans.com/chapter/hard-carry-support/chapter-71
        const request = App.createRequest({
            url: `${this.apiUrl}/chapter/${
                mangaId.split(ID_SEP)[1]
            }/${chapterId}`,
            method: "GET",
        })
        const response = await this.requestManager.schedule(request, 1)
        this.checkResponseError(response)
        const json = JSON.parse(response.data ?? "[]") as RSChapterDetails
        const dataLatest = (json.chapter ?? []) as RSCHapterDetailsData

        let pages = []
        console.log("DEBUGGER")
        for (const i of dataLatest.chapter_data.files ?? []) {
            const image = i.url
            if (image.startsWith(REAPERSCANS_CDN)) {
                pages.push(image)
            } else {
                pages.push(`${REAPERSCANS_CDN}/${image}`)
            }
        }
        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        })
    }

    //LINK - Search
    async getSearchResults(
        query: SearchRequest,
        metadata: any
    ): Promise<PagedResults> {
        const page = metadata?.page ?? 1
        if (page == -1 || !query)
            return App.createPagedResults({
                results: [],
                metadata: { page: -1 },
            })

        const searchString = query.title
            ?.trim()
            .replace(/\s+/g, " ") // Replace multiple spaces with a single space
            .replace(/ /g, "+")
        const params = {
            query_string: searchString,
            perPage: 200,
            page: 1,
        }

        const queryString = this.parser.joinParams(params)
        const constructedURL = `${this.apiUrl}/query?adult=true${queryString}`

        const request = App.createRequest({
            url: constructedURL,
            method: "GET",
            headers: {
                "user-agent": await this.requestManager.getDefaultUserAgent(),
                referer: `${this.baseUrl}/`,
            },
        })

        const response = await this.requestManager.schedule(request, 1)
        this.checkResponseError(response)
        const json = JSON.parse(response.data ?? "[]") as QueryResult
        const searchResult = json.data as QueryData[]

        const result = []
        for (const item of searchResult) {
            const mangaId = item.id + ID_SEP + item.series_slug
            const latestChapter =
                item.free_chapters && item.free_chapters.length > 0
                    ? item.free_chapters[0]?.chapter_name
                    : ""
            result.push(
                App.createPartialSourceManga({
                    mangaId,
                    image: this.parser.checkimage(item.thumbnail ?? ""),
                    title: item.title ?? "",
                    subtitle: latestChapter,
                })
            )
        }

        return App.createPagedResults({
            results: result,
            metadata: { page: -1 },
        })
    }

    //LINK - ViewMore
    async getViewMoreItems(
        homepageSectionId: string,
        metadata: any
    ): Promise<PagedResults> {
        console.log(`HOMESECTION ID ${homepageSectionId}`)
        if (homepageSectionId != "2") {
            return App.createPagedResults({})
        }
        let page = metadata?.page ?? 1
        if (page == -1)
            return App.createPagedResults({
                results: [],
                metadata: { page: -1 },
            })

        // Latest Titles
        const params = {
            series_type: "Comic",
            perPage: 15,
            order: "desc",
            orderBy: "updated_at",
            page: page,
        }

        const queryString = this.parser.joinParams(params)
        const constructedURL = `${this.apiUrl}/query?adult=true${queryString}`

        const request = App.createRequest({
            url: constructedURL,
            method: "GET",
            headers: {
                "user-agent": await this.requestManager.getDefaultUserAgent(),
                referer: `${this.baseUrl}/`,
            },
        })

        const response = await this.requestManager.schedule(request, 1)
        this.checkResponseError(response)
        const json = JSON.parse(response.data ?? "[]") as QueryResult
        const dataLatest = json.data as QueryData[]

        const result = this.parser.parseViewMore(dataLatest)
        if (result.length < 1) page = -1
        else page++
        return App.createPagedResults({
            results: result,
            metadata: { page: page },
        })
    }

    //LINK - HomePage
    async getHomePageSections(
        sectionCallback: (section: HomeSection) => void
    ): Promise<void> {
        const dataDaily: MangaItem[] = await this.parser.getMangaItems(
            `${this.apiUrl}/trending?type=daily`,
            this
        )
        // .then((data) => {
        //     return data.filter((item) => item.series_type == "Comic")
        // })
        const dataWeekly: MangaItem[] = await this.parser.getMangaItems(
            `${this.apiUrl}/trending?type=weekly`,
            this
        )
        // .then((data) => {
        //     return data.filter((item) => item.series_type == "Comic")
        // })

        // Latest Titles
        const params = {
            series_type: "Comic",
            perPage: 15,
            order: "desc",
            orderBy: "updated_at",
            page: 1,
        }

        const queryString = this.parser.joinParams(params)
        const constructedURL = `${this.apiUrl}/query?adult=true${queryString}`

        const request = App.createRequest({
            url: constructedURL,
            method: "GET",
            headers: {
                "user-agent": await this.requestManager.getDefaultUserAgent(),
                referer: `${this.baseUrl}/`,
            },
        })

        const response = await this.requestManager.schedule(request, 1)
        this.checkResponseError(response)
        const json = JSON.parse(response.data ?? "[]") as QueryResult
        const dataLatest = json.data as QueryData[]

        this.parser.parseHomeSections(
            dataDaily,
            dataWeekly,
            dataLatest,
            sectionCallback
        )
    }

    /**
     * Parses a time string from a Madara source into a Date object.
     * Copied from Madara.ts made by Netsky
     */
    protected convertTime(date: string): Date {
        date = date.toUpperCase()
        let time: Date
        const number = Number((/\d*/.exec(date) ?? [])[0])
        if (date.includes("LESS THAN AN HOUR") || date.includes("JUST NOW")) {
            time = new Date(Date.now())
        } else if (date.includes("YEAR") || date.includes("YEARS")) {
            time = new Date(Date.now() - number * 31556952000)
        } else if (date.includes("MONTH") || date.includes("MONTHS")) {
            time = new Date(Date.now() - number * 2592000000)
        } else if (date.includes("WEEK") || date.includes("WEEKS")) {
            time = new Date(Date.now() - number * 604800000)
        } else if (date.includes("YESTERDAY")) {
            time = new Date(Date.now() - 86400000)
        } else if (date.includes("DAY") || date.includes("DAYS")) {
            time = new Date(Date.now() - number * 86400000)
        } else if (date.includes("HOUR") || date.includes("HOURS")) {
            time = new Date(Date.now() - number * 3600000)
        } else if (date.includes("MINUTE") || date.includes("MINUTES")) {
            time = new Date(Date.now() - number * 60000)
        } else if (date.includes("SECOND") || date.includes("SECONDS")) {
            time = new Date(Date.now() - number * 1000)
        } else {
            time = new Date(date)
        }
        return time
    }

    async getCloudflareBypassRequest(): Promise<Request> {
        return App.createRequest({
            url: this.baseUrl,
            method: "GET",
            headers: {
                "user-agent": await this.requestManager.getDefaultUserAgent(),
                referer: `${this.baseUrl}/`,
            },
        })
    }

    checkResponseError(response: Response): void {
        const status = response.status
        switch (status) {
            case 403:
            case 503:
                throw new Error(
                    this.createErrorString(
                        `Status: ${response.status}`,
                        "Cloudflare Error: Click the CLOUD icon.",
                        "If the issue persists, use #support in netsky's server."
                    )
                )
            case 404:
                throw new Error(
                    this.createErrorString(
                        `Status: ${response.status}`,
                        "Webpage not found and the website likely changed domains.",
                        "Use #support in netsky's server."
                    )
                )
        }
    }

    createErrorString(...errors: string[]): string {
        let ret = "\n<======>\n"
        for (const err of errors) {
            ret += `    • ${err}\n`
        }
        ret += "<======>\n"
        return ret
    }
}
