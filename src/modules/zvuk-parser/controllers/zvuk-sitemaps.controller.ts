import { Controller, Delete, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common'

import { ZvukSitemapsSearchDto } from '../dto'
import { ZvukSitemapService } from '../services'

@Controller('zvuk/sitemaps')
export class ZvukSitemapsController {
  constructor(private readonly sitemapService: ZvukSitemapService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  public async findAll(@Query() dto: ZvukSitemapsSearchDto) {
    return await this.sitemapService.findAll(dto)
  }

  @Get('info')
  public async info() {
    return await this.sitemapService.info()
  }

  @Get(':id')
  public async findOne(@Param('id') id: number) {
    return await this.sitemapService.findOne(id)
  }

  @Delete('delete-all')
  public async deleteAll() {
    return await this.sitemapService.deleteAll()
  }

  @Delete(':id')
  public async delete(@Param('id') id: number) {
    return await this.sitemapService.delete(id)
  }
}
