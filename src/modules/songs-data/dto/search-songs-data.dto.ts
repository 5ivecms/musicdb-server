import type SongsDataEntity from '../songs-data.entity'

export class SearchSongsDataDto {
  page: number
  limit: number
  search: Partial<SongsDataEntity>
  order: string
  orderBy: string
}
