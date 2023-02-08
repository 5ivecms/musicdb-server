import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import axios from 'axios'
import * as slug from 'slug'
import type { ArtistEntity } from 'src/modules/artist/artist.entity'
import { Parser } from 'xml2js'

import { ArtistService } from '../../artist/artist.service'
import type { GenreEntity } from '../../genres/genre.entity'
import { GenresService } from '../../genres/genres.service'
import { ReleasesService } from '../../releases/releases.service'
import { SongsService } from '../../songs/songs.service'
import { SongsDataService } from '../../songs-data/songs-data.service'
import type {
  ParseArtistDto,
  ParseSongsBySourceIdsDto,
  ZvukParserSearchDto,
  ZvukParseSitemapDto,
  ZvukStreamDto,
} from '../dto'
import type { ZvukSitemapEntity } from '../entities/zvuk-sitemaps.entity'
import type {
  IZvukArtistInfoResponse,
  IZvukGenre,
  IZvukGenreResponse,
  IZvukReleaseInfoResponse,
  IZvukTrackInfoResponse,
  TrackSearchResponse,
  ZvukPlaylistResponse,
  ZvukStreamResponse,
  ZvukTrackSearchResponse,
} from '../zvuk-parser.interfaces'
import type { ZvukSitemapType } from '../zvuk-parser.types'
import { ZvukParserUrls, ZvukSitemap, ZvukSitemapStatus, ZvukSitemapUrl } from '../zvuk-parser.types'
import { zvukApi } from '../zvuk-parser-axios'
import { ZvukSitemapService } from './zvuk-sitemap.service'

@Injectable()
export class ZvukParserService {
  constructor(
    private readonly songsDataService: SongsDataService,
    private readonly artistService: ArtistService,
    private readonly releaseService: ReleasesService,
    private readonly songService: SongsService,
    private readonly genresService: GenresService,
    private readonly sitemapService: ZvukSitemapService
  ) {}

  public async search(dto: ZvukParserSearchDto): Promise<TrackSearchResponse> {
    try {
      const { query } = dto
      const limit = dto?.limit || 10

      const { data } = await zvukApi.get<ZvukTrackSearchResponse>(ZvukParserUrls.SEARCH_URL, {
        params: { query, limit, include: 'artist track release' },
      })

      const tracksSourceIds = Object.keys(data.result.tracks).map(Number)
      const existSourceIds = await this.songService.checkExistSourceIds(tracksSourceIds)

      return {
        tracks: data.result.tracks,
        artists: data.result.artists,
        releases: data.result.releases,
        existTracks: existSourceIds,
      }
    } catch (e) {
      throw new InternalServerErrorException(JSON.stringify(e))
    }
  }

  public async getNewSongs(): Promise<TrackSearchResponse> {
    try {
      const { data } = await zvukApi.get<ZvukPlaylistResponse>(ZvukParserUrls.NEW_TRACKS, {
        params: { ids: 1124972, include: 'track,release,artist' },
      })

      const tracksSourceIds = Object.keys(data.result.tracks).map(Number)
      const existSourceIds = await this.songService.checkExistSourceIds(tracksSourceIds)

      return {
        tracks: data.result.tracks,
        artists: data.result.artists,
        releases: data.result.releases,
        existTracks: existSourceIds,
      }
    } catch (e) {
      throw new InternalServerErrorException(JSON.stringify(e))
    }
  }

  public async getPopularSongs(): Promise<TrackSearchResponse> {
    try {
      const { data } = await zvukApi.get(ZvukParserUrls.POPULAR_SONGS_URL, {
        params: { ids: 1062105, include: 'track,release,artist' },
      })

      const tracksSourceIds = Object.keys(data.result.tracks).map(Number)
      const existSourceIds = await this.songService.checkExistSourceIds(tracksSourceIds)

      return {
        tracks: data.result.tracks,
        artists: data.result.artists,
        releases: data.result.releases,
        existTracks: existSourceIds,
      }
    } catch (e) {
      throw new InternalServerErrorException(JSON.stringify(e))
    }
  }

  public async getGenres(): Promise<IZvukGenreResponse> {
    try {
      const { data } = await zvukApi.get<IZvukGenreResponse>(ZvukParserUrls.GENRES_URL)
      return data
    } catch (e) {
      throw new InternalServerErrorException(JSON.stringify(e))
    }
  }

