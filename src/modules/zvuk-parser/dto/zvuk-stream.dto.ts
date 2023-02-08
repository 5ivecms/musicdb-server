import { IsNumberString } from 'class-validator'

export class ZvukStreamDto {
  @IsNumberString()
  public readonly id: number
}
