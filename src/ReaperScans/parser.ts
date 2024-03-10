import {
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    SourceManga,
    PartialSourceManga,
} from '@paperback/types'

export class Parser {
    parseMangaDetails($: any, mangaId: string): SourceManga {
        const title = $('.min-h-80 img').attr('alt') ?? ''
        const image_str = $('.min-h-80 img').attr('data-cfsrc') ?? $('.min-h-80 img').attr('src')
        const image = image_str.substring(image_str.indexOf('https:') ?? 0)
        const desc = $('p.prose').text().trim() ?? ''
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [this.encodeText(title)],
                image,
                status:'Ongoing',
                tags: [],
                desc: this.encodeText(desc),
            }),
        })
    }

    parseChapter($: any, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        const list = $('ul[role=list]').first()
        for (const obj of $('li', list).toArray()) {
            const id = $('a', obj).attr('href')?.split('/').pop() ?? ''
            const name = $('.font-medium', obj).text().trim()
            const date_str = $('div.mt-2 div p', obj).text().toLowerCase().replace('released', '').trim()
            if (!id) continue
            chapters.push(
                App.createChapter({
                    id,
                    name,
                    chapNum: Number(name.split(' ')[1] ?? '-1'),
                    langCode: 'en',
                    time: source.convertTime(date_str),
                })
            )
        }
        return chapters
    }
    parseChapterDetails($: any, mangaId: string, id: string): ChapterDetails {
        const pages: string[] = []
        for (const item of $('img.max-w-full').toArray()) {
            const page_str = ($(item).attr('data-cfsrc') ?? $(item).attr('src') ?? '').replaceAll(' ', '%20')
            const page = page_str.substring(page_str.indexOf('https:') ?? 0)
            pages.push(page)
        }
        return App.createChapterDetails({
            id,
            mangaId,
            pages,
        })
    }
    parseSearchResults($: any): PartialSourceManga[] {
        const results: PartialSourceManga[] = []
        for (const item of $('ul li').toArray()) {
            const id = $('a', item).attr('href')?.split('/').pop() ?? ''

            if ($(item).text() == 'Novels') break
            if (!id) continue

            const title = $('a img', item).attr('alt')
            const subtitle = $('a p span:nth-child(3)', item).text().trim()

            const image_str = $('a img', item).attr('data-cfsrc') ?? $('a img', item).attr('src') ?? ''
            const image = image_str.substring(image_str.indexOf('https:') ?? 0)

            results.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: this.encodeText(subtitle),
                })
            )
        }
        return results
    }
    parseViewMore($: any): PartialSourceManga[] {
        const more: PartialSourceManga[] = []
        for (const obj of $('div.relative.space-x-2', $('.space-y-4 div')).toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? ''

            const title = $('div a img', obj).attr('alt') ?? ''
            const subtitle = $('a.text-center', obj).first().text().trim().split('\n')[0] ?? ''

            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src')
            const image = image_str.substring(image_str.indexOf('https:') ?? 0)

            if (!id) continue
            if ($('div a', obj).attr('href').includes('novel')) continue

            more.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: subtitle,
                })
            )
        }
        return more
    }
    parseHomeSections($: any, _: boolean, sectionCallback: (section: HomeSection) => void): void {
        const type: HomeSectionType = HomeSectionType.singleRowNormal

        const section1 = App.createHomeSection({
            id: '1',
            title: 'Today\'s Picks',
            containsMoreItems: false,
            type: HomeSectionType.featured,
        })

        const section2 = App.createHomeSection({
            id: '2',
            title: 'Latest Comic',
            containsMoreItems: true,
            type: type,
        })

        const featured: PartialSourceManga[] = []
        const latest: PartialSourceManga[] = []

        for (const obj of $('ul.grid-cols-2 li').toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? ''

            const title = $('div a img', obj).attr('alt') ?? ''

            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src')
            const image = image_str.substring(image_str.indexOf('https:') ?? 0)

            const chnum = $('.flex.mt-4.space-x-2.mb-4 a').first().text().trim() ?? ''
            const type = $('div a div.absolute span', obj).text().trim().toLowerCase() ?? ''

            if (!id) continue
            if (type == 'novel') continue

            featured.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: chnum,
                })
            )
        }
        section1.items = featured
        sectionCallback(section1)

        for (const obj of $('div.relative.space-x-2', $('.space-y-4 div')).toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? ''

            const title = $('div a img', obj).attr('alt') ?? ''
            const subtitle = $('p', $('a.text-center', obj).first()).text().trim()

            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src')
            const image = image_str.substring(image_str.indexOf('https:') ?? 0)

            if (!id) continue
            if ($('div a', obj).attr('href').includes('novel')) continue

            latest.push(
                App.createPartialSourceManga({
                    image,
                    title: this.encodeText(title),
                    mangaId: id,
                    subtitle: subtitle,
                })
            )
        }
        section2.items = latest
        sectionCallback(section2)
    }

    encodeText(str: string): string {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
            return String.fromCharCode(parseInt(numStr, 10))
        })
    }
}
