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

import arraySort from 'array-sort'

export class Parser {
    parseMangaDetails($: any, mangaId: string): Manga {
        const title = $('.manga-name').first().text() ?? ''
        const desc = $('.description').text() ?? ''
        const image = $('.manga-poster img').attr('src') ?? ''

        const [status, author, views, rating] = this.parseDetailsSet($)

        const arrayTags: Tag[] = []
        for (const obj of $('.genres a').toArray()) {
            const id = ($(obj).attr('href') ?? '').replace('/genre/', '')
            const label = $(obj).text()
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]
        return createManga({
            id: mangaId,
            titles: [this.encodeText(title)],
            image,
            rating,
            author,
            artist: author,
            status,
            views,
            tags: tagSections,
            desc: this.encodeText(desc),
        })
    }

    parseDetailsSet($:any): any {
        let status = MangaStatus.ONGOING, author='', views = 0, rating = 0

        for (const obj of $('.anisc-info .item').toArray()) {
            const type = $('.item-head', obj).text().toLowerCase()

            if      (type.includes('status')) status = this.mangaStatus($('.name', obj).text().toLowerCase())
            else if (type.includes('author')) author = $('a', obj).text().trim() ?? ''
            else if (type.includes('views'))  views  = Number($('.name', obj).text().replace(',', '').trim() ?? '0')
            else if (type.includes('score'))  rating = Number($('.name', obj).text().trim() ?? '0')
        }
        return [status, author, views, rating]
    }

    mangaStatus(str: string): MangaStatus {
        if (str.includes('publishing'))   return MangaStatus.ONGOING
        if (str.includes('finished'))  return MangaStatus.COMPLETED
        if (str.includes('haitus'))    return MangaStatus.HIATUS
        if (str.includes('discontinued')) return MangaStatus.ABANDONED
        if (str.includes('published'))    return MangaStatus.UNKNOWN
        return MangaStatus.ONGOING
    }

    parseChapters($: any, mangaId: string, langs: string[]): Chapter[] {
        const chapters: Chapter[] = []
        const langArr = $('.chapters-list-ul ul').toArray()
        console.log(`Lang Array: ${langs.toString()}`)

        for (const obj of langArr) {
            const lang = $(obj).attr('id') ?? ''
            console.log('ID : ' + lang)
            if (!langs.includes($(obj).attr('id'))) continue
            const chapArr = $('li', obj).toArray()
            for (const item of chapArr) {
                let langCode: LanguageCode = LanguageCode.UNKNOWN
                if      (lang.includes('en-chapters')) langCode = LanguageCode.ENGLISH
                else if (lang.includes('ja-chapters')) langCode = LanguageCode.JAPANESE
                else if (lang.includes('ko-chapters')) langCode = LanguageCode.KOREAN
                else if (lang.includes('zh-chapters')) langCode = LanguageCode.CHINEESE
                else if (lang.includes('fr-chapters')) langCode = LanguageCode.FRENCH

                chapters.push(
                    createChapter({
                        id: $(item).attr('data-id') ?? '',
                        mangaId,
                        name: this.encodeText($('a', item).attr('title') ?? '') ?? '',
                        chapNum: Number($(item).attr('data-number') ?? '-1'),
                        langCode: langCode,
                    })
                )
            }
        }
        const sorted: Chapter[] = arraySort(chapters, 'chapNum')
        return sorted
    }

