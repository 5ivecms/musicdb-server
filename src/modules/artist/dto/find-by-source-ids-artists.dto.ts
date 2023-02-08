import { IsString } from 'class-validator'

export class FindBySourceIdsArtistsDto {
  @IsString({ message: 'Укажите ids' })
  ids: string
}
