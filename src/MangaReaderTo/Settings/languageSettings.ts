
import { Section,
    SourceStateManager } from 'paperback-extensions-common'

type ChapterLanguage = {
    name: string;
    id: string;
    default: boolean;
}

class ChapterLanguageSelectionClass {
    Sections: ChapterLanguage[] = [
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
    ]
    getIDList(): string[] {
        return this.Sections.map(Sections => Sections.id)
    }

    getName(sectionsEnum: string): string {
        return this.Sections.filter(Sections => Sections.id == sectionsEnum)[0]?.name ?? ''
    }

    getDefault(): string[] {
        return this.Sections.filter(Sections => Sections.default).map(Sections => Sections.id)
    }
}

export const LanguageSections = new ChapterLanguageSelectionClass()

export const getEnabledLanguages = async (stateManager: SourceStateManager): Promise<string[]> => {
    const enabled_chapter_languages: string[] = await stateManager.retrieve('enabled_chapter_languages') as string[]
    return enabled_chapter_languages != undefined && enabled_chapter_languages.length > 0 ? enabled_chapter_languages : LanguageSections.getDefault()
}

export const languageSettings = (stateManager: SourceStateManager): Section  => {
    return createSection({
        id: 'chapter-list-settings',
        footer: 'Note: Select the languages you want to see in the chapter list.',
        rows: () => {
            return Promise.all([
                getEnabledLanguages(stateManager),
            ]).then(async values => {
                return [
                    createSelect({
                        id: 'enabled_chapter_languages',
                        label: 'Language Settings',
                        options: LanguageSections.getIDList(),
                        displayLabel: option => LanguageSections.getName(option),
                        value: values[0] ?? [],
                        allowsMultiselect: true,
                        minimumOptionCount: 1,
                    }),
                ]
            })
        }
    })
}
