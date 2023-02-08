import { IsNumber, IsString } from 'class-validator'

export class CreateZvukSitemapDto {
  @IsString()
  url: string

  @IsString()
  type: string

  @IsNumber()
  status: number
}
