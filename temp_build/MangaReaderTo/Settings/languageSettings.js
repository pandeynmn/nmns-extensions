"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageSettings = exports.getEnabledLanguages = exports.LanguageSections = void 0;
class ChapterLanguageSelectionClass {
    constructor() {
        this.Sections = [
            {
                name: 'Englilsh',
                id: 'en-chapters',
                default: true
            },
            {
                name: 'Japanese',
                id: 'ja-chapters',
                default: false
            },
            {
                name: 'Korean',
                id: 'ko-chapters',
                default: false
            },
            {
                name: 'Chinese',
                id: 'zh-chapters',
                default: false
            },
            {
                name: 'French',
                id: 'fr-chapters',
                default: false
            },
        ];
    }
    getIDList() {
        return this.Sections.map(Sections => Sections.id);
    }
    getName(sectionsEnum) {
        return this.Sections.filter(Sections => Sections.id == sectionsEnum)[0]?.name ?? '';
    }
    getDefault() {
        return this.Sections.filter(Sections => Sections.default).map(Sections => Sections.id);
    }
}
exports.LanguageSections = new ChapterLanguageSelectionClass();
const getEnabledLanguages = async (stateManager) => {
    const enabled_chapter_languages = await stateManager.retrieve('enabled_chapter_languages');
    return enabled_chapter_languages != undefined && enabled_chapter_languages.length > 0 ? enabled_chapter_languages : exports.LanguageSections.getDefault();
};
exports.getEnabledLanguages = getEnabledLanguages;
const languageSettings = (stateManager) => {
    return createSection({
        id: 'chapter-list-settings',
        footer: 'Note: Select the languages you want to see in the chapter list.',
        rows: () => {
            return Promise.all([
                (0, exports.getEnabledLanguages)(stateManager),
            ]).then(async (values) => {
                return [
                    createSelect({
                        id: 'enabled_chapter_languages',
                        label: 'Language Settings',
                        options: exports.LanguageSections.getIDList(),
                        displayLabel: option => exports.LanguageSections.getName(option),
                        value: values[0] ?? [],
                        allowsMultiselect: true,
                        minimumOptionCount: 1,
                    }),
                ];
            });
        }
    });
};
exports.languageSettings = languageSettings;
