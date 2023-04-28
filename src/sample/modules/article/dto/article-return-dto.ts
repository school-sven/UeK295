import { ApiProperty } from '@nestjs/swagger';
import { ArticleEntity } from '../entities/article.entity';

export class ArticleReturnDto {
  @ApiProperty({
    description: 'The unique id of the todo',
    minimum: 1,
    default: 1,
    example: 1,
  })
  id: number;
  @ApiProperty({
    description: 'The name of the article',
    default: 'mein Artikel',
    example: 'Beispiel Artikel',
  })
  name: string;
  @ApiProperty({
    description: 'Datum wann der Artikel erzeugt wurde',
  })
  created: Date;
  @ApiProperty({
    description: 'Datum wann der Artikel verändert wurde',
  })
  updated: Date;
  static ConvertEntityToDto(entity: ArticleEntity): ArticleReturnDto {
    return entity as ArticleReturnDto;
  }
}
