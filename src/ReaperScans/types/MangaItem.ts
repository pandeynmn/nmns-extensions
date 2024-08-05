export type MangaItem = {
    id?: number
    title?: string
    description?: string
    author?: string
    studio?: string
    release_year?: string
    alternative_names?: string
    adult?: boolean
    series_type?: string
    series_slug?: string
    visibility?: string
    thumbnail?: string
    total_views?: number
    year_views?: number
    month_views?: number
    week_views?: number
    day_views?: number
    status?: string
    created_at?: Date
    updated_at?: Date
    badge?: string
    latest?: string
    rating?: number
    release_schedule?: { string: boolean }
    nu_link?: null | string
    total_used_coins?: number
    year_used_coins?: number
    month_used_coins?: number
    week_used_coins?: number
    day_used_coins?: number
    total_bought_chapters?: number
    year_bought_chapters?: number
    month_bought_chapters?: number
    week_bought_chapters?: number
    day_bought_chapters?: number
    is_coming_soon?: boolean
    latest_chapter?: null
    meta?: any
}
