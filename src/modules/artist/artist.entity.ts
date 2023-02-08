import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'

import { ReleaseEntity } from '../releases/release.entity'
import { SongEntity } from '../songs/song.entity'

@Entity('artist')
export class ArtistEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column()
  public title: string

  @Column()
  public slug: string

  @Column({ type: 'bigint', nullable: false })
  @Index({ unique: true })
  public sourceId: number

  @Column({ nullable: true, default: null })
  public image?: string

  @Column({ nullable: true })
  public description?: string

  @ManyToMany(() => ReleaseEntity, (release) => release.artists)
  @JoinTable()
  public releases: ReleaseEntity[]

  @ManyToMany(() => SongEntity, (song) => song.artists)
  //@JoinTable()
  public songs: SongEntity[]
}
