"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    parseMangaDetails($, mangaId) {
        const title = $('.min-h-80 img').attr('alt') ?? '';
        const image_str = $('.min-h-80 img').attr('data-cfsrc') ?? $('.min-h-80 img').attr('src');
        const image = image_str.substring(image_str.indexOf('https:') ?? 0);
        const desc = $('p.prose').text().trim() ?? '';
        return createManga({
            id: mangaId,
            titles: [this.encodeText(title)],
            image,
            status: paperback_extensions_common_1.MangaStatus.ONGOING,
            tags: [],
            desc: this.encodeText(desc),
        });
    }
    /*
    mangaStatus(str: string) {
        if (str.includes('ongoing'))   return MangaStatus.ONGOING
        if (str.includes('complete'))  return MangaStatus.COMPLETED
        if (str.includes('haitus'))    return MangaStatus.HIATUS
        if (str.includes('dropped'))   return MangaStatus.ABANDONED
        if (str.includes('new'))       return MangaStatus.ONGOING
        return MangaStatus.ONGOING
    }
    */
    parseChapter($, mangaId, source) {
        const chapters = [];
        const list = $('ul[role=list]').first();
        for (const obj of $('li', list).toArray()) {
            const id = $('a', obj).attr('href')?.split('/').pop() ?? '';
            const name = $('.font-medium', obj).text().trim();
            const date_str = $('div.mt-2 div p', obj).text().toLowerCase().replace('released', '').trim();
            if (!id)
                continue;
            chapters.push(createChapter({
                id,
                mangaId,
                name,
                chapNum: Number(name.split(' ')[1] ?? '-1'),
                langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
                time: source.convertTime(date_str),
            }));
        }
        return chapters;
    }
    parseChapterDetails($, mangaId, id) {
        const pages = [];
        for (const item of $('img.max-w-full').toArray()) {
            const page_str = ($(item).attr('data-cfsrc') ?? $(item).attr('src') ?? '').replaceAll(' ', '%20');
            const page = page_str.substring(page_str.indexOf('https:') ?? 0);
            pages.push(page);
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
        for (const item of $('ul li').toArray()) {
            const id = $('a', item).attr('href')?.split('/').pop() ?? '';
            if ($(item).text() == 'Novels')
                break;
            if (!id)
                continue;
            const title = $('a img', item).attr('alt');
            const subtitle = $('a p span:nth-child(3)', item).text().trim();
            const image_str = $('a img', item).attr('data-cfsrc') ?? $('a img', item).attr('src') ?? '';
            const image = image_str.substring(image_str.indexOf('https:') ?? 0);
            results.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
                subtitleText: createIconText({ text: this.encodeText(subtitle) }),
            }));
        }
        return results;
    }
    parseViewMore($) {
        const more = [];
        for (const obj of $('div.relative.space-x-2', $('.space-y-4 div')).toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('div a img', obj).attr('alt') ?? '';
            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src');
            const image = image_str.substring(image_str.indexOf('https:') ?? 0);
            const subtitle = $('a.text-center', obj).first().text().trim().split('\n')[0] ?? '';
            if (!id)
                continue;
            if ($('div a', obj).attr('href').includes('novel'))
                continue;
            more.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }));
        }
        return more;
    }
    parseHomeSections($, rowtype, sectionCallback) {
        const type = rowtype ? paperback_extensions_common_1.HomeSectionType.singleRowLarge : paperback_extensions_common_1.HomeSectionType.singleRowNormal;
        const section1 = createHomeSection({ id: '1', title: 'Today\'s Picks', type: paperback_extensions_common_1.HomeSectionType.featured, });
        const section2 = createHomeSection({ id: '2', title: 'Latest Comic', type: type, view_more: true, });
        const featured = [];
        const latest = [];
        for (const obj of $('ul.grid-cols-2 li').toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('div a img', obj).attr('alt') ?? '';
            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src');
            const image = image_str.substring(image_str.indexOf('https:') ?? 0);
            const chnum = $('.flex.mt-4.space-x-2.mb-4 a').first().text().trim() ?? '';
            const type = $('div a div.absolute span', obj).text().trim().toLowerCase() ?? '';
            if (!id)
                continue;
            if (type == 'novel')
                continue;
            featured.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
                subtitleText: createIconText({ text: chnum }),
            }));
        }
        section1.items = featured;
        sectionCallback(section1);
        for (const obj of $('div.relative.space-x-2', $('.space-y-4 div')).toArray()) {
            const id = $('div a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('div a img', obj).attr('alt') ?? '';
            const image_str = $('div a img', obj).attr('data-cfsrc') ?? $('div a img', obj).attr('src');
            const image = image_str.substring(image_str.indexOf('https:') ?? 0);
            const subtitle = $('p', $('a.text-center', obj).first()).text().trim();
            if (!id)
                continue;
            if ($('div a', obj).attr('href').includes('novel'))
                continue;
            latest.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.encodeText(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }));
        }
        section2.items = latest;
        sectionCallback(section2);
    }
    encodeText(str) {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
            return String.fromCharCode(parseInt(numStr, 10));
        });
    }
}
exports.Parser = Parser;
