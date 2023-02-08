import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ArtistModule } from '../artist/artist.module'
import { GenresModule } from '../genres/genres.module'
import { ReleaseEntity } from './release.entity'
import { ReleasesController } from './releases.controller'
import { ReleasesService } from './releases.service'

@Module({
  imports: [TypeOrmModule.forFeature([ReleaseEntity]), GenresModule, ArtistModule],
  controllers: [ReleasesController],
  providers: [ReleasesService],
  exports: [ReleasesService],
})
export class ReleasesModule {}
