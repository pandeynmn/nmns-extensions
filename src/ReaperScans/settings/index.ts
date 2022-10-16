import {
    NavigationButton,
    SourceStateManager
} from 'paperback-extensions-common'


export const getRowBool = async (stateManager: SourceStateManager): Promise<boolean> => {
    return (await stateManager.retrieve('row_type') as boolean) ?? false
}

export const contentSettings = (stateManager: SourceStateManager): NavigationButton => {
    return createNavigationButton({
        id: 'content_settings',
        value: '',
        label: 'Content Settings',
        form: createForm({
            onSubmit: (values: any) => {
                return Promise.all([
                    stateManager.store('row_type', values.row_type),
                ]).then()
            },
            validate: () => {
                return Promise.resolve(true)
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'content',
                        footer: 'Change latest row type from normal to large.\nRefresh the discover page after changing the setting.',
                        rows: () => {
                            return Promise.all([
                                getRowBool(stateManager),
                            ]).then(async values => {
                                return [
                                    createSwitch({
                                        id: 'row_type',
                                        label: 'Display Large Rows',
                                        value: values[0]
                                    })
                                ]
                            })
                        }
                    })
                ])
            }
        })
    })
}
