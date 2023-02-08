import { IsNumber } from 'class-validator'

export class ParseArtistDto {
  @IsNumber()
  readonly artistId: number
}