    parseChapterDetails($: any, mangaId: string, id: string): ChapterDetails {
        const pages: string[] = []

        const chapterList = $('#vertical-content div').toArray()
        for (const obj of chapterList) {
            const imageUrl = $(obj).attr('data-url')
            if (!imageUrl) continue

            if ($(obj).hasClass('shuffled')) {
                console.log('Shuffled')
                pages.push(imageUrl.trim() + '&shuffle=true')
            } else {
                pages.push(imageUrl.trim() + '&shuffle=false')
                console.log('Not shuffled')
            }
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

        for (const obj of $('.mls-wrap .item.item-spc').toArray()) {
            const id    = ($('.manga-poster', obj).attr('href') ?? '').replace('/', '')
            const title = $('img', obj).attr('alt') ?? ''
            const image = $('img', obj).attr('src') ?? ''
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

    parseHomeSections($: any, sectionCallback: (section: HomeSection) => void): void {
        const section0 = createHomeSection({ id: '0', title: 'Featured', type: HomeSectionType.featured,})
        const section1 = createHomeSection({ id: '1', title: 'Latest Updates', type: HomeSectionType.singleRowNormal, view_more: true,})
        const section2 = createHomeSection({ id: '2', title: 'Trending Titles', type: HomeSectionType.singleRowNormal,})
        const section3 = createHomeSection({ id: '3', title: 'Recommended', type: HomeSectionType.singleRowNormal, view_more: true,})
        const section4 = createHomeSection({ id: '4', title: 'Completed Titles', type: HomeSectionType.singleRowNormal, view_more: true,})

        const featured   : MangaTile[] = []
        const latest     : MangaTile[] = []
        const trending   : MangaTile[] = []
        const recommended: MangaTile[] = []
        const completed  : MangaTile[] = []

        const arrFeatured    = $('.container #slider .swiper-slide .deslide-item').toArray()
        const arrLatest      = $('#latest-chap                    .item.item-spc').toArray()
        const arrLatest2     = $('#latest-vol                     .item.item-spc').toArray()
        const arrTrending    = $('.trending-list .swiper-container .swiper-slide').toArray()
        const arrRecommended = $('#featured-03   .swiper-container .swiper-slide').toArray()
        const arrCompleted   = $('#featured-04   .swiper-container .swiper-slide').toArray()

        for (const obj of arrFeatured) {
            const title = $('a img', obj).attr('alt') ?? ''
            const image = $('a img', obj).attr('src') ?? ''
            const id    = ($('a', obj).attr('href') ?? '').replace('/', '')
            featured.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                }))
        }
        section0.items = featured
        sectionCallback(section0)

        for (const obj of arrLatest) {
            const id    = ($('.manga-poster', obj).attr('href') ?? '').replace('/', '')
            const title = $('img', obj).attr('alt') ?? ''
            const image = $('img', obj).attr('src') ?? ''
            latest.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        for (const obj of arrLatest2) {
            const id    = ($('.manga-poster', obj).attr('href') ?? '').replace('/', '')
            const title = $('img', obj).attr('alt') ?? ''
            const image = $('img', obj).attr('src') ?? ''
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

        for (const obj of arrTrending) {
            const id    = ($('.manga-poster a', obj).attr('href') ?? '').replace('/', '')
            const title = $('.anime-name', obj).text() ?? ''
            const image = $('.manga-poster img', obj).attr('src') ?? ''
            trending.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        section2.items = trending
        sectionCallback(section2)

        for (const obj of arrRecommended) {
            const id    = ($('.manga-poster a', obj).attr('href') ?? '').replace('/', '')
            const title = $('.manga-name a', obj).attr('title') ?? ''
            const image = $('.manga-poster img', obj).attr('src') ?? ''
            recommended.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        section3.items = recommended
        sectionCallback(section3)

        for (const obj of arrCompleted) {
            const id    = ($('.manga-poster a', obj).attr('href') ?? '').replace('/', '')
            const title = $('.manga-name a', obj).attr('title') ?? ''
            const image = $('.manga-poster img', obj).attr('src') ?? ''
            completed.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.encodeText(title) }),
                })
            )
        }
        section4.items = completed
        sectionCallback(section4)

    }

    parseViewMore($: any): MangaTile[] {
        const results: MangaTile[] = []

        for (const obj of $('.mls-wrap .item.item-spc').toArray()) {
            const id    = ($('.manga-poster', obj).attr('href') ?? '').replace('/', '')
            const title = $('img', obj).attr('alt') ?? ''
            const image = $('img', obj).attr('src') ?? ''
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

    encodeText(str: string) {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
            const num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }
}
