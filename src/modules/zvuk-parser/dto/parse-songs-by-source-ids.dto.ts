import { ArrayMinSize, IsArray } from 'class-validator'

export class ParseSongsBySourceIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  readonly sourceIds: number[]
}
