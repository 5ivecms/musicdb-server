import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common'

import { sleepAsync } from '../../../utils'
import {
  ParseArtistDto,
  ParseSongsBySourceIdsDto,
  ZvukParserSearchDto,
  ZvukParseSitemapDto,
  ZvukStreamDto,
} from '../dto'
import { ZvukParserService } from '../services/zvuk-parser.service'

@Controller('zvuk-parser')
export class ZvukParserController {
  constructor(private readonly zvukParserService: ZvukParserService) {}

  @Get('search')
  @UsePipes(new ValidationPipe())
  public async search(@Query() queries: ZvukParserSearchDto): Promise<any> {
    const { mode } = queries

    if (mode === 'query') {
      return await this.zvukParserService.search(queries)
    }

    if (mode === 'new') {
      return await this.zvukParserService.getNewSongs()
    }

    if (mode === 'popular') {
      return await this.zvukParserService.getPopularSongs()
    }
  }

  @Get('genres')
  public async genres(): Promise<any> {
    return await this.zvukParserService.getGenres()
  }

  @Get('new-songs')
  public async newSongs(): Promise<any> {
    return await this.zvukParserService.getNewSongs()
  }

  @Get('popular-songs')
  public async popularSongs(): Promise<any> {
    return await this.zvukParserService.getPopularSongs()
  }

  @Get('songs-info')
  public async songsInfo(@Query('ids') ids: string): Promise<any> {
    return await this.zvukParserService.getSongsInfo(ids)
  }

  @Get('artists-info')
  public async artistsInfo(@Query('ids') ids: string): Promise<any> {
    return await this.zvukParserService.getArtistsInfo(ids)
  }

  @Get('releases-info')
  public async releasesInfo(@Query('ids') ids: string) {
    return await this.zvukParserService.getReleasesInfo(ids)
  }

  @Get('parse-songs')
  public async parseSongs(@Query('limit') limit = 10) {
    for (const item of Array(10000)) {
      await this.zvukParserService.parseSongs(limit)
      await sleepAsync(5000)
    }
  }

  @Get('parse-genres')
  public parseGenres() {
    return this.zvukParserService.parseGenres()
  }

  @Post('parse-artist')
  @UsePipes(new ValidationPipe())
  public async parseArtist(@Body() dto: ParseArtistDto) {
    return this.zvukParserService.parseArtist(dto)
  }

  @UsePipes(new ValidationPipe())
  @Get('parse-sitemaps')
  public async parseSitemaps(@Query() dto: ZvukParseSitemapDto) {
    return await this.zvukParserService.parseSitemaps(dto)
  }

  @Get('parse-song-ids')
  public async parseSongIds() {
    return await this.zvukParserService.parseSongIds()
  }

  @UsePipes(new ValidationPipe())
  @Post('parse-songs-by-source-ids')
  public parseSongsBySourceIds(@Body() dto: ParseSongsBySourceIdsDto) {
    return this.zvukParserService.parseSongsBySourceIds(dto)
  }

  @UsePipes(new ValidationPipe())
  @Get('stream')
  public stream(@Query() dto: ZvukStreamDto) {
    return this.zvukParserService.getStreamUrl(dto)
  }
}
