import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from '../service/todo.service';
import { TodoEntity } from '../entities/todo.entity';
import { UserEntity } from '../../sample/generic.dtos/userDtoAndEntity';
import { ForbiddenException } from '@nestjs/common';

const todo: TodoEntity = {
  id: 1,
  title: 'My Todo',
  description: 'My Todo Description',
  closed: false,
};

const user: UserEntity = {
  userId: 1,
  username: 'user',
  password: '12345',
  roles: ['user'],
};
const adminUser: UserEntity = {
  userId: 2,
  username: 'admin',
  password: '12345',
  roles: ['user', 'admin'],
};

class TodoServiceMock {
  getAll() {
    return [];
  }

  getOne() {
    return todo;
  }

  create() {
    return todo;
  }

  update() {
    return todo;
  }

  patch() {
    return todo;
  }

  delete() {
    return todo;
  }
}

describe('TodoController', () => {
  let controller: TodoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useClass: TodoServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should getAll positive', async () => {
    expect(await controller.getAll()).toEqual([]);
  });

  it('should getOne positive', async () => {
    expect(await controller.getOne(todo.id)).toEqual(todo);
  });

  it('should create positive', async () => {
    expect(await controller.create(todo)).toEqual(todo);
  });

  it('should replace positive', async () => {
    expect(await controller.replace(todo.id, todo)).toEqual(todo);
  });

  it('should patch positive', async () => {
    expect(await controller.patch(todo.id, todo)).toEqual(todo);
  });

  it('should delete positive', async () => {
    expect(await controller.delete(adminUser, todo.id)).toEqual(todo);
  });

  it('should delete negative', async () => {
    await expect(controller.delete(user, todo.id)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
