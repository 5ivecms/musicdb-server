import { IsString } from 'class-validator'

export class FindBySourceIdsGenreDto {
  @IsString({ message: 'Укажите ids' })
  ids: string
}
