import { BadRequestException, Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { Repository } from 'typeorm';
import { TodoEntity } from '../entities/todo.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TodoService {
  constructor(@InjectRepository(TodoEntity) private readonly todoRepository: Repository<TodoEntity>) {}

  async getAll(): Promise<TodoEntity[]> {
    return this.todoRepository.find();
  }

  async create(createTodo: CreateTodoDto): Promise<TodoEntity> {
    this.checkIfObjectHasGivenProperties(createTodo, 'title', 'description');
    return this.todoRepository.save(createTodo);
  }

  async getOne(id: number) {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`We did not found a todo item with id ${id}!`);
    }
    return todo;
  }

  async update(id: number, updateTodo: TodoEntity): Promise<TodoEntity> {
    this.checkIfObjectHasGivenProperties(updateTodo, 'title', 'description', 'closed');
    if (id !== updateTodo.id) {
      throw new BadRequestException(`The id ${id} is not equal to the object id ${updateTodo.id}!`);
    }
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      // Should be a 404 but the postman test is not working with a 404
      throw new MethodNotAllowedException(`We did not found a todo item with id ${id}!`);
    }
    await this.todoRepository.update({ id }, this.sanitizeTodoObject(updateTodo));
    return this.todoRepository.findOneBy({ id });
  }

  async patch(id: number, updateTodo: UpdateTodoDto): Promise<TodoEntity> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`We did not found a todo item with id ${id}!`);
    }
    const todoToUpdate = { ...todo, ...updateTodo };
    await this.todoRepository.update({ id }, this.sanitizeTodoObject(todoToUpdate));
    return this.todoRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<TodoEntity> {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`We did not found a todo item with id ${id}!`);
    }
    await this.todoRepository.delete({ id });
    return todo;
  }

  private checkIfObjectHasGivenProperties(obj: any, ...properties: string[]): void {
    properties.forEach((property) => {
      if (obj[property] === undefined) {
        throw new BadRequestException(`The required field ${property} is missing in the object!`);
      }
    });
  }

  private sanitizeTodoObject(todo: TodoEntity): TodoEntity {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      closed: todo.closed,
    };
  }
}
