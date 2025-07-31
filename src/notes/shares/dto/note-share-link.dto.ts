import { ApiProperty } from '@nestjs/swagger';

export class NoteShareLinkDto {
  @ApiProperty({ example: '3f2d1a8b-dc12-4b9e-96ab-3b4fa68b6abc' })
  id: string;

  @ApiProperty({ example: 'a7f3c1b09dbe4fa8b2798d1c9c9eeb4d' })
  token: string;

  @ApiProperty({ example: '2025-08-01T10:00:00.000Z' })
  expiresAt: Date;

  @ApiProperty({ example: false })
  used: boolean;

  @ApiProperty({ example: '2025-07-31T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'https://your-domain.com/public/notes/<token>' })
  link: string;
}
