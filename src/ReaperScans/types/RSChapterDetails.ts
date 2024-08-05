export type RSChapterDetails = {
    chapter?: RSCHapterDetailsData
    previous_chapter?: object
    next_chapter?: object
}

export type RSCHapterDetailsData = {
    id?: number
    series_id?: number
    season_id?: null
    index?: string
    chapter_name?: string
    chapter_title?: null
    chapter_data?: { images: string[] }
    chapter_content?: null
    chapter_thumbnail?: string
    chapter_slug?: string
    chapter_unique_id?: string
    views?: number
    chapter_type?: string
    price?: number
    created_at?: string
    updated_at?: null
    storage?: string
    public?: boolean
    release_date?: null
    series?: Series
    who_bought?: any[]
    chapters_to_be_freed?: any[]
    meta?: object
}

export type Series = {
    id?: number
    series_slug?: string
    thumbnail?: string
    title?: string
    latest_chapter?: null
    meta?: object
}
