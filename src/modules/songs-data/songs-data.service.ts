/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import type { DeleteResult } from 'typeorm'
import { getConnection, Like, Repository } from 'typeorm'
import { Parser } from 'xml2js'

import { ZvukParserUrls } from '../zvuk-parser/zvuk-parser.types'
import type { SearchSongsDataDto } from './dto/search-songs-data.dto'
import SongsDataEntity from './songs-data.entity'
import type { SongDataStatusType } from './songs-data.interfaces'

@Injectable()
export class SongsDataService {
  constructor(@InjectRepository(SongsDataEntity) private songsDataRepository: Repository<SongsDataEntity>) {}

  public async findAll(dto: SearchSongsDataDto) {
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

    const [result, total] = await this.songsDataRepository.findAndCount({
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

  public async findOne(id: number): Promise<SongsDataEntity> {
    const songsData = await this.songsDataRepository.findOne({ where: { id } })

    if (!songsData) {
      throw new NotFoundException('Songs data not Found')
    }

    return songsData
  }

  public async updateStatus(ids: number[], status: SongDataStatusType) {
    return await this.songsDataRepository.update(ids, { status })
  }

  public async saveSongIds(songIds: string[]): Promise<any> {
    const songEntities = songIds.map((songId) => this.songsDataRepository.create({ zvukId: Number(songId) }))

    const { raw } = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(SongsDataEntity)
      .values(songEntities)
      .onConflict(`("zvukId") DO NOTHING`)
      .execute()

    return raw
  }

  public async parseSongsIds(): Promise<void> {
    const xmlParser = new Parser()
    let songSitemapUrls = []

    try {
      const { data } = await axios.get(ZvukParserUrls.TRACKS_XML_URL)
      songSitemapUrls = this.parseXml(data)
    } catch (e) {
      throw new InternalServerErrorException(JSON.stringify(e))
    }

    const perChunk = 1
    const chunks = songSitemapUrls.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk)
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []
      }
      resultArray[chunkIndex].push(item)
      return resultArray
    }, [])

    let songUrls = []
    for (const chunk of chunks) {
      const promises = []
      for (const url of chunk) {
        promises.push(axios.get(url))
      }

      const result = await Promise.all(promises)
      songUrls = result.reduce((acc: any, item: any) => {
        let urls = []
        xmlParser.parseString(item.data, (_, result) => {
          urls = result.urlset.url.reduce((acc: any, item: any) => [...acc, item.loc[0]], [])
        })
        return [...acc, ...urls]
      }, [])

      const songIds: string[] = songUrls.reduce((acc: string[], item: string) => [...acc, item.split('/').pop()], [])
      const uniqueSongIds = Array.from(new Set(songIds))

      await this.saveSongIds(uniqueSongIds)
    }
  }

  private parseXml(data: string): string[] {
    let urls = []
    const xmlParser = new Parser()
    xmlParser.parseString(data, (_, result) => {
      urls = result.sitemapindex.sitemap.reduce((acc: any, item: any) => [...acc, item.loc[0]], [])
    })
    return urls
  }

  public async delete(id: number): Promise<DeleteResult> {
    await this.findOne(id)
    return await this.songsDataRepository.delete(id)
  }

  public async deleteMany(ids: string) {
    return await this.songsDataRepository.delete(ids.split(','))
  }

  public async deleteAll(): Promise<void> {
    return await this.songsDataRepository.clear()
  }
}
