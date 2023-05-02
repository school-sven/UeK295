import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the todo',
    default: 'title',
    example: 'sample title',
  })
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The description of the todo',
    default: 'description',
    example: 'sample description',
  })
  description: string;
}
