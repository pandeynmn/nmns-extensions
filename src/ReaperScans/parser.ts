import {
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    SourceManga,
    PartialSourceManga,
    TagSection,
} from "@paperback/types"

import {
    MangaItem,
    QueryData,
    QueryResult,
    RSCHapterDetailsData,
    RSChapterList,
    RSMangaDetails,
} from "./types/"
import { ReaperScans } from "./ReaperScans"

export class Parser {
    REAPERSCANS_DOMAIN = "https://reaperscans.com"
    REAPERSCANS_DOMAIN_API = "https://api.reaperscans.com"
    REAPERSCANS_CDN = "https://media.reaperscans.com/file/4SRBHm" // https://domain.tld/file/<bucket>/<file>
    ID_SEP = "|#|"

    //LINK - MangaDetails
    parseMangaDetails(manga: RSMangaDetails, mangaId: string): SourceManga {
        const title = manga.title ?? ""
        const image = `${this.REAPERSCANS_CDN}/${manga.thumbnail}`
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
                image,
                status: manga.status ?? "Ongoing",
                tags,
                desc: this.encodeText(desc),
                author: manga.author,
                artist: manga.author,
            }),
        })
    }

    parseChapter($: any, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        const list = $("ul[role=list]").first()
        for (const obj of $("li", list).toArray()) {
            const id = $("a", obj).attr("href")?.split("/").pop() ?? ""
            const name = $(".font-medium", obj).text().trim()
            const date_str = $("div.mt-2 div p", obj)
                .text()
                .toLowerCase()
                .replace("released", "")
                .trim()
            if (!id) continue
            chapters.push(
                App.createChapter({
                    id,
                    name,
                    chapNum: Number(name.split(" ")[1] ?? "-1"),
                    langCode: "en",
                    time: source.convertTime(date_str),
                }),
            )
        }
        return chapters
    }

    //LINK - C-Details
    parseChapterDetails(
        chapter: RSCHapterDetailsData,
        mangaId: string,
        id: string,
    ): ChapterDetails {
        return App.createChapterDetails({
            id,
            mangaId,
            pages: chapter.chapter_data?.images ?? [],
        })
    }
    parseSearchResults($: any): PartialSourceManga[] {
        const results: PartialSourceManga[] = []
        for (const item of $("ul li").toArray()) {
            const id = $("a", item).attr("href")?.split("/").pop() ?? ""

            if ($(item).text() == "Novels") break
            if (!id) continue

            const title = $("a img", item).attr("alt")
            const subtitle = $("a p span:nth-child(3)", item).text().trim()

            const image_str =
                $("a img", item).attr("data-cfsrc") ??
                $("a img", item).attr("src") ??
                ""
            const image = image_str.substring(image_str.indexOf("https:") ?? 0)

            results.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: this.encodeText(subtitle),
                }),
            )
        }
        return results
    }

    //LINK - ViewMore
    parseViewMore($: any): PartialSourceManga[] {
        const more: PartialSourceManga[] = []
        for (const obj of $(
            "div.relative.space-x-2",
            $(".space-y-4 div"),
        ).toArray()) {
            const id = $("div a", obj).attr("href")?.split("/").pop() ?? ""

            const title = $("div a img", obj).attr("alt") ?? ""
            const subtitle =
                $("a.text-center", obj).first().text().trim().split("\n")[0] ??
                ""

            const image_str =
                $("div a img", obj).attr("data-cfsrc") ??
                $("div a img", obj).attr("src")
            const image = image_str.substring(image_str.indexOf("https:") ?? 0)

            if (!id) continue
            if ($("div a", obj).attr("href").includes("novel")) continue

            more.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: subtitle,
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
                    image: `${this.REAPERSCANS_CDN}/${item.thumbnail}`,
                    title: item.title ?? "",
                    subtitle: item.author,
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
                    image: `${this.REAPERSCANS_CDN}/${item.thumbnail}`,
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
                    image: `${this.REAPERSCANS_CDN}/${item.thumbnail}`,
                    title: item.title ?? "",
                    subtitle: item.author,
                }),
            )
        }
        section3.items = mangaWeekly
        sectionCallback(section3)
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
