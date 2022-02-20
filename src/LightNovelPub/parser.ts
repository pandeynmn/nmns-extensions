import {
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    Tag,
    TagSection,
} from 'paperback-extensions-common'
import { decodeHTMLEntity,
    spliterate } from '../LNInterceptor'

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
    getSettingsString,
    getEnabledHomePageSections} from './settings'

import { convert } from 'html-to-text'

export class Parser {
    parseMangaDetails($: CheerioStatic, mangaId: string): Manga {
        const title  = convert(($('.novel-info h1.novel-title').text().trim() ?? ''), { wordwrap: 130 })
        const image  = $('.cover img').attr('data-src') ?? ''
        const desc   = $('.summary .content').text().trim() ?? ''
        const rating = Number($('div.extra-info div.mobile-rt div.numscore').html() ?? '0')
        const author = $('.author a span').text() ?? ''
        let   status = MangaStatus.ONGOING

        const status_str = $('.header-stats span:nth-child(4)').text().trim().split(':')[1] ?? ''
        if (status_str.includes('Ongoing')) status = MangaStatus.ONGOING ?? MangaStatus.COMPLETED

        const arrayTags: Tag[] = []
        for (const obj of $('.tags ul li a').toArray()) {
            const id    = $(obj).attr('href') ?? ''
            const label = $(obj).attr('title') ?? ''
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [this.encodeText(title)],
            image,
            rating,
            status,
            author,
            artist: '-',
            tags: tagSections,
            desc: this.encodeText(desc),
        })
    }

    async _getChapters(mangaId: string, source: any): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${source.baseUrl}/novel/${mangaId}/chapters`,
            method: 'GET',
        })
        const response = await source.requestManager.schedule(request, 3)
        const $ = source.cheerio.load(response.data)

        const arrPages = $('.pagenav div ul li').toArray()

        let maxx = 0
        if (arrPages.length == 1) {
            maxx = 1
        }
        else if (arrPages.length == 6) {
            const lastPageLink = convert($(arrPages[5]).find('a').attr('href'), {
                wordwrap: 130
            })
            const arr = lastPageLink.split('-')
            maxx = arr[arr.length - 1]
        } else {
            maxx = arrPages.length - 1
        }

        const responses: Promise<any>[] = []
        const chapters: Chapter[] = []
        for (let i = 1; i <= maxx; i++) {
            const newRequest = createRequestObject({
                url: `${source.baseUrl}/novel/${mangaId}/chapters/page-${i}`,
                method: 'GET',
            })
            const response = await  source.requestManager.schedule(newRequest, 3)
            responses.push(response)
        }

        (await Promise.all(responses)).forEach((newResponse) => {
            const $ = source.cheerio.load(newResponse.data)
            chapters.push(...this.parseChapters($, mangaId, source))
        })
        return chapters
    }

    parseChapters($: CheerioStatic, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        const arrChapters = $('.chapter-list li').toArray().reverse()
        for (const obj of arrChapters) {
            const id   = $('a', obj).attr('href').split('/')[3] ?? ''

            const name = convert(($('a', obj).attr('title') ?? ''), { wordwrap: 130 })
            const chapNum = Number($(obj).attr('data-chapterno') ?? '-1')

            const time = source.convertTime($('time', obj).text())
            chapters.push(
                createChapter({
                    id,
                    mangaId,
                    name,
                    chapNum,
                    time,
                    langCode: LanguageCode.ENGLISH,
                })
            )
        }
        return chapters
    }

    async parseChapterDetails($: CheerioStatic, mangaId: string, id: string, source: any): Promise<ChapterDetails> {
        const pages: string[] = []
        const textSegments: string[] = []
        const chapterText = $('#chapter-container > p').toArray()
        for(const chapterTextSeg of chapterText) {
            textSegments.push(decodeHTMLEntity($(chapterTextSeg).text()))
        }
        const text = textSegments.join('\n')
        const lines = Math.ceil(spliterate(text.replace(/[^\x00-\x7F]/g, ''), (await getImageWidth(source.stateManager))-(await getHorizontalPadding(source.stateManager))*2, `${(await getFont(source.stateManager)).toLowerCase().replace(' ', '')}${await getFontSize(source.stateManager)}`).split.length/(await getLinesPerPage(source.stateManager)))
        for(let i = 1; i <= lines; i++) {
            pages.push(`${source.LNPUB_DOMAIN}/novel/${mangaId}/${id}/?ttiparse&ttipage=${i}&ttisettings=${encodeURIComponent(await getSettingsString(source.stateManager))}`)
        }
        return createChapterDetails({
            id,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })
    }

    parseTags($: CheerioSelector): TagSection[] {
        const genres: Tag[] = []
        let i = 0
        for (const obj of $('.col-6.col-md-4.col-lg-3.col-xl-2').toArray()) {
            const label = $('.custom-control-label', $(obj)).text()
            const id = $('.custom-control-input.type3', $(obj)).attr('value') ?? '29'
            if (id == '29') i = 1
            if (i == 0) continue
            genres.push(createTag({ label: label, id: id }))
        }
        return [createTagSection({ id: '0', label: 'genres', tags: genres })]
    }

    parseSearchResults($: CheerioSelector): MangaTile[] {
        const results: MangaTile[] = []

        for (const item of $('.novel-list li').toArray()) {
            const id    = $('a', item).attr('href')?.split('/')[2] ?? ''
            const title = convert(($('a', item).attr('title') ?? ''), { wordwrap: 130 })

            const image = $('img', item).attr('src') ?? ''
            results.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        return results
    }

    parseToken($: CheerioStatic): string {
        return $('#novelSearchForm input[type=hidden]').attr('value') ?? null
    }

    parseViewMore($: CheerioStatic): MangaTile[] {
        const more: MangaTile[] = []
        for (const item of $('.listupd .bsx').toArray()) {
            const id    = $('a', item).attr('href')?.split('/')[2] ?? ''
            const title = $('a', item).attr('title') ?? ''
            const image = $('img', item).attr('src') ?? ''
            more.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        return more
    }

    parseHomeSections($: CheerioStatic, enabled_homepage_sections: string[], sectionCallback: (section: HomeSection) => void): void {
        const section0 = createHomeSection({ id: '0', title: 'Featured',            type: HomeSectionType.featured,})
        const section1 = createHomeSection({ id: '1', title: 'Latest Novels',       type: HomeSectionType.singleRowNormal,})
        const section2 = createHomeSection({ id: '2', title: 'New Ongoing Releases',type: HomeSectionType.singleRowNormal, view_more: true,})
        const section3 = createHomeSection({ id: '3', title: 'Weekly Most Active',  type: HomeSectionType.singleRowNormal,})
        const section4 = createHomeSection({ id: '4', title: 'Most Read Novels',    type: HomeSectionType.singleRowNormal,})
        const section5 = createHomeSection({ id: '5', title: 'New Trending Novels', type: HomeSectionType.singleRowNormal,})
        const section6 = createHomeSection({ id: '6', title: 'User Rated Novels',   type: HomeSectionType.singleRowNormal,})
        const section7 = createHomeSection({ id: '7', title: 'Completed Stories',   type: HomeSectionType.singleRowNormal, view_more: true,})

        const rankList  : MangaTile[] = []
        const latest    : MangaTile[] = []
        const newOngoing: MangaTile[] = []
        const weekly    : MangaTile[] = []
        const mostRead  : MangaTile[] = []
        const newTrends : MangaTile[] = []
        const userRated : MangaTile[] = []
        const completed : MangaTile[] = []

        const arrRankList   = $('.rank-container:nth-child(7) ul:nth-child(2) li').toArray()
        const arrLatest     = $('.novel-list.horizontal li').toArray()
        const arrNewOngoing = $('#new-novel-section  ul li').toArray()
        const arrWeekly     = $('section.container:nth-child(6) > div:nth-child(2) > ul:nth-child(1) li').toArray()
        const arrMostRead   = $('.index-rank .rank-container:nth-child(7) ul li').toArray()
        const arrNewTrends  = $('.index-rank .rank-container:nth-child(8) ul li').toArray()
        const arrUserRated  = $('.index-rank .rank-container:nth-child(9) ul li').toArray()
        const arrCompleted  = $('.container:nth-child(7) .section-body ul li')   .toArray()

        for (const obj of arrRankList) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('h4', obj).text().trim() ?? ''
            const image  = $('img', obj).attr('data-src').replace('158x210', '300x400') ?? ''
            rankList.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: convert((title), { wordwrap: 130 })}),
                })
            )
        }
        section0.items = rankList
        if (enabled_homepage_sections.includes('0')) sectionCallback(section0)

        for (const obj of arrLatest) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('h4', obj).text() ?? ''
            const image  = $('img', obj).attr('data-src') ?? ''
            latest.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: convert((title), { wordwrap: 130 })}),
                })
            )
        }
        section1.items = latest
        if (enabled_homepage_sections.includes('1')) sectionCallback(section1)

        for (const obj of arrNewOngoing) {
            const id     = $('a', obj).attr('href')?.replace('/novel/', '').replace('/', '') ?? ''
            const title  = $('a', obj).attr('title') ?? ''
            const image  = $('img', obj).attr('data-src') ?? ''
            newOngoing.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: convert((title), { wordwrap: 130 })}),
                })
            )
        }
        section2.items = newOngoing
        if (enabled_homepage_sections.includes('2')) sectionCallback(section2)

        for (const obj of arrWeekly) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('h4', obj).text() ?? ''
            const image  = $('img', obj).attr('data-src') ?? ''
            weekly.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: convert((title), { wordwrap: 130 })}),
                })
            )
        }
        section3.items = weekly
        if (enabled_homepage_sections.includes('3')) sectionCallback(section3)

        for (const obj of arrMostRead) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('a', obj).attr('title') ?? ''
            const image  = $('img', obj).attr('data-src').replace('158x210', '300x400') ?? ''
            mostRead.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: convert((title), { wordwrap: 130 })}),
                })
            )
        }
        section4.items = mostRead
        if (enabled_homepage_sections.includes('4')) sectionCallback(section4)

        for (const obj of arrNewTrends) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('a', obj).attr('title') ?? ''
            const image  = $('img', obj).attr('data-src').replace('158x210', '300x400') ?? ''
            newTrends.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: convert((title), { wordwrap: 130 })}),
                })
            )
        }
        section5.items = newTrends
        if (enabled_homepage_sections.includes('5')) sectionCallback(section5)

        for (const obj of arrUserRated) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('a', obj).attr('title') ?? ''
            const image  = $('img', obj).attr('data-src').replace('158x210', '300x400') ?? ''
            userRated.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: convert((title), { wordwrap: 130 })}),
                })
            )
        }
        section6.items = userRated
        if (enabled_homepage_sections.includes('6')) sectionCallback(section6)

        for (const obj of arrCompleted) {
            const id     = $('a', obj).attr('href')?.replace('/novel/', '').replace('/', '') ?? ''
            const title  = $('a', obj).attr('title') ?? ''
            const image  = $('img', obj).attr('data-src') ?? ''
            completed.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: convert((title), { wordwrap: 130 })}),
                })
            )
        }
        section7.items = completed
        if (enabled_homepage_sections.includes('7')) sectionCallback(section7)
    }
}