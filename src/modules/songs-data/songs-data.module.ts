import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SongsDataController } from './songs-data.controller'
import SongsDataEntity from './songs-data.entity'
import { SongsDataService } from './songs-data.service'

@Module({
  imports: [TypeOrmModule.forFeature([SongsDataEntity])],
  controllers: [SongsDataController],
  providers: [SongsDataService],
  exports: [SongsDataService],
})
export default class SongsDataModule {}
