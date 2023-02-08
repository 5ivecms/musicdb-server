import { IsEnum } from 'class-validator'

import { ZvukSitemap, ZvukSitemapType } from '../zvuk-parser.types'

export class ZvukParseSitemapDto {
  @IsEnum(ZvukSitemap, { message: 'ой ой ой' })
  type: ZvukSitemapType
}
