export class CreateReleaseDto {
  sourceId: number
  title: string
  slug: string
  template: string
  credits: string
  image: string
  genresSourceIds: number[]
  artistSourceIds: number[]
}
