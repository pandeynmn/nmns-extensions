export type MangaItem = {
    title?: string
    id?: number
    thumbnail?: string
    series_slug?: string
    badge?: string
    status?: string
    description?: string
    meta?: Meta
}

export type Meta = {
    chapters_count?: string
    who_bookmarked_count?: string
}