  public async getSongsInfo(ids: string): Promise<IZvukTrackInfoResponse> {
    try {
      const { data } = await zvukApi.get<IZvukTrackInfoResponse>(ZvukParserUrls.SONGS_URL, {
        params: { tracks: ids, include: '(track (release label) artist)' },
      })
      return data
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  public async getArtistsInfo(ids: string): Promise<IZvukArtistInfoResponse> {
    try {
      const { data } = await zvukApi.get<IZvukArtistInfoResponse>(ZvukParserUrls.ARTISTS_URL, {
        params: { artists: ids, include: '(artist (release track))' },
      })
      return data
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  public async getReleasesInfo(ids: string): Promise<IZvukReleaseInfoResponse> {
    try {
      const { data } = await zvukApi.get<IZvukReleaseInfoResponse>(ZvukParserUrls.RELEASES_URL, {
        params: { releases: ids, include: '(release)' },
      })
      return data
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  public async parseSongs(limit = 10) {
    // const songsData = await this.songsDataService.findAll(limit, SongsDataStatus.STATUS_NEW)
    // const zvukIds = songsData.map((songId) => songId.zvukId)
    // const songsDataIds = songsData.map((item) => item.id)
    // try {
    //   await this.songsDataService.updateStatus(songsDataIds, SongsDataStatus.STATUS_PROCESS)
    //   await this.parseSongsBySourceIds(zvukIds)
    //   await this.songsDataService.updateStatus(songsDataIds, SongsDataStatus.STATUS_COMPLETED)
    //   return true
    // } catch {
    //   await this.songsDataService.updateStatus(songsDataIds, SongsDataStatus.STATUS_NEW)
    //   return false
    // }
  }

  public async parseSongsBySourceIds(dto: ParseSongsBySourceIdsDto) {
    const { sourceIds } = dto

    const { result } = await this.getSongsInfo(sourceIds.join(','))
    if (Object.keys(result.tracks).length === 0) {
      throw new NotFoundException('Empty result')
    }

    let artistSourceIds: number[] = Object.keys(result.tracks).reduce((acc: any[], trackId) => {
      const { artist_ids, release_id } = result.tracks[trackId]
      return [...acc, ...artist_ids, ...result.releases[release_id].artist_ids]
    }, [])
    artistSourceIds = [...new Set<number>(artistSourceIds)]

    const {
      result: { artists },
    } = await this.getArtistsInfo(artistSourceIds.join(','))

    await Promise.all(
      Object.keys(artists).map(async (artistId) => {
        const { description, id, image, title } = artists[artistId]
        return await this.artistService.create({
          slug: slug(title),
          sourceId: id,
          title,
          description,
          image: image.src,
        })
      })
    )

    let releaseSourceIds: number[] = Object.keys(result.tracks).reduce((acc: any[], trackId) => {
      return [...acc, result.tracks[trackId].release_id]
    }, [])
    releaseSourceIds = [...new Set<number>(releaseSourceIds)]

    const {
      result: { releases },
    } = await this.getReleasesInfo(releaseSourceIds.join(','))

    await Promise.all(
      Object.keys(releases).map(async (releaseId) => {
        const { artist_ids, genre_ids, image, title, template, credits, id } = releases[releaseId]
        return await this.releaseService.create({
          sourceId: id,
          title,
          slug: slug(title),
          template,
          credits,
          image: image.src,
          artistSourceIds: artist_ids,
          genresSourceIds: genre_ids,
        })
      })
    )

    const songsEntities = await Promise.all(
      Object.keys(result.tracks).map(async (trackId) => {
        const { id, title, template, release_id, artist_ids, duration, credits, image } = result.tracks[trackId]
        return await this.songService.create({
          sourceId: id,
          title,
          slug: slug(title),
          credits,
          duration,
          template,
          image: image.src,
          releaseId: release_id,
          artistIds: artist_ids,
          genreIds: releases[release_id].genre_ids,
        })
      })
    )

    return songsEntities
  }

  public async parseGenres() {
    const zvukGenres = await this.getGenres()

    const parentGenres = zvukGenres.result.genres.reduce((acc: GenreEntity[], genre: IZvukGenre) => {
      const { id, name } = genre
      const entity = this.genresService.create({ name, slug: slug(name), sourceId: id, parentSourceId: 0, parentId: 0 })
      return [...acc, entity]
    }, [])

    const subGenres = zvukGenres.result.genres.reduce((acc: GenreEntity[], parentGenre: IZvukGenre) => {
      if (parentGenre.sub) {
        const entities = parentGenre.sub.reduce((acc: GenreEntity[], genre: IZvukGenre) => {
          const { id, name, shortName } = genre
          const entity = this.genresService.create({
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

    await Promise.all(
      parentGenres.map(async (genre) => {
        await this.genresService.save(genre)
      })
    )

    const subGenresEntities = await Promise.all(
      subGenres.map(async (subGenre) => {
        const parentGenre = await this.genresService.findBySourceId(subGenre.parentSourceId)
        subGenre.parentId = parentGenre.id
        return subGenre
      })
    )

    await Promise.all(
      subGenresEntities.map(async (genre) => {
        await this.genresService.save(genre)
      })
    )
  }

  public async parseArtist(dto: ParseArtistDto): Promise<ArtistEntity> {
    const { artistId } = dto
    const { result } = await this.getArtistsInfo(String(artistId))

    if (!Object.keys(result.artists).includes(String(artistId))) {
      throw new NotFoundException('Исполнитель не найден')
    }

    const { title, id, description, image } = result.artists[artistId]

    const existArtists = await this.artistService.findBySourceIds([Number(id)])
    if (existArtists.length) {
      return existArtists[0]
    }

    return await this.artistService.create({
      slug: slug(title),
      sourceId: id,
      title,
      description,
      image: image.src,
    })
  }

  public async getStreamUrl(dto: ZvukStreamDto): Promise<string> {
    try {
      const { id } = dto
      const { data } = await zvukApi.get<ZvukStreamResponse>(ZvukParserUrls.STREAM_URL, {
        params: { id, quality: 'high' },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36',
          'Content-Type': 'application/json',
          referer: 'https://ya.ru',
        },
      })
      return data.result.stream
    } catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  public async parseSitemaps(dto: ZvukParseSitemapDto): Promise<ZvukSitemapEntity[]> {
    const { type } = dto
    try {
      const { data } = await axios.get(this.getSitemapUrl(type))
      const sitemapUrls = this.parseXml(data)
      return await Promise.all(
        sitemapUrls.map(
          async (url) => await this.sitemapService.create({ status: ZvukSitemapStatus.STATUS_NEW, type, url })
        )
      )
    } catch (e) {
      throw new InternalServerErrorException(e)
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

  private getSitemapUrl(type: ZvukSitemapType): string | null {
    switch (type) {
      case ZvukSitemap.TRACK: {
        return ZvukSitemapUrl.TRACKS
      }
      default:
        return ZvukSitemapUrl.TRACKS
    }
  }

  public async parseSongIds() {
    const sitemap = (
      await this.sitemapService.findAll({ limit: 1, search: { status: Number(ZvukSitemapStatus.STATUS_NEW) } })
    ).items[0]

    try {
      let songIds = []

      await this.sitemapService.update(sitemap.id, { status: Number(ZvukSitemapStatus.STATUS_PROCESS) })
      const { data } = await axios.get(sitemap.url)

      const xmlParser = new Parser()
      xmlParser.parseString(data, (_, result) => {
        const urls = result.urlset.url.reduce((acc: any, item: any) => [...acc, item.loc[0]], [])
        const ids: string[] = urls.reduce((acc: string[], item: string) => [...acc, item.split('/').pop()], [])
        const uniqueIds = Array.from(new Set(ids))
        songIds = [...uniqueIds]
      })

      await this.songsDataService.saveSongIds(songIds)
      await this.sitemapService.update(sitemap.id, { status: Number(ZvukSitemapStatus.STATUS_COMPLETED) })

      return sitemap
    } catch (e) {
      await this.sitemapService.update(sitemap.id, { status: Number(ZvukSitemapStatus.STATUS_NEW) })
      throw new InternalServerErrorException(e)
    }
  }
}
