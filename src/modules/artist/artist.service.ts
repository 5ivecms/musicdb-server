/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { DeleteResult, UpdateResult } from 'typeorm'
import { In, Repository } from 'typeorm'

import type { OrderDirection } from '../../types'
import { isNumeric } from '../../utils'
import { ArtistEntity } from './artist.entity'
import type { CreateArtistDto, SearchArtistsDto, UpdateArtistDto } from './dto'

@Injectable()
export class ArtistService {
  constructor(@InjectRepository(ArtistEntity) private readonly artistRepository: Repository<ArtistEntity>) {}

  public async findAll() {
    return this.artistRepository.find()
  }

  public async search(dto: SearchArtistsDto) {
    let { limit, page, order, orderBy } = dto
    const { search } = dto

    orderBy = orderBy || 'id'
    order = (order || 'desc').toUpperCase()

    limit = limit || 10
    limit > 100 ? 100 : limit

    page = page || 1
    page < 1 ? 1 : page

    const offset = (page - 1) * limit

    const queryBuilder = this.artistRepository.createQueryBuilder('song')

    queryBuilder.orderBy(`song.${orderBy}`, order as OrderDirection)
    queryBuilder.offset(offset)
    queryBuilder.limit(limit)

    if (search) {
      Object.keys(search).forEach((key) => {
        if (isNumeric(search[key])) {
          queryBuilder.andWhere(`song.${key} = :${key}`, { [key]: search[key] })
          return
        }
        queryBuilder.andWhere(`song.${key} ILIKE :${key}`, { [key]: `%${search[key]}%` })
      })
    }

    const [items, total] = await queryBuilder.getManyAndCount()

    return { items, total, page, limit }
  }

  public async findOne(id: number): Promise<ArtistEntity> {
    const artist = await this.artistRepository.findOne({ where: { id } })

    if (!artist) {
      throw new NotFoundException('Artist not found')
    }

    return artist
  }

  public async findBySourceIds(ids: number[]) {
    return await this.artistRepository.find({ where: { sourceId: In(ids) } })
  }

  public async create(dto: CreateArtistDto): Promise<ArtistEntity> {
    const { sourceId } = dto
    const existArtist = await this.artistRepository.findOne({ where: { sourceId } })

    if (existArtist) {
      return existArtist
    }

    return this.artistRepository.save(dto)
  }

  public async update(id: number, dto: UpdateArtistDto): Promise<UpdateResult> {
    await this.findOne(id)
    return await this.artistRepository.update(id, dto)
  }

  public async delete(id: number): Promise<DeleteResult> {
    await this.findOne(id)
    return await this.artistRepository.delete(id)
  }

  public async count(): Promise<number> {
    return await this.artistRepository.count()
  }
}
