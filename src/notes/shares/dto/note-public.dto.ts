import { Expose, Type } from 'class-transformer';

export class NotePublicDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;
}
