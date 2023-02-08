import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ArtistModule } from '../artist/artist.module'
import { GenresModule } from '../genres/genres.module'
import { ReleasesModule } from '../releases/releases.module'
import { SongEntity } from './song.entity'
import { SongsController } from './songs.controller'
import { SongsService } from './songs.service'

@Module({
  imports: [TypeOrmModule.forFeature([SongEntity]), ArtistModule, GenresModule, ReleasesModule],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService],
})
export class SongsModule {}
