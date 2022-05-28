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

export class Parser {
    parseMangaDetails($: any, mangaId: string): Manga {
        const title  = $('.thumb img').attr('alt') ?? ''
        const image  = $('.thumb img').attr('src') ?? ''
        const desc   = $('.entry-content.entry-content-single').text().trim() ?? ''
        const rating = Number($('div.extra-info div.mobile-rt div.numscore').html() ?? '0')
        let   status = MangaStatus.UNKNOWN, author = '', artist = ''

        for (const obj of $('.left-side .imptdt').toArray()) {
            const item = $('i' , obj).text().trim()
            const type = $('h1', obj).text().trim()
            if      (type.toLowerCase().includes('status')) status = this.mangaStatus(item.toLowerCase())
            else if (type.toLowerCase().includes('author')) author = item
            else if (type.toLowerCase().includes('artist')) artist = item
        }

        const arrayTags: Tag[] = []
        for (const obj of $('.mgen a').toArray()) {
            const id    = $(obj).attr('href')?.replace('https://flamescans.org/genres/', '').replace('/', '') ?? ''
            const label = $(obj).text().trim()
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [this.encodeText(title)],
            image,
            rating: Number(rating) ?? 0,
            status,
            artist,
            author,
            tags: tagSections,
            desc: this.encodeText(desc),
        })
    }

    mangaStatus(str: string) {
        if (str.includes('ongoing'))   return MangaStatus.ONGOING
        if (str.includes('complete'))  return MangaStatus.COMPLETED
        if (str.includes('haitus'))    return MangaStatus.HIATUS
        if (str.includes('cancelled')) return MangaStatus.ABANDONED
        if (str.includes('coming'))    return MangaStatus.ONGOING
        return MangaStatus.ONGOING
    }

    parseChapters($: any, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        const arrChapters = $('#chapterlist li').toArray().reverse()
        console.log(`length is ${arrChapters.length} and mangaId is ${mangaId}`)
        for (const item of arrChapters) {
            const id = $('a', item).attr('href') ?? ''
            const chapNum = Number($(item).attr('data-num') ?? '0')

            const time = source.convertTime($('.chapterdate', item).text().trim())
            chapters.push(
                createChapter({
                    id,
                    mangaId,
                    name: `Chapter ${chapNum.toString()}`,
                    chapNum,
                    time,
                    langCode: LanguageCode.ENGLISH,
                })
            )
        }
        return chapters
    }

    parseChapterDetails($: any, mangaId: string, id: string): ChapterDetails {
        const pages: string[] = []

        const chapterList = $('#readerarea p img').toArray()
        for (const obj of chapterList) {
            const imageUrl = $(obj).attr('src')
            if (!imageUrl) continue
            pages.push(imageUrl.trim())
        }

        return createChapterDetails({
            id,
            mangaId,
            pages,
            longStrip: true,
        })
    }

    parseSearchResults($: any): MangaTile[] {
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

    parseViewMore($: any): MangaTile[] {
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

    parseHomeSections($: any, sectionCallback: (section: HomeSection) => void): void {
        const section1 = createHomeSection({ id: '1', title: 'Popular', type: HomeSectionType.featured,})
        const section2 = createHomeSection({ id: '2', title: 'Latest', type: HomeSectionType.singleRowNormal, view_more: true,})
        const section3 = createHomeSection({ id: '3', title: 'Popular Titles', type: HomeSectionType.singleRowNormal, view_more: true,})

        const featured: MangaTile[] = []
        const popular : MangaTile[] = []
        const latest  : MangaTile[] = []

        const arrFeatured = $('.desktop-slide').toArray()
        const arrPopular  = $('.pop-list-desktop .bsx').toArray()
        const arrLatest   = $('.latest-updates .bsx').toArray()

        for (const obj of arrFeatured) {
            const id     = $(obj).attr('href')?.replace('https://flamescans.org/series/', '').replace('/', '') ?? ''
            const title  = $('.tt', obj).text().trim()
            const strImg = $('.bigbanner', obj).attr('style') ?? ''
            const image  = strImg.substring(23, strImg.length - 3) ?? ''
            featured.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        section1.items = featured
        sectionCallback(section1)


        for (const item of arrLatest) {
            const id    = $('a', item).attr('href')?.replace('https://flamescans.org/series/', '').replace('/', '') ?? ''
            const title = $('a', item).attr('title') ?? ''
            const image = $('img', item).attr('src') ?? ''
            latest.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }

        section2.items = latest
        sectionCallback(section2)

        for (const obj of arrPopular) {
            const id      = $('a', obj).attr('href')?.replace('https://flamescans.org/series/', '').replace('/', '') ?? ''
            const title   = $('a', obj).attr('title') ?? ''
            const subText = $('.status', obj).text() ?? ''
            const image   = $('img', obj).attr('src') ?? ''
            popular.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                    subtitleText: createIconText({ text: subText }),
                })
            )
        }
        section3.items = popular
        sectionCallback(section3)
    }

    encodeText(str: string) {
        return str.replace(/&#([0-9]{1,4});/gi, function(_, numStr) {
            var num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }
}
