import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

import { ZvukSitemapStatus } from '../zvuk-parser.types'

@Entity('zvuk_sitemaps')
export class ZvukSitemapEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: false })
  @Index({ unique: true })
  public url: string

  @Column({ nullable: false })
  @Index()
  public type: string

  @Column({ default: ZvukSitemapStatus.STATUS_NEW })
  @Index()
  public status: number
}
