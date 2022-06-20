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
    Request,
    Response,
    SearchRequest,
} from 'paperback-extensions-common'

export class Parser {
    parseMangaDetails($: any, mangaId: string): Manga {
        const title  = $('.v-card__title').text().trim() ?? ''

        const meta_html =  $('head > meta').parent().html()?.toString() ?? ''
        let meta_tag = meta_html.substring(meta_html.indexOf('<meta data-n-head="ssr" data-hid="og:image" key="og:image" property="og:image" name="og:image" content="') + 104)
        meta_tag = meta_tag.substring(0, meta_tag.indexOf('"><')).trim() ?? ''

        const image  = meta_tag
        const desc   = $('.v-card__text').text().trim() ?? ''

        let   status = MangaStatus.UNKNOWN

        status = this.mangaStatus($('.v-chip__content').text().trim().toLowerCase())

        const arrayTags: Tag[] = []
        for (const obj of $('.v-slide-group__content a').toArray()) {
            const id    = $(obj).attr('href').replace('/comics?genres=', '') ?? ''
            console.log(`manga id from tag: ${id}`)
            const label = $(obj).text().trim()
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }

        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [this.encodeText(title)],
            image,
            status,
            tags: tagSections,
            desc: this.encodeText(desc),
        })
    }

    mangaStatus(str: string) {
        if (str.includes('ongoing'))   return MangaStatus.ONGOING
        if (str.includes('complete'))  return MangaStatus.COMPLETED
        if (str.includes('haitus'))    return MangaStatus.HIATUS
        if (str.includes('dropped'))   return MangaStatus.ABANDONED
        if (str.includes('new'))       return MangaStatus.ONGOING
        return MangaStatus.ONGOING
    }

    parseChapter(json: any, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        for (const item of json.data.data) {
            chapters.push(
                createChapter({
                    id: item.id.toString(),
                    mangaId: mangaId,
                    name: `Chapter ${item.name.toString()}`,
                    chapNum: Number(item.name.toString() ?? '-1'),
                    time: source.convertTime(item.created_at),
                    langCode: LanguageCode.ENGLISH,
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

        return createChapterDetails({
            id,
            mangaId,
            pages,
            longStrip: true,
        })
    }

    parseSearchResults(json: any, query: SearchRequest): MangaTile[] {
        const results: MangaTile[] = []
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
                        createMangaTile({
                            id: item.slug,
                            image: item.cover.horizontal,
                            title: createIconText({ text: this.encodeText(item.name) }),
                            subtitleText: createIconText({ text: this.encodeText(`Chapter ${item.chapter_count}`) }),
                        })
                    )
                }
            }
        }
        return results
    }

    parseViewMore(json: any): MangaTile[] {
        const more: MangaTile[] = []
        for(const item of json.data.comics) {
            more.push(
                createMangaTile({
                    id: item.slug,
                    image: item.cover.horizontal.replace('horizontal', 'vertical'),
                    title: createIconText({ text: this.encodeText(item.name) }),
                    subtitleText: createIconText({ text: this.encodeText(`Chapter ${item.chapter_count}`) }),
                })
            )
        }
        return more
    }

    parseHomeSections(json: any, releases: any, sectionCallback: (section: HomeSection) => void): void {
        const section1 = createHomeSection({ id: '1', title: 'Featured', type: HomeSectionType.featured,})
        const section2 = createHomeSection({ id: '2', title: 'Latest', type: HomeSectionType.singleRowNormal,})
        const section3 = createHomeSection({ id: '3', title: 'Popular', type: HomeSectionType.singleRowNormal, view_more: true,})


        const featured: MangaTile[] = []
        const latest  : MangaTile[] = []
        const popular : MangaTile[] = []

        for (const item of json.data.slider) {
            featured.push(
                createMangaTile({
                    id: item.comic.slug,
                    image: item.banner,
                    title: createIconText({ text: this.encodeText(item.comic.name) }),
                    subtitleText: createIconText({ text: this.encodeText(`Chapter ${item.chapter_count}`) }),
                })
            )
        }
        section1.items = featured
        sectionCallback(section1)

        for (const item of releases.all) {
            latest.push(
                createMangaTile({
                    id: item.slug,
                    image: (!item.cover.vertical ? item.cover.horizontal : item.cover.vertical ?? ''),
                    title: createIconText({ text: this.encodeText(item.name) }),
                    subtitleText: createIconText({ text: this.encodeText(`Chapter ${item.chapter_count}`) }),
                })
            )
        }
        section2.items = latest
        sectionCallback(section2)

        for (const item of json.data.popular_comics) {
            popular.push(
                createMangaTile({
                    id: item.slug,
                    image: (!item.cover.full ? item.cover.icon : item.cover.full ?? ''),
                    title: createIconText({ text: this.encodeText(item.name) }),
                    subtitleText: createIconText({ text: this.encodeText(`Chapter ${item.chapter_count}`) }),
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
