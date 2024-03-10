import {
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    SourceManga,
    TagSection, 
    Tag,
    HomeSectionType,
    PartialSourceManga,
} from '@paperback/types'

export class Parser {
    parseMangaDetails($: any, mangaId: string): SourceManga {
        const title = $('.v-card__title').text().trim() ?? ''
        const meta_html = $('head > meta').parent().html()?.toString() ?? ''
        let meta_tag = meta_html.substring(
            meta_html.indexOf('<meta data-n-head="ssr" data-hid="og:image" key="og:image" property="og:image" name="og:image" content="') + 104
        )
        meta_tag = meta_tag.substring(0, meta_tag.indexOf('"><')).trim() ?? ''
        const image = meta_tag
        const desc = $('.v-card__text').text().trim() ?? ''
        let status = 'Unknown'
        status = this.mangaStatus($('.v-chip__content').text().trim().toLowerCase())
        const arrayTags: Tag[] = []
        for (const obj of $('.v-slide-group__content a').toArray()) {
            const id = $(obj).attr('href').replace('/comics?genres=', '') ?? ''
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
                status,
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

    parseChapter(json: any, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        for (const item of json.data.data) {
            chapters.push(
                App.createChapter({
                    id: item.id.toString(),
                    name: `Chapter ${item.name.toString()}`,
                    chapNum: Number(item.name.toString() ?? '-1'),
                    time: source.convertTime(item.created_at),
                    langCode: 'en',
                })
            )
        }
        return chapters
    }
    parseChapterDetails(json: any, mangaId: string, id: string): ChapterDetails {
        const pages: string[] = []
        for (const item of json.data.chapter.high_quality) {
            pages.push(item.toString())
        }
        return App.createChapterDetails({
            id,
            mangaId,
            pages,
        })
    }
    parseSearchResults(json: any, query: SearchRequest): PartialSourceManga[] {
        const results: PartialSourceManga[] = []
        const title = (query.title ?? '').toLowerCase()
        const arrayTags = new Set<string>()
        for (const item of query.includedTags ?? []) {
            arrayTags.add(item.id)
        }
        for (const item of json.data.comics) {
            let skip = arrayTags.size > 0 ? true : false
            if (item.name.toLowerCase().includes(title)) {
                for (const tag of item.genres) {
                    if (arrayTags.has(tag.slug)) {
                        skip = false
                    }
                }
                if (!skip) {
                    results.push(
                        App.createPartialSourceManga({
                            image: item.cover.horizontal,
                            title: this.encodeText(item.name),
                            mangaId: item.slug,
                            subtitle: this.encodeText(`Chapter ${item.chapter_count}`),
                        })
                    )
                }
            }
        }
        return results
    }
    parseViewMore(json: any): PartialSourceManga[] {
        const more: PartialSourceManga[] = []
        for (const item of json.data.comics) {
            more.push(
                App.createPartialSourceManga({
                    image: item.cover.horizontal.replace('horizontal', 'vertical'),
                    title: this.encodeText(item.name),
                    mangaId: item.slug,
                    subtitle: this.encodeText(`Chapter ${item.chapter_count}`),
                })
            )
        }
        return more
    }
    parseHomeSections(json: any, releases: any, sectionCallback: (section: HomeSection) => void): void {
        const section1 = App.createHomeSection({
            id: '1',
            title: 'Featured',
            containsMoreItems: false,
            type: HomeSectionType.featured,
        })
        const section2 = App.createHomeSection({
            id: '2',
            title: 'Latest',
            containsMoreItems: false,
            type: HomeSectionType.singleRowNormal,
        })
        const section3 = App.createHomeSection({
            id: '3',
            title: 'Popular',
            containsMoreItems: true,
            type: HomeSectionType.singleRowNormal,
        })
        const featured: PartialSourceManga[] = []
        const latest: PartialSourceManga[] = []
        const popular: PartialSourceManga[] = []
        for (const item of json.data.slider) {
            featured.push(
                App.createPartialSourceManga({
                    image: item.banner,
                    title: this.encodeText(item.comic.name),
                    mangaId: item.comic.slug,
                })
            )
        }
        section1.items = featured
        sectionCallback(section1)
        for (const item of releases.all) {
            latest.push(
                App.createPartialSourceManga({
                    image: !item.cover.vertical ? item.cover.horizontal : item.cover.vertical ?? '',
                    title: this.encodeText(item.name),
                    mangaId: item.slug,
                })
            )
        }
        section2.items = latest
        sectionCallback(section2)
        for (const item of json.data.popular_comics) {
            popular.push(
                App.createPartialSourceManga({
                    image: !item.cover.full ? item.cover.icon : item.cover.full ?? '',
                    title: this.encodeText(item.name),
                    mangaId: item.slug,
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
