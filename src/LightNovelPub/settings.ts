/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    FormRow,
    NavigationButton,
    RequestManager,
    Section,
    Select,
    SourceStateManager,
} from 'paperback-extensions-common'

export const SETTINGS: any = {
    textColor: ['White', 'Light Gray', 'Brown', 'Dark Gray', 'Black'],
    backgroundColor: ['White', 'Sepia', 'Dark Gray', 'Black'],
    fontSize: ['18', '24', '30', '36'],
    font: ['Arial', 'Georgia', 'San Francisco', 'Times New Roman']
}

export const COLORS: any = {
    white: 0xFFFFFF,
    light_gray: 0xDDDDDD,
    brown: 0x4C3320,
    sepia: 0xF2E5C9,
    dark_gray: 0x444444,
    black: 0x000000
}

export const getTextColor = async (stateManager: SourceStateManager): Promise<string> => {
    return (await stateManager.retrieve('text_color') as string) ?? 'Black'
}
export const getBackgroundColor = async (stateManager: SourceStateManager): Promise<string> =>  {
    return (await stateManager.retrieve('background_color') as string) ?? 'White'
}
export const getFontSize = async (stateManager: SourceStateManager): Promise<number> =>  {
    return (await stateManager.retrieve('font_size') as number) ?? 18
}
export const getFont = async (stateManager: SourceStateManager): Promise<string> =>  {
    return (await stateManager.retrieve('font') as string) ?? 'San Francisco'
}
export const getHorizontalPadding = async (stateManager: SourceStateManager): Promise<number>  => {
    return (await stateManager.retrieve('horizontal_padding') as number) ?? 20
}
export const getVerticalPadding = async (stateManager: SourceStateManager): Promise<number> =>  {
    return (await stateManager.retrieve('vertical_padding') as number) ?? 20
}
export const getImageWidth = async (stateManager: SourceStateManager): Promise<number> =>  {
    return (await stateManager.retrieve('image_width') as number) ?? 800
}
export const getLinesPerPage = async (stateManager: SourceStateManager): Promise<number> =>  {
    return (await stateManager.retrieve('lines_per_page') as number) ?? 60
}
export const getSettingsString = async (stateManager: SourceStateManager) =>  {
    return `${await getTextColor(stateManager)},${await getBackgroundColor(stateManager)},${await getFontSize(stateManager)},${await getFont(stateManager)},${await getHorizontalPadding(stateManager)},${await getVerticalPadding(stateManager)},${await getImageWidth(stateManager)},${await getLinesPerPage(stateManager)}`
}

export const resetSettings = (stateManager: SourceStateManager): Button => {
    return createButton({
        id: 'refresh',
        label: 'Update Source Cookies',
        value: '',
        onTap: () => {
            throw new Error('Updating cookies')
        }
    })
}

