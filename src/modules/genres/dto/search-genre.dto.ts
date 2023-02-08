import type { GenreEntity } from '../genre.entity'

export class SearchGenreDto {
  page: number
  limit: number
  search: Partial<GenreEntity>
  order: string
  orderBy: string
}
