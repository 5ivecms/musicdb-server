import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'

import { ArtistEntity } from '../artist/artist.entity'
import { GenreEntity } from '../genres/genre.entity'

@Entity('releases')
export class ReleaseEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ type: 'bigint', nullable: false })
  public sourceId: number

  @Column({ nullable: false })
  public title: string

  @Column()
  public slug: string

  @Column({ nullable: true })
  public template: string

  @Column({ nullable: true })
  public credits: string

  @Column()
  public image: string

  @ManyToMany(() => GenreEntity)
  @JoinTable()
  public genres: GenreEntity[]

  @ManyToMany(() => ArtistEntity, (artist) => artist.releases)
  public artists: ArtistEntity[]
}
