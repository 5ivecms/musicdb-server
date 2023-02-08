import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common'

import { SearchReleasesDto } from './dto'
import { ReleasesService } from './releases.service'

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get()
  public async findAll() {
    return await this.releasesService.findAll()
  }

  @Get('search')
  @UsePipes(new ValidationPipe())
  public search(@Query() dto: SearchReleasesDto) {
    return this.releasesService.search(dto)
  }
}
