import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { ArtistEntity } from '../artist/artist.entity'
import { GenreEntity } from '../genres/genre.entity'
import { ReleaseEntity } from '../releases/release.entity'

@Entity('song')
export class SongEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  public id: number

  @Column({ type: 'bigint' })
  public sourceId: number

  @Column({ type: 'varchar' })
  public title: string

  @Column({ type: 'varchar' })
  public slug: string

  @Column({ type: 'varchar' })
  public credits: string

  @Column({ type: 'int' })
  public duration: number

  @Column({ type: 'varchar' })
  public template: string

  @Column({ type: 'bigint' })
  public releaseId: number

  @Column({ type: 'varchar' })
  public image: string

  @ManyToOne(() => ReleaseEntity)
  @JoinColumn()
  public release: ReleaseEntity

  @ManyToMany(() => GenreEntity)
  @JoinTable()
  public genres: GenreEntity[]

  @ManyToMany(() => ArtistEntity, (artist) => artist.songs)
  @JoinTable()
  public artists: ArtistEntity[]
}
