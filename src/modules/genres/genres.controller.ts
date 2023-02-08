import { Body, Controller, Delete, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { CreateManyGenresDto, FindBySourceIdsGenreDto } from './dto'
import { SearchGenreDto } from './dto/search-genre.dto'
import { GenresService } from './genres.service'

@Controller('genres')
export class GenresController {
  constructor(private readonly genreService: GenresService) {}

  @Get('by-source-ids')
  @UsePipes(new ValidationPipe())
  public async findBySourceIds(@Query() dto: FindBySourceIdsGenreDto) {
    const { ids } = dto
    return await this.genreService.findBySourceIds(ids.split(',').map((id) => Number(id)))
  }

  @Get()
  public async findAll(@Query() dto: SearchGenreDto) {
    return await this.genreService.findAll(dto)
  }

  @Delete('delete-many')
  public async deleteMany(@Query('ids') ids: string) {
    return await this.genreService.deleteMany(ids)
  }

  @Get(':id')
  public async findOne(@Param('id') id: number) {
    return await this.genreService.findOne(id)
  }

  @Delete(':id')
  public async delete(@Param('id') id: number) {
    return await this.genreService.delete(id)
  }

  @Post('create-many')
  public async createMany(@Body() dto: CreateManyGenresDto[]) {
    return await this.genreService.createMany(dto)
  }
}
