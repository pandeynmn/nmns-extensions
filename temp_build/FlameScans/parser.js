"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    parseMangaDetails($, mangaId) {
        const title = $('.thumb img').attr('alt') ?? '';
        const image = $('.thumb img').attr('src') ?? '';
        const desc = $('.entry-content.entry-content-single').text().trim() ?? '';
        const rating = Number($('div.extra-info div.mobile-rt div.numscore').html() ?? '0');
        let status = paperback_extensions_common_1.MangaStatus.UNKNOWN, author = '', artist = '';
        for (const obj of $('.left-side .imptdt').toArray()) {
            const item = $('i', obj).text().trim();
            const type = $('h1', obj).text().trim();
            if (type.toLowerCase().includes('status'))
                status = this.mangaStatus(item.toLowerCase());
            else if (type.toLowerCase().includes('author'))
                author = item;
            else if (type.toLowerCase().includes('artist'))
                artist = item;
        }
        const arrayTags = [];
        for (const obj of $('.mgen a').toArray()) {
            const id = $(obj).attr('href')?.replace('https://flamescans.org/genres/', '').replace('/', '') ?? '';
            const label = $(obj).text().trim();
            if (!id || !label)
                continue;
            arrayTags.push({ id: id, label: label });
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })];
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
        });
    }
    mangaStatus(str) {
        if (str.includes('ongoing'))
            return paperback_extensions_common_1.MangaStatus.ONGOING;
        if (str.includes('complete'))
            return paperback_extensions_common_1.MangaStatus.COMPLETED;
        if (str.includes('haitus'))
            return paperback_extensions_common_1.MangaStatus.HIATUS;
        if (str.includes('cancelled'))
            return paperback_extensions_common_1.MangaStatus.ABANDONED;
        if (str.includes('coming'))
            return paperback_extensions_common_1.MangaStatus.ONGOING;
        return paperback_extensions_common_1.MangaStatus.ONGOING;
    }
    parseChapters($, mangaId, source) {
        const chapters = [];
        const arrChapters = $('#chapterlist li').toArray().reverse();
        for (const item of arrChapters) {
            const id = $('a', item).attr('href').replace(/\/$/, '').split('/').pop().replace(/()\d+-|\/$|^\//g, '') ?? '';
            const chapNum = Number($(item).attr('data-num') ?? '0');
            const time = source.convertTime($('.chapterdate', item).text().trim());
            chapters.push(createChapter({
                id,
                mangaId,
                name: `Chapter ${chapNum.toString()}`,
                chapNum,
                time,
                langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            }));
        }
        return chapters;
    }
    parseChapterDetails($, mangaId, id) {
        const pages = [];
        const chapterList = $('#readerarea p img').toArray();
        for (const obj of chapterList) {
            const imageUrl = $(obj).attr('src');
            if (!imageUrl)
                continue;
            pages.push(imageUrl.trim());
        }
        return createChapterDetails({
            id,
            mangaId,
            pages,
            longStrip: true,
        });
    }
    parseSearchResults($) {
        const results = [];
        for (const item of $('.listupd .bsx').toArray()) {
            const id = $('a', item).attr('href')?.split('series')[1].replace(/()\d+-|\/$|^\//g, '') ?? '';
            const title = $('a', item).attr('title') ?? '';
            const image = $('img', item).attr('src') ?? '';
            results.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
            }));
        }
        return results;
    }
    parseViewMore($) {
        const more = [];
        for (const item of $('.listupd .bsx').toArray()) {
            const id = $('a', item).attr('href')?.split('series')[1].replace(/()\d+-|\/$|^\//g, '') ?? '';
            const title = $('a', item).attr('title') ?? '';
            const image = $('img', item).attr('src') ?? '';
            more.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
            }));
        }
        return more;
    }
    parseHomeSections($, sectionCallback) {
        const section1 = createHomeSection({ id: '1', title: 'Popular', type: paperback_extensions_common_1.HomeSectionType.featured, });
        const section2 = createHomeSection({ id: '2', title: 'Latest', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal, view_more: true, });
        const section3 = createHomeSection({ id: '3', title: 'Popular Titles', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal, view_more: true, });
        const featured = [];
        const popular = [];
        const latest = [];
        const arrFeatured = $('.desktop-slide').toArray();
        const arrPopular = $('.pop-list-desktop .bsx').toArray();
        const arrLatest = $('.latest-updates .bsx').toArray();
        for (const obj of arrFeatured) {
            const id = $(obj).attr('href')?.split('series')[1].replace(/()\d+-|\/$|^\//g, '') ?? '';
            const title = $('.tt', obj).text().trim();
            const strImg = $('.bigbanner', obj).attr('style') ?? '';
            const image = strImg.substring(23, strImg.length - 3) ?? '';
            featured.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
            }));
        }
        section1.items = featured;
        sectionCallback(section1);
        for (const item of arrLatest) {
            const id = $('a', item).attr('href')?.split('series')[1].replace(/()\d+-|\/$|^\//g, '') ?? '';
            const title = $('a', item).attr('title') ?? '';
            const image = $('img', item).attr('src') ?? '';
            latest.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
            }));
        }
        section2.items = latest;
        sectionCallback(section2);
        for (const obj of arrPopular) {
            const id = $('a', obj).attr('href')?.split('series')[1].replace(/()\d+-|\/$|^\//g, '') ?? '';
            const title = $('a', obj).attr('title') ?? '';
            const subText = $('.status', obj).text() ?? '';
            const image = $('img', obj).attr('src') ?? '';
            popular.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
                subtitleText: createIconText({ text: subText }),
            }));
        }
        section3.items = popular;
        sectionCallback(section3);
    }
    encodeText(str) {
        return str.replace(/&#([0-9]{1,4});/gi, function (_, numStr) {
            var num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
    }
}
exports.Parser = Parser;
