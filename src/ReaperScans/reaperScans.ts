import { 
    ContentRating,
    LanguageCode, 
    SourceInfo, 
    TagType 
} from 'paperback-extensions-common'
import { 
    getExportVersion, 
    Madara 
} from './Madara'

const RS_DOMAIN = 'https://reaperscans.com/'

export const ReaperScansInfo: SourceInfo = {
    version: getExportVersion('0.0.1'),
    name: 'ReaperScans',
    description: 'Extension that pulls manga from ReaperScans, includes advance genre search. Uses modified version of Madara generic source',
    author: 'NmN',
    authorWebsite: 'http://github.com/pandeynmm',
    icon: 'rslogo.png',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: RS_DOMAIN,
    sourceTags: [
        {
            text: 'Buggy',
            type: TagType.RED,
        },
    ],
}

export class ReaperScans extends Madara {
    baseUrl: string = RS_DOMAIN;
    languageCode: LanguageCode = LanguageCode.ENGLISH;
    override hasAdvancedSearchPage = true;
}
