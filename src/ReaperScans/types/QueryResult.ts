export type QueryResult = {
    meta?: object
    data?: QueryData[]
}

export type QueryData = {
    id?: number
    title?: string
    description?: string
    alternative_names?: string
    series_type?: string
    series_slug?: string
    thumbnail?: string
    status?: string
    created_at?: string
    badge?: string
    latest?: string
    rating?: number
    release_schedule?: null
    nu_link?: null
    is_coming_soon?: boolean
    free_chapters?: QueryChapter[] | null
    paid_chapters?: QueryChapter[] | null
    latest_chapter?: QueryChapter | null
    meta?: object
}

export type QueryChapter = {
    id?: number
    chapter_name?: string
    chapter_slug?: string
    created_at?: string
    series_id?: number
    index?: string
    chapters_to_be_freed?: any[]
    meta?: object
}
