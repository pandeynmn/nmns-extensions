export type RSMangaDetails = {
    id?: number
    title?: string
    series_slug?: string
    thumbnail?: string
    description?: string
    series_type?: string
    tags?: Tag[]
    rating?: number
    status?: string
    release_schedule?: object
    nu_link?: null
    seasons?: any[]
    alternative_names?: string
    studio?: string
    author?: string
    release_year?: string
    meta?: object
}
export type Tag = {
    id?: number
    name?: string
    description?: null
    created_at?: string
    updated_at?: string
    color?: string
}
