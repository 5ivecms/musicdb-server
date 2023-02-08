import { Controller, Get, Param, Query } from '@nestjs/common'

import { SearchSongsDto } from './dto'
import { SongsService } from './songs.service'

@Controller('songs')
export class SongsController {
  constructor(private readonly songService: SongsService) {}

  @Get()
  public async findAll() {
    return await this.songService.findAll()
  }

  @Get('search')
  public search(@Query() dto: SearchSongsDto) {
    return this.songService.search(dto)
  }

  @Get(':id')
  public findOne(@Param('id') id: number) {
    return this.songService.findOne(+id)
  }
}
