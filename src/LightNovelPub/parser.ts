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
import { decodeHTMLEntity, spliterate } from '../LNInterceptor'

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

export class Parser {
    parseMangaDetails($: CheerioStatic, mangaId: string): Manga {
        const title  = $('.novel-info h1.novel-title').text().trim() ?? 'No title present'
        const image  = $('.cover img').attr('data-src') ?? ''
        const desc   = $('.summary .content').text().trim() ?? ''
        const rating = Number($('div.extra-info div.mobile-rt div.numscore').html() ?? '0')
        const author = $('.author a span').text() ?? ''
        let status = MangaStatus.ONGOING

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
            rating: 0,
            status,
            author,
            artist: '-',
            tags: tagSections,
            desc: this.encodeText(desc),
        })
    }

    parseChapters($: CheerioStatic, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        const arrChapters = $('.chapter-list li').toArray().reverse()
        for (const obj of arrChapters) {
            const id = $('a', obj).attr('href').split('/')[3] ?? ''
            const name = $('a', obj).attr('title') ?? ''
            const chapNum = Number($(obj).attr('data-chapterno') ?? '0')

            const time = source.convertTime($('time', obj).attr('datetime') )
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
        console.log(`lines: ${lines}`)
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

        for (const item of $('.listupd .bsx').toArray()) {
            const id    = $('a', item).attr('href')?.replace('https://flamescans.org/series/', '').replace('/', '') ?? ''
            const title = $('a', item).attr('title') ?? ''
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

    parseViewMore($: CheerioStatic): MangaTile[] {
        const more: MangaTile[] = []
        for (const item of $('.listupd .bsx').toArray()) {
            const id    = $('a', item).attr('href')?.replace('https://flamescans.org/series/', '').replace('/', '') ?? ''
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

    parseHomeSections($: CheerioStatic, sectionCallback: (section: HomeSection) => void): void {
        const section0 = createHomeSection({ id: '0', title: 'Featured', type: HomeSectionType.featured,})
        const section1 = createHomeSection({ id: '1', title: 'Latest Titles', type: HomeSectionType.singleRowNormal, view_more: true,})
        const section2 = createHomeSection({ id: '2', title: 'New Ongoing Release', type: HomeSectionType.singleRowNormal, view_more: true,})
        const section3 = createHomeSection({ id: '3', title: 'Weekly Most Active', type: HomeSectionType.singleRowNormal,})

        const rankList: MangaTile[] = []
        const latest: MangaTile[] = []
        const newOngoing: MangaTile[] = []
        const weekly: MangaTile[] = []

        const arrRank       = $('.rank-container:nth-child(7) ul:nth-child(2) li').toArray()
        const arrLatest     = $('.novel-list.horizontal li').toArray()
        const arrNewOngoing = $('#new-novel-section ul li').toArray()
        const arrWeekly     = $('section.container:nth-child(6) > div:nth-child(2) > ul:nth-child(1) li').toArray()

        for (const obj of arrRank) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('h4', obj).text().trim() ?? ''
            const image  = $('img', obj).attr('data-src').replace('158x210', '300x400') ?? ''
            console.log(`${title} - ${decodeHTMLEntity(title)}`)
            rankList.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title)}),
                })
            )
        }
        section0.items = rankList
        sectionCallback(section0)

        for (const obj of arrLatest) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('h4', obj).text() ?? ''
            const image  = $('img', obj).attr('data-src') ?? ''
            latest.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        section1.items = latest
        sectionCallback(section1)

        for (const obj of arrNewOngoing) {
            const id     = $('a', obj).attr('href')?.replace('/novel/', '').replace('/', '') ?? ''
            const title  = $('a', obj).attr('title') ?? ''
            const image  = $('img', obj).attr('data-src') ?? ''
            newOngoing.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        section2.items = newOngoing
        sectionCallback(section2)

        for (const obj of arrWeekly) {
            const id     = $('a', obj).attr('href')?.split('/')[2] ?? ''
            const title  = $('h4', obj).text() ?? ''
            const image  = $('img', obj).attr('data-src') ?? ''
            weekly.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        section3.items = weekly
        sectionCallback(section3)

    }

    encodeText(str: string): string {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
            const num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }
}
