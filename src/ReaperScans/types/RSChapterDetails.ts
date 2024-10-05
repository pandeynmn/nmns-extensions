export type RSChapterData = {
    chapter?: Chapter
    previous_chapter?: PreviousChapter
    next_chapter?: null
}

export type RSChapterDetailsData = {
    id?: number
    series_id?: number
    season_id?: null
    index?: string
    chapter_name?: string
    chapter_title?: null
    chapter_data?: ChapterData
    chapter_content?: null
    chapter_thumbnail?: string
    chapter_slug?: string
    chapter_unique_id?: string
    chapter_type?: string
    price?: number
    created_at?: string
    updated_at?: null
    storage?: string
    public?: boolean
    release_date?: null
    series?: Series
    adaptations?: any[]
    who_bought?: any[]
    chapters_to_be_freed?: any[]
    novel_chapters?: any[]
    excerpt?: null
    meta?: ChapterMeta
}

export type ChapterData = {
    files?: File[]
}

export type File = {
    url?: string
    width?: number
    height?: number
}

export type ChapterMeta = {
    continuation?: null
}

export type Series = {
    id?: number
    series_slug?: string
    thumbnail?: string
    title?: string
    meta?: SeriesMeta
}

export type SeriesMeta = {}

export type PreviousChapter = {
    id?: number
    chapter_name?: string
    chapter_title?: null
    chapter_slug?: string
    chapters_to_be_freed?: any[]
    novel_chapters?: any[]
    excerpt?: null
    meta?: SeriesMeta
}
