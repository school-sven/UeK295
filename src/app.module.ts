import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';

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
      type: 'mariadb',
      host: process.env.DB_SERVER || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'rootpwd',
      database: process.env.DB_DATABASE || 'api',
      autoLoadEntities: true,
      // todo: achtung nicht benutzen in der Produktion
      synchronize: true,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes();
  }
}
