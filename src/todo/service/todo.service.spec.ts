import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { MockType, RepositoryMockFactory } from '../../sample/mocktypes/mocktype';
import { Repository } from 'typeorm';
import { TodoEntity } from '../entities/todo.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoDto } from '../dto/create-todo.dto';

const todo: TodoEntity = {
  id: 1,
  title: 'My Todo',
  description: 'My Todo Description',
  closed: false,
};

describe('TodoService', () => {
  let service: TodoService;
  let repositoryMock: MockType<Repository<TodoEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService, { provide: getRepositoryToken(TodoEntity), useFactory: RepositoryMockFactory }],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repositoryMock = module.get(getRepositoryToken(TodoEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should getAll positive', async () => {
    const todos: TodoEntity[] = [todo];
    repositoryMock.find.mockReturnValue(todos);

    expect(await service.getAll()).toEqual(todos);
    expect(repositoryMock.find).toHaveBeenCalled();
  });

  it('should getAll negative', async () => {
    repositoryMock.find.mockImplementation(() => {
      throw new InternalServerErrorException();
    });

    await expect(service.getAll()).rejects.toThrowError(InternalServerErrorException);
  });

  it('should getOne positive', async () => {
    repositoryMock.findOneBy.mockReturnValue(todo);

    expect(await service.getOne(todo.id)).toEqual(todo);
    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ id: todo.id });
  });

  it('should getOne negative', async () => {
    repositoryMock.findOneBy.mockReturnValue(null);

    await expect(service.getOne(todo.id)).rejects.toThrowError(NotFoundException);
  });

  it('should create positive', async () => {
    const createTodoDto: CreateTodoDto = {
      title: 'New Todo',
      description: 'New Todo Description',
    };
    repositoryMock.insert.mockReturnValue({ identifiers: [1] });
    repositoryMock.findOneBy.mockReturnValue(todo);

    expect(await service.create(createTodoDto)).toEqual(todo);
    expect(repositoryMock.insert).toHaveBeenCalledWith(createTodoDto);
  });

  it('should create negative', async () => {
    const invalidCreateTodoDto: Partial<CreateTodoDto> = {
      title: 'New Todo',
    };

    await expect(service.create({ ...(invalidCreateTodoDto as unknown as CreateTodoDto) })).rejects.toThrowError(
      BadRequestException,
    );
  });

  it('should update positive', async () => {
    repositoryMock.findOneBy.mockReturnValue(todo);
    repositoryMock.insert.mockReturnValue(todo);

    expect(await service.update(todo.id, todo)).toEqual(todo);
  });

  it('should update negative with two different ids', async () => {
    await expect(service.update(2, todo)).rejects.toThrowError(BadRequestException);
  });

  it('should update negative with non existing id', async () => {
    repositoryMock.findOneBy.mockReturnValue(null);

    await expect(service.update(todo.id, todo)).rejects.toThrowError(MethodNotAllowedException);
  });

  it('should patch positive', async () => {
    repositoryMock.findOneBy.mockReturnValue(todo);
    repositoryMock.insert.mockReturnValue(todo);

    expect(await service.patch(todo.id, todo)).toEqual(todo);
  });

  it('should patch negative with two different ids', async () => {
    await expect(service.patch(2, todo)).rejects.toThrowError(MethodNotAllowedException);
  });

  it('should patch negative with non existing id', async () => {
    repositoryMock.findOneBy.mockReturnValue(null);

    await expect(service.patch(todo.id, todo)).rejects.toThrowError(MethodNotAllowedException);
  });

  it('should delete positive', async () => {
    repositoryMock.findOneBy.mockReturnValue(todo);
    repositoryMock.delete.mockReturnValue(todo);

    expect(await service.delete(todo.id)).toEqual(todo);
  });

  it('should delete negative', async () => {
    repositoryMock.findOneBy.mockReturnValue(null);

    await expect(service.delete(todo.id)).rejects.toThrowError(NotFoundException);
  });
});
