import { Controller, Delete, Get, Param, Query } from '@nestjs/common'

import { SearchSongsDataDto } from './dto/search-songs-data.dto'
import { SongsDataService } from './songs-data.service'

@Controller('songs-data')
export class SongsDataController {
  constructor(private readonly songsDataService: SongsDataService) {}

  @Get()
  public async findAll(@Query() dto: SearchSongsDataDto) {
    return await this.songsDataService.findAll(dto)
  }

  @Get('parse-songs-ids')
  public async getSongsIds(): Promise<void> {
    await this.songsDataService.parseSongsIds()
  }

  @Delete('delete-many')
  public async deleteMany(@Query('ids') ids: string) {
    return await this.songsDataService.deleteMany(ids)
  }

  @Delete('delete-all')
  public async deleteAll() {
    return await this.songsDataService.deleteAll()
  }

  @Delete(':id')
  public async delete(@Param('id') id: number) {
    return await this.songsDataService.delete(id)
  }
}
