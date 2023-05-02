import { ApiProperty } from '@nestjs/swagger';

export class TodoDto {
  @ApiProperty({
    description: 'The unique id of the todo',
    minimum: 1,
    default: 1,
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The title of the todo',
    default: 'title',
    example: 'sample title',
  })
  title: string;

  @ApiProperty({
    description: 'The description of the todo',
    default: 'description',
    example: 'sample description',
  })
  description: string;

  @ApiProperty({
    description: 'The task is closed',
    default: false,
    example: false,
  })
  closed: boolean;
}
