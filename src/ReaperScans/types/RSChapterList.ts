export type RSChapterList = {
    meta?: ChapterDetailsMeta
    data?: RSChapterListData[]
}

export type RSChapterListData = {
    id?: number
    chapter_name?: string
    chapter_title?: null
    chapter_thumbnail?: string
    chapter_slug?: string
    price?: number
    created_at?: string
    series?: Series
    meta?: object
}

type Series = {
    series_slug?: string
    id?: number
    latest_chapter?: null
    meta?: object
}

type ChapterDetailsMeta = {
    total?: number
    per_page?: number
    current_page?: number
    last_page?: number
    first_page?: number
    first_page_url?: string
    last_page_url?: string
    next_page_url?: string
    previous_page_url?: null
}
