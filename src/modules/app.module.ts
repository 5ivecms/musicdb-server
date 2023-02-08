import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'

import { databaseConfig, serverConfig } from '../config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ArtistModule } from './artist/artist.module'
import { DatabaseModule } from './database/database.module'
import { GenresModule } from './genres/genres.module'
import { ReleasesModule } from './releases/releases.module'
import { SongsModule } from './songs/songs.module'
import SongsDataModule from './songs-data/songs-data.module'
import ZvukParserModule from './zvuk-parser/zvuk-parser.module'

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env.dev' : `.env.${ENV}`,
      load: [databaseConfig, serverConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number().default(5000),
      }),
    }),
    DatabaseModule,
    ZvukParserModule,
    SongsDataModule,
    ArtistModule,
    GenresModule,
    ReleasesModule,
    SongsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
