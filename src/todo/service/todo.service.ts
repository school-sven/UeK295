import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';

@Injectable()
export class TodoService {
  getAll() {
    return `This action returns all todo`;
  }

  create(createTodoDto: CreateTodoDto) {
    return 'This action adds a new todo';
  }

  getOne(id: number) {
    return `This action returns a #${id} todo`;
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    return `This action updates a #${id} todo`;
  }

  patch(id: number, updateTodoDto: UpdateTodoDto) {
    return `This action patches a #${id} todo`;
  }

  delete(id: number) {
    return `This action deletes a #${id} todo`;
  }
}
