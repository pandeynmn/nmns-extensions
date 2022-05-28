import { NavigationButton,
    SourceStateManager} from 'paperback-extensions-common'

import { languageSettings } from './languageSettings'

export { getEnabledLanguages } from './languageSettings'

export const mangaSection = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'Content Settings',
        value: '',
        label: 'Content Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('enabled_chapter_languages', values.enabled_chapter_languages),
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    languageSettings(stateManager)
                ])
            }
        })
    })
}