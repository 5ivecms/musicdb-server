export class CreateManyGenresDto {
  id: number
  name: string
  parentSourceId: number
  sourceId: number
  sub?: SubGenre[]
}

export interface SubGenre {
  id: number
  name: string
  shortName: string
}
