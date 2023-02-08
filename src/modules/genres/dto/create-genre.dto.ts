export class CreateGenreDto {
  name: string
  slug: string
  shortName?: string
  parentId?: number
  sourceId?: number
  parentSourceId?: number
}