export const readerSettings = async (stateManager: SourceStateManager): Promise<NavigationButton>=>  {
    return createNavigationButton({
        label: 'Reader Settings',
        value: '',
        id: 'reader_settings',
        form: createForm({
            sections: async (): Promise<Section[]> => {
                return [
                    createSection({
                        id: '',
                        rows: async (): Promise<FormRow[]> => {
                            return [
                                createSelect({
                                    label: 'Text Color',
                                    options: SETTINGS.textColor,
                                    displayLabel: option => {return option},
                                    value: [await getTextColor(stateManager)],
                                    id: 'text_color',
                                    allowsMultiselect: false
                                }),
                                createSelect({
                                    label: 'Background Color',
                                    options: SETTINGS.backgroundColor,
                                    displayLabel: option => {return option},
                                    value: [await getBackgroundColor(stateManager)],
                                    id: 'background_color',
                                    allowsMultiselect: false
                                }),
                                createSelect({
                                    label: 'Font',
                                    options: SETTINGS.font,
                                    displayLabel: option => {return option},
                                    value: [await getFont(stateManager)],
                                    id: 'font',
                                    allowsMultiselect: false
                                }),
                                createSelect({
                                    label: 'Font Size',
                                    options: SETTINGS.fontSize,
                                    displayLabel: option => {return option},
                                    value: [(await getFontSize(stateManager)).toString()],
                                    id: 'font_size',
                                    allowsMultiselect: false
                                }),
                                createStepper({
                                    label: 'Horizontal Padding',
                                    value: await getHorizontalPadding(stateManager),
                                    id: 'horizontal_padding',
                                    min: 0,
                                    max: 100,
                                    step: 5
                                }),
                                createStepper({
                                    label: 'Vertical Padding',
                                    value: await getVerticalPadding(stateManager),
                                    id: 'vertical_padding',
                                    min: 0,
                                    max: 100,
                                    step: 5
                                }),
                                createStepper({
                                    label: 'Image Width',
                                    value: await getImageWidth(stateManager),
                                    id: 'image_width',
                                    min: 800,
                                    max: 1600,
                                    step: 50
                                }),
                                createStepper({
                                    label: 'Lines Per Page',
                                    value: await getLinesPerPage(stateManager),
                                    id: 'lines_per_page',
                                    min: 1,
                                    max: 100,
                                    step: 1
                                })
                            ]
                        }
                    }),
                ]
            },
            onSubmit: async (values: any): Promise<void> => {
                return Promise.all([
                    stateManager.store('text_color', values.text_color[0]),
                    stateManager.store('background_color', values.background_color[0]),
                    stateManager.store('font_size', values.font_size[0]),
                    stateManager.store('font', values.font[0]),
                    stateManager.store('horizontal_padding', values.horizontal_padding),
                    stateManager.store('vertical_padding', values.vertical_padding),
                    stateManager.store('image_width', values.image_width),
                    stateManager.store('lines_per_page', values.lines_per_page)
                ]).then()
            },
            validate: async (): Promise<boolean> => {
                return true
            }
        })
    })
}

interface HomePageSection {
    name: string,
    enum: string,
    default?: true
}

class HomePageSectionClass {
    Sections: HomePageSection[] = [
        {
            name: 'Featured',
            enum: '0',
            default: true
        },
        {
            name: 'Latest Titles',
            enum: '1',
            default: true
        },
        {
            name: 'New Ongoing Releases',
            enum: '2',
            default: true
        },
        {
            name: 'Weekly Most Active',
            enum: '3',
            default: true
        },
        {
            name: 'Most Read',
            enum: '4',
            default: true
        },
        {
            name: 'Most Trends',
            enum: '5',
            default: true
        },
        {
            name: 'User Rated',
            enum: '6',
            default: true
        },
        {
            name: 'Completed Series',
            enum: '7',
            default: true
        },
    ]
    getEnumList(): string[] {
        return this.Sections.map(Sections => Sections.enum)
    }

    getName(sectionsEnum: string): string {
        return this.Sections.filter(Sections => Sections.enum == sectionsEnum)[0]?.name ?? ''
    }

    getDefault(): string[] {
        return this.Sections.filter(Sections => Sections.default).map(Sections => Sections.enum)
    }
}
export const HomePageSections = new HomePageSectionClass()

export const getEnabledHomePageSections = async (stateManager: SourceStateManager): Promise<string[]> => {
    const enabled_homepage_sections: string[] = await stateManager.retrieve('enabled_homepage_sections') as string[]
    return enabled_homepage_sections != undefined && enabled_homepage_sections.length > 0 ? enabled_homepage_sections : HomePageSections.getDefault()
}

export const homeSections = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'homepage_settings',
        value: '',
        label: 'Homepage Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('enabled_homepage_sections', values.enabled_homepage_sections),
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'homepage_sections_section',
                        footer: 'Note: Select the sections you would like to display on the home page.\nMINIMUM 1 SECTION MUST BE SELECTED',
                        rows: () => {
                            return Promise.all([
                                getEnabledHomePageSections(stateManager),
                            ]).then(async values => {
                                return [
                                    createSelect({
                                        id: 'enabled_homepage_sections',
                                        label: 'Homepage sections',
                                        options: HomePageSections.getEnumList(),
                                        displayLabel: option => HomePageSections.getName(option),
                                        value: values[0] ?? [],
                                        allowsMultiselect: true,
                                        minimumOptionCount: 0,
                                    }),
                                ]
                            })
                        }
                    }),
                ])
            }
        })
    })
}