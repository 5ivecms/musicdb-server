/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as slug from 'slug'
import type { DeleteResult, UpdateResult } from 'typeorm'
import { In, Like, Repository } from 'typeorm'

import type { CreateGenreDto, CreateManyGenresDto, SubGenre, UpdateGenreDto } from './dto'
import type { SearchGenreDto } from './dto/search-genre.dto'
import { GenreEntity } from './genre.entity'

@Injectable()
export class GenresService {
  constructor(@InjectRepository(GenreEntity) private readonly genreRepository: Repository<GenreEntity>) {}

  public async findAll(dto: SearchGenreDto) {
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
        if (item === 'id') {
          if (String(dto.search[item]) !== '') {
            return { ...acc, [item]: Number(dto.search[item]) }
          } else {
            return { ...acc }
          }
        }
        return { ...acc, [item]: Like('%' + dto.search[item] + '%') }
      }, {})
    }

    const [result, total] = await this.genreRepository.findAndCount({
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

  public async findOne(id: number): Promise<GenreEntity> {
    const genre = await this.genreRepository.findOne({ where: { id } })

    if (!genre) {
      throw new NotFoundException('Genre not found')
    }

    return genre
  }

  public async findBySourceId(sourceId: number): Promise<GenreEntity> {
    const genre = await this.genreRepository.findOne({ where: { sourceId } })

    if (!genre) {
      throw new NotFoundException('Genre not found')
    }

    return genre
  }

  public async findBySourceIds(ids: number[]) {
    return await this.genreRepository.find({ where: { sourceId: In(ids) } })
  }

  public async save(dto: CreateGenreDto): Promise<GenreEntity> {
    const { sourceId } = dto

    if (sourceId) {
      const existGenre = await this.genreRepository.findOne({ where: { sourceId } })

      if (existGenre) {
        return existGenre
      }
    }

    return await this.genreRepository.save(dto)
  }

  public create(dto: CreateGenreDto): GenreEntity {
    return this.genreRepository.create(dto)
  }

  public async createMany(dto: CreateManyGenresDto[]): Promise<GenreEntity[]> {
    const sourceIds = dto.map((item: CreateManyGenresDto) => item.sourceId)
    const existGenresSourceIds = (await this.genreRepository.find()).map((genre) => Number(genre.sourceId))
    const newGenresSourceIds = sourceIds.filter((sourceId) => !existGenresSourceIds.includes(sourceId))
    const newGenres = dto.filter((item) => newGenresSourceIds.includes(item.sourceId))

    const parentGenres = newGenres.reduce((acc: GenreEntity[], genre: CreateManyGenresDto) => {
      const { name, parentSourceId, sourceId } = genre
      if (parentSourceId === 0) {
        const entity = this.genreRepository.create({
          name,
          slug: slug(name),
          sourceId,
          parentSourceId,
          parentId: 0,
        })
        return [...acc, entity]
      }
      return acc
    }, [])

    const subGenres = newGenres.reduce((acc: GenreEntity[], parentGenre: CreateManyGenresDto) => {
      if (parentGenre.sub) {
        const entities = parentGenre.sub.reduce((acc: GenreEntity[], genre: SubGenre) => {
          const { id, name, shortName } = genre
          const entity = this.genreRepository.create({
            name,
            slug: slug(name),
            shortName,
            sourceId: id,
            parentSourceId: parentGenre.id,
            parentId: 0,
          })
          return [...acc, entity]
        }, [])
        return [...acc, ...entities]
      }
      return acc
    }, [])

    const parentGenresResult = await Promise.all(
      parentGenres.map(async (genre) => {
        return await this.genreRepository.save(genre)
      })
    )

    const subGenresEntities = await Promise.all(
      subGenres.map(async (subGenre) => {
        const parentGenre = await this.findBySourceId(subGenre.parentSourceId)
        subGenre.parentId = parentGenre.id
        return subGenre
      })
    )

    const subGenresResult = await Promise.all(
      subGenresEntities.map(async (genre) => {
        return await this.genreRepository.save(genre)
      })
    )

    return [...parentGenresResult, ...subGenresResult]
  }

  public async update(id: number, dto: UpdateGenreDto): Promise<UpdateResult> {
    await this.findOne(id)
    return await this.genreRepository.update(id, dto)
  }

  public async delete(id: number): Promise<DeleteResult> {
    await this.findOne(id)

    const subGenres = await this.genreRepository.find({ where: { parentId: id } })

    Promise.all(
      subGenres.map(async (subGenre) => {
        await this.genreRepository.delete(subGenre.id)
      })
    )

    return await this.genreRepository.delete(id)
  }

  public async deleteMany(ids: string) {
    const idsArray = ids.split(',')

    await Promise.all(
      idsArray.map(async (id) => {
        await this.delete(Number(id))
      })
    )
  }
}
