import {
    HomeSection,
    HomeSectionType,
    SourceManga,
    PartialSourceManga,
    TagSection,
} from "@paperback/types"

import entities = require("entities")

import { MangaItem, QueryData, RSMangaDetails } from "./types/"
import { ReaperScans } from "./ReaperScans"

export class Parser {
    REAPERSCANS_DOMAIN = "https://reaperscans.com"
    REAPERSCANS_DOMAIN_API = "https://api.reaperscans.com"
    REAPERSCANS_CDN = "https://media.reaperscans.com/file/4SRBHm" // https://domain.tld/file/<bucket>/<file>
    ID_SEP = "|#|"

    //LINK - MangaDetails
    parseMangaDetails(manga: RSMangaDetails, mangaId: string): SourceManga {
        const title = manga.title ?? ""
        const desc = manga.description ?? ""

        const tags: TagSection[] = [
            App.createTagSection({
                id: "0",
                label: "genres",
                tags: (manga.tags ?? []).map((x) =>
                    App.createTag({
                        id: x.id?.toString() ?? "",
                        label: x.name ?? "",
                    }),
                ),
            }),
        ]

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [this.encodeText(title)],
                image: this.checkimage(manga.thumbnail ?? ""),
                status: manga.status ?? "Ongoing",
                tags,
                desc: entities.decodeHTML(desc),
                author: manga.author,
                artist: manga.author,
            }),
        })
    }

    //LINK - ViewMore
    parseViewMore(data: QueryData[]): PartialSourceManga[] {
        const more: PartialSourceManga[] = []

        for (const item of data) {
            const mangaId = item.id + this.ID_SEP + item.series_slug
            const latestChapter =
                item.free_chapters && item.free_chapters.length > 0
                    ? item.free_chapters[0]?.chapter_name
                    : ""
            more.push(
                App.createPartialSourceManga({
                    mangaId,
                    image: this.checkimage(item.thumbnail ?? ""),
                    title: item.title ?? "",
                    subtitle: latestChapter,
                }),
            )
        }
        return more
    }

    //LINK - HomePage
    parseHomeSections(
        daily: MangaItem[],
        weekly: MangaItem[],
        latest: QueryData[],
        sectionCallback: (section: HomeSection) => void,
    ): void {
        const section1 = App.createHomeSection({
            id: "1",
            title: "Trending",
            containsMoreItems: false,
            type: HomeSectionType.featured,
        })

        const section2 = App.createHomeSection({
            id: "2",
            title: "Latest",
            containsMoreItems: true,
            type: HomeSectionType.singleRowNormal,
        })

        const section3 = App.createHomeSection({
            id: "3",
            title: "Weekly Comics",
            containsMoreItems: true,
            type: HomeSectionType.singleRowLarge,
        })

        const mangaDaily: PartialSourceManga[] = []
        const mangaWeekly: PartialSourceManga[] = []
        const mangaLatest: PartialSourceManga[] = []

        for (const item of daily) {
            const mangaId = item.id + this.ID_SEP + item.series_slug
            mangaDaily.push(
                App.createPartialSourceManga({
                    mangaId,
                    image: this.checkimage(item.thumbnail ?? ""),
                    title: item.title ?? "",
                }),
            )
        }
        section1.items = mangaDaily
        sectionCallback(section1)

        for (const item of latest) {
            const mangaId = item.id + this.ID_SEP + item.series_slug
            const latestChapter =
                item.free_chapters && item.free_chapters.length > 0
                    ? item.free_chapters[0]?.chapter_name
                    : ""
            mangaLatest.push(
                App.createPartialSourceManga({
                    mangaId,
                    image: this.checkimage(item.thumbnail ?? ""),
                    title: item.title ?? "",
                    subtitle: latestChapter,
                }),
            )
        }
        section2.items = mangaLatest
        sectionCallback(section2)

        for (const item of weekly) {
            const mangaId = item.id + this.ID_SEP + item.series_slug
            mangaWeekly.push(
                App.createPartialSourceManga({
                    mangaId,
                    image: this.checkimage(item.thumbnail ?? ""),
                    title: item.title ?? "",
                }),
            )
        }
        section3.items = mangaWeekly
        sectionCallback(section3)
    }

    checkimage(img: string): string {
        if (img == "") {
            return ""
        }
        if (img.startsWith("https")) {
            return img
        }
        return `${this.REAPERSCANS_CDN}/${img}`
    }

    encodeText(str: string): string {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
            return String.fromCharCode(parseInt(numStr, 10))
        })
    }

    //LINK - MangaItmes Call
    async getMangaItems(
        url: string,
        source: ReaperScans,
    ): Promise<MangaItem[]> {
        const request = App.createRequest({
            url: url,
            method: "GET",
            headers: {
                "user-agent": await source.requestManager.getDefaultUserAgent(),
                referer: `${source.baseUrl}/`,
            },
        })

        const response = await source.requestManager.schedule(
            request,
            source.RETRY,
        )
        source.checkResponseError(response)
        const json = JSON.parse(response.data ?? "[]") as MangaItem[]
        return json
    }

    joinParams(params: { [key: string]: any }): string {
        let ret = ""
        for (const key in params) {
            ret += `&${key}=${params[key].toString()}`
        }
        return ret
    }
}
