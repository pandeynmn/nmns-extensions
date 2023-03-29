"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mangaSection = exports.getEnabledLanguages = void 0;
const languageSettings_1 = require("./languageSettings");
var languageSettings_2 = require("./languageSettings");
Object.defineProperty(exports, "getEnabledLanguages", { enumerable: true, get: function () { return languageSettings_2.getEnabledLanguages; } });
const mangaSection = (stateManager) => {
    return createNavigationButton({
        id: 'Content Settings',
        value: '',
        label: 'Content Settings',
        form: createForm({
            onSubmit: (values) => {
                return Promise.all([
                    stateManager.store('enabled_chapter_languages', values.enabled_chapter_languages),
                ]).then();
            },
            validate: () => {
                return Promise.resolve(true);
            },
            sections: () => {
                return Promise.resolve([
                    (0, languageSettings_1.languageSettings)(stateManager)
                ]);
            }
        })
    });
};
exports.mangaSection = mangaSection;
