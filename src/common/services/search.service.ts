import type { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm'

import { prepareObject, prepareOrder, prepareSearch } from '../../utils/object'
import type { SearchDto } from '../dto/search.dto'

export class SearchService<T> {
  constructor(private readonly repository: Repository<T>) {}

  public async search(dto: SearchDto<T>) {
    try {
      const newDto = prepareObject(dto) as SearchDto<T>

      let { limit, page, order, orderBy } = newDto
      const { search } = newDto

      orderBy = orderBy || 'id'
      order = (order || 'desc').toUpperCase()

      limit = limit || 10
      limit > 100 ? 100 : limit

      page = page || 1
      page < 1 ? 1 : page

      const offset = (page - 1) * limit

      let relations: FindOptionsRelations<T> = {}
      if (newDto.relations) {
        relations = newDto.relations
      }

      let where: FindOptionsWhere<T> = {}
      if (search) {
        where = prepareSearch(search)
      }

      const [items, total] = await this.repository.findAndCount({
        relations,
        where,
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
