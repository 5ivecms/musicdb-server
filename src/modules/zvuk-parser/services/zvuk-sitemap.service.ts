/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { DeleteResult } from 'typeorm'
import { Like, Repository } from 'typeorm'

import type { CreateZvukSitemapDto, UpdateZvukSitemapDto, ZvukSitemapsSearchDto } from '../dto'
import { ZvukSitemapEntity } from '../entities'
import { ZvukSitemapStatus } from '../zvuk-parser.types'

@Injectable()
export class ZvukSitemapService {
  constructor(@InjectRepository(ZvukSitemapEntity) private readonly sitemapRepository: Repository<ZvukSitemapEntity>) {}

  public async findAll(dto: ZvukSitemapsSearchDto) {
    let take = dto.limit || 10
    if (take > 100) {
      take = 100
    }
    let page = dto.page || 1
    if (page < 1) {
      page = 1
    }
    const skip = (page - 1) * take
    const orderBy = dto.orderBy || 'id'
    const order = dto.order || 'DESC'

    let where = {}
    if (dto.search && Object.keys(dto.search)) {
      where = Object.keys(dto.search).reduce((acc, item) => {
        if (item === 'id' || item === 'status') {
          if (String(dto.search[item]) !== '') {
            return { ...acc, [item]: Number(dto.search[item]) }
          } else {
            return { ...acc }
          }
        }
        return { ...acc, [item]: Like('%' + dto.search[item] + '%') }
      }, {})
    }

    const [result, total] = await this.sitemapRepository.findAndCount({
      where,
      order: { [orderBy]: order.toLocaleUpperCase() },
      take,
      skip,
    })

    return {
      items: result,
      total,
      page: Number(page),
      limit: take,
    }
  }

  public async findOne(id: number): Promise<ZvukSitemapEntity> {
    const entity = await this.sitemapRepository.findOne({ where: { id } })

    if (!entity) {
      throw new NotFoundException('Sitemap not found')
    }

    return entity
  }

  public async info() {
    const completedSitemaps = await this.sitemapRepository.count({
      where: { status: ZvukSitemapStatus.STATUS_COMPLETED },
    })
    const newSitemaps = await this.sitemapRepository.count({ where: { status: ZvukSitemapStatus.STATUS_NEW } })
    const processSitemaps = await this.sitemapRepository.count({ where: { status: ZvukSitemapStatus.STATUS_PROCESS } })
    const total = newSitemaps + completedSitemaps + processSitemaps

    return {
      new: newSitemaps,
      completed: completedSitemaps,
      process: processSitemaps,
      total,
    }
  }

  public async create(dto: CreateZvukSitemapDto): Promise<ZvukSitemapEntity> {
    return await this.sitemapRepository.save(dto)
  }

  public async update(id: number, dto: UpdateZvukSitemapDto) {
    await this.findOne(id)
    return await this.sitemapRepository.update(id, dto)
  }

  public async delete(id: number): Promise<DeleteResult> {
    await this.findOne(id)
    return await this.sitemapRepository.delete(id)
  }

  public async deleteAll(): Promise<void> {
    return await this.sitemapRepository.clear()
  }
}
