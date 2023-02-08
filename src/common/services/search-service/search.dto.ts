import { IsNumberString, IsObject, IsOptional, IsString } from 'class-validator'

export class SearchDto<T> {
  @IsOptional()
  @IsNumberString()
  public readonly page: number

  @IsOptional()
  @IsNumberString()
  public readonly limit: number

  @IsOptional()
  @IsString()
  public readonly order: string

  @IsOptional()
  @IsString()
  public readonly orderBy: string

  @IsObject()
  @IsOptional()
  public readonly search: Partial<T>

  @IsObject()
  @IsOptional()
  public readonly relations?: object
}
