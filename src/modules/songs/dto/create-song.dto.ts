export class CreateSongDto {
  sourceId: number
  title: string
  slug: string
  credits: string
  duration: number
  template: string
  image: string
  artistIds: number[]
  genreIds: number[]
  releaseId: number
}
