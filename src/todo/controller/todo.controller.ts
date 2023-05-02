import {
  Body,
  Controller,
  Delete,
  Get,
  MethodNotAllowedException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from '../service/todo.service';
import { CreateTodoDto } from '../dto/create-todo.dto';
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
import { CurrentUser } from '../../sample/decorators/current-user/current-user.decorator';
import { UserEntity } from '../../sample/generic.dtos/userDtoAndEntity';
import { Constants } from '../constants/constants';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { JwtAuthGuard } from '../../sample/modules/auth/guards/jwt-auth.guard';

@Controller('todo')
@ApiTags('Todo Methods')
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'The record has been found.',
    type: TodoDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Not logged in!',
    type: ErrorUnauthorizedDto,
  })
  async getAll(): Promise<TodoDto[]> {
    const todos = await this.todoService.getAll();
    return todos.map((item) => TodoDto.ConvertEntityToDto(item));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
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
  async create(@Body() createTodo: CreateTodoDto): Promise<TodoDto> {
    const todo = await this.todoService.create(createTodo);
    return TodoDto.ConvertEntityToDto(todo);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<TodoDto> {
    const todo = await this.todoService.getOne(id);
    return TodoDto.ConvertEntityToDto(todo);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'The record has been successfully replaced.',
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
  async replace(@Param('id', ParseIntPipe) id: number, @Body() updateTodo: TodoDto): Promise<TodoDto> {
    const todo = await this.todoService.update(id, updateTodo);
    return TodoDto.ConvertEntityToDto(todo);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
  async patch(@Param('id', ParseIntPipe) id: number, @Body() updateTodo: UpdateTodoDto): Promise<TodoDto> {
    const todo = await this.todoService.patch(id, updateTodo);
    return TodoDto.ConvertEntityToDto(todo);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
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
    description: 'Not allowed to delete this record.',
    type: ErrorDto,
  })
  async delete(@CurrentUser() user: UserEntity, @Param('id', ParseIntPipe) id: number): Promise<TodoDto> {
    if (!user.roles.some((role) => role === Constants.DELETE_ACCESS_ROLE)) {
      throw new MethodNotAllowedException("You don't have the right to delete this record.");
    }
    const todo = await this.todoService.delete(id);
    return TodoDto.ConvertEntityToDto(todo);
  }
}
