import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TestHttpClient } from './testing-tools/test-http-client';
import { DbFileTools } from './testing-tools/db-file.tools';
import { TodoDto } from '../src/todo/dto/todo.dto';
import { CreateTodoDto } from '../src/todo/dto/create-todo.dto';

dotenv.config();

describe('Todo (e2e)', () => {
  const tableName = 'todo';
  let app: INestApplication;
  let httpClient: TestHttpClient;

  // set environment and delete the file
  const dbName = DbFileTools.resetTestDatabase(tableName);
  if (!dbName) {
    console.warn(`could not delete database ${dbName}`);
  }
  process.env.DATABASE_NAME = dbName;
  // we override here the default log behaviour for the database, so we don't see sql messages
  process.env.DATABASE_LOG = 'false';

  // temp values
  let status = 0;
  let answer: unknown;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    // create nest app
    app = moduleFixture.createNestApplication();
    // init app
    await app.init();
    // init httpClient
    httpClient = new TestHttpClient(app, tableName);
    // prepare tokens
    await httpClient.createTokens();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  it(`${tableName}/ check all`, async () => {
    //get all empty array
    await httpClient.execGetArray(200, 0);

    // get one with not existing id -1
    status = 404;
    answer = {
      statusCode: status,
      message: `We did not found a ${httpClient.tableName} item with id -1!`,
      error: 'Not Found',
    };
    await httpClient.exeGetOne(status, -1, answer);

    // post new empty object
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field description is missing in the object!',
      error: 'Bad Request',
    };
    await httpClient.exePost(httpClient.userToken, status, {}).expect(answer);
    await httpClient.exePost(httpClient.adminToken, status, {}).expect(answer);

    // post new missing description
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field description is missing in the object!',
      error: 'Bad Request',
    };
    await httpClient.exePost(httpClient.userToken, status, { id: 1 }).expect(answer);
    await httpClient.exePost(httpClient.adminToken, status, { id: 1 }).expect(answer);

    // post new missing title
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field title is missing in the object!',
      error: 'Bad Request',
    };
    await httpClient.exePost(httpClient.userToken, status, { id: 1, description: 'test description' }).expect(answer);
    await httpClient.exePost(httpClient.adminToken, status, { id: 1, description: 'test description' }).expect(answer);

    // post new valid
    const todoReturnDto: TodoDto = {
      id: 1,
      title: 'title',
      description: 'sample content',
      closed: false,
    };
    const todoCreateDto1: CreateTodoDto = {
      description: todoReturnDto.description,
      title: todoReturnDto.title,
    };
    status = 201;
    await httpClient.exePost(httpClient.userToken, status, todoCreateDto1).expect((res) => {
      const body: TodoDto = res.body;
      expect(body.id).toBe(1);
      expect(body.title).toBe(todoReturnDto.title);
      expect(body.description).toBe(todoReturnDto.description);
    });

    const title2 = todoReturnDto.title + ' 2';
    const todoCreateDto2: CreateTodoDto = { ...todoCreateDto1, title: title2 };
    await httpClient.exePost(httpClient.userToken, status, todoCreateDto2).expect((res) => {
      const body: TodoDto = res.body;
      expect(body.id).toBe(2);
      expect(body.title).toBe(title2);
      expect(body.description).toBe(todoReturnDto.description);
    });

    //get all array 2
    await httpClient.execGetArray(200, 2);

    // put valid (id 1)
    status = 200;
    httpClient.execPut(httpClient.userToken, status, 1, { ...todoReturnDto, title: 'updated title' }).expect((res) => {
      const body: TodoDto = res.body;
      expect(body.id).toBe(1);
      expect(body.title).toBe('updated title');
      expect(body.description).toBe(todoReturnDto.description);
    });

    // put invalid ids (2)
    status = 400;
    answer = {
      statusCode: status,
      message:
        'You try to replace the id 1 with an object who has the id 2 this is now allowed as otherwise we can have multiple times the same id!',
      error: 'Bad Request',
    };
    httpClient.execPut(httpClient.userToken, status, 1, { ...todoReturnDto, id: 2 }).expect(answer);

    // put wrong id -1
    status = 400;
    answer = {
      statusCode: status,
      message:
        'You try to replace the id -1 with an object who has the id 1 this is now allowed as otherwise we can have multiple times the same id!',
      error: 'Bad Request',
    };
    httpClient.execPut(httpClient.userToken, status, -1, todoReturnDto).expect(answer);

    // put missing description
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field description is missing in the object!',
      error: 'Bad Request',
    };
    httpClient.execPut(httpClient.userToken, status, -1, { id: 1 }).expect(answer);

    // put missing title
    status = 400;
    answer = {
      statusCode: status,
      message: 'The required field title is missing in the object!',
      error: 'Bad Request',
    };
    httpClient.execPut(httpClient.userToken, status, -1, { id: 1, description: 'dummy' }).expect(answer);

    // Put valid  with more fields (id  1)
    status = 200;
    httpClient
      .execPut(httpClient.userToken, status, 1, {
        ...todoReturnDto,
        title: 'new sample title',
        additionalInformation: { info: 'some information', info2: 4 },
      })
      .expect((res) => {
        const body: TodoDto = res.body;
        expect(body.id).toBe(1);
        expect(body.title).toBe('new sample title');
        expect(body.description).toBe(todoReturnDto.description);
      });

    // Patch valid description (id 1)
    status = 200;
    await httpClient
      .execPatch(httpClient.userToken, status, 1, {
        description: 'patched content',
      })
      .expect((res) => {
        const body: TodoDto = res.body;
        expect(body.id).toBe(1);
        expect(body.title).toBe('title');
        expect(body.description).toBe('patched content');
      });

    // delete not allowed
    status = 403;
    answer = {
      statusCode: status,
      message: 'You have to be member of the role admin to call this method!',
      error: 'Forbidden',
    };
    await httpClient.execDel(httpClient.userToken, status, -1).expect(answer);

    // delete not existing (id-1)
    status = 404;
    answer = {
      statusCode: status,
      message: 'We did not found a todo item with id -1!',
      error: 'Not Found',
    };
    await httpClient.execDel(httpClient.adminToken, status, -1).expect(answer);

    // Delete existing (id 1)
    status = 200;
    await httpClient.execDel(httpClient.adminToken, status, 1).expect((res) => {
      const body: TodoDto = res.body;
      expect(body.id).toBe(1);
      expect(body.title).toBe('title');
      expect(body.description).toBe('patched content');
    });

    // get alle, should have 1 element
    await httpClient.execGetArray(200, 1);

    // Delete existing (id 2)
    status = 200;
    await httpClient.execDel(httpClient.adminToken, status, 2).expect((res) => {
      const body: TodoDto = res.body;
      expect(body.id).toBe(2);
      expect(body.title).toBe('title 2');
      expect(body.description).toBe('sample content');
    });

    // Get all (empty Array)
    await httpClient.execGetArray(200, 0);
  });
});
