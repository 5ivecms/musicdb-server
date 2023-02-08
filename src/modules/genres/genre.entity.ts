import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('genres')
export class GenreEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column()
  public parentId: number

  @Column()
  public name: string

  @Column()
  public slug: string

  @Column({ default: '' })
  public shortName?: string

  @Column({ type: 'bigint', default: 0 })
  public sourceId: number

  @Column({ type: 'bigint', default: 0 })
  public parentSourceId: number
}
