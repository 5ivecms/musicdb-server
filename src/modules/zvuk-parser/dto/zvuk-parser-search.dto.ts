import { IsNumberString, IsOptional, IsString } from 'class-validator'

export class ZvukParserSearchDto {
  @IsString()
  @IsOptional()
  query: string

  @IsNumberString()
  @IsOptional()
  limit?: number

  @IsString()
  mode: 'new' | 'popular' | 'query'
}
