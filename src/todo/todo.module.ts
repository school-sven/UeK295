import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TodoService } from './service/todo.service';
import { TodoController } from './controller/todo.controller';
import { LoggerMiddleware } from '../sample/midleware/logger.middleware';
import { AuthController } from '../sample/modules/auth/auth.controller/auth.controller';
import { ProfileController } from '../sample/modules/auth/profile.controller/profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from './entities/todo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TodoEntity])],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(AuthController, ProfileController);
  }
}
