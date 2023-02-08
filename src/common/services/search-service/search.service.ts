import type { Repository } from 'typeorm'

import type { SearchDto } from './search.dto'
import { getRelations, prepareObject, prepareOrder, prepareSearch } from './utils'

export class SearchService<T> {
  constructor(private readonly repository: Repository<T>) {}

  public async search(dto: SearchDto<T>) {
    try {
      const newDto = prepareObject(dto) as SearchDto<T>

      let { limit, page, order, orderBy } = newDto

      orderBy = orderBy || 'id'
      order = (order || 'desc').toUpperCase()

      limit = limit || 10
      limit > 100 ? 100 : limit

      page = page || 1
      page < 1 ? 1 : page

      const offset = (page - 1) * limit

      const [items, total] = await this.repository.findAndCount({
        relations: newDto.relations ?? getRelations(newDto.search),
        where: newDto.search ? prepareSearch(newDto.search) : {},
        skip: offset,
        take: limit,
        order: prepareOrder({ [orderBy]: order }),
      })

      return { items, total, page, limit }
    } catch (e) {
      return { items: [], total: 0, page: 1, limit: 10 }
    }
  }
}
