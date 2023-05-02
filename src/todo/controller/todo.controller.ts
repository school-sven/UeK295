import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TodoService } from '../service/todo.service';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TodoDto } from '../dto/todo.dto';
import { ErrorUnauthorizedDto } from '../../sample/generic.dtos/error.unauthorized.dto';
import { ErrorDto } from '../../sample/generic.dtos/error.dto';

@Controller('todo')
@ApiTags('Todo Methods')
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOkResponse({
    description: 'The record has been found.',
    type: TodoDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Not logged in!',
    type: ErrorUnauthorizedDto,
  })
  getAll() {
    return this.todoService.getAll();
  }

  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: TodoDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Not logged in!',
    type: ErrorUnauthorizedDto,
  })
  @ApiMethodNotAllowedResponse({
    description: `You don't have the right to access this record.`,
    type: ErrorDto,
  })
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'The record has been found.',
    type: TodoDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Not logged in!',
    type: ErrorUnauthorizedDto,
  })
  @ApiNotFoundResponse({
    description: 'The record has not been found.',
    type: ErrorDto,
  })
  getOne(@Param('id') id: string) {
    return this.todoService.getOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'The record has been successfully updated.',
    type: TodoDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Not logged in!',
    type: ErrorUnauthorizedDto,
  })
  @ApiNotFoundResponse({
    description: 'The record has not been found.',
    type: ErrorDto,
  })
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(+id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'The record has been successfully deleted.',
    type: TodoDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Not logged in!',
    type: ErrorUnauthorizedDto,
  })
  @ApiNotFoundResponse({
    description: 'The record has not been found.',
    type: ErrorDto,
  })
  @ApiMethodNotAllowedResponse({
    description: '',
    type: ErrorDto,
  })
  delete(@Param('id') id: string) {
    return this.todoService.delete(+id);
  }
}
