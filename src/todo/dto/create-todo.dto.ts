import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
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
}
