/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import type { DeleteResult, UpdateResult } from 'typeorm'
import { In, Repository } from 'typeorm'

import { SearchService } from '../../common/services/search.service'
import { ArtistService } from '../artist/artist.service'
import { GenresService } from '../genres/genres.service'
import { ReleasesService } from '../releases/releases.service'
import type { CreateSongDto } from './dto'
import { SongEntity } from './song.entity'

@Injectable()
export class SongsService extends SearchService<SongEntity> {
  constructor(
    @InjectRepository(SongEntity) private readonly songsRepository: Repository<SongEntity>,
    private readonly artistsService: ArtistService,
    private readonly releaseService: ReleasesService,
    private readonly genreService: GenresService
  ) {
    super(songsRepository)
  }

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
