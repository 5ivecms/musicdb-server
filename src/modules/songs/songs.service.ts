/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { DeleteResult, UpdateResult } from 'typeorm'
import { In, Repository } from 'typeorm'
import type { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations'
import type { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'

import { prepareObject, prepareOrder, prepareSearch } from '../../utils/object'
import { ArtistService } from '../artist/artist.service'
import { GenresService } from '../genres/genres.service'
import { ReleasesService } from '../releases/releases.service'
import type { CreateSongDto, SearchSongsDto } from './dto'
import { SongEntity } from './song.entity'

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(SongEntity) private readonly songsRepository: Repository<SongEntity>,
    private readonly artistsService: ArtistService,
    private readonly releaseService: ReleasesService,
    private readonly genreService: GenresService
  ) {}

  public async findAll() {
    return this.songsRepository.find()
  }

  public async findOne(id: number): Promise<SongEntity> {
    const song = await this.songsRepository.findOne({ where: { id } })

    if (!song) {
      throw new NotFoundException('Song not found')
    }

    return song
  }

  public async search(dto: SearchSongsDto) {
    const newDto = prepareObject(dto) as SearchSongsDto

    let { limit, page, order, orderBy } = newDto
    const { search } = newDto

    orderBy = orderBy || 'id'
    order = (order || 'desc').toUpperCase()

    limit = limit || 10
    limit > 100 ? 100 : limit

    page = page || 1
    page < 1 ? 1 : page

    const offset = (page - 1) * limit

    let relations: FindOptionsRelations<SongEntity> = {}
    if (newDto.relations) {
      relations = newDto.relations
    }

    let where: FindOptionsWhere<SongEntity> = {}
    if (search) {
      where = prepareSearch(search)
    }

    const [items, total] = await this.songsRepository.findAndCount({
      relations,
      where,
      skip: offset,
      take: limit,
      order: prepareOrder({ [orderBy]: order }),
    })

    return { items, total, page, limit }

    /* try {
      let { limit, page, order, orderBy } = dto
      const { search } = dto

      orderBy = orderBy || 'id'
      order = (order || 'desc').toUpperCase()

      limit = limit || 10
      limit > 100 ? 100 : limit

      page = Number(page)
      page = page || 1
      page < 1 ? 1 : page

      const offset = (page - 1) * limit

      let relations: FindOptionsRelations<SongEntity> = {}
      if (dto.relations) {
        relations = { ...dto.relations }
      }

      console.log(Object.keys(search))
      let where: FindOptionsWhere<SongEntity> = {}
      if (search) {
        where = { ...search }
      }

      const [items, total] = await this.songsRepository.findAndCount({
        relations,
        where,
        skip: offset,
        take: limit,
        order: { [orderBy]: order },
      })

      return { items, total, page, limit }
    } catch (e) {
      console.log(e)
      console.log('ошибка')
      return { items: [], total: 0, page: 1, limit: 10 }
    } */
  }

  public async findBySourceId(sourceId: number): Promise<SongEntity> {
    return await this.songsRepository.findOne({ where: { sourceId } })
  }

  public async checkExistSourceIds(sourceIds: number[]): Promise<number[]> {
    const existSongs = await this.songsRepository.find({ where: { sourceId: In(sourceIds) } })
    return existSongs.map((song) => song.sourceId)
  }

  public async create(dto: CreateSongDto) {
    const { sourceId, artistIds, credits, duration, genreIds, image, releaseId, template, title, slug } = dto
    const existSong = await this.findBySourceId(sourceId)

    if (existSong) {
      return existSong
    }

    const artists = await this.artistsService.findBySourceIds(artistIds)
    const genres = await this.genreService.findBySourceIds(genreIds)
    const release = await this.releaseService.findBySourceId(releaseId)

    const song = this.songsRepository.create({
      sourceId,
      credits,
      duration,
      image,
      template,
      title,
      slug,
      genres,
      artists,
      release: release,
    })

    return await this.songsRepository.save(song)
  }

  public async update(id: number, dto: any): Promise<UpdateResult> {
    await this.findOne(id)
    return await this.songsRepository.update(id, dto)
  }

  public async delete(id: number): Promise<DeleteResult> {
    await this.findOne(id)
    return await this.songsRepository.delete(id)
  }
}
