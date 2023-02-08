import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common'

import type { ArtistEntity } from './artist.entity'
import { ArtistService } from './artist.service'
import { FindBySourceIdsArtistsDto, SearchArtistsDto } from './dto'

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get()
  public async findAll() {
    return await this.artistService.findAll()
  }

  @Get('search')
  @UsePipes(new ValidationPipe())
  public search(@Query() dto: SearchArtistsDto) {
    return this.artistService.search(dto)
  }

  @Get('by-source-ids')
  @UsePipes(new ValidationPipe())
  public async findBySourceIds(@Query('ids') dto: FindBySourceIdsArtistsDto) {
    const { ids } = dto
    return await this.artistService.findBySourceIds(ids.split(',').map((id) => Number(id)))
  }

  @Get('count')
  public async count(): Promise<number> {
    return await this.artistService.count()
  }

  @Get(':id')
  public async findOne(@Param('id') id: number): Promise<ArtistEntity> {
    return await this.artistService.findOne(id)
  }
}
