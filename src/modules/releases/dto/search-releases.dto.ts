import { IsNumberString, IsObject, IsOptional, IsString } from 'class-validator'

import type { ReleaseEntity } from '../release.entity'

export class SearchReleasesDto {
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
  public readonly search: Partial<ReleaseEntity>
}
