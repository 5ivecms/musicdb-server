import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

import { SongsDataStatus } from './songs-data.interfaces'

@Entity('songs_data')
class SongsDataEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: false })
  @Index({ unique: true })
  public zvukId: number

  @Column({ default: SongsDataStatus.STATUS_NEW })
  @Index()
  public status: number
}

export default SongsDataEntity
