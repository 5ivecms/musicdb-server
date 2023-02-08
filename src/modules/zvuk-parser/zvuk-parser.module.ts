import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ArtistModule } from '../artist/artist.module'
import { GenresModule } from '../genres/genres.module'
import { ReleasesModule } from '../releases/releases.module'
import { SongsModule } from '../songs/songs.module'
import SongsDataModule from '../songs-data/songs-data.module'
import { ZvukParserController, ZvukSitemapsController } from './controllers'
import { ZvukSitemapEntity } from './entities'
import { ZvukParserService, ZvukSitemapService } from './services'

@Module({
  imports: [
    TypeOrmModule.forFeature([ZvukSitemapEntity]),
    SongsDataModule,
    ArtistModule,
    GenresModule,
    ReleasesModule,
    SongsModule,
  ],
  controllers: [ZvukParserController, ZvukSitemapsController],
  providers: [ZvukParserService, ZvukSitemapService],
  exports: [ZvukParserService, ZvukSitemapService],
})
export default class ZvukParserModule {}
