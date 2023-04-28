import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'article',
})
export class ArticleEntity {
  @PrimaryGeneratedColumn({
    primaryKeyConstraintName: 'pk-article',
  })
  id: number;
  @Column()
  name: string;
  @CreateDateColumn({ type: 'timestamp' })
  created: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updated: Date;
}
