/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { OrderDirection } from '../../types'
import { isNumeric } from '../../utils'
import { ArtistService } from '../artist/artist.service'
import { GenresService } from '../genres/genres.service'
import type { CreateReleaseDto, SearchReleasesDto } from './dto'
import { ReleaseEntity } from './release.entity'

@Injectable()
export class ReleasesService {
  constructor(
    @InjectRepository(ReleaseEntity) private readonly releaseRepository: Repository<ReleaseEntity>,
    private readonly artistService: ArtistService,
    private readonly genreService: GenresService
  ) {}

  public async findAll() {
    return this.releaseRepository.find()
  }

  public async search(dto: SearchReleasesDto) {
    let { limit, page, order, orderBy } = dto
    const { search } = dto

    orderBy = orderBy || 'id'
    order = (order || 'desc').toUpperCase()

    limit = limit || 10
    limit > 100 ? 100 : limit

    page = page || 1
    page < 1 ? 1 : page

    const offset = (page - 1) * limit

    const queryBuilder = this.releaseRepository.createQueryBuilder('song')

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

  public async findOne(id: number): Promise<ReleaseEntity> {
    const release = await this.releaseRepository.findOne({ where: { id } })

    if (!release) {
      throw new NotFoundException('Release not found')
    }

    return release
  }

  public async findBySourceId(sourceId: number): Promise<ReleaseEntity> {
    return await this.releaseRepository.findOne({ where: { sourceId } })
  }

  public async create(dto: CreateReleaseDto): Promise<ReleaseEntity> {
    const { sourceId, genresSourceIds, artistSourceIds, template, title, credits, image, slug } = dto

    if (sourceId) {
      const existRelease = await this.releaseRepository.findOne({ where: { sourceId } })

      if (existRelease) {
        return existRelease
      }
    }

    const genres = await this.genreService.findBySourceIds(genresSourceIds)
    const artists = await this.artistService.findBySourceIds(artistSourceIds)

    const release = this.releaseRepository.create({
      sourceId,
      template,
      slug,
      title,
      credits,
      image,
    })

    release.artists = artists
    release.genres = genres

    return await this.releaseRepository.save(release)
  }
}
