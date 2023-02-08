import { Module } from '@nestjs/common'
import { GenresService } from './genres.service'
import { GenresController } from './genres.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GenreEntity } from './genre.entity'
import ZvukParserModule from '../zvuk-parser/zvuk-parser.module'

@Module({
  imports: [TypeOrmModule.forFeature([GenreEntity])],
  providers: [GenresService],
  controllers: [GenresController],
  exports: [GenresService],
})
export class GenresModule {}
