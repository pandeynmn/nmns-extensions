import {
    Chapter,
    ChapterDetails,
    HomeSection,
    SourceManga,
    TagSection,
    Tag,
    HomeSectionType,
    PartialSourceManga,
} from '@paperback/types'

export class Parser {
    parseMangaDetails($: any, mangaId: string): SourceManga {
        const title = $('.thumb img').attr('alt') ?? ''
        const image = $('.thumb img').attr('src') ?? ''
        const desc = $('.entry-content.entry-content-single').text().trim() ?? ''
        const rating = Number($('div.extra-info div.mobile-rt div.numscore').html() ?? '0')
        let status = 'Unknown',
            author = '',
            artist = ''
        for (const obj of $('.left-side .imptdt').toArray()) {
            const item = $('i', obj).text().trim()
            const type = $('h1', obj).text().trim()
            if (type.toLowerCase().includes('status')) status = this.mangaStatus(item.toLowerCase())
            else if (type.toLowerCase().includes('author')) author = item
            else if (type.toLowerCase().includes('artist')) artist = item
        }
        const arrayTags: Tag[] = []
        for (const obj of $('.mgen a').toArray()) {
            const id = $(obj).attr('href')?.replace('https://flamescans.org/genres/', '').replace('/', '') ?? ''
            const label = $(obj).text().trim()
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => App.createTag(x)) })]
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [this.encodeText(title)],
                image,
                rating: Number(rating) ?? 0,
                status,
                artist,
                author,
                tags: tagSections,
                desc: this.encodeText(desc),
            }),
        })
    }

    mangaStatus(str: string): string {
        if (str.includes('ongoing')) return 'Ongoing'
        if (str.includes('complete')) return 'Completed'
        if (str.includes('hiatus')) return 'Hiatus'
        if (str.includes('dropped')) return 'Abandoned'
        if (str.includes('new')) return 'Ongoing'
        return 'Ongoing'
    }

    parseChapters($: any, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        const arrChapters = $('#chapterlist li').toArray().reverse()
        let backupChapNum = 0
        for (const item of arrChapters) {
            const id =
                $('a', item)
                    .attr('href')
                    .replace(/\/$/, '')
                    .split('/')
                    .pop()
                    .replace(/()\d+-|\/$|^\//g, '') ?? ''
            const time = source.convertTime($('.chapterdate', item).text().trim())
            const name = $('span.chapternum', item).text().replaceAll('\n', ' ').trim()
            let chapNum = Number(name.split(' ')[1] ?? '-1')
            if (chapNum) backupChapNum = chapNum
            else chapNum = ++backupChapNum
            chapters.push(
                App.createChapter({
                    id,
                    name,
                    chapNum,
                    time,
                    langCode: 'en',
                })
            )
        }
        return chapters
    }
    parseChapterDetails($: any, mangaId: string, id: string): ChapterDetails {
        const pages: string[] = []
        const chapterList = $('#readerarea img').toArray()
        for (const obj of chapterList) {
            const imageUrl = $(obj).attr('src')
            if (!imageUrl) continue
            pages.push(imageUrl.trim())
        }
        return App.createChapterDetails({
            id,
            mangaId,
            pages,
        })
    }
    parseSearchResults($: any): PartialSourceManga[] {
        const results: PartialSourceManga[] = []
        for (const item of $('.listupd .bsx').toArray()) {
            const id =
                $('a', item)
                    .attr('href')
                    ?.split('series')[1]
                    .replace(/()\d+-|\/$|^\//g, '') ?? ''
            const title = $('a', item).attr('title') ?? ''
            const image = $('img', item).attr('src') ?? ''
            results.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: undefined,
                })
            )
        }
        return results
    }
    parseViewMore($: any): PartialSourceManga[] {
        const more: PartialSourceManga[] = []
        for (const item of $('.listupd .bsx').toArray()) {
            const id =
                $('a', item)
                    .attr('href')
                    ?.split('series')[1]
                    .replace(/()\d+-|\/$|^\//g, '') ?? ''
            const title = $('a', item).attr('title') ?? ''
            const image = $('img', item).attr('src') ?? ''
            more.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: undefined,
                })
            )
        }
        return more
    }
    parseHomeSections($: any, sectionCallback: (section: HomeSection) => void): void {
        const section1 = App.createHomeSection({
            id: '1',
            title: 'Popular',
            containsMoreItems: false,
            type: HomeSectionType.featured,
        })
        const section2 = App.createHomeSection({
            id: '2',
            title: 'Latest',
            containsMoreItems: true,
            type: HomeSectionType.singleRowNormal,
        })
        const section3 = App.createHomeSection({
            id: '3',
            title: 'Popular Titles',
            containsMoreItems: true,
            type: HomeSectionType.singleRowNormal,
        })
        const featured: PartialSourceManga[] = []
        const popular: PartialSourceManga[] = []
        const latest: PartialSourceManga[] = []
        const arrFeatured = $('.desktop-slide').toArray()
        const arrPopular = $('.pop-list-desktop .bsx').toArray()
        const arrLatest = $('.latest-updates .bsx').toArray()
        for (const obj of arrFeatured) {
            const id =
                $(obj)
                    .attr('href')
                    ?.split('series')[1]
                    .replace(/()\d+-|\/$|^\//g, '') ?? ''
            const title = $('.tt', obj).text().trim()
            const strImg = $('.bigbanner', obj).attr('style') ?? ''
            const image = strImg.substring(23, strImg.length - 3) ?? ''
            featured.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: undefined,
                })
            )
        }
        section1.items = featured
        sectionCallback(section1)
        for (const item of arrLatest) {
            const id =
                $('a', item)
                    .attr('href')
                    ?.split('series')[1]
                    .replace(/()\d+-|\/$|^\//g, '') ?? ''
            const title = $('a', item).attr('title') ?? ''
            const image = $('img', item).attr('src') ?? ''
            latest.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: undefined,
                })
            )
        }
        section2.items = latest
        sectionCallback(section2)
        for (const obj of arrPopular) {
            const id =
                $('a', obj)
                    .attr('href')
                    ?.split('series')[1]
                    .replace(/()\d+-|\/$|^\//g, '') ?? ''
            const title = $('a', obj).attr('title') ?? ''
            const subText = $('.status', obj).text() ?? ''
            const image = $('img', obj).attr('src') ?? ''
            popular.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: subText,
                })
            )
        }
        section3.items = popular
        sectionCallback(section3)
    }

    encodeText(str: string): string {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
            const num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }
}
