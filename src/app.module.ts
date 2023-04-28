import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerMiddleware } from './sample/midleware/logger.middleware';
import { ArticleModule } from './sample/modules/article/article.module';
import { AuthModule } from './sample/modules/auth/auth.module';
import { RootModule } from './sample/modules/root/root.module';
import { ResetModule } from './sample/modules/reset/reset.module';

@Module({
  imports: [
    ArticleModule,
    AuthModule,
    RootModule,
    ResetModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: false,
      // todo: achtung nicht benutzen in der Produktion
      synchronize: true,
      entities: [],
      autoLoadEntities: true,
      logging: false,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes();
  }
}
