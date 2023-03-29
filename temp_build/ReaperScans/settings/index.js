"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentSettings = exports.getRowBool = void 0;
const getRowBool = async (stateManager) => {
    return await stateManager.retrieve('row_type') ?? false;
};
exports.getRowBool = getRowBool;
const contentSettings = (stateManager) => {
    return createNavigationButton({
        id: 'content_settings',
        value: '',
        label: 'Content Settings',
        form: createForm({
            onSubmit: (values) => {
                return Promise.all([
                    stateManager.store('row_type', values.row_type),
                ]).then();
            },
            validate: () => {
                return Promise.resolve(true);
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'content',
                        footer: 'Change latest row type from normal to large.\nRefresh the discover page after changing the setting.',
                        rows: () => {
                            return Promise.all([
                                (0, exports.getRowBool)(stateManager),
                            ]).then(async (values) => {
                                return [
                                    createSwitch({
                                        id: 'row_type',
                                        label: 'Display Large Rows',
                                        value: values[0]
                                    })
                                ];
                            });
                        }
                    })
                ]);
            }
        })
    });
};
exports.contentSettings = contentSettings;
