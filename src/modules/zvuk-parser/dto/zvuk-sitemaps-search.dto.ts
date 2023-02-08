import type { ZvukSitemapEntity } from '../entities'

export class ZvukSitemapsSearchDto {
  search?: Partial<ZvukSitemapEntity>
  page?: number
  limit?: number
  order?: string
  orderBy?: string
}
